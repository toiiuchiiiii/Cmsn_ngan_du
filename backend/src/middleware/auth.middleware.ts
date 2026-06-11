import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { errorResponse } from '../utils/response.js';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json(errorResponse('UNAUTHORIZED', 'Vui lòng đăng nhập'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: number; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json(errorResponse('TOKEN_EXPIRED', 'Token hết hạn, vui lòng đăng nhập lại'));
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: number; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
  } catch {
    // Token invalid, continue without auth
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json(errorResponse('FORBIDDEN', 'Không có quyền thực hiện hành động này'));
    }
    next();
  };
}
