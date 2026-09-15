import React from 'react';

export const NexoraLogo = ({ size = 'md', showText = true, className = '', variant = 'default' }) => {
  const sizeMap = {
    xs: { icon: 20, text: 'text-sm' },
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 44, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-4xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 font-bold select-none tracking-tight ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105"
        style={{ width: currentSize.icon + 10, height: currentSize.icon + 10 }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/80 backdrop-blur-sm">
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="nexoraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="nexoraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Neural Knowledge Nexus Shape */}
            <path
              d="M20 4L33 11.5V26.5L20 34L7 26.5V11.5L20 4Z"
              stroke="url(#nexoraGrad1)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="rgba(99, 102, 241, 0.08)"
            />
            {/* Inner Connected Node Links */}
            <path
              d="M20 12L28 17M20 12L12 17M20 12V24M12 17L12 25M28 17L28 25M12 25L20 29M28 25L20 29"
              stroke="url(#nexoraGrad2)"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            {/* Intelligent Core Points */}
            <circle cx="20" cy="12" r="2.2" fill="#38bdf8" />
            <circle cx="12" cy="17" r="1.8" fill="#818cf8" />
            <circle cx="28" cy="17" r="1.8" fill="#818cf8" />
            <circle cx="20" cy="24" r="2.5" fill="#a855f7" />
            <circle cx="12" cy="25" r="1.8" fill="#06b6d4" />
            <circle cx="28" cy="25" r="1.8" fill="#06b6d4" />
            <circle cx="20" cy="29" r="2" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${currentSize.text} tracking-tight font-extrabold text-white`}>
              NEXORA
            </span>
            <span className={`${currentSize.text} font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400`}>
              AI
            </span>
          </div>
          {variant === 'withTagline' && (
            <span className="text-[10px] tracking-wider uppercase font-medium text-slate-400">
              Turn Documents Into Knowledge
            </span>
          )}
        </div>
      )}
    </div>
  );
};
