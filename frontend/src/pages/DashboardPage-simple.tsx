import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  CalculatorIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const stats = [
    {
      name: 'Total Emissions',
      value: '24.5 tCO₂e',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      description: 'Current period emissions'
    },
    {
      name: 'Activities',
      value: '156',
      icon: FolderIcon,
      color: 'bg-green-500',
      description: 'Tracked activities'
    },
    {
      name: 'Projects',
      value: '8',
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      description: 'Active projects'
    },
    {
      name: 'Calculations',
      value: '12',
      icon: CalculatorIcon,
      color: 'bg-purple-500',
      description: 'Completed runs'
    }
  ]

  const recentActivities = [
    { id: 1, type: 'Data Upload', description: 'Energy consumption data uploaded', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'Calculation', description: 'Q4 2024 emissions calculated', time: '1 day ago', status: 'completed' },
    { id: 3, type: 'Report', description: 'Monthly sustainability report generated', time: '3 days ago', status: 'completed' },
    { id: 4, type: 'Project', description: 'Solar panel project created', time: '1 week ago', status: 'active' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">Welcome back, {user?.email}</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4 sm:mb-0 sm:mr-4 self-start">
            <UserIcon className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold">Co-Lab VERITAS™</h2>
            <p className="text-blue-100 text-sm sm:text-base">Sustainability Management Platform</p>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm space-y-1 sm:space-y-0">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Customer ID: {user?.customerId}</span>
              </div>
              <span className="hidden sm:inline mx-2">•</span>
              <span>Role: {user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-lg p-2 sm:p-3`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 truncate">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0 space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.type}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <a
                href="/upload"
                className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900">Upload Data</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Import activity data files</p>
                </div>
              </a>
              <a
                href="/calculations"
                className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalculatorIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900">Run Calculation</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Calculate emissions for period</p>
                </div>
              </a>
              <a
                href="/reports"
                className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900">View Reports</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Generate sustainability reports</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">System Status</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-2 sm:mb-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">Backend API</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-2 sm:mb-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">Database</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-2 sm:mb-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">Authentication</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
