import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { AutomationValidation, ManualAutomationValidation } from "../validations/AutomationValidation.js";
import { AutomationType } from "../enums/AutomationEnum.js";
import { OrderDB } from "../db/order.js";
import type { LayoutItem } from "../validations/LayoutValidations.js";
import { ProductDB } from "../db/product.js";
import { Sheet } from "../schema/Product.js";
import { LayoutOptimizer } from "../services/automation/LayoutOptimizer.js";
import { successResponse } from "../services/responses/successResponse.js";
import { OrderStatus } from "../enums/OrderEnum.js";
import { AutomationDB } from "../db/automation.js";
import { AWSHelper } from "../services/aws/client.js";

const orderDB = OrderDB.getInstance();
const automationDB = AutomationDB.getInstance();
const productDB = ProductDB.getInstance();
const layoutOptimizer = LayoutOptimizer.getInstance();
const awsHelper = AWSHelper.getInstance();
export const startAutomation = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = AutomationValidation.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid request data: ${validation.error.message}`);
        }
        const { orderIds, sheetId, bleed, margins, type } = validation.data;

        //Get Sheet Details
        const sheet = await productDB.getById(Sheet, sheetId);
        if (!sheet) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Sheet with ID ${sheetId} not found.`);
        }
        //Get All Orders
        const orders: LayoutItem[] = [];
        const orderForResponse: { orderId: string, fileUrl: string }[] = [];
        for (const orderId of orderIds) {
            const order = await orderDB.getOrderById(orderId);
            if (!order) {
                throw new HttpException(HttpStatus.NOT_FOUND, `Order with ID ${orderId} not found.`);
            }
            const invalidOrders = order.currentStatus !== OrderStatus.ACTIVE
            if (invalidOrders) {
                throw new HttpException(
                    HttpStatus.BAD_REQUEST,
                    `Order with ID ${orderId} is not active and cannot be processed.`
                );
            }
            orderForResponse.push({ orderId: order.id, fileUrl: order.orderDetails.fileUrl || "" });
            orders.push({
                orderId: order.id,
                width: order.orderDetails.width,
                height: order.orderDetails.height,
                quantity: 1,
                canRotate: validation.data.rotationsAllowed
            });
            await orderDB.updateOrder(order.id, { currentStatus: OrderStatus.AUTOMATED });
        }
        // Helpers for efficiency and fit (bleed used only for placement, not efficiency)
        const workingWidth = sheet.width - margins.left - margins.right;
        const workingHeight = sheet.height - margins.top - margins.bottom;
        const canFitOnBlankSheet = (item: LayoutItem) => {
            const b = bleed ?? 0;
            // footprint includes bleed for fit test
            const fits0 = item.width + 2 * b <= workingWidth && item.height + 2 * b <= workingHeight;
            const fits90 = item.canRotate && (item.height + 2 * b <= workingWidth && item.width + 2 * b <= workingHeight);
            return fits0 || fits90;
        };
        // Efficiency excludes bleed: use original item width/height rather than any bleed-inflated dimensions
        const sumArea = (placed: any[]) => placed.reduce((s, p) => s + (p.width * p.height), 0);

        // Build remaining quantities map
        const remaining = new Map<string, LayoutItem>();
        for (const it of orders) {
            remaining.set(it.orderId, { ...it });
        }

        // Unplaceable upfront (too large for sheet even when empty)
        const unplaced: { orderId: string; quantity: number; reason: string; width: number; height: number; }[] = [];
        for (const [id, it] of [...remaining.entries()]) {
            if (!canFitOnBlankSheet(it)) {
                unplaced.push({ orderId: id, quantity: it.quantity, reason: 'Item too large for sheet', width: it.width, height: it.height });
                remaining.delete(id);
            }
        }

        // Multi-sheet loop: repeatedly invoke the chosen algorithm until all remaining quantity is placed or no progress
        const sheets: Array<{ index: number; sheetDetails: { sheetWidth: number; sheetHeight: number }; placedItems: any[]; efficiency: number; unusedArea: number; }>
            = [];

        const callSingleSheet = (items: LayoutItem[]) => {
            switch (type) {
                case AutomationType.SHELF:
                    return layoutOptimizer.optimizeLayoutWithShelfAlgorithm(items, sheet.width, sheet.height, bleed, margins);
                case AutomationType.MAX_RECTS:
                    return layoutOptimizer.optimizeLayoutWithMaxRectsAlgorithm(items, sheet.width, sheet.height, bleed, margins);
                case AutomationType.GANG:
                    return layoutOptimizer.optimizeLayoutForGangJobs(items, sheet.width, sheet.height, { bleedSize: bleed ?? 0, margins, strategy: 'bottomLeft' });
                case AutomationType.BOTTOM_LEFT_FILL:
                default:
                    return layoutOptimizer.optimizeLayoutWithBottomLeftFillAlgorithm(items, sheet.width, sheet.height, bleed, margins);
            }
        };

        const totalWorkingArea = workingWidth * workingHeight;
        let loopGuard = 0;
        while ([...remaining.values()].reduce((acc, it) => acc + it.quantity, 0) > 0) {
            loopGuard++;
            if (loopGuard > 1000) break; // hard guard

            // Build current items array from remaining quantities
            const current: LayoutItem[] = [...remaining.values()].filter(it => it.quantity > 0);
            if (current.length === 0) break;

            const single = callSingleSheet(current);
            const placed = (single?.placedItems ?? []) as any[];

            if (placed.length === 0) {
                // No progress possible; mark all remaining as unplaced and stop
                for (const it of current) {
                    unplaced.push({ orderId: it.orderId, quantity: it.quantity, reason: 'No fit on sheet with remaining items', width: it.width, height: it.height });
                }
                break;
            }

            // Decrement remaining quantities by occurrences in placed
            const counts = new Map<string, number>();
            for (const p of placed) {
                counts.set(p.orderId, (counts.get(p.orderId) ?? 0) + 1);
            }
            for (const [id, c] of counts) {
                const it = remaining.get(id);
                if (it) {
                    it.quantity = Math.max(0, it.quantity - c);
                    remaining.set(id, it);
                }
            }

            // Compute efficiency excluding bleed
            const usedArea = sumArea(placed);
            const efficiency = totalWorkingArea > 0 ? (usedArea / totalWorkingArea) * 100 : 0;

            sheets.push({
                index: sheets.length + 1,
                sheetDetails: { sheetWidth: sheet.width, sheetHeight: sheet.height },
                placedItems: placed,
                efficiency,
                unusedArea: Math.max(0, totalWorkingArea - usedArea)
            });
        }

        // Aggregate overall
        const overallUsed = sheets.reduce((s, sh) => s + sumArea(sh.placedItems), 0);
        const overallArea = sheets.length * totalWorkingArea;
        const overallEfficiency = overallArea > 0 ? (overallUsed / overallArea) * 100 : 0;
        const overallUnused = sheets.reduce((s, sh) => s + sh.unusedArea, 0);

        const optimizedLayout = {
            // Backward-compatible fields (first sheet if exists)
            sheetDetails: { sheetWidth: sheet.width, sheetHeight: sheet.height },
            placedItems: sheets[0]?.placedItems ?? [],
            efficiency: overallEfficiency,
            unusedArea: overallUnused,
            // New multi-sheet fields
            sheetCount: sheets.length,
            sheets,
            unplaced
        };
        await automationDB.createAutomation({
            name: validation.data.name || "Unnamed Automation",
            description: validation.data.description || "",
            orders: orderIds,
            automationData: {
                orderForResponse,
                optimizedLayout,
                type
            }
        })
        return res.status(HttpStatus.OK).json(successResponse({ orderForResponse, optimizedLayout, type }, "Automation process completed successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while starting the automation process. ${error}`)
    }
}

export const getAllAutomations = async (req: any, res: any) => {
    try {
        // Placeholder for fetching all automation processes
        const automations = await automationDB.getAllAutomations();
        return res.status(HttpStatus.OK).json(successResponse(automations, "Fetched all automation processes successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while fetching automation processes. ${error}`)
    }
}

export const getAutomationById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const automation = await automationDB.getAutomationById(id);
        if (!automation) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Automation with id ${id} not found`);
        }
        return res.status(HttpStatus.OK).json(successResponse(automation, "Fetched automation successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while fetching automation. ${error}`);
    }
}

export const deleteAutomationById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new HttpException(
                HttpStatus.EXPECTATION_FAILED,
                "Automation id not provided"
            )
        }
        automationDB.deleteAutomation(id)
        return res.status(HttpStatus.OK).json(successResponse({ id }, "Deleted Successfully"))
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while deleting the automation")
    }
}


//MANUAL AUTOMATION START
export const uploadManualAutomationFile = async (req: any, res: any) => {
    try {
        const user = req.user;
        const file = req.file;
        if (!file) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "No file uploaded");
        }
        // Double-check 1MB limit server-side
        const MAX_BYTES = 1 * 1024 * 1024;
        if (file.size && file.size > MAX_BYTES) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "File too large. Max 1MB allowed.");
        }

        const bucketName = `manual-automation-computek-aws`
        const fileName = `manual-automation-${user.username}-${Date.now()}-${file.originalname}`;
        const fileUrl = await awsHelper.uploadFile(
            fileName,
            file.buffer,
            file.mimetype,
            bucketName
        );

        if (!fileUrl) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `File upload failed`);
        }
        return res.status(HttpStatus.OK).json(successResponse({ filePath: fileUrl }, "File uploaded successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            "Something went wrong while uploading manual automation file")
    }
}
export const addManualAutomation = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validate = ManualAutomationValidation.safeParse(body);
        if (!validate.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid manual automation data");
        }
        // Create the manual automation entry
        const manualAutomation = await automationDB.createManualAutomation({
            ...validate.data,
            // Optionally track who created it if schema supports (ignored otherwise)
            // createdBy: req.user?.id,
        } as any);

        // Mark included orders as MANUALLY_AUTOMATED
        const orderIds: string[] = validate.data.orders || [];
        for (const oid of orderIds) {
            try { await orderDB.updateOrder(oid, { currentStatus: OrderStatus.MANUALLY_AUTOMATED }); } catch { /* ignore per-order failure */ }
        }

        return res.status(HttpStatus.CREATED).json(successResponse(manualAutomation, "Manual automation created successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            "Something went wrong while adding manual automation")
    }
}
export const getAllManualAutomations = async (req: any, res: any) => {
    try {
        const manualAutomations = await automationDB.getAllManualAutomations();
        return res.status(HttpStatus.OK).json(successResponse(manualAutomations, "Fetched all manual automations successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while fetching manual automations. ${error}`)
    }
}

export const getManualAutomationById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const manualAutomation = await automationDB.getManualAutomationById(id);
        if (!manualAutomation) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Manual Automation with id ${id} not found`);
        }
        return res.status(HttpStatus.OK).json(successResponse(manualAutomation, "Fetched manual automation successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while fetching manual automation. ${error}`);
    }
}

export const deleteManualAutomationById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new HttpException(
                HttpStatus.EXPECTATION_FAILED,
                "Manual Automation id not provided"
            )
        }
        automationDB.deleteManualAutomation(id)
        return res.status(HttpStatus.OK).json(successResponse({ id }, "Deleted Successfully"))
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while deleting the manual automation")
    }
}