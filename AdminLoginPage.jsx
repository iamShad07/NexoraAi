import React, { useState } from 'react';
import { NexoraLogo } from '../brand/NexoraLogo';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

export const AdminLoginPage = ({ onBackToApp, onLoginSuccess }) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('mdshadalam848@gmail.com');
  const [password, setPassword] = useState('Nexor@Ai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.adminLogin({ email: email.trim(), password });
      loginAdmin(res.admin, res.token);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || '403 Forbidden: Invalid administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Red/Purple Ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to App */}
      <button
        onClick={onBackToApp}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Nexora AI
      </button>

      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            NEXORA AI <span className="text-red-400 text-sm font-semibold tracking-normal px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 ml-1">ADMIN</span>
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Secure administrative console with granular role-based access control.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mdshadalam848@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>Initial Super Admin Credential:</p>
          <code className="text-[11px] text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 mt-1 inline-block">
            mdshadalam848@gmail.com / Nexor@Ai
          </code>
        </div>
      </div>
    </div>
  );
};
