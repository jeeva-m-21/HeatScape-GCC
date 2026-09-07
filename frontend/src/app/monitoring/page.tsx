'use client';

import React from 'react';
import Link from 'next/link';

export default function PostInterventionImpactMonitoringPage() {
  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Stitch Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-highest/40">
        <div className="flex flex-col">
          <Link href="/" className="h-header-height flex items-center px-space-md gap-space-sm bg-surface-container-lowest/50">
            <img
              alt="Brand logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1V_U6qg3PIcJPAwsgB2PIqlGXh7-7AaKQoFO211JBy5xI4_7fm7qpAsuMRizqvQBX3HmPf7x3cB0NfMxbNaM7RvErdjbuAKy61R4fdDNFXy12ulmfJNG5PMdTCRRt0V83mb_6l3ZZvtC6uHfQlOquH6LJUnaRsUcTdcQxK8JHvVrxIHGkabbk0xQWcxXoA32CfuMMmnb1CMPANZnfw2YAQFmx2BOEHhjA3omyCkMTvzbLI-_EFQE2aZpRNI"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">
                HeatScape
              </span>
              <span className="font-label-sm text-label-sm text-primary tracking-wide uppercase">
                Chennai Grid
              </span>
            </div>
          </Link>
          <div className="px-space-md py-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline px-space-sm">
              Intelligence Matrix
            </span>
          </div>
          <nav className="flex flex-col gap-space-2xs px-space-sm">
            <Link
              href="/explorer"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              <span className="font-body-md text-body-md">Trajectories Map</span>
            </Link>
            <Link
              href="/multiview"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">layers</span>
              <span className="font-body-md text-body-md">Multi-View Map</span>
            </Link>
            <Link
              href="/simulator"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
              <span className="font-body-md text-body-md">Intervention Simulator</span>
            </Link>
            <Link
              href="/monitoring"
              className="flex items-center gap-space-md px-space-md py-space-sm transition-colors bg-primary-container text-on-primary font-medium rounded-lg shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
              <span className="font-body-md text-body-md">Impact Monitoring</span>
            </Link>
            <Link
              href="/intelligence"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span className="font-body-md text-body-md">Urban Intelligence</span>
            </Link>
          </nav>
        </div>

        <div className="p-space-md flex flex-col gap-space-md">
          <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-space-2xs text-error font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                <span className="material-symbols-outlined text-[15px]">warning</span>Thermal Peak
              </span>
              <span className="bg-error-container text-on-error-container font-code-sm text-code-sm px-space-xs py-space-2xs rounded">
                ALERT
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-space-2xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">T. Nagar Sub-Ward 114</span>
              <span className="font-headline-sm text-headline-sm text-error font-bold">41.8°C</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-2xs">
              <div className="bg-error h-full w-[88%]"></div>
            </div>
          </div>
          <nav className="flex flex-col">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">api</span>
              <span className="font-body-md text-body-md">API Reference</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Container with Sidebar Offset */}
      <div className="pl-sidebar-width">
        {/* Fixed Top Subheader */}
        <header className="fixed top-0 left-sidebar-width right-0 h-header-height bg-surface/80 backdrop-blur-xl z-40 border-b border-surface-container-highest/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-header-height w-full px-space-lg flex items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-md shrink-0">
              <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-full shadow-inner">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Chennai Metropolitan Region • <span className="text-tertiary font-medium">Live Telemetry</span>
                </span>
              </div>
            </div>
            <div className="flex-1 max-w-xl">
              <div className="relative flex items-center w-full">
                <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  className="w-full h-9 bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-9 pr-14 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  placeholder="Search wards, streets, sensor nodes..."
                  type="text"
                />
                <span className="absolute right-space-sm px-space-xs py-space-2xs bg-surface-container-high text-outline rounded font-code-sm text-code-sm tracking-wider">
                  ⌘K
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md shrink-0">
              <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">842 Sensors • Healthy</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="w-full pt-header-height bg-surface min-h-screen px-gutter-desktop">
          <div className="flex flex-col w-full pb-space-3xl gap-space-xl">
            {/* Content Header & Action Ribbon */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg pt-space-md">
              <div className="flex flex-col gap-space-xs">
                {/* Breadcrumb Hierarchy */}
                <nav className="flex items-center gap-space-xs text-outline font-label-md text-label-md">
                  <span className="hover:text-on-surface transition-colors cursor-pointer">GCC Climate Operations</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="hover:text-on-surface transition-colors cursor-pointer">Post-Intervention Monitoring</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-medium">Ward 114 Teynampet</span>
                </nav>
                <div className="flex flex-col mt-space-2xs">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold flex items-center gap-space-sm">
                    Post-Intervention Impact &amp; Counterfactual Validation
                    <span className="bg-tertiary/10 text-tertiary px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm uppercase font-semibold tracking-wider flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Validated Field Data
                    </span>
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-space-2xs">
                    Empirical satellite thermal telemetry vs counterfactual ML models for executed Greater Chennai Corporation (GCC) urban cooling works.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-space-sm">
                <div className="flex items-center bg-surface-container px-space-md py-space-xs rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-outline text-[18px] mr-space-xs">calendar_today</span>
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    Last 18 Months (Post-Deployment)
                  </span>
                  <span className="material-symbols-outlined text-outline text-[16px] ml-space-xs">expand_more</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-space-xs bg-primary-container hover:brightness-110 active:brightness-95 text-on-primary-container font-semibold px-space-md py-space-xs rounded-xl font-label-md text-label-md transition-all shadow-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  Download Impact Brief
                </button>
              </div>
            </div>

            {/* Top KPI Summary Cards (4 Bento Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {/* Card 1 */}
              <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-md relative overflow-hidden group hover:bg-surface-container-high transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      Net Realized Cooling
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                      Target was -1.4°C LST
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[20px]">ac_unit</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-space-sm mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-tertiary tracking-tight">-1.8°C</span>
                  <span className="bg-tertiary/15 text-tertiary font-label-sm text-label-sm px-space-xs py-space-2xs rounded-lg font-semibold flex items-center">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span> +0.4°C Over Target
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-sm">
                  <div className="bg-tertiary h-full w-[100%] max-w-full"></div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-md relative overflow-hidden group hover:bg-surface-container-high transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      Intervention Lifespan
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                      Commissioned: March 2024
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">timelapse</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-space-sm mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">14 Mo</span>
                  <span className="font-body-sm text-body-sm text-secondary font-medium">Active &amp; Sustaining</span>
                </div>
                <div className="flex items-center gap-space-xs mt-space-sm text-outline font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>High-Albedo Roofs + Miyawaki Grid</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-md relative overflow-hidden group hover:bg-surface-container-high transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      Model Error Rate (MAPE)
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                      Landsat 9 &amp; Sentinel-2 Cross-val
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-space-sm mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">4.2%</span>
                  <span className="bg-primary/15 text-primary font-label-sm text-label-sm px-space-xs py-space-2xs rounded-lg font-semibold">
                    Grade A
                  </span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm mt-space-sm">
                  <span>High Predictive Reliability</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">R² = 0.941</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-md relative overflow-hidden group hover:bg-surface-container-high transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      Avoided Heat Illnesses
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                      Ward 114 Community Clinics
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary-fixed">
                    <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-space-sm mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-tertiary tracking-tight">142 Cases</span>
                  <span className="text-tertiary font-label-sm text-label-sm font-semibold flex items-center">
                    -22.4% vs 2023
                  </span>
                </div>
                <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm mt-space-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  <span>Epidemiological Baseline Shift</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Comparison Workspace (7 / 5 Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column (7 cols): Dual-Track Chart & Thermal Ortho Comparison */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                {/* Dual-Track Chart Card */}
                <div className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                        Counterfactual vs Realized Surface Temperature (LST)
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                        Ward 114 monthly peak thermal signatures: Empirical Observations vs No-Intervention Baseline
                      </p>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-outline border-b border-dotted border-outline"></span>
                        <span className="font-label-sm text-label-sm text-outline">Counterfactual</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-primary border-b border-dashed border-primary"></span>
                        <span className="font-label-sm text-label-sm text-primary">Model Target</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-tertiary rounded-full"></span>
                        <span className="font-label-sm text-label-sm text-tertiary font-medium">Observed LST</span>
                      </div>
                    </div>
                  </div>

                  {/* High-Precision SVG Graph */}
                  <div className="relative w-full bg-surface-container-low rounded-xl p-space-md pt-space-xl overflow-hidden">
                    <svg className="w-full h-64 overflow-visible" preserveAspectRatio="none" viewBox="0 0 760 300">
                      <defs>
                        <linearGradient id="observedGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(78, 222, 163, 0.28)"></stop>
                          <stop offset="100%" stopColor="rgba(78, 222, 163, 0.0)"></stop>
                        </linearGradient>
                      </defs>
                      <line stroke="rgba(86, 67, 54, 0.25)" strokeDasharray="4 4" x1="40" x2="740" y1="40" y2="40"></line>
                      <text fill="#a58c7d" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="32" y="44">44°C</text>
                      <line stroke="rgba(86, 67, 54, 0.25)" strokeDasharray="4 4" x1="40" x2="740" y1="100" y2="100"></line>
                      <text fill="#a58c7d" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="32" y="104">42°C</text>
                      <line stroke="rgba(86, 67, 54, 0.25)" strokeDasharray="4 4" x1="40" x2="740" y1="160" y2="160"></line>
                      <text fill="#a58c7d" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="32" y="164">40°C</text>
                      <line stroke="rgba(86, 67, 54, 0.25)" strokeDasharray="4 4" x1="40" x2="740" y1="220" y2="220"></line>
                      <text fill="#a58c7d" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="32" y="224">38°C</text>

                      {/* Deployment Milestone Line */}
                      <line stroke="#f38020" strokeDasharray="3 3" strokeWidth="1.5" x1="440" x2="440" y1="20" y2="250"></line>

                      {/* Shaded Delta Area */}
                      <polygon fill="url(#observedGrad)" points="440,118 490,95 550,65 610,75 670,55 730,50 730,152 670,150 610,140 550,135 490,128 440,118"></polygon>

                      {/* Track 1: Counterfactual */}
                      <path d="M 50 180 Q 110 160 170 125 T 290 110 T 400 130 T 440 118 T 490 95 T 550 65 T 610 75 T 670 55 T 730 50" fill="none" stroke="#a58c7d" strokeDasharray="5 5" strokeWidth="2"></path>

                      {/* Track 2: Model Target */}
                      <path d="M 50 180 Q 110 160 170 125 T 290 110 T 400 130 T 440 118 T 490 110 T 550 98 T 610 102 T 670 92 T 730 88" fill="none" stroke="#f38020" strokeDasharray="4 4" strokeWidth="2"></path>

                      {/* Track 3: Empirical Observation */}
                      <path d="M 50 180 Q 110 160 170 125 T 290 110 T 400 130 T 440 118 T 490 128 T 550 135 T 610 140 T 670 150 T 730 152" fill="none" stroke="#4edea3" strokeLinecap="round" strokeWidth="3"></path>

                      <circle cx="440" cy="118" fill="#000000" r="4" stroke="#f38020" strokeWidth="2"></circle>
                      <circle cx="550" cy="135" fill="#000000" r="4" stroke="#4edea3" strokeWidth="2"></circle>
                      <circle cx="670" cy="150" fill="#000000" r="4" stroke="#4edea3" strokeWidth="2"></circle>
                      <circle cx="730" cy="152" fill="#4edea3" r="5" stroke="#000000" strokeWidth="2"></circle>

                      <text fill="#a58c7d" fontFamily="Inter" fontSize="10" textAnchor="middle" x="50" y="270">Jan 23</text>
                      <text fill="#a58c7d" fontFamily="Inter" fontSize="10" textAnchor="middle" x="170" y="270">May 23 (Peak)</text>
                      <text fill="#a58c7d" fontFamily="Inter" fontSize="10" textAnchor="middle" x="290" y="270">Sep 23</text>
                      <text fill="#a58c7d" fontFamily="Inter" fontSize="10" textAnchor="middle" x="400" y="270">Jan 24</text>
                      <text fill="#f38020" fontFamily="Inter" fontSize="10" fontWeight="600" textAnchor="middle" x="440" y="270">Mar 24</text>
                      <text fill="#a58c7d" fontFamily="Inter" fontSize="10" textAnchor="middle" x="550" y="270">May 24</text>
                      <text fill="#a58c7d" fontFamily="Inter" fontSize="10" textAnchor="middle" x="670" y="270">Sep 24</text>
                      <text fill="#4edea3" fontFamily="Inter" fontSize="10" fontWeight="600" textAnchor="middle" x="730" y="270">May 25</text>
                    </svg>

                    <div className="absolute top-4 left-[56%] -translate-x-1/2 bg-surface-container-high px-space-sm py-space-2xs rounded-lg shadow-lg flex items-center gap-space-xs pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                      <span className="font-label-sm text-label-sm text-primary font-semibold">Works Commissioned (Mar 2024)</span>
                    </div>

                    <div className="absolute bottom-16 right-4 bg-surface-container-highest/90 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-lg flex flex-col items-end">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Observed Peak Delta</span>
                      <span className="font-headline-sm text-headline-sm text-tertiary font-bold">
                        40.3°C <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">vs 43.5°C CF</span>
                      </span>
                      <span className="font-code-sm text-code-sm text-tertiary font-medium">Δ -3.2°C Absolute Cooling</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm pt-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      <span>Counterfactual generated via LightGBM ensemble trained on 2018–2023 pre-intervention weather arrays.</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">Confidence: p &lt; 0.001</span>
                  </div>
                </div>

                {/* Thermal Satellite Ortho Comparison */}
                <div className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                        Thermal Satellite Ortho Comparison
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                        Pre vs Post Intervention radiometry (Teynampet High Albedo &amp; Usman Rd Micro-Forest)
                      </p>
                    </div>
                    <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-2xs rounded-lg text-outline font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">layers</span>
                      <span>Landsat-9 Thermal Infrared Sensor (TIRS)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Panel 1 */}
                    <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between px-space-xs py-space-2xs">
                        <span className="font-label-md text-label-md text-error font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-error"></span> May 2023 • Pre-Intervention
                        </span>
                        <span className="font-code-sm text-code-sm bg-error-container text-on-error-container px-space-xs rounded font-bold">
                          42.8°C Peak
                        </span>
                      </div>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-container-lowest">
                        <img
                          alt="Thermal pre-intervention"
                          className="w-full h-full object-cover filter saturate-150 contrast-125 opacity-80"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQDLXDbRSUBv0EV8KX8q9fivgI5nqRbuCzXOwOEISoppaolw6U_FYjs7c-6zTC7zpzEKAYbPcPizBusouK6hzTUPq6OJI3875isjUEAzKEPUebtENxtyJHe7y9zFg_uVPoHYSWS8FkN3QevYcWj7HaReHBOGjkjqZ4W6R4M1EPtXgGKJNBi8XjtN281zDgbcBU_Qm3g6AGEOHZigrl6CZ8rPfn7rKo6qzhXfQhhIOwdeM1S4a1GKauUQ"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent"></div>
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="w-12 h-12 rounded-full bg-error/30 animate-ping absolute"></span>
                          <span className="w-6 h-6 rounded-full bg-error flex items-center justify-center text-on-error text-[10px] font-bold shadow-md">43°</span>
                          <span className="font-code-sm text-code-sm text-on-surface bg-surface-container-lowest/80 px-space-xs py-space-2xs rounded mt-1 shadow-sm">Hotspot Core</span>
                        </div>
                        <div className="absolute bottom-2 left-2 text-outline font-label-sm text-label-sm">
                          Albedo SRI: 28 | Tree Canopy: 4.1%
                        </div>
                      </div>
                    </div>

                    {/* Panel 2 */}
                    <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between px-space-xs py-space-2xs">
                        <span className="font-label-md text-label-md text-tertiary font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-tertiary"></span> May 2024 • Post-Intervention
                        </span>
                        <span className="font-code-sm text-code-sm bg-tertiary/20 text-tertiary px-space-xs rounded font-bold">
                          39.6°C Attenuated
                        </span>
                      </div>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-container-lowest">
                        <img
                          alt="Thermal post-intervention"
                          className="w-full h-full object-cover filter hue-rotate-180 saturate-150 opacity-80"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW0WTjJ70Tm6Qzsm-pw9xev5M4PUdCR76-8ABdXheNLd4tGg5qOy61ExCEbUf3QmhlMnuj31zPUkxamqBeLE07rCxECNGujTqvwZTuuvYfUiTxH192lWZWZCze0a4z5gh10zxDo_f5SCkVXoYI8LVq7j38jRLFXoYqU4hJexPRX_KsBhkZB-BHTYvzOH49qRRzsezxWmLJ9ilplXHQLxZvvvQskOluHhZ4GYIrVIp-b68JnIoFobn06w"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent"></div>
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="w-12 h-12 rounded-full bg-tertiary/20 animate-pulse absolute"></span>
                          <span className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-[10px] font-bold shadow-md">-3.2°</span>
                          <span className="font-code-sm text-code-sm text-tertiary bg-surface-container-lowest/80 px-space-xs py-space-2xs rounded mt-1 shadow-sm">Cool Sink Created</span>
                        </div>
                        <div className="absolute bottom-2 left-2 text-tertiary font-label-sm text-label-sm">
                          Albedo SRI: 92 | Tree Canopy: 32.8%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Implemented Audit & Verification Table */}
              <div className="lg:col-span-5 flex flex-col gap-space-lg">
                <div className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Implemented Interventions Audit
                    </h2>
                    <span className="font-code-sm text-code-sm text-outline">3 Assets Monitored</span>
                  </div>

                  <div className="flex flex-col gap-space-sm">
                    {/* Item 1 */}
                    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">roofing</span>
                          </div>
                          <div>
                            <h3 className="font-label-md text-label-md text-on-surface font-semibold">High-Albedo Cool Roofs</h3>
                            <span className="font-body-sm text-body-sm text-outline">12,400 m² across 48 residential tenements</span>
                          </div>
                        </div>
                        <span className="bg-tertiary/10 text-tertiary font-label-sm text-label-sm px-space-xs py-space-2xs rounded font-semibold">
                          SRI: 92
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-space-2xs pt-space-2xs text-outline font-label-sm text-label-sm">
                        <span>Coating Degradation: &lt; 3.5% / yr</span>
                        <span className="text-tertiary font-medium">Realized ΔT: -2.1°C</span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">park</span>
                          </div>
                          <div>
                            <h3 className="font-label-md text-label-md text-on-surface font-semibold">Native Miyawaki Micro-Grove</h3>
                            <span className="font-body-sm text-body-sm text-outline">450 saplings (Neem, Pongamia, Pungai)</span>
                          </div>
                        </div>
                        <span className="bg-tertiary/10 text-tertiary font-label-sm text-label-sm px-space-xs py-space-2xs rounded font-semibold">
                          Survival: 94%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-space-2xs pt-space-2xs text-outline font-label-sm text-label-sm">
                        <span>Canopy Expansion: +28.7%</span>
                        <span className="text-tertiary font-medium">Realized ΔT: -1.2°C</span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">water_drop</span>
                          </div>
                          <div>
                            <h3 className="font-label-md text-label-md text-on-surface font-semibold">Permeable Drainage Pavements</h3>
                            <span className="font-body-sm text-body-sm text-outline">3,200 m² along bus route arterial corridor</span>
                          </div>
                        </div>
                        <span className="bg-tertiary/10 text-tertiary font-label-sm text-label-sm px-space-xs py-space-2xs rounded font-semibold">
                          Permeability: High
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-space-2xs pt-space-2xs text-outline font-label-sm text-label-sm">
                        <span>Infiltration Rate: 42 mm/hr</span>
                        <span className="text-tertiary font-medium">Realized ΔT: -0.5°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground Verification Table */}
                <div className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Ground Telemetry Verification
                    </h2>
                    <span className="font-code-sm text-code-sm text-tertiary">All Stations Reporting</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm">
                      <thead>
                        <tr className="text-on-surface-variant uppercase tracking-wider font-label-sm text-label-sm bg-surface-container-lowest/60">
                          <th className="py-2 px-3 rounded-l-lg">Node</th>
                          <th className="py-2 px-3">Target</th>
                          <th className="py-2 px-3">Observed</th>
                          <th className="py-2 px-3 rounded-r-lg text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-highest/30">
                        <tr>
                          <td className="py-2.5 px-3 font-code-sm text-on-surface">TN-104</td>
                          <td className="py-2.5 px-3 font-code-sm text-outline">-1.4°C</td>
                          <td className="py-2.5 px-3 font-code-sm text-tertiary font-semibold">-1.72°C</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-tertiary font-label-sm uppercase font-semibold">Validated</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-code-sm text-on-surface">TN-118</td>
                          <td className="py-2.5 px-3 font-code-sm text-outline">-0.8°C</td>
                          <td className="py-2.5 px-3 font-code-sm text-tertiary font-semibold">-1.05°C</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-tertiary font-label-sm uppercase font-semibold">Validated</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-code-sm text-on-surface">TN-122</td>
                          <td className="py-2.5 px-3 font-code-sm text-outline">-0.6°C</td>
                          <td className="py-2.5 px-3 font-code-sm text-tertiary font-semibold">-0.58°C</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-tertiary font-label-sm uppercase font-semibold">Validated</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
