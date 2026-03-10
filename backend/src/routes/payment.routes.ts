import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPaymentSchema } from '../schemas/resource.schema';
import { generateReceiptNumber } from '../utils/helpers';

const router = Router();

// GET /api/payments
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, studentId, startDate, endDate, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }
    if (studentId) where.studentId = parseInt(studentId as string);
    if (startDate && endDate) {
      where.paymentDate = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, studentNumber: true } },
          school: { select: { name: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ data: payments, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), validate(createPaymentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receiptNumber = generateReceiptNumber();

    const payment = await prisma.payment.create({
      data: {
        ...req.body,
        paymentDate: new Date(req.body.paymentDate),
        receiptNumber,
        paymentStatus: 'COMPLETED',
        processedBy: req.user!.userId,
      },
    });

    // Update fee balances - apply payment to oldest outstanding balances first
    let remainingAmount = Number(req.body.amount);
    const balances = await prisma.feeBalance.findMany({
      where: { studentId: req.body.studentId, balance: { gt: 0 } },
      orderBy: { createdAt: 'asc' },
    });

    for (const bal of balances) {
      if (remainingAmount <= 0) break;
      const balanceOwed = Number(bal.balance);
      const applied = Math.min(remainingAmount, balanceOwed);

      await prisma.feeBalance.update({
        where: { id: bal.id },
        data: {
          paidAmount: { increment: applied },
          balance: { decrement: applied },
        },
      });
      remainingAmount -= applied;
    }

    res.status(201).json({
      payment,
      receiptNumber,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/:id/receipt
router.get('/:id/receipt', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        student: { select: { firstName: true, lastName: true, studentNumber: true } },
        school: { select: { name: true, code: true, address: true, phone: true } },
      },
    });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.json({
      receiptNumber: payment.receiptNumber,
      schoolName: payment.school.name,
      schoolCode: payment.school.code,
      studentName: `${payment.student.firstName} ${payment.student.lastName}`,
      studentNumber: payment.student.studentNumber,
      amount: payment.amount,
      currency: 'PGK',
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      description: payment.description,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
