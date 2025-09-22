import * as z from "zod"

export const UserSchema = z.object({
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
}).strict()



export type UserInput = z.infer<typeof UserSchema>