import React, { useState, useMemo, useCallback } from 'react';

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

// --- Main Component ---
export const CalculatorPage: React.FC = () => {
  const [scope1Data, setScope1Data] = useState<ActivityRow[]>(initialScope1Data);
  const [scope2Data, setScope2Data] = useState<ActivityRow[]>(initialScope2Data);
  const [scope3Data, setScope3Data] = useState<Scope3ActivityRow[]>(initialScope3Data);

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
        <h1 className="text-2xl font-bold text-gray-900">Carbon Emissions Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Edit activity data and methodology tiers to calculate your carbon footprint.</p>
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
