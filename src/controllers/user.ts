import { HttpException } from "../services/responses/HttpException.js"
import { HttpStatus } from "http-status-ts"
import { UserSchema } from "../validations/UserValidations.js"
import { UserDB } from "../db/user.js";
import type { UserEnum } from "../enums/UserEnum.js";
import { successResponse } from "../services/responses/successResponse.js";

const userDB = UserDB.getInstance();

export const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await userDB.getAllUsers();
        return res.status(HttpStatus.OK).json(successResponse(users, "Users fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Something went wrong while fetching users ${error}`,
        );
    }
}

/**
 * Create a user based on their user type.
 * @param req - The request object.
 * @param res - The response object.
 * @route POST /:userType/create
 * @returns A JSON response with the created user data or an error message.
 */
export const createUserBasedOnUserType = async (req: any, res: any) => {
    try {
        const body = req.body
        const parseResult = UserSchema.safeParse(body)
        if (!parseResult.success) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Validation failed: ${JSON.stringify(parseResult.error.format())}`
            )
        }
        const user = parseResult.data;
        const userType: UserEnum = req.params.userType;
        const createdUser = await userDB.createUser(user, userType);
        return res.status(HttpStatus.CREATED).json(successResponse({ email: createdUser.email, username: createdUser.username, userType: createdUser.userType }, "User created successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Something went wrong while creating user ${error}`,
        )
    }
}

/**
 * Get users based on their user type.
 * @param req - The request object.
 * @param res - The response object.
 * @route GET /:userType
 * @returns A JSON response with the fetched user data or an error message.
 */
export const getUserBasedOnUserType = async (req: any, res: any) => {
    try {
        const userType: UserEnum = req.params.userType;
        const users = await userDB.getUsersByType(userType);
        if (!users || users.length === 0) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `No users found for userType: ${userType}`
            );
        }
        return res.status(HttpStatus.OK).json(successResponse(users, "Users fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Something went wrong while fetching users ${error}`,
        );
    }
}

/**
 * Get the authenticated user's information.
 * @param req the request object
 * @param res the response object
 * @route GET /me
 * @returns A JSON response with the authenticated user's information or an error message.
 */
export const getSingleUserInfo = async (req: any, res: any) => {
    try {
        const { username } = req.user;
        const user = await userDB.getUserByUsername(username);
        if (!user) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `User not found with username: ${username}`
            );
        }
        const userObj: any = user.toObject();
        delete userObj.password;
        return res.status(HttpStatus.OK).json(successResponse(userObj, "User info fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Something went wrong while fetching user info ${error}`,
        );
    }
}


export const updateSingleUserInfo = async (req: any, res: any) => {
    try {
        const { username } = req.user;
        const body = req.body
        const parseResult = UserSchema.partial().safeParse(body)
        if (!parseResult.success) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Validation failed: ${JSON.stringify(parseResult.error.format())}`
            )
        }
        const updatedUser = await userDB.updateUserByUsername(username, body);
        const updatedObj: any = updatedUser.toObject();
        delete updatedObj.password;
        return res.status(HttpStatus.OK).json(successResponse(updatedObj, "User info updated successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Something went wrong while updating user info ${error}`,
        );
    }
}

