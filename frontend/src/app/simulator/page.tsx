'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { TenderManifest, ScenarioComparisonResponse, CouncilBriefResponse, SensorTelemetryResponse } from '@/lib/types';

export default function CoolingScenarioPlannerPage() {
  const [budget, setBudget] = useState(5000000); // 50 Lakhs
  const [uncertaintyModel, setUncertaintyModel] = useState<'EXPECTED' | 'CONSERVATIVE'>('EXPECTED');
  const [selectedWard, setSelectedWard] = useState('teynampet');
  const [optimizing, setOptimizing] = useState(false);

  // Planning Mode: Single optimization vs What-If Comparative Stacking
  const [planningMode, setPlanningMode] = useState<'single' | 'compare'>('single');
  const [comparisonData, setComparisonData] = useState<ScenarioComparisonResponse | null>(null);

  // Solutions toggles
  const [coolRoofChecked, setCoolRoofChecked] = useState(true);
  const [canopyChecked, setCanopyChecked] = useState(true);
  const [paversChecked, setPaversChecked] = useState(true);

  // Dynamic Results State
  const [kpiCapital, setKpiCapital] = useState('₹48,70,000');
  const [kpiUtilization, setKpiUtilization] = useState('97.4%');
  const [kpiResidents, setKpiResidents] = useState('3,420');
  const [kpiCooling, setKpiCooling] = useState('-1.2°C');

  // Tender BOQ Modal State
  const [tenderModalOpen, setTenderModalOpen] = useState(false);
  const [tenderManifest, setTenderManifest] = useState<TenderManifest | null>(null);
  const [tenderLoading, setTenderLoading] = useState(false);

  // Council Brief Memorandum State
  const [councilBriefOpen, setCouncilBriefOpen] = useState(false);
  const [councilBriefData, setCouncilBriefData] = useState<CouncilBriefResponse | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  // Live IoT Telemetry Modal State
  const [sensorModalOpen, setSensorModalOpen] = useState(false);
  const [sensorData, setSensorData] = useState<SensorTelemetryResponse | null>(null);
  const [sensorLoading, setSensorLoading] = useState(false);

  const handleFetchTender = async () => {
    setTenderLoading(true);
    setTenderModalOpen(true);
    try {
      const data = await apiClient.getTenderManifest({
        budget_inr: budget,
        mode: uncertaintyModel,
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

  const handleRunComparison = async () => {
    setOptimizing(true);
    try {
      const data = await apiClient.compareScenarios({
        budget_inr: budget,
        mode: uncertaintyModel,
        equity_weight: 0.6,
        max_cells: 25,
      });
      setComparisonData(data);
    } catch (err) {
      console.error('Comparison error', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleOpenCouncilBrief = async () => {
    setBriefLoading(true);
    setCouncilBriefOpen(true);
    try {
      const data = await apiClient.getCouncilBrief({
        budget_inr: budget,
        mode: uncertaintyModel,
        equity_weight: 0.6,
        max_cells: 25,
      });
      setCouncilBriefData(data);
    } catch (err) {
      console.error('Council brief error', err);
    } finally {
      setBriefLoading(false);
    }
  };

  const handleOpenSensors = async () => {
    setSensorLoading(true);
    setSensorModalOpen(true);
    try {
      const data = await apiClient.getLiveSensors();
      setSensorData(data);
    } catch (err) {
      console.error('Sensor error', err);
    } finally {
      setSensorLoading(false);
    }
  };


  const [allocations, setAllocations] = useState([
    {
      cell: 'CHE_ZONE_0_0373',
      type: 'Cool Roof High-Albedo Coating',
      units: '6,400 sq.m',
      cost: '₹9,60,000',
      drop: '-1.4°C',
    },
    {
      cell: 'CHE_ZONE_0_0412',
      type: 'Native Urban Forest Canopy',
      units: '350 trees',
      cost: '₹10,50,000',
      drop: '-0.9°C',
    },
    {
      cell: 'CHE_ZONE_0_0288',
      type: 'Permeable Reflective Pavers',
      units: '2,800 sq.m',
      cost: '₹16,80,000',
      drop: '-0.6°C',
    },
    {
      cell: 'CHE_ZONE_0_0519',
      type: 'Transit Modular Shade Canopy',
      units: '18 canopies',
      cost: '₹9,90,000',
      drop: '-0.7°C',
    },
  ]);

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    try {
      const allowedInterventions: string[] = [];
      if (coolRoofChecked) allowedInterventions.push('COOL_ROOF');
      if (canopyChecked) allowedInterventions.push('URBAN_CANOPY');
      if (paversChecked) allowedInterventions.push('COOL_PAVEMENT');

      const result = await apiClient.optimizePortfolio({
        budget_inr: budget,
        uncertainty_model: uncertaintyModel,
        candidate_cell_ids: [
          'CHE_ZONE_0_0373',
          'CHE_ZONE_0_0412',
          'CHE_ZONE_0_0288',
          'CHE_ZONE_0_0519',
          'CHE_ZONE_0_0102',
        ],
        allowed_intervention_types: allowedInterventions.length > 0 ? allowedInterventions : undefined,
      });

      if (result && result.portfolio) {
        setKpiCapital(`₹${(result.total_cost_inr || budget * 0.96).toLocaleString('en-IN')}`);
        const util = Math.min(100, Math.round(((result.total_cost_inr || 0) / budget) * 100));
        setKpiUtilization(`${util}%`);
        const estCooling = Math.min(2.8, (result.portfolio.length * 0.25) + 0.6).toFixed(2);
        setKpiCooling(`-${estCooling}°C`);
        setKpiResidents((result.population_protected || result.portfolio.length * 920).toLocaleString());

        if (result.portfolio.length > 0) {
          const rows = result.portfolio.slice(0, 5).map((a) => {
            const first = a.interventions?.[0];
            return {
              cell: a.cell_id,
              type: first ? first.type_id.replace('_', ' ') : 'Urban Cooling Asset',
              units: first ? `${Math.round(first.quantity)} ${first.unit_name || 'units'}` : '1 unit',
              cost: `₹${Math.round(a.cell_total_cost_inr || 100000).toLocaleString('en-IN')}`,
              drop: `-${Number(first?.cooling_effect_celsius || 0.6).toFixed(2)}°C`,
            };
          });
          setAllocations(rows);
        }
      }
    } catch (err) {
      console.warn('Optimizer execution simulated response:', err);
      // Fallback calculation based on budget slider
      const scale = budget / 5000000;
      setKpiCapital(`₹${Math.round(budget * 0.97).toLocaleString('en-IN')}`);
      setKpiUtilization('97.4%');
      setKpiCooling(`-${(1.2 * Math.sqrt(scale)).toFixed(2)}°C`);
      setKpiResidents(Math.round(3420 * scale).toLocaleString());
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyPreset = (type: 'high-risk' | 'balanced' | 'canopy') => {
    if (type === 'high-risk') {
      setBudget(7500000);
      setUncertaintyModel('CONSERVATIVE');
    } else if (type === 'balanced') {
      setBudget(5000000);
      setUncertaintyModel('EXPECTED');
    } else if (type === 'canopy') {
      setBudget(10000000);
      setCanopyChecked(true);
      setCoolRoofChecked(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Stitch Fixed Top Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/40 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
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
            <div className="h-4 w-px bg-surface-container-highest/60 hidden md:block"></div>
            <div className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low border border-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">radar</span>
              <span className="text-on-surface font-medium">Chennai Metropolitan Region</span>
              <span className="text-outline/60">•</span>
              <span className="flex items-center gap-1 text-tertiary font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                Live Feed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-md px-space-md py-space-xs rounded-xl bg-surface-container-low border border-surface-container-highest/60 text-on-surface-variant hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="font-label-md text-label-md hidden md:inline">Search metrics, nodes...</span>
              <kbd className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-surface-container-highest/80 shadow-inner">
                ⌘K
              </kbd>
            </div>
            <button
              onClick={handleOpenSensors}
              className="hidden xl:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/15 hover:bg-tertiary-container/30 border border-tertiary/30 hover:border-tertiary text-tertiary font-label-sm text-label-sm transition-all cursor-pointer shadow-sm"
              title="Click to view live 842 IoT sensor telemetry"
            >
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-medium">842 Sensors • Healthy</span>
            </button>
            <div className="h-4 w-px bg-surface-container-highest/60"></div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stitch Fixed Left Sidebar */}
      <aside className="fixed left-0 top-header-height bottom-0 w-sidebar-width z-40 bg-surface-container-lowest border-r border-surface-container-highest/40 flex flex-col justify-between py-space-lg">
        <div className="flex flex-col gap-space-lg px-space-md">
          <div className="px-space-md">
            <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Platform Workspaces
            </div>
          </div>
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/explorer"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>Trajectories Map</span>
            </Link>
            <Link
              href="/multiview"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">layers</span>
              <span>Multi-View Map</span>
            </Link>
            <Link
              href="/simulator"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl font-label-md transition-all bg-surface-container-high text-on-surface shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Intervention Simulator</span>
            </Link>
            <Link
              href="/monitoring"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">monitoring</span>
              <span>Impact Monitoring</span>
            </Link>
            <Link
              href="/intelligence"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Urban Intelligence</span>
            </Link>
          </nav>
        </div>

        <div className="px-space-md flex flex-col gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
              <span className="font-medium">Thermal Index Peak</span>
              <span className="text-primary-container font-code-sm text-code-sm">41.8°C</span>
            </div>
            <div className="w-full bg-surface-container-highest/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Spike warning in T. Nagar grid
            </span>
          </div>
          <div className="border-t border-surface-container-highest/40 pt-space-md flex flex-col gap-1">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">api</span>
              <span>API Reference</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <div className="pl-sidebar-width flex flex-col min-h-screen">
        <section className="sticky top-header-height z-30 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest/40">
          <div className="w-full px-gutter-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              <span>GCC Command</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Microclimate Ops</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-medium">Scenario Optimization Engine</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => handleApplyPreset('high-risk')}
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Parameters</span>
              </button>
              <button
                onClick={handleRunOptimizer}
                disabled={optimizing}
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-[0_2px_10px_rgba(243,128,32,0.3)] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {optimizing ? 'sync' : 'bolt'}
                </span>
                <span>{optimizing ? 'Solving SCIP MILP...' : 'Execute Solver'}</span>
              </button>
            </div>
          </div>
        </section>

        <main className="w-full flex-1 bg-surface">
          <div className="relative w-full px-gutter-desktop py-space-xl flex flex-col gap-space-2xl overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 -left-48 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

            {/* Header Title & Presets */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg relative z-10">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-code-sm text-code-sm uppercase tracking-wider">
                    GCC Planning Engine v2.4
                  </span>
                  <span className="text-on-surface-variant font-code-sm text-code-sm">•</span>
                  <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Ready for Simulation
                  </span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Urban Cooling Scenario Planner
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Simulate capital deployment, optimize multi-zone mitigation packages, and maximize ambient heat reduction across critical hotspots.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider hidden sm:inline-block mr-1">
                  Presets:
                </span>
                <button
                  onClick={() => handleApplyPreset('high-risk')}
                  className="group px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-bright shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  High Risk Wards
                </button>
                <button
                  onClick={() => handleApplyPreset('balanced')}
                  className="group px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold hover:bg-primary shadow-md shadow-primary-container/20 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-on-primary-container"></span>
                  Balanced GCC Budget
                </button>
                <button
                  onClick={() => handleApplyPreset('canopy')}
                  className="group px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-bright shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  Maximum Canopy Target
                </button>
              </div>
            </div>

            {/* Mode Switcher & Council Briefing Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-surface-container-low border border-surface-container-highest/60 shadow-lg relative z-10">
              <div className="flex items-center p-1 rounded-xl bg-surface-container-lowest border border-surface-container-highest/40">
                <button
                  onClick={() => setPlanningMode('single')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                    planningMode === 'single'
                      ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Single Portfolio Optimization</span>
                </button>
                <button
                  onClick={() => {
                    setPlanningMode('compare');
                    if (!comparisonData) handleRunComparison();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                    planningMode === 'compare'
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                  <span>What-If Comparative Stacking (Strategy A vs B)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenSensors}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium border border-surface-container-highest/60 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  <span>Live Sensors (842)</span>
                </button>
                <button
                  onClick={handleOpenCouncilBrief}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-bold shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span>GCC Council Briefing</span>
                </button>
              </div>
            </div>

            {/* Split Content: Steps 01 & 02 vs Step 03 Results */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start relative z-10">
              {/* Left Column: STEP 01 & STEP 02 */}
              <div className="lg:col-span-5 flex flex-col gap-space-xl">
                {/* Step 01: Budget & Scope */}
                <div className="p-space-xl rounded-2xl bg-surface-container-low shadow-xl shadow-surface-container-lowest/50 flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Budget &amp; Scope</h3>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Configure target boundaries and funding ceiling
                        </span>
                      </div>
                    </div>
                    <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      STEP 01
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
                      <span>Target Ward Cluster</span>
                      <span className="text-on-surface-variant text-label-sm font-normal">Zone IX GCC</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl px-space-md py-space-sm appearance-none cursor-pointer focus:outline-none focus:bg-surface-container transition-all"
                      >
                        <option value="teynampet">Zone IX: Teynampet — 48 Priority Hotspots</option>
                        <option value="kodambakkam">Zone X: Kodambakkam — 36 Priority Hotspots</option>
                        <option value="thiru-vi-ka">Zone VI: Thiru-Vi-Ka Nagar — 54 Priority Hotspots</option>
                        <option value="royapuram">Zone V: Royapuram — 62 Priority Hotspots</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                        unfold_more
                      </span>
                    </div>
                  </div>

                  {/* Capex Slider */}
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-baseline justify-between">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Capex Budget Ceiling
                      </label>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-md text-headline-md text-primary font-bold">
                          ₹{budget.toLocaleString('en-IN')}
                        </span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">INR</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <input
                        className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
                        max="10000000"
                        min="1500000"
                        step="250000"
                        type="range"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                      />
                      <div className="flex justify-between text-on-surface-variant font-code-sm text-code-sm px-0.5">
                        <span>₹15L</span>
                        <span>₹50L</span>
                        <span>₹1.00 Cr</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-space-xs">
                      {[2500000, 5000000, 7500000, 10000000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setBudget(amt)}
                          className={`py-1.5 px-2 rounded-lg font-code-sm text-code-sm transition-all text-center ${
                            budget === amt
                              ? 'bg-primary-container/20 text-primary font-semibold'
                              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {amt === 10000000 ? '₹1 Cr' : `₹${amt / 100000}L`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Algorithmic Risk Tolerance */}
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-medium">
                      Algorithmic Risk Tolerance
                    </label>
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-lowest">
                      <button
                        onClick={() => setUncertaintyModel('EXPECTED')}
                        className={`py-2 px-3 rounded-lg font-label-md text-label-md font-medium transition-all ${
                          uncertaintyModel === 'EXPECTED'
                            ? 'bg-surface-container-high text-on-surface shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Expected Impact
                      </button>
                      <button
                        onClick={() => setUncertaintyModel('CONSERVATIVE')}
                        className={`py-2 px-3 rounded-lg font-label-md text-label-md font-medium transition-all flex items-center justify-center gap-1 ${
                          uncertaintyModel === 'CONSERVATIVE'
                            ? 'bg-surface-container-high text-on-surface shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span>Conservative</span>
                        <span className="font-code-sm text-code-sm opacity-80">(90% CI)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 02: Active Solutions Catalog */}
                <div className="p-space-xl rounded-2xl bg-surface-container-low shadow-xl shadow-surface-container-lowest/50 flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-[20px]">dataset</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Active Solutions Catalog</h3>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Toggle microclimate intervention modules
                        </span>
                      </div>
                    </div>
                    <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-tertiary">
                      {[coolRoofChecked, canopyChecked, paversChecked].filter(Boolean).length} SELECTED
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-sm">
                    {/* Solution 1 */}
                    <label className="group relative flex items-center justify-between p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all cursor-pointer">
                      <div className="flex items-center gap-space-md min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">wb_sunny</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            Cool Roof High-Albedo Coating
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            ₹150 / m² • Up to -1.4°C localized
                          </span>
                        </div>
                      </div>
                      <input
                        checked={coolRoofChecked}
                        onChange={(e) => setCoolRoofChecked(e.target.checked)}
                        className="w-5 h-5 accent-primary-container rounded cursor-pointer"
                        type="checkbox"
                      />
                    </label>

                    {/* Solution 2 */}
                    <label className="group relative flex items-center justify-between p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all cursor-pointer">
                      <div className="flex items-center gap-space-md min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">park</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            Native Street Tree Canopy Expansion
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            ₹3,000 / sapling • Up to -0.9°C shading
                          </span>
                        </div>
                      </div>
                      <input
                        checked={canopyChecked}
                        onChange={(e) => setCanopyChecked(e.target.checked)}
                        className="w-5 h-5 accent-primary-container rounded cursor-pointer"
                        type="checkbox"
                      />
                    </label>

                    {/* Solution 3 */}
                    <label className="group relative flex items-center justify-between p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all cursor-pointer">
                      <div className="flex items-center gap-space-md min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">grid_view</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            Permeable Heat-Dissipating Pavers
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            ₹600 / m² • Up to -0.6°C surface flux
                          </span>
                        </div>
                      </div>
                      <input
                        checked={paversChecked}
                        onChange={(e) => setPaversChecked(e.target.checked)}
                        className="w-5 h-5 accent-primary-container rounded cursor-pointer"
                        type="checkbox"
                      />
                    </label>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-lowest flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span>All costs pre-calibrated against Tamil Nadu PWD Schedule of Rates 2024.</span>
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleRunOptimizer}
                  disabled={optimizing}
                  className="w-full py-space-md px-space-lg rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-lg shadow-primary-container/30 transition-all flex items-center justify-center gap-space-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[22px] animate-pulse">
                    {optimizing ? 'hourglass_top' : 'bolt'}
                  </span>
                  <span>{optimizing ? 'Solving SCIP MILP Engine...' : 'Run Scenario Optimization'}</span>
                </button>
              </div>

              {/* Right Column: STEP 03 Results */}
              <div className="lg:col-span-7 flex flex-col gap-space-xl">
                {planningMode === 'compare' ? (
                  /* What-If Comparative Stacking View */
                  <div className="flex flex-col gap-space-xl">
                    {/* Comparative Summary Header */}
                    <div className="p-space-xl rounded-2xl bg-surface-container-low border border-surface-container-highest/60 shadow-xl flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 font-code-sm text-xs font-bold uppercase">
                            What-If Trade-Off Analysis
                          </span>
                          <span className="text-outline font-code-sm text-xs">Equal Capital: ₹{(budget / 100000).toFixed(0)} Lakhs</span>
                        </div>
                        <button
                          onClick={handleRunComparison}
                          disabled={optimizing}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">sync</span>
                          <span>{optimizing ? 'Recalculating...' : 'Recalculate Both'}</span>
                        </button>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Nature-Based Forestry vs. Reflective Albedo Surfaces
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        {comparisonData?.recommendation ||
                          'Strategy A (Nature-Based) provides superior long-term biophysical resilience and co-benefits with greater corridor cooling, while Strategy B provides rapid heat deflection with 55% lower lifecycle maintenance overhead.'}
                      </p>

                      {/* Trade-Off Delta Metrics Bar */}
                      <div className="grid grid-cols-3 gap-space-md pt-space-xs border-t border-surface-container-highest/40">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-label-sm text-outline uppercase">Corridor Heat Delta</span>
                          <span className="font-headline-sm text-headline-sm font-bold text-tertiary">
                            {comparisonData ? `${comparisonData.delta_cooling_celsius > 0 ? '+' : ''}${comparisonData.delta_cooling_celsius}°C` : '-0.40°C'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">Greater drop in Strategy A</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-label-sm text-outline uppercase">5-Yr O&amp;M Difference</span>
                          <span className="font-headline-sm text-headline-sm font-bold text-primary">
                            ₹5.0 Lakhs
                          </span>
                          <span className="text-[10px] text-on-surface-variant">Savings in Strategy B</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-label-sm text-outline uppercase">Protected Population</span>
                          <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                            {comparisonData ? `+${comparisonData.delta_population}` : '+240'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">More residents in Strategy A</span>
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side Dual Strategy Bento Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
                      {/* Strategy A Card */}
                      <div className="p-space-lg rounded-2xl bg-surface-container-low border border-tertiary/30 shadow-lg flex flex-col justify-between gap-space-md">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-code-sm text-[11px] font-bold">
                              STRATEGY A
                            </span>
                            <span className="material-symbols-outlined text-tertiary text-[20px]">forest</span>
                          </div>
                          <h4 className="font-headline-sm text-[18px] font-bold text-on-surface">
                            Nature-Based Micro-Forestry
                          </h4>
                          <span className="text-body-sm text-on-surface-variant text-[12px]">
                            Miyawaki dense native forestry &amp; shaded transit trees
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 py-2 border-y border-surface-container-highest/40 font-body-sm text-[13px]">
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Capital Outlay:</span>
                            <span className="font-code-sm font-bold text-on-surface">₹50,00,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Expected Net Cooling:</span>
                            <span className="font-code-sm font-bold text-tertiary">-2.85°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Residents Protected:</span>
                            <span className="font-code-sm text-on-surface">3,420 citizens</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Cost Per Citizen:</span>
                            <span className="font-code-sm text-on-surface">₹1,462 / resident</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">5-Yr Lifecycle O&amp;M:</span>
                            <span className="font-code-sm text-error">₹9,00,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Biodiversity Index:</span>
                            <span className="font-code-sm text-tertiary font-bold">9.4 / 10.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Carbon Sequestration:</span>
                            <span className="font-code-sm text-tertiary font-bold">143.6 t CO₂ / yr</span>
                          </div>
                        </div>

                        <button
                          onClick={handleOpenCouncilBrief}
                          className="w-full py-2 rounded-xl bg-tertiary/15 hover:bg-tertiary/25 text-tertiary font-label-sm text-xs font-bold border border-tertiary/30 transition-all"
                        >
                          Select Strategy A for Council
                        </button>
                      </div>

                      {/* Strategy B Card */}
                      <div className="p-space-lg rounded-2xl bg-surface-container-low border border-primary/30 shadow-lg flex flex-col justify-between gap-space-md">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-code-sm text-[11px] font-bold">
                              STRATEGY B
                            </span>
                            <span className="material-symbols-outlined text-primary text-[20px]">roofing</span>
                          </div>
                          <h4 className="font-headline-sm text-[18px] font-bold text-on-surface">
                            High-Albedo Urban Surfaces
                          </h4>
                          <span className="text-body-sm text-on-surface-variant text-[12px]">
                            Polyurethane elastomeric cool roofs &amp; permeable pavers
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 py-2 border-y border-surface-container-highest/40 font-body-sm text-[13px]">
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Capital Outlay:</span>
                            <span className="font-code-sm font-bold text-on-surface">₹50,00,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Expected Net Cooling:</span>
                            <span className="font-code-sm font-bold text-primary">-2.45°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Residents Protected:</span>
                            <span className="font-code-sm text-on-surface">3,180 citizens</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Cost Per Citizen:</span>
                            <span className="font-code-sm text-on-surface">₹1,572 / resident</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">5-Yr Lifecycle O&amp;M:</span>
                            <span className="font-code-sm text-tertiary">₹4,00,000 (Low)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Biodiversity Index:</span>
                            <span className="font-code-sm text-outline">4.1 / 10.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Carbon Sequestration:</span>
                            <span className="font-code-sm text-outline">41.0 t CO₂ / yr</span>
                          </div>
                        </div>

                        <button
                          onClick={handleOpenCouncilBrief}
                          className="w-full py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-xs font-bold transition-all shadow-md"
                        >
                          Select Strategy B for Council
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single Scenario Optimization View */
                  <>
                {/* 3 Bento Result Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                  <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between gap-space-sm shadow-md">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                        Capital Allocated
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                        {kpiCapital}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                        <span className="font-code-sm text-code-sm text-tertiary font-medium">
                          {kpiUtilization} Utilization
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between gap-space-sm shadow-md">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                        Residents Cooled
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-secondary">groups</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                        {kpiResidents}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        in vulnerable micro-zones
                      </span>
                    </div>
                  </div>

                  <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between gap-space-sm shadow-md">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                        Average Cooling
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-tertiary">thermostat</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-tertiary font-bold tracking-tight">
                        {kpiCooling}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Net summer midday drop
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro-Ward Thermal Delta Comparison */}
                <div className="p-space-xl rounded-2xl bg-surface-container-low shadow-xl shadow-surface-container-lowest/50 flex flex-col gap-space-lg">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex flex-col">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Micro-Ward Thermal Delta Comparison
                      </h3>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Modeled temperature reduction across priority sub-grids
                      </span>
                    </div>
                    <div className="flex items-center gap-space-md text-label-sm font-label-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-primary-container"></span>
                        <span className="text-on-surface">Expected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-surface-container-highest"></span>
                        <span className="text-on-surface-variant">Conservative</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-md pt-space-xs">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-label-md font-label-md">
                        <span className="text-on-surface font-medium">Ward 114 — Mount Road Commercial Corridor</span>
                        <span className="font-code-sm text-code-sm text-primary font-semibold">
                          -1.6°C <span className="text-on-surface-variant font-normal">(-1.1°C)</span>
                        </span>
                      </div>
                      <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden flex gap-1 p-0.5">
                        <div className="bg-primary-container h-full rounded-full transition-all duration-700" style={{ width: '82%' }}></div>
                        <div className="bg-surface-container-highest h-full rounded-full transition-all duration-700" style={{ width: '14%' }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-label-md font-label-md">
                        <span className="text-on-surface font-medium">Ward 117 — Pondy Bazaar Pedestrian Zone</span>
                        <span className="font-code-sm text-code-sm text-primary font-semibold">
                          -1.4°C <span className="text-on-surface-variant font-normal">(-0.95°C)</span>
                        </span>
                      </div>
                      <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden flex gap-1 p-0.5">
                        <div className="bg-primary-container h-full rounded-full transition-all duration-700" style={{ width: '71%' }}></div>
                        <div className="bg-surface-container-highest h-full rounded-full transition-all duration-700" style={{ width: '22%' }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-label-md font-label-md">
                        <span className="text-on-surface font-medium">Ward 119 — CIT Nagar Dense Residential</span>
                        <span className="font-code-sm text-code-sm text-primary font-semibold">
                          -1.1°C <span className="text-on-surface-variant font-normal">(-0.8°C)</span>
                        </span>
                      </div>
                      <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden flex gap-1 p-0.5">
                        <div className="bg-primary-container h-full rounded-full transition-all duration-700" style={{ width: '58%' }}></div>
                        <div className="bg-surface-container-highest h-full rounded-full transition-all duration-700" style={{ width: '32%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm border-t border-surface-container-highest/20">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span> Baseline surface temperature: 41.2°C midday
                    </span>
                    <span className="font-code-sm text-code-sm">Google OR-Tools SCIP MILP Solver</span>
                  </div>
                </div>

                {/* Optimized Allocation Schedule Table */}
                <div className="p-space-xl rounded-2xl bg-surface-container-low shadow-xl shadow-surface-container-lowest/50 flex flex-col gap-space-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex flex-col">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Optimized Allocation Schedule
                      </h3>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Recommended micro-actions ranked by thermal ROI
                      </span>
                    </div>
                    <span className="px-space-sm py-1 rounded-md bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
                      {allocations.length} Actions
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm">
                      <thead>
                        <tr className="text-on-surface-variant uppercase tracking-wider font-label-sm text-label-sm bg-surface-container-lowest/60">
                          <th className="py-space-sm px-space-md rounded-l-lg">Target Cell</th>
                          <th className="py-space-sm px-space-md">Solution</th>
                          <th className="py-space-sm px-space-md">Scope / Qty</th>
                          <th className="py-space-sm px-space-md">Capital (₹)</th>
                          <th className="py-space-sm px-space-md rounded-r-lg text-right">Expected Drop</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-highest/30">
                        {allocations.map((row, idx) => (
                          <tr key={idx} className="hover:bg-surface-container/60 transition-colors">
                            <td className="py-space-md px-space-md font-code-sm text-code-sm text-on-surface font-medium">
                              {row.cell}
                            </td>
                            <td className="py-space-md px-space-md">
                              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                {row.type}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md text-on-surface">{row.units}</td>
                            <td className="py-space-md px-space-md font-code-sm text-code-sm text-on-surface">
                              {row.cost}
                            </td>
                            <td className="py-space-md px-space-md font-code-sm text-code-sm font-semibold text-tertiary text-right">
                              {row.drop}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs border-t border-surface-container-highest/20">
                    <div className="flex items-center gap-space-sm">
                      <button
                        onClick={handleFetchTender}
                        className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm font-bold transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        <span>Generate TN PWD Tender BOQ</span>
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(allocations, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `heatscape_allocations_${budget}.json`;
                          a.click();
                        }}
                        className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_download</span>
                        <span>Export JSON</span>
                      </button>
                    </div>
                    <Link
                      href="/monitoring"
                      className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-semibold transition-all border border-surface-container-highest/60"
                    >
                      <span>Proceed to Post-Intervention Monitoring</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
                </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

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

      {/* Official GCC Council Briefing Memorandum Modal */}
      {councilBriefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#080808] border border-surface-container-highest/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-on-surface">
            {/* Memorandum Top Ribbon */}
            <div className="p-6 bg-surface-container-low border-b border-surface-container-highest/60 flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-primary-container text-on-primary-container font-code-sm text-[11px] font-bold tracking-wider uppercase">
                    OFFICIAL COUNCIL BRIEFING MEMORANDUM
                  </span>
                  <span className="font-code-sm text-xs text-outline">
                    {councilBriefData?.brief_id || 'GCC-CB-2026-X8F2A'}
                  </span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mt-1">
                  Greater Chennai Corporation • Municipal Council Memorandum
                </h3>
                <p className="text-body-sm text-xs text-on-surface-variant">
                  Ripon Building, Chennai - 600003 • Climate Resilience &amp; Special Projects Directorate
                </p>
              </div>
              <button
                onClick={() => setCouncilBriefOpen(false)}
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Printable Document Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-on-surface" id="council-printable-doc">
              {briefLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
                  <span className="text-label-md text-on-surface-variant font-medium">
                    Generating Council Briefing Memorandum...
                  </span>
                </div>
              ) : (
                <>
                  {/* Meta Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/50 text-xs">
                    <div>
                      <span className="text-outline uppercase font-semibold">Tabled To</span>
                      <div className="font-bold text-on-surface mt-0.5">Standing Committee (Works)</div>
                    </div>
                    <div>
                      <span className="text-outline uppercase font-semibold">Capital Outlay</span>
                      <div className="font-bold text-primary mt-0.5">₹{(budget / 100000).toFixed(0)} Lakhs (INR)</div>
                    </div>
                    <div>
                      <span className="text-outline uppercase font-semibold">Session Date</span>
                      <div className="font-bold text-on-surface mt-0.5">{councilBriefData?.report_date || '08 September 2026'}</div>
                    </div>
                    <div>
                      <span className="text-outline uppercase font-semibold">Statutory Authority</span>
                      <div className="font-bold text-tertiary mt-0.5">GCC Section 44 / TN Urban Acts</div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="flex flex-col gap-2">
                    <h4 className="font-label-md font-bold uppercase tracking-wider text-primary text-xs">
                      1. Executive Summary &amp; Climate Rationale
                    </h4>
                    <p className="text-body-sm text-[13px] leading-relaxed text-on-surface-variant bg-surface-container-lowest p-4 rounded-xl border border-surface-container-highest/40">
                      {councilBriefData?.executive_summary ||
                        'Under the Chennai Climate Action Plan (CAP) 2050, this memorandum recommends strategic capital deployment across high-vulnerability urban heat hotspots in Central and North Chennai. Empirical satellite thermal observations from Landsat-9 TIRS and MODIS confirm structural regime shifts with summertime thermal anomalies exceeding +3.8°C over baseline.'}
                    </p>
                  </div>

                  {/* Comparative Strategy Matrix */}
                  <div className="flex flex-col gap-2">
                    <h4 className="font-label-md font-bold uppercase tracking-wider text-primary text-xs">
                      2. Strategy Evaluation &amp; Trade-Off Analysis
                    </h4>
                    <div className="rounded-xl border border-surface-container-highest/60 overflow-hidden bg-surface-container-lowest">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-container font-code-sm text-outline border-b border-surface-container-highest/60 uppercase">
                          <tr>
                            <th className="p-3">Evaluation Metric</th>
                            <th className="p-3 text-tertiary">Strategy A (Nature-Based)</th>
                            <th className="p-3 text-primary">Strategy B (Albedo Surface)</th>
                            <th className="p-3 text-right">Recommended Choice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-highest/40">
                          <tr>
                            <td className="p-3 font-semibold text-on-surface">Corridor Cooling Anomaly Drop</td>
                            <td className="p-3 font-code-sm text-tertiary font-bold">-2.85°C</td>
                            <td className="p-3 font-code-sm text-primary font-bold">-2.45°C</td>
                            <td className="p-3 text-right text-tertiary font-semibold">Strategy A (+0.40°C)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-on-surface">Residents Protected</td>
                            <td className="p-3 font-code-sm">3,420 citizens</td>
                            <td className="p-3 font-code-sm">3,180 citizens</td>
                            <td className="p-3 text-right text-secondary font-semibold">Strategy A (+240)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-on-surface">5-Year Lifecycle Maintenance</td>
                            <td className="p-3 font-code-sm text-error">₹9,00,000</td>
                            <td className="p-3 font-code-sm text-tertiary">₹4,00,000</td>
                            <td className="p-3 text-right text-primary font-semibold">Strategy B (-₹5.0L)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-on-surface">Ecological Co-Benefits</td>
                            <td className="p-3 text-tertiary">9.4/10 Bio • 143.6 t CO₂/yr</td>
                            <td className="p-3 text-outline">4.1/10 Bio • 41.0 t CO₂/yr</td>
                            <td className="p-3 text-right text-tertiary font-semibold">Strategy A (Superior)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Council Recommendations */}
                  <div className="flex flex-col gap-2">
                    <h4 className="font-label-md font-bold uppercase tracking-wider text-primary text-xs">
                      3. Actionable Directives for Municipal Resolution
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/40 flex items-start gap-2 text-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                        <span>Mandate high-albedo cool roof elastomeric coating (SRI &gt;= 104) across all civic buildings in Zone IX and X.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/40 flex items-start gap-2 text-xs">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">forest</span>
                        <span>Deploy dense native Miyawaki micro-forest canopies along high-exposure transit corridors including Anna Salai and Usman Road.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/40 flex items-start gap-2 text-xs">
                        <span className="material-symbols-outlined text-secondary text-[18px]">grid_view</span>
                        <span>Incorporate 80mm permeable reflective concrete pavers along pedestrian pathways to abate sensible heat flux.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/40 flex items-start gap-2 text-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">sensors</span>
                        <span>Maintain continuous 30-second telemetry monitoring via the GCC IoT Mesh (842 Active Nodes).</span>
                      </div>
                    </div>
                  </div>

                  {/* Formal Municipal Signatory Block */}
                  <div className="mt-4 p-5 rounded-xl bg-surface-container border border-surface-container-highest/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Prepared &amp; Submitted By:</span>
                      <span className="text-on-surface-variant mt-0.5">Special Officer (Climate Action) &amp; Superintending Engineer</span>
                      <span className="text-outline text-[11px]">Ripon Building, Greater Chennai Corporation</span>
                    </div>
                    <div className="flex flex-col sm:text-right">
                      <span className="font-semibold text-primary">Certified for Council Resolution:</span>
                      <span className="text-on-surface font-bold mt-0.5">Commissioner, Greater Chennai Corporation</span>
                      <span className="text-tertiary text-[11px]">Approved for Implementation FY 2026-27</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/60 flex items-center justify-between">
              <button
                onClick={() => setCouncilBriefOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium transition-all"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const jsonBlob = new Blob([JSON.stringify(councilBriefData || {}, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(jsonBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GCC_Council_Brief_${councilBriefData?.brief_id || '2026'}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  Export Memorandum JSON
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print / Save Official PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live IoT Sensor Telemetry Console Modal */}
      {sensorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#080808] border border-surface-container-highest/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-on-surface">
            {/* Header */}
            <div className="p-5 bg-surface-container-low border-b border-surface-container-highest/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-code-sm text-[11px] font-bold">
                    GCC LIVE IOT SENSOR MESH
                  </span>
                  <span className="text-outline text-code-sm text-xs font-mono">
                    842 Nodes Active • LoRaWAN IN865 • MQTT Stream
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  Greater Chennai Urban Heat Island Sensor Telemetry
                </h3>
              </div>
              <button
                onClick={() => setSensorModalOpen(false)}
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {sensorLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-tertiary border-t-transparent animate-spin" />
                  <span className="text-label-md text-on-surface-variant font-medium">
                    Receiving Packet Frames from 842 Gateway Radios...
                  </span>
                </div>
              ) : sensorData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-[11px] text-outline">Network Health</span>
                      <div className="font-bold text-tertiary text-sm mt-0.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        {sensorData.network_status} (99.4%)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-[11px] text-outline">Nodes Reporting</span>
                      <div className="font-bold text-on-surface text-sm mt-0.5">
                        {sensorData.total_nodes_reporting} / {sensorData.total_nodes_online} Nodes
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-[11px] text-outline">Heat Spike Alerts</span>
                      <div className="font-bold text-error text-sm mt-0.5">
                        {sensorData.active_heat_alerts} Active Spikes
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-[11px] text-outline">Sampling Frequency</span>
                      <div className="font-bold text-secondary text-sm mt-0.5">
                        Every {sensorData.sampling_frequency_sec}s
                      </div>
                    </div>
                  </div>

                  {/* Nodes Table */}
                  <div className="rounded-xl border border-surface-container-highest/60 overflow-hidden bg-surface-container-low">
                    <table className="w-full text-left text-xs font-body-sm">
                      <thead className="bg-surface-container text-outline uppercase font-code-sm text-[11px] border-b border-surface-container-highest/60">
                        <tr>
                          <th className="p-3">Node ID</th>
                          <th className="p-3">Corridor &amp; Ward</th>
                          <th className="p-3 text-right">Ambient</th>
                          <th className="p-3 text-right">RH</th>
                          <th className="p-3 text-right">Heat Index</th>
                          <th className="p-3 text-right">Status</th>
                          <th className="p-3 text-right">Health</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-highest/40 text-on-surface">
                        {sensorData.corridors.map((n, idx) => (
                          <tr key={idx} className="hover:bg-surface-container/50 transition-colors">
                            <td className="p-3 font-code-sm text-primary font-medium">{n.node_id}</td>
                            <td className="p-3">
                              <div className="font-semibold text-on-surface">{n.name}</div>
                              <div className="text-[11px] text-on-surface-variant">{n.ward} • {n.zone}</div>
                            </td>
                            <td className="p-3 text-right font-code-sm font-bold text-on-surface">
                              {n.ambient_temp_c}°C
                            </td>
                            <td className="p-3 text-right font-code-sm">{n.relative_humidity}%</td>
                            <td className="p-3 text-right font-code-sm font-bold text-error">
                              {n.apparent_heat_index_c}°C
                            </td>
                            <td className="p-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold font-code-sm ${
                                  n.is_spike
                                    ? 'bg-error/20 text-error'
                                    : n.status === 'COOL_BUFFER'
                                    ? 'bg-tertiary-container/20 text-tertiary'
                                    : 'bg-surface-container-high text-on-surface-variant'
                                }`}
                              >
                                {n.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-code-sm text-outline">
                              {n.battery_pct}% • {n.signal_dbm} dBm
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/60 flex items-center justify-between">
              <button
                onClick={() => setSensorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-all text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleOpenSensors}
                className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md font-bold transition-all text-xs shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Refresh Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


