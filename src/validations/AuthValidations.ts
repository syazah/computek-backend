import * as z from "zod"
import { UserEnum } from "../enums/UserEnum.js"

export const AuthSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 chars").trim(),
    password: z.string().min(8, "Password must be at least 8 chars"),
}).strict()

export type AuthInput = z.infer<typeof AuthSchema>