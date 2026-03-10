import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard - Main dashboard data
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schoolFilter = (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN')
      ? { schoolId: req.user!.schoolId! }
      : {};

    const studentFilter = (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN')
      ? { school: { id: req.user!.schoolId! } }
      : {};

    const [
      totalStudents,
      totalTeachers,
      totalSchools,
      recentPayments,
      feesCollected,
      outstandingFees,
      recentAnnouncements,
    ] = await Promise.all([
      prisma.student.count({ where: { ...studentFilter, status: 'ENROLLED' } }),
      prisma.user.count({ where: { ...schoolFilter, role: 'TEACHER', status: 'ACTIVE' } }),
      req.user!.role === 'SUPER_ADMIN'
        ? prisma.school.count({ where: { isActive: true } })
        : Promise.resolve(1),
      prisma.payment.findMany({
        where: { ...schoolFilter, paymentStatus: 'COMPLETED' },
        include: { student: { select: { firstName: true, lastName: true } } },
        orderBy: { paymentDate: 'desc' },
        take: 5,
      }),
      prisma.payment.aggregate({
        where: { ...schoolFilter, paymentStatus: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.feeBalance.aggregate({
        where: { balance: { gt: 0 }, student: schoolFilter.schoolId ? { schoolId: schoolFilter.schoolId } : undefined },
        _sum: { balance: true },
      }),
      prisma.announcement.findMany({
        where: { isActive: true, ...(schoolFilter.schoolId ? { schoolId: schoolFilter.schoolId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalSchools,
        feesCollected: Number(feesCollected._sum.amount || 0),
        outstandingFees: Number(outstandingFees._sum.balance || 0),
        currency: 'PGK',
      },
      recentPayments,
      recentAnnouncements,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
