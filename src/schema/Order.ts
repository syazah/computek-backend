import mongoose from "mongoose";
import { OrderStatus, PaymentType } from "../enums/OrderEnum.js";
import { required } from "zod/mini";

const orderDetailsSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    pageSize: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    paperConfig: {
        type: String,
        required: true,
    },
    printingSide: {
        type: String,
        required: true,
    },
    foldingType: {
        type: String,
        required: true,
    },
    laminationType: {
        type: String,
        required: true,
    },
    uvType: {
        type: String,
        required: true
    },
    foilType: {
        type: String,
        required: true
    },
    dieType: {
        type: String,
        required: true
    },
    textureType: {
        type: String,
        required: true
    },
    additionalNote: {
        type: String,
        required: true
    }
})

const billingDetailsSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    proof: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        enum: PaymentType,
    },
    transactionId: {
        type: String,
        required: true,
    }
})

const orderSchema = new mongoose.Schema({
    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    raisedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    currentStatus: {
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING,
        required: true,
    },
    orderDetails: {
        type: orderDetailsSchema,
        required: true,
    },
    billingDetails: {
        type: billingDetailsSchema,
        required: false,
    }
}, { timestamps: true });


export const Order = mongoose.model("Order", orderSchema);