import React, { useState } from 'react';
import { NexoraLogo } from '../brand/NexoraLogo';
import {
  FileText,
  BrainCircuit,
  Share2,
  HelpCircle,
  GraduationCap,
  Lock,
  Download,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  ChevronDown,
  ShieldCheck,
  Eye,
  FileSpreadsheet,
  FileImage,
  Presentation
} from 'lucide-react';

export const LandingPage = ({ onGetStarted, onAdminClick }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const fileCategories = [
    {
      title: 'Documents',
      icon: FileText,
      exts: 'PDF, DOC, DOCX, TXT, RTF, ODT',
      desc: 'Automatic text parsing and structural chunking'
    },
    {
      title: 'Spreadsheets',
      icon: FileSpreadsheet,
      exts: 'XLS, XLSX, CSV',
      desc: 'Tabular analysis, row-column relationship intelligence'
    },
    {
      title: 'Presentations',
      icon: Presentation,
      exts: 'PPT, PPTX',
      desc: 'Slide-by-slide topical extraction and synthesis'
    },
    {
      title: 'Images & Scans',
      icon: FileImage,
      exts: 'JPG, JPEG, PNG, WEBP, TIFF',
      desc: 'High-precision Neural OCR text extraction'
    }
  ];

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Document Analysis',
      desc: 'Generates executive summaries, key points, concepts, definitions, action items, and structured findings in seconds.'
    },
    {
      icon: Share2,
      title: '9 Visual Knowledge Topologies',
      desc: 'Convert any file into Mind Maps, Concept Maps, Flowcharts, Tree Diagrams, Process Maps, Timelines, and Chapter Maps.'
    },
    {
      icon: HelpCircle,
      title: 'Source-Grounded RAG Chat',
      desc: 'Ask direct questions with strict anti-hallucination guardrails and clickable citations referencing document, page, and section.'
    },
    {
      icon: GraduationCap,
      title: 'AI Study Mode',
      desc: 'Transform textbooks into interactive flashcards, graded multiple-choice quizzes (MCQs), and quick one-page revision sheets.'
    },
    {
      icon: Layers,
      title: 'Multi-Document Comparison',
      desc: 'Cross-reference multiple files simultaneously to isolate similarities, contrasts, conflicting data, and unique insights.'
    },
    {
      icon: Download,
      title: 'Enterprise Multi-Format Export',
      desc: 'Export structured intelligence and visual diagrams directly to PDF, Word (DOCX), Excel (XLSX), CSV, SVG, PNG, or JSON.'
    }
  ];

  const faqs = [
    {
      q: 'How does Nexora AI prevent AI hallucinations?',
      a: 'Nexora AI enforces a strict retrieval-augmented grounding pipeline. When you ask a question, the system searches the exact semantic chunks of your document and constructs answers solely using retrieved context. If an answer cannot be verified in the document, it explicitly tells you rather than inventing false citations or facts.'
    },
    {
      q: 'Are my uploaded documents private and secure?',
      a: 'Yes. Nexora AI implements database-level tenant isolation. Every document, analysis, mind map, and chat session is strictly scoped to your authenticated account ID. No other user can access or view your files.'
    },
    {
      q: 'What types of documents are supported?',
      a: 'Nexora AI supports universal document ingestion: PDF, Word (DOCX/DOC), Text (TXT/RTF/ODT), Spreadsheets (XLSX/XLS/CSV), Presentations (PPTX/PPT), and scanned images (JPG/PNG/WEBP/TIFF) powered by built-in OCR.'
    },
    {
      q: 'Can I export the visual mind maps?',
      a: 'Yes! You can export interactive mind maps in high-resolution PNG, vector SVG, PDF report format, or structured JSON data.'
    },
    {
      q: 'What languages does Simple Explanation mode support?',
      a: 'You can choose between 5 explanation levels (Very Simple, Student Friendly, Normal, Detailed, Expert) across English, Hindi, and Hinglish.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-18">
          <NexoraLogo size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#mindmap" className="hover:text-indigo-400 transition-colors">Mind Maps</a>
            <a href="#studymode" className="hover:text-indigo-400 transition-colors">Study Mode</a>
            <a href="#files" className="hover:text-indigo-400 transition-colors">Supported Files</a>
            <a href="#security" className="hover:text-indigo-400 transition-colors">Security</a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onGetStarted('login')}
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onGetStarted('register')}
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-transparent blur-[140px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            Next-Generation Document Intelligence & Visual Knowledge Platform
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Turn Documents Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">Knowledge.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Upload documents, analyze information, ask questions, discover connections, create visual mind maps, and export intelligent results with AI.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onGetStarted('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:text-white"
            >
              Explore Nexora AI
            </a>
          </div>

          {/* Hero Core Flow Animation Card */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">nexora-intelligence-pipeline.svg</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Core Product Flow
              </span>
            </div>

            {/* Interactive Flow Diagram */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">1. Document</span>
                <span className="text-[11px] text-slate-400 mt-1">Multi-format upload</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">2. AI Processing</span>
                <span className="text-[11px] text-slate-400 mt-1">OCR & Chunking</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">3. Understanding</span>
                <span className="text-[11px] text-slate-400 mt-1">Deep Semantics</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">4. Insights</span>
                <span className="text-[11px] text-slate-400 mt-1">Key Takeaways</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">5. Mind Map</span>
                <span className="text-[11px] text-slate-400 mt-1">9 Visual Topologies</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">6. Answers</span>
                <span className="text-[11px] text-slate-400 mt-1">Grounded Citations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Enterprise Intelligence</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
              Every tool you need to analyze, visualize and query documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Files Section */}
      <section id="files" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Universal Ingestion</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Supported File Formats</p>
            <p className="text-slate-400 text-sm mt-2">Upload any document, presentation, spreadsheet or photo scan.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fileCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{cat.title}</h4>
                  <span className="text-xs font-mono font-semibold text-indigo-300 mb-2">{cat.exts}</span>
                  <p className="text-xs text-slate-400">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-400 mb-4">
              <ShieldCheck className="w-7 h-7" />
              <span className="text-sm font-bold tracking-wider uppercase">Enterprise Security & Isolation</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Your Documents Are Private. Always.
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Nexora AI enforces strict tenant data isolation. User A can NEVER access User B's documents, chats, or mind maps. Every database transaction is cryptographically scoped, and administrators can only view non-sensitive metadata for system maintenance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Backend-level user scoping
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Bcrypt password hashing
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No third-party training on your files
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Got Questions?</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-white hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <NexoraLogo size="sm" variant="withTagline" />
            <p className="mt-2 text-xs text-slate-500">
              © 2026 Nexora AI Inc. All rights reserved. “Turn Documents Into Knowledge.”
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button onClick={() => onGetStarted('login')} className="hover:text-white">Sign In</button>
            <button onClick={() => onGetStarted('register')} className="hover:text-white">Register</button>
            <button onClick={onAdminClick} className="hover:text-indigo-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
