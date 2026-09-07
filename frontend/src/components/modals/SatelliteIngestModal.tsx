'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  SatelliteStatusResponse,
  SatelliteIngestResponse,
  SensorSatelliteCorrelationResponse,
} from '@/lib/types';

interface SatelliteIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SatelliteIngestModal: React.FC<SatelliteIngestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [statusData, setStatusData] = useState<SatelliteStatusResponse | null>(null);
  const [ingestResult, setIngestResult] = useState<SatelliteIngestResponse | null>(null);
  const [correlationData, setCorrelationData] = useState<SensorSatelliteCorrelationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [triggering, setTriggering] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'orbits' | 'ingest' | 'groundtruth'>('orbits');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [st, corr] = await Promise.all([
        apiClient.getSatelliteStatus(),
        apiClient.getSensorsVsSatelliteCorrelation(),
      ]);
      setStatusData(st);
      setCorrelationData(corr);
    } catch (err) {
      console.error('Failed to load satellite status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const handleTriggerOverpass = async () => {
    setTriggering(true);
    try {
      const result = await apiClient.triggerSatelliteOverpass();
      setIngestResult(result);
      setActiveTab('ingest');
    } catch (err) {
      console.error('Failed to trigger overpass:', err);
    } finally {
      setTriggering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#080808] border border-[#222222] rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-5 bg-[#111111] border-b border-[#222222] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-800/40">
                EARTH OBSERVATION STAC INGEST
              </span>
              <span className="text-gray-400 text-xs font-mono">
                Landsat-9 TIRS-2 • Sentinel-2 MSI • UTM 44N
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Satellite Data Pipeline &amp; Radiometric Calibration Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1f1f1f] bg-[#0c0c0c]">
          <button
            onClick={() => setActiveTab('orbits')}
            className={`px-4 py-2 text-xs font-mono font-semibold transition-all border-b-2 ${
              activeTab === 'orbits'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Orbit Constellations &amp; Passes
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            className={`px-4 py-2 text-xs font-mono font-semibold transition-all border-b-2 ${
              activeTab === 'ingest'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Live Ingestion Pipeline {ingestResult && '✓'}
          </button>
          <button
            onClick={() => setActiveTab('groundtruth')}
            className={`px-4 py-2 text-xs font-mono font-semibold transition-all border-b-2 ${
              activeTab === 'groundtruth'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            IoT Sensor Cross-Validation (R² = 0.952)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-xs text-gray-400 font-mono">
                Querying USGS EarthExplorer &amp; Copernicus STAC Hub...
              </span>
            </div>
          ) : (
            <>
              {/* Tab 1: Orbits & Passes */}
              {activeTab === 'orbits' && statusData && (
                <div className="space-y-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                      <span className="text-[11px] text-gray-400 font-mono">STAC Scenes Indexed</span>
                      <div className="font-bold text-white text-base mt-0.5 font-mono">
                        {statusData.total_scenes_indexed} Scenes
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                      <span className="text-[11px] text-gray-400 font-mono">Mean Cloud Cover</span>
                      <div className="font-bold text-emerald-400 text-base mt-0.5 font-mono">
                        {statusData.mean_cloud_cover_pct}% (Clear)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                      <span className="text-[11px] text-gray-400 font-mono">Grid Target CRS</span>
                      <div className="font-bold text-cyan-400 text-base mt-0.5 font-mono">
                        EPSG:32644 (UTM 44N)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                      <span className="text-[11px] text-gray-400 font-mono">Resolution Mapped</span>
                      <div className="font-bold text-yellow-400 text-base mt-0.5 font-mono">
                        100m Uniform Cells
                      </div>
                    </div>
                  </div>

                  {/* Recent Acquisitions Table */}
                  <div className="rounded-xl border border-[#222222] overflow-hidden bg-[#0d0d0d]">
                    <div className="p-3 bg-[#151515] border-b border-[#222222] font-mono text-xs font-bold text-gray-300">
                      Recent Earth Observation Passes Over Chennai
                    </div>
                    <div className="divide-y divide-[#1f1f1f]">
                      {statusData.recent_acquisitions.map((acq, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between hover:bg-[#141414] transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-xs font-mono">{acq.satellite}</span>
                              <span className="px-1.5 py-0.5 rounded bg-[#222222] text-[10px] text-gray-400 font-mono">
                                {acq.agency}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              Scene: {acq.scene_id}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-xs text-emerald-400 font-bold">
                              {acq.cloud_cover_pct}% Cloud • {acq.resolution_meters}m Res
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {acq.acquisition_time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Passes */}
                  <div className="rounded-xl border border-[#222222] p-4 bg-[#0d0d0d]">
                    <span className="font-mono text-xs font-bold text-white block mb-3">
                      Upcoming Chennai Satellite Revisit Schedule
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {statusData.upcoming_overpasses.map((up, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#141414] border border-[#262626] font-mono text-xs">
                          <span className="font-bold text-cyan-400 block">{up.satellite}</span>
                          <span className="text-white font-bold mt-1 block">{up.expected_overpass}</span>
                          <span className="text-[11px] text-gray-400 mt-0.5 block">{up.target_product}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Live Ingest */}
              {activeTab === 'ingest' && (
                <div className="space-y-4">
                  {ingestResult ? (
                    <>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#0e1614] to-[#0a0a0a] border border-cyan-800/60 flex items-center justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono text-[10px] font-bold">
                            INGEST COMPLETE
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">
                            {ingestResult.satellite} • Scene: {ingestResult.scene_id}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-mono">
                            Acquired: {ingestResult.acquisition_timestamp} • Cloud: {ingestResult.cloud_cover_pct}%
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-xs text-gray-400 block">Cells Updated</span>
                          <span className="text-xl font-bold text-cyan-400">
                            {ingestResult.spatial_coverage.cells_updated}
                          </span>
                        </div>
                      </div>

                      {/* Radiometric Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                          <span className="text-[11px] text-gray-400 font-mono">Mean Surface Temp</span>
                          <div className="text-lg font-mono font-bold text-orange-400 mt-1">
                            {ingestResult.radiometric_summary.mean_surface_temp_c}°C
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                          <span className="text-[11px] text-gray-400 font-mono">Max Hotspot Peak</span>
                          <div className="text-lg font-mono font-bold text-red-500 mt-1">
                            {ingestResult.radiometric_summary.maximum_surface_temp_c}°C
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#121212] border border-[#222222]">
                          <span className="text-[11px] text-gray-400 font-mono">Citywide Mean NDVI</span>
                          <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                            {ingestResult.radiometric_summary.mean_ndvi}
                          </div>
                        </div>
                      </div>

                      {/* Flagged Hotspots */}
                      <div className="rounded-xl border border-[#222222] overflow-hidden bg-[#0d0d0d]">
                        <div className="p-3 bg-[#151515] border-b border-[#222222] font-mono text-xs font-bold text-red-400 flex items-center justify-between">
                          <span>Newly Detected Thermal Hotspots ({ingestResult.new_emerging_hotspots_detected})</span>
                          <span className="text-[10px] text-gray-400 font-normal">Dispatched to OR-Tools Solver</span>
                        </div>
                        <div className="divide-y divide-[#1f1f1f]">
                          {ingestResult.flagged_cells.map((fc, i) => (
                            <div key={i} className="p-3 flex items-center justify-between font-mono text-xs">
                              <div>
                                <span className="text-white font-bold">{fc.ward}</span>
                                <span className="text-gray-500 text-[11px] block">{fc.cell_id} • Driver: {fc.driver}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-red-400 font-bold">{fc.lst_c}°C</span>
                                <span className="text-orange-400 text-[11px] block">+{fc.anomaly_c}°C Anomaly</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                        <span className="material-symbols-outlined text-[32px]">satellite_alt</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Simulate Satellite Overpass Acquisition</h4>
                        <p className="text-xs text-gray-400 max-w-md mt-1">
                          Triggers a simulated Landsat-9 TIRS-2 radiometric pass, downloading thermal infrared tiles, reprojecting to UTM Zone 44N, and updating 1,200 grid cells.
                        </p>
                      </div>
                      <button
                        onClick={handleTriggerOverpass}
                        disabled={triggering}
                        className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                        Trigger Landsat-9 Overpass Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Ground-Truthing Cross Validation */}
              {activeTab === 'groundtruth' && correlationData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#111111] border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {correlationData.validation_verdict}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{correlationData.title}</h4>
                      <span className="text-[11px] text-gray-400 font-mono">
                        Comparing {correlationData.satellite_sensor} vs {correlationData.ground_sensors}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[11px] text-gray-400 block">Mean Absolute Error</span>
                      <span className="text-lg font-bold text-emerald-400">{correlationData.mean_absolute_error_c}°C</span>
                    </div>
                  </div>

                  {/* Corridor Pairs Table */}
                  <div className="rounded-xl border border-[#222222] overflow-hidden bg-[#0d0d0d]">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#151515] text-gray-400 uppercase text-[11px] border-b border-[#222222]">
                        <tr>
                          <th className="p-3">Corridor</th>
                          <th className="p-3 text-right">Satellite LST</th>
                          <th className="p-3 text-right">IoT Sensor</th>
                          <th className="p-3 text-right">Delta</th>
                          <th className="p-3 text-right">Agreement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f1f1f] text-gray-200">
                        {correlationData.corridor_pairs.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#141414] transition-colors">
                            <td className="p-3 font-semibold text-white">{p.corridor}</td>
                            <td className="p-3 text-right text-orange-400">{p.satellite_lst_c}°C</td>
                            <td className="p-3 text-right text-cyan-400">{p.ground_sensor_c}°C</td>
                            <td className="p-3 text-right text-emerald-400">±{p.delta_c}°C</td>
                            <td className="p-3 text-right text-gray-400">{(p.correlation * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
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
            onClick={handleTriggerOverpass}
            disabled={triggering}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold transition-all text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${triggering ? 'animate-spin' : ''}`}>
              sync
            </span>
            {triggering ? 'Ingesting Satellite Tile...' : 'Trigger Satellite Ingest'}
          </button>
        </div>
      </div>
    </div>
  );
};
