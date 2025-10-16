import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

const prisma = new PrismaClient();

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
    
    // Fetch user details from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        customerId: true
      }
    });

    if (!user) {
      throw createError('User not found', 401, 'USER_NOT_FOUND');
    }

    req.user = {
      ...user,
      role: user.role as UserRole
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
