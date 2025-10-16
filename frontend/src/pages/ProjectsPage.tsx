import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi } from '../services/api'
import { Project } from '../types'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import toast from 'react-hot-toast'

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')

  // Fetch projects
  const { data: projects, isLoading } = useQuery(
    ['projects', user?.customerId, filterStatus, filterType],
    () => projectsApi.getAll({
      customerId: user!.customerId,
            ...(filterStatus && { lifecycleState: filterStatus }),
      ...(filterType && { type: filterType })
    }),
    { enabled: !!user?.customerId }
  )

  // Fetch project statistics
  const { data: stats } = useQuery(
    ['project-stats', user?.customerId],
    () => projectsApi.getStats(user!.customerId),
    { enabled: !!user?.customerId }
  )

  // Create/Update project mutation
  const createMutation = useMutation(projectsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      queryClient.invalidateQueries(['project-stats'])
      toast.success('Project created successfully')
      setShowModal(false)
      setEditingProject(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create project')
    }
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => projectsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects'])
        queryClient.invalidateQueries(['project-stats'])
        toast.success('Project updated successfully')
        setShowModal(false)
        setEditingProject(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update project')
      }
    }
  )

  // Delete project mutation
  const deleteMutation = useMutation(projectsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      queryClient.invalidateQueries(['project-stats'])
      toast.success('Project deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete project')
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const projectData = {
      customerId: user!.customerId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      lifecycleState: formData.get('status') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      targetReduction: parseFloat(formData.get('targetReduction') as string) || 0,
      budgetAllocated: parseFloat(formData.get('budgetAllocated') as string) || 0
    }

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: projectData })
    } else {
      createMutation.mutate(projectData)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'ON_HOLD':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success'
      case 'IN_PROGRESS':
        return 'badge-info'
      case 'ON_HOLD':
        return 'badge-warning'
      default:
        return 'badge-secondary'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 10) return 'text-red-600'
    if (variance > 0) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Prepare chart data
  const projectProgressData = projects?.slice(0, 10).map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    target: project.targetReduction,
    actual: project.actualReduction || 0,
    variance: ((project.actualReduction || 0) - project.targetReduction) / project.targetReduction * 100
  })) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects & Initiatives</h1>
        {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
          <button
            onClick={() => {
              setEditingProject(null)
              setShowModal(true)
            }}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Project
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(stats.totalBudget / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reduction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.totalReduction / 1000).toFixed(1)}t
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Chart */}
      {projectProgressData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Project Progress vs Targets</h3>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} tCO₂e`,
                    name === 'target' ? 'Target' : 'Actual'
                  ]} 
                />
                <Bar dataKey="target" fill="#94A3B8" name="Target" />
                <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="ENERGY_EFFICIENCY">Energy Efficiency</option>
                <option value="RENEWABLE_ENERGY">Renewable Energy</option>
                <option value="PROCESS_OPTIMIZATION">Process Optimization</option>
                <option value="WASTE_REDUCTION">Waste Reduction</option>
                <option value="TRANSPORTATION">Transportation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(project.status)}
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <span className={`badge ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-500">Type</p>
                        <p className="text-gray-900">{project.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Timeline</p>
                        <p className="text-gray-900">
                          {new Date(project.startDate).toLocaleDateString()} - {' '}
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Target Reduction</p>
                        <p className="text-gray-900">{project.targetReduction.toFixed(2)} tCO₂e</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Budget</p>
                        <p className="text-gray-900">${project.budgetAllocated.toLocaleString()}</p>
                      </div>
                    </div>

                    {project.actualReduction !== null && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-500">Actual Reduction</p>
                            <p className="text-gray-900">{project.actualReduction.toFixed(2)} tCO₂e</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">Variance</p>
                            <p className={`font-medium ${getVarianceColor(project.variance || 0)}`}>
                              {project.variance !== null ? `${project.variance.toFixed(1)}%` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">Budget Spent</p>
                            <p className="text-gray-900">
                              ${project.budgetSpent?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="btn-secondary btn-sm"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="btn-danger btn-sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first sustainability project.
            </p>
            {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setEditingProject(null)
                    setShowModal(true)
                  }}
                  className="btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingProject?.name || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingProject?.description || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      defaultValue={editingProject?.type || ''}
                      className="input"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="ENERGY_EFFICIENCY">Energy Efficiency</option>
                      <option value="RENEWABLE_ENERGY">Renewable Energy</option>
                      <option value="PROCESS_OPTIMIZATION">Process Optimization</option>
                      <option value="WASTE_REDUCTION">Waste Reduction</option>
                      <option value="TRANSPORTATION">Transportation</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingProject?.status || 'PLANNING'}
                      className="input"
                      required
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={editingProject?.startDate ? 
                        new Date(editingProject.startDate).toISOString().split('T')[0] : ''
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={editingProject?.endDate ? 
                        new Date(editingProject.endDate).toISOString().split('T')[0] : ''
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Reduction (tCO₂e)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="targetReduction"
                      defaultValue={editingProject?.targetReduction || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Allocated ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="budgetAllocated"
                      defaultValue={editingProject?.budgetAllocated || ''}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProject(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {createMutation.isLoading || updateMutation.isLoading
                      ? 'Saving...'
                      : editingProject
                      ? 'Update Project'
                      : 'Create Project'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
