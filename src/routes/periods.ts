import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import Joi from 'joi';

// Validation schema for creating a period
const updatePeriodSchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).optional(),
  quarter: Joi.string().valid('Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'ANNUAL').optional(),
  fromDate: Joi.date().optional(),
  toDate: Joi.date().optional(),
});

const periodSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  quarter: Joi.string().valid('Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'ANNUAL').required(),
  fromDate: Joi.date().required(),
  toDate: Joi.date().required(),
});

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const periods = await prisma.reportingPeriod.findMany({
      where: { customerId: customerId as string },
      orderBy: { year: 'desc' },
    });

    res.json(periods);
  } catch (error) {
    next(error);
  }
});

// Create a new reporting period
router.post('/', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = periodSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== value.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const period = await prisma.reportingPeriod.create({
      data: value,
    });

    res.status(201).json(period);
  } catch (error) {
    next(error);
  }
});

// Update a reporting period
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updatePeriodSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const existingPeriod = await prisma.reportingPeriod.findUnique({
      where: { id },
    });

    if (!existingPeriod) {
      throw createError('Reporting period not found', 404, 'PERIOD_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingPeriod.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const period = await prisma.reportingPeriod.update({
      where: { id },
      data: value,
    });

    res.json(period);
  } catch (error) {
    next(error);
  }
});

// Delete a reporting period
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const existingPeriod = await prisma.reportingPeriod.findUnique({
      where: { id },
    });

    if (!existingPeriod) {
      throw createError('Reporting period not found', 404, 'PERIOD_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingPeriod.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    await prisma.reportingPeriod.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as periodRoutes };
