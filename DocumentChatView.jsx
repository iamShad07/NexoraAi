import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Send,
  MessageSquare,
  FileText,
  Sparkles,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const DocumentChatView = ({
  documents = [],
  activeDocument,
  initialQuestion
}) => {
  const [selectedDocId, setSelectedDocId] = useState(activeDocument?.id || activeDocument?._id || (documents[0]?.id || documents[0]?._id));
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    'What is this document about?',
    'What are the core key points and findings?',
    'Explain this in simple language.',
    'Give me potential exam questions.',
    'Where is the main methodology mentioned?'
  ];

  useEffect(() => {
    if (activeDocument) {
      setSelectedDocId(activeDocument.id || activeDocument._id);
    }
  }, [activeDocument]);

  useEffect(() => {
    if (!selectedDocId) return;

    const loadChat = async () => {
      try {
        const res = await api.getOrCreateChat(selectedDocId);
        setCurrentChat(res.chat);
        setMessages(res.chat.messages || []);
      } catch (err) {
        console.error('Failed to init chat:', err);
      }
    };

    loadChat();
  }, [selectedDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !currentChat || sending) return;

    setInputText('');
    setSending(true);

    // Optimistic user message
    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendMessage(currentChat._id || currentChat.id, text.trim());
      setMessages(res.chat.messages || []);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        content: err.message || 'Failed to generate answer. Please try again.',
        sources: []
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header & Doc Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Source-Grounded AI Chat
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Chat with Document
          </h2>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 shrink-0">Target:</label>
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 max-w-[260px] truncate"
          >
            {documents.map((d) => (
              <option key={d.id || d._id} value={d.id || d._id}>
                {d.originalName} ({d.structureType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Grounded Source References */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                      Verified Document Citations:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {m.sources.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300"
                        >
                          <div className="flex items-center justify-between font-semibold text-indigo-300 mb-1">
                            <span className="truncate">{s.documentName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              Page {s.page} • {s.section}
                            </span>
                          </div>
                          {s.snippet && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-2">
                              "{s.snippet}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                  U
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              Retrieving grounded facts and formulating citation-backed answer...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-2 shrink-0 relative flex items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything about this document (grounded with page & section citations)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-xl placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="absolute right-2.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-95 disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
