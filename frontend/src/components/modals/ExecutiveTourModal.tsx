'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ExecutiveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveTourModal: React.FC<ExecutiveTourModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      step: 1,
      badge: 'PROBLEM & SENSING MESH',
      title: 'The Challenge: Tropical Microclimate Crisis in Chennai',
      description:
        'Greater Chennai Corporation faces intense urban heat exacerbated by high coastal relative humidity (60%–80%). HeatScape deploys a 100m x 100m analytical grid (EPSG:32644) paired with 842 real-time LoRaWAN IN865 IoT sensors computing the Steadman Apparent Heat Index.',
      keyMetrics: [
        { label: 'Analytical Resolution', val: '100m² Cells (1.0 Ha)' },
        { label: 'IoT Sensor Mesh', val: '842 Live Nodes' },
        { label: 'Apparent Heat Spike', val: '> 46.0°C Trigger' },
        { label: 'Target Authority', val: 'GCC Standing Committee' },
      ],
      recommendedRoute: '/',
      routeLabel: 'Explore Command Center',
      icon: 'grid_view',
      colorHex: '#3B82F6',
    },
    {
      step: 2,
      badge: 'STATISTICAL DIAGNOSTICS',
      title: 'Trajectory Classification: Separating Climate from Microclimate',
      description:
        'Raw satellite thermal observations conflate regional weather swings with localized urbanization. HeatScape decouples seasonal signals using Queen-contiguous spatial anomaly math, Sen’s slope monotonic trend detection, and PELT structural regime shift segmentation.',
      keyMetrics: [
        { label: 'Trend Estimator', val: "Non-Parametric Sen's Slope" },
        { label: 'Change-Point Detection', val: 'PELT (BIC Penalty γ=2ln n)' },
        { label: 'State Machine', val: '5 Calibrated Regimes' },
        { label: 'Hotspot States', val: 'PERSISTENT vs EMERGING' },
      ],
      recommendedRoute: '/explorer',
      routeLabel: 'Inspect 3D Trajectories Map',
      icon: 'timeline',
      colorHex: '#F59E0B',
    },
    {
      step: 3,
      badge: 'EXPLAINABLE AI',
      title: 'TreeSHAP Attribution: "Why Hot?" and "Why Now?"',
      description:
        'Decision-makers require institutional explainability. HeatScape uses TreeSHAP feature attributions to quantify localized biophysical drivers (impervious surface, building volume, tree canopy deficit) and temporal drift to explain abrupt changes.',
      keyMetrics: [
        { label: 'Local Explainability', val: 'TreeSHAP Additive Attribution' },
        { label: 'Temporal Drift', val: 'Feature Shift Decomposition' },
        { label: 'Top Urban Driver', val: 'Impervious Cover (SHAP +0.82)' },
        { label: 'Cooling Counterweight', val: 'Canopy Deficit (SHAP +0.48)' },
      ],
      recommendedRoute: '/multiview',
      routeLabel: 'Open Multi-View Inspector',
      icon: 'psychology',
      colorHex: '#8B5CF6',
    },
    {
      step: 4,
      badge: 'SPATIAL EQUITY',
      title: 'Hotspot Clustering (Getis-Ord Gi*) & Vulnerability Weights',
      description:
        'Capital investments must address climatic justice. HeatScape runs Getis-Ord Gi* spatial autocorrelation with False Discovery Rate (FDR) correction, prioritizing areas with high child/elderly densities and informal settlement ratios.',
      keyMetrics: [
        { label: 'Spatial Autocorrelation', val: 'Getis-Ord Gi* (Z ≥ 1.645σ)' },
        { label: 'Significance Threshold', val: 'p < 0.10 (90%+ Confidence)' },
        { label: 'Equity Multiplier', val: 'SEVI Vulnerability Weight' },
        { label: 'Contiguity Priority', val: 'Cluster Aggregation Bonus' },
      ],
      recommendedRoute: '/intelligence',
      routeLabel: 'View Urban Intelligence & Equity',
      icon: 'hub',
      colorHex: '#EC4899',
    },
    {
      step: 5,
      badge: 'PRESCRIPTIVE OPTIMIZATION',
      title: 'OR-Tools MILP Solver & Tamil Nadu PWD 2024 SSR Tender BOQ',
      description:
        'Translates diagnostic heat maps directly into bankable municipal tenders. Google OR-Tools solves Mixed-Integer Linear Programs allocating Cool Roofs, Urban Canopy, and Cool Pavements under budget caps, directly outputting official Tamil Nadu PWD 2024 Schedule of Rates line items.',
      keyMetrics: [
        { label: 'Mathematical Solver', val: 'Google OR-Tools (SCIP MILP)' },
        { label: 'Statutory Rates', val: 'TN PWD 2024 SSR' },
        { label: 'Scenario Stacking', val: 'Nature vs Albedo Trade-Offs' },
        { label: 'Tender Generation', val: '1-Click BOQ & Council Brief' },
      ],
      recommendedRoute: '/simulator',
      routeLabel: 'Launch Scenario Simulator',
      icon: 'calculate',
      colorHex: '#10B981',
    },
    {
      step: 6,
      badge: 'OPERATIONAL RESILIENCE',
      title: 'EOC Graded Action Plan (GRAP) & Citizen Shaded Navigation',
      description:
        'When extreme heat strikes, HeatScape transitions from capital planner into operational crisis manager. It coordinates GCC GRAP emergency protocols, mechanical misting cannon routes, cooling shelters, and citizen shaded pedestrian routing with -3.2°C thermal relief.',
      keyMetrics: [
        { label: 'Crisis Protocol', val: 'GCC GRAP Stage 2 Active' },
        { label: 'Statutory Mandate', val: 'Outdoor Labor Ban (12-3 PM)' },
        { label: 'Fleet Dispatch', val: '8 Misting Cannon Trucks' },
        { label: 'Citizen Navigation', val: 'A* Shaded Walking Route' },
      ],
      recommendedRoute: '/eoc',
      routeLabel: 'Enter EOC Crisis Command',
      icon: 'emergency',
      colorHex: '#EF4444',
    },
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-lg p-4 animate-in fade-in duration-200">
      <div className="bg-[#080808] border border-[#2a2a2a] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-5 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold shadow-md"
              style={{ backgroundColor: current.colorHex }}
            >
              <span className="material-symbols-outlined text-[24px] text-white">
                {current.icon}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1a1a1a] text-gray-300 border border-[#333333]">
                  HACKATHON DEMO TOUR • STEP {current.step} OF {steps.length}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{ backgroundColor: `${current.colorHex}22`, color: current.colorHex }}
                >
                  {current.badge}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5 tracking-tight">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-6 h-1 bg-[#161616]">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`h-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-primary-container' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          <p className="text-sm text-gray-300 leading-relaxed font-normal">
            {current.description}
          </p>

          {/* Key Metrics Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {current.keyMetrics.map((km, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-gray-400 block">{km.label}</span>
                <span className="text-sm font-bold text-white font-mono mt-1.5">{km.val}</span>
              </div>
            ))}
          </div>

          {/* Quick Route Link */}
          <div className="p-4 rounded-xl bg-[#0e0e0e] border border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">near_me</span>
              <span className="text-xs text-gray-300 font-mono">
                Inspect Live in Production:
              </span>
            </div>
            <Link
              href={current.recommendedRoute}
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-primary-container hover:text-black font-mono text-xs font-bold text-white transition-all flex items-center gap-1.5"
            >
              <span>{current.routeLabel}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-[#111111] border-t border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                currentStep === 0
                  ? 'bg-[#181818] text-gray-600 cursor-not-allowed'
                  : 'bg-[#222222] text-white hover:bg-[#2c2c2c] cursor-pointer'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                currentStep === steps.length - 1
                  ? 'bg-[#181818] text-gray-600 cursor-not-allowed'
                  : 'bg-[#222222] text-white hover:bg-[#2c2c2c] cursor-pointer'
              }`}
            >
              Next Step →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary-container hover:opacity-90 text-on-primary-container font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {currentStep === steps.length - 1 ? 'Finish Tour' : 'Close & Explore'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
