/**
 * Storage Adapter
 * 
 * This adapter provides a unified interface for data storage.
 * It can use either in-memory storage or database (Prisma).
 * 
 * Switch between storage modes by setting USE_DATABASE environment variable.
 */

import { storage } from './inMemoryStorage';
import type {
  Customer,
  Site,
  ReportingPeriod,
  Activity,
  Upload,
  EmissionFactor,
  EmissionResult,
  CalculationRun,
  User
} from './inMemoryStorage';

const USE_DATABASE = process.env.USE_DATABASE === 'true';

/**
 * Storage Adapter
 * Provides a unified interface that works with both in-memory storage and database
 */
export const db = {
  // Customer operations
  customer: {
    create: async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        // TODO: Use Prisma when database is ready
        // return await prisma.customer.create({ data });
        throw new Error('Database not configured');
      }
      return storage.createCustomer(data);
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        // TODO: Use Prisma when database is ready
        // return await prisma.customer.findUnique({ where });
        throw new Error('Database not configured');
      }
      return storage.findCustomer(where.id);
    },
    
    findMany: async (where?: { customerId?: string }) => {
      if (USE_DATABASE) {
        // TODO: Use Prisma when database is ready
        // return await prisma.customer.findMany({ where });
        throw new Error('Database not configured');
      }
      return storage.findAllCustomers();
    },
    
    update: async (where: { id: string }, data: Partial<Customer>) => {
      if (USE_DATABASE) {
        // TODO: Use Prisma when database is ready
        // return await prisma.customer.update({ where, data });
        throw new Error('Database not configured');
      }
      return storage.updateCustomer(where.id, data);
    },
    
    delete: async (where: { id: string }) => {
      if (USE_DATABASE) {
        // TODO: Use Prisma when database is ready
        // return await prisma.customer.delete({ where });
        throw new Error('Database not configured');
      }
      return storage.deleteCustomer(where.id);
    }
  },

  // Site operations
  site: {
    create: async (data: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createSite(data);
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findSite(where.id);
    },
    
    findFirst: async (where: { customerId: string; name: { equals: string; mode: string } }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findSiteByName(where.customerId, where.name.equals);
    },
    
    findMany: async (where?: { customerId?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where?.customerId) {
        return storage.findSitesByCustomer(where.customerId);
      }
      return [];
    },
    
    update: async (where: { id: string }, data: Partial<Site>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.updateSite(where.id, data);
    },
    
    delete: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.deleteSite(where.id);
    }
  },

  // Reporting Period operations
  reportingPeriod: {
    create: async (data: Omit<ReportingPeriod, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createPeriod(data);
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findPeriod(where.id);
    },
    
    findMany: async (where?: { customerId?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where?.customerId) {
        return storage.findPeriodsByCustomer(where.customerId);
      }
      return [];
    },
    
    update: async (where: { id: string }, data: Partial<ReportingPeriod>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.updatePeriod(where.id, data);
    },
    
    delete: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.deletePeriod(where.id);
    }
  },

  // Activity operations
  activity: {
    create: async (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createActivity(data);
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findActivity(where.id);
    },
    
    findMany: async (where?: { periodId?: string; siteId?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where?.periodId) {
        return storage.findActivitiesByPeriod(where.periodId);
      }
      if (where?.siteId) {
        return storage.findActivitiesBySite(where.siteId);
      }
      return [];
    },
    
    update: async (where: { id: string }, data: Partial<Activity>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.updateActivity(where.id, data);
    },
    
    delete: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.deleteActivity(where.id);
    }
  },

  // Upload operations
  upload: {
    create: async (data: Omit<Upload, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createUpload(data);
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findUpload(where.id);
    },
    
    findMany: async (where?: { customerId?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where?.customerId) {
        return storage.findUploadsByCustomer(where.customerId);
      }
      return [];
    },
    
    update: async (where: { id: string }, data: Partial<Upload>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.updateUpload(where.id, data);
    }
  },

  // Emission Factor operations
  emissionFactor: {
    findMany: async (where?: { category?: { contains: string; mode?: string }; geography?: string; year?: number; scope?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findEmissionFactors({
        category: where?.category?.contains,
        geography: where?.geography,
        year: where?.year,
        scope: where?.scope
      });
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findEmissionFactor(where.id);
    }
  },

  // Calculation Run operations
  calculationRun: {
    create: async (data: Omit<CalculationRun, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createCalculationRun(data);
    },
    
    findUnique: async (where: { id: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.findCalculationRun(where.id);
    },
    
    findMany: async (where?: { customerId?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where?.customerId) {
        return storage.findCalculationRunsByCustomer(where.customerId);
      }
      return [];
    },
    
    update: async (where: { id: string }, data: Partial<CalculationRun>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.updateCalculationRun(where.id, data);
    }
  },

  // Emission Result operations
  emissionResult: {
    create: async (data: Omit<EmissionResult, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createEmissionResult(data);
    },
    
    findMany: async (where?: { calcRunId?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where?.calcRunId) {
        return storage.findEmissionResultsByRun(where.calcRunId);
      }
      return [];
    }
  },

  // User operations
  user: {
    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      return storage.createUser(data);
    },
    
    findUnique: async (where: { id?: string; email?: string }) => {
      if (USE_DATABASE) {
        throw new Error('Database not configured');
      }
      if (where.id) {
        return storage.findUser(where.id);
      }
      if (where.email) {
        return storage.findUserByEmail(where.email);
      }
      return undefined;
    }
  }
};

// Export storage utilities
export const storageUtils = {
  exportData: () => storage.exportData(),
  importData: (data: ReturnType<typeof storage.exportData>) => storage.importData(data),
  clearAll: () => storage.clearAll()
};
