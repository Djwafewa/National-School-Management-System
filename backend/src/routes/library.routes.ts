import { Router, Response, NextFunction } from 'express';
import prisma from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/library/books
router.get('/books', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category } = req.query;
    const where: Record<string, unknown> = {};

    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PROVINCIAL_ADMIN') {
      where.schoolId = req.user!.schoolId;
    }
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { author: { contains: search as string, mode: 'insensitive' } },
        { isbn: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.libraryBook.findMany({
      where,
      orderBy: { title: 'asc' },
    });
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// POST /api/library/books
router.post('/books', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const book = await prisma.libraryBook.create({ data: req.body });
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

// POST /api/library/loans
router.post('/loans', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    // Check availability
    const book = await prisma.libraryBook.findUnique({ where: { id: bookId } });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Book not available' });
    }

    const [loan] = await prisma.$transaction([
      prisma.libraryLoan.create({
        data: {
          bookId,
          studentId,
          borrowDate: new Date(),
          dueDate: new Date(dueDate),
        },
      }),
      prisma.libraryBook.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      }),
    ]);

    res.status(201).json(loan);
  } catch (error) {
    next(error);
  }
});

// PUT /api/library/loans/:id/return
router.put('/loans/:id/return', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const loan = await prisma.libraryLoan.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!loan || loan.isReturned) {
      return res.status(400).json({ error: 'Loan not found or already returned' });
    }

    await prisma.$transaction([
      prisma.libraryLoan.update({
        where: { id: loan.id },
        data: { isReturned: true, returnDate: new Date() },
      }),
      prisma.libraryBook.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/library/loans/overdue
router.get('/loans/overdue', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const overdue = await prisma.libraryLoan.findMany({
      where: {
        isReturned: false,
        dueDate: { lt: new Date() },
      },
      include: {
        book: { select: { title: true, author: true } },
        student: { select: { firstName: true, lastName: true, studentNumber: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(overdue);
  } catch (error) {
    next(error);
  }
});

export default router;
