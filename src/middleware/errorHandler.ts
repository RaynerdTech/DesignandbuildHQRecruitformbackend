import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any[] = [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys((err as any).keyPattern)[0];
    errors = [{
      field,
      message: `${field} already exists`
    }];
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Multer file upload errors
  if (err instanceof MulterError) {
    statusCode = 400;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 5MB';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload error';
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};