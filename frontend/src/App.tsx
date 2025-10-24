import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'

// Lazy load components to prevent white screen
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const DashboardPage = React.lazy(() => import('./pages/DashboardPage-simple').then(module => ({ default: module.DashboardPage })))
const ActivitiesPage = React.lazy(() => import('./pages/ActivitiesPage').then(module => ({ default: module.ActivitiesPage })))
const CalculationsPage = React.lazy(() => import('./pages/CalculationsPage').then(module => ({ default: module.CalculationsPage })))
const ReportsPage = React.lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })))
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })))
const SitesPage = React.lazy(() => import('./pages/SitesPage').then(module => ({ default: module.SitesPage })))
const UploadPage = React.lazy(() => import('./pages/UploadPage').then(module => ({ default: module.UploadPage })))
const EmissionsInventoryUploadPage = React.lazy(() => import('./pages/EmissionsInventoryUploadPage').then(module => ({ default: module.EmissionsInventoryUploadPage })))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const CalculatorPage = React.lazy(() => import('./pages/CalculatorPage').then(module => ({ default: module.CalculatorPage })))
const EmissionsReportPage = React.lazy(() => import('./pages/EmissionsReportPage'))
const EstimationInputPage = React.lazy(() => import('./pages/EstimationInputPage'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/activities" element={<ActivitiesPage />} />
                      <Route path="/calculations" element={<CalculationsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/emissions-report" element={<EmissionsReportPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/sites" element={<SitesPage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      <Route path="/emissions-inventory-upload" element={<EmissionsInventoryUploadPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/calculator" element={<CalculatorPage />} />
                      <Route path="/estimation" element={<EstimationInputPage />} />
                      <Route path="/reporting/:periodId/estimation" element={<EstimationInputPage />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
