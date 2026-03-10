import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schema';
import { auditLog } from '../middleware/auditLog';
import { ConflictError, UnauthorizedError } from '../utils/errors';

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active. Contact your administrator.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokenPayload = {
      userId: user.id,
      schoolId: user.schoolId,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await auditLog(user.id, 'LOGIN', 'users', user.id, undefined, undefined, req.ip, req.get('user-agent'));

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phone, role, schoolId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phone,
        role,
        schoolId,
        status: 'PENDING_VERIFICATION',
      },
    });

    await auditLog(user.id, 'REGISTER', 'users', user.id, undefined, undefined, req.ip, req.get('user-agent'));

    res.status(201).json({
      message: 'Registration successful. Account pending verification.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: number;
      schoolId: number | null;
      role: string;
      email: string;
    };

    const newToken = jwt.sign(
      { userId: decoded.userId, schoolId: decoded.schoolId, role: decoded.role, email: decoded.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Remove all refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, validate(changePasswordSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new UnauthorizedError();

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await auditLog(user.id, 'CHANGE_PASSWORD', 'users', user.id, undefined, undefined, req.ip, req.get('user-agent'));

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        schoolId: true,
        avatarUrl: true,
        lastLoginAt: true,
        school: { select: { id: true, name: true, code: true } },
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
