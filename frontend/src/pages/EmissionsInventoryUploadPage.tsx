import React, { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api, { sitesApi, periodsApi } from '../services/api';
import { 
  CloudArrowUpIcon, 
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

interface UploadResponse {
  uploadId: string;
  filename: string;
  size: number;
  status: string;
  message: string;
}

interface ParsedSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  yearRange: { min?: number; max?: number };
  activityTypes: { [key: string]: number };
  scopes: { [key: string]: number };
}

interface ParseResponse {
  uploadId: string;
  summary: ParsedSummary;
  sample: any[];
  errorDetails: any[];
  message: string;
}

interface ImportResponse {
  uploadId: string;
  totalParsed: number;
  totalImported: number;
  message: string;
  nextSteps: string[];
}

export const EmissionsInventoryUploadPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [parseResults, setParseResults] = useState<ParseResponse | null>(null);
  const [importResults, setImportResults] = useState<ImportResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'parse' | 'import' | 'complete'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch sites for dropdown
  const { data: sites } = useQuery(
    ['sites', user?.customerId],
    () => sitesApi.getAll(user!.customerId),
    { enabled: !!user?.customerId }
  );

  // Fetch reporting periods for dropdown
  const { data: periods } = useQuery(
    ['periods', user?.customerId],
    () => periodsApi.getAll(user!.customerId),
    { enabled: !!user?.customerId }
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [selectedSite, selectedPeriod]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  }, [selectedSite, selectedPeriod]);

  const handleUpload = async (file: File) => {
    if (!user?.customerId) {
      toast.error('User not authenticated');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', user.customerId);
    // Site and period will be auto-created from CSV data
    formData.append('autoCreate', 'true');

    try {
      const response = await api.post<UploadResponse>(
        `/emissions-inventory/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadedFile(response.data);
      setCurrentStep('parse');
      toast.success('File uploaded successfully! Click "Parse & Validate" to analyze.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadedFile) return;

    setIsParsing(true);
    try {
      const response = await api.post<ParseResponse>(
        `/emissions-inventory/${uploadedFile.uploadId}/parse`,
        {
          hasHeaders: true,
          skipRows: 0
        }
      );

      setParseResults(response.data);
      setCurrentStep('import');
      toast.success(`Parsed ${response.data.summary.validRows} valid rows!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to parse file');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile || !parseResults) return;

    if (parseResults.summary.validRows === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setIsImporting(true);
    try {
      const response = await api.post<ImportResponse>(
        `/emissions-inventory/${uploadedFile.uploadId}/import`,
        {
          skipErrors: true
        }
      );

      setImportResults(response.data);
      setCurrentStep('complete');
      queryClient.invalidateQueries(['activities']);
      toast.success(`Successfully imported ${response.data.totalImported} activities!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to import activities');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setParseResults(null);
    setImportResults(null);
    setCurrentStep('upload');
    setSelectedSite('');
    setSelectedPeriod('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Emissions Inventory Upload</h1>
        <p className="mt-2 text-gray-600">
          Upload and import GPC/CRF emissions inventory CSV files
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload File', icon: CloudArrowUpIcon },
            { key: 'parse', label: 'Parse & Validate', icon: TableCellsIcon },
            { key: 'import', label: 'Import Data', icon: ArrowUpTrayIcon },
            { key: 'complete', label: 'Complete', icon: CheckCircleIcon }
          ].map((step, idx, arr) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep === step.key
                      ? 'bg-blue-600 text-white'
                      : arr.findIndex(s => s.key === currentStep) > idx
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">{step.label}</span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    arr.findIndex(s => s.key === currentStep) > idx ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Upload File */}
      {currentStep === 'upload' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload CSV File</h2>
          
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>📋 Auto-Detection:</strong> Sites and reporting periods will be automatically created based on your CSV data. Just upload your file!
            </p>
          </div>

          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isUploading ? (
                <span className="text-blue-600">Uploading...</span>
              ) : (
                <>
                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">CSV, XLSX or XLS files only</p>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Flexible File Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Must include headers in the first row</li>
              <li>• <strong>Any Excel structure is supported</strong> - the system will auto-detect columns</li>
              <li>• Common columns: Year, Activity/Fuel Type, Amount/Quantity, Unit, Scope</li>
              <li>• The system will automatically infer missing information (scope, units, year)</li>
              <li>• Notation keys (NO, NA, NE, etc.) are supported for missing data</li>
              <li>• <strong>Minimum required:</strong> At least one text column (activity type) and one numeric column (quantity)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Parse Results */}
      {currentStep === 'parse' && uploadedFile && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Parse & Validate</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <DocumentIcon className="inline-block w-6 h-6 text-gray-500 mr-2" />
                <span className="font-medium">{uploadedFile.filename}</span>
              </div>
              <button
                onClick={handleParse}
                disabled={isParsing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? 'Parsing...' : 'Parse & Validate'}
              </button>
            </div>
          </div>

          {parseResults && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{parseResults.summary.totalRows}</div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">{parseResults.summary.validRows}</div>
                  <div className="text-sm text-green-700">Valid Rows</div>
                </div>
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-900">{parseResults.summary.errorRows}</div>
                  <div className="text-sm text-red-700">Error Rows</div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-900">{parseResults.summary.warningRows}</div>
                  <div className="text-sm text-yellow-700">Warning Rows</div>
                </div>
              </div>

              {/* Year Range */}
              {parseResults.summary.yearRange.min && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-blue-900">
                    Year Range: {parseResults.summary.yearRange.min} - {parseResults.summary.yearRange.max}
                  </div>
                </div>
              )}

              {/* Activity Types */}
              {Object.keys(parseResults.summary.activityTypes).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity Types Found:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(parseResults.summary.activityTypes).map(([type, count]) => (
                      <div key={type} className="bg-gray-100 rounded px-3 py-2 text-sm">
                        <span className="font-medium">{type}</span>: {count}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Details */}
              {parseResults.errorDetails.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2">
                    Errors (showing first {parseResults.errorDetails.length}):
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {parseResults.errorDetails.map((error: any, idx: number) => (
                      <div key={idx} className="text-sm text-red-800 mb-2">
                        <strong>Row {error.rowIndex}:</strong> {error.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Step Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setCurrentStep('import')}
                  disabled={parseResults.summary.validRows === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Import ({parseResults.summary.validRows} rows)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Import */}
      {currentStep === 'import' && parseResults && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 3: Import Activities</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Import</h3>
            <p className="text-blue-800 mb-4">
              {parseResults.summary.validRows} valid activities will be imported into your system.
              {parseResults.summary.errorRows > 0 && ` ${parseResults.summary.errorRows} rows with errors will be skipped.`}
            </p>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isImporting ? 'Importing...' : `Import ${parseResults.summary.validRows} Activities`}
            </button>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => setCurrentStep('parse')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Results
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {currentStep === 'complete' && importResults && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Successfully imported {importResults.totalImported} activities
            </p>

            {importResults.nextSteps && importResults.nextSteps.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps:</h3>
                <ul className="space-y-2">
                  {importResults.nextSteps.map((step, idx) => (
                    <li key={idx} className="text-blue-800 flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Upload Another File
              </button>
              <button
                onClick={() => window.location.href = '/activities'}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                View Activities
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
