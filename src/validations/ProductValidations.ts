import * as z from "zod"
import { Applicability } from "../enums/ProductEnum.js";

// Zod schema for page sizes
export const pageSizeValidationSchema = z.object({
    id: z.string("Page ID is required"),
    name: z.string("Page name is required"),
    width: z.number("Width is required"), // in mm
    height: z.number("Height is required"), // in mm
    applicability: z.enum(Applicability),
    associatedCost: z.number("Associated Cost is required")
});

export type IPageSize = z.infer<typeof pageSizeValidationSchema>;


export const paperConfigValidationSchema = z.object({
    id: z.string("Paper ID is required"),
    type: z.string("Paper type is required"),
    gsm: z.number("GSM is required"),
    applicability: z.enum(Applicability),
    baseCostPerGram: z.number("Base cost per gram is required"),
    associatedCost: z.number("Associated Cost is Required")
});

export type IPaperConfig = z.infer<typeof paperConfigValidationSchema>;


export const costItemValidationSchema = z.object({
    id: z.string("Cost item ID is required"),
    type: z.enum(['flat', 'per-unit', 'formula']),
    value: z.number("Cost item value is required"),
    applicability: z.enum(Applicability),
    associatedCost: z.number("Associated cost is required")
});

export type ICostItem = z.infer<typeof costItemValidationSchema>;

export const ProductValidationSchema = z.object({
    id: z.string("Product ID is required"),
    name: z.string("Product name is required"),
    description: z.string("Product description is required"),
    availableSizes: z.array(z.string()).nonempty("At least one size must be selected"), // Array of PageSize IDs
    availablePapers: z.array(z.string()).nonempty("At least one paper type must be selected"), // Array of PaperConfig IDs
    costItems: z.array(z.string()).optional() // Array of CostItem IDs
});

export type IProduct = z.infer<typeof ProductValidationSchema>;
