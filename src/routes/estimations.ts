import express from 'express';
import { EstimationService, EstimationInputData } from '../services/estimationService';

const router = express.Router();

/**
 * GET /api/estimations/:customerId/:periodId
 * Get estimation input for a reporting period
 */
router.get('/:customerId/:periodId', async (req, res) => {
  try {
    const { customerId, periodId } = req.params;

    const estimationInput = await EstimationService.getEstimationInput(customerId, periodId);

    if (!estimationInput) {
      return res.status(404).json({
        error: 'Estimation input not found',
        message: 'No estimation data exists for this reporting period'
      });
    }

    res.json(estimationInput);
  } catch (error: any) {
    console.error('Error fetching estimation input:', error);
    res.status(500).json({
      error: 'Failed to fetch estimation input',
      message: error.message
    });
  }
});

/**
 * POST /api/estimations
 * Create or update estimation input
 */
router.post('/', async (req, res) => {
  try {
    const data: EstimationInputData = req.body;

    // Validate required fields
    if (!data.customerId || !data.reportingPeriodId || !data.createdBy) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'customerId, reportingPeriodId, and createdBy are required'
      });
    }

    // Validate percentage fields (0-100)
    const percentageFields = [
      'transportSplitCar',
      'transportSplitPublic',
      'transportSplitWalk',
      'wasteRecycledPercent'
    ];

    for (const field of percentageFields) {
      const value = (data as any)[field];
      if (value !== undefined && value !== null && (value < 0 || value > 100)) {
        return res.status(400).json({
          error: 'Invalid percentage value',
          message: `${field} must be between 0 and 100`
        });
      }
    }

    // Validate transport split sums to 100 (if all provided)
    if (data.transportSplitCar !== undefined && 
        data.transportSplitPublic !== undefined && 
        data.transportSplitWalk !== undefined) {
      const total = (data.transportSplitCar || 0) + 
                    (data.transportSplitPublic || 0) + 
                    (data.transportSplitWalk || 0);
      if (Math.abs(total - 100) > 0.01) {
        return res.status(400).json({
          error: 'Invalid transport split',
          message: 'Transport mode percentages must sum to 100'
        });
      }
    }

    // Save estimation input
    const savedInput = await EstimationService.saveEstimationInput(data);

    res.status(201).json({
      message: 'Estimation input saved successfully',
      data: savedInput
    });
  } catch (error: any) {
    console.error('Error saving estimation input:', error);
    res.status(500).json({
      error: 'Failed to save estimation input',
      message: error.message
    });
  }
});

/**
 * POST /api/estimations/:customerId/:periodId/calculate
 * Calculate estimated emissions based on input data
 */
router.post('/:customerId/:periodId/calculate', async (req, res) => {
  try {
    const { customerId, periodId } = req.params;

    // Get estimation input
    const estimationInput = await EstimationService.getEstimationInput(customerId, periodId);

    if (!estimationInput) {
      return res.status(404).json({
        error: 'Estimation input not found',
        message: 'Please provide estimation data first'
      });
    }

    // Calculate all estimations
    // Cast the database result to match the interface
    const estimations = await EstimationService.calculateAllEstimations(estimationInput as any);

    // Get total
    const totalEmissions = EstimationService.getTotalEstimatedEmissions(estimations);

    res.json({
      estimations,
      totalKgCo2e: totalEmissions,
      totalTonnesCo2e: totalEmissions / 1000,
      metadata: {
        customerId,
        reportingPeriodId: periodId,
        calculatedAt: new Date().toISOString(),
        numberOfCategories: estimations.length
      }
    });
  } catch (error: any) {
    console.error('Error calculating estimations:', error);
    res.status(500).json({
      error: 'Failed to calculate estimations',
      message: error.message
    });
  }
});

/**
 * DELETE /api/estimations/:customerId/:periodId
 * Delete estimation input
 */
router.delete('/:customerId/:periodId', async (req, res) => {
  try {
    const { customerId, periodId } = req.params;

    await EstimationService.deleteEstimationInput(customerId, periodId);

    res.json({
      message: 'Estimation input deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting estimation input:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Estimation input not found',
        message: 'No estimation data exists for this reporting period'
      });
    }

    res.status(500).json({
      error: 'Failed to delete estimation input',
      message: error.message
    });
  }
});

/**
 * GET /api/estimations/:customerId/:periodId/preview
 * Preview estimated emissions without saving
 */
router.post('/:customerId/:periodId/preview', async (req, res) => {
  try {
    const { customerId, periodId } = req.params;
    const data: EstimationInputData = {
      ...req.body,
      customerId,
      reportingPeriodId: periodId
    };

    // Calculate estimations without saving
    const estimations = await EstimationService.calculateAllEstimations(data);
    const totalEmissions = EstimationService.getTotalEstimatedEmissions(estimations);

    res.json({
      estimations,
      totalKgCo2e: totalEmissions,
      totalTonnesCo2e: totalEmissions / 1000,
      preview: true,
      message: 'This is a preview. Use POST /api/estimations to save the data.'
    });
  } catch (error: any) {
    console.error('Error previewing estimations:', error);
    res.status(500).json({
      error: 'Failed to preview estimations',
      message: error.message
    });
  }
});

export { router as estimationRoutes };
