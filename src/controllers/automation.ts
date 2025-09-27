import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { AutomationValidation } from "../validations/AutomationValidation.js";
import { OrderDB } from "../db/order.js";
import type { LayoutItem } from "../validations/LayoutValidations.js";
import { ProductDB } from "../db/product.js";
import { Sheet } from "../schema/Product.js";
import { LayoutOptimizer } from "../services/automation/LayoutOptimizer.js";
import { successResponse } from "../services/responses/successResponse.js";
import { OrderStatus } from "../enums/OrderEnum.js";

const orderDB = OrderDB.getInstance();
const productDB = ProductDB.getInstance();
const layoutOptimizer = LayoutOptimizer.getInstance();

export const startAutomation = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = AutomationValidation.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid request data: ${validation.error.message}`);
        }
        const { orderIds, sheetId, bleed, margins } = validation.data;

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
        }
        //Optimize Layout
        const optimizedLayout = layoutOptimizer.optimizeLayoutWithBottomLeftFillAlgorithm(
            orders,
            sheet.width,
            sheet.height,
            bleed,
            margins
        );

        return res.status(HttpStatus.OK).json(successResponse({ orderForResponse, optimizedLayout }, "Automation process completed successfully."));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while starting the automation process. ${error}`)
    }
}