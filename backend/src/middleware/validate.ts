import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((e) => ({ field: (e as any).path, message: e.msg }));
    throw new ApiError(400, 'Validation failed', extracted);
  }
  next();
};
