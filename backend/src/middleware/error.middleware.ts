import { Request, Response, NextFunction } from 'express';

// 自定义错误类
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

// 异步错误捕获包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404错误处理
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`路径不存在: ${req.originalUrl}`, 404);
  next(error);
};

// 全局错误处理中间件
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Prisma错误处理
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0];
    error = new AppError(`${field} 已存在`, 400);
  }

  if (err.code === 'P2025') {
    error = new AppError('记录不存在', 404);
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('无效的token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token已过期', 401);
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || '服务器内部错误';

  // 开发环境下返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
    res.status(statusCode).json({
      success: false,
      error: message,
      stack: err.stack,
      details: err
    });
  } else {
    // 生产环境下只返回必要信息
    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? '服务器内部错误' : message
    });
  }
};