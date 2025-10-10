import * as z from "zod"

export const VendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required"),
    contactPersonName: z.string().min(1, "Contact person name is required"),
    contactPhoneNumber: z.string().min(1, "Contact phone number is required"),
    gstNumber: z.string().min(1, "GST number is required")
})

export type VendorType = z.infer<typeof VendorSchema>