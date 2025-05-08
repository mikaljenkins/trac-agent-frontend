'use client'

import { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { SymbolicForecast } from '@/ai-core/symbolicForecaster';

interface ExportMetadata {
  timestamp: string;
  totalSymbols: number;
  averageConfidence: number;
  dominantArchetype: string;
  exportFormat: 'json' | 'csv' | 'zip';
}

interface ExportForecastDataProps {
  forecasts: SymbolicForecast[];
  metadata: Omit<ExportMetadata, 'exportFormat'>;
}

export function ExportForecastData({ forecasts, metadata }: ExportForecastDataProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportMetadata['exportFormat']>('json');
  const [error, setError] = useState<string | null>(null);

  const convertToCSV = (data: SymbolicForecast[]): string => {
    const headers = ['symbol', 'projectedDecay', 'likelyDrift', 'confidence', 'archetypeInfluence', 'forecastNarrative', 'timestamp'];
    const rows = data.map(forecast => [
      forecast.symbol,
      forecast.projectedDecay,
      forecast.likelyDrift,
      forecast.confidence,
      forecast.archetypeInfluence.join(';'),
      `"${forecast.forecastNarrative.replace(/"/g, '""')}"`,
      forecast.timestamp,
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const date = new Date().toISOString().split('T')[0];
      const exportData = {
        forecasts,
        metadata: {
          ...metadata,
          exportFormat: selectedFormat,
        },
      };

      switch (selectedFormat) {
        case 'json': {
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
          });
          saveAs(blob, `forecast-${date}.json`);
          break;
        }

        case 'csv': {
          const csv = convertToCSV(forecasts);
          const blob = new Blob([csv], { type: 'text/csv' });
          saveAs(blob, `forecast-${date}.csv`);
          break;
        }

        case 'zip': {
          const zip = new JSZip();
          
          // Add JSON export
          zip.file('forecast.json', JSON.stringify(exportData, null, 2));
          
          // Add CSV export
          zip.file('forecast.csv', convertToCSV(forecasts));
          
          // Add metadata
          zip.file('metadata.json', JSON.stringify(metadata, null, 2));
          
          const blob = await zip.generateAsync({ type: 'blob' });
          saveAs(blob, `forecast-${date}.zip`);
          break;
        }
      }

      // Show success toast
      // TODO: Implement toast notification
      console.log('Export completed successfully');
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export forecast data. Please try again.');
    } finally {
      setIsExporting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>📤</span>
            <span>Export Forecast</span>
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Export Forecast Data</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportMetadata['exportFormat'])}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="zip">ZIP (All Formats)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 