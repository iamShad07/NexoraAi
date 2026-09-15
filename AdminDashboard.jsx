import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Users,
  FileText,
  BrainCircuit,
  Activity,
  Settings,
  HardDrive,
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  LogOut,
  RefreshCw,
  PlusCircle,
  KeyRound,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard = ({ onBackToApp }) => {
  const { adminUser, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'documents' | 'logs' | 'settings' | 'admins'
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');

  // New admin state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminMsg, setNewAdminMsg] = useState({ text: '', isError: false });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, docsRes, logsRes, settingsRes] = await Promise.all([
        api.getAdminAnalytics().catch(() => ({ metrics: {}, documentTypes: {} })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminDocuments().catch(() => ({ documents: [] })),
        api.getActivityLogs().catch(() => ({ logs: [] })),
        api.getSystemSettings().catch(() => ({ settings: {} }))
      ]);

      setAnalytics(analyticsRes);
      setUsers(usersRes.users || []);
      setDocuments(docsRes.documents || []);
      setActivityLogs(logsRes.logs || []);
      setSettings(settingsRes.settings || {});
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateAdminUserStatus(userId, { status: nextStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user and all their records?')) return;
    try {
      await api.deleteAdminUser(userId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this problematic file from the system?')) return;
    try {
      await api.deleteAdminDocument(docId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setNewAdminMsg({ text: '', isError: false });
    setSubmittingAdmin(true);
    try {
      const res = await api.createAdminAccount({
        name: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        password: newAdminPassword,
        permissions: ['VIEW_USERS', 'VIEW_DOCUMENTS', 'VIEW_ANALYTICS', 'VIEW_ACTIVITY_LOGS']
      });
      setNewAdminMsg({
        text: `Administrator account "${newAdminName}" (${newAdminEmail}) created successfully!`,
        isError: false
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchAdminData();
    } catch (err) {
      setNewAdminMsg({
        text: err.message || 'Failed to create admin account.',
        isError: true
      });
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const isSuperAdmin = adminUser?.role === 'SUPER_ADMIN';

  const metrics = analytics?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    totalAnalyses: 0,
    aiRequests: 0,
    estimatedTokens: 0,
    estimatedCostUSD: '0.0000',
    storageUsageMB: '0.00',
    failedRequests: 0
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-red-500/20 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-18">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white">NEXORA AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                  Admin Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Logged in as {adminUser?.name} ({adminUser?.role})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToApp}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              Exit to App
            </button>
            <button
              onClick={logoutAdmin}
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'System KPIs & Analytics', icon: Activity },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'logs', label: 'Activity Audit Logs', icon: BrainCircuit },
            ...(isSuperAdmin
              ? [
                  { id: 'admins', label: 'Admin Accounts', icon: KeyRound },
                  { id: 'settings', label: 'System Settings', icon: Settings }
                ]
              : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: KPIs & Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total Users</span>
                <span className="text-2xl font-black text-white">{metrics.totalUsers}</span>
                <span className="text-[10px] text-emerald-400 block mt-1">{metrics.activeUsers} active</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total Documents</span>
                <span className="text-2xl font-black text-white">{metrics.totalDocuments}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{metrics.storageUsageMB} MB storage</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">AI Analyses</span>
                <span className="text-2xl font-black text-white">{metrics.totalAnalyses}</span>
                <span className="text-[10px] text-purple-400 block mt-1">100% grounded</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">AI Requests</span>
                <span className="text-2xl font-black text-white">{metrics.aiRequests}</span>
                <span className="text-[10px] text-cyan-400 block mt-1">RAG & Chat</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Estimated Tokens</span>
                <span className="text-2xl font-black text-white">{metrics.estimatedTokens}</span>
                <span className="text-[10px] text-amber-400 block mt-1">~${metrics.estimatedCostUSD}</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">System Errors</span>
                <span className="text-2xl font-black text-white">{metrics.failedRequests}</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Healthy</span>
              </div>
            </div>

            {/* Document Types Chart Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Ingested Document Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">PDF Files</span>
                  <span className="text-xl font-bold text-indigo-400">{analytics?.documentTypes?.pdf || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Word (DOCX)</span>
                  <span className="text-xl font-bold text-cyan-400">{analytics?.documentTypes?.docx || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Spreadsheets</span>
                  <span className="text-xl font-bold text-teal-400">{analytics?.documentTypes?.sheets || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Images (OCR)</span>
                  <span className="text-xl font-bold text-purple-400">{analytics?.documentTypes?.images || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Other Formats</span>
                  <span className="text-xl font-bold text-amber-400">{analytics?.documentTypes?.other || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-x-auto bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Documents</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users
                    .filter((u) => (userSearch ? u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()) : true))
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="px-5 py-3 font-semibold text-white flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full bg-slate-800" />
                          {u.name}
                        </td>
                        <td className="px-5 py-3">{u.email || u.phone}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">{u.documentCount || 0}</td>
                        <td className="px-5 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right space-x-2">
                          {u.role !== 'SUPER_ADMIN' && (
                            <>
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className="text-[11px] font-semibold text-slate-400 hover:text-white"
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-[11px] font-semibold text-red-400 hover:underline ml-2"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Document Management */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter documents by name or owner..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-x-auto bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">File Name</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3">Pages</th>
                    <th className="px-5 py-3">Uploaded</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {documents
                    .filter((d) => (docSearch ? d.originalName?.toLowerCase().includes(docSearch.toLowerCase()) || d.ownerName?.toLowerCase().includes(docSearch.toLowerCase()) : true))
                    .map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="px-5 py-3 font-semibold text-white truncate max-w-xs">{d.originalName}</td>
                        <td className="px-5 py-3">{d.ownerName} ({d.ownerEmail})</td>
                        <td className="px-5 py-3 font-mono text-[11px] text-cyan-300">{d.structureType}</td>
                        <td className="px-5 py-3">{(d.size / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="px-5 py-3">{d.pageCount}</td>
                        <td className="px-5 py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeleteDocument(d.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            title="Remove problematic file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Activity Logs */}
        {activeTab === 'logs' && (
          <div className="rounded-2xl border border-slate-800 overflow-x-auto bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">User ID</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {activityLogs.slice(0, 40).map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="px-5 py-2.5 font-bold text-indigo-300">{log.action}</td>
                    <td className="px-5 py-2.5 text-slate-400 truncate max-w-xs">{log.userId}</td>
                    <td className="px-5 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Admin Account Creation (SUPER_ADMIN only) */}
        {activeTab === 'admins' && isSuperAdmin && (
          <div className="max-w-xl p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-red-400" />
              Provision New Administrator Account
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Grant administrative privileges with granular security controls.
            </p>

            {newAdminMsg.text && (
              <div className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
                newAdminMsg.isError
                  ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              }`}>
                {newAdminMsg.isError ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{newAdminMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Md Serajuddin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Admin Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="mdserajuddin084@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAdmin}
                className="w-full py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submittingAdmin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Administrator...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Admin Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: System Settings (SUPER_ADMIN only) */}
        {activeTab === 'settings' && isSuperAdmin && (
          <div className="max-w-xl p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs">
            <h3 className="text-sm font-bold text-white mb-4">Platform Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Platform Name</label>
                <input
                  type="text"
                  disabled
                  value="NEXORA AI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tagline</label>
                <input
                  type="text"
                  disabled
                  value="Turn Documents Into Knowledge."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Default AI Provider Engine</label>
                <input
                  type="text"
                  disabled
                  value="Google Gemini / Local Semantic Hybrid"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
