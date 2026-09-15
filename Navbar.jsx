import React from 'react';
import { NexoraLogo } from '../brand/NexoraLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Upload,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Share2,
  GraduationCap,
  Scale,
  History,
  ShieldAlert
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenUpload, onAdminClick }) => {
  const { user, logoutUser, adminUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'mindmap', label: 'Mind Maps', icon: Share2 },
    { id: 'study', label: 'Study Mode', icon: GraduationCap },
    { id: 'compare', label: 'Compare', icon: Scale },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-18">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveTab('dashboard')} className="text-left">
            <NexoraLogo size="sm" />
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Document</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin shortcut if adminUser */}
          {adminUser && (
            <button
              onClick={onAdminClick}
              className="p-2 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              title="Open Admin Console"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-indigo-500/40 bg-slate-800 object-cover"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">{user?.name || 'Nexora User'}</span>
              <span className="text-[10px] text-slate-400">{user?.role || 'USER'}</span>
            </div>
            <button
              onClick={logoutUser}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-slate-800/80 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
