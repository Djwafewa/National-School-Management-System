import prisma from '../database';
import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';

export async function auditLog(
  userId: number | undefined,
  action: string,
  entity: string,
  entityId?: number,
  oldValues?: object,
  newValues?: object,
  ipAddress?: string,
  userAgent?: string
) {
  await prisma.auditLog.create({
    data: {
      userId: userId || null,
      action,
      entity,
      entityId,
      oldValues: oldValues || undefined,
      newValues: newValues || undefined,
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Middleware factory that automatically creates an audit log entry after the response.
 */
export function withAuditLog(action: string, entity: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      // Only log on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        auditLog(
          req.user?.userId,
          action,
          entity,
          undefined,
          undefined,
          typeof body === 'object' ? (body as object) : undefined,
          req.ip,
          req.get('user-agent')
        ).catch(() => {}); // Fire and forget
      }
      return originalJson(body);
    };
    next();
  };
}
