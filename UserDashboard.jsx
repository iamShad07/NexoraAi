import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Upload,
  BrainCircuit,
  MessageSquare,
  Share2,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const UserDashboard = ({
  onOpenUpload,
  onSelectDocument,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [mindMaps, setMindMaps] = useState([]);
  const [exportsList, setExportsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [docsRes, chatsRes, mapsRes, expRes] = await Promise.all([
        api.getDocuments().catch(() => ({ documents: [] })),
        api.getChats().catch(() => ({ chats: [] })),
        api.getMindMaps().catch(() => ({ mindMaps: [] })),
        api.getExports().catch(() => ({ exports: [] }))
      ]);

      setDocuments(docsRes.documents || []);
      setChats(chatsRes.chats || []);
      setMindMaps(mapsRes.mindMaps || []);
      setExportsList(expRes.exports || []);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalQuestions = chats.reduce((acc, c) => {
    const userMsgs = (c.messages || []).filter((m) => m.role === 'user').length;
    return acc + userMsgs;
  }, 0);

  const stats = [
    { label: 'Total Documents', value: documents.length, icon: FileText, color: 'text-indigo-400' },
    { label: 'Total Analyses', value: documents.length, icon: BrainCircuit, color: 'text-purple-400' },
    { label: 'Questions Asked', value: totalQuestions, icon: MessageSquare, color: 'text-cyan-400' },
    { label: 'Mind Maps Created', value: mindMaps.length, icon: Share2, color: 'text-teal-400' },
    { label: 'Exports Generated', value: exportsList.length, icon: Download, color: 'text-amber-400' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Heading & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Nexora AI Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your intelligence center for deep document analysis, grounded Q&A, and interactive knowledge graphs.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            + Upload Document
          </button>
          <button
            onClick={() => onNavigateTab('chat')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            + Ask AI
          </button>
          <button
            onClick={() => onNavigateTab('mindmap')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-400" />
            + Create Mind Map
          </button>
          <button
            onClick={() => onNavigateTab('study')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            + Study Mode
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {loading ? '...' : s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Documents & Fast Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Recent Documents
            </h3>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="my-auto py-12 text-center rounded-2xl border border-dashed border-slate-800">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">No documents uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Upload your first PDF, Word, Spreadsheet, or Image file to get started.
              </p>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Upload File Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{doc.originalName}</h4>
                      <p className="text-xs text-slate-400">
                        {doc.structureType} • {doc.pageCount} page(s) • {(doc.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectDocument(doc, 'analysis')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 transition-colors"
                    >
                      Analysis
                    </button>
                    <button
                      onClick={() => onSelectDocument(doc, 'chat')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 transition-colors"
                    >
                      Ask AI
                    </button>
                    <button
                      onClick={() => onSelectDocument(doc, 'mindmap')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/15 hover:bg-teal-500/25 transition-colors"
                    >
                      Mind Map
                    </button>
                    <button
                      onClick={() => onSelectDocument(doc, 'study')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 transition-colors"
                    >
                      Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Knowledge Tools Launcher */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              Intelligence Suite
            </h3>
            <p className="text-xs text-slate-400 mb-5">Select a capability to transform your documents.</p>

            <div className="space-y-3">
              <div
                onClick={() => onNavigateTab('mindmap')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-teal-300">9-Topology Mind Maps</h4>
                    <p className="text-[11px] text-slate-400">Flowcharts, trees, timelines & graphs.</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('study')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300">AI Study Mode</h4>
                    <p className="text-[11px] text-slate-400">Interactive MCQs & flashcards.</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('compare')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">Compare Documents</h4>
                    <p className="text-[11px] text-slate-400">Find similarities & contradictions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-cyan-900/30 border border-indigo-500/20">
            <span className="text-xs font-bold text-indigo-300">Nexora Anti-Hallucination</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Every answer is verified against exact page & section citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
