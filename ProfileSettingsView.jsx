import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User,
  Settings,
  Shield,
  Moon,
  Sun,
  Globe,
  Bell,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const ProfileSettingsView = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [language, setLanguage] = useState('English');
  const [aiPreference, setAiPreference] = useState('Grounded (Zero Hallucination)');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          User Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account identity, theme, language preferences, and AI grounding settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Account Information
          </h3>

          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 bg-slate-800 object-cover"
            />
            <div>
              <h4 className="text-base font-bold text-white">{user?.name}</h4>
              <p className="text-xs text-slate-400">{user?.email || user?.phone || 'Member'}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                {user?.role || 'USER'} Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Email / Phone</label>
              <input
                type="text"
                disabled
                value={user?.email || user?.phone || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Appearance & Themes */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sun className="w-4 h-4 text-cyan-400" />
            Appearance & Interface Theme
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              Dark Mode (Default)
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400" />
              Light Mode
            </button>
          </div>
        </div>

        {/* AI & Language Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Grounding & Language
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reasoning Strictness</label>
              <select
                value={aiPreference}
                onChange={(e) => setAiPreference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Grounded (Zero Hallucination)">Strict Source Grounding (Recommended)</option>
                <option value="Creative Synthesis">Creative Semantic Synthesis</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
};
