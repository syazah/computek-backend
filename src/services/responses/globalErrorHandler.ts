import { HttpException } from "./HttpException.js";

const isProd = process.env.NODE_ENV === 'production';

export const globalErrorHandler = (
    err: any,
    _req: any,
    res: any,
    _next: any
) => {
    let status = 500;
    let message = 'Internal server error';
    let code: string | undefined;
    let details: unknown;

    if (err instanceof HttpException) {
        status = err.status || status;
        message = err.message || message;
        code = err.code;
        details = err.details;
    } else if (err instanceof Error) {
        message = err.message || message;
    }

    const payload: Record<string, unknown> = {
        success: false,
        message,
        ...(code ? { code } : {}),
        ...(details ? { details } : {}),
        ...(isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
    };

    res.status(status).json(payload);
};