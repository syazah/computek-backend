import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/ErrorHandling/HttpException.js"
import { AuthSchema } from "../validations/AuthValidations.js";
import bcrypt from "bcrypt";
import { UserDB } from "../db/user.js";
import { JWT } from "../services/JWT/jwt.js";

const userDB = UserDB.getInstance();
const jwtService = JWT.getInstance();

/**
 * Login user
 * @param req   Express request object
 * @param res   Express response object
 * @route       POST /login
 * @returns     A JSON response with the login status and JWT token
 */
export const loginUser = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validate = AuthSchema.safeParse(body);
        if (!validate.success) {
            throw new HttpException(
                HttpStatus.BAD_REQUEST,
                `Validation failed: ${JSON.stringify(validate.error.format())}`
            )
        }
        const { username, password } = validate.data;
        const user = await userDB.getUserByUsername(username);
        if (!user) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `User not found with username: ${username}`
            )
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                `Invalid password for username: ${username}`
            )
        }
        const token = jwtService.generateToken({ id: user._id, username: user.username, userType: user.userType });

        return res.status(HttpStatus.OK).json({
            success: true,
            message: "Login successful",
            data: {
                token
            }
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Something went wrong while logging in user ${error}`,
        )
    }
}