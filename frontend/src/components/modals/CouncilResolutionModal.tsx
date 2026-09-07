'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { CouncilResolutionResponse } from '@/lib/types';

interface CouncilResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetInr?: number;
}

export const CouncilResolutionModal: React.FC<CouncilResolutionModalProps> = ({
  isOpen,
  onClose,
  budgetInr = 500000000.0,
}) => {
  const [resolution, setResolution] = useState<CouncilResolutionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiClient
        .getCouncilResolution(budgetInr)
        .then((res) => setResolution(res))
        .catch((err) => console.error('Failed to load council resolution:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, budgetInr]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-gray-200 font-mono">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-[#121212] border-b border-[#242424] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400 font-bold">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                <span>GREATER CHENNAI CORPORATION</span>
                <span className="text-gray-500">•</span>
                <span className="text-amber-400">OFFICIAL RESOLUTION DOCKET</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Municipal Council Ordinary Session • Ripon Building, Chennai - 600003
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#282828] border border-[#383838] text-gray-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#181818] hover:bg-[#252525] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500">
              <span className="inline-block w-4 h-4 rounded-full bg-amber-400 animate-ping mr-2"></span>
              Generating official legislative docket and tender allocation sheet...
            </div>
          ) : resolution ? (
            <div className="space-y-6">
              {/* Document Masthead */}
              <div className="border-b border-[#262626] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-bold text-white tracking-tight">
                    {resolution.session_title}
                  </div>
                  <div className="text-gray-400 mt-1">
                    Tabled by: <span className="text-white font-semibold">{resolution.tabled_by}</span>
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    Statutory Framework: {resolution.statutory_mandate}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold inline-block">
                    {resolution.resolution_id}
                  </div>
                  <div className="text-gray-500 text-[11px] mt-1">{resolution.date}</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-bold mb-1.5">
                  1. Executive Preamble &amp; Sanction
                </span>
                <p className="bg-[#121212] p-4 rounded-xl border border-[#222222] text-gray-300 leading-relaxed">
                  {resolution.executive_summary}
                </p>
              </div>

              {/* Approved Capital Allocations Table */}
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-bold mb-2">
                  2. Approved Multi-Tier Capital Expenditures (Total: ₹{(resolution.total_budget_inr / 10000000).toFixed(2)} Crore)
                </span>
                <table className="w-full text-left border border-[#262626] rounded-xl overflow-hidden">
                  <thead className="bg-[#141414] text-gray-400 border-b border-[#262626]">
                    <tr>
                      <th className="p-3">Intervention Package</th>
                      <th className="p-3">Outlay (INR)</th>
                      <th className="p-3">Physical Target</th>
                      <th className="p-3">Citizens Protected</th>
                      <th className="p-3">Thermal Cooling Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {resolution.approved_interventions.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#121212] transition-colors">
                        <td className="p-3 font-bold text-white">{item.intervention}</td>
                        <td className="p-3 text-amber-400 font-bold">₹{(item.allocation_inr / 10000000).toFixed(2)} Cr</td>
                        <td className="p-3 text-gray-300 text-[11px]">{item.target_coverage}</td>
                        <td className="p-3 text-cyan-400 font-bold">{item.beneficiaries.toLocaleString()}</td>
                        <td className="p-3 text-emerald-400">{item.cooling_yield}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statutory Ratifications */}
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-bold mb-2">
                  3. Operational Mandates &amp; GRAP Enforcement Clauses
                </span>
                <div className="space-y-1.5">
                  {resolution.compliance_ratification.map((clause, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#121212] border border-[#222222] flex items-center gap-2 text-gray-300">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
                      <span>{clause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Signature & Verification Block */}
              <div className="border-t border-[#262626] pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-xl border">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Cryptographic Authentication</div>
                  <div className="text-gray-400 text-[11px] font-mono mt-0.5">
                    Hash: <span className="text-cyan-400">{resolution.digital_signature_stamp.hash}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    <span>Tamil Nadu State Digital Certification Authority Verified</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white">
                    {resolution.digital_signature_stamp.signatory}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {resolution.digital_signature_stamp.designation}
                  </div>
                  <div className="text-[10px] text-gray-500">{resolution.municipal_seat}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
