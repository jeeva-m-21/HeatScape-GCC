'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';
import { SatelliteIngestModal } from '@/components/modals/SatelliteIngestModal';
import { ExecutiveTourModal } from '@/components/modals/ExecutiveTourModal';
import { LiveTelemetryTicker } from '@/components/telemetry/LiveTelemetryTicker';

import { useLanguage } from '@/lib/i18n';

export const StitchHeader: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [sensorModalOpen, setSensorModalOpen] = useState(false);
  const [satelliteModalOpen, setSatelliteModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  const navItems = [
    { label: t.commandCenter, href: '/' },
    { label: t.trajectories, href: '/explorer' },
    { label: t.multiView, href: '/multiview' },
    { label: t.planner, href: '/simulator' },
    { label: t.impactMRV, href: '/monitoring' },
    { label: t.intelligence, href: '/intelligence' },
    { label: t.eocCrisis, href: '/eoc' },
    { label: t.coolNavigator, href: '/navigator' },
    { label: t.studioTerrain, href: '/studio' },
    { label: t.fieldOps, href: '/field' },
    { label: t.pitchDeck, href: '/pitch' },
  ];

  return (
    <>
      <header className="w-full bg-[#000000] border-b border-[#222222] z-30 sticky top-0 px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Live Region Pill */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-primary-container flex items-center justify-center font-mono font-bold text-on-primary-container text-xs shadow-md rounded">
              HS
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                {t.appName} <span className="text-primary-container text-xs">// GCC</span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono hidden sm:block">
                {t.appSubtitle}
              </div>
            </div>
          </Link>

          {/* Live Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#222222] text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-300">Chennai Region (EPSG:32644)</span>
            <span className="text-gray-600">•</span>
            <span className="text-emerald-400">Live Engine</span>
          </div>
        </div>

        {/* Navigation Pills (Pure Black & Charcoal) */}
        <nav className="flex items-center bg-[#0d0d0d] border border-[#222222] p-0.5 rounded-full overflow-x-auto max-w-[55vw]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Telemetry Badges, Language Switcher & Tour Button */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-[#101010] border border-[#2a2a2a] rounded p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'en'
                  ? 'bg-primary-container text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'ta'
                  ? 'bg-primary-container text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          <button
            onClick={() => setTourModalOpen(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-mono text-[11px] font-bold flex items-center gap-1.5 rounded shadow-sm cursor-pointer"
            title="Start Interactive Hackathon Judge Tour"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>{t.judgeTour}</span>
          </button>
          <button
            onClick={() => setSatelliteModalOpen(true)}
            className="px-2.5 py-1 bg-[#101010] hover:bg-[#181818] border border-cyan-800/50 hover:border-cyan-500 font-mono text-[11px] text-cyan-400 flex items-center gap-1.5 rounded transition-colors cursor-pointer"
            title="Click to view Landsat-9 & Sentinel-2 Earth Observation status"
          >
            <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
            <span>{t.landsatLive}</span>
          </button>
          <button
            onClick={() => setSensorModalOpen(true)}
            className="px-2.5 py-1 bg-[#101010] hover:bg-[#181818] border border-emerald-800/50 hover:border-emerald-500 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5 rounded transition-colors cursor-pointer"
            title="Click to view live 842 IoT sensor telemetry"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{t.sensorsActive}</span>
          </button>
        </div>
      </header>

      {/* Real-Time WebSocket Telemetry Ticker */}
      <LiveTelemetryTicker />

      {/* Live IoT Sensor Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />

      {/* Earth Observation Satellite Modal */}
      <SatelliteIngestModal
        isOpen={satelliteModalOpen}
        onClose={() => setSatelliteModalOpen(false)}
      />

      {/* Executive Judge Tour Modal */}
      <ExecutiveTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
      />
    </>
  );
};
