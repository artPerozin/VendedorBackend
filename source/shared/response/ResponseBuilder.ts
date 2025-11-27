import { AppError } from "../error/AppError";
import { ErrorCode } from "../error/ErrorCode";
import { ErrorResponse } from "./ErrorResponse";
import { SuccessResponse } from "./SucessResponse";

export class ResponseBuilder {
  static success<T>(data: T, message?: string, metadata?: object): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }

  static error(error: AppError | Error, metadata?: object): ErrorResponse {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message || "Erro inesperado"
      },
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }
}