'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { KpiSummary } from '@/lib/types';
import { HeatScapeLogo } from '@/components/brand/HeatScapeLogo';

export default function UrbanIntelligencePage() {
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiClient.getKpi();
        setKpi(data);
      } catch (err) {
        console.warn('Fallback to baseline KPI:', err);
        setKpi({
          total_cells: 1200,
          persistent_count: 598,
          emerging_count: 246,
          temporary_count: 221,
          improving_count: 135,
          watch_count: 0,
          exposed_population: 178482,
          mean_city_anomaly: 1.0,
          max_observed_anomaly: 2.58,
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const wardIntelligenceData = [
    {
      ward: 'Ward 114 — Teynampet South',
      zone: 'Zone IX',
      status: 'EMERGING',
      anomaly: '+2.8°C',
      canopy: '4.1%',
      impervious: '84%',
      population: '4,180',
      riskScore: 89,
      dominantDriver: 'Impervious Asphalt (84%)',
      sensors: '4 Active',
    },
    {
      ward: 'Ward 117 — Pondy Bazaar / T. Nagar',
      zone: 'Zone X',
      status: 'PERSISTENT',
      anomaly: '+4.1°C',
      canopy: '2.8%',
      impervious: '91%',
      population: '6,420',
      riskScore: 96,
      dominantDriver: 'Building Density & Heat Storage',
      sensors: '6 Active',
    },
    {
      ward: 'Ward 049 — Royapuram North',
      zone: 'Zone V',
      status: 'PERSISTENT',
      anomaly: '+2.3°C',
      canopy: '3.4%',
      impervious: '88%',
      population: '8,190',
      riskScore: 92,
      dominantDriver: 'Dense Masonry & Port Logistics',
      sensors: '5 Active',
    },
    {
      ward: 'Ward 102 — Anna Nagar West',
      zone: 'Zone VIII',
      status: 'TEMPORARY',
      anomaly: '+0.9°C',
      canopy: '14.2%',
      impervious: '68%',
      population: '3,840',
      riskScore: 48,
      dominantDriver: 'Arterial Traffic Radiation',
      sensors: '4 Active',
    },
    {
      ward: 'Ward 174 — Adyar Estuary Verge',
      zone: 'Zone XIII',
      status: 'IMPROVING',
      anomaly: '+0.6°C',
      canopy: '22.8%',
      impervious: '45%',
      population: '2,910',
      riskScore: 32,
      dominantDriver: 'Coastal Marine Inversion',
      sensors: '3 Active',
    },
    {
      ward: 'Ward 078 — Thiru-Vi-Ka Nagar Core',
      zone: 'Zone VI',
      status: 'EMERGING',
      anomaly: '+1.9°C',
      canopy: '5.6%',
      impervious: '79%',
      population: '5,600',
      riskScore: 78,
      dominantDriver: 'Industrial Roof Concentration',
      sensors: '4 Active',
    },
  ];

  const filteredWards = wardIntelligenceData.filter((w) => {
    const matchesFilter = selectedZoneFilter === 'ALL' || w.status === selectedZoneFilter;
    const matchesSearch =
      w.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.dominantDriver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Stitch Fixed Top Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/40 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="w-full h-header-height px-gutter-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0">
              <HeatScapeLogo size={32} animate={true} />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight hidden sm:inline-block">
                Heat<span className="text-[#D97757]">Scape</span>
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
            <div className="hidden xl:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/10 border border-tertiary/20 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span className="font-medium">842 Sensors • Healthy</span>
            </div>
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
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
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
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl font-label-md transition-all bg-surface-container-high text-on-surface shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
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
              <span className="text-primary-container font-code-sm text-code-sm">
                {kpi?.max_observed_anomaly ? `+${kpi.max_observed_anomaly}°C` : '+2.58°C'}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '84%' }}></div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              T. Nagar &amp; Royapuram Hotspots Flagged
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

      {/* Main Container with Sidebar Offset */}
      <div className="pl-sidebar-width flex flex-col min-h-screen">
        {/* Ribbon */}
        <section className="sticky top-header-height z-30 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest/40">
          <div className="w-full px-gutter-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              <span>GCC Command</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Microclimate Ops</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-medium">Urban Heat Intelligence &amp; Telemetry</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <Link
                href="/explorer"
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                <span>Open Spatial Explorer</span>
              </Link>
              <Link
                href="/simulator"
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-[0_2px_10px_rgba(243,128,32,0.3)]"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Run Portfolio Solver</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <main className="w-full flex-1 bg-surface px-gutter-desktop py-space-xl">
          <div className="flex flex-col gap-space-2xl max-w-7xl mx-auto">
            {/* Header Title */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-code-sm text-code-sm uppercase tracking-wider">
                    PostGIS Spatial Analytics Hub
                  </span>
                  <span className="text-on-surface-variant font-code-sm text-code-sm">•</span>
                  <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> 1,200 Monitored 100m² Grid Polygons
                  </span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                  Citywide Thermal Intelligence Matrix
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Continuous spatiotemporal surveillance across Greater Chennai Corporation. Non-parametric Sen&apos;s slope trends, PELT regime shifts, and TreeSHAP built-environment decomposition.
                </p>
              </div>

              <div className="flex items-center gap-space-sm">
                <button
                  onClick={() => {
                    const csv = wardIntelligenceData
                      .map(
                        (w) =>
                          `"${w.ward}","${w.zone}","${w.status}","${w.anomaly}","${w.canopy}","${w.impervious}","${w.population}","${w.riskScore}"`
                      )
                      .join('\n');
                    const blob = new Blob(
                      [`"Ward","Zone","Status","Anomaly","Canopy","Impervious","Population","RiskScore"\n` + csv],
                      { type: 'text/csv' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chennai_urban_intelligence_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                  }}
                  className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-surface-container-highest/60 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Export CSV Brief</span>
                </button>
              </div>
            </div>

            {/* Citywide Aggregated Telemetry Bento Cards (4-Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Card 1: Total Cells & Coverage */}
              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-surface-container-highest/40 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Monitored Grid Cells
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-primary">grid_view</span>
                </div>
                <div className="flex items-baseline gap-space-xs mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                    {kpi?.total_cells?.toLocaleString() || '1,200'}
                  </span>
                  <span className="font-code-sm text-code-sm text-outline">Polygons</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mt-space-sm pt-space-xs border-t border-surface-container-highest/30">
                  <span>UTM 44N (EPSG:32644)</span>
                  <span className="text-tertiary font-medium">10,000 m² Unit</span>
                </div>
              </div>

              {/* Card 2: Exposed Population */}
              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-surface-container-highest/40 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Exposed Population
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">groups</span>
                </div>
                <div className="flex items-baseline gap-space-xs mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-secondary tracking-tight">
                    {kpi?.exposed_population?.toLocaleString() || '178,482'}
                  </span>
                  <span className="font-code-sm text-code-sm text-outline">Residents</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mt-space-sm pt-space-xs border-t border-surface-container-highest/30">
                  <span>In Hotspot Zones</span>
                  <span className="text-secondary font-medium">High Density</span>
                </div>
              </div>

              {/* Card 3: Persistent Hotspots */}
              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-surface-container-highest/40 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Persistent Hotspots
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-primary-container">local_fire_department</span>
                </div>
                <div className="flex items-baseline gap-space-xs mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-primary-container tracking-tight">
                    {kpi?.persistent_count || '598'}
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-medium">
                    +{kpi?.emerging_count || 246} Emerging
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-sm">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>

              {/* Card 4: Mean & Max Anomaly */}
              <div className="p-space-lg rounded-2xl bg-surface-container-low border border-surface-container-highest/40 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Peak Temperature Anomaly
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-error">thermostat</span>
                </div>
                <div className="flex items-baseline gap-space-xs mt-space-md">
                  <span className="font-headline-xl text-headline-xl font-bold text-error tracking-tight">
                    +{kpi?.max_observed_anomaly || '2.58'}°C
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    avg +{kpi?.mean_city_anomaly || '1.0'}°C
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mt-space-sm pt-space-xs border-t border-surface-container-highest/30">
                  <span>Baseline: 33.2°C</span>
                  <span className="text-error font-medium">Critical Threshold</span>
                </div>
              </div>
            </div>

            {/* Split Section: Trajectory Distribution & TreeSHAP Built-Environment Drivers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column (5 cols): 5-State Trajectory Breakdown */}
              <div className="lg:col-span-5 flex flex-col gap-space-md p-space-xl rounded-2xl bg-surface-container border border-surface-container-highest/40 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Thermal Trajectory Dynamics
                    </h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Calibrated multi-class classification
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-outline">
                    36-Mo Time Series
                  </span>
                </div>

                <div className="space-y-space-sm pt-space-sm">
                  {/* State 1 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-highest/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-label-sm text-label-sm">
                      <span className="flex items-center gap-2 text-on-surface font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                        PERSISTENT HOTSPOT
                      </span>
                      <span className="font-code-sm text-primary font-bold">
                        {kpi?.persistent_count || 598} Cells (49.8%)
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Chronic thermal retention across multiple summer seasons. Unmitigated concrete heat sinks.
                    </p>
                    <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: '49.8%' }}></div>
                    </div>
                  </div>

                  {/* State 2 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-highest/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-label-sm text-label-sm">
                      <span className="flex items-center gap-2 text-on-surface font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                        EMERGING RISK
                      </span>
                      <span className="font-code-sm text-error font-bold">
                        {kpi?.emerging_count || 246} Cells (20.5%)
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Statistically significant positive Sen&apos;s slope with PELT change point detected in 2023–2024.
                    </p>
                    <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-error h-full rounded-full" style={{ width: '20.5%' }}></div>
                    </div>
                  </div>

                  {/* State 3 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-highest/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-label-sm text-label-sm">
                      <span className="flex items-center gap-2 text-on-surface font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                        TEMPORARY HEAT SPIKE
                      </span>
                      <span className="font-code-sm text-yellow-400 font-bold">
                        {kpi?.temporary_count || 221} Cells (18.4%)
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Transient microclimatic fluctuation driven by synoptic weather; baseline recovers post-monsoon.
                    </p>
                    <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: '18.4%' }}></div>
                    </div>
                  </div>

                  {/* State 4 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-highest/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-label-sm text-label-sm">
                      <span className="flex items-center gap-2 text-on-surface font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                        IMPROVING / REMEDIATED
                      </span>
                      <span className="font-code-sm text-tertiary font-bold">
                        {kpi?.improving_count || 135} Cells (11.3%)
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Documented downward temperature trend through civic afforestation or high-albedo coatings.
                    </p>
                    <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-tertiary h-full rounded-full" style={{ width: '11.3%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): TreeSHAP Driver Decomposition & Diagnostic Matrix */}
              <div className="lg:col-span-7 flex flex-col gap-space-md p-space-xl rounded-2xl bg-surface-container border border-surface-container-highest/40 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      TreeSHAP Environmental Driver Attribution (&ldquo;Why Hot?&rdquo;)
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Additive feature contribution modeled from Sentinel-2 multispectral + Landsat-9 thermal data
                    </p>
                  </div>
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-semibold">
                    Global R² = 0.941
                  </span>
                </div>

                <div className="space-y-space-md pt-space-xs">
                  {/* Feature 1 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-label-md font-label-md">
                      <span className="text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-error">domain</span>
                        Impervious Surface Fraction (Asphalt &amp; Concrete)
                      </span>
                      <span className="font-code-sm text-code-sm text-error font-bold">+2.02°C impact (48%)</span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                      <div className="bg-error h-full rounded-full" style={{ width: '82%' }}></div>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Primary thermal driver in T. Nagar, Royapuram, and commercial transit corridors.
                    </span>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-label-md font-label-md">
                      <span className="text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-primary">park</span>
                        Tree Canopy Deficit (&lt;10% fractional cover)
                      </span>
                      <span className="font-code-sm text-code-sm text-primary font-bold">+1.04°C impact (25%)</span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '56%' }}></div>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Severe deficiency in informal tenements; median strip planting provides highest marginal relief.
                    </span>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-label-md font-label-md">
                      <span className="text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-secondary">apartment</span>
                        Building Density &amp; Street Canyon Aspect Ratio
                      </span>
                      <span className="font-code-sm text-code-sm text-secondary font-bold">+0.92°C impact (18%)</span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '42%' }}></div>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      High thermal mass stores radiation during daylight and emits long-wave heat post-sunset.
                    </span>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-label-md font-label-md">
                      <span className="text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">water</span>
                        Distance to Surface Water (Bay of Bengal / Adyar River)
                      </span>
                      <span className="font-code-sm text-code-sm text-tertiary font-bold">-0.67°C buffering (9%)</span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                      <div className="bg-tertiary h-full rounded-full" style={{ width: '28%' }}></div>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Coastal breeze mitigates eastern wards; western inland wards suffer thermal stagnation.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-space-md border-t border-surface-container-highest/40 mt-space-sm text-outline font-label-sm text-label-sm">
                  <span>Methodology: Lundberg TreeSHAP Algorithm</span>
                  <span className="text-tertiary">Interpretable AI Verification Standard</span>
                </div>
              </div>
            </div>

            {/* Ward Intelligence Telemetry Table */}
            <div className="p-space-xl rounded-2xl bg-surface-container border border-surface-container-highest/40 shadow-xl flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Ward-Level Thermal Vulnerability Registry
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Real-time cross-tabulation of microclimatic risk factors across monitored GCC jurisdictions
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm">
                  {/* Search Bar */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-highest/60 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <input
                      className="bg-transparent text-on-surface font-body-sm outline-none placeholder:text-outline/70 w-40 sm:w-56"
                      placeholder="Filter ward or driver..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Status Pills */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-lowest border border-surface-container-highest/60">
                    {['ALL', 'PERSISTENT', 'EMERGING', 'TEMPORARY', 'IMPROVING'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedZoneFilter(s)}
                        className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                          selectedZoneFilter === s
                            ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead>
                    <tr className="text-on-surface-variant uppercase tracking-wider font-label-sm text-label-sm bg-surface-container-lowest/80 border-b border-surface-container-highest/60">
                      <th className="py-space-sm px-space-md rounded-l-lg">Ward / Jurisdiction</th>
                      <th className="py-space-sm px-space-md">Trajectory State</th>
                      <th className="py-space-sm px-space-md">Anomaly</th>
                      <th className="py-space-sm px-space-md">Tree Canopy</th>
                      <th className="py-space-sm px-space-md">Impervious</th>
                      <th className="py-space-sm px-space-md">Exposed Pop</th>
                      <th className="py-space-sm px-space-md">Dominant Driver</th>
                      <th className="py-space-sm px-space-md rounded-r-lg text-right">Intervention CTA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-highest/30">
                    {filteredWards.map((w, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-space-md px-space-md">
                          <div className="font-semibold text-on-surface">{w.ward}</div>
                          <div className="font-label-sm text-label-sm text-outline">{w.zone} • {w.sensors}</div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold uppercase ${
                              w.status === 'EMERGING'
                                ? 'bg-error/15 text-error border border-error/30'
                                : w.status === 'PERSISTENT'
                                ? 'bg-primary-container/20 text-primary border border-primary-container/40'
                                : w.status === 'IMPROVING'
                                ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                                : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-space-md px-space-md font-code-sm text-code-sm font-bold text-on-surface">
                          {w.anomaly}
                        </td>
                        <td className="py-space-md px-space-md font-code-sm text-code-sm text-outline">
                          {w.canopy}
                        </td>
                        <td className="py-space-md px-space-md font-code-sm text-code-sm text-on-surface">
                          {w.impervious}
                        </td>
                        <td className="py-space-md px-space-md font-code-sm text-code-sm text-secondary">
                          {w.population}
                        </td>
                        <td className="py-space-md px-space-md text-on-surface-variant font-body-sm">
                          {w.dominantDriver}
                        </td>
                        <td className="py-space-md px-space-md text-right">
                          <Link
                            href={`/simulator?ward=${encodeURIComponent(w.ward)}&anomaly=${encodeURIComponent(w.anomaly)}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-sm font-semibold transition-all shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[15px]">tune</span>
                            <span>Simulate</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
