import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db as prisma } from '../storage/storageAdapter';
import { createError } from './errorHandler';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

// Mock token for testing without database
const MOCK_TOKEN = 'mock-token-for-testing';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    customerId: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Access token required', 401, 'UNAUTHORIZED');
    }

    // Handle mock token for testing
    if (token === MOCK_TOKEN) {
      req.user = {
        id: 'user_default',
        email: 'admin@demo.com',
        role: 'ADMIN',
        customerId: 'customer_default'
      };
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT secret not configured', 500, 'CONFIGURATION_ERROR');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createError('Token expired', 401, 'TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw createError('Invalid token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
    
    // Fetch user details from storage
    const user = await prisma.user.findUnique({ id: decoded.userId });

    if (!user) {
      throw createError('User not found', 401, 'USER_NOT_FOUND');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      customerId: user.customerId || ''
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401, 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (requiredRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!requiredRoles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
};

export const requireCustomerAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const customerId = req.params.customerId || req.query.customerId || req.body.customerId;
  
  if (!customerId) {
    return next(createError('Customer ID required', 400, 'CUSTOMER_ID_REQUIRED'));
  }

  if (req.user?.customerId !== customerId && req.user?.role !== 'ADMIN') {
    return next(createError('Access denied to customer data', 403, 'CUSTOMER_ACCESS_DENIED'));
  }

  next();
};
