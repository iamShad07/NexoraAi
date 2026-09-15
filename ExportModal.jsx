import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const ExportModal = ({ isOpen, onClose, document, exportType = 'analysis' }) => {
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formats = [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Official formatted report with header, footer & citations' },
    { id: 'docx', label: 'Word Document (.docx)', desc: 'Editable document with structured sections' },
    { id: 'xlsx', label: 'Excel Workbook (.xlsx)', desc: 'Tabular layout for numbers and metrics' },
    { id: 'csv', label: 'CSV Table (.csv)', desc: 'Raw spreadsheet data' },
    { id: 'md', label: 'Markdown (.md)', desc: 'Clean markdown notes for Obsidian/Notion' },
    { id: 'json', label: 'JSON Data (.json)', desc: 'Structured schema with nodes and metadata' }
  ];

  const handleGenerateExport = async () => {
    setLoading(true);
    setError('');
    setDownloadUrl('');

    try {
      const res = await api.generateExport({
        documentId: document?.id || document?._id,
        exportType,
        format,
        title: `Nexora AI ${exportType.toUpperCase()} Export`
      });

      setDownloadUrl(res.downloadUrl);
    } catch (err) {
      setError(err.message || 'Failed to generate export file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Export Intelligence</h3>
          <p className="mt-1 text-xs text-slate-400">
            Select format for {document?.originalName || 'Document Report'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {downloadUrl ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">Export Ready!</h4>
            <p className="text-xs text-slate-300 mb-5">Your file has been generated with verified source citations.</p>
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Generated File
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {formats.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    format === f.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold block text-slate-200">{f.label}</span>
                    <span className="text-[11px] text-slate-400">{f.desc}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      format === f.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                    }`}
                  >
                    {format === f.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateExport}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? 'Generating...' : 'Export File'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
