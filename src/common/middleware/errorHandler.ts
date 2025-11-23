import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../types';

export class AppError extends Error implements ApiError {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
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
