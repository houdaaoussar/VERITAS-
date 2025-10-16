import { PrismaClient, EmissionFactor } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface EmissionFactorData {
  category: string;
  geography: string;
  year: number;
  inputUnit: string;
  outputUnit: string;
  value: number;
  sourceName: string;
  sourceVersion: string;
  gwpVersion: string;
}

export class EmissionFactorService {
  
  // Seed default emission factors based on DEFRA 2025 and other sources
  static async seedDefaultFactors(): Promise<void> {
    const defaultFactors: EmissionFactorData[] = [
      // Scope 1 - Stationary Combustion
      {
        category: 'NATURAL_GAS',
        geography: 'UK',
        year: 2025,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        value: 0.0002027,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      {
        category: 'LPG',
        geography: 'UK',
        year: 2025,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        value: 0.00023032,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 1 - Mobile Combustion
      {
        category: 'DIESEL',
        geography: 'UK',
        year: 2025,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        value: 0.000239,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      {
        category: 'PETROL',
        geography: 'UK',
        year: 2025,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        value: 0.000227,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 1 - Refrigerants
      {
        category: 'REFRIGERANTS_R134A',
        geography: 'GLOBAL',
        year: 2025,
        inputUnit: 'kg',
        outputUnit: 'kgCO2e',
        value: 1430,
        sourceName: 'IPCC',
        sourceVersion: '2014',
        gwpVersion: 'AR5'
      },
      
      // Scope 2 - Electricity
      {
        category: 'ELECTRICITY_GRID',
        geography: 'UK',
        year: 2025,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        value: 0.000177,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 2 - Heat/Steam
      {
        category: 'HEAT_STEAM',
        geography: 'UK',
        year: 2025,
        inputUnit: 'GJ',
        outputUnit: 'kgCO2e',
        value: 0.03,
        sourceName: 'Supplier-Specific',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 3 - Business Travel
      {
        category: 'BUSINESS_TRAVEL_AIR',
        geography: 'UK',
        year: 2025,
        inputUnit: 'passenger-km',
        outputUnit: 'kgCO2e',
        value: 0.000106,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      {
        category: 'BUSINESS_TRAVEL_RAIL',
        geography: 'UK',
        year: 2025,
        inputUnit: 'passenger-km',
        outputUnit: 'kgCO2e',
        value: 0.000041,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 3 - Spend-based factors
      {
        category: 'PURCHASED_GOODS_SERVICES',
        geography: 'UK',
        year: 2025,
        inputUnit: 'GBP',
        outputUnit: 'kgCO2e',
        value: 0.0001,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      {
        category: 'CAPITAL_GOODS',
        geography: 'UK',
        year: 2025,
        inputUnit: 'GBP',
        outputUnit: 'kgCO2e',
        value: 0.00005,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      {
        category: 'UPSTREAM_TRANSPORT',
        geography: 'UK',
        year: 2025,
        inputUnit: 'GBP',
        outputUnit: 'kgCO2e',
        value: 0.00009,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 3 - Fuel and Energy Related Activities
      {
        category: 'FUEL_ENERGY_RELATED',
        geography: 'UK',
        year: 2025,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        value: 0.00002315,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      },
      
      // Scope 3 - Waste
      {
        category: 'WASTE_LANDFILL',
        geography: 'UK',
        year: 2025,
        inputUnit: 'tonne',
        outputUnit: 'kgCO2e',
        value: 200,
        sourceName: 'DESNZ',
        sourceVersion: '2025',
        gwpVersion: 'AR6'
      }
    ];

    for (const factorData of defaultFactors) {
      try {
        const existingFactor = await prisma.emissionFactor.findFirst({
          where: {
            category: factorData.category,
            geography: factorData.geography,
            year: factorData.year,
            sourceName: factorData.sourceName,
            sourceVersion: factorData.sourceVersion
          }
        });

        if (!existingFactor) {
          await prisma.emissionFactor.create({
            data: {
              ...factorData,
              validFrom: new Date(`${factorData.year}-01-01`),
              validTo: new Date(`${factorData.year}-12-31`)
            }
          });
          
          logger.info('Emission factor seeded', { 
            category: factorData.category,
            geography: factorData.geography,
            year: factorData.year
          });
        }
      } catch (error) {
        logger.error('Failed to seed emission factor', { 
          error: (error as Error).message,
          factorData 
        });
      }
    }
  }

  // Find appropriate emission factor for calculation
  static async findFactor(
    category: string,
    geography: string = 'UK',
    year: number = new Date().getFullYear(),
    inputUnit: string
  ): Promise<EmissionFactor | null> {
    
    // Try exact match first
    let factor = await prisma.emissionFactor.findFirst({
      where: {
        category,
        geography,
        year,
        inputUnit,
        validFrom: { lte: new Date() },
        OR: [
          { validTo: null },
          { validTo: { gte: new Date() } }
        ]
      },
      orderBy: { year: 'desc' }
    });

    // If no exact match, try with global geography
    if (!factor && geography !== 'GLOBAL') {
      factor = await prisma.emissionFactor.findFirst({
        where: {
          category,
          geography: 'GLOBAL',
          year,
          inputUnit,
          validFrom: { lte: new Date() },
          OR: [
            { validTo: null },
            { validTo: { gte: new Date() } }
          ]
        },
        orderBy: { year: 'desc' }
      });
    }

    // If still no match, try most recent year for same category/geography
    if (!factor) {
      factor = await prisma.emissionFactor.findFirst({
        where: {
          category,
          geography,
          inputUnit,
          validFrom: { lte: new Date() },
          OR: [
            { validTo: null },
            { validTo: { gte: new Date() } }
          ]
        },
        orderBy: { year: 'desc' }
      });
    }

    return factor;
  }

  // Get all available factors with filtering
  static async getFactors(filters?: {
    category?: string;
    geography?: string;
    year?: number;
    sourceName?: string;
  }): Promise<EmissionFactor[]> {
    return prisma.emissionFactor.findMany({
      where: filters,
      orderBy: [
        { category: 'asc' },
        { geography: 'asc' },
        { year: 'desc' }
      ]
    });
  }

  // Create new emission factor
  static async createFactor(factorData: EmissionFactorData): Promise<EmissionFactor> {
    return prisma.emissionFactor.create({
      data: {
        ...factorData,
        validFrom: new Date(`${factorData.year}-01-01`),
        validTo: new Date(`${factorData.year}-12-31`)
      }
    });
  }

  // Update emission factor (creates new version, doesn't modify existing)
  static async updateFactor(
    id: string, 
    updates: Partial<EmissionFactorData>
  ): Promise<EmissionFactor> {
    const existingFactor = await prisma.emissionFactor.findUnique({
      where: { id }
    });

    if (!existingFactor) {
      throw new Error('Emission factor not found');
    }

    // Create new version instead of updating existing
    return prisma.emissionFactor.create({
      data: {
        ...existingFactor,
        ...updates,
        validFrom: new Date(),
        validTo: null
      }
    });
  }
}
