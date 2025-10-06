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
    let addedData: any = null; // Declare at function scope
    try {
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
        const orderData = {
            ...validate.data,
            currentStatus: OrderStatus.PENDING,
            raisedBy: user.id,
        }
        // 2️⃣ Create order (inside transaction)
        addedData = await orderDB.addOrder(orderData);
        if (!addedData) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Order not created, something went wrong in the database"
            );
        }
        return res.status(HttpStatus.CREATED).json(
            successResponse(
                {
                    id: addedData._id,
                    currentStatus: addedData.currentStatus,
                },
                "Order created successfully"
            )
        );
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Order creation failed: ${error}`
        );
    }
};

export const uploadOrderFile = async (req: any, res: any) => {
    let fileName: string | null = null; // Track filename for cleanup
    let bucketName: string | null = null; // Track bucket name for cleanup
    try {
        const file = req.file;
        const user = req.user;
        if (!file) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `File is required`);
        }

        const imageValidationData: IImageValidations = await imageManager.getImageDimensions(
            file.buffer
        );
        if (imageValidationData.metadata.format !== "jpeg" && imageValidationData.metadata.format !== "png" && imageValidationData.metadata.format !== "jpg") {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Only JPEG and PNG formats are allowed. Uploaded format: ${imageValidationData.metadata.format}`);
        }
        bucketName = `orders-computek-aws`
        console.log("uploading")
        fileName = `${user.username}-${Date.now()}-${file.originalname}`;
        const fileUrl = await awsHelper.uploadFile(
            fileName,
            file.buffer,
            file.mimetype,
            bucketName
        );

        if (!fileUrl) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `File upload failed`);
        }
        return res.status(HttpStatus.OK).json(successResponse({ fileUrl, imageValidationData }, "File uploaded successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `File upload failed: ${error}`,
        )
    }
}

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
        const updatedOrder = await orderDB.updateOrder(id, { billingDetails: validate.data, currentStatus: OrderStatus.ACTIVE });

        if (!updatedOrder) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Order not updated with billing info"
            );
        }
        return res.status(HttpStatus.OK).json(successResponse(updatedOrder, "Billing info added successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Adding billing info failed: ${error}`,
        )
    }
}

export const uploadBillingProof = async (req: any, res: any) => {
    try {
        let bucketName = `orders-computek-aws`
        let fileName = `${req.user.username}-${Date.now()}-billingInfo`;
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
        return res.status(HttpStatus.OK).json(successResponse({ fileUrl }, "File uploaded successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `File upload failed: ${error}`,
        )
    }
}

/**
 * Assign an order to a staff member (admin only)
 * Body: { raisedTo: userId, status?: OrderStatus }
 */
export const assignOrder = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { raisedTo, status } = req.body;
        if (!raisedTo) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                "raisedTo (staff user id) is required"
            );
        }
        // Basic status validation if provided
        if (status && !Object.values(OrderStatus).includes(status)) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Invalid status value: ${status}`
            );
        }
        const order = await orderDB.getOrderById(id);
        if (!order) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                "Order not found"
            );
        }
        const updateData: any = { raisedTo };
        if (status) updateData.currentStatus = status;
        const updated = await orderDB.updateOrder(id, updateData);
        return res.status(HttpStatus.OK).json(successResponse(updated, "Order assigned successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Assigning order failed: ${error}`,
        );
    }
}

export const updateOrderController = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const validate = orderValidationSchema.partial().safeParse(body);
        if (!validate.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Validation failed: ${validate.error.message}`);
        }
        const order = await orderDB.getOrderById(id);
        if (!order) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Order not found for _id ${id}`);
        }
        const updatedOrder = await orderDB.updateOrder(id, validate.data as Partial<IOrderDetails>);
        if (!updatedOrder) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Order not updated");
        }
        return res.status(HttpStatus.OK).json(successResponse(updatedOrder, "Order updated successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while updating the order. ${error}`)
    }
}