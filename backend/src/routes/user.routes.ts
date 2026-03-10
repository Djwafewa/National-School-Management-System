import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, role, status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (req.user!.role !== 'SUPER_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          role: true, status: true, lastLoginAt: true, createdAt: true,
          school: { select: { name: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data: users, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/status
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      select: { id: true, firstName: true, lastName: true, email: true, status: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/reset-password
router.put('/:id/reset-password', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { passwordHash },
    });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/audit-logs
router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { entity, action, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
