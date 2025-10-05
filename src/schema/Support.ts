import mongoose, { Schema } from "mongoose"
import { SupportPriority, SupportStatus } from "../enums/SupportEnum.js"

export const SupportSchema = new Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: Object.values(SupportStatus), default: SupportStatus.OPEN },
    priority: { type: String, enum: Object.values(SupportPriority), default: SupportPriority.LOW }
}, { timestamps: true })

export const Support = mongoose.model("Support", SupportSchema);