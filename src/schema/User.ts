import { ObjectId } from "mongodb";
import mongoose, { mongo, Schema } from "mongoose";
import { UserEnum } from "../enums/UserEnum.js";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: Object.values(UserEnum),
        required: true,
        default: UserEnum.CLIENT,
    },
    companyName: {
        type: String,
        required: false,
        unique: false,
    },
    primaryContactNo: {
        type: String,
        required: true,
        unique: true,
    },
    secondaryContactNo: {
        type: String,
        required: false,
        unique: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    state: {
        type: String,
        required: true,
        unique: false,
    },
    district: {
        type: String,
        required: true,
        unique: false,
    },
    city: {
        type: String,
        required: true,
        unique: false,
    },
    postalCode: {
        type: String,
        required: true,
        unique: false,
    },
    address: {
        type: String,
        required: true,
        unique: false,
    },
    gstNo: {
        type: String,
        required: false,
        unique: true,
    },
    dob: {
        type: Date,
        required: false,
        unique: false,
    },
    preferredCourier: {
        type: String,
        required: false,
        unique: false,
    }
}, {
    timestamps: true,
    _id: true
})

export const User = mongoose.model("User", UserSchema);