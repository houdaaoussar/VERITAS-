import express from 'express';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const router = express.Router();

const LIFECYCLE_STATES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'];

// Validation schemas
const createProjectSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  siteId: Joi.string().uuid().optional().allow(null),
  type: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).max(1000).required(),
  startDate: Joi.date().required(),
  lifecycleState: Joi.string().valid(...LIFECYCLE_STATES).optional().default('PLANNED'),
  estAnnualSavingKgCo2e: Joi.number().min(0).required()
});

const updateProjectSchema = Joi.object({
  siteId: Joi.string().uuid().optional().allow(null),
  type: Joi.string().min(1).max(255).optional(),
  description: Joi.string().min(1).max(1000).optional(),
  startDate: Joi.date().optional(),
  lifecycleState: Joi.string().valid(...LIFECYCLE_STATES).optional(),
  estAnnualSavingKgCo2e: Joi.number().min(0).optional()
});

const createActualSchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2050).required(),
  actualSavingKgCo2e: Joi.number().required()
});

// Get projects for a customer
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, siteId, status, type } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const where: any = { customerId: customerId as string };
    if (siteId) where.siteId = siteId as string;
    if (status && status !== 'ALL') where.lifecycleState = status as string;
    if (type && type !== 'ALL') where.type = type as string;

    const projects = await prisma.project.findMany({
      where,
      include: {
        site: {
          select: { id: true, name: true, country: true }
        },
        projectActuals: {
          orderBy: { year: 'desc' }
        },
        _count: {
          select: { projectActuals: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate variance for each project
    const projectsWithVariance = projects.map(p => {
      const project = { ...p, projectActuals: p.projectActuals || [] };
      const currentYear = new Date().getFullYear();
      const actualForCurrentYear = project.projectActuals.find(a => a.year === currentYear);
      
      let variance = null;
      let cumulativeVariance = 0;
      
      if (actualForCurrentYear) {
        variance = actualForCurrentYear.actualSavingKgCo2e - project.estAnnualSavingKgCo2e;
      }
      
      // Calculate cumulative variance
      project.projectActuals.forEach(actual => {
        cumulativeVariance += (actual.actualSavingKgCo2e - project.estAnnualSavingKgCo2e);
      });

      return {
        ...project,
        variance,
        cumulativeVariance,
        totalActualSavings: project.projectActuals.reduce((sum, a) => sum + a.actualSavingKgCo2e, 0)
      };
    });

    res.json(projectsWithVariance);
  } catch (error) {
    next(error);
  }
});

// Get single project with detailed variance analysis
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true }
        },
        site: {
          select: { id: true, name: true, country: true }
        },
        projectActuals: {
          orderBy: { year: 'asc' }
        }
      }
    });

    if (!project) {
      throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== project.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Calculate detailed variance analysis
    const varianceAnalysis = project.projectActuals.map(actual => {
      const variance = actual.actualSavingKgCo2e - project.estAnnualSavingKgCo2e;
      const variancePercentage = project.estAnnualSavingKgCo2e > 0 
        ? (variance / project.estAnnualSavingKgCo2e) * 100 
        : 0;
      
      return {
        year: actual.year,
        estimated: project.estAnnualSavingKgCo2e,
        actual: actual.actualSavingKgCo2e,
        variance,
        variancePercentage,
        performance: variance >= 0 ? 'above_target' : 'below_target'
      };
    });

    const totalEstimated = project.projectActuals.length * project.estAnnualSavingKgCo2e;
    const totalActual = project.projectActuals.reduce((sum, a) => sum + a.actualSavingKgCo2e, 0);
    const totalVariance = totalActual - totalEstimated;

    res.json({
      ...project,
      varianceAnalysis,
      summary: {
        totalEstimated,
        totalActual,
        totalVariance,
        averageAnnualPerformance: varianceAnalysis.length > 0 
          ? varianceAnalysis.reduce((sum, v) => sum + v.variancePercentage, 0) / varianceAnalysis.length 
          : 0,
        yearsTracked: project.projectActuals.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create new project
router.post('/', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== value.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: value.customerId }
    });

    if (!customer) {
      throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    // Verify site exists if provided
    if (value.siteId) {
      const site = await prisma.site.findFirst({
        where: {
          id: value.siteId,
          customerId: value.customerId
        }
      });

      if (!site) {
        throw createError('Site not found or does not belong to customer', 404, 'SITE_NOT_FOUND');
      }
    }

    const project = await prisma.project.create({
      data: value,
      include: {
        customer: {
          select: { id: true, name: true }
        },
        site: {
          select: { id: true, name: true, country: true }
        }
      }
    });

    logger.info('Project created', {
      projectId: project.id,
      customerId: project.customerId,
      type: project.type,
      createdBy: req.user?.id
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProjectSchema.validate(req.body);
    
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingProject.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Verify site if being updated
    if (value.siteId) {
      const site = await prisma.site.findFirst({
        where: {
          id: value.siteId,
          customerId: existingProject.customerId
        }
      });

      if (!site) {
        throw createError('Site not found or does not belong to customer', 404, 'SITE_NOT_FOUND');
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: value,
      include: {
        customer: {
          select: { id: true, name: true }
        },
        site: {
          select: { id: true, name: true, country: true }
        },
        projectActuals: {
          orderBy: { year: 'desc' }
        }
      }
    });

    logger.info('Project updated', {
      projectId: project.id,
      updatedBy: req.user!.id
    });

    res.json(project);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Project not found', 404, 'PROJECT_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Delete project
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== existingProject.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    await prisma.project.delete({
      where: { id }
    });

    logger.info('Project deleted', {
      projectId: id,
      deletedBy: req.user?.id
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Project not found', 404, 'PROJECT_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Add actual savings for a project year
router.post('/:id/actuals', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = createActualSchema.validate(req.body);
    
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== project.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Check if actual for this year already exists
    const existingActual = await prisma.projectActual.findFirst({
      where: {
        projectId: id,
        year: value.year
      }
    });

    let actual;
    if (existingActual) {
      // Update existing actual
      actual = await prisma.projectActual.update({
        where: { id: existingActual.id },
        data: { actualSavingKgCo2e: value.actualSavingKgCo2e }
      });
    } else {
      // Create new actual
      actual = await prisma.projectActual.create({
        data: {
          projectId: id,
          year: value.year,
          actualSavingKgCo2e: value.actualSavingKgCo2e
        }
      });
    }

    // Calculate variance
    const variance = actual.actualSavingKgCo2e - project.estAnnualSavingKgCo2e;
    const variancePercentage = project.estAnnualSavingKgCo2e > 0 
      ? (variance / project.estAnnualSavingKgCo2e) * 100 
      : 0;

    logger.info('Project actual added/updated', {
      projectId: id,
      year: value.year,
      actualSaving: value.actualSavingKgCo2e,
      variance,
      updatedBy: req.user!.id
    });

    res.status(201).json({
      ...actual,
      variance,
      variancePercentage,
      estimated: project.estAnnualSavingKgCo2e
    });
  } catch (error) {
    next(error);
  }
});

// Get project statistics and summary
router.get('/stats/summary', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const [
      totalProjects,
      projectsByLifecycle,
      projectsByType,
      totalEstimatedSavings,
      totalActualSavings,
      projectsWithActuals
    ] = await Promise.all([
      prisma.project.count({
        where: { customerId: customerId as string }
      }),
      
      prisma.project.groupBy({
        by: ['lifecycleState'],
        where: { customerId: customerId as string },
        _count: { lifecycleState: true },
        _sum: { estAnnualSavingKgCo2e: true }
      }),
      
      prisma.project.groupBy({
        by: ['type'],
        where: { customerId: customerId as string },
        _count: { type: true },
        _sum: { estAnnualSavingKgCo2e: true }
      }),
      
      prisma.project.aggregate({
        where: { customerId: customerId as string },
        _sum: { estAnnualSavingKgCo2e: true }
      }),
      
      prisma.projectActual.aggregate({
        where: {
          project: { customerId: customerId as string }
        },
        _sum: { actualSavingKgCo2e: true }
      }),
      
      prisma.project.findMany({
        where: { 
          customerId: customerId as string,
          projectActuals: { some: {} }
        },
        include: {
          projectActuals: true
        }
      })
    ]);

    // Calculate overall variance
    const totalEstimated = totalEstimatedSavings._sum.estAnnualSavingKgCo2e || 0;
    const totalActual = totalActualSavings._sum.actualSavingKgCo2e || 0;
    const overallVariance = totalActual - totalEstimated;

    // Calculate performance metrics
    let performanceMetrics = {
      projectsAboveTarget: 0,
      projectsBelowTarget: 0,
      projectsOnTarget: 0,
      averageVariancePercentage: 0
    };

    if (projectsWithActuals.length > 0) {
      const variances = projectsWithActuals.map(project => {
        const totalProjectActual = project.projectActuals.reduce((sum, a) => sum + a.actualSavingKgCo2e, 0);
        const totalProjectEstimated = project.projectActuals.length * project.estAnnualSavingKgCo2e;
        return totalProjectActual - totalProjectEstimated;
      });

      performanceMetrics.projectsAboveTarget = variances.filter(v => v > 0).length;
      performanceMetrics.projectsBelowTarget = variances.filter(v => v < 0).length;
      performanceMetrics.projectsOnTarget = variances.filter(v => v === 0).length;
      
      const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;
      performanceMetrics.averageVariancePercentage = totalEstimated > 0 
        ? (avgVariance / (totalEstimated / projectsWithActuals.length)) * 100 
        : 0;
    }

    res.json({
      totalProjects,
      byLifecycle: projectsByLifecycle,
      byType: projectsByType,
      savings: {
        totalEstimated,
        totalActual,
        overallVariance,
        variancePercentage: totalEstimated > 0 ? (overallVariance / totalEstimated) * 100 : 0
      },
      performance: performanceMetrics,
      projectsWithTracking: projectsWithActuals.length
    });
  } catch (error) {
    next(error);
  }
});

export { router as projectRoutes };
