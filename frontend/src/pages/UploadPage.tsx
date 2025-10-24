import React, { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { uploadsApi, periodsApi } from '../services/api';
import { Upload } from '../types';
import { 
  CloudArrowUpIcon, 
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { parseCSV, readFileAsText } from '../utils/csvParser';

export const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [dragActive, setDragActive] = useState(false)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [selectedPeriodForImport, setSelectedPeriodForImport] = useState('')
  const [ingestData, setIngestData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch uploads
  const { data: uploads, isLoading } = useQuery<Upload[]>(
    ['uploads', user?.customerId],
    () => uploadsApi.getUploads(user!.customerId),
    { enabled: !!user?.customerId }
  )

  // Fetch reporting periods for import
  const { data: periods } = useQuery(
    ['periods', user?.customerId],
    () => periodsApi.getAll(user!.customerId),
    { enabled: !!user?.customerId }
  );

  // Upload mutation
  const parseMutation = useMutation(uploadsApi.parseFile, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['uploads']);
      setParsedData(data);
      toast.success('File parsed and validated successfully');
    },
    onError: (error: any) => {
      queryClient.invalidateQueries(['uploads']);
      toast.error(error.response?.data?.error || 'Failed to parse file');
    },
  });

  const uploadMutation = useMutation(uploadsApi.uploadFile, {
    onSuccess: (data) => {
      setCurrentUploadId(data.uploadId);
      // Store the ingest data if available
      if (data.ingestData) {
        setIngestData(data.ingestData);
      }
      toast.success('File uploaded, now parsing...');
      parseMutation.mutate(data.uploadId);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to upload file')
    }
  })

  // Import activities mutation
  const importMutation = useMutation(uploadsApi.importActivities, {
    onSuccess: () => {
      // Save parsed data to localStorage for calculator
      if (parsedData && parsedData.sample) {
        localStorage.setItem('uploadedEmissionData', JSON.stringify(parsedData.sample));
        toast.success('Activities imported successfully! Data is now available in the Calculator.');
      } else {
        toast.success('Activities imported successfully');
      }
      queryClient.invalidateQueries(['uploads'])
      queryClient.invalidateQueries(['activities'])
      setParsedData(null)
      setCurrentUploadId(null)
      setSelectedPeriodForImport('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to import activities')
    }
  })

  // Delete upload mutation
  const deleteMutation = useMutation(uploadsApi.deleteUpload, {
    onSuccess: () => {
      queryClient.invalidateQueries(['uploads'])
      toast.success('Upload deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete upload')
    }
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [user]);

  const handleFiles = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV or Excel file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // CLIENT-SIDE PARSING: Parse CSV directly in browser
    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      try {
        toast.loading('Parsing CSV file...');
        
        // Read file content
        const content = await readFileAsText(file);
        
        // Parse CSV
        const result = parseCSV(content);
        
        toast.dismiss();
        toast.success('File parsed successfully!');
        
        // Set parsed data for preview
        setParsedData(result);
        setCurrentUploadId('client-side-' + Date.now());
        
        // Store for import
        localStorage.setItem('clientSideParsedData', JSON.stringify(result));
        
        return;
      } catch (error: any) {
        toast.dismiss();
        toast.error('Failed to parse CSV: ' + error.message);
        console.error('CSV parsing error:', error);
        return;
      }
    }

    // Fallback: Try backend upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('customerId', user!.customerId)

    uploadMutation.mutate(formData)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleImport = (uploadId: string, periodId?: string) => {
    if (!periodId) {
      toast.error('Please select a reporting period');
      return;
    }
    importMutation.mutate({ uploadId, customerId: user!.customerId, periodId });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this upload?')) {
      deleteMutation.mutate(id)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `Date,Site,Activity Type,Scope,Quantity,Unit,Description\n2024-01-15,Main Office,ELECTRICITY_CONSUMPTION,SCOPE_2,1500,kWh,Monthly electricity usage`;

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'activities_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded successfully')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'PROCESSING':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success'
      case 'FAILED':
        return 'badge-error'
      case 'PROCESSING':
        return 'badge-info'
      default:
        return 'badge-secondary'
    }
  }

  if (isLoading) return <div>Loading...</div>; 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Upload</h1>
        <button
          onClick={downloadTemplate}
          className="btn-secondary"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Download Template
        </button>
      </div>

      {/* Upload Form */}
      {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Upload Activity Data</h3>
            <p className="text-sm text-gray-600">Upload CSV or Excel files.</p>
          </div>
          <div className="card-content">
            {/* Drag and Drop Area */}
            <div
              className={`relative cursor-pointer border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors ${
                dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadMutation.isLoading}
              />
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV or Excel files up to 10MB</p>
              {uploadMutation.isLoading && (
                <div className="mt-4">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100">
                    <ClockIcon className="animate-spin -ml-1 mr-3 h-4 w-4" />
                    Uploading...
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Required columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Date (YYYY-MM-DD format)</li>
                <li>Site (site name or ID)</li>
                <li>Activity Type (e.g., ELECTRICITY_CONSUMPTION, NATURAL_GAS_COMBUSTION)</li>
                <li>Scope (SCOPE_1, SCOPE_2, or SCOPE_3)</li>
                <li>Quantity (numeric value)</li>
                <li>Unit (e.g., kWh, m3, km, kg)</li>
                <li>Description (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">CSV Data Preview</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{parsedData.totalRows}</div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">{parsedData.validRows}</div>
                <div className="text-sm text-green-700">Valid Rows</div>
              </div>
              <div className="bg-red-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-900">{parsedData.errorRows}</div>
                <div className="text-sm text-red-700">Error Rows</div>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">{parsedData.columns?.length || 0}</div>
                <div className="text-sm text-blue-700">Columns</div>
              </div>
            </div>

            {/* Sample Data Table */}
            {parsedData.sample && parsedData.sample.length > 0 && (
              <div className="overflow-x-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Data (first 5 rows)</h4>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                      {parsedData.columns?.map((col: string) => (
                        <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.sample.map((row: any, idx: number) => (
                      <tr key={idx} className={row.errors?.length > 0 ? 'bg-red-50' : ''}>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.rowIndex}</td>
                        {parsedData.columns?.map((col: string) => (
                          <td key={col} className="px-4 py-2 text-sm text-gray-900">
                            {row[col] ? String(row[col]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Errors */}
            {parsedData.errors && parsedData.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-700 mb-2">Errors Found:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {parsedData.errors.map((error: any, idx: number) => (
                    <div key={idx} className="text-sm text-red-800 mb-2">
                      <strong>Row {error.row_index || error.rowIndex}:</strong> {
                        Array.isArray(error.errors) 
                          ? error.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
                          : JSON.stringify(error.errors || error)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Period Selection for Import */}
            {parsedData.validRows > 0 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Select Reporting Period for Import *
                </label>
                <select
                  value={selectedPeriodForImport}
                  onChange={(e) => setSelectedPeriodForImport(e.target.value)}
                  className="input w-full md:w-64"
                  required
                >
                  <option value="">Choose a period...</option>
                  {periods?.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.year} {period.quarter ? `Q${period.quarter}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => { setParsedData(null); setCurrentUploadId(null); setSelectedPeriodForImport(''); }}
                className="btn-secondary"
              >
                Close Preview
              </button>
              {parsedData.validRows > 0 && currentUploadId && (
                <button
                  onClick={() => handleImport(currentUploadId, selectedPeriodForImport)}
                  className="btn-primary"
                  disabled={importMutation.isLoading || !selectedPeriodForImport}
                >
                  {importMutation.isLoading ? 'Importing...' : `Import ${parsedData.validRows} Valid Rows`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload History */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Upload History</h3>
        </div>
        <div className="card-content">
          {uploads && uploads.length > 0 ? (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(upload.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {upload.originalFilename}
                          </h4>
                          <span className={`badge ${getStatusColor(upload.status)}`}>
                            {upload.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Site:</span> {upload.site?.name}
                          </div>
                          <div>
                            <span className="font-medium">Period:</span> {upload.period?.year} Q{upload.period?.quarter || 1}
                          </div>
                          <div>
                            <span className="font-medium">Uploaded:</span> {new Date(upload.createdAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">By:</span> {upload.uploadedBy?.email}
                          </div>
                        </div>

                        {upload.validationResults && typeof upload.validationResults === 'string' && (() => {
                          const results = JSON.parse(upload.validationResults);
                          return (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div><span className="font-medium text-green-600">Valid:</span> {results.validRows}</div>
                                <div><span className="font-medium text-red-600">Invalid:</span> {results.invalidRows}</div>
                                <div><span className="font-medium text-gray-600">Total:</span> {results.totalRows}</div>
                              </div>
                              {results.errors && results.errors.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-red-600">Errors:</p>
                                  <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                                    {results.errors.slice(0, 5).map((error: string, index: number) => (
                                      <li key={index}>{error}</li>
                                    ))}
                                    {results.errors.length > 5 && <li>... and {results.errors.length - 5} more errors</li>}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {upload.errorMessage && (
                          <div className="mt-3 p-3 bg-red-50 rounded-md">
                            <p className="text-sm text-red-600">{upload.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {upload.status === 'COMPLETED' && upload.validationResults && typeof upload.validationResults === 'string' && JSON.parse(upload.validationResults).validRows > 0 && (
                        <button
                          onClick={() => handleImport(upload.id, upload.period?.id)}
                          className="btn-primary btn-sm"
                          disabled={importMutation.isLoading}
                        >
                          Import Activities
                        </button>
                      )}
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(upload.id)}
                          className="btn-danger btn-sm"
                          disabled={deleteMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No uploads yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your first activity data file to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
