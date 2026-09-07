'use client';

import React from 'react';
import { CellExplain } from '@/lib/types';

interface WhyNowCardProps {
  explain: CellExplain | null;
  loading: boolean;
}

export const WhyNowCard: React.FC<WhyNowCardProps> = ({ explain, loading }) => {
  if (loading) {
    return (
      <div className="bg-panel border border-borderPrimary p-3 animate-pulse text-xs text-slate-400">
        Analyzing PELT change-point and temporal drift...
      </div>
    );
  }

  if (!explain?.why_now) return null;

  const {
    regime_shift_detected,
    regime_shift_estimated_date,
    ndvi_drift,
    lst_drift_celsius,
    spatial_anomaly_drift_celsius,
    diagnosis,
  } = explain.why_now;

  return (
    <div className="bg-panel border border-borderPrimary p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-borderPrimary pb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-accent">
          Why Now? // Temporal Drift & Shifts
        </span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 ${
            regime_shift_detected ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {regime_shift_detected ? 'REGIME SHIFT DETECTED' : 'STABLE REGIME'}
        </span>
      </div>

      <div className="text-xs font-mono text-slate-200 bg-panelSubtle p-2 border border-borderPrimary">
        Diagnosis: <span className="text-accent font-semibold">{diagnosis}</span>
        {regime_shift_estimated_date && (
          <div className="text-[10px] text-slate-400 mt-1">
            Structural change-point: {new Date(regime_shift_estimated_date).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="bg-panelSubtle p-1.5 border border-borderPrimary">
          <div className="text-slate-400">NDVI Drift</div>
          <div className={`font-mono text-xs font-bold mt-0.5 ${ndvi_drift < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {ndvi_drift > 0 ? `+${ndvi_drift}` : ndvi_drift}
          </div>
        </div>

        <div className="bg-panelSubtle p-1.5 border border-borderPrimary">
          <div className="text-slate-400">LST Drift</div>
          <div className={`font-mono text-xs font-bold mt-0.5 ${lst_drift_celsius > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {lst_drift_celsius > 0 ? `+${lst_drift_celsius}°C` : `${lst_drift_celsius}°C`}
          </div>
        </div>

        <div className="bg-panelSubtle p-1.5 border border-borderPrimary">
          <div className="text-slate-400">Spatial Drift</div>
          <div className={`font-mono text-xs font-bold mt-0.5 ${spatial_anomaly_drift_celsius > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
            {spatial_anomaly_drift_celsius > 0 ? `+${spatial_anomaly_drift_celsius}°C` : `${spatial_anomaly_drift_celsius}°C`}
          </div>
        </div>
      </div>
    </div>
  );
};
