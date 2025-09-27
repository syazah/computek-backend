import * as z from "zod"
import { Applicability, CostItemEnum } from "../enums/ProductEnum.js";

// Zod schema for page sizes
export const pageSizeValidationSchema = z.object({
    id: z.string("Page ID is required"),
    name: z.string("Page name is required").toUpperCase(),
    width: z.number("Width is required"), // in mm
    height: z.number("Height is required"), // in mm
    applicability: z.enum(Applicability),
    associatedCost: z.number("Associated Cost is required")
});

export type IPageSize = z.infer<typeof pageSizeValidationSchema>;


export const paperConfigValidationSchema = z.object({
    id: z.string("Paper ID is required"),
    type: z.string("Paper type is required").toUpperCase(),
    gsm: z.number("GSM is required"),
    applicability: z.enum(Applicability),
    associatedCost: z.number("Associated Cost is Required")
});

export type IPaperConfig = z.infer<typeof paperConfigValidationSchema>;


export const costItemValidationSchema = z.object({
    id: z.string("Cost item ID is required"),
    type: z.enum(CostItemEnum),
    value: z.string("Cost item value is required"),
    applicability: z.enum(Applicability),
    associatedCost: z.number("Associated cost is required")
});

export type ICostItem = z.infer<typeof costItemValidationSchema>;

export const SheetValidationSchema = z.object({
    name: z.string("Sheet name is required").toUpperCase(),
    width: z.number("Width is required"),
    height: z.number("Height is required"),
});

export type ISheet = z.infer<typeof SheetValidationSchema>;

const objectIdSchema = z.string().refine((val) => {
    return /^[0-9a-fA-F]{24}$/.test(val);
}, {
    message: "Invalid ObjectId format"
});
export const ProductValidationSchema = z.object({
    id: z.string("Product ID is required"),
    name: z.string("Product name is required"),
    description: z.string("Product description is required"),
    availableSizes: z.array(objectIdSchema).nonempty("At least one size must be selected"), // Array of PageSize ObjectIds
    availablePapers: z.array(objectIdSchema).nonempty("At least one paper type must be selected"), // Array of PaperConfig ObjectIds
    costItems: z.array(objectIdSchema).optional() // Array of CostItem ObjectIds
});

export type IProduct = z.infer<typeof ProductValidationSchema>;
