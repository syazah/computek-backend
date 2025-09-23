import * as z from "zod";
import { OrderStatus, PaymentType } from "../enums/OrderEnum.js";

// Zod schema for orderDetails
export const orderDetailsValidationSchema = z.object({
    productType: z.string("Product type is required"),
    productSize: z.string("Product size is required"),
    quantity: z.number("Quantity is required"),
    paperType: z.string("Paper type is required"),
    printingSide: z.string("Printing side is required"),
    foldingType: z.string("Folding type is required"),
    laminationType: z.string("Lamination type is required"),
    uvType: z.string("UV type is required"),
    foilType: z.string("Foil type is required"),
    dieType: z.string("Die type is required"),
    textureType: z.string("Texture type is required"),
    additionalNote: z.string("Additional note is required"),
});

export type IOrderDetails = z.infer<typeof orderDetailsValidationSchema>;

// Zod schema for billingDetails
export const billingDetailsValidationSchema = z.object({
    amount: z.number("Amount is required"),
    proof: z.string("Proof is required"),
    paymentType: z.nativeEnum(PaymentType),
    transactionId: z.string("Transaction ID is required"),
});

export type IBillingDetails = z.infer<typeof billingDetailsValidationSchema>;

// Zod schema for order
export const orderValidationSchema = z.object({
    raisedBy: z.string("Raised by is required"), // Assuming ObjectId is represented as a string
    raisedTo: z.string("Raised to is required"), // Assuming ObjectId is represented as a string
    currentStatus: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
    orderDetails: orderDetailsValidationSchema,
    billingDetails: billingDetailsValidationSchema.optional(),
});

export type IOrder = z.infer<typeof orderValidationSchema>;

export interface PageSize {
    name: string;
    width: number; // in mm
    height: number; // in mm
}



export interface CostBreakdown {
    baseCost: number;
    customCosts: Record<string, number>;
    totalCost: number;
    breakdown: Array<{
        name: string;
        amount: number;
        calculation: string;
    }>;
}

