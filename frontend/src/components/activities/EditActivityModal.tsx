import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { activitiesApi } from '../../services/api';
import { Site, Activity, ReportingPeriod } from '../../types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  sites: Site[];
  periods: ReportingPeriod[];
}

const activityTypes: Activity['type'][] = ['ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'PETROL', 'LPG', 'BUSINESS_TRAVEL', 'WASTE', 'WATER', 'OTHER'];

export const EditActivityModal: React.FC<EditActivityModalProps> = ({ isOpen, onClose, activity, sites, periods }) => {
  const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<Activity>>({
    siteId: '',
    periodId: '',
    type: 'OTHER',
    quantity: 0,
    unit: '',
    activityDateStart: '',
    activityDateEnd: '',
    source: '',
    notes: '',
  });

        useEffect(() => {
    if (activity) {
      setFormData({
        siteId: activity.siteId || '',
        periodId: activity.periodId || '',
        type: activity.type || 'OTHER',
        quantity: activity.quantity || 0,
        unit: activity.unit || '',
        activityDateStart: activity.activityDateStart ? new Date(activity.activityDateStart).toISOString().split('T')[0] : '',
        activityDateEnd: activity.activityDateEnd ? new Date(activity.activityDateEnd).toISOString().split('T')[0] : '',
        source: activity.source || '',
        notes: activity.notes || '',
      });
        } else {
      setFormData({
        siteId: '',
        periodId: '',
        type: 'OTHER',
        quantity: 0,
        unit: '',
        activityDateStart: '',
        activityDateEnd: '',
        source: '',
        notes: '',
      });
    }
  }, [activity]);

  const updateActivityMutation = useMutation(
    (updatedActivity: Partial<Activity>) => activitiesApi.update(activity!.id, updatedActivity),
    {
      onSuccess: () => {
        toast.success('Activity updated successfully!');
        queryClient.invalidateQueries('activities');
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update activity.');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
                const payload: Partial<Activity> = {
      type: formData.type,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      activityDateStart: formData.activityDateStart,
      activityDateEnd: formData.activityDateEnd,
      source: formData.source || undefined,
      notes: formData.notes,
    };

    updateActivityMutation.mutate(payload);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Activity</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Site</label>
            <select name="siteId" value={formData.siteId} onChange={handleInputChange} className="input" required disabled>
              <option value="" disabled>Select a site</option>
              {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Reporting Period</label>
            <select name="periodId" value={formData.periodId} onChange={handleInputChange} className="input" required disabled>
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
            <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} className="input" rows={3}></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={updateActivityMutation.isLoading}>
              {updateActivityMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
