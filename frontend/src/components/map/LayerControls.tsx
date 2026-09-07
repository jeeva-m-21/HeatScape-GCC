'use client';

import React from 'react';

interface LayerControlsProps {
  activeMode: 'state' | 'anomaly' | 'population';
  onModeChange: (mode: 'state' | 'anomaly' | 'population') => void;
  stateFilter: string;
  onStateFilterChange: (state: string) => void;
  minAnomaly: number;
  onMinAnomalyChange: (val: number) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  activeMode,
  onModeChange,
  stateFilter,
  onStateFilterChange,
  minAnomaly,
  onMinAnomalyChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Visualization Mode Switcher */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          Layer Metric
        </label>
        <div className="grid grid-cols-3 gap-1 bg-panel p-1 border border-borderPrimary">
          <button
            onClick={() => onModeChange('state')}
            className={`text-xs py-1.5 font-medium transition-colors ${
              activeMode === 'state'
                ? 'bg-accent text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            State
          </button>
          <button
            onClick={() => onModeChange('anomaly')}
            className={`text-xs py-1.5 font-medium transition-colors ${
              activeMode === 'anomaly'
                ? 'bg-accent text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Anomaly
          </button>
          <button
            onClick={() => onModeChange('population')}
            className={`text-xs py-1.5 font-medium transition-colors ${
              activeMode === 'population'
                ? 'bg-accent text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Population
          </button>
        </div>
      </div>

      {/* State Filter */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          Filter Trajectory State
        </label>
        <select
          value={stateFilter}
          onChange={(e) => onStateFilterChange(e.target.value)}
          className="w-full bg-panel border border-borderPrimary text-slate-200 text-xs p-2 focus:outline-none focus:border-accent"
        >
          <option value="ALL">ALL STATES</option>
          <option value="EMERGING">EMERGING HOTSPOTS</option>
          <option value="PERSISTENT">PERSISTENT TRAPS</option>
          <option value="TEMPORARY">TEMPORARY SPIKES</option>
          <option value="IMPROVING">IMPROVING</option>
          <option value="WATCH">WATCH / VOLATILE</option>
        </select>
      </div>

      {/* Anomaly Cutoff Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Min Anomaly Cutoff</span>
          <span className="font-mono text-accent font-semibold">+{minAnomaly.toFixed(1)}°C</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="4.0"
          step="0.2"
          value={minAnomaly}
          onChange={(e) => onMinAnomalyChange(parseFloat(e.target.value))}
          className="w-full accent-accent bg-slate-800 h-1.5"
        />
      </div>

      {/* Trajectory Color Legend */}
      <div className="bg-panel border border-borderPrimary p-3 space-y-1.5 text-[11px]">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
          Trajectory Classification Legend
        </span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#EF4444] border border-red-300" />
          <span className="text-slate-200">EMERGING // Accelerating Heat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#F97316] border border-orange-300" />
          <span className="text-slate-200">PERSISTENT // Chronic Trap</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#EAB308] border border-yellow-300" />
          <span className="text-slate-200">TEMPORARY // Transient Spike</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#10B981] border border-emerald-300" />
          <span className="text-slate-200">IMPROVING // Sustained Cooling</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#64748B] border border-slate-400" />
          <span className="text-slate-200">WATCH // Volatile / Stable</span>
        </div>
      </div>
    </div>
  );
};
