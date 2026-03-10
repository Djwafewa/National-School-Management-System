import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../schemas/resource.schema';
import { NotFoundError } from '../utils/errors';
import { generateStudentNumber } from '../utils/helpers';

const router = Router();

// GET /api/students
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, status, gradeLevel, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};

    // School scoping
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { studentNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          school: { select: { name: true, code: true } },
          classEnrollments: {
            include: { class: { select: { gradeLevel: true, section: true } } },
            take: 1,
            orderBy: { enrolledAt: 'desc' },
          },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { lastName: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({ data: students, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    next(error);
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        school: { select: { name: true, code: true } },
        guardians: { include: { parent: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } } } },
        classEnrollments: { include: { class: true } },
        payments: { orderBy: { paymentDate: 'desc' }, take: 10 },
        feeBalances: { include: { feeStructure: true } },
        disciplineRecords: { orderBy: { incidentDate: 'desc' } },
      },
    });
    if (!student) throw new NotFoundError('Student');
    res.json(student);
  } catch (error) {
    next(error);
  }
});

// POST /api/students
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), validate(createStudentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentNumber = generateStudentNumber();
    const student = await prisma.student.create({
      data: {
        ...req.body,
        studentNumber,
        dateOfBirth: new Date(req.body.dateOfBirth),
      },
    });
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
});

// PUT /api/students/:id
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), validate(updateStudentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

    const student = await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(student);
  } catch (error) {
    next(error);
  }
});

// PUT /api/students/:id/status
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const student = await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(student);
  } catch (error) {
    next(error);
  }
});

export default router;
