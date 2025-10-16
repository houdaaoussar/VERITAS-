import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { calculationsApi, periodsApi } from '../services/api'
import { CalcRun } from '../types'
import { 
  PlayIcon, 
  DocumentArrowDownIcon, 
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export const CalculationsPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showRunModal, setShowRunModal] = useState(false)
  const [selectedCalcRun, setSelectedCalcRun] = useState<CalcRun | null>(null)

  // Fetch calculation runs
  const { data: calcRuns, isLoading } = useQuery(
    ['calc-runs', user?.customerId],
    () => calculationsApi.getCalcRuns({ customerId: user!.customerId }),
    { enabled: !!user?.customerId }
  )

  // Fetch reporting periods for the run modal
  const { data: periods } = useQuery(
    ['periods', user?.customerId],
    () => periodsApi.getAll(user!.customerId),
    { enabled: !!user?.customerId }
  );

  // Run calculation mutation
  const runCalculationMutation = useMutation(calculationsApi.runCalculation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['calc-runs'])
      toast.success('Calculation started successfully')
      setShowRunModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start calculation')
    }
  })

  // Delete calculation mutation
  const deleteMutation = useMutation(calculationsApi.deleteCalcRun, {
    onSuccess: () => {
      queryClient.invalidateQueries(['calc-runs'])
      toast.success('Calculation run deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete calculation run')
    }
  })

  // Export results mutation
  const exportMutation = useMutation(calculationsApi.exportResults, {
    onSuccess: (blob, calcRunId) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `emissions_audit_${calcRunId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Export downloaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to export results')
    }
  })

  const handleRunCalculation = (data: { periodId: string; factorLibraryVersion?: string }) => {
    runCalculationMutation.mutate({
      customerId: user!.customerId,
      ...data
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this calculation run?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleExport = (id: string) => {
    exportMutation.mutate(id)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'RUNNING':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success'
      case 'FAILED':
        return 'badge-error'
      case 'RUNNING':
        return 'badge-info'
      default:
        return 'badge-warning'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calculations</h1>
        {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
          <button
            onClick={() => setShowRunModal(true)}
            className="btn-primary"
            disabled={runCalculationMutation.isLoading}
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Run Calculation
          </button>
        )}
      </div>

      {/* Calculation Runs */}
      <div className="space-y-4">
        {calcRuns && calcRuns.length > 0 ? (
          calcRuns.map((run) => (
            <div key={run.id} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(run.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {run.period?.year} Q{run.period?.quarter || 1} Calculation
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Started: {new Date(run.createdAt).toLocaleString()}</span>
                        {run.completedAt && (
                          <span>Completed: {new Date(run.completedAt).toLocaleString()}</span>
                        )}
                        <span>Requested by: {run.requester?.email}</span>
                      </div>
                      {run.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">{run.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                    {run.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleExport(run.id)}
                        className="btn-secondary btn-sm"
                        disabled={exportMutation.isLoading}
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Export
                      </button>
                    )}
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(run.id)}
                        className="btn-danger btn-sm"
                        disabled={deleteMutation.isLoading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {run.status === 'COMPLETED' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedCalcRun(run)}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      View Results →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <CalculatorIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No calculations yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by running your first emissions calculation.
            </p>
            {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
              <div className="mt-6">
                <button
                  onClick={() => setShowRunModal(true)}
                  className="btn-primary"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Run Calculation
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Run Calculation Modal */}
      {showRunModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Run Calculation</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleRunCalculation({
                    periodId: formData.get('periodId') as string,
                    factorLibraryVersion: formData.get('factorLibraryVersion') as string || undefined
                  })
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting Period
                    </label>
                    <select name="periodId" className="input" required>
                      <option value="">Select a period</option>
                      {periods?.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.year} {period.quarter ? `Q${period.quarter}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Factor Library Version
                    </label>
                    <select name="factorLibraryVersion" className="input">
                      <option value="">Latest (DEFRA-2025.1)</option>
                      <option value="DEFRA-2025.1">DEFRA-2025.1</option>
                      <option value="DEFRA-2024.1">DEFRA-2024.1</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowRunModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={runCalculationMutation.isLoading}
                  >
                    {runCalculationMutation.isLoading ? 'Starting...' : 'Run Calculation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {selectedCalcRun && (
        <CalcResultsModal
          calcRun={selectedCalcRun}
          onClose={() => setSelectedCalcRun(null)}
        />
      )}
    </div>
  )
}

// Results Modal Component
const CalcResultsModal: React.FC<{
  calcRun: CalcRun
  onClose: () => void
}> = ({ calcRun, onClose }) => {
  const { data: results, isLoading } = useQuery(
    ['calc-results', calcRun.id],
    () => calculationsApi.getCalcResults(calcRun.id),
    { enabled: !!calcRun.id }
  )

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Calculation Results - {calcRun.period?.year} Q{calcRun.period?.quarter || 1}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : results ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Scope 1</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(results.aggregation.scope1Total / 1000).toFixed(2)} tCO₂e
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Scope 2</p>
                <p className="text-2xl font-bold text-green-900">
                  {(results.aggregation.scope2Total / 1000).toFixed(2)} tCO₂e
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Scope 3</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {(results.aggregation.scope3Total / 1000).toFixed(2)} tCO₂e
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(results.aggregation.totalEmissions / 1000).toFixed(2)} tCO₂e
                </p>
              </div>
            </div>

            {/* Results Table */}
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Activity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Scope
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Emissions (kgCO₂e)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.results.slice(0, 20).map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {result.activity?.type.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`badge ${
                          result.scope === 'SCOPE_1' ? 'badge-info' :
                          result.scope === 'SCOPE_2' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {result.scope.replace('SCOPE_', 'Scope ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {result.quantityBase} {result.unitBase}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {result.resultKgCo2e.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No results available
          </div>
        )}
      </div>
    </div>
  )
}
