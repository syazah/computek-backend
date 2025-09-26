import { HttpStatus } from "http-status-ts";
import { HttpException } from "../services/responses/HttpException.js";
import fs from "fs"
import { orderDetailsValidationSchema, orderValidationSchema, type IOrderDetails } from "../validations/OrderValidations.js";
import { OrderDB } from "../db/order.js";
import { successResponse } from "../services/responses/successResponse.js";
import { AWSHelper } from "../services/aws/client.js";
import mongoose from "mongoose";

const orderDB = OrderDB.getInstance();
const awsHelper = AWSHelper.getInstance();

export const createOrder = async (req: any, res: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const file = req.file;
        const user = req.user;
        const body = req.body;

        // 1️⃣ Validate
        const validate = orderValidationSchema.safeParse(body);
        if (!validate.success) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Validation failed: ${validate.error.message}`
            );
        }
        if (!file) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `File is required`);
        }

        // 2️⃣ Create order (inside transaction)
        const addedData = await orderDB.addOrder(validate.data, { session });
        if (!addedData) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Order not created, something went wrong in the database"
            );
        }

        // 3️⃣ Upload to S3 (outside DB transaction, but inside try/catch)
        const fileName = `${user.username}-${Date.now()}-${file.originalname}`;
        const fileUrl = await awsHelper.uploadFile(
            fileName,
            file.buffer,
            file.mimetype,
            "orders-computek-aws"
        );

        if (!fileUrl) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `File upload failed`);
        }

        // 4️⃣ Update order with file URL (inside transaction)
        const updatedData = await orderDB.updateOrder(
            addedData._id.toString(),
            { raisedBy: user.id, fileUrl: fileUrl },
            { session }
        );
        if (!updatedData) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Order not updated with file URL"
            );
        }

        // ✅ Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(HttpStatus.CREATED).json(
            successResponse(
                {
                    id: addedData._id,
                    currentStatus: addedData.currentStatus,
                    fileUrl: fileUrl,
                },
                "Order created successfully"
            )
        );
    } catch (error) {
        // ❌ Rollback DB changes
        await session.abortTransaction();
        session.endSession();
        try {
            await awsHelper.deleteFile(
                `${req.user.username}-${Date.now()}-${req.file.originalname}`,
                "orders-computek-aws"
            );
        } catch (cleanupError) {
            console.error("Failed to cleanup S3 file:", cleanupError);
        }

        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Order creation failed: ${error}`
        );
    }
};

export const getOrderById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const order = await orderDB.getOrderById(id);
        if (!order) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                "Order not found",
            )
        }
        return res.status(HttpStatus.OK).json(successResponse(order, "Order fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Fetching order failed: ${error}`,
        )
    }
}

export const getOrderByIdAndUser = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const order = await orderDB.getOrderById(id);
        const user = req.user;
        if (!order) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                "Order not found",
            )
        }
        if (user.id !== order.raisedBy && user.userType !== "admin") {
            throw new HttpException(
                HttpStatus.FORBIDDEN,
                "You do not have permission to access this order",
            )
        }
        return res.status(HttpStatus.OK).json(successResponse(order, "Order fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Fetching order failed: ${error}`,
        )
    }
}

export const getAllOrders = async (req: any, res: any) => {
    try {
        const orders = await orderDB.getAllOrders();
        return res.status(HttpStatus.OK).json(successResponse(orders, "Orders fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Fetching orders failed: ${error}`,
        )
    }
}