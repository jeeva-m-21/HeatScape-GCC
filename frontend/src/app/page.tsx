'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapContainer } from '@/components/map/MapContainer';
import { LayerControls } from '@/components/map/LayerControls';
import { KpiOverview } from '@/components/dashboard/KpiOverview';
import { CellDetailDrawer } from '@/components/dashboard/CellDetailDrawer';
import { GeoJSONFeatureCollection, CellFeatureProperties, KpiSummary } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

export default function HomePage() {
  const [geojsonData, setGeojsonData] = useState<GeoJSONFeatureCollection | null>(null);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<CellFeatureProperties | null>(null);

  // Filters & Controls
  const [activeMode, setActiveMode] = useState<'state' | 'anomaly' | 'population'>('state');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [minAnomaly, setMinAnomaly] = useState<number>(0.0);

  useEffect(() => {
    fetchInitialData();
  }, [stateFilter, minAnomaly]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [cells, kpiData] = await Promise.all([
        apiClient.getCellsGeoJSON({
          state: stateFilter === 'ALL' ? undefined : stateFilter,
          min_anomaly: minAnomaly > 0 ? minAnomaly : undefined,
        }).catch(() => null),
        apiClient.getKpi().catch(() => null),
      ]);

      if (cells) setGeojsonData(cells);
      if (kpiData) setKpi(kpiData);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-canvas">
      {/* Left Sidebar (280px fixed width) */}
      <aside className="w-[300px] h-full bg-canvas border-r border-borderPrimary flex flex-col z-20 overflow-hidden">
        {/* Header Branding */}
        <div className="p-4 border-b border-borderPrimary bg-panel flex items-center justify-between">
          <div>
            <h1 className="font-mono text-sm font-black text-white tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-accent inline-block" />
              HEATSCAPE // GCC
            </h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Chennai Urban Heat Decision Support
            </p>
          </div>

          <Link
            href="/simulator"
            className="text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-borderPrimary px-2 py-1 transition-colors"
          >
            Simulator →
          </Link>
        </div>

        {/* Scrollable Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-grid-pattern">
          {/* Executive KPIs */}
          <KpiOverview kpi={kpi} loading={loading} />

          {/* Layer & Filter Controls */}
          <LayerControls
            activeMode={activeMode}
            onModeChange={setActiveMode}
            stateFilter={stateFilter}
            onStateFilterChange={setStateFilter}
            minAnomaly={minAnomaly}
            onMinAnomalyChange={setMinAnomaly}
          />

          {/* Seed/Pipeline Action Notice */}
          <div className="bg-panel border border-borderPrimary p-3 space-y-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Spatial Resolution
            </span>
            <div className="text-xs text-slate-300">
              ~100m x 100m projected polygons (EPSG:32644). 36-month satellite longitudinal thermal series.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-borderPrimary bg-panel text-[10px] font-mono text-slate-500 flex justify-between items-center">
          <span>Greater Chennai Corp.</span>
          <span className="text-emerald-400">● Live Engine</span>
        </div>
      </aside>

      {/* Center Viewport: Fullscreen WebGL Map */}
      <section className="flex-1 h-full relative">
        <MapContainer
          geojsonData={geojsonData}
          activeMode={activeMode}
          onSelectCell={setSelectedCell}
          selectedCellId={selectedCell?.cell_id}
        />

        {/* Contextual Cell Detail Drawer */}
        <CellDetailDrawer
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      </section>
    </main>
  );
}
