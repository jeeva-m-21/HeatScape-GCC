'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import {
  CoolRouteResponse,
  SampleCorridor,
  PublicRefuge,
} from '@/lib/types';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';

export default function CitizenCoolNavigatorPage() {
  const [corridors, setCorridors] = useState<SampleCorridor[]>([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('CORR-01');
  const [routeResult, setRouteResult] = useState<CoolRouteResponse | null>(null);
  const [refuges, setRefuges] = useState<PublicRefuge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sensorModalOpen, setSensorModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [corrData, refData] = await Promise.all([
          apiClient.getSampleCorridors(),
          apiClient.getPublicRefuges(),
        ]);
        setCorridors(corrData.corridors);
        setRefuges(refData.refuges);

        if (corrData.corridors.length > 0) {
          const first = corrData.corridors[0];
          fetchRoute(first.origin.lat, first.origin.lon, first.destination.lat, first.destination.lon);
        }
      } catch (err) {
        console.error('Failed to initialize navigator:', err);
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchRoute = async (oLat: number, oLon: number, dLat: number, dLon: number) => {
    setLoading(true);
    try {
      const data = await apiClient.getCoolPath({
        origin_lat: oLat,
        origin_lon: oLon,
        dest_lat: dLat,
        dest_lon: dLon,
        prioritize_shade: true,
      });
      setRouteResult(data);
    } catch (err) {
      console.error('Failed to compute cool path:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCorridor = (corr: SampleCorridor) => {
    setSelectedCorridorId(corr.id);
    fetchRoute(corr.origin.lat, corr.origin.lon, corr.destination.lat, corr.destination.lon);
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans antialiased selection:bg-primary-container selection:text-black">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-[#050505]/95 backdrop-blur-xl border-b border-[#222222] shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
        <div className="w-full h-header-height px-gutter-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-mono font-bold text-white shadow-md shadow-emerald-900/40">
                <span className="material-symbols-outlined text-[20px]">directions_walk</span>
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                  COOL NAVIGATOR <span className="text-emerald-400 font-extrabold">// SHADED ROUTE</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden sm:block">
                  Citizen Microclimate Thermal Exposure Shield
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-emerald-900/40 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400">Canopy Weighted Routing</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300">Chennai Core</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center p-0.5 rounded-full bg-[#101010] border border-[#222222] text-xs">
            <Link href="/" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Overview</Link>
            <Link href="/explorer" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Trajectories</Link>
            <Link href="/multiview" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Multi-View</Link>
            <Link href="/simulator" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">Planner</Link>
            <Link href="/eoc" className="px-3 py-1 rounded-full text-gray-400 hover:text-white transition-all">EOC Crisis</Link>
            <Link href="/navigator" className="px-3 py-1 rounded-full bg-emerald-600 font-bold text-white shadow-sm">Cool Navigator</Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setSensorModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] hover:bg-[#181818] border border-emerald-800/40 font-mono text-[11px] text-emerald-400 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>842 Sensors Online</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">nature_people</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-header-height w-full px-gutter-desktop py-6 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Banner */}
        <section className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950/50 via-[#0c130e] to-[#0a0a0a] border border-emerald-800/50 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-700/50 text-emerald-300 font-mono text-[10px] font-bold">
                CITIZEN THERMAL PROTECTION
              </span>
              <span className="text-gray-400 text-xs font-mono">
                A* Microclimate Heat &amp; Shade Pathfinding
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Pedestrian Shaded Walk &amp; Thermal Refuge Planner
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl">
              Avoid open asphalt corridors with extreme surface anomalies (+3.8°C). The Cool Route balances distance with tree canopy cover, water kiosks, and air-conditioned transit stops.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-gray-400">Select Corridor:</span>
            <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-xl border border-[#262626]">
              {corridors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCorridor(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedCorridorId === c.id
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Corridor Overview */}
        {corridors.find((c) => c.id === selectedCorridorId) && (
          <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#222222] text-xs text-gray-300 flex items-center justify-between font-mono">
            <span className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{corridors.find((c) => c.id === selectedCorridorId)?.title}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{corridors.find((c) => c.id === selectedCorridorId)?.description}</span>
            </span>
          </div>
        )}

        {/* Comparison Summary Strip */}
        {routeResult && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-emerald-800/40">
              <span className="text-xs font-mono text-gray-400">Thermal Relief</span>
              <div className="mt-1 text-2xl font-mono font-bold text-emerald-400">
                {routeResult.comparison_summary.thermal_relief_celsius}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Lower apparent heat index</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-emerald-800/40">
              <span className="text-xs font-mono text-gray-400">Tree Canopy Shade</span>
              <div className="mt-1 text-2xl font-mono font-bold text-emerald-300">
                {routeResult.comparison_summary.canopy_increase}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {routeResult.cool_route.canopy_coverage_pct}% of route shaded
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222]">
              <span className="text-xs font-mono text-gray-400">Walk Duration Delta</span>
              <div className="mt-1 text-2xl font-mono font-bold text-white">
                {routeResult.comparison_summary.additional_walk_mins}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {routeResult.cool_route.duration_mins} mins total walk
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222]">
              <span className="text-xs font-mono text-gray-400">Hydration &amp; Refuges</span>
              <div className="mt-1 text-2xl font-mono font-bold text-cyan-400">
                {routeResult.comparison_summary.water_points_encountered + routeResult.comparison_summary.cooling_shelters_encountered} Points
              </div>
              <span className="text-[11px] text-cyan-500 font-mono">Along shaded corridor</span>
            </div>
          </section>
        )}

        {/* Route Details: Side by Side Cards */}
        {routeResult && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Route Card */}
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-red-900/40 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <h3 className="text-sm font-bold font-mono text-white">Direct Shortest Route (Sun-Exposed)</h3>
                  </div>
                  <span className="text-xs font-mono text-red-400 font-semibold">High Thermal Strain</span>
                </div>

                <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-[#111111] border border-[#222222] font-mono text-center">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Distance</span>
                    <span className="text-sm font-bold text-white">{routeResult.direct_route.distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Walking Time</span>
                    <span className="text-sm font-bold text-white">{routeResult.direct_route.duration_mins} min</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Mean Feel</span>
                    <span className="text-sm font-bold text-red-400">{routeResult.direct_route.avg_apparent_temp_c}°C</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Direct Solar Exposure:</span>
                    <span className="text-red-400 font-bold">{routeResult.direct_route.sun_exposed_pct}% Exposed</span>
                  </div>
                  <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${routeResult.direct_route.sun_exposed_pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-gray-400 pt-1">
                    <span>Tree Canopy Cover:</span>
                    <span className="text-white">{routeResult.direct_route.canopy_coverage_pct}%</span>
                  </div>
                </div>

                {/* Waypoint Steps */}
                <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                  <span className="text-[11px] font-mono text-gray-400 uppercase block mb-2">Route Junctions</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {routeResult.direct_route.waypoints.map((wp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded bg-[#121212]">
                        <span className="text-gray-300 truncate max-w-[200px]">{wp.name}</span>
                        <span className="text-red-400 font-bold">+{wp.anomaly_c}°C</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Shaded Cool Route Card */}
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-emerald-800/60 shadow-xl shadow-emerald-950/20 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-sm font-bold font-mono text-emerald-400">GCC Shaded Cool Corridor (Optimal)</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800/40">
                    RECOMMENDED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-[#0c140e] border border-emerald-900/50 font-mono text-center">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Distance</span>
                    <span className="text-sm font-bold text-white">{routeResult.cool_route.distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Walking Time</span>
                    <span className="text-sm font-bold text-white">{routeResult.cool_route.duration_mins} min</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Mean Feel</span>
                    <span className="text-sm font-bold text-emerald-400">{routeResult.cool_route.avg_apparent_temp_c}°C</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Tree Canopy Cover:</span>
                    <span className="text-emerald-400 font-bold">{routeResult.cool_route.canopy_coverage_pct}% Shaded</span>
                  </div>
                  <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${routeResult.cool_route.canopy_coverage_pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-gray-400 pt-1">
                    <span>Direct Solar Exposure:</span>
                    <span className="text-gray-300">{routeResult.cool_route.sun_exposed_pct}%</span>
                  </div>
                </div>

                {/* Waypoint Steps */}
                <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                  <span className="text-[11px] font-mono text-gray-400 uppercase block mb-2">Shaded Waypoints &amp; Refuges</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {routeResult.cool_route.waypoints.map((wp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded bg-[#101712] border border-emerald-950">
                        <span className="text-emerald-300 truncate max-w-[200px]">{wp.name}</span>
                        <div className="flex items-center gap-1.5">
                          {wp.is_water_point && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 font-bold">WATER</span>
                          )}
                          <span className="text-emerald-400 font-bold">{wp.canopy_pct}% shade</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Public Thermal Refuges & Hydration Kiosks */}
        <section className="rounded-2xl p-5 bg-[#0a0a0a] border border-[#222222] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-[20px]">water_bottle</span>
              <h3 className="text-base font-bold text-white">Chennai Public Hydration Stations &amp; Shaded Refuges</h3>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {refuges.length} Verified Public Facilities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {refuges.map((ref) => (
              <div key={ref.id} className="p-4 rounded-xl bg-[#111111] border border-[#222222] flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                      {ref.type}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">{ref.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{ref.name}</h4>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ref.facilities.map((fac, i) => (
                      <span key={i} className="text-[10px] font-mono text-gray-400 px-1.5 py-0.5 rounded bg-[#181818]">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1f1f1f] text-[11px] font-mono text-gray-500 flex items-center justify-between">
                  <span>GPS: {ref.lat.toFixed(4)}, {ref.lon.toFixed(4)}</span>
                  <button
                    onClick={() => fetchRoute(13.0360, 80.2280, ref.lat, ref.lon)}
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    Walk Here →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sensor Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />
    </div>
  );
}
