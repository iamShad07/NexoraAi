import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BrainCircuit,
  FileText,
  Sparkles,
  Layers,
  ListOrdered,
  BookOpen,
  Calendar,
  Hash,
  Lightbulb,
  CheckSquare,
  Languages,
  Download,
  Loader2,
  Share2
} from 'lucide-react';

export const DocumentAnalysisView = ({
  document,
  onNavigateTab,
  onOpenExport
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'concepts' | 'facts' | 'actions' | 'simplify'

  // Explain simply state
  const [simplifyLevel, setSimplifyLevel] = useState('Student Friendly');
  const [simplifyLang, setSimplifyLang] = useState('English');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [simplifying, setSimplifying] = useState(false);

  useEffect(() => {
    if (!document) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalysis(document.id || document._id);
        setAnalysis(res.analysis);
      } catch (err) {
        console.error('Failed to load analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [document]);

  const handleExplainSimply = async () => {
    if (!document) return;
    setSimplifying(true);
    try {
      const res = await api.explainSimply(document.id || document._id, {
        level: simplifyLevel,
        language: simplifyLang
      });
      setSimplifiedText(res.explanation);
    } catch (err) {
      console.error('Explain error:', err);
    } finally {
      setSimplifying(false);
    }
  };

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Please select a document from your dashboard to view analysis.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Synthesizing Document Intelligence...</h3>
        <p className="text-xs text-slate-400 mt-1">
          Extracting concepts, structure, definitions, and high-yield insights with Nexora AI.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI Document Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {document.originalName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {document.structureType} Document • {document.pageCount} Pages • {document.wordCount} Words
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('mindmap')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/20 hover:bg-teal-500/25 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            View Mind Map
          </button>
          <button
            onClick={() => onOpenExport('analysis')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Analysis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'summary', label: 'Executive Summaries', icon: FileText },
          { id: 'concepts', label: 'Key Points & Definitions', icon: BookOpen },
          { id: 'facts', label: 'Insights & Facts', icon: Lightbulb },
          { id: 'actions', label: 'Action Items & Specifics', icon: CheckSquare },
          { id: 'simplify', label: 'Explain Simply', icon: Languages }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Summaries */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Executive Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {analysis?.executiveSummary || 'Executive summary not generated.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
                Simple Summary
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {analysis?.simpleSummary || 'Simple summary not generated.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                Detailed Synthesis
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {analysis?.detailedSummary || 'Detailed summary not generated.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Key Points & Concepts */}
      {activeTab === 'concepts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              Key Document Takeaways
            </h3>
            <div className="space-y-2.5">
              {(analysis?.keyPoints || []).map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Definitions */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Core Definitions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysis?.definitions || []).map((def, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-bold text-indigo-300">{def.term}</span>
                  <p className="text-xs text-slate-300 mt-1">{def.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Insights & Facts */}
      {activeTab === 'facts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Strategic Insights
            </h3>
            <div className="space-y-3">
              {(analysis?.insights || []).map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-200">
                  • {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Key Numbers & Metrics
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis?.numbers || []).map((num, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Key Dates & Timeline Indicators
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis?.dates || []).map((d, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Action Items & Specifics */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Actionable Recommendations
            </h3>
            <div className="space-y-3">
              {(analysis?.actionItems || []).map((action, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-md border border-indigo-500 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded bg-indigo-500" />
                  </div>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic or Business Specifics */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">
              {document.structureType === 'Academic' ? 'Academic / Syllabus Highlights' : 'Operational & Business Context'}
            </h3>
            {document.structureType === 'Academic' ? (
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Chapters:</strong> {(analysis?.academicSpecifics?.chapters || []).join(', ')}</p>
                <p><strong>Exam Prep Questions:</strong> {(analysis?.academicSpecifics?.examPoints || []).join(' • ')}</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Objectives:</strong> {(analysis?.businessSpecifics?.objectives || []).join(', ')}</p>
                <p><strong>Risks:</strong> {(analysis?.businessSpecifics?.risks || []).join(', ')}</p>
                <p><strong>Recommendations:</strong> {(analysis?.businessSpecifics?.recommendations || []).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Explain Simply */}
      {activeTab === 'simplify' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="max-w-2xl mb-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-400" />
              Explain Simply Mode
            </h3>
            <p className="text-xs text-slate-400">
              Customize simplicity level and language while preserving factual accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Simplicity Level</label>
              <select
                value={simplifyLevel}
                onChange={(e) => setSimplifyLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Very Simple">Very Simple (10-Year-Old Level)</option>
                <option value="Student Friendly">Student Friendly</option>
                <option value="Normal">Normal</option>
                <option value="Detailed">Detailed</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Language</label>
              <select
                value={simplifyLang}
                onChange={(e) => setSimplifyLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExplainSimply}
            disabled={simplifying}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {simplifying ? 'Adapting Explanation...' : 'Generate Simplified Explanation'}
          </button>

          {simplifiedText && (
            <div className="mt-6 p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-sm text-slate-200 leading-relaxed">
              <span className="text-xs font-bold text-indigo-400 block mb-2">
                Explanation ({simplifyLevel} • {simplifyLang}):
              </span>
              {simplifiedText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
