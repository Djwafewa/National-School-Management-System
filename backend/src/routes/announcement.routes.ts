import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAnnouncementSchema } from '../schemas/resource.schema';

const router = Router();

// GET /api/announcements
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: Record<string, unknown> = { isActive: true };

    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
    res.json(announcements);
  } catch (error) {
    next(error);
  }
});

// POST /api/announcements
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), validate(createAnnouncementSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body, authorId: req.user!.userId };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    const announcement = await prisma.announcement.create({ data });
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.announcement.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
