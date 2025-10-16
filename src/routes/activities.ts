import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { CalculationEngine } from '../services/calculationEngine';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createActivitySchema = Joi.object({
  siteId: Joi.string().uuid().required(),
  periodId: Joi.string().uuid().required(),
  type: Joi.string().valid('ELECTRICITY', 'GAS', 'FUEL', 'TRANSPORT', 'WASTE', 'WATER', 'OTHER').required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().min(1).max(50).required(),
  activityDateStart: Joi.date().required(),
  activityDateEnd: Joi.date().required(),
  source: Joi.string().max(255).optional(),
  notes: Joi.string().max(1000).optional()
});

const updateActivitySchema = Joi.object({
  type: Joi.string().valid('ELECTRICITY', 'GAS', 'FUEL', 'TRANSPORT', 'WASTE', 'WATER', 'OTHER').optional(),
  quantity: Joi.number().positive().optional(),
  unit: Joi.string().min(1).max(50).optional(),
  activityDateStart: Joi.date().optional(),
  activityDateEnd: Joi.date().optional(),
  source: Joi.string().max(255).optional(),
  notes: Joi.string().max(1000).optional()
});

const bulkCreateSchema = Joi.object({
  activities: Joi.array().items(createActivitySchema).min(1).max(1000).required()
});

// Get activities
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, periodId, siteId, type, page = 1, limit = 50 } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const where: Prisma.ActivityWhereInput = {
      site: { customerId: customerId as string }
    };

    if (periodId) where.periodId = periodId as string;
    if (siteId) where.siteId = siteId as string;
    if (type) where.type = type as string;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where,
        include: {
          site: {
            select: { id: true, name: true, country: true }
          },
          period: {
            select: { id: true, year: true, quarter: true }
          },
          upload: {
            select: { id: true, filename: true }
          }
        },
        orderBy: { activityDateStart: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.activity.count({ where })
    ]);

    res.json({
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single activity
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        site: {
          include: { customer: true }
        },
        period: true,
        upload: {
          select: { id: true, filename: true }
        },
        emissionResults: {
          include: {
            factor: true,
            calcRun: {
              select: { id: true, status: true, createdAt: true }
            }
          }
        }
      }
    });

    if (!activity) {
      throw createError('Activity not found', 404, 'ACTIVITY_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== activity.site.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// Create new activity
router.post('/', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = createActivitySchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const validationErrors = CalculationEngine.validateActivityData(value as any);
    if (validationErrors.length > 0) {
      throw createError(validationErrors.join(', '), 400, 'ACTIVITY_VALIDATION_ERROR');
    }

    const site = await prisma.site.findUnique({
      where: { id: value.siteId },
      select: { customerId: true }
    });

    if (!site) {
      throw createError('Site not found', 404, 'SITE_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== site.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const period = await prisma.reportingPeriod.findFirst({
      where: {
        id: value.periodId,
        customerId: site.customerId
      }
    });

    if (!period) {
      throw createError('Reporting period not found', 404, 'PERIOD_NOT_FOUND');
    }

    const activity = await prisma.activity.create({
      data: value,
      include: {
        site: {
          select: { id: true, name: true, country: true }
        },
        period: {
          select: { id: true, year: true, quarter: true }
        }
      }
    });

    logger.info('Activity created', {
      activityId: activity.id,
      siteId: activity.siteId,
      type: activity.type,
      createdBy: req.user?.id
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

// Bulk create activities
router.post('/bulk', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = bulkCreateSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { activities } = value;
    const results = [];
    const errors: { index: number; errors: string[] }[] = [];

    for (let i = 0; i < activities.length; i++) {
      try {
        const activityData = activities[i];
        
        const validationErrors = CalculationEngine.validateActivityData(activityData as any);
        if (validationErrors.length > 0) {
          errors.push({ index: i, errors: validationErrors });
          continue;
        }

        const site = await prisma.site.findUnique({
          where: { id: activityData.siteId },
          select: { customerId: true }
        });

        if (!site || (req.user?.role !== 'ADMIN' && req.user?.customerId !== site.customerId)) {
          errors.push({ index: i, errors: ['Access denied or site not found'] });
          continue;
        }

        const activity = await prisma.activity.create({
          data: activityData
        });

        results.push(activity);
      } catch (err) {
        errors.push({ index: i, errors: [(err as Error).message] });
      }
    }

    logger.info('Bulk activities created', {
      totalRequested: activities.length,
      successful: results.length,
      failed: errors.length,
      createdBy: req.user?.id
    });

    res.status(201).json({
      created: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    next(error);
  }
});

// Update activity
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateActivitySchema.validate(req.body);
    
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        site: { select: { customerId: true } }
      }
    });

    if (!existingActivity) {
      throw createError('Activity not found', 404, 'ACTIVITY_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingActivity.site.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const updatedData = { ...existingActivity, ...value };
    const validationErrors = CalculationEngine.validateActivityData(updatedData as any);
    if (validationErrors.length > 0) {
      throw createError(validationErrors.join(', '), 400, 'ACTIVITY_VALIDATION_ERROR');
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: value,
      include: {
        site: {
          select: { id: true, name: true, country: true }
        },
        period: {
          select: { id: true, year: true, quarter: true }
        }
      }
    });

    logger.info('Activity updated', {
      activityId: activity.id,
      updatedBy: req.user?.id
    });

    res.json(activity);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Activity not found', 404, 'ACTIVITY_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Delete activity
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        site: { select: { customerId: true } }
      }
    });

    if (!existingActivity) {
      throw createError('Activity not found', 404, 'ACTIVITY_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingActivity.site.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    await prisma.activity.delete({
      where: { id }
    });

    logger.info('Activity deleted', {
      activityId: id,
      deletedBy: req.user?.id
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Activity not found', 404, 'ACTIVITY_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Get activity statistics
router.get('/stats/summary', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, periodId } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const where: Prisma.ActivityWhereInput = {
      site: { customerId: customerId as string }
    };

    if (periodId) where.periodId = periodId as string;

    const totalActivities = await prisma.activity.count({ where });
    const activitiesByType = await prisma.activity.groupBy({
      by: ['type'],
      where,
      _count: { type: true },
      _sum: { quantity: true }
    });
    const activitiesBySite = await prisma.activity.groupBy({
      by: ['siteId'],
      where,
      _count: { _all: true },
    });

    const siteIds = activitiesBySite.map(group => group.siteId);
    const sites = await prisma.site.findMany({
      where: { id: { in: siteIds } },
      select: { id: true, name: true }
    });

    const bySiteWithNames = activitiesBySite.map(group => ({
      siteId: group.siteId,
      count: group._count._all,
      siteName: sites.find(site => site.id === group.siteId)?.name
    }));

    res.json({
      totalActivities,
      byType: activitiesByType,
      bySite: bySiteWithNames
    });
  } catch (error) {
    next(error);
  }
});

// ...
export { router as activityRoutes };
