/**
 * In-Memory Storage
 * 
 * This module provides an in-memory storage solution that mimics database behavior.
 * Data is stored in memory and will be lost when the server restarts.
 * 
 * Later, this can be easily replaced with a real database (Prisma/MongoDB).
 */

import { v4 as uuidv4 } from 'uuid';

// Type definitions matching database schema
export interface Customer {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  country?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportingPeriod {
  id: string;
  customerId: string;
  name: string;
  year: number;
  quarter?: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  siteId: string;
  periodId: string;
  type: string;
  quantity: number;
  unit: string;
  activityDateStart: Date;
  activityDateEnd: Date;
  source?: string;
  uploadId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Upload {
  id: string;
  customerId: string;
  periodId: string;
  originalFilename: string;
  filename: string;
  uploadedBy: string;
  status: string;
  errorCount: number;
  validationResults?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionFactor {
  id: string;
  category: string;
  geography: string;
  year: number;
  scope: string;
  unit: string;
  kgCo2ePerUnit: number;
  sourceName: string;
  sourceVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionResult {
  id: string;
  activityId: string;
  calcRunId: string;
  scope: string;
  factorId: string;
  resultKgCo2e: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalculationRun {
  id: string;
  customerId: string;
  periodId: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  totalEmissions?: number;
  scope1Total?: number;
  scope2Total?: number;
  scope3Total?: number;
  resultCount?: number;
  errorCount?: number;
  errors?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
class InMemoryStorage {
  private customers: Map<string, Customer> = new Map();
  private sites: Map<string, Site> = new Map();
  private periods: Map<string, ReportingPeriod> = new Map();
  private activities: Map<string, Activity> = new Map();
  private uploads: Map<string, Upload> = new Map();
  private emissionFactors: Map<string, EmissionFactor> = new Map();
  private emissionResults: Map<string, EmissionResult> = new Map();
  private calculationRuns: Map<string, CalculationRun> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  // Initialize with some default data
  private initializeDefaultData() {
    // Create default customer
    const defaultCustomer: Customer = {
      id: 'customer_default',
      name: 'Demo Company',
      industry: 'Technology',
      country: 'UK',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(defaultCustomer.id, defaultCustomer);

    // Create default site
    const defaultSite: Site = {
      id: 'site_default',
      customerId: 'customer_default',
      name: 'Main Office',
      country: 'UK',
      region: 'London',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sites.set(defaultSite.id, defaultSite);

    // Create default period
    const defaultPeriod: ReportingPeriod = {
      id: 'period_default',
      customerId: 'customer_default',
      name: '2024 Q1',
      year: 2024,
      quarter: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.periods.set(defaultPeriod.id, defaultPeriod);

    // Create default user
    const defaultUser: User = {
      id: 'user_default',
      email: 'admin@demo.com',
      password: '$2b$10$YourHashedPasswordHere', // In real app, hash this
      name: 'Admin User',
      role: 'ADMIN',
      customerId: 'customer_default',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);

    // Add some default emission factors
    this.addDefaultEmissionFactors();
  }

  private addDefaultEmissionFactors() {
    const factors: Omit<EmissionFactor, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Scope 1
      { category: 'Natural Gas', geography: 'UK', year: 2025, scope: 'SCOPE_1', unit: 'kWh', kgCo2ePerUnit: 0.0002027, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Diesel', geography: 'UK', year: 2025, scope: 'SCOPE_1', unit: 'litres', kgCo2ePerUnit: 2.687, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Petrol', geography: 'UK', year: 2025, scope: 'SCOPE_1', unit: 'litres', kgCo2ePerUnit: 2.296, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'LPG', geography: 'UK', year: 2025, scope: 'SCOPE_1', unit: 'kg', kgCo2ePerUnit: 3.001, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Refrigerants', geography: 'Global', year: 2014, scope: 'SCOPE_1', unit: 'kg', kgCo2ePerUnit: 1430, sourceName: 'IPCC', sourceVersion: '2014' },
      
      // Scope 2
      { category: 'Electricity', geography: 'UK', year: 2025, scope: 'SCOPE_2', unit: 'kWh', kgCo2ePerUnit: 0.19338, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'District Heating', geography: 'UK', year: 2025, scope: 'SCOPE_2', unit: 'kWh', kgCo2ePerUnit: 0.21, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'District Cooling', geography: 'UK', year: 2025, scope: 'SCOPE_2', unit: 'kWh', kgCo2ePerUnit: 0.18, sourceName: 'DESNZ', sourceVersion: '2025' },
      
      // Scope 3
      { category: 'Air Travel - Domestic', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'passenger-km', kgCo2ePerUnit: 0.15573, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Air Travel - International', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'passenger-km', kgCo2ePerUnit: 0.11898, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Rail Travel', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'passenger-km', kgCo2ePerUnit: 0.03549, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Taxi/Car Hire', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'passenger-km', kgCo2ePerUnit: 0.14426, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Employee Commuting', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'passenger-km', kgCo2ePerUnit: 0.11426, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Waste to Landfill', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'kg', kgCo2ePerUnit: 0.57, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Recycling', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'kg', kgCo2ePerUnit: 0.21, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Water', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'm³', kgCo2ePerUnit: 0.344, sourceName: 'DESNZ', sourceVersion: '2025' },
      { category: 'Wastewater', geography: 'UK', year: 2025, scope: 'SCOPE_3', unit: 'm³', kgCo2ePerUnit: 0.708, sourceName: 'DESNZ', sourceVersion: '2025' }
    ];

    factors.forEach(factor => {
      const id = uuidv4();
      this.emissionFactors.set(id, {
        ...factor,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  // Customer methods
  createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customer: Customer = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  findCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  findAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  updateCustomer(id: string, data: Partial<Customer>): Customer | undefined {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...data, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  deleteCustomer(id: string): boolean {
    return this.customers.delete(id);
  }

  // Site methods
  createSite(data: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Site {
    const site: Site = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sites.set(site.id, site);
    return site;
  }

  findSite(id: string): Site | undefined {
    return this.sites.get(id);
  }

  findSitesByCustomer(customerId: string): Site[] {
    return Array.from(this.sites.values()).filter(s => s.customerId === customerId);
  }

  findSiteByName(customerId: string, name: string): Site | undefined {
    return Array.from(this.sites.values()).find(
      s => s.customerId === customerId && s.name.toLowerCase() === name.toLowerCase()
    );
  }

  updateSite(id: string, data: Partial<Site>): Site | undefined {
    const site = this.sites.get(id);
    if (!site) return undefined;
    
    const updated = { ...site, ...data, updatedAt: new Date() };
    this.sites.set(id, updated);
    return updated;
  }

  deleteSite(id: string): boolean {
    return this.sites.delete(id);
  }

  // Period methods
  createPeriod(data: Omit<ReportingPeriod, 'id' | 'createdAt' | 'updatedAt'>): ReportingPeriod {
    const period: ReportingPeriod = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.periods.set(period.id, period);
    return period;
  }

  findPeriod(id: string): ReportingPeriod | undefined {
    return this.periods.get(id);
  }

  findPeriodsByCustomer(customerId: string): ReportingPeriod[] {
    return Array.from(this.periods.values()).filter(p => p.customerId === customerId);
  }

  updatePeriod(id: string, data: Partial<ReportingPeriod>): ReportingPeriod | undefined {
    const period = this.periods.get(id);
    if (!period) return undefined;
    
    const updated = { ...period, ...data, updatedAt: new Date() };
    this.periods.set(id, updated);
    return updated;
  }

  deletePeriod(id: string): boolean {
    return this.periods.delete(id);
  }

  // Activity methods
  createActivity(data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Activity {
    const activity: Activity = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  findActivity(id: string): Activity | undefined {
    return this.activities.get(id);
  }

  findActivitiesByPeriod(periodId: string): Activity[] {
    return Array.from(this.activities.values()).filter(a => a.periodId === periodId);
  }

  findActivitiesBySite(siteId: string): Activity[] {
    return Array.from(this.activities.values()).filter(a => a.siteId === siteId);
  }

  updateActivity(id: string, data: Partial<Activity>): Activity | undefined {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const updated = { ...activity, ...data, updatedAt: new Date() };
    this.activities.set(id, updated);
    return updated;
  }

  deleteActivity(id: string): boolean {
    return this.activities.delete(id);
  }

  // Upload methods
  createUpload(data: Omit<Upload, 'id' | 'createdAt' | 'updatedAt'>): Upload {
    const upload: Upload = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.uploads.set(upload.id, upload);
    return upload;
  }

  findUpload(id: string): Upload | undefined {
    return this.uploads.get(id);
  }

  findUploadsByCustomer(customerId: string): Upload[] {
    return Array.from(this.uploads.values()).filter(u => u.customerId === customerId);
  }

  updateUpload(id: string, data: Partial<Upload>): Upload | undefined {
    const upload = this.uploads.get(id);
    if (!upload) return undefined;
    
    const updated = { ...upload, ...data, updatedAt: new Date() };
    this.uploads.set(id, updated);
    return updated;
  }

  // Emission Factor methods
  findEmissionFactors(filters?: { category?: string; geography?: string; year?: number; scope?: string }): EmissionFactor[] {
    let results = Array.from(this.emissionFactors.values());
    
    if (filters?.category) {
      results = results.filter(f => f.category.toLowerCase().includes(filters.category!.toLowerCase()));
    }
    if (filters?.geography) {
      results = results.filter(f => f.geography === filters.geography);
    }
    if (filters?.year) {
      results = results.filter(f => f.year === filters.year);
    }
    if (filters?.scope) {
      results = results.filter(f => f.scope === filters.scope);
    }
    
    return results;
  }

  findEmissionFactor(id: string): EmissionFactor | undefined {
    return this.emissionFactors.get(id);
  }

  // Calculation Run methods
  createCalculationRun(data: Omit<CalculationRun, 'id' | 'createdAt' | 'updatedAt'>): CalculationRun {
    const run: CalculationRun = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.calculationRuns.set(run.id, run);
    return run;
  }

  findCalculationRun(id: string): CalculationRun | undefined {
    return this.calculationRuns.get(id);
  }

  findCalculationRunsByCustomer(customerId: string): CalculationRun[] {
    return Array.from(this.calculationRuns.values()).filter(r => r.customerId === customerId);
  }

  updateCalculationRun(id: string, data: Partial<CalculationRun>): CalculationRun | undefined {
    const run = this.calculationRuns.get(id);
    if (!run) return undefined;
    
    const updated = { ...run, ...data, updatedAt: new Date() };
    this.calculationRuns.set(id, updated);
    return updated;
  }

  // Emission Result methods
  createEmissionResult(data: Omit<EmissionResult, 'id' | 'createdAt' | 'updatedAt'>): EmissionResult {
    const result: EmissionResult = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.emissionResults.set(result.id, result);
    return result;
  }

  findEmissionResultsByRun(calcRunId: string): EmissionResult[] {
    return Array.from(this.emissionResults.values()).filter(r => r.calcRunId === calcRunId);
  }

  // User methods
  createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const user: User = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  findUser(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  // Clear all data (useful for testing)
  clearAll() {
    this.customers.clear();
    this.sites.clear();
    this.periods.clear();
    this.activities.clear();
    this.uploads.clear();
    this.emissionFactors.clear();
    this.emissionResults.clear();
    this.calculationRuns.clear();
    this.users.clear();
    this.initializeDefaultData();
  }

  // Export data (for backup or migration)
  exportData() {
    return {
      customers: Array.from(this.customers.values()),
      sites: Array.from(this.sites.values()),
      periods: Array.from(this.periods.values()),
      activities: Array.from(this.activities.values()),
      uploads: Array.from(this.uploads.values()),
      emissionFactors: Array.from(this.emissionFactors.values()),
      emissionResults: Array.from(this.emissionResults.values()),
      calculationRuns: Array.from(this.calculationRuns.values()),
      users: Array.from(this.users.values())
    };
  }

  // Import data (for restore or migration)
  importData(data: ReturnType<typeof this.exportData>) {
    this.clearAll();
    data.customers.forEach(c => this.customers.set(c.id, c));
    data.sites.forEach(s => this.sites.set(s.id, s));
    data.periods.forEach(p => this.periods.set(p.id, p));
    data.activities.forEach(a => this.activities.set(a.id, a));
    data.uploads.forEach(u => this.uploads.set(u.id, u));
    data.emissionFactors.forEach(f => this.emissionFactors.set(f.id, f));
    data.emissionResults.forEach(r => this.emissionResults.set(r.id, r));
    data.calculationRuns.forEach(r => this.calculationRuns.set(r.id, r));
    data.users.forEach(u => this.users.set(u.id, u));
  }
}

// Export singleton instance
export const storage = new InMemoryStorage();

// Export for testing
export { InMemoryStorage };
