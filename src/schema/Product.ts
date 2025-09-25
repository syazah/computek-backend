import mongoose from "mongoose";
import { Applicability, CostItemEnum } from "../enums/ProductEnum.js";


const pageSizeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    associatedCost: { type: Number, required: true },
    applicability: { type: String, enum: Applicability }
});

const paperConfigSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    gsm: { type: Number, required: true },
    associatedCost: { type: Number, required: true },
    applicability: { type: String, enum: Applicability }
});

const costItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: CostItemEnum, required: true },
    value: { type: String, required: true },
    applicability: { type: String, enum: Applicability, required: true },
    associatedCost: { type: Number, required: true }
})

const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    availableSizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PageSize' }],
    availablePapers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaperConfig' }],
    costItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CostItem' }],
})

export const PaperConfig = mongoose.model("PaperConfig", paperConfigSchema);
export const PageSize = mongoose.model("PageSize", pageSizeSchema);
export const CostItem = mongoose.model("CostItem", costItemSchema);
export const Product = mongoose.model("Product", ProductSchema);