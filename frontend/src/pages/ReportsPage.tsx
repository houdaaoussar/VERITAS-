import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { reportingApi } from '../services/api'
import { 
  DocumentArrowDownIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export const ReportsPage: React.FC = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [reportType, setReportType] = useState<'overview' | 'progress' | 'csrd'>('overview')

  // Fetch reporting data
  const { data: overview, isLoading: overviewLoading } = useQuery(
    ['reporting-overview', user?.customerId, selectedPeriod],
    () => reportingApi.getOverview({ 
      customerId: user!.customerId,
      ...(selectedPeriod && { periodId: selectedPeriod })
    }),
    { enabled: !!user?.customerId && reportType === 'overview' }
  )

  const { data: progress, isLoading: progressLoading } = useQuery(
    ['reporting-progress', user?.customerId],
    () => reportingApi.getProgress({ customerId: user!.customerId }),
    { enabled: !!user?.customerId && reportType === 'progress' }
  )

  const { data: csrdData, isLoading: csrdLoading } = useQuery(
    ['csrd-export', user?.customerId, selectedPeriod],
    () => reportingApi.exportCSRD({ 
      customerId: user!.customerId,
      ...(selectedPeriod && { periodId: selectedPeriod })
    }),
    { enabled: !!user?.customerId && reportType === 'csrd' }
  )

  // Export mutations
  const exportCSVMutation = useMutation(reportingApi.exportData, {
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `emissions_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV report downloaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to export CSV')
    }
  })

  const handleExportCSV = () => {
    exportCSVMutation.mutate({
      customerId: user!.customerId,
      format: 'csv',
      ...(selectedPeriod && { periodId: selectedPeriod })
    })
  }

  const handleExportCSRD = () => {
    if (csrdData) {
      const blob = new Blob([JSON.stringify(csrdData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `csrd_report_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSRD report downloaded successfully')
    }
  }

  // Prepare chart data
  const scopeData = overview ? [
    { name: 'Scope 1', value: overview.summary.scope1Total / 1000, color: COLORS[0] },
    { name: 'Scope 2', value: overview.summary.scope2Total / 1000, color: COLORS[1] },
    { name: 'Scope 3', value: overview.summary.scope3Total / 1000, color: COLORS[2] }
  ].filter(item => item.value > 0) : []

  const progressData = progress?.progress.map(p => ({
    period: `${p.period.year} Q${p.period.quarter || 1}`,
    total: p.emissions.total / 1000,
    scope1: p.emissions.scope1 / 1000,
    scope2: p.emissions.scope2 / 1000,
    scope3: p.emissions.scope3 / 1000
  })) || []

  const siteData = overview?.siteBreakdown.slice(0, 10).map(site => ({
    name: site.site.name.length > 15 ? site.site.name.substring(0, 15) + '...' : site.site.name,
    emissions: site.total / 1000,
    percentage: site.percentage
  })) || []

  const typeData = overview?.typeBreakdown.slice(0, 8).map(type => ({
    name: type.type.replace('_', ' '),
    emissions: type.total / 1000,
    count: type.count
  })) || []

  const isLoading = overviewLoading || progressLoading || csrdLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            disabled={exportCSVMutation.isLoading}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          {reportType === 'csrd' && (
            <button
              onClick={handleExportCSRD}
              className="btn-primary"
              disabled={!csrdData}
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Export CSRD
            </button>
          )}
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="card">
        <div className="card-content">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setReportType('overview')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                reportType === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setReportType('progress')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                reportType === 'progress'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="h-4 w-4 inline mr-2" />
              Progress
            </button>
            <button
              onClick={() => setReportType('csrd')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                reportType === 'csrd'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4 inline mr-2" />
              CSRD/ESRS
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Report */}
          {reportType === 'overview' && overview && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-600">Scope 1</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(overview.summary.scope1Total / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">Scope 2</p>
                      <p className="text-2xl font-bold text-green-900">
                        {(overview.summary.scope2Total / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-yellow-600">Scope 3</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {(overview.summary.scope3Total / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(overview.summary.totalEmissions / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emissions by Scope */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-medium">Emissions by Scope</h3>
                  </div>
                  <div className="card-content">
                    {scopeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={scopeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {scopeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        No emissions data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Emissions by Site */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-medium">Emissions by Site</h3>
                  </div>
                  <div className="card-content">
                    {siteData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={siteData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, 'Emissions']} />
                          <Bar dataKey="emissions" fill={COLORS[1]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        No site data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Emissions by Activity Type */}
                <div className="card lg:col-span-2">
                  <div className="card-header">
                    <h3 className="text-lg font-medium">Emissions by Activity Type</h3>
                  </div>
                  <div className="card-content">
                    {typeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={typeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              name === 'emissions' ? `${value.toFixed(2)} tCO₂e` : value,
                              name === 'emissions' ? 'Emissions' : 'Count'
                            ]} 
                          />
                          <Bar dataKey="emissions" fill={COLORS[2]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        No activity type data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Report */}
          {reportType === 'progress' && progress && (
            <div className="space-y-6">
              {/* Trends Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Change</p>
                      <p className={`text-2xl font-bold ${
                        progress.trends.totalChange >= 0 ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {progress.trends.totalChange >= 0 ? '+' : ''}{(progress.trends.totalChange / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-600">Scope 1 Change</p>
                      <p className={`text-2xl font-bold ${
                        progress.trends.scope1Change >= 0 ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {progress.trends.scope1Change >= 0 ? '+' : ''}{(progress.trends.scope1Change / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">Scope 2 Change</p>
                      <p className={`text-2xl font-bold ${
                        progress.trends.scope2Change >= 0 ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {progress.trends.scope2Change >= 0 ? '+' : ''}{(progress.trends.scope2Change / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div className="text-center">
                      <p className="text-sm font-medium text-yellow-600">Scope 3 Change</p>
                      <p className={`text-2xl font-bold ${
                        progress.trends.scope3Change >= 0 ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {progress.trends.scope3Change >= 0 ? '+' : ''}{(progress.trends.scope3Change / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium">Emissions Trend Over Time</h3>
                </div>
                <div className="card-content">
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, '']} />
                        <Line type="monotone" dataKey="scope1" stroke={COLORS[0]} name="Scope 1" />
                        <Line type="monotone" dataKey="scope2" stroke={COLORS[1]} name="Scope 2" />
                        <Line type="monotone" dataKey="scope3" stroke={COLORS[2]} name="Scope 3" />
                        <Line type="monotone" dataKey="total" stroke={COLORS[3]} strokeWidth={3} name="Total" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No progress data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CSRD Report */}
          {reportType === 'csrd' && csrdData && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium">CSRD/ESRS E1 Compliance Report</h3>
                </div>
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Report Information</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Reporting Period</dt>
                          <dd className="text-sm text-gray-900">{csrdData.reportingPeriod}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Report Date</dt>
                          <dd className="text-sm text-gray-900">{csrdData.reportDate}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Standard</dt>
                          <dd className="text-sm text-gray-900">{csrdData.methodology.standard}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">GHG Emissions Summary</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Scope 1 Emissions</dt>
                          <dd className="text-sm text-gray-900">{csrdData.ghgEmissions.scope1.total} tCO₂e</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Scope 2 Emissions</dt>
                          <dd className="text-sm text-gray-900">{csrdData.ghgEmissions.scope2.total} tCO₂e</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Scope 3 Emissions</dt>
                          <dd className="text-sm text-gray-900">{csrdData.ghgEmissions.scope3.total} tCO₂e</dd>
                        </div>
                        <div className="pt-2 border-t">
                          <dt className="text-sm font-medium text-gray-900">Total Emissions</dt>
                          <dd className="text-lg font-bold text-gray-900">{csrdData.transitionPlan.totalEmissions} tCO₂e</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Data Quality & Verification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Factor Library Version</dt>
                            <dd className="text-sm text-gray-900">{csrdData.dataQuality.factorLibraryVersion}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Calculation Date</dt>
                            <dd className="text-sm text-gray-900">{csrdData.dataQuality.calculationDate}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Total Activities</dt>
                            <dd className="text-sm text-gray-900">{csrdData.dataQuality.totalActivities}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                            <dd className="text-sm text-gray-900">{csrdData.dataQuality.verificationStatus}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
