import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSubjectSchema } from '../schemas/resource.schema';

const router = Router();

// GET /api/subjects
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, gradeLevel } = req.query;

    const where: Record<string, unknown> = {};
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }
    if (gradeLevel) where.gradeLevel = gradeLevel;

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
      orderBy: [{ gradeLevel: 'asc' }, { subjectName: 'asc' }],
    });
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

// POST /api/subjects
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), validate(createSubjectSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

// POST /api/subjects/:id/assign-teacher
router.post('/:id/assign-teacher', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { teacherId } = req.body;
    const assignment = await prisma.subjectTeacher.create({
      data: { subjectId: parseInt(req.params.id), teacherId },
    });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

export default router;
