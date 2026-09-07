'use client';

import React, { useEffect, useState } from 'react';
import { CellFeatureProperties, CellExplain, CellObservation } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { WhyHotCard } from './WhyHotCard';
import { WhyNowCard } from './WhyNowCard';

interface CellDetailDrawerProps {
  cell: CellFeatureProperties | null;
  onClose: () => void;
}

export const CellDetailDrawer: React.FC<CellDetailDrawerProps> = ({ cell, onClose }) => {
  const [explain, setExplain] = useState<CellExplain | null>(null);
  const [history, setHistory] = useState<CellObservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cell) {
      setExplain(null);
      setHistory([]);
      return;
    }

    setLoading(true);
    Promise.all([
      apiClient.getCellExplain(cell.cell_id).catch(() => null),
      apiClient.getCellHistory(cell.cell_id).catch(() => []),
    ])
      .then(([explainData, historyData]) => {
        setExplain(explainData);
        setHistory(historyData);
      })
      .finally(() => setLoading(false));
  }, [cell]);

  if (!cell) return null;

  const stateColors: Record<string, string> = {
    EMERGING: 'bg-red-950 text-red-400 border-red-800',
    PERSISTENT: 'bg-orange-950 text-orange-400 border-orange-800',
    TEMPORARY: 'bg-yellow-950 text-yellow-400 border-yellow-800',
    IMPROVING: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    WATCH: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-canvas border-l border-borderPrimary z-30 flex flex-col shadow-2xl overflow-hidden">
      {/* Drawer Header */}
      <div className="p-4 border-b border-borderPrimary bg-panel flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-100">{cell.cell_id}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 border font-semibold ${
                stateColors[cell.state] || stateColors.WATCH
              }`}
            >
              {cell.state}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">
            {cell.ward_id || 'GCC Ward'} // {cell.zone_id || 'Chennai Zone'}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Statistical Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-panel border border-borderPrimary p-2.5">
            <span className="text-[11px] text-slate-400">Mean Anomaly</span>
            <div className="text-lg font-bold font-mono text-accent mt-0.5">
              +{cell.mean_anomaly}°C
            </div>
          </div>
          <div className="bg-panel border border-borderPrimary p-2.5">
            <span className="text-[11px] text-slate-400">Sen's Slope</span>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
              {cell.trend_slope > 0 ? `+${cell.trend_slope}` : cell.trend_slope}°/mo
            </div>
          </div>
          <div className="bg-panel border border-borderPrimary p-2.5">
            <span className="text-[11px] text-slate-400">Exposed Population</span>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
              {cell.population.toLocaleString()}
            </div>
          </div>
          <div className="bg-panel border border-borderPrimary p-2.5">
            <span className="text-[11px] text-slate-400">Impervious Fraction</span>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
              {Math.round(cell.impervious_fraction * 100)}%
            </div>
          </div>
        </div>

        {/* Explainability Cards */}
        <WhyHotCard explain={explain} loading={loading} />
        <WhyNowCard explain={explain} loading={loading} />

        {/* 36-Month Timeline Sparkline */}
        <div className="bg-panel border border-borderPrimary p-3 space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-300">
            36-Month Longitudinal History
          </div>
          {history.length > 0 ? (
            <div className="h-24 flex items-end gap-1 pt-2">
              {history.map((h, i) => {
                const anom = h.contextual_anomaly_celsius ?? 0;
                const hPct = Math.min(100, Math.max(10, (anom + 1.0) * 20));
                const isLate = i >= 18;
                return (
                  <div
                    key={i}
                    title={`Month ${i + 1}: ${h.lst_celsius}°C (Anom: ${anom}°C)`}
                    className={`flex-1 ${
                      isLate && cell.state === 'EMERGING'
                        ? 'bg-red-500'
                        : anom >= 1.5
                        ? 'bg-orange-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ height: `${hPct}%` }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              {loading ? 'Fetching historical time-series...' : 'No historical records available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
