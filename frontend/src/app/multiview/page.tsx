'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { TenderManifest } from '@/lib/types';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';
import { downloadGeoJSON } from '@/lib/export-utils';

type SpatialMode = 'thermal' | 'satellite' | 'street' | 'vulnerability' | 'continuous_kde';
type WardTab = 'overview' | 'whymatters' | 'interventions' | 'historical';

interface WardDetail {
  id: string;
  name: string;
  zone: string;
  secCode: string;
  anomaly: string;
  trend: string;
  status: string;
  population: string;
  density: string;
  sensitiveHubs: string;
  sensitiveDetails: string;
  impervious: string;
  canopy: string;
  forecast2027: string;
  cx: number;
  cy: number;
}

const WARDS_DATA: Record<string, WardDetail> = {
  '114': {
    id: '114',
    name: 'Teynampet • Ward 114',
    zone: 'Zone IX (Teynampet South), Anna Salai & GN Chetty Grid',
    secCode: 'WARD-114 • SEC-4B',
    anomaly: '+2.8°C',
    trend: '+0.03°C / mo',
    status: 'EMERGING',
    population: '4,180',
    density: '28,400/km²',
    sensitiveHubs: '2 Schools',
    sensitiveDetails: '1 Maternity Clinic, 1 Daycare',
    impervious: '84%',
    canopy: '4.1%',
    forecast2027: '+3.6°C',
    cx: 495,
    cy: 305,
  },
  '117': {
    id: '117',
    name: 'T. Nagar Core • Ward 117',
    zone: 'Zone X (Kodambakkam), Usman Rd & Pondy Bazaar Corridor',
    secCode: 'WARD-117 • SEC-1A',
    anomaly: '+4.2°C',
    trend: '+0.05°C / mo',
    status: 'PERSISTENT',
    population: '6,420',
    density: '38,200/km²',
    sensitiveHubs: '4 Schools',
    sensitiveDetails: '2 Hospitals, 1 Bus Terminus',
    impervious: '93%',
    canopy: '2.3%',
    forecast2027: '+4.9°C',
    cx: 325,
    cy: 245,
  },
  '119': {
    id: '119',
    name: 'CIT Nagar • Ward 119',
    zone: 'Zone X (South Extension), South Usman & Venkatanarayana',
    secCode: 'WARD-119 • SEC-3C',
    anomaly: '+1.8°C',
    trend: '+0.02°C / mo',
    status: 'WATCH',
    population: '3,890',
    density: '22,100/km²',
    sensitiveHubs: '1 School',
    sensitiveDetails: '1 Urban Health Post',
    impervious: '76%',
    canopy: '7.8%',
    forecast2027: '+2.4°C',
    cx: 390,
    cy: 350,
  },
};

export default function MultiViewScreen() {
  const [activeMode, setActiveMode] = useState<SpatialMode>('thermal');
  const [activeTab, setActiveTab] = useState<WardTab>('overview');
  const [selectedWardKey, setSelectedWardKey] = useState<string>('114');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('Ward 114 • Teynampet');
  const [filterState, setFilterState] = useState<'all' | 'emerging' | 'hotspots'>('all');
  const [tenderModalOpen, setTenderModalOpen] = useState<boolean>(false);
  const [sensorModalOpen, setSensorModalOpen] = useState<boolean>(false);
  const [tenderManifest, setTenderManifest] = useState<TenderManifest | null>(null);
  const [tenderLoading, setTenderLoading] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [is3DTilt, setIs3DTilt] = useState<boolean>(false);

  const currentWard = WARDS_DATA[selectedWardKey] || WARDS_DATA['114'];

  const handleSelectWard = (key: string) => {
    setSelectedWardKey(key);
    setDrawerOpen(true);
    setSearchQuery(WARDS_DATA[key]?.name || '');
  };

  const handleFetchTender = async () => {
    setTenderLoading(true);
    setTenderModalOpen(true);
    try {
      const data = await apiClient.getTenderManifest({
        budget_inr: 5000000,
        mode: 'EXPECTED',
        target_wards: [currentWard.name],
        equity_weight: 0.6,
        contiguity_priority: true,
      });
      setTenderManifest(data);
    } catch (err) {
      console.error('Failed to generate tender manifest', err);
    } finally {
      setTenderLoading(false);
    }
  };

  const handleExportGISData = async () => {
    try {
      const data = await apiClient.getCellsGeoJSON();
      downloadGeoJSON(data, 'chennai_heatscape_100m_grid.geojson');
    } catch (err) {
      console.error('Failed to export GeoJSON:', err);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Main Navigation Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container-highest/40 shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
        <div className="w-full h-header-height px-gutter-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0">
              <img
                alt="Brand logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1V_U6qg3PIcJPAwsgB2PIqlGXh7-7AaKQoFO211JBy5xI4_7fm7qpAsuMRizqvQBX3HmPf7x3cB0NfMxbNaM7RvErdjbuAKy61R4fdDNFXy12ulmfJNG5PMdTCRRt0V83mb_6l3ZZvtC6uHfQlOquH6LJUnaRsUcTdcQxK8JHvVrxIHGkabbk0xQWcxXoA32CfuMMmnb1CMPANZnfw2YAQFmx2BOEHhjA3omyCkMTvzbLI-_EFQE2aZpRNI"
              />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight hidden sm:inline-block">
                HeatScape
              </span>
            </Link>
            <div className="h-4 w-px bg-surface-container-highest/60 hidden md:block" />
            <div className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low border border-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">radar</span>
              <span className="text-on-surface font-medium">Chennai Metropolitan Region</span>
              <span className="text-outline/60">•</span>
              <span className="flex items-center gap-1 text-tertiary font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
                </span>
                Multi-View Matrix
              </span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-surface-container-low border border-surface-container-highest/40 text-label-sm">
            <Link
              href="/"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Overview
            </Link>
            <Link
              href="/explorer"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Trajectories Map
            </Link>
            <Link
              href="/multiview"
              className="px-space-md py-1 rounded-full bg-surface-container-high text-on-surface font-semibold shadow-sm"
            >
              Multi-View
            </Link>
            <Link
              href="/simulator"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Scenario Simulator
            </Link>
            <Link
              href="/monitoring"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Impact Monitoring
            </Link>
            <Link
              href="/intelligence"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Urban Intelligence
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setSensorModalOpen(true)}
              className="hidden xl:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/15 hover:bg-tertiary-container/30 border border-tertiary/30 hover:border-tertiary text-tertiary font-label-sm text-label-sm transition-all cursor-pointer shadow-sm"
              title="Click to view live 842 IoT sensor telemetry"
            >
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-medium">842 Sensors • Healthy</span>
            </button>
            <button
              onClick={handleExportGISData}
              className="flex items-center gap-1.5 px-space-md py-1 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#2e2e2e] hover:border-emerald-500 text-emerald-400 font-label-sm text-label-sm font-semibold transition-all cursor-pointer shadow-sm"
              title="Download Chennai 100m Grid GeoJSON for QGIS / ArcGIS Pro"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="hidden sm:inline">Export GeoJSON</span>
            </button>
            <button
              onClick={handleFetchTender}
              className="flex items-center gap-1.5 px-space-md py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-[0_2px_10px_rgba(243,128,32,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span className="hidden sm:inline">Tender BOQ</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header Context Bar */}
      <section className="sticky top-header-height z-30 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest/40">
        <div className="w-full px-gutter-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
            <span>GCC Command</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Microclimate Ops</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-medium">Multi-View Thermal & Street Grid</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all">
              <span className="material-symbols-outlined text-[16px]">date_range</span>
              <span>Last 24 Hours</span>
            </button>
            <button
              onClick={() => {
                const geojsonBlob = new Blob([JSON.stringify(currentWard, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(geojsonBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentWard.secCode}_Telemetry.json`;
                a.click();
              }}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Telemetry</span>
            </button>
            <Link
              href={`/simulator?ward=${selectedWardKey}`}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-[0_2px_10px_rgba(243,128,32,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Run Simulation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Full-Height Spatial Canvas */}
      <main className="relative w-full h-[calc(100vh-theme(spacing.header-height)-3.25rem)] overflow-hidden bg-surface-container-lowest select-none">
        {/* Base Vector & Tile Map Canvas (Carto Dark Matter Satellite Backdrop) */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ${
            activeMode === 'satellite'
              ? 'filter saturate-100 contrast-110 opacity-85'
              : 'filter saturate-50 contrast-125 opacity-70'
          } ${is3DTilt ? 'scale-105 rotate-1' : ''}`}
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXw-J-P_3I-vbGOepa-o1KqnW8scU__SyNA5FHE4AZZ3raI0GEpeN5_jlBSZXNKR5NMgc6pwnBUlhC2SeHlGHuvIxH2iOgCrbOijT-r_e5-7WUY8nJHErAnSzqKfqL-uADKtUDQQEup0c-72-7PXxXMQKkQaXhsaKq2FN0GHlEMOr8zU6QlZMZPTdp4QL_YUI7hv3cv_QHUXKQK8nsAwFj5u5danKYUSe-1c8Fo66UvWQ_lrbnxv1smg')`,
            transform: `scale(${zoomLevel})`,
          }}
        />

        {/* Atmospheric Gradients */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-surface via-transparent to-surface-container-lowest/80" />
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container/20 via-surface-container-lowest/0 to-transparent" />

        {/* Scaled Spatial Vector Map Layer (SVG Polygons & Corridors) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient cx="50%" cy="50%" id="heatExtremeRed" r="50%">
              <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#f38020" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#93000a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#93000a" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id="heatModerateAmber" r="50%">
              <stop offset="0%" stopColor="#f38020" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#ffb787" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f38020" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id="coolVibrantBlue" r="50%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.7" />
              <stop offset="45%" stopColor="#00a6e0" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#005236" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#051424" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id="coolGreenPark" r="50%">
              <stop offset="0%" stopColor="#4edea3" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#00b57d" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#003824" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id="gaussianKdeGlow" r="50%">
              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#eab308" stopOpacity="0.3" />
              <stop offset="90%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <pattern height="120" id="streetGrid" patternUnits="userSpaceOnUse" width="120">
              <path
                d="M 120 0 L 0 0 0 120"
                fill="none"
                stroke="#273647"
                strokeDasharray="2 4"
                strokeOpacity="0.35"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>

          {/* Background Grid Pattern */}
          <rect fill="url(#streetGrid)" height="100%" pointerEvents="none" width="100%" />

          {/* Major Arterial Vector Corridors (Anna Salai, Mount Road, Usman Road) */}
          <g
            fill="none"
            pointerEvents="none"
            stroke={activeMode === 'street' ? '#f38020' : '#7bd0ff'}
            strokeLinecap="round"
            strokeOpacity={activeMode === 'street' ? 0.7 : 0.3}
          >
            <path
              d="M 180,680 L 360,430 L 490,305 L 670,160"
              strokeDasharray="6 3"
              strokeWidth={activeMode === 'street' ? 5 : 3.5}
            />
            <path
              d="M 230,220 L 320,260 L 480,310 L 610,390"
              strokeWidth={activeMode === 'street' ? 4 : 2.5}
            />
            <path d="M 340,170 L 320,380 L 290,560" strokeWidth="2" />
            <path d="M 460,210 L 495,305 L 540,480" strokeWidth="2" />
          </g>

          {/* Ward 117 (T. Nagar North) Mesh */}
          <polygon
            fill={activeMode === 'thermal' ? 'url(#heatExtremeRed)' : '#ffb4ab'}
            fillOpacity={activeMode === 'thermal' ? 0.8 : 0.15}
            points="220,160 360,140 400,240 280,270"
            stroke="#ffb4ab"
            strokeDasharray="4 3"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-90 transition-all"
            onClick={() => handleSelectWard('117')}
          />

          {/* Ward 119 (CIT Nagar / South) */}
          <polygon
            fill="#7bd0ff"
            fillOpacity={activeMode === 'thermal' ? 0.2 : 0.1}
            points="280,270 410,240 450,380 310,410"
            stroke="#7bd0ff"
            strokeDasharray="4 3"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-90 transition-all"
            onClick={() => handleSelectWard('119')}
          />

          {/* Ward 114 (Teynampet Active Boundary) */}
          <polygon
            fill={selectedWardKey === '114' ? 'url(#heatModerateAmber)' : '#f38020'}
            fillOpacity={selectedWardKey === '114' ? 0.6 : 0.15}
            points="410,240 560,200 630,310 540,420 440,360"
            stroke="#f38020"
            strokeDasharray="5 2"
            strokeWidth={selectedWardKey === '114' ? 2.5 : 1.5}
            className="cursor-pointer hover:opacity-90 transition-all"
            onClick={() => handleSelectWard('114')}
          />

          {/* Cool Anomaly: Guindy National Reserve Verge */}
          <polygon
            className="transition-all duration-300 hover:opacity-90 cursor-pointer"
            fill="url(#coolVibrantBlue)"
            points="110,430 220,400 270,510 180,560 90,500"
          />
          <circle cx="175" cy="475" fill="url(#coolGreenPark)" r="42" />
          <circle
            cx="175"
            cy="475"
            fill="none"
            r="58"
            stroke="#00d4ff"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />

          {/* Continuous Gaussian Thermal Heatmap Layer (active when continuous_kde) */}
          {activeMode === 'continuous_kde' && (
            <g className="transition-opacity duration-500 animate-pulse pointer-events-none">
              <circle cx="325" cy="245" r="160" fill="url(#gaussianKdeGlow)" />
              <circle cx="495" cy="305" r="140" fill="url(#gaussianKdeGlow)" />
              <circle cx="260" cy="350" r="110" fill="url(#gaussianKdeGlow)" />
              <circle cx="410" cy="180" r="100" fill="url(#gaussianKdeGlow)" />
              <circle cx="175" cy="475" r="140" fill="url(#coolVibrantBlue)" />
            </g>
          )}

          {/* T. Nagar Hotspot Circle Visuals */}
          <circle className="animate-pulse" cx="325" cy="245" fill="#ff3b30" fillOpacity="0.25" r="54" />
          <circle cx="325" cy="245" fill="#ff3b30" fillOpacity="0.65" r="28" />
          <circle
            cx="325"
            cy="245"
            fill="none"
            r="70"
            stroke="#ff3b30"
            strokeDasharray="3 3"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />

          {/* Interactive Target Ward Pin Animation */}
          <g
            className="cursor-pointer group"
            onClick={() => handleSelectWard(selectedWardKey)}
          >
            <circle
              className="animate-pulse"
              cx={currentWard.cx}
              cy={currentWard.cy}
              fill="none"
              r="68"
              stroke="#f38020"
              strokeDasharray="6 4"
              strokeWidth="2"
            />
            <circle
              className="animate-ping"
              cx={currentWard.cx}
              cy={currentWard.cy}
              fill="#f38020"
              fillOpacity="0.25"
              r="48"
              style={{ animationDuration: '2.8s' }}
            />
            <circle cx={currentWard.cx} cy={currentWard.cy} fill="#f38020" fillOpacity="0.75" r="24" />
            <circle cx={currentWard.cx} cy={currentWard.cy} fill="#ffffff" r="7" />
          </g>
        </svg>

        {/* Floating Target Pin Badge */}
        <div
          className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-500"
          style={{ top: `${currentWard.cy - 16}px`, left: `${currentWard.cx}px` }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/95 text-on-surface text-label-sm font-label-sm shadow-xl backdrop-blur-md whitespace-nowrap border border-surface-container-highest/60">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-semibold text-primary">{currentWard.secCode.split('•')[1] || currentWard.secCode}</span>
            <span className="text-on-surface-variant font-normal">• {currentWard.name.split('•')[0]}</span>
            <span className="font-code-sm text-code-sm text-primary-container font-medium">
              {currentWard.anomaly}
            </span>
          </div>
          <div className="w-3 h-3 bg-surface-container-lowest rotate-45 -mt-1.5 shadow-sm border-r border-b border-surface-container-highest/60" />
          <div className="w-3 h-3 rounded-full bg-primary-container ring-4 ring-primary-container/30 mt-1 shadow-lg" />
        </div>

        {/* Ambient Map Labels */}
        <div className="absolute top-[185px] left-[265px] pointer-events-none flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 border border-error/40 text-error font-code-sm text-code-sm shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-error animate-ping" />
            <span className="font-bold text-on-surface">T. Nagar Core</span>
            <span className="font-bold text-error">+4.2°C</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-[11px] font-label-sm text-outline tracking-wide">
            Usman Rd • Pondy Bazaar
          </span>
        </div>

        <div className="absolute top-[345px] left-[320px] pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 border border-secondary/30 text-secondary font-label-sm text-label-sm backdrop-blur-sm shadow-md">
            Ward 119 • CIT Nagar (+1.8°C)
          </span>
        </div>

        <div className="absolute top-[410px] left-[430px] pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-lowest/85 border border-surface-container-highest/60 text-on-surface-variant font-label-sm text-label-sm shadow-sm">
          <span className="material-symbols-outlined text-[14px] text-secondary">navigation</span>
          <span className="font-medium text-secondary">Anna Salai (Mount Rd Corridor)</span>
        </div>

        <div className="absolute top-[490px] left-[150px] pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-tertiary font-code-sm text-code-sm backdrop-blur-sm">
            Guindy Reserve (-1.4°C)
          </span>
        </div>

        {/* Floating Top Controls Bar: Search & Mode Segmented Switcher */}
        <div className="absolute top-4 inset-x-6 z-30 flex items-center justify-between gap-4 pointer-events-none">
          {/* Left: Search input */}
          <div className="flex items-center gap-2 pointer-events-auto p-1.5 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-container-highest/60 shadow-2xl w-80">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant flex-1 focus-within:text-on-surface border border-surface-container-highest/40">
              <span className="material-symbols-outlined text-[18px] text-primary-container">search</span>
              <input
                className="w-full bg-transparent text-on-surface font-label-md text-label-md outline-none placeholder:text-outline/70 font-medium"
                placeholder="Find ward, node or corridor..."
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const q = e.target.value.toLowerCase();
                  if (q.includes('nagar') || q.includes('117')) setSelectedWardKey('117');
                  else if (q.includes('cit') || q.includes('119')) setSelectedWardKey('119');
                  else if (q.includes('teynampet') || q.includes('114')) setSelectedWardKey('114');
                }}
              />
              <span className="text-outline/60 text-code-sm font-code-sm bg-surface-container-high px-1 py-0.5 rounded border border-surface-container-highest/80">
                CHE
              </span>
            </div>
          </div>

          {/* Center: Multi-View Spatial Mode Segmented Switcher */}
          <div className="pointer-events-auto flex items-center p-1 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl">
            <button
              onClick={() => setActiveMode('thermal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all ${
                activeMode === 'thermal'
                  ? 'bg-primary-container text-on-primary-container shadow-[0_2px_10px_rgba(243,128,32,0.3)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">thermostat</span>
              <span>Thermal Anomaly</span>
              <span className="px-1.5 py-0.2 rounded-full bg-on-primary-container/20 text-on-primary-container text-[11px] font-bold">
                LST
              </span>
            </button>
            <button
              onClick={() => setActiveMode('satellite')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'satellite'
                  ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">satellite_alt</span>
              <span>Satellite & NDVI</span>
            </button>
            <button
              onClick={() => setActiveMode('street')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'street'
                  ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">alt_route</span>
              <span>Street & Infrastructure</span>
            </button>
            <button
              onClick={() => setActiveMode('vulnerability')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'vulnerability'
                  ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
              <span>Vulnerability Matrix</span>
            </button>
            <button
              onClick={() => setActiveMode('continuous_kde')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'continuous_kde'
                  ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(243,128,32,0.4)] font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">blur_on</span>
              <span>Thermal Glow (KDE)</span>
            </button>
          </div>

          {/* Right Quick Filter Pills */}
          <div className="pointer-events-auto hidden xl:flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-highest/60 shadow-xl">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1 rounded-xl font-label-sm text-label-sm font-medium transition-all ${
                filterState === 'all'
                  ? 'bg-surface-container-high text-on-surface shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              All Wards
            </button>
            <button
              onClick={() => {
                setFilterState('emerging');
                handleSelectWard('114');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-label-sm text-label-sm transition-colors ${
                filterState === 'emerging'
                  ? 'bg-primary-container/20 border border-primary-container text-primary font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span>38 Emerging</span>
            </button>
            <button
              onClick={() => {
                setFilterState('hotspots');
                handleSelectWard('117');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-label-sm text-label-sm transition-colors ${
                filterState === 'hotspots'
                  ? 'bg-error/20 border border-error text-error font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error" />
              <span>126 Hotspots</span>
            </button>
          </div>
        </div>

        {/* Floating Bottom-Left Map Legend */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2.5 p-3.5 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl w-80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary-container">
                device_thermostat
              </span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface tracking-wide">
                {activeMode === 'satellite'
                  ? 'NDVI Vegetative Scale'
                  : activeMode === 'vulnerability'
                  ? 'SEVI Social Vulnerability'
                  : 'Thermal Anomaly Divergent Scale'}
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-outline px-1.5 py-0.5 rounded bg-surface-container-low border border-surface-container-highest/40">
              {activeMode === 'satellite' ? 'Sentinel-2' : 'MODIS 100m'}
            </span>
          </div>

          {/* Divergent Gradient Bar */}
          <div className="relative w-full">
            <div
              className="w-full h-3 rounded-full shadow-inner border border-surface-container-highest/60"
              style={{
                background:
                  activeMode === 'satellite'
                    ? 'linear-gradient(90deg, #93000a 0%, #f38020 30%, #ffb787 60%, #4edea3 85%, #00b57d 100%)'
                    : 'linear-gradient(90deg, #00d4ff 0%, #00a6e0 22%, #273647 48%, #f38020 74%, #ff3b30 100%)',
              }}
            />
            <div className="flex justify-between items-center text-[10px] font-code-sm text-outline px-0.5 pt-1">
              <span>|</span>
              <span>|</span>
              <span>▲ 0°C</span>
              <span>|</span>
              <span>|</span>
            </div>
          </div>

          <div className="flex items-center justify-between font-code-sm text-code-sm pt-0.5">
            <div className="flex flex-col">
              <span className="text-secondary font-bold">-2.5°C</span>
              <span className="text-[11px] font-label-sm text-on-surface-variant">Cool Canopy</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-on-surface font-semibold">±0.0°C</span>
              <span className="text-[11px] font-label-sm text-outline">Baseline</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-error font-bold">+4.5°C</span>
              <span className="text-[11px] font-label-sm text-error">Extreme Heat</span>
            </div>
          </div>

          {/* Sensor Live Callout */}
          <div className="pt-2 border-t border-surface-container-highest/50 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              842 Grid Telemetry Nodes Active
            </span>
            <span className="font-code-sm text-code-sm text-tertiary">±0.2°C acc</span>
          </div>
        </div>

        {/* Floating Right Map Navigation Controls */}
        <div className="absolute bottom-6 right-[450px] z-20 flex flex-col gap-1 p-1 rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-highest/60 shadow-xl">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <div className="w-full h-px bg-surface-container-highest/40 my-0.5" />
          <button
            onClick={() => setIs3DTilt(!is3DTilt)}
            className={`p-2 rounded-lg transition-colors ${
              is3DTilt
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            title="3D Isometric Tilt"
          >
            <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setIs3DTilt(false);
            }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Reset North Center"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
          </button>
        </div>

        {/* Floating Right Detail Drawer (Google Stitch Screen 03) */}
        {drawerOpen ? (
          <aside className="absolute top-4 right-6 bottom-6 w-[420px] z-30 flex flex-col rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl overflow-hidden transition-all duration-300">
            {/* Drawer Header */}
            <div className="p-5 pb-4 bg-surface-container-low border-b border-surface-container-highest/60 flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-label-sm font-bold tracking-wide uppercase flex items-center gap-1 ${
                      currentWard.status === 'PERSISTENT'
                        ? 'bg-error/20 border-error/40 text-error'
                        : 'bg-primary-container/20 border-primary-container/40 text-primary'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        currentWard.status === 'PERSISTENT' ? 'bg-error' : 'bg-primary-container'
                      }`}
                    />
                    {currentWard.status} HOTSPOT
                  </span>
                  <span className="font-code-sm text-code-sm text-outline px-1.5 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
                    {currentWard.secCode}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                  {currentWard.name}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">location_on</span>
                  {currentWard.zone}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Dismiss details"
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors border border-surface-container-highest/60"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* Highlight Metric Tile */}
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-highest/60 flex flex-col gap-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Urban Heat Delta (LST)
                  </span>
                  <span className="flex items-center gap-1 font-code-sm text-code-sm text-primary font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>{' '}
                    {currentWard.trend}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                    {currentWard.anomaly}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                    above GCC 10y baseline
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Projected to compound to{' '}
                  <span className="text-error font-semibold">{currentWard.forecast2027}</span> by Q3 2026
                  without immediate cool pavement reflectance or micro-canopy interventions.
                </p>
              </div>

              {/* Segmented Tabs: Overview, Why It Matters, Street Interventions, Historical */}
              <div className="flex p-1 rounded-xl bg-surface-container-low border border-surface-container-highest/60 text-label-sm font-label-sm">
                {(['overview', 'whymatters', 'interventions', 'historical'] as WardTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center capitalize ${
                      activeTab === tab
                        ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                  >
                    {tab === 'whymatters'
                      ? 'Why Hot'
                      : tab === 'interventions'
                      ? 'Interventions'
                      : tab}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <>
                  {/* Trajectory Forecast Curve */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          timeline
                        </span>
                        Thermal Projection (2022-2027)
                      </span>
                      <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-primary font-semibold border border-surface-container-highest/60">
                        94% Confidence
                      </span>
                    </div>
                    {/* SVG Sparkline Fan */}
                    <div className="relative w-full h-24 pt-2">
                      <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 320 80">
                        <line stroke="#273647" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="20" y2="20" />
                        <line stroke="#273647" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="50" y2="50" />
                        <polygon fill="#f38020" fillOpacity="0.16" points="180,45 310,12 310,38 180,45" />
                        <path d="M10,65 Q50,60 90,52 T180,45" fill="none" stroke="#00d4ff" strokeLinecap="round" strokeWidth="2.5" />
                        <path d="M180,45 Q240,32 310,24" fill="none" stroke="#f38020" strokeDasharray="4 3" strokeLinecap="round" strokeWidth="2.5" />
                        <circle cx="180" cy="45" fill="#f38020" r="4.5" />
                        <circle cx="310" cy="24" fill="#ff3b30" r="4" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between font-code-sm text-code-sm text-outline pt-1">
                      <span>2022 (Actual)</span>
                      <span className="text-on-surface font-semibold">Now ({currentWard.anomaly})</span>
                      <span className="text-error font-bold">2027 ({currentWard.forecast2027})</span>
                    </div>
                  </div>

                  {/* Ward Vulnerability Matrix Bento Grid */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                        Ward Vulnerability Matrix
                      </span>
                      <span className="text-[11px] font-code-sm text-secondary">
                        Zone IX High Exposure
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Box 1: Population */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">groups</span>
                          <span className="font-label-sm text-label-sm font-medium">Population</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.population}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Density: {currentWard.density}
                        </span>
                      </div>

                      {/* Box 2: Sensitive Hubs */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-tertiary">
                          <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                          <span className="font-label-sm text-label-sm font-medium">Sensitive Hubs</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.sensitiveHubs}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {currentWard.sensitiveDetails}
                        </span>
                      </div>

                      {/* Box 3: Impervious Cover */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-[18px]">domain</span>
                          <span className="font-label-sm text-label-sm font-medium">Impervious Cover</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.impervious}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          High thermal mass asphalt
                        </span>
                      </div>

                      {/* Box 4: Canopy Index */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-error">
                          <span className="material-symbols-outlined text-[18px]">park</span>
                          <span className="font-label-sm text-label-sm font-medium">Canopy Index</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.canopy}
                        </span>
                        <span className="font-body-sm text-body-sm text-error font-medium">
                          Severe Deficit (&lt;15%)
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Why Hot (TreeSHAP Decomposition) */}
              {activeTab === 'whymatters' && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                      TreeSHAP Biophysical Contributors
                    </span>
                    <span className="font-code-sm text-code-sm text-outline">XGBoost Surrogate</span>
                  </div>
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                        <span>Low Albedo Asphalt Pavement</span>
                        <span className="font-code-sm text-error font-bold">+1.24°C</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-error h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                        <span>Tree Canopy Deficit (&lt;5%)</span>
                        <span className="font-code-sm text-primary font-bold">+0.88°C</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                        <span>High Building Density &amp; AC Heat</span>
                        <span className="font-code-sm text-secondary font-bold">+0.68°C</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Street Interventions */}
              {activeTab === 'interventions' && (
                <div className="flex flex-col gap-2.5">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Tamil Nadu PWD Targeted Solutions
                  </span>
                  <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">forest</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-on-surface font-semibold">Miyawaki Urban Pocket Forest</span>
                        <span className="font-body-sm text-on-surface-variant text-[12px]">PWD-HORT-8104 • 400 saplings</span>
                      </div>
                    </div>
                    <span className="font-code-sm text-tertiary font-bold">-1.1°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">roofing</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-on-surface font-semibold">Cool Roof Polyurethane Membrane</span>
                        <span className="font-body-sm text-on-surface-variant text-[12px]">PWD-CIV-4412 • 4,500 m²</span>
                      </div>
                    </div>
                    <span className="font-code-sm text-primary font-bold">-0.8°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-on-surface font-semibold">High-Albedo Permeable Pavers</span>
                        <span className="font-body-sm text-on-surface-variant text-[12px]">PWD-CIV-2915 • 1,200 m²</span>
                      </div>
                    </div>
                    <span className="font-code-sm text-secondary font-bold">-0.5°C</span>
                  </div>
                </div>
              )}

              {/* Tab 4: Historical */}
              {activeTab === 'historical' && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-2.5">
                  <span className="font-label-sm text-on-surface font-semibold">36-Month Satellite Telemetry</span>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>Sen&apos;s Slope Trend</span>
                    <span className="font-code-sm text-error font-bold">+0.038°C / month</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>PELT Change-Point Shift</span>
                    <span className="font-code-sm text-on-surface">March 2024 (Regime Shift)</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>Recurrence Rate</span>
                    <span className="font-code-sm text-primary font-semibold">88.4% of summer passes</span>
                  </div>
                </div>
              )}

              {/* Live Telemetry Station Status */}
              <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center border border-tertiary/20">
                    <span className="material-symbols-outlined text-[18px]">sensors</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Telemetry Node TN-104 (Anna Salai)
                    </span>
                    <span className="font-code-sm text-code-sm text-outline">
                      Updated 40s ago • 38.6°C Ambient • 68% RH
                    </span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
              </div>
            </div>

            {/* Action Bar at Drawer Foot */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/60 flex flex-col gap-2.5">
              <Link
                href={`/simulator?ward=${selectedWardKey}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-bold tracking-wide transition-all shadow-[0_4px_16px_rgba(243,128,32,0.35)]"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>⚡ Simulate Cooling Solutions for this Ward</span>
              </Link>
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={handleFetchTender}
                  className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-[15px]">description</span>
                  <span>TN PWD Tender BOQ</span>
                </button>
                <span className="font-code-sm text-code-sm text-outline">
                  Cell Res: 100m² • {currentWard.secCode.split('•')[1]?.trim() || 'CHE_1042'}
                </span>
              </div>
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute top-4 right-6 z-30 p-3 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 text-on-surface hover:text-primary shadow-2xl transition-all"
            title="Open Ward Insights"
          >
            <span className="material-symbols-outlined text-[20px]">dock_to_left</span>
          </button>
        )}
      </main>

      {/* Official Tamil Nadu PWD Contractor Tender BOQ Modal */}
      {tenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-surface-container-lowest border border-surface-container-highest/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-surface-container-low border-b border-surface-container-highest/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary-container/40 font-code-sm text-[11px] font-bold">
                    TAMIL NADU PWD SCHEDULE OF RATES (SSR 2024-25)
                  </span>
                  <span className="text-outline text-code-sm font-code-sm">
                    {tenderManifest?.council_resolution_ref || 'GCC-RES-2024/CW-UHI'}
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                  Contractor Bill of Quantities (BOQ) &amp; Tender Manifest
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Greater Chennai Corporation • Special Projects &amp; Microclimate Action Directorate
                </p>
              </div>
              <button
                onClick={() => setTenderModalOpen(false)}
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {tenderLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Formulating Tamil Nadu PWD Rate Specifications...
                  </span>
                </div>
              ) : tenderManifest ? (
                <>
                  {/* Summary Header Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Target Zone</span>
                      <div className="font-bold text-on-surface text-label-md mt-0.5">
                        {tenderManifest.target_zone}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Cells Covered</span>
                      <div className="font-bold text-primary text-label-md mt-0.5">
                        {tenderManifest.total_cells_covered} Spatial Grids
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Population Benefited</span>
                      <div className="font-bold text-tertiary text-label-md mt-0.5">
                        {tenderManifest.population_benefited.toLocaleString()} Residents
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Expected Cooling</span>
                      <div className="font-bold text-secondary text-label-md mt-0.5">
                        -{tenderManifest.estimated_cooling_celsius}°C Anomaly
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="rounded-xl border border-surface-container-highest/60 overflow-hidden bg-surface-container-low">
                    <table className="w-full text-left font-body-sm text-[13px]">
                      <thead className="bg-surface-container text-on-surface-variant uppercase font-code-sm text-[11px] border-b border-surface-container-highest/60">
                        <tr>
                          <th className="p-3">SSR Item Code</th>
                          <th className="p-3">Description of Work</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Rate (₹)</th>
                          <th className="p-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-highest/40 text-on-surface">
                        {tenderManifest.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-container/50 transition-colors">
                            <td className="p-3 font-code-sm text-primary font-medium whitespace-nowrap">
                              {item.item_code}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-on-surface">{item.category}</div>
                              <div className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                                {item.description}
                              </div>
                              <div className="text-[10px] font-code-sm text-outline mt-1">
                                Spec: {item.tamil_nadu_pwd_spec}
                              </div>
                            </td>
                            <td className="p-3 text-right font-code-sm">
                              {item.quantity.toLocaleString()} {item.unit}
                            </td>
                            <td className="p-3 text-right font-code-sm">₹{item.unit_rate_inr.toLocaleString()}</td>
                            <td className="p-3 text-right font-code-sm font-bold text-on-surface">
                              ₹{item.amount_inr.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cost Calculation Summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-4 rounded-xl bg-surface-container border border-surface-container-highest/60">
                    <div className="text-body-sm text-on-surface-variant">
                      <div className="font-semibold text-on-surface">
                        Signatory: {tenderManifest.signatory_designation}
                      </div>
                      <div className="text-[12px] text-outline mt-0.5">
                        Issuing Authority: {tenderManifest.authority}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-64 text-right">
                      <div className="flex justify-between text-body-sm text-on-surface-variant">
                        <span>Works Subtotal:</span>
                        <span className="font-code-sm text-on-surface">
                          ₹{tenderManifest.subtotal_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-sm text-on-surface-variant">
                        <span>Statutory GST (18%):</span>
                        <span className="font-code-sm text-on-surface">
                          ₹{tenderManifest.statutory_gst_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-sm text-on-surface-variant">
                        <span>Contingency &amp; QA (3%):</span>
                        <span className="font-code-sm text-on-surface">
                          ₹{tenderManifest.contingency_overhead_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-label-md font-bold text-primary border-t border-surface-container-highest/60 pt-1.5 mt-0.5">
                        <span>Grand Total (INR):</span>
                        <span className="font-code-sm text-[16px]">
                          ₹{tenderManifest.grand_total_inr.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/60 flex items-center justify-between">
              <button
                onClick={() => setTenderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium transition-all"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csvContent =
                      'Item Code,Category,Description,Unit,Quantity,Rate,Amount\n' +
                      tenderManifest?.items
                        .map(
                          (i) =>
                            `"${i.item_code}","${i.category}","${i.description}","${i.unit}",${i.quantity},${i.unit_rate_inr},${i.amount_inr}`
                        )
                        .join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GCC_Tender_BOQ_${tenderManifest?.tender_id || '2024'}.csv`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    const jsonBlob = new Blob([JSON.stringify(tenderManifest, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(jsonBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GCC_Council_Resolution_${tenderManifest?.tender_id || '2024'}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(243,128,32,0.3)]"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Download Council Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live IoT Sensor Telemetry Console Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />
    </div>
  );
}
