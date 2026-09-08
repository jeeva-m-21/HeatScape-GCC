'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface InterventionRankItem {
  id: string;
  rank: number;
  title: string;
  ward: string;
  zone: string;
  cooling: string;
  coolingValue: number; // in Celsius for sorting
  cost: string;
  costValueLakhs: number; // in Lakhs for sorting
  impact: 'HIGH' | 'MEDIUM' | 'MODERATE';
  impactScore: number; // 0 - 100 for sorting
  populationServed: number;
  paybackYears: number;
  specCode: string;
}

const DEFAULT_INTERVENTIONS: InterventionRankItem[] = [
  {
    id: 'int-01',
    rank: 1,
    title: 'Pocket Urban Miyawaki Forest',
    ward: 'Royapuram • Ward 049',
    zone: 'Zone V',
    cooling: '-1.1°C',
    coolingValue: 1.1,
    cost: '₹12L',
    costValueLakhs: 12,
    impact: 'HIGH',
    impactScore: 94,
    populationServed: 18400,
    paybackYears: 2.1,
    specCode: 'PWD-HORT-8104',
  },
  {
    id: 'int-02',
    rank: 2,
    title: 'High-Albedo Cool Roof Coating',
    ward: 'T. Nagar Core • Ward 117',
    zone: 'Zone X',
    cooling: '-0.8°C',
    coolingValue: 0.8,
    cost: '₹8L',
    costValueLakhs: 8,
    impact: 'HIGH',
    impactScore: 89,
    populationServed: 24200,
    paybackYears: 1.8,
    specCode: 'PWD-CIV-4412',
  },
  {
    id: 'int-03',
    rank: 3,
    title: 'High-Albedo Permeable Pavers',
    ward: 'Anna Salai Arterial • Ward 114',
    zone: 'Zone IX',
    cooling: '-0.6°C',
    coolingValue: 0.6,
    cost: '₹6L',
    costValueLakhs: 6,
    impact: 'MEDIUM',
    impactScore: 78,
    populationServed: 14800,
    paybackYears: 2.6,
    specCode: 'PWD-CIV-2915',
  },
  {
    id: 'int-04',
    rank: 4,
    title: 'Micro-Canopy Bus Transit Shelter',
    ward: 'Broadway Transit Hub • Ward 054',
    zone: 'Zone V',
    cooling: '-0.5°C',
    coolingValue: 0.5,
    cost: '₹4.5L',
    costValueLakhs: 4.5,
    impact: 'MEDIUM',
    impactScore: 74,
    populationServed: 31000,
    paybackYears: 1.4,
    specCode: 'PWD-URB-1120',
  },
  {
    id: 'int-05',
    rank: 5,
    title: 'Bioswale Sponge Drainage Sump',
    ward: 'Velachery Bypass • Ward 178',
    zone: 'Zone XIII',
    cooling: '-0.4°C',
    coolingValue: 0.4,
    cost: '₹5.5L',
    costValueLakhs: 5.5,
    impact: 'MODERATE',
    impactScore: 68,
    populationServed: 11200,
    paybackYears: 3.2,
    specCode: 'PWD-ENV-9021',
  },
];

type SortKey = 'impact' | 'cooling' | 'cost' | 'population';

export const InterventionRankPanel: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortKey>('impact');

  const sortedItems = [...DEFAULT_INTERVENTIONS].sort((a, b) => {
    if (sortBy === 'impact') return b.impactScore - a.impactScore;
    if (sortBy === 'cooling') return b.coolingValue - a.coolingValue;
    if (sortBy === 'cost') return a.costValueLakhs - b.costValueLakhs;
    if (sortBy === 'population') return b.populationServed - a.populationServed;
    return 0;
  });

  return (
    <div className="flex flex-col p-4 rounded-xl bg-[#101214] border border-white/10">
      {/* Header with Title & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase text-[#8B9299]">OPERATIONAL RECOMMENDATIONS</span>
          <span className="font-mono text-[10px] text-[#5F666D] px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
            5 RANKED
          </span>
        </div>

        {/* Sort Pill Filter */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-[#8B9299]">
          <span className="text-[#5F666D] mr-1">Sort:</span>
          {(['impact', 'cooling', 'cost', 'population'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              className={`px-2 py-0.5 rounded capitalize transition-colors ${
                sortBy === k
                  ? 'bg-white/10 text-[#F3F4F6] font-semibold'
                  : 'hover:text-[#F3F4F6] hover:bg-white/5'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked List */}
      <div className="divide-y divide-white/5 mt-1">
        {sortedItems.map((item, idx) => (
          <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            {/* Left: Rank & Title & Ward */}
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-[#5F666D] font-bold mt-0.5 w-5">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#F3F4F6] group-hover:text-[#F28B62] transition-colors">
                    {item.title}
                  </span>
                  <span className="font-mono text-[10px] text-[#5F666D] px-1 py-0.2 rounded bg-white/5">
                    {item.specCode}
                  </span>
                </div>
                <span className="font-mono text-xs text-[#8B9299] mt-0.5">{item.ward}</span>
              </div>
            </div>

            {/* Right: Metrics & Action */}
            <div className="flex items-center gap-4 sm:justify-end pl-8 sm:pl-0">
              <div className="flex flex-col text-right">
                <span className="font-mono text-xs font-bold text-[#43D6B5]">{item.cooling}</span>
                <span className="font-mono text-[10px] text-[#5F666D]">Expected</span>
              </div>

              <div className="flex flex-col text-right">
                <span className="font-mono text-xs font-bold text-[#F3F4F6]">{item.cost}</span>
                <span className="font-mono text-[10px] text-[#5F666D]">{item.paybackYears}y payback</span>
              </div>

              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.impact === 'HIGH'
                    ? 'text-[#43D6B5] bg-[#43D6B5]/10 border border-[#43D6B5]/20'
                    : 'text-[#F28B62] bg-[#F28B62]/10 border border-[#F28B62]/20'
                }`}
              >
                {item.impact}
              </span>

              <Link
                href={`/simulator?intervention=${item.id}&ward=${encodeURIComponent(item.ward)}`}
                className="px-2.5 py-1 rounded bg-[#181B1E] hover:bg-white/10 text-xs font-mono text-[#F3F4F6] border border-white/10 transition-colors whitespace-nowrap"
              >
                Simulate
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
