import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/enrollment
router.get('/enrollment', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId } = req.query;
    const where: Record<string, unknown> = {};

    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }

    const [total, byGender, byStatus] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.groupBy({ by: ['gender'], where, _count: true }),
      prisma.student.groupBy({ by: ['status'], where, _count: true }),
    ]);

    res.json({ total, byGender, byStatus });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/fee-collection
router.get('/fee-collection', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schoolId, startDate, endDate } = req.query;
    const where: Record<string, unknown> = { paymentStatus: 'COMPLETED' };

    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId as string);
    }

    if (startDate && endDate) {
      where.paymentDate = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const payments = await prisma.payment.findMany({ where });

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod = payments.reduce((acc: Record<string, number>, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
      return acc;
    }, {});

    const totalOutstanding = await prisma.feeBalance.aggregate({
      where: { balance: { gt: 0 }, student: req.user!.schoolId ? { schoolId: req.user!.schoolId } : undefined },
      _sum: { balance: true },
    });

    res.json({
      totalCollected,
      totalOutstanding: Number(totalOutstanding._sum.balance || 0),
      currency: 'PGK',
      byMethod,
      transactionCount: payments.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/academic-performance
router.get('/academic-performance', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { termId, subjectId } = req.query;
    const where: Record<string, unknown> = {};
    if (termId) where.exam = { termId: parseInt(termId as string) };
    if (subjectId) where.exam = { ...where.exam as object, subjectId: parseInt(subjectId as string) };

    const results = await prisma.examResult.findMany({
      where,
      include: { exam: { select: { maxMarks: true, subject: { select: { subjectName: true } } } } },
    });

    const gradeDistribution = results.reduce((acc: Record<string, number>, r) => {
      const grade = r.grade || 'Ungraded';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const marks = results.map(r => Number(r.marks));
    const average = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;

    res.json({
      totalResults: results.length,
      averageMark: average.toFixed(1),
      gradeDistribution,
      passRate: marks.length > 0 ? ((marks.filter(m => m >= 50).length / marks.length) * 100).toFixed(1) : '0',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/attendance-summary
router.get('/attendance-summary', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, startDate, endDate } = req.query;
    const where: Record<string, unknown> = {};
    if (classId) where.classId = parseInt(classId as string);
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const records = await prisma.studentAttendance.findMany({ where });

    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;

    res.json({
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/provincial - Provincial education office report
router.get('/provincial', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { provinceId } = req.query;
    if (!provinceId) return res.status(400).json({ error: 'provinceId required' });

    const pid = parseInt(provinceId as string);

    const [schools, students, bySchoolType] = await Promise.all([
      prisma.school.count({ where: { provinceId: pid, isActive: true } }),
      prisma.student.count({ where: { school: { provinceId: pid }, status: 'ENROLLED' } }),
      prisma.school.groupBy({ by: ['schoolType'], where: { provinceId: pid, isActive: true }, _count: true }),
    ]);

    res.json({
      totalSchools: schools,
      totalStudents: students,
      schoolsByType: bySchoolType,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
