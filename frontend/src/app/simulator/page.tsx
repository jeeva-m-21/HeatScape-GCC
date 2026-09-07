'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BudgetSlider } from '@/components/simulator/BudgetSlider';
import { PortfolioTable } from '@/components/simulator/PortfolioTable';
import { OptimizationResult } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

export default function SimulatorPage() {
  const [budget, setBudget] = useState<number>(5000000); // 50 Lakhs INR default
  const [mode, setMode] = useState<'EXPECTED' | 'CONSERVATIVE'>('EXPECTED');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleRunOptimization = async () => {
    setLoading(true);
    try {
      const res = await apiClient.runOptimization({
        budget_inr: budget,
        mode: mode,
      });
      setResult(res);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas bg-grid-pattern flex flex-col">
      {/* Top Header */}
      <header className="border-b border-borderPrimary bg-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-mono text-slate-400 hover:text-white border border-borderPrimary px-2.5 py-1 transition-colors"
          >
            ← Map Explorer
          </Link>
          <div>
            <h1 className="font-mono text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-accent inline-block" />
              HEAT RESILIENCE INTERVENTION PLANNER // GCC
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Mixed-Integer Linear Programming Portfolio Solver (Google OR-Tools SCIP)
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          Target Extent: <span className="text-slate-200">1,200 High-Priority Grid Units</span>
        </div>
      </header>

      {/* Simulator Split Content */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Controls Pane */}
        <div className="space-y-4">
          <BudgetSlider
            budget={budget}
            onChange={setBudget}
            mode={mode}
            onModeChange={setMode}
            onRunOptimization={handleRunOptimization}
            loading={loading}
          />

          {/* KPI Output Strip */}
          {result && (
            <div className="bg-panel border border-borderPrimary p-4 space-y-3">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Solution Performance Metrics
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-panelSubtle p-2 border border-borderPrimary">
                  <span className="text-[10px] text-slate-400">Capital Utilized</span>
                  <div className="text-base font-mono font-bold text-accent mt-0.5">
                    ₹{result.total_cost_inr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-panelSubtle p-2 border border-borderPrimary">
                  <span className="text-[10px] text-slate-400">Population Protected</span>
                  <div className="text-base font-mono font-bold text-slate-100 mt-0.5">
                    {result.population_protected.toLocaleString()}
                  </div>
                </div>

                <div className="bg-panelSubtle p-2 border border-borderPrimary col-span-2">
                  <span className="text-[10px] text-slate-400">Cumulative Risk Reduction Score</span>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                    {result.total_risk_reduction_score.toLocaleString()} points
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Results Table Pane */}
        <div className="lg:col-span-2 space-y-4">
          <PortfolioTable
            portfolio={result?.portfolio ?? []}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}
