import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const customerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(2).max(20).uppercase().required(),
  category: Joi.string().max(50).optional(),
  level: Joi.string().max(50).optional()
});

// Get all customers (Admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            sites: true,
            users: true,
            projects: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// Get a single customer
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Admins can get any customer, other users can only get their own
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== id) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sites: {
          orderBy: { name: 'asc' }
        },
        users: {
          select: {
            id: true,
            email: true,
            role: true
          },
          orderBy: { email: 'asc' }
        },
        reportingPeriods: {
          orderBy: { year: 'desc' }
        }
      }
    });

    if (!customer) {
      throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Create a new customer (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const customer = await prisma.customer.create({
      data: value
    });

    logger.info('Customer created', { customerId: customer.id, name: customer.name });
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      next(createError('A customer with this code already exists', 409, 'CONFLICT'));
    } else {
      next(error);
    }
  }
});

// Update a customer (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: value
    });

    logger.info('Customer updated', { customerId: customer.id });
    res.json(customer);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Delete a customer (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({
      where: { id }
    });

    logger.warn('Customer deleted', { customerId: id, deletedBy: (req as AuthenticatedRequest).user?.id });
    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

export { router as customerRoutes };
