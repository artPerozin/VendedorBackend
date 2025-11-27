import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/error/AppError";
import { ErrorCode } from "../../../shared/error/ErrorCode";
import { ResponseBuilder } from "../../../shared/response/ResponseBuilder";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(ResponseBuilder.error(err));
    }

    console.error("Erro não tratado:", err);

    return res.status(500).json(
        ResponseBuilder.error(
            new AppError(
                "Erro interno do servidor",
                ErrorCode.INTERNAL_ERROR,
                500,
                undefined,
                false
            )
        )
    );
}