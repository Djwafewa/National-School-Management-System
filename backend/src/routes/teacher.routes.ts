import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/teachers
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId } = req.query;

    const where: Record<string, unknown> = {};
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.user = { schoolId: req.user!.schoolId };
    } else if (schoolId) {
      where.user = { schoolId: parseInt(schoolId as string) };
    }

    const teachers = await prisma.teacherProfile.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true } },
        classAssignments: { include: { class: { select: { gradeLevel: true, section: true } } } },
        subjectTeachers: { include: { subject: { select: { subjectName: true } } } },
      },
    });
    res.json(teachers);
  } catch (error) {
    next(error);
  }
});

// GET /api/teachers/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        classAssignments: { include: { class: true } },
        subjectTeachers: { include: { subject: true } },
        attendanceRecords: { orderBy: { date: 'desc' }, take: 30 },
      },
    });
    res.json(teacher);
  } catch (error) {
    next(error);
  }
});

// PUT /api/teachers/:id
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { qualification, specialization, yearsExperience, salary, employeeNumber } = req.body;
    const teacher = await prisma.teacherProfile.update({
      where: { id: parseInt(req.params.id) },
      data: { qualification, specialization, yearsExperience, salary, employeeNumber },
    });
    res.json(teacher);
  } catch (error) {
    next(error);
  }
});

export default router;
