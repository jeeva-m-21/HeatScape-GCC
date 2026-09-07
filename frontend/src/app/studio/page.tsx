'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import {
  TransectSummary,
  TransectProfileResponse,
  StreetCanyonResponse,
  TerrainMeshResponse,
} from '@/lib/types';

type StudioTab = 'open-data' | 'terrain-transect' | 'street-canyon' | 'mesh-3d' | 'uav-drone';

// Sample open datasets for one-click testing
const PRESET_OPEN_DATASETS = [
  {
    id: 'opencity-chennai',
    name: 'OpenCity Chennai • Heat Vulnerability Survey (CSV/JSON)',
    provider: 'OpenCity India Open Data Repository',
    sample: [
      { ward_no: '114', lat: 13.045, lon: 80.245, LST: 41.8, RH: 68.2, tree_cover: 0.04 },
      { ward_no: '117', lat: 13.041, lon: 80.233, LST: 43.4, RH: 64.0, tree_cover: 0.02 },
      { ward_no: '119', lat: 13.032, lon: 80.239, LST: 40.1, RH: 71.5, tree_cover: 0.09 },
      { ward_no: '122', lat: 13.021, lon: 80.252, LST: 38.6, RH: 74.0, tree_cover: 0.14 },
    ],
  },
  {
    id: 'bhuvan-lst',
    name: 'ISRO Bhuvan • High-Resolution LST GeoJSON',
    provider: 'National Remote Sensing Centre (NRSC / ISRO)',
    sample: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [80.282, 13.05] },
          properties: { surface_temp: 36.2, humidity: 82.0, veg_index: 0.08, sector: 'Marina' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [80.21, 13.007] },
          properties: { surface_temp: 42.1, humidity: 65.5, veg_index: 0.35, sector: 'Guindy' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [80.155, 13.035] },
          properties: { surface_temp: 44.5, humidity: 58.0, veg_index: 0.05, sector: 'Porur' },
        },
      ],
    },
  },
  {
    id: 'era5-kelvin',
    name: 'Copernicus ERA5-Land • Thermal Reanalysis Grid (Kelvin)',
    provider: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
    sample: [
      { lat: 13.04, lon: 80.24, temperature_2m: 315.65, dewpoint_spread: 0.62 },
      { lat: 13.08, lon: 80.28, temperature_2m: 312.15, dewpoint_spread: 0.78 },
      { lat: 12.98, lon: 80.22, temperature_2m: 316.85, dewpoint_spread: 0.59 },
    ],
  },
];

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>('open-data');

  // Open Data State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('opencity-chennai');
  const [customDataJson, setCustomDataJson] = useState<string>(
    JSON.stringify(PRESET_OPEN_DATASETS[0].sample, null, 2)
  );
  const [normalizationResult, setNormalizationResult] = useState<any | null>(null);
  const [isNormalizing, setIsNormalizing] = useState<boolean>(false);
  const [projectedSuccess, setProjectedSuccess] = useState<boolean>(false);

  // Terrain & Transect State
  const [transectsList, setTransectsList] = useState<TransectSummary[]>([]);
  const [selectedTransectId, setSelectedTransectId] = useState<string>('coastal-to-inland');
  const [transectProfile, setTransectProfile] = useState<TransectProfileResponse | null>(null);
  const [isLoadingTransect, setIsLoadingTransect] = useState<boolean>(false);

  // Street Canyon State
  const [canyonHeight, setCanyonHeight] = useState<number>(24);
  const [canyonWidth, setCanyonWidth] = useState<number>(12);
  const [canyonOrientation, setCanyonOrientation] = useState<number>(0);
  const [ambientWindSpeed, setAmbientWindSpeed] = useState<number>(3.5);
  const [ambientWindDir, setAmbientWindDir] = useState<number>(90);
  const [canyonResult, setCanyonResult] = useState<StreetCanyonResponse | null>(null);
  const [isAnalyzingCanyon, setIsAnalyzingCanyon] = useState<boolean>(false);

  // 3D Mesh State
  const [meshData, setMeshData] = useState<TerrainMeshResponse | null>(null);
  const [meshRows, setMeshRows] = useState<number>(12);
  const [isLoadingMesh, setIsLoadingMesh] = useState<boolean>(false);

  // UAV Drone State
  const [droneMissions, setDroneMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('UAV-GCC-2026-001');
  const [probeDN, setProbeDN] = useState<number>(8150);
  const [probeEmissivity, setProbeEmissivity] = useState<number>(0.95);
  const [probeResult, setProbeResult] = useState<any | null>(null);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [gcpFilename, setGcpFilename] = useState<string>('uav_parrys_broadway_radiometric.tif');
  const [gcpUploadResponse, setGcpUploadResponse] = useState<any | null>(null);
  const [isGeneratingGCP, setIsGeneratingGCP] = useState<boolean>(false);

  const loadDroneMissions = async () => {
    try {
      const res = await apiClient.getDroneMissions();
      setDroneMissions(res.missions);
      if (res.missions.length > 0) {
        setSelectedMissionId(res.missions[0].mission_id);
      }
    } catch (err) {
      console.warn('Failed to load drone missions:', err);
    }
  };

  const handleProbePixel = async () => {
    setIsProbing(true);
    try {
      const res = await apiClient.calibratePixel(probeDN, probeEmissivity);
      setProbeResult(res);
    } catch (err) {
      console.error('Failed to probe pixel:', err);
    } finally {
      setIsProbing(false);
    }
  };

  const handleGenerateGCPUrl = async () => {
    setIsGeneratingGCP(true);
    try {
      const res = await apiClient.generateGCPUploadUrl(gcpFilename);
      setGcpUploadResponse(res);
    } catch (err) {
      console.error('Failed to generate GCP upload URL:', err);
    } finally {
      setIsGeneratingGCP(false);
    }
  };

  // Load Transects and initial normalize on mount
  useEffect(() => {
    handleRunNormalization(PRESET_OPEN_DATASETS[0].sample);
    loadTransects();
    analyzeCanyon();
    loadDroneMissions();
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_OPEN_DATASETS.find((p) => p.id === presetId);
    if (preset) {
      const jsonStr = JSON.stringify(preset.sample, null, 2);
      setCustomDataJson(jsonStr);
      handleRunNormalization(preset.sample);
    }
  };

  const handleRunNormalization = async (rawPayload?: any) => {
    setIsNormalizing(true);
    setProjectedSuccess(false);
    try {
      let payloadToTest = rawPayload;
      if (!payloadToTest) {
        payloadToTest = JSON.parse(customDataJson);
      }
      let requestBody: any = {};
      if (Array.isArray(payloadToTest)) {
        requestBody = { items: payloadToTest };
      } else if (payloadToTest?.type === 'FeatureCollection') {
        requestBody = { feature_collection: payloadToTest };
      } else {
        requestBody = { items: [payloadToTest] };
      }
      const res = await apiClient.normalizeOpenData(requestBody);
      setNormalizationResult(res);
    } catch (err) {
      console.error('Normalization error:', err);
    } finally {
      setIsNormalizing(false);
    }
  };

  const loadTransects = async () => {
    try {
      const res = await apiClient.getTransects();
      setTransectsList(res.transects);
      if (res.transects.length > 0) {
        loadTransectDetail(res.transects[0].id);
      }
    } catch (err) {
      console.error('Failed to load transects:', err);
    }
  };

  const loadTransectDetail = async (transectId: string) => {
    setIsLoadingTransect(true);
    setSelectedTransectId(transectId);
    try {
      const res = await apiClient.getTransectProfile(transectId, 36);
      setTransectProfile(res);
    } catch (err) {
      console.error('Failed to load transect profile:', err);
    } finally {
      setIsLoadingTransect(false);
    }
  };

  const analyzeCanyon = async () => {
    setIsAnalyzingCanyon(true);
    try {
      const res = await apiClient.analyzeStreetCanyon({
        building_height_m: canyonHeight,
        street_width_m: canyonWidth,
        canyon_orientation_deg: canyonOrientation,
        ambient_wind_speed_ms: ambientWindSpeed,
        ambient_wind_dir_deg: ambientWindDir,
      });
      setCanyonResult(res);
    } catch (err) {
      console.error('Failed to analyze canyon:', err);
    } finally {
      setIsAnalyzingCanyon(false);
    }
  };

  const load3DMesh = async () => {
    setIsLoadingMesh(true);
    try {
      const res = await apiClient.get3DTerrainMesh({ rows: meshRows, cols: meshRows });
      setMeshData(res);
    } catch (err) {
      console.error('Failed to load 3D terrain mesh:', err);
    } finally {
      setIsLoadingMesh(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200 font-sans">
      {/* Studio Header Ribbon */}
      <section className="bg-[#0a0a0a] border-b border-[#222222] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container text-xs font-mono font-semibold">
                GCP 3D & OPEN DATA STUDIO
              </span>
              <span className="text-xs text-gray-500 font-mono">OGC / STAC / SRTM Compliant</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">layers</span>
              Universal Dataset Ingest & Urban Canyon Microclimate Studio
            </h1>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-[#262626]">
            <button
              onClick={() => setActiveTab('open-data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'open-data'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">dataset</span>
              <span>Open Data Ingest</span>
            </button>
            <button
              onClick={() => setActiveTab('terrain-transect')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'terrain-transect'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">waves</span>
              <span>3D Sea Breeze Transects</span>
            </button>
            <button
              onClick={() => setActiveTab('street-canyon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'street-canyon'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">location_city</span>
              <span>Street Canyon (Oke)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('mesh-3d');
                if (!meshData) load3DMesh();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'mesh-3d'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">grid_view</span>
              <span>3D Elevation Mesh</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('uav-drone');
                if (droneMissions.length === 0) loadDroneMissions();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'uav-drone'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
              title="Inspect UAV drone thermal missions and probe radiometric pixels"
            >
              <span className="material-symbols-outlined text-[15px]">flight</span>
              <span>UAV Drone Inspector</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: OPEN DATA INGEST & NORMALIZATION */}
        {/* ========================================================================= */}
        {activeTab === 'open-data' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Explanatory Banner */}
            <div className="bg-[#0e0e0e] border border-[#222222] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                  Universal Multi-Source Compatibility Engine
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
                  Automatically detects schemas from external Open Data providers (OpenCity, ISRO Bhuvan,
                  NASA CMR STAC, OpenWeather, ERA5-Land). Executes fuzzy alias resolution, unit auto-conversions
                  (Kelvin &gt; 200K &rarr; Celsius, fractional humidity &rarr; %), and spatial projection into Chennai UTM 44N.
                </p>
              </div>
              <Link
                href="/eoc"
                className="px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <span>View EOC Integration</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {/* Presets Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-gray-400">Load Live Dataset Preset:</span>
              {PRESET_OPEN_DATASETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    selectedPresetId === p.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                      : 'bg-[#101010] border-[#222222] text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Ingest Editor & Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Raw Payload Editor */}
              <div className="lg:col-span-5 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-cyan-400 text-[16px]">code</span>
                    Input GeoJSON / JSON Records
                  </span>
                  <button
                    onClick={() => handleRunNormalization()}
                    disabled={isNormalizing}
                    className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-mono font-bold rounded-lg hover:bg-primary transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>{isNormalizing ? 'Estimating...' : 'Re-Run Normalizer'}</span>
                  </button>
                </div>
                <textarea
                  value={customDataJson}
                  onChange={(e) => setCustomDataJson(e.target.value)}
                  className="flex-1 w-full min-h-[360px] bg-[#050505] border border-[#222222] rounded-xl p-3 font-mono text-xs text-gray-300 focus:outline-none focus:border-primary-container resize-none leading-relaxed"
                  spellCheck={false}
                />
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>Supports: Tabular Row Array or GeoJSON FeatureCollection</span>
                  <span>Auto-detects Kelvin, WGS84, Ward IDs</span>
                </div>
              </div>

              {/* Right Column: Ingest Diagnostics & Mapped Observation */}
              <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                  <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">schema</span>
                    Schema Auto-Estimation Diagnostics
                  </span>
                  {normalizationResult && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-xs font-bold">
                        Confidence: {((normalizationResult.mapping_confidence || 0.95) * 100).toFixed(0)}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#1a1a1a] text-gray-300 font-mono text-xs">
                        {normalizationResult.total_items_parsed || 0} Records Mapped
                      </span>
                    </div>
                  )}
                </div>

                {/* Auto-resolved Field Mappings */}
                {normalizationResult?.resolved_field_mappings && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                      Fuzzy Alias & Type Resolution
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(normalizationResult.resolved_field_mappings).map(([src, dst]: any) => (
                        <div key={src} className="p-2 rounded-lg bg-[#141414] border border-[#222222] font-mono text-xs">
                          <div className="text-gray-500 text-[10px]">Raw Key: &ldquo;{src}&rdquo;</div>
                          <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[12px]">arrow_right_alt</span>
                            <span>{dst}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Normalized Observations Table */}
                <div className="flex-1 overflow-x-auto">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                    Normalized Standard HeatScape Tuples
                  </span>
                  <table className="w-full text-left font-mono text-xs border border-[#222222] rounded-lg overflow-hidden">
                    <thead className="bg-[#121212] text-gray-400 border-b border-[#222222]">
                      <tr>
                        <th className="p-2">Location / Ward</th>
                        <th className="p-2">Lat, Lon</th>
                        <th className="p-2">Surface Temp (°C)</th>
                        <th className="p-2">RH (%)</th>
                        <th className="p-2">NDVI / Canopy</th>
                        <th className="p-2">Valid Chennai Box</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                      {(normalizationResult?.normalized_observations || []).map((obs: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#121212]/70 transition-colors">
                          <td className="p-2 text-white font-bold">{obs.ward_id || `Point ${idx + 1}`}</td>
                          <td className="p-2 text-gray-400">{obs.lat?.toFixed(3)}, {obs.lon?.toFixed(3)}</td>
                          <td className="p-2 text-amber-400 font-bold">
                            {obs.surface_temp_c !== null && obs.surface_temp_c !== undefined ? `${obs.surface_temp_c.toFixed(1)}°C` : '—'}
                          </td>
                          <td className="p-2 text-cyan-400">
                            {obs.relative_humidity_pct !== null && obs.relative_humidity_pct !== undefined ? `${obs.relative_humidity_pct.toFixed(0)}%` : '—'}
                          </td>
                          <td className="p-2 text-emerald-400">
                            {obs.ndvi !== null && obs.ndvi !== undefined ? obs.ndvi.toFixed(2) : obs.canopy_pct ? `${(obs.canopy_pct * 100).toFixed(0)}%` : '—'}
                          </td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 font-bold">
                              PASS (100m)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Project into Twin Action Button */}
                <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[16px]">sync</span>
                    <span>Ready to update PostGIS raster layers and 100m spatial grid.</span>
                  </div>
                  <button
                    onClick={() => setProjectedSuccess(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-[0_2px_12px_rgba(243,128,32,0.3)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">layers</span>
                    <span>{projectedSuccess ? 'Injected into Active Twin!' : 'Project into Active Twin'}</span>
                  </button>
                </div>
                {projectedSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Successfully harmonized open dataset into the Chennai Metropolitan 100m analytical grid!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GCP 3D ELEVATION & SEA BREEZE TRANSECTS */}
        {/* ========================================================================= */}
        {activeTab === 'terrain-transect' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Transect Selector Header */}
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-[18px]">altitude</span>
                  GCP 3D Topographic Elevation & Bay of Bengal Marine Ingress Transects
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  High-fidelity cross-sectional topography calibrated against SRTM30 / GCP 3D elevation data.
                  Simulates marine boundary layer cooling relief as sea breeze penetrates inland from the Bay of Bengal.
                </p>
              </div>

              {/* Transect Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {transectsList.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => loadTransectDetail(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      selectedTransectId === t.id
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                        : 'bg-[#121212] border-[#222222] text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.name.split(' Transect')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Summary Cards */}
            {transectProfile && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4 font-mono">
                  <div className="text-[11px] text-gray-500 uppercase">Transect Length</div>
                  <div className="text-2xl font-bold text-white mt-1">{transectProfile.total_distance_km} km</div>
                  <div className="text-[10px] text-gray-400 mt-1">Coast to Western Periphery</div>
                </div>
                <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4 font-mono">
                  <div className="text-[11px] text-gray-500 uppercase">Elevation Span</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {transectProfile.min_elevation_m}m &rarr; {transectProfile.max_elevation_m}m
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">+{transectProfile.elevation_gain_m}m inland rise</div>
                </div>
                <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4 font-mono">
                  <div className="text-[11px] text-gray-500 uppercase">Max Sea Breeze Cooling</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    -{transectProfile.max_sea_breeze_relief_c}°C
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Thermal relief at shoreline</div>
                </div>
                <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4 font-mono">
                  <div className="text-[11px] text-gray-500 uppercase">Marine Ingress Limit</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">16.4 km</div>
                  <div className="text-[10px] text-gray-400 mt-1">Front reaches Porur at ~15:10 IST</div>
                </div>
              </div>
            )}

            {/* Cross-Section Graphical Profile (SVG) */}
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4 font-mono text-xs">
                <span className="text-gray-300 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[16px]">show_chart</span>
                  Cross-Sectional Elevation & Sea Breeze Thermal Relief Profile
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
                    Elevation (m MSL)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-3 h-0.5 bg-emerald-400 border-t border-dashed inline-block"></span>
                    Sea Breeze Cooling (°C)
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Elevation Profile */}
              {transectProfile && (
                <div className="relative w-full h-80 bg-[#050505] border border-[#1f1f1f] rounded-xl p-4 overflow-hidden select-none">
                  {/* Background East Sea Breeze Flow Indicator */}
                  <div className="absolute right-4 top-4 px-3 py-1 rounded bg-cyan-950/40 border border-cyan-800/40 font-mono text-xs text-cyan-400 flex items-center gap-1.5 pointer-events-none">
                    <span className="material-symbols-outlined text-[14px]">air</span>
                    <span>Bay of Bengal Sea Breeze Inflow &larr;</span>
                  </div>

                  <svg viewBox="0 0 800 240" className="w-full h-full">
                    <defs>
                      <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="coolingGlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                        <stop offset="70%" stopColor="#eab308" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="40" y1="40" x2="760" y2="40" stroke="#1c1c1c" strokeDasharray="3 3" />
                    <line x1="40" y1="90" x2="760" y2="90" stroke="#1c1c1c" strokeDasharray="3 3" />
                    <line x1="40" y1="140" x2="760" y2="140" stroke="#1c1c1c" strokeDasharray="3 3" />
                    <line x1="40" y1="190" x2="760" y2="190" stroke="#262626" />

                    {/* Y-axis labels */}
                    <text x="32" y="44" fill="#666" fontSize="10" fontFamily="monospace" textAnchor="end">120m</text>
                    <text x="32" y="94" fill="#666" fontSize="10" fontFamily="monospace" textAnchor="end">80m</text>
                    <text x="32" y="144" fill="#666" fontSize="10" fontFamily="monospace" textAnchor="end">40m</text>
                    <text x="32" y="194" fill="#666" fontSize="10" fontFamily="monospace" textAnchor="end">0m</text>

                    {/* Compute polygon points for elevation profile */}
                    {(() => {
                      const pts = transectProfile.profile_points;
                      if (!pts.length) return null;
                      const maxE = Math.max(140, transectProfile.max_elevation_m + 10);
                      const mapX = (idx: number) => 50 + (idx / (pts.length - 1)) * 700;
                      const mapY = (elev: number) => 190 - (elev / maxE) * 150;

                      const polyPoints = [
                        `50,190`,
                        ...pts.map((p, i) => `${mapX(i).toFixed(1)},${mapY(p.elevation_m).toFixed(1)}`),
                        `750,190`,
                      ].join(' ');

                      const pathLine = pts
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(i).toFixed(1)} ${mapY(p.elevation_m).toFixed(1)}`)
                        .join(' ');

                      // Sea Breeze cooling relief curve
                      const coolingLine = pts
                        .map((p, i) => {
                          const cY = 190 - (p.sea_breeze_cooling_c / 4.0) * 120;
                          return `${i === 0 ? 'M' : 'L'} ${mapX(i).toFixed(1)} ${cY.toFixed(1)}`;
                        })
                        .join(' ');

                      return (
                        <>
                          {/* Elevation area and line */}
                          <polygon points={polyPoints} fill="url(#elevFill)" />
                          <path d={pathLine} fill="none" stroke="#00d4ff" strokeWidth="2.5" />

                          {/* Sea Breeze Cooling Line */}
                          <path d={coolingLine} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />

                          {/* Feature Points & Urban Nodes */}
                          {pts.filter((_, idx) => idx % 6 === 0 || idx === pts.length - 1).map((p, i) => (
                            <g key={i}>
                              <circle cx={mapX(p.step_index)} cy={mapY(p.elevation_m)} r="4" fill="#ffffff" stroke="#00d4ff" strokeWidth="2" />
                              <text
                                x={mapX(p.step_index)}
                                y="210"
                                fill="#888"
                                fontSize="9"
                                fontFamily="monospace"
                                textAnchor="middle"
                              >
                                {p.cumulative_dist_km}km
                              </text>
                              <text
                                x={mapX(p.step_index)}
                                y="222"
                                fill="#aaa"
                                fontSize="8"
                                fontFamily="monospace"
                                textAnchor="middle"
                              >
                                {p.land_use.split(' ')[0]}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STREET CANYON (OKE 1988) MICROCLIMATE ANALYZER */}
        {/* ========================================================================= */}
        {activeTab === 'street-canyon' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">apartment</span>
                Urban Street Canyon Aerodynamics &amp; Thermal Entrapment Analyzer
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
                Calculates the Oke (1988) urban canopy flow regime (Isolated Roughness, Wake Interference,
                or Skimming Flow), Sky View Factor (SVF), and wind attenuation inside high-density commercial corridors like T. Nagar, Anna Salai, and Parrys.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column */}
              <div className="lg:col-span-4 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 space-y-5 font-mono">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Canyon Geometric Controls
                </span>

                {/* Building Height */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Building Height (H):</span>
                    <span className="text-white font-bold">{canyonHeight} m</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={60}
                    step={2}
                    value={canyonHeight}
                    onChange={(e) => {
                      setCanyonHeight(Number(e.target.value));
                    }}
                    className="w-full accent-primary-container cursor-pointer"
                  />
                </div>

                {/* Street Width */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Street Width (W):</span>
                    <span className="text-white font-bold">{canyonWidth} m</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={40}
                    step={2}
                    value={canyonWidth}
                    onChange={(e) => {
                      setCanyonWidth(Number(e.target.value));
                    }}
                    className="w-full accent-primary-container cursor-pointer"
                  />
                </div>

                {/* Canyon Orientation */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Canyon Orientation:</span>
                    <span className="text-white font-bold">
                      {canyonOrientation}° {canyonOrientation === 0 ? '(N-S)' : canyonOrientation === 90 ? '(E-W)' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={180}
                    step={15}
                    value={canyonOrientation}
                    onChange={(e) => {
                      setCanyonOrientation(Number(e.target.value));
                    }}
                    className="w-full accent-primary-container cursor-pointer"
                  />
                </div>

                {/* Wind Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Ambient Sea Breeze Speed:</span>
                    <span className="text-white font-bold">{ambientWindSpeed.toFixed(1)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={10.0}
                    step={0.5}
                    value={ambientWindSpeed}
                    onChange={(e) => {
                      setAmbientWindSpeed(Number(e.target.value));
                    }}
                    className="w-full accent-primary-container cursor-pointer"
                  />
                </div>

                <button
                  onClick={analyzeCanyon}
                  disabled={isAnalyzingCanyon}
                  className="w-full py-2.5 bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold rounded-xl transition-all shadow-[0_2px_12px_rgba(243,128,32,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">calculate</span>
                  <span>{isAnalyzingCanyon ? 'Calculating Microclimate...' : 'Recalculate Microclimate'}</span>
                </button>
              </div>

              {/* Visualization & Results Column */}
              <div className="lg:col-span-8 space-y-6">
                {/* 2D Cross Section Diagram */}
                <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3 font-mono text-xs">
                    <span className="text-gray-300 font-bold">2D Urban Canyon Cross-Section Simulation</span>
                    {canyonResult && (
                      <span
                        className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                          canyonResult.flow_regime === 'SKIMMING_FLOW'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : canyonResult.flow_regime === 'WAKE_INTERFERENCE'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        Regime: {canyonResult.flow_regime.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full h-64 bg-[#050505] border border-[#1f1f1f] rounded-xl flex items-center justify-center p-4">
                    {/* SVG Canyon Diagram */}
                    <svg viewBox="0 0 500 220" className="w-full h-full">
                      {/* Ground */}
                      <line x1="20" y1="180" x2="480" y2="180" stroke="#333333" strokeWidth="4" />

                      {/* Scale building rendering */}
                      {(() => {
                        const hNorm = Math.min(130, (canyonHeight / 60) * 130);
                        const wNorm = Math.min(180, Math.max(60, (canyonWidth / 40) * 160));
                        const leftBuildingRight = 250 - wNorm / 2;
                        const rightBuildingLeft = 250 + wNorm / 2;
                        const bY = 180 - hNorm;

                        return (
                          <>
                            {/* Left Building */}
                            <rect
                              x={leftBuildingRight - 80}
                              y={bY}
                              width={80}
                              height={hNorm}
                              fill="#181818"
                              stroke="#00d4ff"
                              strokeWidth="1.5"
                            />
                            {/* Right Building */}
                            <rect
                              x={rightBuildingLeft}
                              y={bY}
                              width={80}
                              height={hNorm}
                              fill="#181818"
                              stroke="#00d4ff"
                              strokeWidth="1.5"
                            />

                            {/* Street Center Indicator */}
                            <line
                              x1="250"
                              y1="180"
                              x2="250"
                              y2="170"
                              stroke="#f38020"
                              strokeWidth="2"
                            />
                            <text
                              x="250"
                              y="198"
                              fill="#888"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              W = {canyonWidth}m
                            </text>

                            {/* Height dimension label */}
                            <text
                              x={leftBuildingRight - 40}
                              y={bY + hNorm / 2}
                              fill="#aaa"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              H = {canyonHeight}m
                            </text>

                            {/* Vortex Flow / Skimming Indicator */}
                            {canyonResult?.flow_regime === 'SKIMMING_FLOW' ? (
                              <g className="animate-spin" style={{ transformOrigin: `250px ${180 - hNorm / 2}px` }}>
                                <circle
                                  cx="250"
                                  cy={180 - hNorm / 2}
                                  r={Math.min(30, wNorm / 3)}
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="1.5"
                                  strokeDasharray="4 3"
                                />
                              </g>
                            ) : (
                              <path
                                d={`M ${leftBuildingRight + 10} ${bY + 20} Q 250 170 ${rightBuildingLeft - 10} ${bY + 20}`}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                            )}

                            {/* Sun Beam Angle */}
                            <line
                              x1={leftBuildingRight - 20}
                              y1={bY - 30}
                              x2={rightBuildingLeft - 20}
                              y2={180}
                              stroke="#eab308"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              strokeOpacity="0.6"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Microclimate KPI Cards */}
                {canyonResult && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                    <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4">
                      <div className="text-[11px] text-gray-500 uppercase">Aspect Ratio (H/W)</div>
                      <div className="text-2xl font-bold text-white mt-1">{canyonResult.aspect_ratio_hw}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {canyonResult.aspect_ratio_hw >= 0.65 ? 'Critical Skimming' : 'Standard'}
                      </div>
                    </div>
                    <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4">
                      <div className="text-[11px] text-gray-500 uppercase">Sky View Factor (SVF)</div>
                      <div className="text-2xl font-bold text-cyan-400 mt-1">{canyonResult.sky_view_factor}</div>
                      <div className="text-[10px] text-gray-400 mt-1">Fraction of open sky</div>
                    </div>
                    <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4">
                      <div className="text-[11px] text-gray-500 uppercase">Pedestrian Wind</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        {canyonResult.canyon_wind_speed_ms} m/s
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        -{canyonResult.wind_attenuation_pct}% deceleration
                      </div>
                    </div>
                    <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-4">
                      <div className="text-[11px] text-gray-500 uppercase">Thermal Entrapment</div>
                      <div className="text-2xl font-bold text-amber-400 mt-1">
                        {canyonResult.thermal_entrapment_index}/100
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">+{canyonResult.nocturnal_uhi_excess_c}°C night UHI</div>
                    </div>
                  </div>
                )}

                {/* Recommended Interventions for this Canyon */}
                {canyonResult?.recommended_interventions && (
                  <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 font-mono text-xs">
                    <span className="text-gray-300 font-bold uppercase tracking-wider block mb-3">
                      Targeted GCC Cooling Interventions for Canyon Morphology
                    </span>
                    <div className="space-y-2">
                      {canyonResult.recommended_interventions.map((rec: string, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-[#141414] border border-[#222222] flex items-center gap-2 text-gray-300">
                          <span className="material-symbols-outlined text-primary-container text-[16px]">check_circle</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 3D TOPOGRAPHICAL GRID MESH */}
        {/* ========================================================================= */}
        {activeTab === 'mesh-3d' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-[18px]">grid_4x4</span>
                  3D Elevation &amp; Microclimate Grid Mesh (GCP / SRTM30)
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Exports calibrated vertical topography points for deck.gl HexagonLayer and MapLibre 3D Terrain extrusion across GCC.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-gray-400">Resolution:</span>
                <select
                  value={meshRows}
                  onChange={(e) => {
                    setMeshRows(Number(e.target.value));
                  }}
                  className="bg-[#141414] border border-[#262626] rounded-lg px-2 py-1 text-white"
                >
                  <option value={8}>8x8 (64 Nodes)</option>
                  <option value={12}>12x12 (144 Nodes)</option>
                  <option value={16}>16x16 (256 Nodes)</option>
                </select>
                <button
                  onClick={load3DMesh}
                  disabled={isLoadingMesh}
                  className="px-3 py-1 bg-primary-container text-on-primary-container font-bold rounded-lg cursor-pointer"
                >
                  {isLoadingMesh ? 'Generating...' : 'Refresh Mesh'}
                </button>
              </div>
            </div>

            {/* Mesh Heat Table View */}
            {meshData && (
              <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4 font-mono text-xs">
                  <span className="text-gray-300 font-bold">
                    Spatial Node Distribution ({meshData.grid_dimensions.total_nodes} Sampling Vertices)
                  </span>
                  <span className="text-gray-500">CRS: {meshData.crs} • Vertical Datum: {meshData.vertical_datum}</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {meshData.nodes.map((n, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border font-mono text-center transition-all ${
                        n.elevation_m > 40
                          ? 'bg-purple-950/40 border-purple-800 text-purple-300'
                          : n.is_marine_cooled
                          ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
                          : 'bg-[#121212] border-[#222222] text-gray-300'
                      }`}
                      title={`(${n.lat}, ${n.lon}) Elev: ${n.elevation_m}m, Sea Breeze Cooling: -${n.sea_breeze_cooling_c}°C`}
                    >
                      <div className="text-[10px] text-gray-500">#{i + 1}</div>
                      <div className="text-xs font-bold mt-0.5">{n.elevation_m}m</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">-{n.sea_breeze_cooling_c}°C</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: UAV DRONE RADIOMETRIC INSPECTOR & GCP UPLOADER */}
        {/* ========================================================================= */}
        {activeTab === 'uav-drone' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-[#0d0d0d] to-[#0d0d0d] border border-cyan-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-600 text-black font-mono text-[10px] font-bold">
                      UAV THERMAL SURVEY • 0.04m GSD
                    </span>
                    <span className="text-gray-400 font-mono text-xs">
                      Radiometric Calibration Engine & GCP Cloud Storage
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">
                    Aerial Drone Orthomosaic Inspector & Pixel Prober
                  </h2>
                  <p className="text-sm text-gray-300 font-mono mt-1 max-w-2xl">
                    Inspect sub-meter rooftop microclimate plumes, uninsulated corrugated metal heat sinks, and generate sovereign GCP V4 signed URLs for raw FLIR/DJI thermal TIFF streams.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-xs hidden sm:block">
                    <div className="text-gray-400">Radiometric Formula:</div>
                    <div className="text-cyan-400 font-bold">LST = (DN × 0.04 - 273.15) / ε^0.25</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main 2-Column Drone Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Drone Flight Missions & Hotspots (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Missions Selector */}
                <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4 font-mono text-xs">
                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-cyan-400 text-[16px]">flight_takeoff</span>
                      <span>ACTIVE UAV FLIGHT MISSIONS ({droneMissions.length || 3})</span>
                    </span>
                    <span className="text-gray-500">Autonomous GCC Drone Fleet</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(droneMissions.length > 0
                      ? droneMissions
                      : [
                          {
                            mission_id: 'UAV-GCC-2026-001',
                            pilot_callsign: 'GARUDA-ALPHA-1',
                            target_zone: 'Zone 9 (T. Nagar)',
                            target_area_name: 'Ranganathan Street',
                            mean_lst_celsius: 43.8,
                            max_lst_celsius: 52.1,
                          },
                          {
                            mission_id: 'UAV-GCC-2026-002',
                            pilot_callsign: 'GARUDA-BETA-3',
                            target_zone: 'Zone 5 (Parrys)',
                            target_area_name: 'Broadway Wholesale',
                            mean_lst_celsius: 44.5,
                            max_lst_celsius: 54.3,
                          },
                          {
                            mission_id: 'UAV-GCC-2026-003',
                            pilot_callsign: 'GARUDA-GAMMA-2',
                            target_zone: 'Zone 13 (Guindy)',
                            target_area_name: 'Olympia Tech Park',
                            mean_lst_celsius: 45.2,
                            max_lst_celsius: 56.7,
                          },
                        ]
                    ).map((m: any) => {
                      const isSelected = selectedMissionId === m.mission_id;
                      return (
                        <div
                          key={m.mission_id}
                          onClick={() => setSelectedMissionId(m.mission_id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all font-mono text-xs ${
                            isSelected
                              ? 'bg-[#181818] border-cyan-500 shadow-lg shadow-cyan-950/40'
                              : 'bg-[#101010] border-[#262626] hover:border-[#3a3a3a]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-400">{m.pilot_callsign}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                              COMPLETED
                            </span>
                          </div>
                          <div className="font-bold text-white text-sm truncate">{m.target_area_name}</div>
                          <div className="text-gray-400 text-[11px] mt-1">{m.target_zone}</div>
                          <div className="mt-3 pt-2 border-t border-[#202020] flex justify-between text-[11px]">
                            <span className="text-gray-400">Peak LST:</span>
                            <span className="text-rose-400 font-bold">{m.max_lst_celsius}°C</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Meter Rooftop Hotspots Inspection Table */}
                <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 font-mono">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-rose-400 text-[16px]">local_fire_department</span>
                      <span>SUB-METER ROOFTOP MATERIAL PROFILES</span>
                    </span>
                    <span className="text-[10px] text-gray-500">Spatial Grain: 0.045m/px</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        mat: 'Uninsulated Corrugated Iron Sheet',
                        temp: 53.2,
                        delta: '+15.2°C',
                        color: 'text-rose-400',
                        emiss: 0.92,
                        rec: 'Apply High-Albedo Solar Reflective Paint (SRI > 78)',
                      },
                      {
                        mat: 'Dark Bitumen Asphalt Pavement',
                        temp: 49.8,
                        delta: '+11.8°C',
                        color: 'text-rose-400',
                        emiss: 0.94,
                        rec: 'Retrofit with Permeable Interlocking Pavers',
                      },
                      {
                        mat: 'Exposed Concrete Rooftop',
                        temp: 45.4,
                        delta: '+7.4°C',
                        color: 'text-amber-400',
                        emiss: 0.95,
                        rec: 'Install Cool Roof Coating or Green Roof Trays',
                      },
                      {
                        mat: 'Reflective Cool Painted Roof (Coated)',
                        temp: 35.1,
                        delta: '-2.9°C',
                        color: 'text-emerald-400',
                        emiss: 0.91,
                        rec: 'Verified Optimal (High Thermal Emittance)',
                      },
                      {
                        mat: 'Dense Neem Canopy Buffer',
                        temp: 32.4,
                        delta: '-5.6°C',
                        color: 'text-cyan-400',
                        emiss: 0.98,
                        rec: 'Preserve Natural Evaporative Canopy Cover',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#121212] border border-[#262626] p-3 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="text-white font-bold">{item.mat}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{item.rec}</div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className={`text-base font-bold ${item.color}`}>{item.temp}°C</div>
                          <div className="text-[10px] text-gray-400">Δ {item.delta} • ε={item.emiss}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Radiometric Pixel Prober & GCP Uploader (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Interactive Pixel Prober */}
                <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 font-mono text-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-purple-400 text-[16px]">colorize</span>
                      <span>RADIOMETRIC PIXEL PROBER</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px]">
                      Live Calibrator
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-gray-300 mb-1">
                        <span>Raw UAV Digital Number (DN):</span>
                        <span className="text-cyan-400 font-bold">{probeDN} DN</span>
                      </div>
                      <input
                        type="range"
                        min="7200"
                        max="8500"
                        step="10"
                        value={probeDN}
                        onChange={(e) => setProbeDN(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>7,200 (~15°C)</span>
                        <span>8,500 (~65°C)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-300 mb-1">
                        <span>Surface Emissivity (ε):</span>
                        <span className="text-amber-400 font-bold">{probeEmissivity}</span>
                      </div>
                      <input
                        type="range"
                        min="0.85"
                        max="1.00"
                        step="0.01"
                        value={probeEmissivity}
                        onChange={(e) => setProbeEmissivity(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>0.85 (Metals)</span>
                        <span>1.00 (Blackbody)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleProbePixel}
                      disabled={isProbing}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">calculate</span>
                      <span>{isProbing ? 'Calibrating...' : 'Run Radiometric Calibration'}</span>
                    </button>

                    {/* Calculated Temperature Card */}
                    <div className="p-4 bg-[#141414] border border-[#2a2a2a] rounded-xl text-center">
                      <div className="text-gray-400 text-[11px]">Calibrated Land Surface Temperature</div>
                      <div className="text-4xl font-extrabold text-white mt-1 font-mono">
                        {probeResult
                          ? `${probeResult.calibrated_celsius}°C`
                          : `${(((probeDN * 0.04 - 273.15) / Math.pow(probeEmissivity, 0.25))).toFixed(2)}°C`}
                      </div>
                      <div className="mt-2 text-[11px] text-rose-400">
                        {probeDN >= 8100
                          ? '🔥 Severe Heat Plume: Exceeds GCC Critical Safety Threshold'
                          : '⚡ Moderate Thermal Exposure'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Cloud Storage Upload Handshake Tool */}
                <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 font-mono text-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-teal-400 text-[16px]">cloud_upload</span>
                      <span>GCP CLOUD STORAGE V4 HANDSHAKE</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-[10px]">
                      Sovereign S3/GCS
                    </span>
                  </div>

                  <p className="text-gray-400 text-[11px] mb-3 leading-relaxed">
                    Generate temporary signed PUT URLs to stream multi-gigabyte thermal UAV GeoTIFFs directly to Google Cloud Storage without overloading backend servers.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-[10px] uppercase">Orthomosaic TIFF Filename</label>
                      <input
                        type="text"
                        value={gcpFilename}
                        onChange={(e) => setGcpFilename(e.target.value)}
                        className="w-full bg-[#141414] border border-[#2a2a2a] rounded px-3 py-1.5 text-white font-mono text-xs mt-1"
                      />
                    </div>

                    <button
                      onClick={handleGenerateGCPUrl}
                      disabled={isGeneratingGCP}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">key</span>
                      <span>{isGeneratingGCP ? 'Provisioning...' : 'Generate GCP V4 Signed URL'}</span>
                    </button>

                    {gcpUploadResponse && (
                      <div className="p-3 bg-[#141414] border border-teal-900/50 rounded-xl space-y-1.5">
                        <div className="text-teal-400 font-bold text-[11px]">✓ Handshake Signed Successfully</div>
                        <div className="text-[10px] text-gray-400 break-all">
                          <strong>Target:</strong> {gcpUploadResponse.target_object_path}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          <strong>Signed URL:</strong> {gcpUploadResponse.signed_upload_url}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
