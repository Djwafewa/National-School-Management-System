import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    schoolId: number | null;
    role: UserRole;
    email: string;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('JWT_SECRET not configured'));
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      userId: number;
      schoolId: number | null;
      role: UserRole;
      email: string;
    };
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

/**
 * Middleware to ensure user can only access their own school's data.
 * SUPER_ADMIN and PROVINCIAL_ADMIN bypass this check.
 */
export function schoolScope(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError());
  }
  
  // Super admins and provincial admins can access all schools
  if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'PROVINCIAL_ADMIN') {
    return next();
  }

  // For other roles, enforce school-level isolation
  const schoolId = parseInt(req.params.schoolId || req.body?.schoolId);
  if (schoolId && req.user.schoolId !== schoolId) {
    return next(new ForbiddenError('Cannot access data from another school'));
  }

  next();
}
