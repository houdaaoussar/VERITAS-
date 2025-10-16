import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { activitiesApi } from '../../services/api';
import { Site, Activity, ReportingPeriod } from '../../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  periods: ReportingPeriod[];
}

const activityTypes: Activity['type'][] = ['ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'PETROL', 'LPG', 'BUSINESS_TRAVEL', 'WASTE', 'WATER', 'OTHER'];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, sites, periods }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Activity>>({
        siteId: '',
    periodId: '',
    type: 'ELECTRICITY',
    quantity: 0,
    unit: 'kWh',
    activityDateStart: new Date().toISOString().split('T')[0],
    activityDateEnd: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const createActivityMutation = useMutation(activitiesApi.create, {
    onSuccess: () => {
      toast.success('Activity created successfully!');
      queryClient.invalidateQueries('activities');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create activity.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivityMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Activity</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Site</label>
            <select name="siteId" value={formData.siteId} onChange={handleInputChange} className="input" required>
              <option value="" disabled>Select a site</option>
              {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Reporting Period</label>
            <select name="periodId" value={formData.periodId} onChange={handleInputChange} className="input" required>
              <option value="" disabled>Select a period</option>
              {periods.map(period => <option key={period.id} value={period.id}>{`${period.year} - Q${period.quarter}`}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Activity Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="input" required>
                {activityTypes.map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
                <div>
                    <label className="label">Quantity</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="input" required />
                </div>
                <div>
                    <label className="label">Unit</label>
                    <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} className="input" required />
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" name="activityDateStart" value={formData.activityDateStart} onChange={handleInputChange} className="input" required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" name="activityDateEnd" value={formData.activityDateEnd} onChange={handleInputChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="input" rows={3}></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createActivityMutation.isLoading}>
              {createActivityMutation.isLoading ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
