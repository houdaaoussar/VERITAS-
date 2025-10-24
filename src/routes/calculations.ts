import express from 'express';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { CalculationEngine } from '../services/calculationEngine';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const router = express.Router();

const runCalculationSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  periodId: Joi.string().uuid().required(),
  factorLibraryVersion: Joi.string().optional().default('DEFRA-2025.1')
});

router.post('/runs', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = runCalculationSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { customerId, periodId, factorLibraryVersion } = value;

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const calcRunId = await CalculationEngine.runCalculation(customerId, periodId, req.user!.id, factorLibraryVersion);

    res.status(202).json({
      calcRunId,
      status: 'RUNNING',
      message: 'Calculation started successfully'
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        next(createError('Invalid customer, period, or other entity.', 404, 'ENTITY_NOT_FOUND'));
    } else {
        next(error);
    }
  }
});

router.get('/runs', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, periodId, status } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const where: Prisma.CalcRunWhereInput = { customerId: customerId as string };
    if (periodId) where.periodId = periodId as string;
    if (status) where.status = status as string;

    const calcRuns = await prisma.calcRun.findMany({
      where,
      include: {
        period: {
          select: { year: true, quarter: true, fromDate: true, toDate: true }
        },
        requester: {
          select: { email: true }
        },
        _count: {
          select: { emissionResults: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(calcRuns);
  } catch (error) {
    next(error);
  }
});

router.get('/runs/:id/results', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const calcRun = await prisma.calcRun.findUnique({
      where: { id },
    });

    if (!calcRun) {
      throw createError('Calculation run not found', 404, 'CALC_RUN_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== calcRun.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const results = await prisma.emissionResult.findMany({
      where: { calcRunId: id },
      include: {
        activity: {
          include: {
            site: true,
          },
        },
        factor: true,
      },
    });

    const aggregation = results.reduce(
      (acc, result) => {
        const { scope, resultKgCo2e } = result;
        acc.totalEmissions += resultKgCo2e;
        if (scope === 'SCOPE_1') acc.scope1Total += resultKgCo2e;
        if (scope === 'SCOPE_2') acc.scope2Total += resultKgCo2e;
        if (scope === 'SCOPE_3') acc.scope3Total += resultKgCo2e;
        return acc;
      },
      { scope1Total: 0, scope2Total: 0, scope3Total: 0, totalEmissions: 0 }
    );

    res.json({
      calcRun,
      aggregation: { ...aggregation, resultCount: results.length },
      results,
    });
  } catch (error) {
    next(error);
  }
});


// Delete a calculation run
router.delete('/runs/:id', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const calcRun = await prisma.calcRun.findUnique({
      where: { id },
    });

    if (!calcRun) {
      throw createError('Calculation run not found', 404, 'CALC_RUN_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== calcRun.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Manually delete related emission results first due to cascade issues in some DBs
    await prisma.emissionResult.deleteMany({ where: { calcRunId: id } });
    await prisma.calcRun.delete({ where: { id } });

    logger.info('Calculation run deleted', { calcRunId: id, deletedBy: req.user?.id });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      next(createError('Calculation run not found', 404, 'CALC_RUN_NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

// Export calculation results to CSV
router.get('/runs/:id/export.csv', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const calcRun = await prisma.calcRun.findUnique({ where: { id } });

    if (!calcRun) {
      throw createError('Calculation run not found', 404, 'CALC_RUN_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== calcRun.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const results = await prisma.emissionResult.findMany({
      where: { calcRunId: id },
      include: {
        activity: { include: { site: true } },
        factor: true,
      },
    });

    const headers = [
      'Activity ID', 'Activity Type', 'Site', 'Scope',
      'Emission Factor Name', 'Emission Factor Source', 'Quantity',
      'Unit', 'Result (kgCO2e)',
    ];

    const data = results.map(r => [
      r.activity.id,
      r.activity.type,
      r.activity.site?.name || 'N/A',
      r.scope,
      r.factor.sourceName,
      r.factor.sourceVersion,
      r.activity.quantity,
      r.activity.unit,
      r.resultKgCo2e.toFixed(4),
    ]);

    const toCsv = (headers: string[], data: any[][]): string => {
      const escapeField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      };
      const head = headers.map(escapeField).join(',') + '\r\n';
      const body = data.map(row => row.map(escapeField).join(',')).join('\r\n');
      return head + body;
    };

    const csvData = toCsv(headers, data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=calc-run-${id}-export.csv`);
    res.status(200).send(csvData);

  } catch (error) {
    next(error);
  }
});

export const calcRoutes = router;