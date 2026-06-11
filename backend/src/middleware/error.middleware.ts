import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error({
    err: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if ((err as any).name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: (err as any).issues.map((i: any) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }

  if (!(err instanceof AppError)) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: config.nodeEnv === 'production'
          ? 'Đã có lỗi xảy ra, vui lòng thử lại sau'
          : err.message,
      },
    });
  }

  return res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
