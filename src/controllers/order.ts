import { HttpStatus } from "http-status-ts";
import { HttpException } from "../services/responses/HttpException.js";
import fs from "fs"
import { billingDetailsValidationSchema, orderDetailsValidationSchema, orderValidationSchema, type IOrderDetails } from "../validations/OrderValidations.js";
import { OrderDB } from "../db/order.js";
import { successResponse } from "../services/responses/successResponse.js";
import { AWSHelper } from "../services/aws/client.js";
import mongoose from "mongoose";
import { ImageManager } from "../services/image/client.js";
import type { IImageValidations } from "../validations/ImageServiceValidations.js";
import { OrderStatus } from "../enums/OrderEnum.js";

const orderDB = OrderDB.getInstance();
const awsHelper = AWSHelper.getInstance();
const imageManager = ImageManager.getInstance();

/**
 * Create a new order
 * 1. Validate request body and file
 *  1.1 Validate image dimensions and format
 *  1.2 Validate order details
 * 2. Create order in DB (inside transaction)
 * 3. Upload file to S3 (outside transaction)
 * 4. Update order with file URL (inside transaction)
 * 5. Commit transaction
 * On any failure, rollback DB changes and delete uploaded file from S3
 */
export const createOrder = async (req: any, res: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let addedData: any = null; // Declare at function scope
    let fileName: string | null = null; // Track filename for cleanup
    let bucketName: string | null = null; // Track bucket name for cleanup

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

        const imageValidationData: IImageValidations = await imageManager.validateImageDimensions(
            file.buffer,
            (validate.data.orderDetails as IOrderDetails).width,
            (validate.data.orderDetails as IOrderDetails).height,
        )
        if (imageValidationData.isValid === false) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Image dimensions are invalid. Expected: ${imageValidationData.expectedDimensions.width}x${imageValidationData.expectedDimensions.height}, Actual: ${imageValidationData.actualDimensions.width}x${imageValidationData.actualDimensions.height}`);
        }
        if (imageValidationData.metadata.format !== "jpeg" && imageValidationData.metadata.format !== "png" && imageValidationData.metadata.format !== "jpg") {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Only JPEG and PNG formats are allowed. Uploaded format: ${imageValidationData.metadata.format}`);
        }
        const orderData = {
            ...validate.data,
            orderDetails: {
                ...validate.data.orderDetails,
                quality: imageValidationData.metadata.density
            },
            currentStatus: OrderStatus.PENDING,
        }
        // 2️⃣ Create order (inside transaction)
        addedData = await orderDB.addOrder(orderData, { session });
        if (!addedData) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Order not created, something went wrong in the database"
            );
        }

        // 3️⃣ Upload to S3 (outside DB transaction, but inside try/catch)
        bucketName = `orders-computek-aws/${user.username}/${addedData._id}`
        fileName = `${Date.now()}-${file.originalname}`;
        const fileUrl = await awsHelper.uploadFile(
            fileName,
            file.buffer,
            file.mimetype,
            bucketName
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
        await session.abortTransaction();
        session.endSession();
        if (fileName && bucketName) {
            try {
                await awsHelper.deleteFile(fileName, bucketName);
            } catch (cleanupError) {
                console.error("Failed to cleanup S3 file:", cleanupError);
            }
        }

        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Order creation failed: ${error}`
        );
    }
};

/**
 * Get order by ID
 * 1. Fetch order from DB
 * 2. If not found, throw 404
 * 3. Return order
 */
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

/**
 * Get order by ID for the logged in user
 * 1. Fetch order from DB
 * 2. If not found, throw 404
 * 3. If order.raisedBy !== req.user.id and req.user.userType !== 'admin', throw 403
 * 4. Return order
 */
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

/**
 * Get all orders
 * 1. Fetch all orders from DB
 * 2. Return orders
 */
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

/**
 * add billing info to order
 * 1. Validate request body
 * 2. Fetch order from DB
 * 3. If not found, throw 404
 * 4. Update order with billing info and set status to ACTIVE
 * 5. Return updated order
 */
export const addBillingInfoToOrder = async (req: any, res: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let bucketName = `orders-computek-aws/${req.user.username}/${req.params.id}`
    let fileName = `${Date.now()}-billingInfo`;
    try {
        const id = req.params.id;
        const order = await orderDB.getOrderById(id)
        if (!order) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `Order not found for _id ${id}`,
            )
        }
        const validate = billingDetailsValidationSchema.safeParse(req.body);
        if (!validate.success) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Validation failed: ${validate.error.message}`
            );
        }
        const file = req.file;
        if (!file) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `File is required`);
        }
        const fileUrl = await awsHelper.uploadFile(
            fileName,
            file.buffer,
            file.mimetype,
            bucketName
        )
        if (!fileUrl) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `File upload failed`);
        }
        const updatedData = { ...validate.data, proof: fileUrl };
        const updatedOrder = await orderDB.updateOrder(id, { billingDetails: updatedData, currentStatus: OrderStatus.ACTIVE }, { session });

        if (!updatedOrder) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Order not updated with billing info"
            );
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(HttpStatus.OK).json(successResponse(updatedOrder, "Billing info added successfully"));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (fileName && bucketName) {
            try {
                await awsHelper.deleteFile(fileName, bucketName);
            } catch (cleanupError) {
                console.error("Failed to cleanup S3 file:", cleanupError);
            }
        }
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Adding billing info failed: ${error}`,
        )
    }
}