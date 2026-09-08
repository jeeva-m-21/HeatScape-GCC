'use client';

import React from 'react';

interface Props {
  onOpenSensorModal?: () => void;
}

export const TelemetryActivityStrip: React.FC<Props> = ({ onOpenSensorModal }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#101214] border border-white/10 text-xs font-mono">
      {/* Left: Sensor Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#43D6B5]" />
          <span className="font-semibold text-[#F3F4F6]">842 IoT Nodes Active</span>
        </div>
        <span className="text-[#5F666D]">•</span>
        <span className="text-[#8B9299]">97.4% Online</span>
        <span className="text-[#5F666D]">•</span>
        <span className="text-[#5F666D]">Sync: 42s ago</span>
      </div>

      {/* Middle: Command Center Technical Metadata */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] text-[#5F666D]">
        <span>
          MODEL <strong className="text-[#8B9299]">Thermal Risk v2.4</strong>
        </span>
        <span>
          DATA <strong className="text-[#8B9299]">Sentinel-2 + Google APIs</strong>
        </span>
        <span>
          COVERAGE <strong className="text-[#8B9299]">200 Wards (GCC)</strong>
        </span>
        <span>
          CONFIDENCE <strong className="text-[#43D6B5]">94.2%</strong>
        </span>
      </div>

      {/* Right: Telemetry inspection button */}
      {onOpenSensorModal && (
        <button
          onClick={onOpenSensorModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141719] hover:bg-white/10 border border-white/10 text-[#8B9299] hover:text-[#F3F4F6] transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">sensors</span>
          <span>Open Telemetry Console</span>
        </button>
      )}
    </div>
  );
};
