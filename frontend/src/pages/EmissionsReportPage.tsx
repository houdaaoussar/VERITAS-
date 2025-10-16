import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { reportingApi } from '../services/api';
import { BuildingOfficeIcon, BoltIcon, LinkIcon } from '@heroicons/react/24/outline';

interface EmissionRow {
  emissionSource?: string;
  ghgCategory?: string;
  activityData: number;
  unit: string;
  emissionFactor: number;
  source: string;
  co2e: number;
  methodology?: string;
}

interface DetailedReport {
  scope1: EmissionRow[];
  scope2: EmissionRow[];
  scope3: EmissionRow[];
}

const EmissionsReportPage: React.FC = () => {
  const { user } = useAuth();

  const { data: report, isLoading, error } = useQuery<DetailedReport>(
    ['detailedReport', user?.customerId],
    () => reportingApi.getDetailedReport({ customerId: user!.customerId }),
    {
      enabled: !!user?.customerId,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading the report. Please try again later.</div>;
  }

  const scope1Total = report?.scope1.reduce((sum, row) => sum + row.co2e, 0) || 0;
  const scope2Total = report?.scope2.reduce((sum, row) => sum + row.co2e, 0) || 0;
  const scope3Total = report?.scope3.reduce((sum, row) => sum + row.co2e, 0) || 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Emissions Report</h1>

      {/* Scope 1 Table */}
      <div className="card">
        <div className="card-header flex items-center space-x-3">
          <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold">Scope 1: Direct Emissions</h2>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emission Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Data (Unit)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emission Factor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CO2e (tonnes)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report?.scope1.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.emissionSource}</td>
                  <td className="px-6 py-4">{row.activityData} {row.unit}</td>
                  <td className="px-6 py-4">{row.emissionFactor.toExponential(2)}</td>
                  <td className="px-6 py-4">{row.source}</td>
                  <td className="px-6 py-4 text-right">{row.co2e.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right font-bold">Scope 1 Total:</td>
                <td className="px-6 py-3 text-right font-bold">{scope1Total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Scope 2 Table */}
      <div className="card">
        <div className="card-header flex items-center space-x-3">
          <BoltIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold">Scope 2: Indirect Emissions from Energy</h2>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emission Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Data (Unit)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emission Factor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CO2e (tonnes)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report?.scope2.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.emissionSource}</td>
                  <td className="px-6 py-4">{row.activityData} {row.unit}</td>
                  <td className="px-6 py-4">{row.emissionFactor.toExponential(2)}</td>
                  <td className="px-6 py-4">{row.source}</td>
                  <td className="px-6 py-4 text-right">{row.co2e.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right font-bold">Scope 2 Total:</td>
                <td className="px-6 py-3 text-right font-bold">{scope2Total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Scope 3 Table */}
      <div className="card">
        <div className="card-header flex items-center space-x-3">
          <LinkIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold">Scope 3: Value Chain Indirect Emissions</h2>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GHG Protocol Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Methodology / Data Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emission Factor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CO2e (tonnes)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report?.scope3.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.ghgCategory}</td>
                  <td className="px-6 py-4">{row.methodology}</td>
                  <td className="px-6 py-4">{row.activityData} {row.unit}</td>
                  <td className="px-6 py-4">{row.emissionFactor.toExponential(2)}</td>
                  <td className="px-6 py-4">{row.source}</td>
                  <td className="px-6 py-4 text-right">{row.co2e.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-3 text-right font-bold">Scope 3 Total:</td>
                <td className="px-6 py-3 text-right font-bold">{scope3Total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EmissionsReportPage;
