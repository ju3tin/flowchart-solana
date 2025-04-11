import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: err.message,
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
