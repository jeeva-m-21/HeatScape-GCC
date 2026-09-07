'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SensorTelemetryResponse } from '@/lib/types';

interface SensorTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensorTelemetryModal: React.FC<SensorTelemetryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sensorData, setSensorData] = useState<SensorTelemetryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSensors = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLiveSensors();
      setSensorData(data);
    } catch (err) {
      console.error('Failed to fetch sensor telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSensors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#080808] border border-[#222222] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-5 bg-[#111111] border-b border-[#222222] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-800/40">
                GCC LIVE IOT SENSOR MESH
              </span>
              <span className="text-gray-400 text-xs font-mono">
                842 Nodes Active • LoRaWAN IN865 • MQTT Stream
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Greater Chennai Urban Heat Island Sensor Telemetry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {loading && !sensorData ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-xs text-gray-400 font-mono">
                Receiving Packet Frames from 842 Gateway Radios...
              </span>
            </div>
          ) : sensorData ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                  <span className="text-[11px] text-gray-400 font-mono">Network Health</span>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5 flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {sensorData.network_status} (99.4%)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                  <span className="text-[11px] text-gray-400 font-mono">Nodes Reporting</span>
                  <div className="font-bold text-white text-sm mt-0.5 font-mono">
                    {sensorData.total_nodes_reporting} / {sensorData.total_nodes_online} Nodes
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                  <span className="text-[11px] text-gray-400 font-mono">Heat Spike Alerts</span>
                  <div className="font-bold text-red-400 text-sm mt-0.5 font-mono">
                    {sensorData.active_heat_alerts} Active Spikes
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                  <span className="text-[11px] text-gray-400 font-mono">Sampling Interval</span>
                  <div className="font-bold text-cyan-400 text-sm mt-0.5 font-mono">
                    Every {sensorData.sampling_frequency_sec}s
                  </div>
                </div>
              </div>

              {/* Nodes Table */}
              <div className="rounded-xl border border-[#222222] overflow-hidden bg-[#0d0d0d]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151515] text-gray-400 uppercase font-mono text-[11px] border-b border-[#222222]">
                    <tr>
                      <th className="p-3">Node ID</th>
                      <th className="p-3">Corridor &amp; Ward</th>
                      <th className="p-3 text-right">Ambient</th>
                      <th className="p-3 text-right">RH</th>
                      <th className="p-3 text-right">Heat Index</th>
                      <th className="p-3 text-right">Status</th>
                      <th className="p-3 text-right">Telemetry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f] text-gray-200 font-mono">
                    {sensorData.corridors.map((n, idx) => (
                      <tr key={idx} className="hover:bg-[#161616] transition-colors">
                        <td className="p-3 text-primary-container font-semibold">{n.node_id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white font-sans">{n.name}</div>
                          <div className="text-[11px] text-gray-400 font-sans">{n.ward} • {n.zone}</div>
                        </td>
                        <td className="p-3 text-right font-bold text-white">
                          {n.ambient_temp_c}°C
                        </td>
                        <td className="p-3 text-right text-gray-300">{n.relative_humidity}%</td>
                        <td className="p-3 text-right font-bold text-red-400">
                          {n.apparent_heat_index_c}°C
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              n.is_spike
                                ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                                : n.status === 'COOL_BUFFER'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : 'bg-[#1f1f1f] text-gray-300'
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-gray-400 text-[11px]">
                          {n.battery_pct}% bat • {n.signal_dbm} dBm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400">No sensor data available</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#111111] border-t border-[#222222] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-white transition-all text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={fetchSensors}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary-container hover:opacity-90 text-on-primary-container font-bold transition-all text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Refresh Stream
          </button>
        </div>
      </div>
    </div>
  );
};
