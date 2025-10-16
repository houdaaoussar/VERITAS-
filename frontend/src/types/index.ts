export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  customerId: string;
  customerName?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  category?: string;
  level?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  country: string;
  region?: string;
  postcode?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface ReportingPeriod {
  id: string;
  customerId: string;
  fromDate: string;
  toDate: string;
  year: number;
  quarter?: number;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  siteId: string;
  periodId: string;
  type: 'ELECTRICITY' | 'NATURAL_GAS' | 'DIESEL' | 'PETROL' | 'LPG' | 'BUSINESS_TRAVEL' | 'WASTE' | 'WATER' | 'OTHER';
  quantity: number;
  unit: string;
  activityDateStart: string;
  activityDateEnd: string;
  source?: string;
  uploadId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  site?: Site;
  period?: ReportingPeriod;
}

export interface EmissionFactor {
  id: string;
  category: string;
  geography: string;
  year: number;
  inputUnit: string;
  outputUnit: string;
  value: number;
  sourceName: string;
  sourceVersion: string;
  gwpVersion: string;
  validFrom: string;
  validTo?: string;
  createdAt: string;
}

export interface CalcRun {
  id: string;
  customerId: string;
  periodId: string;
  factorLibraryVersion: string;
  requestedBy: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  period?: ReportingPeriod;
  requester?: { email: string };
}

export interface EmissionResult {
  id: string;
  calcRunId: string;
  activityId: string;
  scope: 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';
  method: string;
  quantityBase: number;
  unitBase: string;
  factorId: string;
  resultKgCo2e: number;
  uncertainty?: number;
  createdAt: string;
  activity?: Activity;
  factor?: EmissionFactor;
  calcRun?: CalcRun;
}

export interface Project {
  id: string;
  customerId: string;
  siteId?: string;
  type: string;
  description: string;
  startDate: string;
  lifecycleState: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  estAnnualSavingKgCo2e: number;
  createdAt: string;
  updatedAt: string;
  site?: Site;
  projectActuals?: ProjectActual[];
  variance?: number;
  cumulativeVariance?: number;
  totalActualSavings?: number;
}

export interface ProjectActual {
  id: string;
  projectId: string;
  year: number;
  actualSavingKgCo2e: number;
  createdAt: string;
  updatedAt: string;
  variance?: number;
  variancePercentage?: number;
  estimated?: number;
}

export interface Upload {
  id: string;
  customerId: string;
  originalFilename: string;
  filename: string;
  s3Key?: string;
  status: 'PENDING' | 'VALIDATING' | 'COMPLETED' | 'FAILED';
  uploadedBy: { email: string };
  createdAt: string;
  site?: Site;
  period?: ReportingPeriod;
  validationResults?: {
    validRows: number;
    invalidRows: number;
    totalRows: number;
    errors: string[];
  };
  errorMessage?: string;
}

export interface EmissionsSummary {
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  totalEmissions: number;
}

export interface SiteEmissions {
  site: Site;
  total: number;
  byScope: {
    scope1: number;
    scope2: number;
    scope3: number;
  };
  percentage: number;
}

export interface TypeEmissions {
  type: string;
  total: number;
  count: number;
  scope: 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';
  percentage: number;
}

export interface ReportingOverview {
  summary: EmissionsSummary;
  siteBreakdown: SiteEmissions[];
  typeBreakdown: TypeEmissions[];
  calcRun?: CalcRun;
  totalResults: number;
  lastUpdated?: string;
}

export interface ProgressData {
  calcRunId: string;
  period: ReportingPeriod;
  date: string;
  emissions: EmissionsSummary;
  resultCount: number;
}

export interface EmissionsTrends {
  totalChange: number;
  scope1Change: number;
  scope2Change: number;
  scope3Change: number;
}

export interface ProgressReport {
  progress: ProgressData[];
  trends: EmissionsTrends;
  periodCount: number;
}

export interface ApiError {
  error: string;
  code: string;
  details?: any;
  correlationId?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ActivityStats {
  totalActivities: number;
  byType: Array<{
    type: string;
    _count: { type: number };
    _sum: { quantity: number };
  }>;
  bySite: Array<{
    siteId: string;
    _count: { siteId: number };
    site?: { name: string };
  }>;
}

export interface ProjectStats {
  totalProjects: number;
  byLifecycle: Array<{
    lifecycleState: string;
    _count: { lifecycleState: number };
    _sum: { estAnnualSavingKgCo2e: number };
  }>;
  byType: Array<{
    type: string;
    _count: { type: number };
    _sum: { estAnnualSavingKgCo2e: number };
  }>;
  savings: {
    totalEstimated: number;
    totalActual: number;
    overallVariance: number;
    variancePercentage: number;
  };
  performance: {
    projectsAboveTarget: number;
    projectsBelowTarget: number;
    projectsOnTarget: number;
    averageVariancePercentage: number;
  };
  projectsWithTracking: number;
}
