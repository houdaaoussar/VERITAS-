import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true }
    });

    if (!user) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      refreshSecret,
      { expiresIn: '7d' }
    );

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        customerName: user.customer.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res, next) => {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { refreshToken } = value;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    const decoded = jwt.verify(refreshToken, refreshSecret) as any;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw createError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Generate new access token
    const jwtSecret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const accessToken = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );

    res.json({ accessToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    } else {
      next(error);
    }
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { 
        customer: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Logout endpoint (for audit logging)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    logger.info('User logged out', { userId: req.user!.id });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
