import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  FileText,
  Lightbulb,
  Award
} from 'lucide-react';

export const StudyModeView = ({ document, onOpenExport }) => {
  const [studyKit, setStudyKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'mcq' | 'questions' | 'revision'

  // Flashcards state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // MCQ state
  const [userAnswers, setUserAnswers] = useState({});
  const [showMCQResults, setShowMCQResults] = useState(false);

  const fetchStudyKit = async (regenerate = false) => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await api.getStudyKit(document.id || document._id, regenerate);
      setStudyKit(res.studyKit);
      setUserAnswers({});
      setShowMCQResults(false);
      setActiveCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Failed to load study kit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyKit(false);
  }, [document]);

  const handleSelectAnswer = (mcqId, optionIdx) => {
    if (showMCQResults) return;
    setUserAnswers((prev) => ({
      ...prev,
      [mcqId]: optionIdx
    }));
  };

  const handleGradeQuiz = () => {
    setShowMCQResults(true);
    const mcqs = studyKit?.mcqs || [];
    let correct = 0;
    mcqs.forEach((m) => {
      if (userAnswers[m.id] === m.correctIndex) correct++;
    });

    if (correct === mcqs.length && mcqs.length > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400">
        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Please select a document from your dashboard to enter AI Study Mode.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Generating AI Study Kit...</h3>
        <p className="text-xs text-slate-400 mt-1">
          Synthesizing flashcards, exam questions, MCQs, and high-yield revision notes.
        </p>
      </div>
    );
  }

  const flashcards = studyKit?.flashcards || [];
  const mcqs = studyKit?.mcqs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            Educational Study Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Study: {document.originalName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master the material with interactive quiz assessments, 3D flashcards, and exam sheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchStudyKit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/20 hover:bg-purple-500/25 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Regenerate Study Kit
          </button>
          <button
            onClick={() => onOpenExport('study')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Notes
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'flashcards', label: 'Interactive Flashcards', icon: Sparkles },
          { id: 'mcq', label: 'Practice MCQs Quiz', icon: HelpCircle },
          { id: 'questions', label: 'Short & Long Questions', icon: BookOpen },
          { id: 'revision', label: 'Quick Revision Sheet', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: 3D Flip Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto py-4">
          {flashcards.length === 0 ? (
            <p className="text-center text-sm text-slate-400">No flashcards available.</p>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 mb-4">
                Card {activeCardIndex + 1} of {flashcards.length} • Click card to flip
              </span>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-80 cursor-pointer perspective-1000"
              >
                <div
                  className={`relative w-full h-full rounded-3xl p-8 transition-transform duration-500 transform-style-3d border ${
                    isFlipped
                      ? 'rotate-y-180 bg-slate-900/95 border-teal-500/40 shadow-2xl shadow-teal-500/10'
                      : 'bg-slate-900/90 border-indigo-500/30 shadow-2xl shadow-indigo-500/10'
                  }`}
                >
                  {/* Front Face */}
                  {!isFlipped ? (
                    <div className="flex flex-col justify-between h-full backface-hidden">
                      <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
                        <span>Concept Challenge</span>
                        <span>{flashcards[activeCardIndex].source}</span>
                      </div>
                      <div className="my-auto text-center">
                        <p className="text-xl sm:text-2xl font-black text-white leading-snug">
                          {flashcards[activeCardIndex].front}
                        </p>
                      </div>
                      <span className="text-[11px] text-center text-slate-500">
                        Tap anywhere to reveal explanation
                      </span>
                    </div>
                  ) : (
                    /* Back Face */
                    <div className="flex flex-col justify-between h-full rotate-y-180 backface-hidden">
                      <div className="flex items-center justify-between text-xs text-teal-400 font-bold uppercase tracking-wider">
                        <span>Verified Explanation</span>
                        <span>{flashcards[activeCardIndex].source}</span>
                      </div>
                      <div className="my-auto text-center px-4">
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                          {flashcards[activeCardIndex].back}
                        </p>
                      </div>
                      <span className="text-[11px] text-center text-slate-500">
                        Tap again to flip back
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Nav Controls */}
              <div className="flex items-center gap-4 mt-8">
                <button
                  disabled={activeCardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={activeCardIndex === flashcards.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-all"
                >
                  Next Concept
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interactive MCQs Quiz */}
      {activeTab === 'mcq' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Assessment Test</h3>
              <p className="text-xs text-slate-400">Answer each question to evaluate your document mastery.</p>
            </div>
            {!showMCQResults && (
              <button
                onClick={handleGradeQuiz}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-md transition-all"
              >
                Submit & Grade
              </button>
            )}
          </div>

          {mcqs.map((mcq, idx) => {
            const selectedOpt = userAnswers[mcq.id];
            const isCorrect = selectedOpt === mcq.correctIndex;

            return (
              <div
                key={mcq.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-xs font-bold text-purple-400 uppercase">Question {idx + 1}</span>
                  <span className="text-[10px] text-slate-500">{mcq.source}</span>
                </div>

                <p className="text-sm font-bold text-white mb-4 leading-relaxed">
                  {mcq.question}
                </p>

                <div className="space-y-2.5">
                  {mcq.options.map((opt, oIdx) => {
                    const isPicked = selectedOpt === oIdx;
                    let optStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (showMCQResults) {
                      if (oIdx === mcq.correctIndex) {
                        optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isPicked && !isCorrect) {
                        optStyle = 'bg-red-500/20 border-red-500 text-red-300';
                      }
                    } else if (isPicked) {
                      optStyle = 'bg-purple-600/30 border-purple-500 text-white font-semibold';
                    }

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectAnswer(mcq.id, oIdx)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {showMCQResults && oIdx === mcq.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {showMCQResults && isPicked && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {showMCQResults && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-indigo-400 block mb-1">Explanation:</span>
                    {mcq.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Short & Long Questions */}
      {activeTab === 'questions' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Short Conceptual Questions (3 Marks Each)
            </h3>
            <div className="space-y-4">
              {(studyKit?.shortQuestions || []).map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <p className="text-xs font-bold text-white mb-1.5">Q{idx + 1}: {q.question}</p>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-indigo-400">Answer:</strong> {q.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Comprehensive Essay Questions (10 Marks Each)
            </h3>
            <div className="space-y-4">
              {(studyKit?.longQuestions || []).map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <p className="text-xs font-bold text-white mb-2">Q{idx + 1}: {q.question}</p>
                  <div className="text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-purple-300">Key Points to Address:</span>
                    {(q.keyPoints || []).map((kp, kIdx) => (
                      <p key={kIdx} className="text-slate-400 pl-2">• {kp}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Quick Revision Sheet */}
      {activeTab === 'revision' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              One-Page High-Yield Revision Sheet
            </h3>
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-line leading-relaxed">
              {studyKit?.quickRevisionSheet || 'Revision sheet generated.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                Revision Notes
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(studyKit?.revisionNotes || []).map((rn, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{rn}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
                Exam-Focused Traps & Tips
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(studyKit?.examFocusedPoints || []).map((ep, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{ep}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
