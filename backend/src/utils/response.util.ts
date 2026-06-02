import type { Response } from "express";
import type { ApiSuccessResponse } from "../types/api.types.js";

export function sendSuccess<T>(
    res: Response,
    data: T,
    statusCode = 200,
    meta?: Record<string, unknown>
): void {
    const response: ApiSuccessResponse<T> = {
        success: true,
        data,
        ...(meta && { meta })
    };
    res.status(statusCode).json(response);
}