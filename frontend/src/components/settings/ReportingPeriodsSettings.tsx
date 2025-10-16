import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { periodsApi } from '../../services/api';
import { ReportingPeriod } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const ReportingPeriodsSettings: React.FC = () => {
  const { user } = useAuth();

  const { data: periods, isLoading } = useQuery(
    ['reportingPeriods', user?.customerId],
    () => periodsApi.getAll(user!.customerId),
    { enabled: !!user?.customerId }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Reporting Periods</h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage your company's reporting periods for emissions calculations.
          </p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Period
        </button>
      </div>

      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {periods?.map((period: ReportingPeriod) => (
                  <tr key={period.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.quarter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(period.fromDate).toLocaleDateString()} - {new Date(period.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
