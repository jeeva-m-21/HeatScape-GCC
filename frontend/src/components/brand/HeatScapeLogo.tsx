'use client';

import React from 'react';

interface HeatScapeLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subtitleClassName?: string;
  animate?: boolean;
}

export const HeatScapeLogo: React.FC<HeatScapeLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  textClassName = 'text-white font-bold tracking-tight',
  subtitleClassName = 'text-[#ddc1b1] font-mono text-[10px]',
  animate = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full drop-shadow-[0_2px_8px_rgba(217,119,87,0.3)] ${
            animate ? 'transition-transform hover:scale-105 duration-300' : ''
          }`}
        >
          <defs>
            <linearGradient id="hs-claude-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F2A88F" />
              <stop offset="45%" stopColor="#D97757" />
              <stop offset="80%" stopColor="#C15F3C" />
              <stop offset="100%" stopColor="#4EDEA3" />
            </linearGradient>

            <radialGradient id="hs-hex-bg-comp" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#281A15" />
              <stop offset="70%" stopColor="#140D0B" />
              <stop offset="100%" stopColor="#050302" />
            </radialGradient>
          </defs>

          {/* Outer Hexagonal Cell Boundary (100m Spatial Grid) */}
          <polygon
            points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5"
            fill="url(#hs-hex-bg-comp)"
            stroke="#4A2E24"
            strokeWidth="1.2"
          />

          {/* Subtle Inner Grid Guideline */}
          <polygon
            points="24,6.5 40,15.5 40,32.5 24,41.5 8,32.5 8,15.5"
            fill="none"
            stroke="#D97757"
            strokeWidth="0.75"
            strokeOpacity="0.3"
            strokeDasharray="2 1.5"
          />

          {/* Top Thermal Wave */}
          <path
            d="M13,17 C16.5,13 20.5,12.5 24,14 C27.5,15.5 31.5,15 35,12"
            stroke="url(#hs-claude-grad-comp)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Central Intersecting HeatScape Monogram (H / S Vector) */}
          <path
            d="M15,19 L15,31 M33,17 L33,29 M15,25 C19,25 21,21 24,21 C27,21 29,25 33,25"
            stroke="url(#hs-claude-grad-comp)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom Resilience Wave */}
          <path
            d="M14,35 C17.5,32 20.5,33 24,34.5 C27.5,36 30.5,35 34,32"
            stroke="#4EDEA3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />

          {/* Sensor Mesh Anchor Nodes */}
          <circle cx="24" cy="14" r="2.2" fill="#F2A88F" />
          <circle cx="15" cy="25" r="1.8" fill="#D97757" />
          <circle cx="33" cy="25" r="1.8" fill="#D97757" />
          <circle cx="24" cy="34.5" r="2" fill="#4EDEA3" />
        </svg>

        {animate && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97757] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97757]"></span>
          </span>
        )}
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-headline-sm text-[17px] ${textClassName}`}>
              Heat<span className="text-[#D97757]">Scape</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#D97757]/15 text-[#D97757] border border-[#D97757]/30">
              GCC
            </span>
          </div>
          <span className={`mt-0.5 leading-tight ${subtitleClassName}`}>
            Chennai Climate Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
