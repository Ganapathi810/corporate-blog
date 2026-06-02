import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.config.js";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.util.js";
import type { ApiErrorResponse } from "../types/api.types.js";

const isDev = env.NODE_ENV !== "production";

export const globalErrorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const { requestId, method, path } = req;

    if(err instanceof AppError) {
        logger.warn('Operational error', {
            requestId,
            code: err.code,
            message: err.message,
            statusCode: err.statusCode,
            method,
            path
        })

        return res.status(err.statusCode).json(
            buildErrorResponse(err.code, err.message, requestId, (err as any).details)
        )
    }

    if(err instanceof ZodError) {
        const details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))

        logger.warn('Zod validation error', { requestId, details});

        return res.status(400).json(
            buildErrorResponse(
                'VALIDATION_ERROR',
                err.issues[0]?.message ?? 'Validation failed',
                requestId,
                details
            )
        )
    }

    const unknown = err instanceof Error ? err: new Error(String(err))

    logger.error('Unhandled error', {
        requestId,
        message: unknown.message,
        stack: unknown.stack,
        method,
        path
    })

    res.status(500).json(
        buildErrorResponse(
            'INTERNAL_SERVER_ERROR',
            isDev ? unknown.message : 'An unexpected error occurred',
            requestId,
            isDev ? { stack: unknown.stack } : undefined
        )
    )
};

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json(
        buildErrorResponse(
            'NOT_FOUND',
            `Route ${req.method} ${req.path} not found`,
            req.requestId
        )
    )
}

function buildErrorResponse(
    code: string,
    message: string,
    requestId?: string,
    details?: unknown
): ApiErrorResponse {
    return {
        success: false,
        error: {
            code,
            message,
            ...(details !== undefined && { details })
        },
        ...(requestId && { requestId })
    }
}