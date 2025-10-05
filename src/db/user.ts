import mongoose from "mongoose";
import type { UserInput } from "../validations/UserValidations.js";
import { User } from "../schema/User.js";
import type { UserEnum } from "../enums/UserEnum.js";
import bcrypt from "bcrypt";
export class UserDB {
    private static instance: UserDB;

    private constructor() { }

    public static getInstance(): UserDB {
        if (!UserDB.instance) {
            UserDB.instance = new UserDB();
        }
        return UserDB.instance;
    }

    public async getAllUsers() {
        return await User.find();
    }

    public async createUser(user: UserInput, userType: String) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(user.password, salt);
        const newUser = await User.create({ ...user, password: hashedPassword, userType })
        if (!newUser) throw new Error("Failed to create user");
        return newUser;
    }

    public async getUsersByType(userType: String) {
        const users = await User.find({ userType });
        return users;
    }

    public async getUserByUsername(username: String) {
        const user = await User.findOne({ username });
        return user;
    }

    public async updateUserByUsername(username: String, data: Partial<UserInput>) {
        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(data.password, salt);
            data.password = hashedPassword;
        }
        const updatedUser = await User.findOneAndUpdate({ username }, data, { new: true });
        if (!updatedUser) throw new Error("User not found or not updated");
        return updatedUser;
    }
}