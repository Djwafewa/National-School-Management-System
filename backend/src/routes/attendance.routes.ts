import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { recordAttendanceSchema } from '../schemas/resource.schema';

const router = Router();

// POST /api/attendance - Record bulk attendance for a class
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), validate(recordAttendanceSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, date, records } = req.body;

    const results = await prisma.$transaction(
      records.map((r: { studentId: number; status: string; remarks?: string }) =>
        prisma.studentAttendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: r.studentId,
              classId,
              date: new Date(date),
            },
          },
          update: { status: r.status as any, remarks: r.remarks, recordedBy: req.user!.userId },
          create: {
            studentId: r.studentId,
            classId,
            date: new Date(date),
            status: r.status as any,
            remarks: r.remarks,
            recordedBy: req.user!.userId,
          },
        })
      )
    );

    res.json({ recorded: results.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/attendance/class/:classId
router.get('/class/:classId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date, startDate, endDate } = req.query;
    const classId = parseInt(req.params.classId);

    const where: Record<string, unknown> = { classId };
    if (date) {
      where.date = new Date(date as string);
    } else if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const attendance = await prisma.studentAttendance.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentNumber: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { lastName: 'asc' } }],
    });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const where: Record<string, unknown> = { studentId: parseInt(req.params.studentId) };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const attendance = await prisma.studentAttendance.findMany({
      where,
      include: { class: { select: { gradeLevel: true, section: true } } },
      orderBy: { date: 'desc' },
    });

    // Calculate summary
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;

    res.json({
      records: attendance,
      summary: { total, present, absent, late, attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
