import React, { useState, useEffect } from 'react';
import { NexoraLogo } from './NexoraLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

export const IntroAnimation = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Stage 1: Logo fades/scales in
    const t1 = setTimeout(() => setStep(2), 600);
    // Stage 2: "Welcome to Nexora AI"
    const t2 = setTimeout(() => setStep(3), 1500);
    // Stage 3: "Turn Documents Into Knowledge."
    const t3 = setTimeout(() => setStep(4), 2400);
    // Stage 4: Finish transition
    const t4 = setTimeout(() => {
      handleFinish();
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleFinish = () => {
    sessionStorage.setItem('nexora_intro_seen', 'true');
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4 overflow-hidden transition-opacity duration-700">
      {/* Background Animated Neural Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
      <div className="absolute h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px] animate-pulse-slow" />
      <div className="absolute -bottom-20 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[100px]" />

      {/* Floating Network Nodes */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-md transition-all"
      >
        Skip Intro
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Central Sequence Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Step 1 & 2: Logo and NEXORA AI */}
        <div className={`transition-all duration-700 transform ${step >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
          <div className="p-4 rounded-3xl bg-slate-900/40 border border-indigo-500/20 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
            <NexoraLogo size="xl" showText={false} />
          </div>
        </div>

        <div className={`mt-6 transition-all duration-700 transform ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            NEXORA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">AI</span>
          </h1>
        </div>

        {/* Step 2: Welcome to Nexora AI */}
        <div className={`mt-3 transition-all duration-500 transform ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Welcome to Nexora AI
          </div>
        </div>

        {/* Step 3: Turn Documents Into Knowledge. */}
        <div className={`mt-4 transition-all duration-700 transform ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <p className="text-xl sm:text-2xl font-semibold text-slate-200 tracking-tight">
            “Turn Documents Into Knowledge.”
          </p>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Understand. Analyze. Ask. Discover.
          </p>
        </div>

        {/* Progress Bar Indicator */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
