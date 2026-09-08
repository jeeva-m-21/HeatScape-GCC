'use client';

import React from 'react';

export const SurfaceTempMetric: React.FC<{
  anomaly?: string;
  baseline?: string;
  trend?: string;
}> = ({ anomaly = '+2.8°C', baseline = '33.2°C', trend = '+0.03°C/mo' }) => {
  // 24-hour micro-sparkline data points
  const points = [14, 18, 16, 22, 28, 34, 39, 42, 45, 41, 36, 31, 28, 25, 29, 35, 40, 44, 46, 42, 38, 32, 26, 24];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 140;
      const y = 32 - ((p - min) / (max - min)) * 26;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col p-4 rounded-xl bg-[#101214] border border-white/10 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between text-xs font-mono uppercase text-[#8B9299]">
        <span>SURFACE TEMPERATURE</span>
        <span className="text-[#FF6B45] font-bold">{trend}</span>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-3xl font-bold tracking-tight text-[#F3F4F6]">{anomaly}</span>
          <span className="font-mono text-xs text-[#5F666D]">vs {baseline} base</span>
        </div>

        {/* 24h Trend Sparkline */}
        <div className="w-[140px] h-[32px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 140 32">
            <path d={pathD} fill="none" stroke="#F28B62" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 font-mono text-[11px] text-[#5F666D]">
        <span>24h Diurnal Peak: 14:30 IST</span>
        <span className="text-[#F28B62]">LST Delta</span>
      </div>
    </div>
  );
};

export const VulnerabilityMetric: React.FC<{
  pocketsCount?: number;
  wardsCount?: number;
  criticalPct?: number;
}> = ({ pocketsCount = 52, wardsCount = 14, criticalPct = 38 }) => {
  return (
    <div className="flex flex-col p-4 rounded-xl bg-[#101214] border border-white/10 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between text-xs font-mono uppercase text-[#8B9299]">
        <span>VULNERABILITY POCKETS</span>
        <span className="text-[#FF453A] font-bold">CRITICAL</span>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-3xl font-bold tracking-tight text-[#F3F4F6]">{pocketsCount}</span>
          <span className="font-mono text-xs text-[#5F666D]">{wardsCount} wards affected</span>
        </div>

        {/* Multi-segment Heat Risk Distribution Bar */}
        <div className="flex items-center gap-1 w-[130px] h-3">
          <div className="h-full rounded-sm bg-[#FF453A]" style={{ width: '42%' }} title="Critical (42%)" />
          <div className="h-full rounded-sm bg-[#F28B62]" style={{ width: '38%' }} title="High Thermal (38%)" />
          <div className="h-full rounded-sm bg-[#8B9299]/30" style={{ width: '20%' }} title="Moderate (20%)" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 font-mono text-[11px] text-[#5F666D]">
        <span>High Exposure Density</span>
        <span className="text-[#FF453A]">{criticalPct}% Severe</span>
      </div>
    </div>
  );
};

export const CapitalDeploymentMetric: React.FC<{
  amountLakhs?: string;
  projectedRoi?: string;
  allocatedPct?: number;
}> = ({ amountLakhs = '₹75L', projectedRoi = '84% Projected ROI', allocatedPct = 68 }) => {
  return (
    <div className="flex flex-col p-4 rounded-xl bg-[#101214] border border-white/10 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between text-xs font-mono uppercase text-[#8B9299]">
        <span>CAPITAL DEPLOYMENT</span>
        <span className="text-[#43D6B5] font-bold">ACTIVE ALLOCATION</span>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-3xl font-bold tracking-tight text-[#F3F4F6]">{amountLakhs}</span>
          <span className="font-mono text-xs text-[#43D6B5]">{projectedRoi}</span>
        </div>

        {/* Segmented Allocation Composition */}
        <div className="flex items-center gap-1 w-[130px]">
          <div className="h-2 rounded-sm bg-[#43D6B5]" style={{ width: '45%' }} title="Miyawaki Canopy: 45%" />
          <div className="h-2 rounded-sm bg-[#F28B62]" style={{ width: '35%' }} title="Cool Roofs: 35%" />
          <div className="h-2 rounded-sm bg-[#8B9299]" style={{ width: '20%' }} title="Permeable Pavers: 20%" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 font-mono text-[11px] text-[#5F666D]">
        <span>Tamil Nadu PWD SSR Budget</span>
        <span className="text-[#8B9299]">{allocatedPct}% Committed</span>
      </div>
    </div>
  );
};
