import { ErrorRequestHandler } from 'express';
import { ApiError } from '../types';
export declare class AppError extends Error implements ApiError {
    statusCode: number;
    details?: unknown;
    constructor(message: string, statusCode?: number, details?: unknown);
}
export declare const errorHandler: ErrorRequestHandler;
//# sourceMappingURL=errorHandler.d.ts.map