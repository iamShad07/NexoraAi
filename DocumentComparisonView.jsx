import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Scale,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp
} from 'lucide-react';

export const DocumentComparisonView = ({ documents = [] }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSelect = (id) => {
    setError('');
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setError('Please select at least two documents to compare.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.compareDocuments(selectedIds);
      setComparison(res.comparison);
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <Scale className="w-3.5 h-3.5" />
          Comparative Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Compare Documents
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cross-examine multiple documents simultaneously to identify overlaps, distinctions, and conflicting findings.
        </p>
      </div>

      {/* Document Selection Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Select Documents to Compare</h3>
            <p className="text-xs text-slate-400">Choose at least 2 files ({selectedIds.length} currently chosen):</p>
          </div>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all"
          >
            {loading ? 'Analyzing...' : 'Run Comparative Analysis'}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => {
            const isPicked = selectedIds.includes(doc.id || doc._id);
            return (
              <div
                key={doc.id || doc._id}
                onClick={() => toggleSelect(doc.id || doc._id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isPicked
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className={`w-4 h-4 ${isPicked ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate font-semibold">{doc.originalName}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    isPicked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'
                  }`}
                >
                  {isPicked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Results */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-xs text-slate-400">Comparing semantic structures and cross-referencing findings...</p>
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Comparative Executive Synthesis
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {comparison.comparisonSummary}
            </p>
          </div>

          {/* Side by Side Similarities & Differences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Key Similarities & Alignments
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {(comparison.similarities || []).map((s, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 leading-relaxed">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Notable Differences & Divergence
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {(comparison.differences || []).map((d, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 leading-relaxed">
                    • {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Unique Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                Overlapping Concepts
              </h4>
              <div className="flex flex-wrap gap-2">
                {(comparison.commonConcepts || []).map((c, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
                Unique to Document 1
              </h4>
              <div className="flex flex-wrap gap-2">
                {(comparison.uniqueConceptsDoc1 || []).map((u, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
                    {u}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
                Unique to Document 2
              </h4>
              <div className="flex flex-wrap gap-2">
                {(comparison.uniqueConceptsDoc2 || []).map((u, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Conflicting Info & Conclusions */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Contradictions & Divergent Conclusions
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              {(comparison.conflictingInformation || []).map((c, idx) => (
                <p key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-rose-200">
                  {c}
                </p>
              ))}
              {(comparison.differentConclusions || []).map((dc, idx) => (
                <p key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300">
                  <strong>Conclusion Disparity:</strong> {dc}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
