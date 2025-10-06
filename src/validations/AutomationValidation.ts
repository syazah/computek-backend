import * as z from "zod"
import { AutomationType } from "../enums/AutomationEnum.js";

export const AutomationValidation = z.object({
    orderIds: z.array(z.string()),
    sheetId: z.string(),
    bleed: z.number().optional(),
    rotationsAllowed: z.boolean(),
    type: z.enum(AutomationType).default(AutomationType.BOTTOM_LEFT_FILL),
    name: z.string().optional(),
    description: z.string().optional(),
    margins: z.object({
        top: z.number().min(0).default(0),
        bottom: z.number().min(0).default(0),
        left: z.number().min(0).default(0),
        right: z.number().min(0).default(0),
    }).optional().default({ top: 0, bottom: 0, left: 0, right: 0 })
})

//2 - order 11/13 12/14

export type AutomationRequest = z.infer<typeof AutomationValidation>;