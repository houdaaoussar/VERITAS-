import { EmissionFactorService } from './emissionFactors';
import { db as prisma } from '../storage/storageAdapter';

export interface EstimationInputData {
  customerId: string;
  reportingPeriodId: string;
  createdBy: string;
  
  // Employee Commuting
  numberOfEmployees?: number;
  avgCommuteKm?: number;
  avgWorkdaysPerYear?: number;
  transportSplitCar?: number;
  transportSplitPublic?: number;
  transportSplitWalk?: number;
  
  // Business Travel
  businessTravelSpendGBP?: number;
  avgFlightDistanceKm?: number;
  numberOfFlights?: number;
  
  // Purchased Goods & Services
  annualSpendGoodsGBP?: number;
  annualSpendServicesGBP?: number;
  
  // Waste
  wasteTonnes?: number;
  wasteRecycledPercent?: number;
  
  // Office/Facility
  officeAreaM2?: number;
  dataCenter?: boolean;
  dataCenterServers?: number;
  
  // Metadata
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

export interface EstimatedEmission {
  category: string;
  scope: string;
  estimatedKgCo2e: number;
  confidenceLevel: string;
  methodology: string;
  inputs: any;
}

export class EstimationService {
  
  /**
   * Calculate estimated emissions for employee commuting
   */
  static async estimateEmployeeCommuting(input: EstimationInputData): Promise<EstimatedEmission | null> {
    if (!input.numberOfEmployees || !input.avgCommuteKm || !input.avgWorkdaysPerYear) {
      return null;
    }

    // Get emission factors
    const carFactor = await EmissionFactorService.getFactorByCategory('CAR', 'UK', 2025);
    const publicTransportFactor = await EmissionFactorService.getFactorByCategory('PUBLIC_TRANSPORT', 'UK', 2025);

    // Default factors if not found in database
    const carEmissionFactor = carFactor?.value || 0.17119; // kg CO2e per km (average car)
    const publicEmissionFactor = publicTransportFactor?.value || 0.10312; // kg CO2e per km (bus)

    // Calculate splits (default to 70% car, 20% public, 10% walk if not provided)
    const carSplit = (input.transportSplitCar || 70) / 100;
    const publicSplit = (input.transportSplitPublic || 20) / 100;
    const walkSplit = (input.transportSplitWalk || 10) / 100;

    // Total commute km per year per employee (round trip)
    const totalKmPerEmployee = input.avgCommuteKm * 2 * input.avgWorkdaysPerYear;

    // Calculate emissions
    const carEmissions = input.numberOfEmployees * totalKmPerEmployee * carSplit * carEmissionFactor;
    const publicEmissions = input.numberOfEmployees * totalKmPerEmployee * publicSplit * publicEmissionFactor;
    const walkEmissions = 0; // Walking has zero emissions

    const totalEmissions = carEmissions + publicEmissions + walkEmissions;

    return {
      category: 'Employee Commuting',
      scope: 'SCOPE_3',
      estimatedKgCo2e: totalEmissions,
      confidenceLevel: input.confidenceLevel || 'MEDIUM',
      methodology: 'Distance-based calculation using DEFRA 2025 emission factors',
      inputs: {
        numberOfEmployees: input.numberOfEmployees,
        avgCommuteKm: input.avgCommuteKm,
        avgWorkdaysPerYear: input.avgWorkdaysPerYear,
        transportSplits: { car: carSplit, public: publicSplit, walk: walkSplit }
      }
    };
  }

  /**
   * Calculate estimated emissions for business travel
   */
  static async estimateBusinessTravel(input: EstimationInputData): Promise<EstimatedEmission | null> {
    if (!input.numberOfFlights && !input.businessTravelSpendGBP) {
      return null;
    }

    let totalEmissions = 0;

    // Method 1: Flight-based calculation
    if (input.numberOfFlights && input.avgFlightDistanceKm) {
      const flightFactor = await EmissionFactorService.getFactorByCategory('FLIGHT', 'UK', 2025);
      const emissionFactor = flightFactor?.value || 0.24587; // kg CO2e per passenger-km (economy, long-haul)
      
      totalEmissions += input.numberOfFlights * input.avgFlightDistanceKm * emissionFactor;
    }

    // Method 2: Spend-based calculation
    if (input.businessTravelSpendGBP) {
      // Spend-based emission factor: approximately 0.5 kg CO2e per £ spent on business travel
      const spendBasedFactor = 0.5;
      totalEmissions += input.businessTravelSpendGBP * spendBasedFactor;
    }

    return {
      category: 'Business Travel',
      scope: 'SCOPE_3',
      estimatedKgCo2e: totalEmissions,
      confidenceLevel: input.confidenceLevel || 'MEDIUM',
      methodology: 'Flight distance and spend-based calculation using DEFRA 2025 factors',
      inputs: {
        numberOfFlights: input.numberOfFlights,
        avgFlightDistanceKm: input.avgFlightDistanceKm,
        businessTravelSpendGBP: input.businessTravelSpendGBP
      }
    };
  }

  /**
   * Calculate estimated emissions for purchased goods and services
   */
  static async estimatePurchasedGoods(input: EstimationInputData): Promise<EstimatedEmission | null> {
    if (!input.annualSpendGoodsGBP && !input.annualSpendServicesGBP) {
      return null;
    }

    // Spend-based emission factors (kg CO2e per £ spent)
    // These are industry averages from DEFRA/BEIS guidance
    const goodsEmissionFactor = 0.43; // kg CO2e per £
    const servicesEmissionFactor = 0.21; // kg CO2e per £

    const goodsEmissions = (input.annualSpendGoodsGBP || 0) * goodsEmissionFactor;
    const servicesEmissions = (input.annualSpendServicesGBP || 0) * servicesEmissionFactor;

    const totalEmissions = goodsEmissions + servicesEmissions;

    return {
      category: 'Purchased Goods and Services',
      scope: 'SCOPE_3',
      estimatedKgCo2e: totalEmissions,
      confidenceLevel: input.confidenceLevel || 'LOW',
      methodology: 'Spend-based calculation using DEFRA economic input-output factors',
      inputs: {
        annualSpendGoodsGBP: input.annualSpendGoodsGBP,
        annualSpendServicesGBP: input.annualSpendServicesGBP
      }
    };
  }

  /**
   * Calculate estimated emissions for waste generated
   */
  static async estimateWaste(input: EstimationInputData): Promise<EstimatedEmission | null> {
    if (!input.wasteTonnes) {
      return null;
    }

    // Emission factors for waste (kg CO2e per tonne)
    const landfillFactor = 467; // kg CO2e per tonne to landfill
    const recyclingFactor = 21; // kg CO2e per tonne recycled
    const incinerationFactor = 21; // kg CO2e per tonne incinerated

    const recycledPercent = (input.wasteRecycledPercent || 30) / 100;
    const landfillPercent = 1 - recycledPercent;

    const recycledEmissions = input.wasteTonnes * recycledPercent * recyclingFactor;
    const landfillEmissions = input.wasteTonnes * landfillPercent * landfillFactor;

    const totalEmissions = recycledEmissions + landfillEmissions;

    return {
      category: 'Waste Generated',
      scope: 'SCOPE_3',
      estimatedKgCo2e: totalEmissions,
      confidenceLevel: input.confidenceLevel || 'MEDIUM',
      methodology: 'Waste treatment method-based calculation using DEFRA 2025 factors',
      inputs: {
        wasteTonnes: input.wasteTonnes,
        wasteRecycledPercent: input.wasteRecycledPercent || 30
      }
    };
  }

  /**
   * Calculate all estimated emissions for a reporting period
   */
  static async calculateAllEstimations(input: EstimationInputData): Promise<EstimatedEmission[]> {
    const estimations: EstimatedEmission[] = [];

    // Employee Commuting
    const commuting = await this.estimateEmployeeCommuting(input);
    if (commuting) estimations.push(commuting);

    // Business Travel
    const businessTravel = await this.estimateBusinessTravel(input);
    if (businessTravel) estimations.push(businessTravel);

    // Purchased Goods & Services
    const purchasedGoods = await this.estimatePurchasedGoods(input);
    if (purchasedGoods) estimations.push(purchasedGoods);

    // Waste
    const waste = await this.estimateWaste(input);
    if (waste) estimations.push(waste);

    return estimations;
  }

  /**
   * Get total estimated emissions
   */
  static getTotalEstimatedEmissions(estimations: EstimatedEmission[]): number {
    return estimations.reduce((total, est) => total + est.estimatedKgCo2e, 0);
  }

  /**
   * Save estimation inputs to database
   */
  static async saveEstimationInput(data: EstimationInputData) {
    return await prisma.estimationInput.upsert({
      where: {
        customerId_reportingPeriodId: {
          customerId: data.customerId,
          reportingPeriodId: data.reportingPeriodId
        }
      },
      update: {
        numberOfEmployees: data.numberOfEmployees,
        avgCommuteKm: data.avgCommuteKm,
        avgWorkdaysPerYear: data.avgWorkdaysPerYear,
        transportSplitCar: data.transportSplitCar,
        transportSplitPublic: data.transportSplitPublic,
        transportSplitWalk: data.transportSplitWalk,
        businessTravelSpendGBP: data.businessTravelSpendGBP,
        avgFlightDistanceKm: data.avgFlightDistanceKm,
        numberOfFlights: data.numberOfFlights,
        annualSpendGoodsGBP: data.annualSpendGoodsGBP,
        annualSpendServicesGBP: data.annualSpendServicesGBP,
        wasteTonnes: data.wasteTonnes,
        wasteRecycledPercent: data.wasteRecycledPercent,
        officeAreaM2: data.officeAreaM2,
        dataCenter: data.dataCenter,
        dataCenterServers: data.dataCenterServers,
        confidenceLevel: data.confidenceLevel,
        notes: data.notes,
        updatedAt: new Date()
      },
      create: {
        customerId: data.customerId,
        reportingPeriodId: data.reportingPeriodId,
        createdBy: data.createdBy,
        numberOfEmployees: data.numberOfEmployees,
        avgCommuteKm: data.avgCommuteKm,
        avgWorkdaysPerYear: data.avgWorkdaysPerYear,
        transportSplitCar: data.transportSplitCar,
        transportSplitPublic: data.transportSplitPublic,
        transportSplitWalk: data.transportSplitWalk,
        businessTravelSpendGBP: data.businessTravelSpendGBP,
        avgFlightDistanceKm: data.avgFlightDistanceKm,
        numberOfFlights: data.numberOfFlights,
        annualSpendGoodsGBP: data.annualSpendGoodsGBP,
        annualSpendServicesGBP: data.annualSpendServicesGBP,
        wasteTonnes: data.wasteTonnes,
        wasteRecycledPercent: data.wasteRecycledPercent,
        officeAreaM2: data.officeAreaM2,
        dataCenter: data.dataCenter,
        dataCenterServers: data.dataCenterServers,
        confidenceLevel: data.confidenceLevel,
        notes: data.notes
      }
    });
  }

  /**
   * Get estimation input for a reporting period
   */
  static async getEstimationInput(customerId: string, reportingPeriodId: string) {
    return await prisma.estimationInput.findUnique({
      where: {
        customerId_reportingPeriodId: {
          customerId,
          reportingPeriodId
        }
      },
      include: {
        customer: true,
        reportingPeriod: true,
        creator: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Delete estimation input
   */
  static async deleteEstimationInput(customerId: string, reportingPeriodId: string) {
    return await prisma.estimationInput.delete({
      where: {
        customerId_reportingPeriodId: {
          customerId,
          reportingPeriodId
        }
      }
    });
  }
}
