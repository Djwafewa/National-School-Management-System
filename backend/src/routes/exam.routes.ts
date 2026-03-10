import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createExamSchema, recordExamResultsSchema } from '../schemas/resource.schema';
import { calculateGrade } from '../utils/helpers';

const router = Router();

// GET /api/exams
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { termId, subjectId } = req.query;
    const where: Record<string, unknown> = {};
    if (termId) where.termId = parseInt(termId as string);
    if (subjectId) where.subjectId = parseInt(subjectId as string);

    const exams = await prisma.exam.findMany({
      where,
      include: {
        subject: { select: { subjectName: true, gradeLevel: true } },
        term: { select: { termName: true, academicYear: { select: { year: true } } } },
        _count: { select: { results: true } },
      },
      orderBy: { examDate: 'desc' },
    });
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

// POST /api/exams
router.post('/', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), validate(createExamSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (data.examDate) data.examDate = new Date(data.examDate);
    const exam = await prisma.exam.create({ data });
    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
});

// POST /api/exams/results - Record exam results for multiple students
router.post('/results', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), validate(recordExamResultsSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { examId, results } = req.body;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const maxMarks = Number(exam.maxMarks);

    const savedResults = await prisma.$transaction(
      results.map((r: { studentId: number; marks: number }) =>
        prisma.examResult.upsert({
          where: { examId_studentId: { examId, studentId: r.studentId } },
          update: { marks: r.marks, grade: calculateGrade(r.marks, maxMarks) },
          create: {
            examId,
            studentId: r.studentId,
            marks: r.marks,
            grade: calculateGrade(r.marks, maxMarks),
          },
        })
      )
    );

    res.json({ recorded: savedResults.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/exams/:id/results
router.get('/:id/results', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.examResult.findMany({
      where: { examId: parseInt(req.params.id) },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentNumber: true } },
        exam: { select: { examName: true, maxMarks: true, subject: { select: { subjectName: true } } } },
      },
      orderBy: { marks: 'desc' },
    });

    // Statistics
    const marks = results.map(r => Number(r.marks));
    const stats = marks.length > 0 ? {
      count: marks.length,
      average: (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1),
      highest: Math.max(...marks),
      lowest: Math.min(...marks),
      passRate: ((marks.filter(m => m >= 50).length / marks.length) * 100).toFixed(1),
    } : null;

    res.json({ results, statistics: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/exams/student/:studentId/report-card
router.get('/student/:studentId/report-card', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { termId } = req.query;
    const studentId = parseInt(req.params.studentId);

    const where: Record<string, unknown> = { studentId };
    if (termId) where.exam = { termId: parseInt(termId as string) };

    const results = await prisma.examResult.findMany({
      where,
      include: {
        exam: {
          include: {
            subject: { select: { subjectName: true, subjectCode: true } },
            term: { select: { termName: true } },
          },
        },
      },
      orderBy: { exam: { subject: { subjectName: 'asc' } } },
    });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        school: { select: { name: true, code: true, motto: true } },
        classEnrollments: { include: { class: { select: { gradeLevel: true, section: true } } }, take: 1, orderBy: { enrolledAt: 'desc' } },
      },
    });

    res.json({ student, results });
  } catch (error) {
    next(error);
  }
});

export default router;
