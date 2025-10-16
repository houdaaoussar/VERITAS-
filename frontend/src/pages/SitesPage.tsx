import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { sitesApi } from '../services/api'
import { Site } from '../types'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export const SitesPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch sites
  const { data: sites, isLoading } = useQuery(
    ['sites', user?.customerId],
    () => sitesApi.getAll(user!.customerId),
    { enabled: !!user?.customerId }
  )

  // Create/Update site mutation
  const createMutation = useMutation(sitesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sites'])
      toast.success('Site created successfully')
      setShowModal(false)
      setEditingSite(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create site')
    }
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => sitesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sites'])
        toast.success('Site updated successfully')
        setShowModal(false)
        setEditingSite(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update site')
      }
    }
  )

  // Delete site mutation
  const deleteMutation = useMutation(sitesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sites'])
      toast.success('Site deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete site')
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const siteData = {
      customerId: user!.customerId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      country: formData.get('country') as string,
      postalCode: formData.get('postalCode') as string,
      contactName: formData.get('contactName') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      siteType: formData.get('siteType') as string,
      floorArea: parseFloat(formData.get('floorArea') as string) || null,
      employeeCount: parseInt(formData.get('employeeCount') as string) || null
    }

    if (editingSite) {
      updateMutation.mutate({ id: editingSite.id, data: siteData })
    } else {
      createMutation.mutate(siteData)
    }
  }

  const handleEdit = (site: Site) => {
    setEditingSite(site)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      deleteMutation.mutate(id)
    }
  }

  // Filter sites based on search term
  const filteredSites = sites?.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.country.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
        {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
          <button
            onClick={() => {
              setEditingSite(null)
              setShowModal(true)
            }}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Site
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-content">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sites by name, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      {filteredSites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <div key={site.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{site.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {site.siteType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(site)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(site.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {site.description && (
                  <p className="text-gray-600 text-sm mb-4">{site.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      <p>{site.address}</p>
                      <p>{site.city}, {site.state} {site.postalCode}</p>
                      <p>{site.country}</p>
                    </div>
                  </div>

                  {site.contactName && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">Contact</p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">{site.contactName}</p>
                        {site.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            <a
                              href={`mailto:${site.contactEmail}`}
                              className="text-sm text-primary-600 hover:text-primary-900"
                            >
                              {site.contactEmail}
                            </a>
                          </div>
                        )}
                        {site.contactPhone && (
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <a
                              href={`tel:${site.contactPhone}`}
                              className="text-sm text-primary-600 hover:text-primary-900"
                            >
                              {site.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(site.floorArea || site.employeeCount) && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {site.floorArea && (
                          <div>
                            <p className="font-medium text-gray-500">Floor Area</p>
                            <p className="text-gray-900">{site.floorArea.toLocaleString()} m²</p>
                          </div>
                        )}
                        {site.employeeCount && (
                          <div>
                            <p className="font-medium text-gray-500">Employees</p>
                            <p className="text-gray-900">{site.employeeCount}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No sites found' : 'No sites yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms.'
              : 'Get started by adding your first site location.'
            }
          </p>
          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && !searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingSite(null)
                  setShowModal(true)
                }}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Site
              </button>
            </div>
          )}
        </div>
      )}

      {/* Site Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSite ? 'Edit Site' : 'Add New Site'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingSite?.name || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Type *
                    </label>
                    <select
                      name="siteType"
                      defaultValue={editingSite?.siteType || ''}
                      className="input"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="OFFICE">Office</option>
                      <option value="MANUFACTURING">Manufacturing</option>
                      <option value="WAREHOUSE">Warehouse</option>
                      <option value="RETAIL">Retail</option>
                      <option value="DATA_CENTER">Data Center</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={editingSite?.description || ''}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={editingSite?.address || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingSite?.city || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      defaultValue={editingSite?.state || ''}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      defaultValue={editingSite?.country || ''}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      defaultValue={editingSite?.postalCode || ''}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Area (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="floorArea"
                      defaultValue={editingSite?.floorArea || ''}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      name="employeeCount"
                      defaultValue={editingSite?.employeeCount || ''}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      defaultValue={editingSite?.contactName || ''}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      defaultValue={editingSite?.contactEmail || ''}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      defaultValue={editingSite?.contactPhone || ''}
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingSite(null)
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
                      : editingSite
                      ? 'Update Site'
                      : 'Create Site'
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
