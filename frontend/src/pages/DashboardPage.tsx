import React from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { reportingApi, activitiesApi, projectsApi, calculationsApi } from '../services/api'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  CalculatorIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'
import { 
  AreaChart, 
  Area, 
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  // Fetch dashboard data
  const { data: overview, isLoading: overviewLoading } = useQuery(
    ['reporting-overview', user?.customerId],
    () => reportingApi.getOverview({ customerId: user!.customerId }),
    { enabled: !!user?.customerId }
  )

  const { data: progress, isLoading: progressLoading } = useQuery(
    ['reporting-progress', user?.customerId],
    () => reportingApi.getProgress({ customerId: user!.customerId }),
    { enabled: !!user?.customerId }
  )

  const { data: activityStats } = useQuery(
    ['activity-stats', user?.customerId],
    () => activitiesApi.getStats(user!.customerId),
    { enabled: !!user?.customerId }
  )

  const { data: projectStats } = useQuery(
    ['project-stats', user?.customerId],
    () => projectsApi.getStats(user!.customerId),
    { enabled: !!user?.customerId }
  )

  const { data: calcRuns } = useQuery(
    ['calc-runs', user?.customerId],
    () => calculationsApi.getCalcRuns({ customerId: user!.customerId }),
    { enabled: !!user?.customerId }
  )

  if (overviewLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Emissions',
      value: overview?.summary.totalEmissions ? `${(overview.summary.totalEmissions / 1000).toFixed(1)} tCO₂e` : '0 tCO₂e',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      change: progress?.trends.totalChange ? (progress.trends.totalChange / 1000).toFixed(1) : '0',
      changeType: progress?.trends.totalChange && progress.trends.totalChange > 0 ? 'increase' : 'decrease'
    },
    {
      name: 'Activities',
      value: activityStats?.totalActivities?.toString() || '0',
      icon: FolderIcon,
      color: 'bg-green-500',
      change: null,
      changeType: null
    },
    {
      name: 'Projects',
      value: projectStats?.totalProjects?.toString() || '0',
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      change: projectStats?.savings.overallVariance ? (projectStats.savings.overallVariance / 1000).toFixed(1) : '0',
      changeType: projectStats?.savings.overallVariance && projectStats.savings.overallVariance > 0 ? 'increase' : 'decrease'
    },
    {
      name: 'Calculations',
      value: calcRuns?.length?.toString() || '0',
      icon: CalculatorIcon,
      color: 'bg-purple-500',
      change: null,
      changeType: null
    }
  ]

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

  const siteData = overview?.siteBreakdown.slice(0, 5).map(site => ({
    name: site.site.name,
    emissions: site.total / 1000
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {overview?.lastUpdated ? new Date(overview.lastUpdated).toLocaleDateString() : 'Never'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <div className="ml-2 flex items-center text-sm">
                        {stat.changeType === 'increase' ? (
                          <TrendingUpIcon className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDownIcon className="h-4 w-4 text-green-500" />
                        )}
                        <span className={stat.changeType === 'increase' ? 'text-red-600' : 'text-green-600'}>
                          {stat.change} tCO₂e
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
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

        {/* Emissions Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Emissions Trend</h3>
          </div>
          <div className="card-content">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, '']} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="1"
                    stroke={COLORS[0]}
                    fill={COLORS[0]}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>

        {/* Top Sites by Emissions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Top Sites by Emissions</h3>
          </div>
          <div className="card-content">
            {siteData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={siteData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
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

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Recent Calculations</h3>
          </div>
          <div className="card-content">
            {calcRuns && calcRuns.length > 0 ? (
              <div className="space-y-3">
                {calcRuns.slice(0, 5).map((run) => (
                  <div key={run.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {run.period?.year} Q{run.period?.quarter || 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${
                      run.status === 'COMPLETED' ? 'badge-success' :
                      run.status === 'FAILED' ? 'badge-error' :
                      run.status === 'RUNNING' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No calculations yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/upload"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Upload Data</p>
                <p className="text-sm text-gray-500">Import activity data</p>
              </div>
            </a>
            <a
              href="/calculations"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CalculatorIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Run Calculation</p>
                <p className="text-sm text-gray-500">Calculate emissions</p>
              </div>
            </a>
            <a
              href="/reports"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-500">Generate reports</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
