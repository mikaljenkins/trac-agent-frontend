'use client'

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export function ExportResonanceData({ data }: { data: any }) {
  const handleExport = async () => {
    const zip = new JSZip();
    zip.file('resonance.json', JSON.stringify(data, null, 2));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `trac-resonance-${new Date().toISOString().split('T')[0]}.zip`);
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
    >
      📤 Export Resonance Data
    </button>
  );
} 