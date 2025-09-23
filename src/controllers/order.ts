import { HttpStatus } from "http-status-ts";
import { HttpException } from "../services/ErrorHandling/HttpException.js";
import fs from "fs"
import { orderDetailsValidationSchema, type IOrderDetails } from "../validations/OrderValidations.js";

export const calculateCost = (req: any, res: any) => {
    try {
        const body: IOrderDetails = req.body;
        const validation = orderDetailsValidationSchema.safeParse(body);
        
        if (!validation.success) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Validation failed: ${validation.error.message}`,
            )
        }

    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Cost calculation failed: ${error}`,
        )
    }
}


export const createOrder = (req: any, res: any) => {
    try {
        const file = req.file;
        const body = req.body;
        if (!file) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `File is required`
            );
        }
        return res.status(HttpStatus.CREATED).json({
            message: "Order created successfully",
            data: {
                file: file,
                body: body
            }
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Order creation failed: ${error}`,
        )
    }
}