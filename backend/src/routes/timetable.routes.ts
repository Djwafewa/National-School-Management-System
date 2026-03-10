import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTimetableSlotSchema } from '../schemas/resource.schema';

const router = Router();

// GET /api/timetable/class/:classId
router.get('/class/:classId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slots = await prisma.timetableSlot.findMany({
      where: { classId: parseInt(req.params.classId) },
      include: { subject: { select: { subjectName: true, subjectCode: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Group by day of week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetable = days.map((day, i) => ({
      day,
      slots: slots.filter(s => s.dayOfWeek === i + 1),
    }));

    res.json(timetable);
  } catch (error) {
    next(error);
  }
});

// POST /api/timetable
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), validate(createTimetableSlotSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slot = await prisma.timetableSlot.create({ data: req.body });
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.timetableSlot.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Timetable slot deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
