'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface CommandItem {
  id: string;
  category: 'RECENT' | 'INTELLIGENCE' | 'WARD' | 'INTERVENTION';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'thermal' | 'cool' | 'critical' | 'neutral';
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectWard?: (wardName: string) => void;
}

export const CommandSearchModal: React.FC<Props> = ({ isOpen, onClose, onSelectWard }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    // RECENT
    {
      id: 'recent-1',
      category: 'RECENT',
      title: 'Royapuram • Ward 049',
      subtitle: 'Zone V • Persistent Anomaly +4.8°C',
      badge: 'PERSISTENT',
      badgeType: 'critical',
      action: () => {
        onSelectWard?.('Royapuram');
        onClose();
      },
    },
    {
      id: 'recent-2',
      category: 'RECENT',
      title: 'T. Nagar • Ward 117',
      subtitle: 'Zone X • High Density Commercial Core +4.2°C',
      badge: 'PERSISTENT',
      badgeType: 'critical',
      action: () => {
        onSelectWard?.('T. Nagar');
        onClose();
      },
    },
    {
      id: 'recent-3',
      category: 'RECENT',
      title: 'Anna Nagar • Ward 101',
      subtitle: 'Zone VIII • High Canopy Buffer +2.1°C',
      badge: 'IMPROVING',
      badgeType: 'cool',
      action: () => {
        onSelectWard?.('Anna Nagar');
        onClose();
      },
    },
    {
      id: 'recent-4',
      category: 'RECENT',
      title: 'Adyar Estuary • Ward 173',
      subtitle: 'Zone XIII • Marine Cooling Verge +1.2°C',
      badge: 'STABLE',
      badgeType: 'cool',
      action: () => {
        onSelectWard?.('Adyar');
        onClose();
      },
    },

    // INTELLIGENCE
    {
      id: 'intel-1',
      category: 'INTELLIGENCE',
      title: 'Heat Island Clusters',
      subtitle: 'View 126 persistent severe thermal nodes across GCC',
      badge: '126 NODES',
      badgeType: 'critical',
      action: () => {
        router.push('/explorer?state=PERSISTENT');
        onClose();
      },
    },
    {
      id: 'intel-2',
      category: 'INTELLIGENCE',
      title: 'At-Risk Schools & Daycares',
      subtitle: '42 vulnerable educational institutes in >3.5°C anomaly zones',
      badge: '42 SITES',
      badgeType: 'critical',
      action: () => {
        router.push('/multiview?layer=vulnerability');
        onClose();
      },
    },
    {
      id: 'intel-3',
      category: 'INTELLIGENCE',
      title: 'Low-Canopy Severe Deficit Zones',
      subtitle: 'Wards with <5% tree canopy and >85% impervious cover',
      badge: '<5% NDVI',
      badgeType: 'thermal',
      action: () => {
        router.push('/explorer?layer=NDVI+Canopy');
        onClose();
      },
    },
    {
      id: 'intel-4',
      category: 'INTELLIGENCE',
      title: 'Cooling Opportunity Corridors',
      subtitle: 'Pervious pavement and Miyawaki PWD candidate streets',
      badge: 'ACTIONABLE',
      badgeType: 'cool',
      action: () => {
        router.push('/simulator');
        onClose();
      },
    },

    // WARDS
    {
      id: 'ward-114',
      category: 'WARD',
      title: 'Ward 114 • Teynampet South',
      subtitle: 'Zone IX • Emerging Thermal Anomaly +2.8°C • Population 4,180',
      badge: 'EMERGING',
      badgeType: 'thermal',
      action: () => {
        onSelectWard?.('Teynampet');
        onClose();
      },
    },
    {
      id: 'ward-19',
      category: 'WARD',
      title: 'Ward 019 • Manali Industrial',
      subtitle: 'Zone II • Petrochemical Core +5.5°C • 78 Active Pockets',
      badge: 'CRITICAL',
      badgeType: 'critical',
      action: () => {
        onSelectWard?.('Manali');
        onClose();
      },
    },
    {
      id: 'ward-168',
      category: 'WARD',
      title: 'Ward 168 • Guindy Industrial Estate',
      subtitle: 'Zone XIII • Heavy Hardscape +3.6°C • 82 Sensor Nodes',
      badge: 'PERSISTENT',
      badgeType: 'thermal',
      action: () => {
        onSelectWard?.('Guindy');
        onClose();
      },
    },

    // INTERVENTIONS
    {
      id: 'int-1',
      category: 'INTERVENTION',
      title: 'Pocket Urban Miyawaki Forest',
      subtitle: 'Tamil Nadu PWD Schedule • Expected Cooling -1.1°C • Cost ₹12L',
      badge: 'HIGH IMPACT',
      badgeType: 'cool',
      action: () => {
        router.push('/simulator?intervention=miyawaki');
        onClose();
      },
    },
    {
      id: 'int-2',
      category: 'INTERVENTION',
      title: 'High-Albedo Cool Roof Polyurethane',
      subtitle: 'Solar reflectance >0.78 • Expected Cooling -0.8°C • Cost ₹8L',
      badge: 'HIGH ROI',
      badgeType: 'cool',
      action: () => {
        router.push('/simulator?intervention=cool_roof');
        onClose();
      },
    },
    {
      id: 'int-3',
      category: 'INTERVENTION',
      title: 'Permeable Paver Grid & Bioswale',
      subtitle: 'High stormwater infiltration • Expected Cooling -0.5°C • Cost ₹6L',
      badge: 'SPONGE',
      badgeType: 'cool',
      action: () => {
        router.push('/simulator?intervention=pavers');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.subtitle?.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop click */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Command Palette Card */}
      <div className="w-full max-w-2xl rounded-xl bg-[#101214] border border-white/10 shadow-2xl overflow-hidden font-sans text-sm">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#141719]">
          <span className="material-symbols-outlined text-[18px] text-[#8B9299]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search ward, location, sensor or intervention... (Press Esc to close)"
            className="w-full bg-transparent text-[#F3F4F6] placeholder-[#5F666D] outline-none font-medium text-sm"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#181B1E] border border-white/10 font-mono text-[11px] text-[#8B9299]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-[#5F666D] font-mono text-xs">
              No matching locations, sensors or interventions found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-100 ${
                  selectedIndex === idx ? 'bg-[#181B1E] text-[#F3F4F6]' : 'text-[#8B9299] hover:bg-[#141719]'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#F3F4F6]">{cmd.title}</span>
                    <span className="font-mono text-[10px] text-[#5F666D] px-1.5 py-0.2 rounded bg-white/5">
                      {cmd.category}
                    </span>
                  </div>
                  {cmd.subtitle && (
                    <span className="text-xs text-[#8B9299] line-clamp-1">{cmd.subtitle}</span>
                  )}
                </div>

                {cmd.badge && (
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      cmd.badgeType === 'critical'
                        ? 'text-[#FF453A] bg-[#FF453A]/10 border border-[#FF453A]/20'
                        : cmd.badgeType === 'thermal'
                        ? 'text-[#F28B62] bg-[#F28B62]/10 border border-[#F28B62]/20'
                        : cmd.badgeType === 'cool'
                        ? 'text-[#43D6B5] bg-[#43D6B5]/10 border border-[#43D6B5]/20'
                        : 'text-[#8B9299] bg-white/5 border border-white/10'
                    }`}
                  >
                    {cmd.badge}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#090A0B] text-[11px] font-mono text-[#5F666D]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Dismiss</span>
          </div>
          <span>HeatScape Climate Intelligence v2.4</span>
        </div>
      </div>
    </div>
  );
};
