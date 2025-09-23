import { HttpStatus } from "http-status-ts";
import { HttpException } from "../services/ErrorHandling/HttpException.js";

export const adminMiddleware = (req: any, res: any, next: any) => {
    try {
        const user = req.user;
        if (!user) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "User not authenticated",
            );
        }
        if (user.role !== 'admin') {
            throw new HttpException(
                HttpStatus.FORBIDDEN,
                "Access denied: Admins only",
            );
        }
        next();
    } catch (error) {
        throw new HttpException(
            HttpStatus.UNAUTHORIZED,
            `Authentication failed: ${error}`,
        )
    }
}