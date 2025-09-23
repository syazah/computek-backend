import * as jwt from "jsonwebtoken";
export class JWT {
    private static instance: JWT;

    private constructor() { }
    public static getInstance(): JWT {
        if (!JWT.instance) {
            JWT.instance = new JWT();
        }
        return JWT.instance;
    }

    public generateToken(payload: object): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        return jwt.sign(payload, secret, { expiresIn: '2h' });
    }

    public verifyToken(token: string): object | string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        return jwt.verify(token, secret);
    }

    private decodeToken(token: string): null | { [key: string]: any } | string {
        return jwt.decode(token);
    }
}