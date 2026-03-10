import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFeeStructureSchema } from '../schemas/resource.schema';

const router = Router();

// GET /api/fees/structures
router.get('/structures', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, gradeLevel, feeType } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (feeType) where.feeType = feeType;

    const fees = await prisma.feeStructure.findMany({
      where,
      include: { term: { select: { termName: true } } },
      orderBy: [{ gradeLevel: 'asc' }, { feeType: 'asc' }],
    });
    res.json(fees);
  } catch (error) {
    next(error);
  }
});

// POST /api/fees/structures
router.post('/structures', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), validate(createFeeStructureSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fee = await prisma.feeStructure.create({ data: req.body });
    res.status(201).json(fee);
  } catch (error) {
    next(error);
  }
});

// POST /api/fees/assign - Assign fees to students by grade
router.post('/assign', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { feeStructureId, studentIds } = req.body;

    const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!feeStructure) return res.status(404).json({ error: 'Fee structure not found' });

    const balances = await prisma.feeBalance.createMany({
      data: studentIds.map((studentId: number) => ({
        studentId,
        feeStructureId,
        totalAmount: feeStructure.amount,
        paidAmount: 0,
        balance: feeStructure.amount,
      })),
      skipDuplicates: true,
    });

    res.json({ assigned: balances.count });
  } catch (error) {
    next(error);
  }
});

// GET /api/fees/balances/:studentId
router.get('/balances/:studentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const balances = await prisma.feeBalance.findMany({
      where: { studentId: parseInt(req.params.studentId) },
      include: { feeStructure: true },
    });

    const totalOwed = balances.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalPaid = balances.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalBalance = balances.reduce((sum, b) => sum + Number(b.balance), 0);

    res.json({
      balances,
      summary: { totalOwed, totalPaid, totalBalance, currency: 'PGK' },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/fees/outstanding
router.get('/outstanding', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: Record<string, unknown> = { balance: { gt: 0 } };

    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.student = { schoolId: req.user!.schoolId };
    }

    const outstanding = await prisma.feeBalance.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentNumber: true } },
        feeStructure: { select: { feeType: true, gradeLevel: true } },
      },
      orderBy: { balance: 'desc' },
    });

    res.json(outstanding);
  } catch (error) {
    next(error);
  }
});

export default router;
