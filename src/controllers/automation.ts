import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { AutomationValidation } from "../validations/AutomationValidation.js";
import { AutomationType } from "../enums/AutomationEnum.js";
import { OrderDB } from "../db/order.js";
import type { LayoutItem } from "../validations/LayoutValidations.js";
import { ProductDB } from "../db/product.js";
import { Sheet } from "../schema/Product.js";
import { LayoutOptimizer } from "../services/automation/LayoutOptimizer.js";
import { successResponse } from "../services/responses/successResponse.js";
import { OrderStatus } from "../enums/OrderEnum.js";
import { AutomationDB } from "../db/automation.js";

const orderDB = OrderDB.getInstance();
const automationDB = AutomationDB.getInstance();
const productDB = ProductDB.getInstance();
const layoutOptimizer = LayoutOptimizer.getInstance();

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
                quantity: order.orderDetails.quantity,
                canRotate: validation.data.rotationsAllowed
            });
            await orderDB.updateOrder(order.id, { currentStatus: OrderStatus.AUTOMATED });
        }
        // Select algorithm
        let optimizedLayout: any;
        switch (type) {
            case AutomationType.SHELF:
                optimizedLayout = layoutOptimizer.optimizeLayoutWithShelfAlgorithm(
                    orders,
                    sheet.width,
                    sheet.height,
                    bleed,
                    margins
                );
                break;
            case AutomationType.MAX_RECTS:
                optimizedLayout = layoutOptimizer.optimizeLayoutWithMaxRectsAlgorithm(
                    orders,
                    sheet.width,
                    sheet.height,
                    bleed,
                    margins
                );
                break;
            case AutomationType.GANG:
                optimizedLayout = layoutOptimizer.optimizeLayoutForGangJobs(
                    orders,
                    sheet.width,
                    sheet.height,
                    {
                        bleedSize: bleed ?? 0,
                        margins,
                        strategy: 'bottomLeft'
                    }
                );
                break;
            case AutomationType.BOTTOM_LEFT_FILL:
            default:
                optimizedLayout = layoutOptimizer.optimizeLayoutWithBottomLeftFillAlgorithm(
                    orders,
                    sheet.width,
                    sheet.height,
                    bleed,
                    margins
                );
        }
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