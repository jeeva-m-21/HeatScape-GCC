'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import {
  HeatwaveForecastResponse,
  GRAPStatusResponse,
  DispatchManifestResponse,
} from '@/lib/types';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';
import { useSpeech } from '@/lib/use-speech';
import { useLanguage } from '@/lib/i18n';

export default function EmergencyOperationsCenterPage() {
  const { speak, stop, isSpeaking } = useSpeech();
  const { language, t } = useLanguage();
  const [stage, setStage] = useState<number>(2);
  const [forecastData, setForecastData] = useState<HeatwaveForecastResponse | null>(null);
  const [grapData, setGrapData] = useState<GRAPStatusResponse | null>(null);
  const [dispatchData, setDispatchData] = useState<DispatchManifestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sensorModalOpen, setSensorModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'shelters' | 'tasks'>('overview');

  const loadData = async (selectedStage: number) => {
    setLoading(true);
    try {
      const [fc, grap, disp] = await Promise.all([
        apiClient.getHeatwaveForecast(),
        apiClient.getGRAPStatus(selectedStage),
        apiClient.getDispatchManifest(),
      ]);
      setForecastData(fc);
      setGrapData(grap);
      setDispatchData(disp);
    } catch (err) {
      console.error('Failed to load EOC crisis data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(stage);
  }, [stage]);

  const handleStageChange = (newStage: number) => {
    setStage(newStage);
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans antialiased selection:bg-primary-container selection:text-black">
      {/* Top EOC Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-[#050505]/95 backdrop-blur-xl border-b border-[#222222] shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
        <div className="w-full h-header-height px-gutter-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-mono font-bold text-white shadow-md shadow-red-900/40">
                EOC
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                  GCC HEAT CRISIS <span className="text-red-500 font-extrabold">// EAP COMMAND</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden sm:block">
                  Ripon Building Disaster Management Cell
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-red-900/40 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-400 font-bold">GRAP PROTOCOL ACTIVE</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300">Phase II Emergency</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden xl:flex items-center p-0.5 rounded-full bg-[#101010] border border-[#222222] text-xs">
            <Link href="/" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Overview</Link>
            <Link href="/explorer" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Trajectories</Link>
            <Link href="/multiview" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Multi-View</Link>
            <Link href="/simulator" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Planner</Link>
            <Link href="/eoc" className="px-3 py-1 rounded-full bg-red-600 font-bold text-white shadow-sm">EOC Crisis Room</Link>
            <Link href="/navigator" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Cool Navigator</Link>
          </nav>

          {/* Right badges */}
          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setSensorModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] hover:bg-[#181818] border border-emerald-800/40 font-mono text-[11px] text-emerald-400 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>842 Sensors Online</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-red-950 border border-red-800/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-400 text-[18px]">emergency</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main EOC Dashboard Body */}
      <main className="pt-header-height w-full px-gutter-desktop py-6 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Statutory Emergency Order Banner */}
        <section className="rounded-2xl p-5 bg-gradient-to-r from-red-950/70 via-[#150a0a] to-[#0a0a0a] border border-red-800/60 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-900/50 border border-red-700/60 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-400 text-[28px]">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold tracking-wider">
                  STATUTORY ORDER • TN DMA / GCC 2026
                </span>
                <span className="text-gray-400 text-xs font-mono">
                  Order Ref: TNSDMA/DM-HEAT/SEC-38/2026
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {grapData ? grapData.stage_name : 'Loading Crisis Stage...'}
              </h2>
              <p className="text-sm text-red-200 mt-1 max-w-3xl font-medium">
                {grapData ? grapData.labor_mandate : 'Fetching statutory labor directives...'}
              </p>

              {/* Spoken Web Speech Audio Briefing Controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stop();
                    } else {
                      const tamilMsg = `கவனிக்கவும்: பெருநகர சென்னை மாநகராட்சி அவசரகால வெப்ப எச்சரிக்கை விடுத்துள்ளது. ${grapData?.stage_name || ''}. ${grapData?.labor_mandate || ''}.`;
                      speak(tamilMsg, 'ta');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-[#1a0f0f] hover:bg-[#281515] border-rose-800/60 text-rose-300'
                  }`}
                  title="Listen to official GRAP emergency order in Tamil"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isSpeaking ? 'stop_circle' : 'volume_up'}
                  </span>
                  <span>{isSpeaking ? 'நிறுத்து (Stop Audio)' : 'தமிழ் ஒலி அறிக்கை (Tamil Audio)'}</span>
                </button>
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stop();
                    } else {
                      const enMsg = `Attention Greater Chennai Corporation alert: ${grapData?.stage_name || ''}. ${grapData?.labor_mandate || ''}. All outdoor operations must adhere to statutory mandates.`;
                      speak(enMsg, 'en');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-[#333] hover:border-gray-500 bg-[#121212] text-gray-300 font-mono text-xs flex items-center gap-1 cursor-pointer"
                  title="Listen to emergency order in English"
                >
                  <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                  <span>English Dispatch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulated GRAP Stage Trigger Switcher */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Simulate GRAP Escalation</span>
            <div className="flex items-center bg-[#0d0d0d] p-1 rounded-xl border border-[#262626]">
              {[
                { s: 0, label: 'Stage 0 (Adv)' },
                { s: 1, label: 'Stage 1 (Yel)' },
                { s: 2, label: 'Stage 2 (Org)' },
                { s: 3, label: 'Stage 3 (Red)' },
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => handleStageChange(item.s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    stage === item.s
                      ? item.s === 3
                        ? 'bg-red-600 text-white shadow-md'
                        : item.s === 2
                        ? 'bg-orange-500 text-black shadow-md'
                        : item.s === 1
                        ? 'bg-yellow-500 text-black'
                        : 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Real-Time EOC Crisis Vital Metric Gauges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222]">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-orange-400">thermostat</span>
              Peak Apparent Temp
            </span>
            <div className="mt-2 text-2xl font-mono font-bold text-orange-400">
              {forecastData ? `${forecastData.highest_projected_apparent_c}°C` : '--'}
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-1">
              {forecastData ? `${forecastData.days_above_40c} days above 40°C threshold` : 'Measuring...'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222]">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-cyan-400">mode_fan</span>
              Misting Cannons Deployed
            </span>
            <div className="mt-2 text-2xl font-mono font-bold text-white">
              {grapData ? `${grapData.misting_trucks_count} Trucks` : '--'}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-1">
              Active along 5 major transit corridors
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222]">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">roofing</span>
              Cooling Shelters Open
            </span>
            <div className="mt-2 text-2xl font-mono font-bold text-white">
              {grapData ? `${grapData.cooling_shelters_count} Centers` : '--'}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">
              24/7 HVAC with Medical On-Call
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222]">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-400">water_drop</span>
              Thanneer Pandals Active
            </span>
            <div className="mt-2 text-2xl font-mono font-bold text-white">
              {grapData ? `${grapData.water_kiosks_count} Booths` : '--'}
            </div>
            <div className="text-[11px] text-blue-400 font-mono mt-1">
              Continuous Metro Water replenishment
            </div>
          </div>
        </section>

        {/* 7-Day Rolling Heatwave Forecast Strip */}
        <section className="rounded-2xl p-5 bg-[#0a0a0a] border border-[#222222] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-[20px]">calendar_month</span>
              <h3 className="text-base font-bold text-white">IMD 7-Day Chennai Heatwave Trajectory</h3>
            </div>
            <span className="text-xs font-mono text-gray-400">
              Issued by Regional Meteorological Centre (RMC) Chennai
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecastData?.daily_forecasts.map((day, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  day.imd_alert === 'RED'
                    ? 'bg-red-950/40 border-red-800/80 shadow-lg shadow-red-950/50'
                    : day.imd_alert === 'ORANGE'
                    ? 'bg-orange-950/40 border-orange-800/80 shadow-lg shadow-orange-950/40'
                    : day.imd_alert === 'YELLOW'
                    ? 'bg-yellow-950/30 border-yellow-800/50'
                    : 'bg-[#121212] border-[#222222]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>{day.day_name.slice(0, 3)}</span>
                    <span className="font-bold text-white">{day.short_date}</span>
                  </div>
                  <div className="mt-2 text-lg font-mono font-bold text-white flex items-baseline gap-1">
                    <span>{day.max_temp_c}°C</span>
                    <span className="text-xs text-gray-500 font-normal">/ {day.min_temp_c}°</span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 mt-1">
                    Apparent: <span className="font-bold text-orange-400">{day.apparent_heat_index_c}°C</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#262626]">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold w-full text-center"
                    style={{ backgroundColor: `${day.color_hex}22`, color: day.color_hex, borderColor: `${day.color_hex}44` }}
                  >
                    {day.imd_alert}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Tabs Ribbon */}
        <div className="flex items-center gap-2 border-b border-[#222222] pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-[#1a1a1a] text-white border border-[#333333]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Hotspot Vulnerability Zones
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'fleet' ? 'bg-[#1a1a1a] text-white border border-[#333333]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Misting Cannons ({dispatchData?.active_misting_vehicles.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('shelters')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'shelters' ? 'bg-[#1a1a1a] text-white border border-[#333333]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Cooling Shelters ({dispatchData?.emergency_cooling_shelters.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'tasks' ? 'bg-[#1a1a1a] text-white border border-[#333333]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Departmental Protocols
          </button>
        </div>

        {/* Tab 1: Vulnerability Zones */}
        {activeTab === 'overview' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-[18px]">local_fire_department</span>
                Peak Projected Vulnerability Corridors
              </h4>
              <div className="divide-y divide-[#1f1f1f]">
                {forecastData?.vulnerable_zones.map((zone, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-xs">{zone.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{zone.zone_id} • Chennai</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-red-400">{zone.peak_temp_c}°C</div>
                      <div className="text-[11px] text-orange-400">Feel: {zone.apparent_c}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">gavel</span>
                Statutory Authority &amp; Signatories
              </h4>
              <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] text-xs space-y-2">
                <div>
                  <span className="text-gray-400 block text-[11px]">Enforcement Authority</span>
                  <span className="font-semibold text-white">{grapData?.statutory_authority}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Authorized Incident Commander</span>
                  <span className="font-semibold text-white">{grapData?.enforcement_officer}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Last Escalated</span>
                  <span className="font-mono text-gray-300">{grapData?.last_escalated}</span>
                </div>
              </div>

              <div className="mt-auto pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify({ grap: grapData, forecast: forecastData, dispatch: dispatchData }, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GCC_EAP_Crisis_Dossier_${stage}.json`;
                    a.click();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Export GRAP Crisis Dossier
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Misting Cannon Fleet */}
        {activeTab === 'fleet' && (
          <section className="rounded-2xl border border-[#222222] overflow-hidden bg-[#0a0a0a]">
            <div className="p-4 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">
                Mechanical Evaporative Misting Cannon Fleet Schedule
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Total Water Capacity: {dispatchData?.total_water_dispatched_liters.toLocaleString()} Liters
              </span>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#151515] text-gray-400 uppercase text-[11px] border-b border-[#222222]">
                <tr>
                  <th className="p-3">Vehicle ID</th>
                  <th className="p-3">Registration</th>
                  <th className="p-3">Route Corridor</th>
                  <th className="p-3">Driver Contact</th>
                  <th className="p-3 text-right">Capacity &amp; Rate</th>
                  <th className="p-3 text-right">Cooling Delta</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f] text-gray-200">
                {dispatchData?.active_misting_vehicles.map((v, idx) => (
                  <tr key={idx} className="hover:bg-[#141414] transition-colors">
                    <td className="p-3 text-cyan-400 font-bold">{v.vehicle_id}</td>
                    <td className="p-3 text-white font-semibold">{v.registration}</td>
                    <td className="p-3">
                      <div className="text-white">{v.target_corridor}</div>
                      <div className="text-[11px] text-gray-500">{v.zone}</div>
                    </td>
                    <td className="p-3 text-gray-400">
                      <div>{v.driver_name}</div>
                      <div className="text-[11px]">{v.driver_phone}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div>{v.capacity_liters.toLocaleString()} L</div>
                      <div className="text-[11px] text-gray-400">{v.spray_rate_lpm} L/min</div>
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      {v.evaporative_cooling_delta}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Tab 3: Cooling Shelters */}
        {activeTab === 'shelters' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dispatchData?.emergency_cooling_shelters.map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800/40">
                        24/7 OPEN
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{s.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{s.address}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{s.zone}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#111111] border border-[#222222] text-xs font-mono">
                    <div>
                      <span className="text-gray-400 text-[11px] block">Capacity</span>
                      <span className="text-white font-bold text-sm">{s.capacity_persons} Beds</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[11px] block">Current Occupancy</span>
                      <span className="text-orange-400 font-bold text-sm">
                        {s.current_occupancy} ({Math.round((s.current_occupancy / s.capacity_persons) * 100)}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.facilities.map((fac, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-[#181818] border border-[#2a2a2a] text-[10px] text-gray-300 font-mono">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Helpline: {s.contact}</span>
                  <Link
                    href={`/navigator?dest_lat=13.04&dest_lon=80.23`}
                    className="text-primary hover:underline font-bold"
                  >
                    Route Pedestrian →
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Tab 4: Departmental Task Checklists */}
        {activeTab === 'tasks' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grapData?.departmental_actions.map((dept, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{dept.department}</h4>
                    <span className="text-xs text-gray-400">Head: {dept.head_officer}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    {dept.status}
                  </span>
                </div>

                <div className="divide-y divide-[#1f1f1f] text-xs">
                  {dept.tasks.map((t, i) => (
                    <div key={i} className="py-2.5 flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${t.done ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {t.done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={t.done ? 'text-gray-300' : 'text-gray-400'}>{t.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Sensor Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />
    </div>
  );
}
