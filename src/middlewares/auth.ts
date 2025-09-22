import { HttpStatus } from "http-status-ts";
import { HttpException } from "../services/ErrorHandling/HttpException.js";
import { JWT } from "../services/JWT/jwt.js";

const jwtService = JWT.getInstance();
export const authMiddleware = (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "No token provided or invalid token format",
            );
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwtService.verifyToken(token);
        if (!decoded) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "Invalid token",
            );
        }
        req.user = decoded;
        next();
    } catch (error) {
        throw new HttpException(
            HttpStatus.UNAUTHORIZED,
            `Authentication failed: ${error}`,
        )
    }
}