import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { OrderDB } from "../db/order.js"
import { OrderStatus } from "../enums/OrderEnum.js"
import { successResponse } from "../services/responses/successResponse.js"

const orderDB = OrderDB.getInstance()
export const getAllAnalyticsController = async (req: any, res: any) => {
    try {
        //order analytics
        const orders = await orderDB.getAllOrders();
        let orderNumbersWithStatus: {
            active: number,
            pending: number,
            automated: number,
            completed: number,
            cancelled: number
        } = {
            active: 0,
            pending: 0,
            automated: 0,
            completed: 0,
            cancelled: 0
        }
        type OrderStatusKey = keyof typeof orderNumbersWithStatus;
        orders.forEach(order => {
            Object.entries(orderNumbersWithStatus).forEach(([key, value]) => {
                const k = key as OrderStatusKey;
                if (key.toUpperCase() === order.currentStatus.toString()) {
                    orderNumbersWithStatus[k] = value + 1;
                }
            });
        });

        //staff analytics

        //payment analytics

        return res.status(HttpStatus.OK).json(successResponse(
            {
                orderNumbersWithStatus
            }, "Analytics fetched successfully"
        ))
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR, `Something went wrong while getting analytics, ${error}`
        )
    }
}