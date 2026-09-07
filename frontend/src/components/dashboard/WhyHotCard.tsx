'use client';

import React from 'react';
import { CellExplain } from '@/lib/types';

interface WhyHotCardProps {
  explain: CellExplain | null;
  loading: boolean;
}

export const WhyHotCard: React.FC<WhyHotCardProps> = ({ explain, loading }) => {
  if (loading) {
    return (
      <div className="bg-panel border border-borderPrimary p-3 animate-pulse text-xs text-slate-400">
        Calculating TreeSHAP physical drivers...
      </div>
    );
  }

  if (!explain?.why_hot) return null;

  const { base_value_celsius, predicted_lst_celsius, shap_values, primary_driver } = explain.why_hot;

  const featureLabels: Record<string, string> = {
    impervious_fraction: "Impervious Pavement",
    building_density: "Structural Density",
    tree_canopy_fraction: "Canopy Deficit",
    water_distance_m: "Distance from Coast/River",
    elevation_m: "Topographic Elevation",
  };

  return (
    <div className="bg-panel border border-borderPrimary p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-borderPrimary pb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-accent">
          Why Hot? // TreeSHAP Attribution
        </span>
        <span className="text-[11px] font-mono text-slate-300">
          Pred: {predicted_lst_celsius}°C (Base {base_value_celsius}°C)
        </span>
      </div>

      <div className="text-[11px] text-slate-400">
        Primary Driver: <span className="font-mono text-slate-200 font-semibold">{featureLabels[primary_driver] || primary_driver}</span>
      </div>

      <div className="space-y-2">
        {shap_values.map((item, idx) => {
          const isPositive = item.contribution_celsius >= 0;
          const pct = Math.min(100, Math.abs(item.contribution_celsius) * 25);

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{featureLabels[item.feature] || item.feature}</span>
                <span className={`font-mono font-medium ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isPositive ? `+${item.contribution_celsius}°C` : `${item.contribution_celsius}°C`}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
                <div
                  className={`h-full ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
