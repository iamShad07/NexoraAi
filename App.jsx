import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { IntroAnimation } from './components/brand/IntroAnimation';
import { NexoraLogo } from './components/brand/NexoraLogo';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Navbar } from './components/dashboard/Navbar';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { UploadModal } from './components/upload/UploadModal';
import { DocumentAnalysisView } from './components/analysis/DocumentAnalysisView';
import { DocumentChatView } from './components/chat/DocumentChatView';
import { InteractiveMindMap } from './components/mindmap/InteractiveMindMap';
import { StudyModeView } from './components/study/StudyModeView';
import { DocumentComparisonView } from './components/compare/DocumentComparisonView';
import { HistoryView } from './components/history/HistoryView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { ExportModal } from './components/export/ExportModal';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const { user, adminUser, loading, showLoginWelcome } = useAuth();

  // Intro animation state
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('nexora_intro_seen');
  });

  // Navigation and view state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin');
  });

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState('analysis');

  // Active document state
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);

  const fetchUserDocuments = async () => {
    if (!user) return;
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents || []);
      if (res.documents && res.documents.length > 0 && !activeDocument) {
        setActiveDocument(res.documents[0]);
      }
    } catch (err) {
      console.warn('Documents fetch error:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserDocuments();
    }
  }, [user]);

  // Handle document selection from dashboard/history
  const handleSelectDocument = (doc, targetTab = 'analysis') => {
    setActiveDocument(doc);
    setActiveTab(targetTab);
  };

  // Handle asking AI about a concept from Mind Map
  const handleAskAIAboutConcept = (conceptName) => {
    setActiveTab('chat');
  };

  // Open Export Modal
  const handleOpenExport = (type = 'analysis') => {
    setExportType(type);
    setExportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <span className="text-xs font-semibold text-slate-400">Loading Nexora AI...</span>
      </div>
    );
  }

  // 1. Initial Animated Intro
  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  // 2. Admin Portal View
  if (isAdminRoute) {
    if (adminUser) {
      return (
        <AdminDashboard
          onBackToApp={() => {
            setIsAdminRoute(false);
            window.history.pushState({}, '', '/');
          }}
        />
      );
    }
    return (
      <AdminLoginPage
        onBackToApp={() => {
          setIsAdminRoute(false);
          window.history.pushState({}, '', '/');
        }}
        onLoginSuccess={() => setIsAdminRoute(true)}
      />
    );
  }

  // 3. Post-Login Transition Animation ("Welcome to Nexora AI")
  if (showLoginWelcome) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white animate-fade">
        <div className="p-4 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/25 mb-5 scale-110">
          <NexoraLogo size="lg" showText={false} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Welcome to Nexora AI
        </div>
        <h2 className="text-2xl font-black text-white">“Turn Documents Into Knowledge.”</h2>
        <p className="text-xs text-slate-400 mt-2">Preparing your personal intelligence workspace...</p>
      </div>
    );
  }

  // 4. Landing Page for Unauthenticated Visitors
  if (!user) {
    return (
      <>
        <LandingPage
          onGetStarted={(mode) => {
            setAuthInitialMode(mode);
            setAuthModalOpen(true);
          }}
          onAdminClick={() => {
            setIsAdminRoute(true);
            window.history.pushState({}, '', '/admin/login');
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authInitialMode}
          onClose={() => setAuthModalOpen(false)}
          onAdminSwitch={() => {
            setIsAdminRoute(true);
            window.history.pushState({}, '', '/admin/login');
          }}
        />
      </>
    );
  }

  // 5. Authenticated User Workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setUploadModalOpen(true)}
        onAdminClick={() => {
          setIsAdminRoute(true);
          window.history.pushState({}, '', '/admin/dashboard');
        }}
      />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <UserDashboard
            onOpenUpload={() => setUploadModalOpen(true)}
            onSelectDocument={handleSelectDocument}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'documents' && (
          <UserDashboard
            onOpenUpload={() => setUploadModalOpen(true)}
            onSelectDocument={handleSelectDocument}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'analysis' && (
          <DocumentAnalysisView
            document={activeDocument}
            onNavigateTab={setActiveTab}
            onOpenExport={handleOpenExport}
          />
        )}

        {activeTab === 'chat' && (
          <DocumentChatView
            documents={documents}
            activeDocument={activeDocument}
          />
        )}

        {activeTab === 'mindmap' && (
          <InteractiveMindMap
            document={activeDocument}
            onAskAIAboutConcept={handleAskAIAboutConcept}
          />
        )}

        {activeTab === 'study' && (
          <StudyModeView
            document={activeDocument}
            onOpenExport={handleOpenExport}
          />
        )}

        {activeTab === 'compare' && (
          <DocumentComparisonView documents={documents} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            onSelectDocument={handleSelectDocument}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && <ProfileSettingsView />}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={(newDoc) => {
          fetchUserDocuments();
          setActiveDocument(newDoc);
          setActiveTab('analysis');
        }}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        document={activeDocument}
        exportType={exportType}
      />
    </div>
  );
}
