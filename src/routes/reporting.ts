import express from 'express';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const router = express.Router();

// Validation schemas
const overviewQuerySchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  periodId: Joi.string().uuid().optional(),
  calcRunId: Joi.string().uuid().optional()
});

const progressQuerySchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  from: Joi.date().optional(),
  to: Joi.date().optional(),
  groupBy: Joi.string().valid('month', 'quarter', 'year').optional().default('quarter')
});

// Get emissions overview/dashboard
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = overviewQuerySchema.validate(req.query);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { customerId, periodId, calcRunId } = req.query as any;

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Build query conditions
    const where: any = {
      calcRun: {
        customerId
      }
    };

    if (periodId) {
      where.calcRun = { ...where.calcRun, periodId };
    }

    if (calcRunId) {
      where.calcRunId = calcRunId;
    } else {
      // Get most recent completed calculation run if no specific run requested
      const latestRun = await prisma.calcRun.findFirst({
        where: {
          customerId: customerId as string,
          status: 'COMPLETED',
          ...(periodId && { periodId })
        },
        orderBy: { completedAt: 'desc' }
      });

      if (latestRun) {
        where.calcRunId = latestRun.id;
      }
    }

    // Get emission results with aggregations
    const emissionResults = await prisma.emissionResult.findMany({
      where,
      include: {
        activity: {
          include: {
            site: {
              select: { id: true, name: true, country: true }
            }
          }
        },
        factor: {
          select: { category: true, sourceName: true, sourceVersion: true }
        },
        calcRun: {
          select: { id: true, createdAt: true, factorLibraryVersion: true }
        }
      },
      orderBy: { resultKgCo2e: 'desc' }
    });

    const scopeTotals = await prisma.emissionResult.groupBy({
      by: ['scope'],
      where,
      _sum: { resultKgCo2e: true },
    });

    // All emission results for detailed view
    const detailedResults = await prisma.emissionResult.findMany({
      where,
      include: {
        activity: {
          include: {
            site: {
              select: { id: true, name: true, country: true }
            }
          }
        },
        factor: {
          select: { category: true, sourceName: true, sourceVersion: true }
        },
        calcRun: {
          select: { id: true, createdAt: true, factorLibraryVersion: true }
        }
      },
      orderBy: { resultKgCo2e: 'desc' }
    });

    // Totals by scope
    const scopeTotalsWithCount = await prisma.emissionResult.groupBy({
      by: ['scope'],
      where,
      _sum: { resultKgCo2e: true },
      _count: { id: true }
    });

    // Calculate totals
    const totalEmissions = scopeTotals.reduce((sum, scope) => sum + (scope._sum?.resultKgCo2e || 0), 0);

    const scopeSummary = {
      scope1: scopeTotals.find(s => s.scope === 'SCOPE_1')?._sum?.resultKgCo2e || 0,
      scope2: scopeTotals.find(s => s.scope === 'SCOPE_2')?._sum?.resultKgCo2e || 0,
      scope3: scopeTotals.find(s => s.scope === 'SCOPE_3')?._sum?.resultKgCo2e || 0,
      total: totalEmissions
    };

    // Get site details for breakdown
    const siteIds = [...new Set(emissionResults.map(r => r.activity.siteId))];
    const sites = await prisma.site.findMany({
      where: { id: { in: siteIds } },
      select: { id: true, name: true, country: true }
    });

    const siteEmissions = sites.map(site => {
      const siteResults = emissionResults.filter(r => r.activity.siteId === site.id);
      const total = siteResults.reduce((sum, r) => sum + r.resultKgCo2e, 0);
      const byScope = {
        scope1: siteResults.filter(r => r.scope === 'SCOPE_1').reduce((sum, r) => sum + r.resultKgCo2e, 0),
        scope2: siteResults.filter(r => r.scope === 'SCOPE_2').reduce((sum, r) => sum + r.resultKgCo2e, 0),
        scope3: siteResults.filter(r => r.scope === 'SCOPE_3').reduce((sum, r) => sum + r.resultKgCo2e, 0)
      };

      return {
        site,
        total,
        byScope,
        percentage: totalEmissions > 0 ? (total / totalEmissions) * 100 : 0
      };
    }).sort((a, b) => b.total - a.total);

    // Activity type breakdown
    const typeEmissions = emissionResults.reduce((acc, result) => {
      const type = result.activity.type;
      if (!acc[type]) {
        acc[type] = { total: 0, count: 0, scope: result.scope };
      }
      acc[type].total += result.resultKgCo2e;
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; scope: string }>);

    const typeBreakdownFormatted = Object.entries(typeEmissions)
      .map(([type, data]) => ({
        type,
        total: data.total,
        count: data.count,
        scope: data.scope,
        percentage: totalEmissions > 0 ? (data.total / totalEmissions) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Get calculation run info
    const calcRunInfo = emissionResults.length > 0 ? emissionResults[0].calcRun : null;

    res.json({
      summary: scopeSummary,
      siteBreakdown: siteEmissions,
      typeBreakdown: typeBreakdownFormatted,
      calcRun: calcRunInfo,
      totalResults: emissionResults.length,
      lastUpdated: calcRunInfo?.createdAt || null
    });
  } catch (error) {
    next(error);
  }
});

// Get emissions progress over time
router.get('/progress', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = progressQuerySchema.validate(req.query);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { customerId, from, to, groupBy } = value;

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Build date filter
    const dateFilter: any = {};
    if (from) dateFilter.gte = from;
    if (to) dateFilter.lte = to;

    // Get completed calculation runs in date range
    const calcRuns = await prisma.calcRun.findMany({
      where: {
        customerId: customerId as string,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { completedAt: dateFilter })
      },
      include: {
        period: {
          select: { year: true, quarter: true, fromDate: true, toDate: true }
        },
        emissionResults: {
          select: {
            scope: true,
            resultKgCo2e: true
          }
        }
      },
      orderBy: { completedAt: 'asc' }
    });

    // Group and aggregate results
    const progressData = calcRuns.map(run => {
      const totals = run.emissionResults.reduce(
        (acc, result) => {
          acc.total += result.resultKgCo2e;
          switch (result.scope) {
            case 'SCOPE_1':
              acc.scope1 += result.resultKgCo2e;
              break;
            case 'SCOPE_2':
              acc.scope2 += result.resultKgCo2e;
              break;
            case 'SCOPE_3':
              acc.scope3 += result.resultKgCo2e;
              break;
          }
          return acc;
        },
        { total: 0, scope1: 0, scope2: 0, scope3: 0 }
      );

      return {
        calcRunId: run.id,
        period: run.period,
        date: run.completedAt,
        emissions: totals,
        resultCount: run.emissionResults.length
      };
    });

    // Calculate trends
    const trends = {
      totalChange: 0,
      scope1Change: 0,
      scope2Change: 0,
      scope3Change: 0
    };

    if (progressData.length >= 2) {
      const latest = progressData[progressData.length - 1];
      const previous = progressData[progressData.length - 2];

      trends.totalChange = latest.emissions.total - previous.emissions.total;
      trends.scope1Change = latest.emissions.scope1 - previous.emissions.scope1;
      trends.scope2Change = latest.emissions.scope2 - previous.emissions.scope2;
      trends.scope3Change = latest.emissions.scope3 - previous.emissions.scope3;
    }

    res.json({
      progress: progressData,
      trends,
      periodCount: progressData.length
    });
  } catch (error) {
    next(error);
  }
});

// Generate CSRD/ESRS E1 compliance report
router.get('/csrd-export', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, periodId, calcRunId } = req.query as any;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Get calculation run
    let targetCalcRun;
    if (calcRunId) {
      targetCalcRun = await prisma.calcRun.findUnique({
        where: { id: calcRunId as string }
      });
    } else {
      targetCalcRun = await prisma.calcRun.findFirst({
        where: {
          customerId: customerId as string,
          status: 'COMPLETED',
          ...(periodId && { periodId: periodId as string })
        },
        orderBy: { completedAt: 'desc' }
      });
    }

    if (!targetCalcRun) {
      throw createError('No completed calculation run found', 404, 'NO_CALC_RUN');
    }

    // Get detailed results
    const results = await prisma.emissionResult.findMany({
      where: { calcRunId: targetCalcRun.id },
      include: {
        activity: {
          include: {
            site: true
          }
        },
        factor: true
      }
    });

    // Calculate CSRD/ESRS E1 required metrics
    const scope1Total = results.filter(r => r.scope === 'SCOPE_1').reduce((sum, r) => sum + r.resultKgCo2e, 0);
    const scope2Total = results.filter(r => r.scope === 'SCOPE_2').reduce((sum, r) => sum + r.resultKgCo2e, 0);
    const scope3Total = results.filter(r => r.scope === 'SCOPE_3').reduce((sum, r) => sum + r.resultKgCo2e, 0);
    const totalEmissions = scope1Total + scope2Total + scope3Total;

    // CSRD E1 format
    const csrdReport = {
      reportingPeriod: periodId || 'N/A',
      organizationName: 'Customer Organization', // Should come from customer data
      reportDate: new Date().toISOString().split('T')[0],

      // E1-1: Transition plan for climate change mitigation
      transitionPlan: {
        scope1Emissions: (scope1Total / 1000).toFixed(3), // Convert to tonnes
        scope2Emissions: (scope2Total / 1000).toFixed(3),
        scope3Emissions: (scope3Total / 1000).toFixed(3),
        totalEmissions: (totalEmissions / 1000).toFixed(3)
      },

      // E1-6: Gross Scopes 1, 2, 3 and Total GHG emissions
      ghgEmissions: {
        scope1: {
          total: (scope1Total / 1000).toFixed(3),
          methodology: 'GHG Protocol Corporate Standard',
          uncertaintyAssessment: 'Low'
        },
        scope2: {
          total: (scope2Total / 1000).toFixed(3),
          methodology: 'Location-based method',
          uncertaintyAssessment: 'Low'
        },
        scope3: {
          total: (scope3Total / 1000).toFixed(3),
          methodology: 'Spend-based and activity-based methods',
          uncertaintyAssessment: 'Medium',
          categories: 'Business travel, purchased goods and services'
        }
      },

      // Calculation methodology
      methodology: {
        standard: 'GHG Protocol Corporate Accounting and Reporting Standard',
        factorSources: [...new Set(results.map(r => `${r.factor.sourceName} ${r.factor.sourceVersion}`))],
        gwpVersion: results[0]?.factor.gwpVersion || 'AR6',
        calculationApproach: 'Deterministic calculation using published emission factors'
      },

      // Data quality and verification
      dataQuality: {
        factorLibraryVersion: targetCalcRun.factorLibraryVersion,
        calculationDate: targetCalcRun.completedAt?.toISOString().split('T')[0],
        totalActivities: results.length,
        verificationStatus: 'Internal calculation - audit ready'
      }
    };

    res.json(csrdReport);
  } catch (error) {
    next(error);
  }
});

// Export detailed emissions data
router.get('/export', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, periodId, calcRunId, format = 'csv' } = req.query as any;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Get calculation run and results (reuse logic from calc routes)
    const where: any = {
      calcRun: { customerId: customerId as string }
    };

    if (calcRunId) {
      where.calcRunId = calcRunId as string;
    } else if (periodId) {
      where.calcRun = { ...where.calcRun, periodId: periodId as string };
    }

    const results = await prisma.emissionResult.findMany({
      where,
      include: {
        activity: {
          include: {
            site: true
          }
        },
        factor: true,
        calcRun: true
      },
      orderBy: [
        { scope: 'asc' },
        { resultKgCo2e: 'desc' }
      ]
    });

    if (results.length === 0) {
      throw createError('No emission results found', 404, 'NO_RESULTS');
    }

    if (format === 'json') {
      res.json(results);
      return;
    }

    // Generate CSV export
    const headers = [
      'Site Name',
      'Site Country',
      'Activity Type',
      'Activity Date Start',
      'Activity Date End',
      'Quantity',
      'Unit',
      'Emission Scope',
      'CO2e (kg)',
      'CO2e (tonnes)',
      'Emission Factor Source',
      'Factor Version',
      'Calculation Date'
    ];

    const csvRows = [headers.join(',')];

    results.forEach(result => {
      const row = [
        `"${result.activity.site.name}"`,
        result.activity.site.country,
        result.activity.type,
        result.activity.activityDateStart.toISOString().split('T')[0],
        result.activity.activityDateEnd.toISOString().split('T')[0],
        result.activity.quantity,
        result.activity.unit,
        result.scope.replace('SCOPE_', 'Scope '),
        result.resultKgCo2e.toFixed(3),
        (result.resultKgCo2e / 1000).toFixed(6),
        `"${result.factor.sourceName}"`,
        result.factor.sourceVersion,
        result.calcRun.completedAt?.toISOString().split('T')[0] || 'N/A'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="emissions_report_${customerId}.csv"`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
});

// Get detailed emissions report for all scopes
router.get('/detailed-report', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId, periodId, calcRunId } = req.query as any;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const where: Prisma.EmissionResultWhereInput = {};

    if (calcRunId) {
      where.calcRunId = calcRunId as string;
    } else {
      const calcRunWhere: Prisma.CalcRunWhereInput = {
        customerId: customerId as string,
      };
      if (periodId) {
        calcRunWhere.periodId = periodId as string;
      }
      where.calcRun = calcRunWhere;
    }

    const results = await prisma.emissionResult.findMany({
      where,
      include: {
        activity: true,
        factor: true,
      },
    });

    const report = {
      scope1: results.filter(r => r.scope === 'SCOPE_1').map(r => ({
        emissionSource: r.activity.type,
        activityData: r.activity.quantity,
        unit: r.activity.unit,
        emissionFactor: r.factor.value,
        source: r.factor.sourceName,
        co2e: r.resultKgCo2e / 1000, // convert to tonnes
      })),
      scope2: results.filter(r => r.scope === 'SCOPE_2').map(r => ({
        emissionSource: r.activity.type,
        activityData: r.activity.quantity,
        unit: r.activity.unit,
        emissionFactor: r.factor.value,
        source: r.factor.sourceName,
        co2e: r.resultKgCo2e / 1000,
      })),
      scope3: results.filter(r => r.scope === 'SCOPE_3').map(r => ({
        ghgCategory: r.factor.category, // Assuming factor category maps to GHG category
        methodology: 'Tier 1: Spend-based', // Placeholder
        activityData: r.activity.quantity,
        unit: r.activity.unit,
        emissionFactor: r.factor.value,
        source: r.factor.sourceName,
        co2e: r.resultKgCo2e / 1000,
      })),
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
});

export { router as reportingRoutes };
