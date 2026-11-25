import React from 'react';

export default function UftbLogo({ className = "w-10 h-10", showText = false, lang = "en" }) {
  return (
    <div className="flex items-center gap-3">
      {/* SVG GradPath Logo */}
      <div className={`relative flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Ring */}
          <circle cx="100" cy="100" r="94" stroke="#059669" strokeWidth="4" strokeDasharray="6 3" />
          <circle cx="100" cy="100" r="88" stroke="#0284c7" strokeWidth="2.5" />
          
          {/* Shield Outline */}
          <path d="M50 45 C 50 45, 100 35, 150 45 C 150 115, 130 150, 100 165 C 70 150, 50 115, 50 45 Z" 
                fill="#ffffff" stroke="#047857" strokeWidth="4" className="dark:fill-slate-900" />
          
          {/* Inner Book / Academic Growth Path */}
          <path d="M56 55 Q 100 65 100 95 Q 100 65 144 55 L 144 110 Q 100 120 100 135 Q 100 120 56 110 Z" 
                fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" className="dark:fill-emerald-950/40" />

          {/* Center dividing spine */}
          <line x1="100" y1="58" x2="100" y2="135" stroke="#047857" strokeWidth="2.5" />

          {/* Left page: Growth Pathway Bars */}
          <rect x="68" y="98" width="5" height="12" rx="1" fill="#047857" />
          <rect x="76" y="90" width="5" height="20" rx="1" fill="#047857" />
          <rect x="84" y="80" width="5" height="30" rx="1" fill="#047857" />

          {/* Right page: Academic Star / Target */}
          <polygon points="122,68 125,76 134,76 127,81 130,89 122,84 114,89 117,81 110,76 119,76" fill="#0284c7" />
          <line x1="122" y1="92" x2="122" y2="115" stroke="#0284c7" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="122" cy="116" r="3" fill="#0284c7" />

          {/* Graduation Cap Tassel Base */}
          <path d="M 80 135 Q 100 120 120 135 L 126 148 L 118 152 L 114 146 L 100 148 L 86 146 L 82 152 L 74 148 Z" 
                fill="#059669" stroke="#065f46" strokeWidth="2" />
          <circle cx="100" cy="138" r="4" fill="#ffffff" className="dark:fill-slate-900" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white">
              Grad<span className="text-emerald-600 dark:text-emerald-400">Path</span>
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[220px] sm:max-w-xs">
            {lang === 'bn' 
              ? 'স্মার্ট সিজিপিএ প্ল্যানার ও একাডেমিক ট্র্যাকার' 
              : 'Smart CGPA Planner & Academic Tracker'}
          </p>
        </div>
      )}
    </div>
  );
}
