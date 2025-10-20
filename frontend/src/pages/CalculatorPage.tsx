import React, { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

// --- Type Definitions ---
type ActivityRow = {
  id: number;
  source: string;
  activity: number;
  unit: string;
  factor: number;
  factorSource: string;
  co2e: number;
};

type Scope3ActivityRow = ActivityRow & {
  methodology: 'tier1' | 'tier2';
};

// --- Initial Data ---
const initialScope1Data: ActivityRow[] = [
  { id: 1, source: 'Stationary Combustion (Natural Gas)', activity: 5000, unit: 'kWh', factor: 0.0002027, factorSource: 'DESNZ, 2025', co2e: 1.01 },
  { id: 2, source: 'Mobile Combustion (Diesel)', activity: 1500, unit: 'kWh', factor: 0.000239, factorSource: 'DESNZ, 2025', co2e: 0.36 },
  { id: 3, source: 'Process Emissions', activity: 0.5, unit: 'tonnes', factor: 1.5, factorSource: 'Process-Specific', co2e: 0.75 },
  { id: 4, source: 'Fugitive Emissions (Refrigerants)', activity: 5, unit: 'kg', factor: 1.43, factorSource: 'IPCC, 2014', co2e: 7.15 },
  { id: 5, source: 'Stationary Combustion (LPG)', activity: 200, unit: 'kWh', factor: 0.00023032, factorSource: 'DESNZ, 2025', co2e: 0.05 },
];

const initialScope2Data: ActivityRow[] = [
  { id: 1, source: 'Purchased Electricity (UK Grid)', activity: 50000, unit: 'kWh', factor: 0.000177, factorSource: 'DESNZ, 2025', co2e: 8.85 },
  { id: 2, source: 'Purchased Heat/Steam', activity: 10000, unit: 'GJ', factor: 3.0E-5, factorSource: 'Supplier-Specific', co2e: 0.3 },
  { id: 3, source: 'Purchased Cooling', activity: 5000, unit: 'GJ', factor: 2.0E-5, factorSource: 'Supplier-Specific', co2e: 0.1 },
];

const initialScope3Data: Scope3ActivityRow[] = [
    { id: 1, source: 'Cat. 1: Purchased Goods & Services', methodology: 'tier1', activity: 100000, unit: '£ spent', factor: 0.0001, factorSource: 'DESNZ, 2025', co2e: 10 },
    { id: 2, source: 'Cat. 2: Capital Goods', methodology: 'tier1', activity: 50000, unit: '£ spent', factor: 5.0E-5, factorSource: 'DESNZ, 2025', co2e: 2.5 },
    { id: 3, source: 'Cat. 3: Fuel- & Energy-Related Activities', methodology: 'tier2', activity: 50000, unit: 'kWh', factor: 2.315E-5, factorSource: 'DESNZ, 2025', co2e: 1.16 },
    { id: 4, source: 'Cat. 4: Upstream Transportation & Distribution', methodology: 'tier1', activity: 11000, unit: '£ spent', factor: 9.0E-5, factorSource: 'DESNZ, 2025', co2e: 0.99 },
    { id: 5, source: 'Cat. 5: Waste Generated in Operations', methodology: 'tier2', activity: 1000, unit: 'tonne', factor: 0.2, factorSource: 'DESNZ, 2025', co2e: 200 },
    { id: 6, source: 'Cat. 6: Business Travel', methodology: 'tier2', activity: 5000, unit: 'passenger-km', factor: 0.000106, factorSource: 'DESNZ, 2025', co2e: 0.53 },
    { id: 7, source: 'Cat. 7: Employee Commuting', methodology: 'tier2', activity: 8000, unit: 'km', factor: 0.00015, factorSource: 'Survey Data', co2e: 1.2 },
    { id: 8, source: 'Cat. 8: Upstream Leased Assets', methodology: 'tier2', activity: 0, unit: 'kWh', factor: 0.000177, factorSource: 'DESNZ, 2025', co2e: 0 },
    { id: 9, source: 'Cat. 9: Downstream Transportation & Distribution', methodology: 'tier2', activity: 15000, unit: 'tonne-km', factor: 4.0E-5, factorSource: 'DESNZ, 2025', co2e: 0.6 },
    { id: 10, source: 'Cat. 10: Processing of Sold Products', methodology: 'tier2', activity: 2000, unit: 'kg', factor: 0.0005, factorSource: 'LCA Data', co2e: 1 },
    { id: 11, source: 'Cat. 11: Use of Sold Products', methodology: 'tier2', activity: 5000, unit: 'kWh', factor: 0.000177, factorSource: 'LCA Data', co2e: 0.89 },
];

// Helper function to convert uploaded data to calculator format
const convertUploadedDataToCalculator = (uploadedData: any[]): ActivityRow[] => {
  // Expanded emission factors with more variations
  const emissionFactors: Record<string, { factor: number; factorSource: string }> = {
    'natural gas': { factor: 0.0002027, factorSource: 'DESNZ, 2025' },
    'diesel': { factor: 0.000239, factorSource: 'DESNZ, 2025' },
    'lpg': { factor: 0.00023032, factorSource: 'DESNZ, 2025' },
    'propane': { factor: 0.00023032, factorSource: 'DESNZ, 2025' },
    'refrigerants': { factor: 1.43, factorSource: 'IPCC, 2014' },
    'process emissions': { factor: 1.5, factorSource: 'Process-Specific' },
    'electricity': { factor: 0.000177, factorSource: 'DESNZ, 2025' },
    'petrol': { factor: 0.000239, factorSource: 'DESNZ, 2025' },
    'gasoline': { factor: 0.000239, factorSource: 'DESNZ, 2025' },
    'coal': { factor: 0.000341, factorSource: 'DESNZ, 2025' },
    'fuel oil': { factor: 0.000277, factorSource: 'DESNZ, 2025' },
  };

  return uploadedData.filter(row => {
    // Filter out empty rows
    const hasData = Object.values(row).some(val => val && val !== '-' && val !== 'undefined');
    return hasData && row.rowIndex;
  }).map((row, index) => {
    // Try multiple field names for emission type/source
    const emissionType = (
      row['Emission Source'] ||  // Our CSV template uses this!
      row['Fuel type or activity'] ||
      row['Emission Type'] || 
      row['emission_category'] || 
      row['Type'] || 
      row['Category'] || 
      row['Fuel Type'] ||
      row['Source'] ||
      row['scope'] ||  // Backend might map to this
      ''
    ).toString().trim();
    
    // Try multiple field names for quantity
    const quantityValue = 
      row['Activity Data'] ||  // Our CSV template uses this!
      row['Activity data'] ||
      row['Activity data - Amount'] ||
      row['Consumption'] || 
      row['quantity'] || 
      row['Quantity'] ||
      row['Amount'] ||
      row['Usage'] ||
      row['Volume'] ||
      0;
    const quantity = parseFloat(quantityValue.toString().replace(/[^0-9.-]/g, '')) || 0;
    
    // Try multiple field names for unit
    const unit = (
      row['Unit'] ||  // Our CSV template uses this!
      row['unit'] ||
      row['Activity data - Unit'] ||
      row['Units'] ||
      row['UOM'] ||
      'kWh'
    ).toString().trim();
    
    // Try multiple field names for location/site
    const location = (
      row['Site/Location'] ||  // Our CSV template uses this!
      row['Site'] ||
      row['Location'] || 
      row['site_name'] || 
      row['CRF - Sector'] ||
      row['Facility'] ||
      row['Building'] ||
      'Unknown'
    ).toString().trim();
    
    // Find matching emission factor (case-insensitive)
    const emissionTypeLower = emissionType.toLowerCase();
    let factorInfo = emissionFactors[emissionTypeLower];
    
    // Try partial matching if exact match not found
    if (!factorInfo) {
      for (const [key, value] of Object.entries(emissionFactors)) {
        if (emissionTypeLower.includes(key) || key.includes(emissionTypeLower)) {
          factorInfo = value;
          break;
        }
      }
    }
    
    // Default factor if still not found
    if (!factorInfo) {
      factorInfo = { factor: 0.0002, factorSource: 'Default' };
    }
    
    const co2e = quantity * factorInfo.factor;

    return {
      id: index + 1,
      source: `${emissionType} (${location})`,
      activity: quantity,
      unit: unit,
      factor: factorInfo.factor,
      factorSource: factorInfo.factorSource,
      co2e: co2e
    };
  });
};

// --- Main Component ---
export const CalculatorPage: React.FC = () => {
  const [scope1Data, setScope1Data] = useState<ActivityRow[]>(initialScope1Data);
  const [scope2Data, setScope2Data] = useState<ActivityRow[]>(initialScope2Data);
  const [scope3Data, setScope3Data] = useState<Scope3ActivityRow[]>(initialScope3Data);
  const [dataSource, setDataSource] = useState<'default' | 'uploaded'>('default');

  // Load uploaded data on component mount
  useEffect(() => {
    const uploadedDataStr = localStorage.getItem('uploadedEmissionData');
    console.log('🔍 Calculator: Checking for uploaded data');
    console.log('🔍 Raw data from localStorage:', uploadedDataStr);
    if (uploadedDataStr) {
      try {
        const uploadedData = JSON.parse(uploadedDataStr);
        console.log('🔍 Parsed uploaded data:', uploadedData);
        console.log('🔍 First row:', uploadedData[0]);
        const convertedData = convertUploadedDataToCalculator(uploadedData);
        console.log('🔍 Converted data:', convertedData);
        console.log('🔍 First converted row:', convertedData[0]);
        
        // Separate data by scope based on emission type
        const scope1Items: ActivityRow[] = [];
        const scope2Items: ActivityRow[] = [];
        const scope3Items: ActivityRow[] = [];
        
        convertedData.forEach(item => {
          const sourceLower = item.source.toLowerCase();
          
          // Scope 1: Direct emissions (combustion, fugitive)
          if (sourceLower.includes('natural gas') || 
              sourceLower.includes('diesel') || 
              sourceLower.includes('petrol') || 
              sourceLower.includes('gasoline') ||
              sourceLower.includes('lpg') || 
              sourceLower.includes('propane') ||
              sourceLower.includes('coal') ||
              sourceLower.includes('fuel oil') ||
              sourceLower.includes('refrigerant')) {
            scope1Items.push(item);
          }
          // Scope 2: Purchased energy
          else if (sourceLower.includes('electricity') || 
                   sourceLower.includes('district heating') ||
                   sourceLower.includes('district cooling') ||
                   sourceLower.includes('steam')) {
            scope2Items.push(item);
          }
          // Scope 3: Everything else (travel, waste, water, etc.)
          else {
            scope3Items.push(item as any);
          }
        });
        
        console.log('🔍 Scope 1 items:', scope1Items.length, scope1Items);
        console.log('🔍 Scope 2 items:', scope2Items.length, scope2Items);
        console.log('🔍 Scope 3 items:', scope3Items.length, scope3Items);
        
        if (scope1Items.length > 0) setScope1Data(scope1Items);
        if (scope2Items.length > 0) setScope2Data(scope2Items);
        if (scope3Items.length > 0) setScope3Data(scope3Items as any);
        
        setDataSource('uploaded');
        toast.success(`Loaded ${convertedData.length} emission activities! Scope 1: ${scope1Items.length}, Scope 2: ${scope2Items.length}, Scope 3: ${scope3Items.length}`);
      } catch (error) {
        console.error('Failed to load uploaded data:', error);
      }
    }
  }, []);

  const handleActivityChange = useCallback((scope: 'scope1' | 'scope2' | 'scope3', id: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const setData = scope === 'scope1' ? setScope1Data : scope === 'scope2' ? setScope2Data : setScope3Data;

    setData((prevData: any) =>
      prevData.map((row: ActivityRow) => {
        if (row.id === id) {
          const newCo2e = numericValue * row.factor;
          return { ...row, activity: numericValue, co2e: newCo2e };
        }
        return row;
      })
    );
  }, []);

  const handleMethodologyChange = useCallback((id: number, value: 'tier1' | 'tier2') => {
    setScope3Data(prevData =>
      prevData.map(row => {
        if (row.id === id) {
          return { ...row, methodology: value };
        }
        return row;
      })
    );
  }, []);

  const calculateTotal = (data: ActivityRow[]) => {
    return data.reduce((acc, row) => acc + row.co2e, 0);
  };

  const scope1Total = useMemo(() => calculateTotal(scope1Data), [scope1Data]);
  const scope2Total = useMemo(() => calculateTotal(scope2Data), [scope2Data]);
  const scope3Total = useMemo(() => calculateTotal(scope3Data), [scope3Data]);

  const grandTotal = useMemo(() => scope1Total + scope2Total + scope3Total, [scope1Total, scope2Total, scope3Total]);

  const resetValues = () => {
    setScope1Data(initialScope1Data);
    setScope2Data(initialScope2Data);
    setScope3Data(initialScope3Data);
  };

  return (
    <div className="space-y-6 py-6">
      <header className="bg-white shadow-sm p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carbon Emissions Calculator</h1>
            <p className="text-sm text-gray-600 mt-1">Edit activity data and methodology tiers to calculate your carbon footprint.</p>
          </div>
          {dataSource === 'uploaded' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Using Uploaded Data</span>
            </div>
          )}
        </div>
      </header>

      <div className="card">
        <div className="card-content">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h2>
          <p className="text-sm text-gray-600">Click on any value in the "Activity Data" column to edit it. The corresponding CO2e emissions will update automatically.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={resetValues} className="btn-secondary">Reset Values</button>
        <div className="bg-gray-800 text-white font-bold p-3 rounded-lg">
          Grand Total: {grandTotal.toFixed(2)} tCO₂e
        </div>
      </div>

      {/* --- Scope 1 Table --- */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Scope 1: Direct Emissions</h2>
        </div>
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Emission Source</th>
                  <th className="th">Activity Data (Unit)</th>
                  <th className="th">Emission Factor</th>
                  <th className="th">Source</th>
                  <th className="th">CO2e (tonnes)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scope1Data.map(row => (
                  <tr key={row.id}>
                    <td className="td">{row.source}</td>
                    <td className="td">
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) => handleActivityChange('scope1', row.id, e.target.value)}
                          className="input-sm w-32"
                        />
                        <span className="ml-2 text-sm text-gray-500">{row.unit}</span>
                      </div>
                    </td>
                    <td className="td font-mono text-sm">{row.factor}</td>
                    <td className="td text-sm">{row.factorSource}</td>
                    <td className="td font-semibold">{row.co2e.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right font-bold text-gray-700">Scope 1 Total:</td>
                  <td className="px-6 py-3 font-bold text-lg text-gray-900">{scope1Total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* --- Scope 2 Table --- */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Scope 2: Indirect Emissions from Energy</h2>
        </div>
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Emission Source</th>
                  <th className="th">Activity Data (Unit)</th>
                  <th className="th">Emission Factor</th>
                  <th className="th">Source</th>
                  <th className="th">CO2e (tonnes)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scope2Data.map(row => (
                  <tr key={row.id}>
                    <td className="td">{row.source}</td>
                    <td className="td">
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) => handleActivityChange('scope2', row.id, e.target.value)}
                          className="input-sm w-32"
                        />
                        <span className="ml-2 text-sm text-gray-500">{row.unit}</span>
                      </div>
                    </td>
                    <td className="td font-mono text-sm">{row.factor}</td>
                    <td className="td text-sm">{row.factorSource}</td>
                    <td className="td font-semibold">{row.co2e.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right font-bold text-gray-700">Scope 2 Total:</td>
                  <td className="px-6 py-3 font-bold text-lg text-gray-900">{scope2Total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* --- Scope 3 Table --- */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Scope 3: Value Chain Indirect Emissions</h2>
        </div>
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">GHG Protocol Category</th>
                  <th className="th">Methodology / Data Quality</th>
                  <th className="th">Activity Data</th>
                  <th className="th">Emission Factor</th>
                  <th className="th">Source</th>
                  <th className="th">CO2e (tonnes)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scope3Data.map(row => (
                  <tr key={row.id}>
                    <td className="td">{row.source}</td>
                    <td className="td">
                      <select
                        value={row.methodology}
                        onChange={(e) => handleMethodologyChange(row.id, e.target.value as 'tier1' | 'tier2')}
                        className="input-sm"
                      >
                        <option value="tier1">Tier 1: Spend-based</option>
                        <option value="tier2">Tier 2: Average-data</option>
                      </select>
                    </td>
                    <td className="td">
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) => handleActivityChange('scope3', row.id, e.target.value)}
                          className="input-sm w-32"
                        />
                        <span className="ml-2 text-sm text-gray-500">{row.unit}</span>
                      </div>
                    </td>
                    <td className="td font-mono text-sm">{row.factor}</td>
                    <td className="td text-sm">{row.factorSource}</td>
                    <td className="td font-semibold">{row.co2e.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={5} className="px-6 py-3 text-right font-bold text-gray-700">Scope 3 Total:</td>
                  <td className="px-6 py-3 font-bold text-lg text-gray-900">{scope3Total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
