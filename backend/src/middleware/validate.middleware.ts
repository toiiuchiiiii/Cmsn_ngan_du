import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response.js';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ',
        result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }))
      ));
    }
    (req as any)[source] = result.data;
    next();
  };
}
