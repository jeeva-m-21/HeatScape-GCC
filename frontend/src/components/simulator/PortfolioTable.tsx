'use client';

import React from 'react';
import { PortfolioAllocation } from '@/lib/types';

interface PortfolioTableProps {
  portfolio: PortfolioAllocation[];
  loading: boolean;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolio, loading }) => {
  if (loading) {
    return (
      <div className="bg-panel border border-borderPrimary p-8 text-center text-xs text-slate-400 font-mono animate-pulse">
        Formulating Mixed-Integer Program and solving with SCIP...
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="bg-panel border border-borderPrimary p-8 text-center text-xs text-slate-400 font-mono">
        Adjust budget or uncertainty settings and click "Run Portfolio Optimization".
      </div>
    );
  }

  return (
    <div className="bg-panel border border-borderPrimary overflow-hidden">
      <div className="p-3 border-b border-borderPrimary flex justify-between items-center bg-panelSubtle">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-200">
          Optimal Portfolio Allocation Table ({portfolio.length} High-Impact Cells)
        </span>
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "heatscape_portfolio.json");
            dlAnchorElem.click();
          }}
          className="text-xs text-accent hover:underline font-mono"
        >
          [Export JSON]
        </button>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-borderPrimary text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0">
            <tr>
              <th className="p-2.5">Cell ID</th>
              <th className="p-2.5">Ward</th>
              <th className="p-2.5">State</th>
              <th className="p-2.5">Population</th>
              <th className="p-2.5">Interventions Allocated</th>
              <th className="p-2.5 text-right">Cost (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderPrimary font-mono">
            {portfolio.map((row) => (
              <tr key={row.cell_id} className="hover:bg-slate-800/40">
                <td className="p-2.5 font-bold text-slate-200">{row.cell_id}</td>
                <td className="p-2.5 text-slate-400">{row.ward_id || '-'}</td>
                <td className="p-2.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 border ${
                      row.state === 'EMERGING'
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : 'bg-orange-950 text-orange-400 border-orange-800'
                    }`}
                  >
                    {row.state}
                  </span>
                </td>
                <td className="p-2.5 text-slate-300">{row.population.toLocaleString()}</td>
                <td className="p-2.5 text-slate-300">
                  <div className="flex flex-wrap gap-1">
                    {row.interventions.map((it, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-[10px] px-1.5 py-0.5 border border-slate-700 text-slate-200"
                        title={`Cost: ₹${it.cost_inr.toLocaleString()} | Cooling: -${it.cooling_effect_celsius}°C`}
                      >
                        {it.type_id}: {it.quantity} {it.unit_name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-2.5 text-right font-bold text-accent">
                  ₹{row.cell_total_cost_inr.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
