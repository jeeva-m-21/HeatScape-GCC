'use client';

import React from 'react';
import { KpiSummary } from '@/lib/types';

interface KpiOverviewProps {
  kpi: KpiSummary | null;
  loading: boolean;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({ kpi, loading }) => {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
        Executive Citywide KPIs
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Emerging Hotspots */}
        <div className="bg-panel border border-borderPrimary p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Emerging Hotspots</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-red-500 mt-1">
            {loading ? '...' : kpi?.emerging_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Accelerating trend</div>
        </div>

        {/* Persistent Hotspots */}
        <div className="bg-panel border border-borderPrimary p-3">
          <span className="text-xs text-slate-400">Persistent Traps</span>
          <div className="text-xl font-bold font-mono text-orange-500 mt-1">
            {loading ? '...' : kpi?.persistent_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Chronic &gt;+1.8°C</div>
        </div>

        {/* Exposed Population */}
        <div className="bg-panel border border-borderPrimary p-3">
          <span className="text-xs text-slate-400">Exposed Population</span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">
            {loading ? '...' : (kpi?.exposed_population ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">In severe cells</div>
        </div>

        {/* Improving Cells */}
        <div className="bg-panel border border-borderPrimary p-3">
          <span className="text-xs text-slate-400">Improving Cells</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {loading ? '...' : kpi?.improving_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cooling trend</div>
        </div>
      </div>
    </div>
  );
};
