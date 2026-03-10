import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createClassSchema } from '../schemas/resource.schema';
import { NotFoundError } from '../utils/errors';

const router = Router();

// GET /api/classes
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, academicYearId, gradeLevel } = req.query;

    const where: Record<string, unknown> = {};
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }
    if (academicYearId) where.academicYearId = parseInt(academicYearId as string);
    if (gradeLevel) where.gradeLevel = gradeLevel;

    const classes = await prisma.class.findMany({
      where,
      include: {
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        _count: { select: { enrollments: true } },
        academicYear: { select: { year: true } },
      },
      orderBy: [{ gradeLevel: 'asc' }, { section: 'asc' }],
    });
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        enrollments: { include: { student: { select: { id: true, firstName: true, lastName: true, studentNumber: true, gender: true } } } },
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        timetable: { include: { subject: { select: { subjectName: true } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    });
    if (!cls) throw new NotFoundError('Class');
    res.json(cls);
  } catch (error) {
    next(error);
  }
});

// POST /api/classes
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), validate(createClassSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cls = await prisma.class.create({ data: req.body });
    res.status(201).json(cls);
  } catch (error) {
    next(error);
  }
});

// POST /api/classes/:id/enroll
router.post('/:id/enroll', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentIds } = req.body;
    const classId = parseInt(req.params.id);

    const enrollments = await prisma.classEnrollment.createMany({
      data: studentIds.map((studentId: number) => ({ classId, studentId })),
      skipDuplicates: true,
    });

    res.status(201).json({ enrolled: enrollments.count });
  } catch (error) {
    next(error);
  }
});

// POST /api/classes/:id/assign-teacher
router.post('/:id/assign-teacher', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { teacherId, isClassTeacher } = req.body;
    const classId = parseInt(req.params.id);

    const assignment = await prisma.classTeacher.create({
      data: { classId, teacherId, isClassTeacher: isClassTeacher || false },
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

export default router;
