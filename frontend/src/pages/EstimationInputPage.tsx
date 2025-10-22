import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface EstimationInputData {
  // Employee Commuting
  numberOfEmployees?: number;
  avgCommuteKm?: number;
  avgWorkdaysPerYear?: number;
  transportSplitCar?: number;
  transportSplitPublic?: number;
  transportSplitWalk?: number;
  
  // Business Travel
  businessTravelSpendGBP?: number;
  avgFlightDistanceKm?: number;
  numberOfFlights?: number;
  
  // Purchased Goods & Services
  annualSpendGoodsGBP?: number;
  annualSpendServicesGBP?: number;
  
  // Waste
  wasteTonnes?: number;
  wasteRecycledPercent?: number;
  
  // Office/Facility
  officeAreaM2?: number;
  dataCenter?: boolean;
  dataCenterServers?: number;
  
  // Metadata
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

interface EstimatedEmission {
  category: string;
  scope: string;
  estimatedKgCo2e: number;
  confidenceLevel: string;
  methodology: string;
  inputs: any;
}

const EstimationInputPage: React.FC = () => {
  const { customerId, periodId } = useParams<{ customerId: string; periodId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<EstimationInputData>({
    avgWorkdaysPerYear: 220,
    transportSplitCar: 70,
    transportSplitPublic: 20,
    transportSplitWalk: 10,
    wasteRecycledPercent: 30,
    confidenceLevel: 'MEDIUM',
    dataCenter: false
  });
  
  const [estimations, setEstimations] = useState<EstimatedEmission[]>([]);
  const [totalEmissions, setTotalEmissions] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing estimation data
  useEffect(() => {
    loadEstimationData();
  }, [customerId, periodId]);

  const loadEstimationData = async () => {
    try {
      const response = await fetch(`/api/estimations/${customerId}/${periodId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Error loading estimation data:', error);
    }
  };

  const handleInputChange = (field: keyof EstimationInputData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateTransportSplit = (): boolean => {
    const car = formData.transportSplitCar || 0;
    const publicT = formData.transportSplitPublic || 0;
    const walk = formData.transportSplitWalk || 0;
    const total = car + publicT + walk;
    
    if (Math.abs(total - 100) > 0.01) {
      setMessage({ type: 'error', text: 'Transport mode percentages must sum to 100%' });
      return false;
    }
    return true;
  };

  const handlePreview = async () => {
    if (!validateTransportSplit()) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/estimations/${customerId}/${periodId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to preview estimations');
      
      const data = await response.json();
      setEstimations(data.estimations);
      setTotalEmissions(data.totalKgCo2e);
      setMessage({ type: 'success', text: 'Preview calculated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateTransportSplit()) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const userId = localStorage.getItem('userId') || 'default-user-id';
      
      const response = await fetch('/api/estimations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customerId,
          reportingPeriodId: periodId,
          createdBy: userId
        })
      });
      
      if (!response.ok) throw new Error('Failed to save estimation data');
      
      setMessage({ type: 'success', text: 'Estimation data saved successfully!' });
      
      // Recalculate after saving
      await handlePreview();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scope 3 Estimation Inputs</h1>
              <p className="text-gray-600 mt-2">
                Provide estimation data for Scope 3 emissions when direct activity data is not available.
                VERITAS™ will use standardized DEFRA/IPCC factors to estimate emissions.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Employee Commuting */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🚗 Employee Commuting
                <span className="ml-2 text-sm font-normal text-gray-500">(Scope 3)</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfEmployees || ''}
                    onChange={(e) => handleInputChange('numberOfEmployees', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Commute Distance (km, one-way)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.avgCommuteKm || ''}
                    onChange={(e) => handleInputChange('avgCommuteKm', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Workdays per Year
                  </label>
                  <input
                    type="number"
                    value={formData.avgWorkdaysPerYear || ''}
                    onChange={(e) => handleInputChange('avgWorkdaysPerYear', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 220"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Mode Split (must sum to 100%)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Car (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.transportSplitCar || ''}
                      onChange={(e) => handleInputChange('transportSplitCar', parseFloat(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Public Transport (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.transportSplitPublic || ''}
                      onChange={(e) => handleInputChange('transportSplitPublic', parseFloat(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Walk/Cycle (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.transportSplitWalk || ''}
                      onChange={(e) => handleInputChange('transportSplitWalk', parseFloat(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Travel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                ✈️ Business Travel
                <span className="ml-2 text-sm font-normal text-gray-500">(Scope 3)</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Flights
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfFlights || ''}
                    onChange={(e) => handleInputChange('numberOfFlights', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Flight Distance (km)
                  </label>
                  <input
                    type="number"
                    value={formData.avgFlightDistanceKm || ''}
                    onChange={(e) => handleInputChange('avgFlightDistanceKm', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Business Travel Spend (£)
                  </label>
                  <input
                    type="number"
                    value={formData.businessTravelSpendGBP || ''}
                    onChange={(e) => handleInputChange('businessTravelSpendGBP', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            </div>

            {/* Purchased Goods & Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                📦 Purchased Goods & Services
                <span className="ml-2 text-sm font-normal text-gray-500">(Scope 3)</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Spend on Goods (£)
                  </label>
                  <input
                    type="number"
                    value={formData.annualSpendGoodsGBP || ''}
                    onChange={(e) => handleInputChange('annualSpendGoodsGBP', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Spend on Services (£)
                  </label>
                  <input
                    type="number"
                    value={formData.annualSpendServicesGBP || ''}
                    onChange={(e) => handleInputChange('annualSpendServicesGBP', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 75000"
                  />
                </div>
              </div>
            </div>

            {/* Waste */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🗑️ Waste Generated
                <span className="ml-2 text-sm font-normal text-gray-500">(Scope 3)</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Waste (tonnes)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.wasteTonnes || ''}
                    onChange={(e) => handleInputChange('wasteTonnes', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Recycled (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.wasteRecycledPercent || ''}
                    onChange={(e) => handleInputChange('wasteRecycledPercent', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>

            {/* Office/Facility Data */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏢 Office/Facility Data
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Area (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.officeAreaM2 || ''}
                    onChange={(e) => handleInputChange('officeAreaM2', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Center
                  </label>
                  <select
                    value={formData.dataCenter ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('dataCenter', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                
                {formData.dataCenter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Servers
                    </label>
                    <input
                      type="number"
                      value={formData.dataCenterServers || ''}
                      onChange={(e) => handleInputChange('dataCenterServers', parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📝 Additional Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence Level
                  </label>
                  <select
                    value={formData.confidenceLevel}
                    onChange={(e) => handleInputChange('confidenceLevel', e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HIGH">High - Based on accurate data</option>
                    <option value="MEDIUM">Medium - Based on estimates</option>
                    <option value="LOW">Low - Based on assumptions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes or assumptions..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Calculating...' : '🔍 Preview Estimations'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {saving ? 'Saving...' : '💾 Save & Calculate'}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Estimated Emissions
              </h2>
              
              {estimations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Click "Preview Estimations" to see results</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Estimated Emissions</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {(totalEmissions / 1000).toFixed(2)} <span className="text-lg">tonnes CO₂e</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {totalEmissions.toFixed(0)} kg CO₂e
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {estimations.map((est, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="font-medium text-gray-900">{est.category}</div>
                        <div className="text-2xl font-bold text-gray-700 mt-1">
                          {(est.estimatedKgCo2e / 1000).toFixed(2)} <span className="text-sm">tonnes</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence: <span className={`font-medium ${
                            est.confidenceLevel === 'HIGH' ? 'text-green-600' :
                            est.confidenceLevel === 'MEDIUM' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>{est.confidenceLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-xs text-yellow-800">
                      ℹ️ These are estimated emissions based on the inputs provided. 
                      For more accurate results, upload actual activity data.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimationInputPage;
