import { ErrorCode } from "./ErrorCode";
import ErrorDetails from "./ErrorsDetails";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: ErrorDetails[];
  readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    details?: ErrorDetails[],
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}