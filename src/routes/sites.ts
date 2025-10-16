import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createSiteSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  name: Joi.string().min(1).max(255).required(),
  country: Joi.string().min(2).max(100).required(),
  region: Joi.string().max(100).optional(),
  postcode: Joi.string().max(20).optional()
});

const updateSiteSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  country: Joi.string().min(2).max(100).optional(),
  region: Joi.string().max(100).optional(),
  postcode: Joi.string().max(20).optional()
});

// Get sites for a customer
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const sites = await prisma.site.findMany({
      where: { customerId: customerId as string },
      include: {
        _count: {
          select: {
            activities: true,
            projects: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(sites);
  } catch (error) {
    next(error);
  }
});

// Get single site
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        customer: true,
        _count: {
          select: {
            activities: true,
            projects: true
          }
        }
      }
    });

    if (!site) {
      throw createError('Site not found', 404, 'SITE_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== site.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    res.json(site);
  } catch (error) {
    next(error);
  }
});

// Create new site
router.post('/', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = createSiteSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== value.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: value.customerId }
    });

    if (!customer) {
      throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    const site = await prisma.site.create({
      data: value,
      include: {
        customer: true
      }
    });

    logger.info('Site created', { 
      siteId: site.id, 
      siteName: site.name,
      customerId: site.customerId,
      createdBy: req.user?.id 
    });

    res.status(201).json(site);
  } catch (error) {
    next(error);
  }
});

// Update site
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateSiteSchema.validate(req.body);
    
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const existingSite = await prisma.site.findUnique({
      where: { id }
    });

    if (!existingSite) {
      throw createError('Site not found', 404, 'SITE_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingSite.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const site = await prisma.site.update({
      where: { id },
      data: value,
      include: {
        customer: true
      }
    });

    logger.info('Site updated', { 
      siteId: site.id,
      updatedBy: req.user?.id 
    });

    res.json(site);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Site not found', 404, 'SITE_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Delete site
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const existingSite = await prisma.site.findUnique({
      where: { id }
    });

    if (!existingSite) {
      throw createError('Site not found', 404, 'SITE_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingSite.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    await prisma.site.delete({
      where: { id }
    });

    logger.info('Site deleted', { 
      siteId: id,
      deletedBy: req.user?.id 
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Site not found', 404, 'SITE_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

export { router as siteRoutes };
