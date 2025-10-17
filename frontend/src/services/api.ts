import axios from 'axios'
import { 
  User, 
  Customer, 
  Site, 
  Activity, 
  CalcRun, 
  EmissionResult, 
  Project, 
  ProjectActual, 
  Upload,
  ReportingOverview,
  ProgressReport,
  ActivityStats,
  ProjectStats,
  PaginatedResponse,
  ReportingPeriod
} from '../types'

// API Base URL - configurable via Vite env, defaults to local API
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002';
export { API_BASE_URL };

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          })
          
          localStorage.setItem('accessToken', response.data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
          
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{
    accessToken: string
    refreshToken: string
    user: User
  }> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },
}

// Customers API
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers')
    return response.data
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post('/customers', data)
    return response.data
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`)
  },
}

// Sites API
export const sitesApi = {
  getAll: async (customerId: string): Promise<Site[]> => {
    // Use test endpoint for mock customer (no auth required)
    if (customerId === 'mock-customer-id') {
      const response = await api.get('/sites/test')
      return response.data
    }
    const response = await api.get('/sites', { params: { customerId } })
    return response.data
  },

  getById: async (id: string): Promise<Site> => {
    const response = await api.get(`/sites/${id}`)
    return response.data
  },

  create: async (data: Partial<Site>): Promise<Site> => {
    const response = await api.post('/sites', data)
    return response.data
  },

  update: async (id: string, data: Partial<Site>): Promise<Site> => {
    const response = await api.put(`/sites/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sites/${id}`)
  },
}

// Activities API
export const activitiesApi = {
  getAll: async (params: {
    customerId: string;
    periodId?: string;
    siteId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Activity>> => {
    const response = await api.get('/activities', { params });
    // The backend returns { activities: [], pagination: {} } which doesn't match PaginatedResponse<T>
    // We transform it here to match the expected { data: [], pagination: {} } structure
    return {
      data: response.data.activities,
      pagination: response.data.pagination,
    };
  },

  getById: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`)
    return response.data
  },

  create: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await api.post('/activities', data)
    return response.data
  },

  createBulk: async (activities: Partial<Activity>[]): Promise<{
    created: number
    failed: number
    results: Activity[]
    errors: any[]
  }> => {
    const response = await api.post('/activities/bulk', { activities })
    return response.data
  },

  update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`)
  },

  getStats: async (customerId: string, periodId?: string): Promise<ActivityStats> => {
    const response = await api.get('/activities/stats/summary', {
      params: { customerId, periodId }
    })
    return response.data
  },
}

// Calculations API
export const calculationsApi = {
  runCalculation: async (data: {
    customerId: string
    periodId: string
    factorLibraryVersion?: string
  }): Promise<{ calcRunId: string; status: string; message: string }> => {
    const response = await api.post('/calc/runs', data)
    return response.data
  },

  getCalcRun: async (id: string): Promise<CalcRun> => {
    const response = await api.get(`/calc/runs/${id}`)
    return response.data
  },

  getCalcResults: async (id: string): Promise<{
    calcRun: CalcRun
    aggregation: {
      scope1Total: number
      scope2Total: number
      scope3Total: number
      totalEmissions: number
      resultCount: number
    }
    results: EmissionResult[]
  }> => {
    const response = await api.get(`/calc/runs/${id}/results`)
    return response.data
  },

  getCalcRuns: async (params: {
    customerId: string
    periodId?: string
    status?: string
  }): Promise<CalcRun[]> => {
    const response = await api.get('/calc/runs', { params })
    return response.data
  },

  exportResults: async (id: string): Promise<Blob> => {
    const response = await api.get(`/calc/runs/${id}/export.csv`, {
      responseType: 'blob'
    })
    return response.data
  },

  deleteCalcRun: async (id: string): Promise<void> => {
    await api.delete(`/calc/runs/${id}`)
  },
}

// Reporting API
export const reportingApi = {
  getDetailedReport: async (params: {
    customerId: string;
    periodId?: string;
    calcRunId?: string;
  }): Promise<any> => {
    const response = await api.get('/reporting/detailed-report', { params });
    return response.data;
  },
  getOverview: async (params: {
    customerId: string
    periodId?: string
    calcRunId?: string
  }): Promise<ReportingOverview> => {
    const response = await api.get('/reporting/overview', { params })
    return response.data
  },

  getProgress: async (params: {
    customerId: string
    from?: string
    to?: string
    groupBy?: 'month' | 'quarter' | 'year'
  }): Promise<ProgressReport> => {
    const response = await api.get('/reporting/progress', { params })
    return response.data
  },

  exportCSRD: async (params: {
    customerId: string
    periodId?: string
    calcRunId?: string
  }): Promise<any> => {
    const response = await api.get('/reporting/csrd-export', { params })
    return response.data
  },

  exportData: async (params: {
    customerId: string
    periodId?: string
    calcRunId?: string
    format?: 'csv' | 'json'
  }): Promise<Blob | any> => {
    const responseType = params.format === 'csv' ? 'blob' : 'json'
    const response = await api.get('/reporting/export', { 
      params,
      responseType
    })
    return response.data
  },
}

// Projects API
export const projectsApi = {
  getAll: async (params: {
    customerId: string
    siteId?: string
    lifecycleState?: string
    type?: string
  }): Promise<Project[]> => {
    const response = await api.get('/projects', { params })
    return response.data
  },

  getById: async (id: string): Promise<Project & {
    varianceAnalysis: Array<{
      year: number
      estimated: number
      actual: number
      variance: number
      variancePercentage: number
      performance: 'above_target' | 'below_target'
    }>
    summary: {
      totalEstimated: number
      totalActual: number
      totalVariance: number
      averageAnnualPerformance: number
      yearsTracked: number
    }
  }> => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', data)
    return response.data
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },

  addActual: async (id: string, data: {
    year: number
    actualSavingKgCo2e: number
  }): Promise<ProjectActual> => {
    const response = await api.post(`/projects/${id}/actuals`, data)
    return response.data
  },

  getStats: async (customerId: string): Promise<ProjectStats> => {
    const response = await api.get('/projects/stats/summary', {
      params: { customerId }
    })
    return response.data
  },
}

// Uploads API
export const uploadsApi = {
  uploadFile: async (formData: FormData): Promise<{
    uploadId: string
    filename: string
    size: number
    status: string
    ingestData?: any
  }> => {
    // Check if this is a mock customer - use test endpoint
    const customerId = formData.get('customerId');
    if (customerId === 'mock-customer-id') {
      // Use the ingest test endpoint and get real data
      const response = await api.post('/ingest/test', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Store the actual ingest response for later use
      const ingestData = response.data;
      console.log('🚀 Upload response from backend:', ingestData);
      console.log('🚀 Status:', ingestData.status);
      console.log('🚀 Message:', ingestData.message);
      console.log('🚀 Data array:', ingestData.data);
      console.log('🚀 Data array length:', ingestData.data?.length);
      console.log('🚀 Header mappings:', ingestData.header_mappings);
      console.log('🚀 Missing targets:', ingestData.missing_targets);
      console.log('🚀 Issues:', ingestData.issues);
      
      // If no data was imported, show why
      if (ingestData.rows_imported === 0) {
        console.error('❌ No rows were imported!');
        if (ingestData.missing_targets && ingestData.missing_targets.length > 0) {
          console.error('❌ Missing required columns:', ingestData.missing_targets);
        }
        if (ingestData.issues && ingestData.issues.length > 0) {
          console.error('❌ Validation issues:', ingestData.issues);
        }
      }
      
      // Store in sessionStorage so parseFile can access it
      sessionStorage.setItem('latestIngestData', JSON.stringify(ingestData));
      console.log('✅ Stored in sessionStorage');
      // Transform response to match expected format
      return {
        uploadId: 'mock-upload-' + Date.now(),
        filename: 'test-file.csv',
        size: 0,
        status: 'completed',
        ingestData: ingestData
      }
    }
    const response = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  parseFile: async (uploadId: string, options?: {
    siteMapping?: Record<string, string>
    dateFormat?: string
    hasHeaders?: boolean
  }): Promise<any> => {
    // Return real parse results for mock uploads using stored ingest data
    if (uploadId.startsWith('mock-upload-')) {
      // Get the stored ingest data from sessionStorage
      const storedData = sessionStorage.getItem('latestIngestData');
      console.log('📊 Parsing file, stored data:', storedData ? 'Found' : 'Not found');
      
      if (storedData) {
        const ingestData = JSON.parse(storedData);
        console.log('📊 Ingest data:', ingestData);
        console.log('📊 Ingest data.data:', ingestData.data);
        console.log('📊 Ingest rows_imported:', ingestData.rows_imported);
        console.log('📊 Full ingest object keys:', Object.keys(ingestData));
        
        // Get unique column names from header mappings (filter out duplicates)
        const columnSet = new Set<string>();
        ingestData.header_mappings?.forEach((m: any) => {
          if (m.sourceColumn && m.confidence > 0.5) {
            columnSet.add(m.sourceColumn);
          }
        });
        const columns = Array.from(columnSet);
        
        console.log('📊 Columns:', columns);
        console.log('📊 Header Mappings:', ingestData.header_mappings);
        console.log('📊 Data rows:', ingestData.data?.length);
        if (ingestData.data && ingestData.data.length > 0) {
          console.log('📊 First data row:', ingestData.data[0]);
        }
        console.log('📊 Issues/Errors:', ingestData.issues);
        if (ingestData.issues && ingestData.issues.length > 0) {
          console.log('📊 First 3 errors:', ingestData.issues.slice(0, 3));
        }
        
        // Convert ingest data format to upload page format
        const sample = ingestData.data?.map((row: any, index: number) => {
          const formattedRow: any = { 
            rowIndex: index + 1, 
            errors: [] 
          };
          
          // Map each field from the ingest data to the original column name
          ingestData.header_mappings?.forEach((mapping: any) => {
            const targetField = mapping.targetField;
            const sourceColumn = mapping.sourceColumn;
            
            // Skip duplicate mappings (keep highest confidence)
            if (mapping.confidence < 0.6 && targetField === 'scope') return;
            
            let value = row[targetField];
            
            // Format dates nicely
            if (targetField.includes('date') && value) {
              try {
                const date = new Date(value);
                value = date.toISOString().split('T')[0]; // YYYY-MM-DD format
              } catch (e) {
                // Keep original value if date parsing fails
              }
            }
            
            // Format the value for display
            if (value !== undefined && value !== null) {
              formattedRow[sourceColumn] = value;
            }
          });
          
          return formattedRow;
        }) || [];
        
        console.log('📊 Sample rows:', sample);
        
        const result = {
          uploadId,
          totalRows: (ingestData.rows_imported || 0) + (ingestData.rows_failed || 0),
          validRows: ingestData.rows_imported || 0,
          errorRows: ingestData.rows_failed || 0,
          columns: columns,
          sample: sample,
          errors: ingestData.issues || []
        };
        
        console.log('📊 Parse result:', result);
        return result;
      } else {
        console.error('❌ No stored ingest data found!');
      }
    }
    const response = await api.post(`/uploads/${uploadId}/parse`, options)
    return response.data
  },

  importActivities: async (data: {
    uploadId: string;
    customerId: string;
    periodId?: string;
    columnMapping?: Record<string, string>;
    skipErrors?: boolean;
  }): Promise<{
    totalRows: number
    validRows: number
    importedRows: number
    message: string
  }> => {
    // Return mock success for mock uploads
    if (data.uploadId.startsWith('mock-upload-')) {
      return {
        totalRows: 5,
        validRows: 5,
        importedRows: 5,
        message: 'Successfully imported 5 activities (TEST MODE)'
      };
    }
    const response = await api.post(`/uploads/${data.uploadId}/import`, data);
    return response.data
  },

  deleteUpload: async (id: string): Promise<void> => {
    await api.delete(`/uploads/${id}`);
  },

  getUploads: async (customerId: string): Promise<Upload[]> => {
    // Return empty array for mock customer (no auth required)
    if (customerId === 'mock-customer-id') {
      return [];
    }
    const response = await api.get('/uploads', { params: { customerId } })
    return response.data
  },
}

// Reporting Periods API
export const periodsApi = {
  getAll: async (customerId: string): Promise<ReportingPeriod[]> => {
    // Use test endpoint for mock customer (no auth required)
    if (customerId === 'mock-customer-id') {
      const response = await api.get('/periods/test');
      return response.data;
    }
    const response = await api.get('/periods', { params: { customerId } });
    return response.data;
  },
};

export default api
