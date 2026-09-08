'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeatScapeLogo } from '@/components/brand/HeatScapeLogo';

interface Props {
  onOpenCommand?: () => void;
  onOpenSensors?: () => void;
}

export const OperationalHeader: React.FC<Props> = ({ onOpenCommand, onOpenSensors }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Map', href: '/explorer' },
    { label: 'Scenarios', href: '/simulator' },
    { label: 'Impact', href: '/monitoring' },
    { label: 'Multi-View', href: '/multiview' },
    { label: 'Intelligence', href: '/intelligence' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[#090A0B]/95 backdrop-blur-md border-b border-white/10">
      <div className="w-full h-full max-w-[1700px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand & Region */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <HeatScapeLogo size={26} animate={false} />
            <span className="font-sans font-bold text-base tracking-tight text-[#F3F4F6]">
              Heat<span className="text-[#F28B62]">Scape</span>
            </span>
          </Link>

          <span className="text-[#5F666D] hidden md:inline">/</span>

          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-[#8B9299]">
            <span className="material-symbols-outlined text-[14px] text-[#43D6B5]">location_city</span>
            <span>Chennai Metropolitan Region</span>
          </div>
        </div>

        {/* Flat Command Center Navigation */}
        <nav className="hidden lg:flex items-center gap-1 font-sans text-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'text-[#F3F4F6] bg-white/10 font-semibold'
                    : 'text-[#8B9299] hover:text-[#F3F4F6] hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Command Search Button & Live Status */}
        <div className="flex items-center gap-3">
          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#101214] hover:bg-[#141719] border border-white/10 text-xs font-mono text-[#8B9299] hover:text-[#F3F4F6] transition-colors"
              title="Open Command Palette (⌘K)"
            >
              <span className="material-symbols-outlined text-[14px]">search</span>
              <span className="hidden sm:inline">Search...</span>
              <kbd className="px-1 py-0.2 rounded bg-white/5 border border-white/10 text-[10px] text-[#5F666D]">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101214] border border-white/10 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#43D6B5]" />
            <span className="font-semibold text-[#F3F4F6]">LIVE</span>
          </div>

          {/* Sensor Count Trigger */}
          {onOpenSensors && (
            <button
              onClick={onOpenSensors}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-[#8B9299] hover:text-[#F3F4F6] hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px] text-[#43D6B5]">sensors</span>
              <span>842 Nodes</span>
            </button>
          )}

          {/* Profile Minimal Icon */}
          <div className="w-7 h-7 rounded-full bg-[#181B1E] border border-white/15 flex items-center justify-center text-[#F3F4F6]">
            <span className="material-symbols-outlined text-[15px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
