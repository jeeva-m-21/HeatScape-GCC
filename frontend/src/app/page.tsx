'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';

export default function ModernUrbanCoolingLanding() {
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [sensorModalOpen, setSensorModalOpen] = useState(false);
  const [wardQuery, setWardQuery] = useState('Teynampet, Zone 9');
  const [selectedWardTitle, setSelectedWardTitle] = useState('Ward 118 (Teynampet Core)');
  const [statAnomaly, setStatAnomaly] = useState('+1.4°C');
  const [statZones, setStatZones] = useState('38 Zones');
  const [statBudget, setStatBudget] = useState('₹50L Allocated');
  const [activeLayer, setActiveLayer] = useState<'heat' | 'ndvi'>('heat');
  const [sliderVal, setSliderVal] = useState(45);

  const handleSearch = (val: string) => {
    setWardQuery(val);
    const q = val.toLowerCase();
    if (q.includes('anna')) {
      setSelectedWardTitle('Ward 102 (Anna Nagar West)');
      setStatAnomaly('+0.9°C');
      setStatZones('19 Zones');
      setStatBudget('₹35L Allocated');
    } else if (q.includes('adyar')) {
      setSelectedWardTitle('Ward 174 (Adyar Estuary)');
      setStatAnomaly('+0.6°C');
      setStatZones('14 Zones');
      setStatBudget('₹28L Allocated');
    } else if (q.includes('royapuram')) {
      setSelectedWardTitle('Ward 049 (Royapuram Port)');
      setStatAnomaly('+2.3°C');
      setStatZones('52 Zones');
      setStatBudget('₹75L Allocated');
    } else {
      setSelectedWardTitle(val || 'Ward 118 (Teynampet Core)');
      setStatAnomaly('+1.4°C');
      setStatZones('38 Zones');
      setStatBudget('₹50L Allocated');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Stitch Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/40 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="w-full max-w-7xl mx-auto px-gutter-desktop h-header-height flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0">
              <img
                alt="Brand logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1V_U6qg3PIcJPAwsgB2PIqlGXh7-7AaKQoFO211JBy5xI4_7fm7qpAsuMRizqvQBX3HmPf7x3cB0NfMxbNaM7RvErdjbuAKy61R4fdDNFXy12ulmfJNG5PMdTCRRt0V83mb_6l3ZZvtC6uHfQlOquH6LJUnaRsUcTdcQxK8JHvVrxIHGkabbk0xQWcxXoA32CfuMMmnb1CMPANZnfw2YAQFmx2BOEHhjA3omyCkMTvzbLI-_EFQE2aZpRNI"
              />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                HeatScape
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low border border-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">radar</span>
              <span className="text-on-surface font-medium">Chennai Metropolitan Region</span>
              <span className="text-outline/60">•</span>
              <span className="text-tertiary font-medium">Live Feed</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center p-1 rounded-full bg-surface-container-low border border-surface-container-highest/40">
            <Link
              href="/"
              className="px-space-md py-1 rounded-full font-label-md transition-all bg-surface-container-high text-on-surface shadow-sm"
            >
              Overview
            </Link>
            <Link
              href="/explorer"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
            >
              Trajectories Map
            </Link>
            <Link
              href="/multiview"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
            >
              Multi-View
            </Link>
            <Link
              href="/simulator"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
            >
              Scenario Simulator
            </Link>
            <Link
              href="/monitoring"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
            >
              Impact Monitoring
            </Link>
            <Link
              href="/intelligence"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
            >
              Urban Intelligence
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setSensorModalOpen(true)}
              className="hidden sm:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/15 hover:bg-tertiary-container/30 border border-tertiary/30 hover:border-tertiary text-tertiary font-label-sm text-label-sm transition-all cursor-pointer shadow-sm"
              title="Click to view live 842 IoT sensor telemetry"
            >
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-medium">842 Sensors Active</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Live IoT Sensor Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />

      {/* Main Container */}
      <main className="w-full pt-header-height bg-surface">
        <div className="flex flex-col w-full overflow-hidden">
          {/* Subtle Ambient Backdrops */}
          <div className="relative w-full">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-primary-container/10 via-primary/5 to-transparent blur-[140px] pointer-events-none -z-10"></div>
            <div className="absolute top-80 right-10 w-[420px] h-[280px] bg-secondary-container/5 blur-[120px] pointer-events-none -z-10"></div>

            {/* Hero Section */}
            <div className="w-full max-w-7xl mx-auto px-gutter-desktop pt-space-xl pb-space-2xl">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                {/* Live Coverage Pill Badge */}
                <div className="inline-flex items-center gap-space-xs px-space-base py-1.5 rounded-full bg-surface-container-high text-on-surface shadow-sm hover:bg-surface-bright transition-all cursor-default select-none mb-space-lg">
                  <span className="text-primary-container text-[14px] animate-pulse">✨</span>
                  <span className="font-label-md text-label-md text-on-surface font-medium tracking-tight">
                    Live across Greater Chennai Corporation
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline/50"></span>
                  <span className="font-label-sm text-label-sm text-tertiary font-semibold tracking-wide uppercase">
                    200 Wards Covered
                  </span>
                </div>

                {/* Main Typography Heading */}
                <h1 className="font-headline-xl text-headline-xl sm:text-[54px] sm:leading-[60px] text-on-surface tracking-tight font-bold mb-space-base">
                  Smarter Urban Cooling for{' '}
                  <span className="bg-gradient-to-r from-primary via-primary-container to-surface-tint bg-clip-text text-transparent">
                    Resilient Cities.
                  </span>
                </h1>

                {/* Subheading */}
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl leading-relaxed">
                  Turn satellite thermal data into actionable, budget-optimized interventions across Chennai wards with meter-scale precision.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-space-md mb-space-2xl w-full sm:w-auto">
                  <Link
                    href="/explorer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-3 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-[15px] font-semibold hover:opacity-95 shadow-md shadow-primary-container/20 active:scale-[0.99] transition-all"
                  >
                    <span>Explore Live Map</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                  <button
                    onClick={() => setSimulationModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-3 rounded-full bg-surface-container-high text-on-surface font-headline-sm text-[15px] font-semibold hover:bg-surface-bright shadow-sm active:scale-[0.99] transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-tertiary text-[18px]">play_circle</span>
                    <span>View Sample Simulation</span>
                  </button>
                </div>

                {/* Interactive Ward Search */}
                <div className="w-full max-w-2xl mx-auto mb-space-3xl">
                  <form
                    className="relative flex items-center p-1.5 rounded-full bg-surface-container shadow-xl"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearch(wardQuery);
                    }}
                  >
                    <div className="pl-space-base pr-space-xs text-on-surface-variant flex items-center">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                      className="w-full bg-transparent text-on-surface placeholder:text-outline/70 font-body-md text-body-md focus:outline-none px-space-xs py-2"
                      placeholder="Search ward, locality or PIN code (e.g., Teynampet, Anna Nagar)..."
                      type="text"
                      value={wardQuery}
                      onChange={(e) => setWardQuery(e.target.value)}
                    />
                    <button
                      className="shrink-0 inline-flex items-center gap-space-xs px-space-lg py-2 rounded-full bg-surface-container-highest hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all"
                      type="submit"
                    >
                      <span>Inspect</span>
                      <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
                    </button>
                  </form>
                  <div className="flex items-center justify-center gap-space-md mt-space-sm text-on-surface-variant font-label-sm text-label-sm">
                    <span>Quick inspect:</span>
                    <button
                      className="hover:text-primary transition-colors"
                      onClick={() => handleSearch('Anna Nagar, Zone 8')}
                      type="button"
                    >
                      Anna Nagar
                    </button>
                    <span>•</span>
                    <button
                      className="hover:text-primary transition-colors"
                      onClick={() => handleSearch('Adyar, Zone 13')}
                      type="button"
                    >
                      Adyar
                    </button>
                    <span>•</span>
                    <button
                      className="hover:text-primary transition-colors"
                      onClick={() => handleSearch('Royapuram, Zone 5')}
                      type="button"
                    >
                      Royapuram
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero Graphic: Modern Observability Preview Card */}
              <div
                className="w-full rounded-2xl bg-surface-container p-space-lg shadow-2xl relative overflow-hidden"
                id="interactive-preview"
              >
                {/* Window Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-base pb-space-base mb-space-base bg-surface-container-low/50 -mx-space-lg -mt-space-lg px-space-lg py-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-error/70 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-primary/70 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-tertiary/70 inline-block"></span>
                    </div>
                    <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{selectedWardTitle}</span>
                      <span className="text-outline">/</span>
                      <span>Thermal Sensor Fabric Tier-1</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                      Telemetric Refresh 2m ago
                    </span>
                  </div>
                </div>

                {/* KPI Metrics Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-base mb-space-lg">
                  <div className="p-space-base rounded-xl bg-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-space-xs">
                      <span>Avg. Surface Anomaly</span>
                      <span className="material-symbols-outlined text-[16px] text-primary-container">thermostat</span>
                    </div>
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{statAnomaly}</span>
                      <span className="font-label-sm text-label-sm text-primary font-medium">vs. baseline 33.2°C</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-space-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-tertiary via-primary to-error h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div className="p-space-base rounded-xl bg-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-space-xs">
                      <span>Emerging Vulnerability Pockets</span>
                      <span className="material-symbols-outlined text-[16px] text-tertiary">warning_amber</span>
                    </div>
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{statZones}</span>
                      <span className="font-label-sm text-label-sm text-tertiary font-medium">12 flagged for misting</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-space-sm overflow-hidden">
                      <div className="bg-tertiary h-full rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>

                  <div className="p-space-base rounded-xl bg-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-space-xs">
                      <span>Capital Grant Deployment</span>
                      <span className="material-symbols-outlined text-[16px] text-secondary">account_balance_wallet</span>
                    </div>
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{statBudget}</span>
                      <span className="font-label-sm text-label-sm text-secondary-fixed-dim font-medium">84% ROI Projected</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-space-sm overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Split View: Thermal Raster Canvas & Observability Telemetry */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-stretch">
                  {/* Map & Raster Graphic Box */}
                  <div className="lg:col-span-8 rounded-xl bg-surface-container-lowest relative min-h-[340px] flex flex-col justify-between p-space-base overflow-hidden">
                    <div
                      className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXw-J-P_3I-vbGOepa-o1KqnW8scU__SyNA5FHE4AZZ3raI0GEpeN5_jlBSZXNKR5NMgc6pwnBUlhC2SeHlGHuvIxH2iOgCrbOijT-r_e5-7WUY8nJHErAnSzqKfqL-uADKtUDQQEup0c-72-7PXxXMQKkQaXhsaKq2FN0GHlEMOr8zU6QlZMZPTdp4QL_YUI7hv3cv_QHUXKQK8nsAwFj5u5danKYUSe-1c8Fo66UvWQ_lrbnxv1smg')",
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest via-primary-container/20 to-error/20 opacity-80 pointer-events-none"></div>

                    {/* Top Coordinates HUD */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="px-space-md py-1 rounded-md bg-surface-container/80 backdrop-blur-md font-code-sm text-code-sm text-on-surface flex items-center gap-space-sm">
                        <span className="inline-block w-2 h-2 rounded-full bg-error"></span>
                        <span>LAT 13.0418° N • LON 80.2507° E</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <button
                          onClick={() => setActiveLayer('heat')}
                          className={`px-2.5 py-1 rounded text-label-sm font-medium transition-colors ${
                            activeLayer === 'heat'
                              ? 'bg-surface-container-high/90 text-on-surface shadow-sm'
                              : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                          type="button"
                        >
                          Heat Index
                        </button>
                        <button
                          onClick={() => setActiveLayer('ndvi')}
                          className={`px-2.5 py-1 rounded text-label-sm font-medium transition-colors ${
                            activeLayer === 'ndvi'
                              ? 'bg-surface-container-high/90 text-on-surface shadow-sm'
                              : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                          type="button"
                        >
                          NDVI Canopy
                        </button>
                      </div>
                    </div>

                    {/* Stylized SVG Heat Vector Overlay */}
                    <div className="relative z-10 my-auto flex items-center justify-center">
                      <svg
                        className="w-full max-w-lg h-44 drop-shadow-[0_0_24px_rgba(243,128,32,0.35)]"
                        fill="none"
                        viewBox="0 0 400 160"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          className="text-tertiary/40"
                          d="M20 130C80 140 110 90 180 85C250 80 290 120 380 90"
                          stroke="currentColor"
                          strokeDasharray="4 4"
                          strokeWidth="2"
                        ></path>
                        <path
                          className="text-primary/60"
                          d="M30 110C90 120 130 65 200 60C270 55 310 95 370 70"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        ></path>
                        <path
                          className="text-error"
                          d="M50 80C110 85 150 40 220 35C290 30 320 60 360 45"
                          stroke="currentColor"
                          strokeWidth="3"
                        ></path>
                        <circle
                          className="fill-error/20 stroke-error animate-pulse"
                          cx="220"
                          cy="35"
                          r="8"
                          strokeWidth="2"
                        ></circle>
                        <circle className="fill-error" cx="220" cy="35" r="3"></circle>
                        <text
                          className="text-on-surface text-[10px] font-code-sm font-semibold"
                          fill="currentColor"
                          x="235"
                          y="38"
                        >
                          HOTSPOT +2.8°C (Built density 89%)
                        </text>
                      </svg>
                    </div>

                    {/* Bottom Legend */}
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-container/85 backdrop-blur-md px-space-base py-2 rounded-lg">
                      <div className="flex items-center gap-space-sm w-full sm:w-64">
                        <span className="font-code-sm text-code-sm text-on-surface-variant">28°C</span>
                        <div className="h-2 w-full rounded-full bg-gradient-to-r from-tertiary via-primary to-error"></div>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">44°C</span>
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">
                        Satellite: Sentinel-2 &amp; ECOSTRESS LST
                      </div>
                    </div>
                  </div>

                  {/* Micro-Diagnostic Insights Panel */}
                  <div className="lg:col-span-4 rounded-xl bg-surface-container-low p-space-base flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm mb-space-base">
                        <span className="font-headline-sm text-[16px] text-on-surface font-semibold">
                          Priority Interventions
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-code-sm text-code-sm font-medium">
                          Ranked #1
                        </span>
                      </div>

                      <div className="space-y-space-sm">
                        {/* Action 1 */}
                        <div className="p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-space-sm">
                          <div className="p-1.5 rounded-md bg-tertiary/10 text-tertiary shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[18px]">nature</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                Pocket Urban Miyawaki
                              </span>
                              <span className="font-code-sm text-code-sm text-tertiary">-1.1°C</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              3 unshaded transit loops identified
                            </p>
                          </div>
                        </div>

                        {/* Action 2 */}
                        <div className="p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-space-sm">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[18px]">roofing</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                High-Albedo Cool Roofs
                              </span>
                              <span className="font-code-sm text-code-sm text-primary">-0.8°C</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              44 residential terrace blocks ready
                            </p>
                          </div>
                        </div>

                        {/* Action 3 */}
                        <div className="p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-space-sm">
                          <div className="p-1.5 rounded-md bg-secondary/10 text-secondary shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[18px]">water_drop</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                Permeable Pavers
                              </span>
                              <span className="font-code-sm text-code-sm text-secondary-fixed-dim">-0.4°C</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              Bus route arterial sidewalk rehab
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mini Simulation CTA */}
                    <div className="pt-space-base mt-space-base">
                      <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant mb-2">
                        <span>Model Confidence</span>
                        <span className="font-code-sm text-code-sm text-tertiary">96.8%</span>
                      </div>
                      <Link
                        href="/simulator"
                        className="w-full py-2.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold text-center transition-all flex items-center justify-center gap-space-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">tune</span>
                        <span>Adjust Ward Parameters</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Impact Metrics Bar */}
          <div className="w-full bg-surface-container-low py-space-xl my-space-lg">
            <div className="w-full max-w-7xl mx-auto px-gutter-desktop">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-base">
                <div className="flex flex-col items-center sm:items-start p-space-base rounded-2xl bg-surface-container shadow-sm hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-space-xs text-primary font-headline-md text-headline-md sm:text-[28px] font-bold">
                    <span>42,600</span>
                    <span className="text-[18px] text-on-surface-variant">km²</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant mt-1">Area Monitored</span>
                  <span className="font-body-sm text-body-sm text-outline/80 mt-0.5">Continuous multispectral radar</span>
                </div>

                <div className="flex flex-col items-center sm:items-start p-space-base rounded-2xl bg-surface-container shadow-sm hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-space-xs text-secondary-fixed-dim font-headline-md text-headline-md sm:text-[28px] font-bold">
                    <span>100m</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant mt-1">Precision Grids</span>
                  <span className="font-body-sm text-body-sm text-outline/80 mt-0.5">Street-level heat resolution</span>
                </div>

                <div className="flex flex-col items-center sm:items-start p-space-base rounded-2xl bg-surface-container shadow-sm hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-space-xs text-tertiary font-headline-md text-headline-md sm:text-[28px] font-bold">
                    <span>3.4k+</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant mt-1">Residents Protected</span>
                  <span className="font-body-sm text-body-sm text-outline/80 mt-0.5">Through proactive ward cool-zones</span>
                </div>

                <div className="flex flex-col items-center sm:items-start p-space-base rounded-2xl bg-surface-container shadow-sm hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-space-xs text-primary-container font-headline-md text-headline-md sm:text-[28px] font-bold">
                    <span>94%</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant mt-1">Prediction Accuracy</span>
                  <span className="font-body-sm text-body-sm text-outline/80 mt-0.5">Validated against ground sensors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Features: 3 Bento Cards */}
          <div className="w-full max-w-7xl mx-auto px-gutter-desktop py-space-3xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
              <div>
                <div className="font-label-sm text-label-sm text-primary font-semibold tracking-wider uppercase mb-space-xs">
                  ENGINEERED FOR CIVIC ACTION
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Comprehensive Heat Mitigation Stack
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Designed for municipal decision makers, sustainability fellows, and urban planners needing zero-jargon diagnostics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {/* Card 1 */}
              <div className="group flex flex-col justify-between p-space-xl rounded-2xl bg-surface-container shadow-lg hover:bg-surface-container-high transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary-container mb-space-lg group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">radar</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-sm">
                    Early Heat Detection
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
                    Identify rising microclimatic risks months before they manifest into severe urban heat islands, using predictive land surface thermal modeling.
                  </p>
                </div>
                <div className="pt-space-base bg-surface-container-lowest/60 rounded-xl p-space-md">
                  <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant mb-space-xs">
                    <span>Thermal Velocity Trend</span>
                    <span className="text-error font-code-sm">+0.32°C/yr</span>
                  </div>
                  <svg className="w-full h-12 text-primary-container" fill="none" stroke="currentColor" viewBox="0 0 200 40">
                    <path d="M0 32 Q 40 28, 70 30 T 130 18 T 170 12 T 200 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                    <circle className="fill-primary-container animate-pulse" cx="200" cy="4" r="3"></circle>
                  </svg>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group flex flex-col justify-between p-space-xl rounded-2xl bg-surface-container shadow-lg hover:bg-surface-container-high transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-tertiary/15 flex items-center justify-center text-tertiary mb-space-lg group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">view_in_ar</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-sm">
                    Clear Root-Cause Insights
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
                    Understand exact drivers—vegetation loss, heat-trapping concrete, or high building density—without struggling through complex GIS shapefiles.
                  </p>
                </div>
                <div className="pt-space-base bg-surface-container-lowest/60 rounded-xl p-space-md space-y-space-xs">
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                      <span>Canopy Deficit</span>
                      <span className="font-code-sm text-on-surface">54%</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-tertiary h-full rounded-full" style={{ width: '54%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                      <span>Impervious Asphalt</span>
                      <span className="font-code-sm text-on-surface">78%</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group flex flex-col justify-between p-space-xl rounded-2xl bg-surface-container shadow-lg hover:bg-surface-container-high transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary mb-space-lg group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">calculate</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-sm">
                    Budget-Optimized Planning
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
                    Allocate cool roofs, shade structures, and permeable surfaces with mathematical precision to achieve the highest cooling impact per rupee spent.
                  </p>
                </div>
                <div className="pt-space-base bg-surface-container-lowest/60 rounded-xl p-space-md">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Efficiency Quotient</span>
                    <span className="font-code-sm text-code-sm text-secondary font-bold">₹1.2L / 0.1°C Drop</span>
                  </div>
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    <span>Optimized against Ward CAPEX limit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Adoption Banner */}
          <div className="w-full max-w-7xl mx-auto px-gutter-desktop pb-space-3xl">
            <div className="rounded-2xl bg-surface-container p-space-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                <div className="max-w-xl">
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                    Ready for Administrative Rollout
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-space-sm mb-space-sm">
                    Designed for Tamil Nadu Climate Missions &amp; Smart Cities
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Export council-ready policy briefs, automated GeoJSON coordinates for contractor tendering, and real-time public telemetry displays.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-space-base">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-[12px] font-bold text-on-surface ring-2 ring-surface">
                      GCC
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-[12px] font-bold text-on-surface ring-2 ring-surface">
                      CMDA
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-[12px] font-bold text-on-surface ring-2 ring-surface">
                      TNSCCC
                    </div>
                  </div>
                  <div className="h-8 w-px bg-surface-container-highest"></div>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:opacity-95 transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    <span>Launch Scenario Planner</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simulation Modal */}
      {simulationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-gutter-mobile">
          <div className="w-full max-w-lg rounded-2xl bg-surface-container p-space-xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-space-base mb-space-base">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[24px]">model_training</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Ward 118 Simulation Engine
                </h4>
              </div>
              <button
                className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                onClick={() => setSimulationModalOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-space-md mb-space-xl">
              <div>
                <div className="flex justify-between font-label-md text-label-md text-on-surface mb-1">
                  <span>Cool Roof Retrofit Intensity</span>
                  <span className="font-code-sm text-primary">{sliderVal}%</span>
                </div>
                <input
                  className="w-full accent-primary-container cursor-pointer"
                  max="90"
                  min="10"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  type="range"
                />
              </div>
              <div className="p-space-base rounded-xl bg-surface-container-low text-on-surface">
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase">
                  Estimated Surface Relief
                </div>
                <div className="font-headline-lg text-headline-lg font-bold text-tertiary mt-1">
                  -{(sliderVal * 0.036).toFixed(2)}°C
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Reduces ambient wet-bulb peak events by 3.2 days during May heatwaves.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-space-sm">
              <button
                className="px-space-lg py-2 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-bright"
                onClick={() => setSimulationModalOpen(false)}
                type="button"
              >
                Close
              </button>
              <Link
                href="/simulator"
                className="px-space-lg py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold"
              >
                Full Scenario Planner
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stitch Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-highest/40 py-space-xl">
        <div className="w-full max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-on-surface font-bold text-[15px]">HeatScape</span>
            <span>© 2025 Greater Chennai Corporation &amp; Climate Telemetry Lab.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <Link className="hover:text-on-surface transition-colors" href="/explorer">
              Live Map
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/simulator">
              MILP Optimizer
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/monitoring">
              Impact Telemetry
            </Link>
            <a className="hover:text-on-surface transition-colors" href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
              API Reference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
