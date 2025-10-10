import mongoose from "mongoose"

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactPersonName: {
        type: String,
        required: true
    },
    contactPhoneNumber: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const Vendor = mongoose.model("Vendor", vendorSchema)