import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  History,
  FileText,
  BrainCircuit,
  MessageSquare,
  Share2,
  GraduationCap,
  Download,
  Search,
  Trash2,
  ExternalLink,
  ArrowRight,
  Clock
} from 'lucide-react';

export const HistoryView = ({ onSelectDocument, onNavigateTab }) => {
  const [activeSection, setActiveSection] = useState('documents'); // 'documents' | 'chats' | 'mindmaps' | 'study' | 'exports'
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [mindMaps, setMindMaps] = useState([]);
  const [exportsList, setExportsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
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
      console.warn('History fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Delete this document and all associated history?')) return;
    try {
      await api.deleteDocument(id);
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleDeleteChat = async (id) => {
    if (!window.confirm('Delete this chat history?')) return;
    try {
      await api.deleteChat(id);
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to delete chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            Personal Workspace Archives
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personal History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review past analyses, continue chat sessions, reopen mind maps, and download exports.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { id: 'chats', label: `AI Chats (${chats.length})`, icon: MessageSquare },
          { id: 'mindmaps', label: `Mind Maps (${mindMaps.length})`, icon: Share2 },
          { id: 'exports', label: `Exports (${exportsList.length})`, icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {activeSection === 'documents' && (
          documents
            .filter((d) => (search ? d.originalName.toLowerCase().includes(search.toLowerCase()) : true))
            .map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{doc.originalName}</h4>
                    <p className="text-xs text-slate-400">
                      {doc.structureType} • {doc.pageCount} page(s) • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelectDocument(doc, 'analysis')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25"
                  >
                    Open Analysis
                  </button>
                  <button
                    onClick={() => onSelectDocument(doc, 'mindmap')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/15 hover:bg-teal-500/25"
                  >
                    Mind Map
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}

        {activeSection === 'chats' && (
          chats
            .filter((c) => (search ? c.title?.toLowerCase().includes(search.toLowerCase()) : true))
            .map((chat) => (
              <div
                key={chat._id || chat.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{chat.title || 'Grounded Chat'}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {chat.lastMessage || 'Conversational grounding session'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onNavigateTab('chat')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25"
                  >
                    Continue Chat
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat._id || chat.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}

        {activeSection === 'exports' && (
          exportsList.map((exp) => (
            <div
              key={exp._id || exp.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                  <p className="text-xs text-slate-400">
                    Format: {exp.format.toUpperCase()} • Generated: {new Date(exp.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <a
                href={`/api/exports/download/${exp._id || exp.id}`}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 self-end sm:self-center"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
