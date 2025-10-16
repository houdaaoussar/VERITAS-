import { Prisma, PrismaClient, Activity, EmissionFactor } from '@prisma/client';
import { EmissionFactorService } from './emissionFactors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CalculationResult {
  activityId: string;
  scope: string;
  method: string;
  quantityBase: number;
  unitBase: string;
  factorId: string;
  resultKgCo2e: number;
  uncertainty?: number;
}

export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
}

export class CalculationEngine {
  
  // Unit conversion factors
  private static readonly UNIT_CONVERSIONS: UnitConversion[] = [
    // Energy conversions
    { from: 'MWh', to: 'kWh', factor: 1000 },
    { from: 'GWh', to: 'kWh', factor: 1000000 },
    { from: 'GJ', to: 'kWh', factor: 277.778 },
    { from: 'MJ', to: 'kWh', factor: 0.277778 },
    { from: 'therms', to: 'kWh', factor: 29.3071 },
    
    // Volume conversions
    { from: 'm3', to: 'litres', factor: 1000 },
    { from: 'gallons', to: 'litres', factor: 4.546 },
    { from: 'US_gallons', to: 'litres', factor: 3.785 },
    
    // Mass conversions
    { from: 'tonnes', to: 'kg', factor: 1000 },
    { from: 'g', to: 'kg', factor: 0.001 },
    { from: 'lbs', to: 'kg', factor: 0.453592 },
    
    // Distance conversions
    { from: 'miles', to: 'km', factor: 1.609344 },
    { from: 'm', to: 'km', factor: 0.001 },
    
    // Currency (placeholder - should be updated with real exchange rates)
    { from: 'USD', to: 'GBP', factor: 0.79 },
    { from: 'EUR', to: 'GBP', factor: 0.86 }
  ];

  // Convert units to base units expected by emission factors
  private static convertUnit(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value;
    
    const conversion = this.UNIT_CONVERSIONS.find(
      c => c.from.toLowerCase() === fromUnit.toLowerCase() && c.to.toLowerCase() === toUnit.toLowerCase()
    );
    
    if (conversion) {
      return value * conversion.factor;
    }
    
    // Try reverse conversion
    const reverseConversion = this.UNIT_CONVERSIONS.find(
      c => c.to.toLowerCase() === fromUnit.toLowerCase() && c.from.toLowerCase() === toUnit.toLowerCase()
    );
    
    if (reverseConversion) {
      return value / reverseConversion.factor;
    }
    
    throw new Error(`No conversion available from ${fromUnit} to ${toUnit}`);
  }

  // Determine emission scope based on activity type
  private static determineScope(activityType: string): string {
    const scope1Activities = [
      'NATURAL_GAS', 'LPG', 'DIESEL', 'PETROL', 'COAL', 'FUEL_OIL',
      'REFRIGERANTS', 'PROCESS_EMISSIONS', 'FUGITIVE_EMISSIONS'
    ];
    
    const scope2Activities = [
      'ELECTRICITY', 'HEAT_STEAM', 'COOLING'
    ];
    
    if (scope1Activities.some(activity => activityType.toUpperCase().includes(activity))) {
      return 'SCOPE_1';
    }
    
    if (scope2Activities.some(activity => activityType.toUpperCase().includes(activity))) {
      return 'SCOPE_2';
    }
    
    return 'SCOPE_3';
  }

  // Map activity type to emission factor category
  private static mapActivityToCategory(activityType: string): string {
    const mappings: Record<string, string> = {
      'ELECTRICITY': 'ELECTRICITY_GRID',
      'NATURAL_GAS': 'NATURAL_GAS',
      'DIESEL': 'DIESEL',
      'PETROL': 'PETROL',
      'LPG': 'LPG',
      'BUSINESS_TRAVEL': 'BUSINESS_TRAVEL_AIR',
      'WASTE': 'WASTE_LANDFILL',
      'WATER': 'WATER_SUPPLY',
      'OTHER': 'OTHER'
    };
    
    return mappings[activityType] || activityType;
  }

  // Calculate emissions for a single activity
  static async calculateActivity(
    activity: Activity,
    siteCountry: string = 'UK'
  ): Promise<CalculationResult> {
    
    const category = this.mapActivityToCategory(activity.type);
    const scope = this.determineScope(activity.type);
    
    // Find appropriate emission factor
    const factor = await EmissionFactorService.findFactor(
      category,
      siteCountry,
      activity.activityDateStart.getFullYear(),
      activity.unit
    );
    
    if (!factor) {
      throw new Error(
        `No emission factor found for ${category}, ${siteCountry}, ${activity.unit}`
      );
    }
    
    // Convert activity quantity to factor's input unit if needed
    let quantityBase = activity.quantity;
    let unitBase = activity.unit;
    
    if (activity.unit !== factor.inputUnit) {
      quantityBase = this.convertUnit(activity.quantity, activity.unit, factor.inputUnit);
      unitBase = factor.inputUnit;
    }
    
    // Calculate emissions
    const resultKgCo2e = quantityBase * factor.value;
    
    // Determine calculation method
    let method = 'DETERMINISTIC';
    if (scope === 'SCOPE_3') {
      method = factor.sourceName.includes('spend') ? 'SPEND_BASED' : 'ACTIVITY_BASED';
    }
    
    logger.info('Activity calculation completed', {
      activityId: activity.id,
      activityType: activity.type,
      quantity: activity.quantity,
      unit: activity.unit,
      quantityBase,
      unitBase,
      factorValue: factor.value,
      resultKgCo2e,
      factorId: factor.id,
      scope
    });
    
    return {
      activityId: activity.id,
      scope,
      method,
      quantityBase,
      unitBase,
      factorId: factor.id,
      resultKgCo2e,
      uncertainty: scope === 'SCOPE_3' ? 0.3 : 0.1 // Higher uncertainty for Scope 3
    };
  }

  // Run calculation for all activities in a reporting period
  static async runCalculation(
    customerId: string,
    periodId: string,
    requestedBy: string,
    factorLibraryVersion: string = 'DEFRA-2025.1'
  ): Promise<string> {
    
    // Create calculation run record
    const calcRun = await prisma.calcRun.create({
      data: {
        customerId,
        periodId,
        factorLibraryVersion,
        requestedBy,
        status: 'RUNNING'
      }
    });
    
    try {
      // Get all activities for the period
      const activities = await prisma.activity.findMany({
        where: {
          periodId,
          site: { customerId }
        },
        include: {
          site: true
        }
      });
      
      if (activities.length === 0) {
        await prisma.calcRun.update({
          where: { id: calcRun.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            errorMessage: 'No activities found for calculation'
          }
        });
        return calcRun.id;
      }
      
      const results: CalculationResult[] = [];
      const errors: string[] = [];
      
      // Calculate emissions for each activity
      for (const activity of activities) {
        try {
          const result = await this.calculateActivity(activity, activity.site.country);
          results.push(result);
        } catch (error) {
          const errorMsg = `Activity ${activity.id}: ${(error as Error).message}`;
          errors.push(errorMsg);
          logger.error('Activity calculation failed', {
            activityId: activity.id,
            error: (error as Error).message,
            calcRunId: calcRun.id
          });
        }
      }
      
      // Save results to database
      if (results.length > 0) {
        await prisma.emissionResult.createMany({
          data: results.map(result => ({
            calcRunId: calcRun.id,
            ...result
          }))
        });
      }
      
      // Update calculation run status
      const status = errors.length === activities.length ? 
        'FAILED' : 'COMPLETED';
      
      await prisma.calcRun.update({
        where: { id: calcRun.id },
        data: {
          status,
          completedAt: new Date(),
          errorMessage: errors.length > 0 ? errors.join('; ') : null
        }
      });
      
      logger.info('Calculation run completed', {
        calcRunId: calcRun.id,
        totalActivities: activities.length,
        successfulCalculations: results.length,
        errors: errors.length,
        status
      });
      
      return calcRun.id;
      
    } catch (error) {
      // Update calculation run with error status
      await prisma.calcRun.update({
        where: { id: calcRun.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: (error as Error).message
        }
      });
      
      logger.error('Calculation run failed', {
        calcRunId: calcRun.id,
        error: (error as Error).message
      });
      
      throw error;
    }
  }

  // Get calculation results with aggregation
  static async getCalculationResults(calcRunId: string) {
    const calcRun = await prisma.calcRun.findUnique({
      where: { id: calcRunId },
      include: {
        emissionResults: {
          include: {
            activity: {
              include: {
                site: true
              }
            },
            factor: true
          }
        }
      }
    });
    
    if (!calcRun) {
      throw new Error('Calculation run not found');
    }
    
    // Aggregate results by scope
    const aggregation = {
      scope1Total: 0,
      scope2Total: 0,
      scope3Total: 0,
      totalEmissions: 0,
      resultCount: calcRun.emissionResults.length
    };
    
    calcRun.emissionResults.forEach(result => {
      switch (result.scope) {
        case 'SCOPE_1':
          aggregation.scope1Total += result.resultKgCo2e;
          break;
        case 'SCOPE_2':
          aggregation.scope2Total += result.resultKgCo2e;
          break;
        case 'SCOPE_3':
          aggregation.scope3Total += result.resultKgCo2e;
          break;
      }
      aggregation.totalEmissions += result.resultKgCo2e;
    });
    
    return {
      calcRun,
      aggregation,
      results: calcRun.emissionResults
    };
  }

  // Validate activity data before calculation
  static validateActivityData(activity: Partial<Activity>): string[] {
    const errors: string[] = [];
    
    if (!activity.quantity || activity.quantity <= 0) {
      errors.push('Quantity must be positive');
    }
    
    if (!activity.unit || activity.unit.trim() === '') {
      errors.push('Unit is required');
    }
    
    if (!activity.type) {
      errors.push('Activity type is required');
    }
    
    if (!activity.activityDateStart) {
      errors.push('Activity start date is required');
    }
    
    if (!activity.activityDateEnd) {
      errors.push('Activity end date is required');
    }
    
    if (activity.activityDateStart && activity.activityDateEnd && 
        activity.activityDateStart > activity.activityDateEnd) {
      errors.push('Start date must be before end date');
    }
    
    return errors;
  }
}
