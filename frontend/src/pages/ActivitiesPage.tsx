import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { activitiesApi, sitesApi, periodsApi } from '../services/api';
import { Activity, Site, ReportingPeriod, PaginatedResponse } from '../types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { AddActivityModal } from '../components/activities/AddActivityModal';
import { EditActivityModal } from '../components/activities/EditActivityModal';

export const ActivitiesPage: React.FC = () => {
  const { user } = useAuth();
    const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filters, setFilters] = useState({ siteId: '', type: '', search: '' });

    const { data: activitiesResponse, isLoading } = useQuery<PaginatedResponse<Activity>>(
    ['activities', user?.customerId, page, filters],
    () => activitiesApi.getAll({ customerId: user!.customerId, page, limit: 12, ...filters }),
    { enabled: !!user?.customerId, keepPreviousData: true }
  );

    const { data: sites } = useQuery<Site[]>(['sites', user?.customerId], () => sitesApi.getAll(user!.customerId), { enabled: !!user?.customerId });

  const { data: periods } = useQuery<ReportingPeriod[]>(['periods', user?.customerId], () => periodsApi.getAll(user!.customerId), { enabled: !!user?.customerId });

  const deleteMutation = useMutation(activitiesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      toast.success('Activity deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete activity');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteMutation.mutate(id);
    }
  };

  const activityTypes = ['ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'PETROL', 'LPG', 'BUSINESS_TRAVEL', 'WASTE', 'WATER', 'OTHER'];

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ELECTRICITY: 'bg-blue-100 text-blue-800',
      NATURAL_GAS: 'bg-orange-100 text-orange-800',
      DIESEL: 'bg-red-100 text-red-800',
      PETROL: 'bg-red-100 text-red-800',
      LPG: 'bg-purple-100 text-purple-800',
      BUSINESS_TRAVEL: 'bg-green-100 text-green-800',
      WASTE: 'bg-yellow-100 text-yellow-800',
      WATER: 'bg-cyan-100 text-cyan-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

    return (
    <div className="space-y-6 py-6">
      {sites && periods && (
        <>
          <AddActivityModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            sites={sites} 
            periods={periods}
          />
          <EditActivityModal
            isOpen={!!editingActivity}
            onClose={() => setEditingActivity(null)}
            activity={editingActivity}
            sites={sites}
            periods={periods}
          />
        </>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Activity
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" className="input pl-10" placeholder="Search activities..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
              <select className="input" value={filters.siteId} onChange={(e) => setFilters({ ...filters, siteId: e.target.value })}>
                <option value="">All Sites</option>
                {sites?.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                {activityTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ siteId: '', type: '', search: '' })} className="btn-secondary w-full">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && !activitiesResponse ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse">
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activitiesResponse?.data?.length === 0 ? (
        <div className="text-center py-12 card">
          <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
          <p className="mt-1 text-sm text-gray-500">Adjust your filters or upload new activity data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activitiesResponse?.data?.map((activity: Activity) => (
            <div key={activity.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="p-4 flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeColor(activity.type)}`}>
                    {activity.type.replace('_', ' ')}
                  </span>
                  <div className="text-sm font-semibold text-gray-800">{activity.quantity.toLocaleString()} {activity.unit}</div>
                </div>
                <div className="flex items-start text-sm text-gray-600 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>{activity.site?.name}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>{new Date(activity.activityDateStart).toLocaleDateString()} - {new Date(activity.activityDateEnd).toLocaleDateString()}</span>
                </div>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                <div className="bg-gray-50 p-3 flex justify-end space-x-2 border-t border-gray-200">
                  <button onClick={() => setEditingActivity(activity)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(activity.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md" disabled={deleteMutation.isLoading}>
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activitiesResponse && activitiesResponse.pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-700">
            Showing {((activitiesResponse.pagination.page - 1) * activitiesResponse.pagination.limit) + 1} to{' '}
            {Math.min(activitiesResponse.pagination.page * activitiesResponse.pagination.limit, activitiesResponse.pagination.total)} of{' '}
            {activitiesResponse.pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-50">
              Previous
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page >= activitiesResponse.pagination.pages} className="btn-secondary btn-sm disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
