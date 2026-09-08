'use client';

import React from 'react';
import { useTelemetrySocket } from '@/lib/use-telemetry-socket';

export const LiveTelemetryTicker: React.FC = () => {
  const { isConnected, latestTick, activeAlert, dismissAlert, triggerSpike } = useTelemetrySocket();

  return (
    <div className="w-full bg-[#080808] border-b border-[#1f1f1f] text-xs font-mono select-none">
      {/* Emergency Spike Alert Banner */}
      {activeAlert && (
        <div className="w-full bg-red-950/90 border-b border-red-700/80 px-4 py-2 text-red-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-[18px]">warning</span>
            <span className="font-bold uppercase tracking-wide">EMERGENCY THERMAL SPIKE BROADCAST:</span>
            <span>{activeAlert.message}</span>
          </div>
          <button
            onClick={dismissAlert}
            className="px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-white text-[10px] font-bold cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Real-Time Ticker Strip */}
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 whitespace-nowrap">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              {isConnected ? 'IoT Telemetry Live' : 'Reconnecting...'}
            </span>
          </div>

          <span className="text-gray-600">|</span>

          {/* Active Sensor Reading */}
          {latestTick && (
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-gray-500 text-[10px]">{latestTick.node_id}</span>
              <span className="font-bold text-white">{latestTick.corridor}:</span>
              <span className="text-amber-400 font-bold">{latestTick.ambient_temp_c}°C</span>
              <span className="text-gray-500 text-[11px]">(Apparent: {latestTick.apparent_heat_index_c}°C)</span>
              <span className="text-cyan-400 text-[10px]">RH {latestTick.relative_humidity}%</span>
              <span className="text-[10px] text-gray-500">[{latestTick.network_latency_ms}ms]</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => triggerSpike('T. Nagar Usman Road', 44.8, '117')}
            className="px-2 py-0.5 rounded bg-[#161616] hover:bg-red-950/40 border border-[#2b2b2b] hover:border-red-600/50 text-[10px] text-gray-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Broadcast simulated heat spike over WebSocket to all clients"
          >
            <span className="material-symbols-outlined text-[12px] text-red-400">bolt</span>
            <span>Test Spike Broadcast</span>
          </button>
        </div>
      </div>
    </div>
  );
};
