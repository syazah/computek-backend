import * as z from "zod"
import { UserEnum } from "../enums/UserEnum.js"

export const AuthSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 chars").trim(),
    password: z.string().min(8, "Password must be at least 8 chars"),
}).strict()

export const SignupSchema = z.object({
    name: z.string().min(1, "Name is required").trim(),
    username: z.string().min(3, "Username must be at least 3 chars").trim(),
    password: z.string().min(8, "Password must be at least 8 chars"),
    companyName: z.string().trim().optional(),
    primaryContactNo: z.string().regex(/^\d{10,15}$/, "Must be 10-15 digits"),
    secondaryContactNo: z.string().regex(/^\d{10,15}$/, "Must be 10-15 digits"),
    email: z.string().email(),
    state: z.string().min(1).trim(),
    district: z.string().min(1).trim(),
    city: z.string().min(1).trim(),
    postalCode: z.string().min(3).max(12).trim(),
    address: z.string().min(1).trim(),
    gstNo: z.string().regex(/^[0-9A-Z]{15}$/, "Invalid GST number").optional(),
    dob: z.coerce.date().optional(),
    preferredCourier: z.string().min(1).trim().optional(),
}).strict()

export type AuthInput = z.infer<typeof AuthSchema>
export type SignupInput = z.infer<typeof SignupSchema>