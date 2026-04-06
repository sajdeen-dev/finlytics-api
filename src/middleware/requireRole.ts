import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/errors';

type Role = 'viewer' | 'analyst' | 'admin';

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};