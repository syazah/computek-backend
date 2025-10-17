import * as z from "zod";
import { OrderStatus, PaymentType, PrintingSide } from "../enums/OrderEnum.js";

// Zod schema for orderDetails
export const orderDetailsValidationSchema = z.object({
    productName: z.string("Product type is required"),
    paperConfig: z.string("Paper configuration is required"),
    width: z.number("Product width is required"),
    height: z.number("Product height is required"),
    quantity: z.number("Quantity is required"),
    printingSide: z.enum(PrintingSide).default(PrintingSide.SINGLE),
    foldingType: z.string("Folding type is required").optional(),
    laminationType: z.string("Lamination type is required").optional(),
    uvType: z.string("UV type is required").optional(),
    foilType: z.string("Foil type is required").optional(),
    dieType: z.string("Die type is required").optional(),
    textureType: z.string("Texture type is required").optional(),
    additionalNote: z.string("Additional note is required").optional(),
    fileUrl: z.url("Invalid URL format").optional(),
    quality: z.number("Image quality is required"),
});

export type IOrderDetails = z.infer<typeof orderDetailsValidationSchema>;

// Zod schema for billingDetails
export const billingDetailsValidationSchema = z.object({
    amount: z.number("Amount is required"),
    paymentType: z.enum(PaymentType),
    transactionId: z.string("Transaction ID is required"),
    proof: z.url("Invalid URL format"),
});

export type IBillingDetails = z.infer<typeof billingDetailsValidationSchema>;

// Zod schema for order
export const orderValidationSchema = z.object({
    raisedTo: z.string("Raised to is required").optional(),
    currentStatus: z.enum(OrderStatus).default(OrderStatus.PENDING),
    orderDetails: orderDetailsValidationSchema,
    billingDetails: billingDetailsValidationSchema.optional(),
});

export type IOrder = z.infer<typeof orderValidationSchema>;

// Partial update schema for orders (nested partials)
export const orderUpdateValidationSchema = z.object({
    raisedTo: z.string().optional(),
    currentStatus: z.enum(OrderStatus).optional(),
    orderDetails: orderDetailsValidationSchema.partial().optional(),
    billingDetails: billingDetailsValidationSchema.partial().optional(),
});

export type IOrderUpdate = z.infer<typeof orderUpdateValidationSchema>;
