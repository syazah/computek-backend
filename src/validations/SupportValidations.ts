import * as z from "zod";
import { SupportPriority, SupportStatus } from "../enums/SupportEnum.js";

export const createSupportSchema = z.object({
    subject: z.string().min(3).max(100),
    // Renamed 'message' to 'description' to align with Mongoose SupportSchema
    description: z.string().min(10).max(1000),
    priority: z.enum(SupportPriority).optional().default(SupportPriority.LOW),
    status: z.enum(SupportStatus).optional().default(SupportStatus.OPEN),
    assignedTo: z.string().optional(),
});

export interface CreateSupportInput extends z.TypeOf<typeof createSupportSchema> { }