import mongoose from "mongoose";
import { OrderStatus, PaymentType, PrintingSide } from "../enums/OrderEnum.js";
import { required } from "zod/mini";

const orderDetailsSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
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
        enum: Object.values(PrintingSide),
        default: PrintingSide.SINGLE,
        required: true,
    },
    foldingType: {
        type: String,
    },
    laminationType: {
        type: String,
    },
    uvType: {
        type: String,
    },
    foilType: {
        type: String,
    },
    dieType: {
        type: String,
    },
    textureType: {
        type: String,
    },
    additionalNote: {
        type: String,
    },
    quality: {
        type: Number,
    },
    fileUrl: {
        type: String,
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