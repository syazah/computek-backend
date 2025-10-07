import mongoose from "mongoose";

const DownloadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
}, { timestamps: true });

export const Download = mongoose.model("Download", DownloadSchema);