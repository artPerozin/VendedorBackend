import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";
import ErrorDetails from "./ErrorsDetails";

export class ErrorFactory {
  static validationError(message: string, details?: ErrorDetails[]): AppError {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }

  static notFound(resource: string, identifier?: string): AppError {
    const message = identifier 
      ? `${resource} com identificador '${identifier}' não encontrado`
      : `${resource} não encontrado`;
    return new AppError(message, ErrorCode.NOT_FOUND, 404);
  }

  static alreadyExists(resource: string, field: string, value: string): AppError {
    return new AppError(
      `${resource} com ${field} '${value}' já existe`,
      ErrorCode.ALREADY_EXISTS,
      409,
      [{ field, value }]
    );
  }

  static unauthorized(message: string = "Credenciais inválidas"): AppError {
    return new AppError(message, ErrorCode.UNAUTHORIZED, 401);
  }

  static forbidden(message: string = "Acesso negado"): AppError {
    return new AppError(message, ErrorCode.FORBIDDEN, 403);
  }

  static internalError(message: string = "Erro interno do servidor"): AppError {
    return new AppError(message, ErrorCode.INTERNAL_ERROR, 500, undefined, false);
  }

  static databaseError(message: string = "Erro ao acessar banco de dados"): AppError {
    return new AppError(message, ErrorCode.DATABASE_ERROR, 500, undefined, false);
  }
}