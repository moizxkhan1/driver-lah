"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        console.error('Validation Error:', JSON.stringify(err.issues, null, 2));
        res.status(400).json({
            error: 'Validation Error',
            details: err.issues,
        });
        return;
    }
    if (err instanceof AppError) {
        console.error(`AppError [${err.statusCode}]: ${err.message}`, err.details || '');
        res.status(err.statusCode).json({
            error: err.message,
            details: err.details,
        });
        return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map