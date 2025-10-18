import mongoose from "mongoose";

const AutomationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    orders: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Order",
    },
    automationData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
},
    { timestamps: true }
);

const ManualAutomationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    orders: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Order",
    },
    automationFile: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const Automation = mongoose.model("Automation", AutomationSchema);
export const ManualAutomation = mongoose.model("ManualAutomation", ManualAutomationSchema);