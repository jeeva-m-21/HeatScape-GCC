'use client';

import React from 'react';

interface BudgetSliderProps {
  budget: number;
  onChange: (val: number) => void;
  mode: 'EXPECTED' | 'CONSERVATIVE';
  onModeChange: (mode: 'EXPECTED' | 'CONSERVATIVE') => void;
  onRunOptimization: () => void;
  loading: boolean;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({
  budget,
  onChange,
  mode,
  onModeChange,
  onRunOptimization,
  loading,
}) => {
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="bg-panel border border-borderPrimary p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-borderPrimary pb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-accent">
          Capital Allocation & Uncertainty
        </span>
        <span className="text-sm font-mono font-bold text-slate-100">
          {formatINR(budget)}
        </span>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>₹10 Lakhs</span>
          <span>₹1.0 Crore</span>
          <span>₹2.5 Crore</span>
        </div>
        <input
          type="range"
          min={1000000}
          max={25000000}
          step={500000}
          value={budget}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-accent bg-slate-800 h-2 cursor-pointer"
        />
      </div>

      {/* Uncertainty Simulation Mode Toggle */}
      <div className="space-y-1.5 pt-2">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          Simulation Uncertainty Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModeChange('EXPECTED')}
            className={`p-2.5 text-left border transition-colors ${
              mode === 'EXPECTED'
                ? 'border-accent bg-accent/10 text-white'
                : 'border-borderPrimary bg-panelSubtle text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-semibold text-xs text-slate-100">EXPECTED MODE</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Mean empirical cooling & average unit cost</div>
          </button>

          <button
            onClick={() => onModeChange('CONSERVATIVE')}
            className={`p-2.5 text-left border transition-colors ${
              mode === 'CONSERVATIVE'
                ? 'border-accent bg-accent/10 text-white'
                : 'border-borderPrimary bg-panelSubtle text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-semibold text-xs text-slate-100">CONSERVATIVE MODE</div>
            <div className="text-[10px] text-slate-400 mt-0.5">P10 lower bound cooling & upper unit cost</div>
          </button>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={loading}
        onClick={onRunOptimization}
        className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-2 shadow-lg"
      >
        {loading ? 'Running OR-Tools SCIP Solver...' : 'Run Portfolio Optimization'}
      </button>
    </div>
  );
};
