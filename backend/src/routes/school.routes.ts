import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSchoolSchema, updateSchoolSchema } from '../schemas/resource.schema';
import { NotFoundError } from '../utils/errors';

const router = Router();

// GET /api/schools
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { provinceId, schoolType, schoolLevel, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = { isActive: true };
    if (provinceId) where.provinceId = parseInt(provinceId as string);
    if (schoolType) where.schoolType = schoolType;
    if (schoolLevel) where.schoolLevel = schoolLevel;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // School-scoped users can only see their own school
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.id = req.user!.schoolId;
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: { province: { select: { name: true, code: true } } },
        skip,
        take: parseInt(limit as string),
        orderBy: { name: 'asc' },
      }),
      prisma.school.count({ where }),
    ]);

    res.json({ data: schools, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    next(error);
  }
});

// GET /api/schools/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        province: true,
        district: true,
        _count: { select: { students: true, users: true, classes: true } },
      },
    });
    if (!school) throw new NotFoundError('School');
    res.json(school);
  } catch (error) {
    next(error);
  }
});

// POST /api/schools
router.post('/', authenticate, authorize('SUPER_ADMIN'), validate(createSchoolSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const school = await prisma.school.create({ data: req.body });
    res.status(201).json(school);
  } catch (error) {
    next(error);
  }
});

// PUT /api/schools/:id
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), validate(updateSchoolSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const school = await prisma.school.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(school);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/schools/:id (soft delete)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.school.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });
    res.json({ message: 'School deactivated' });
  } catch (error) {
    next(error);
  }
});

export default router;
