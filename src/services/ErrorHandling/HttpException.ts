export class HttpException extends Error {
  status: number;
  code?: string;
  details?: unknown;
  isOperational: boolean = true;

  constructor(
    status: number,
    message: string,
    options?: { code?: string; details?: unknown }
  ) {
    super(message);
    this.name = 'HttpException';
    this.status = status;
    this.code = options?.code || status.toString() || "Code Not Present";
    this.details = options?.details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}