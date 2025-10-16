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

// API Base URL - update this when deploying
const API_BASE_URL = 'http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com';

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
  }> => {
    const response = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  parseFile: async (uploadId: string, options?: {
    siteMapping?: Record<string, string>
    dateFormat?: string
    hasHeaders?: boolean
  }): Promise<{
    totalRows: number
    validRows: number
    errorRows: number
    columns: string[]
    sample: any[]
    errors: any[]
  }> => {
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
    const response = await api.post(`/uploads/${data.uploadId}/import`, data);
    return response.data
  },

  deleteUpload: async (id: string): Promise<void> => {
    await api.delete(`/uploads/${id}`);
  },

  getUploads: async (customerId: string): Promise<Upload[]> => {
    const response = await api.get('/uploads', { params: { customerId } })
    return response.data
  },
}

// Reporting Periods API
export const periodsApi = {
  getAll: async (customerId: string): Promise<ReportingPeriod[]> => {
    const response = await api.get('/periods', { params: { customerId } });
    return response.data;
  },
};

export default api
