import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
};
