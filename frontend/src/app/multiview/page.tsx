'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiClient } from '@/lib/api-client';
import { TenderManifest } from '@/lib/types';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';
import { downloadGeoJSON } from '@/lib/export-utils';
import { HeatScapeLogo } from '@/components/brand/HeatScapeLogo';

type SpatialMode = 'thermal' | 'satellite' | 'street' | 'vulnerability';
type WardTab = 'overview' | 'whymatters' | 'interventions' | 'historical';

interface WardDetail {
  id: string;
  name: string;
  zone: string;
  secCode: string;
  anomaly: string;
  trend: string;
  status: string;
  population: string;
  density: string;
  sensitiveHubs: string;
  sensitiveDetails: string;
  impervious: string;
  canopy: string;
  forecast2027: string;
  center: [number, number];
}

const MAP_STYLES: Record<string, string> = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};

const WARDS_DATA: Record<string, WardDetail> = {
  '114': {
    id: '114',
    name: 'Teynampet • Ward 114',
    zone: 'Zone IX (Teynampet South), Anna Salai & GN Chetty Grid',
    secCode: 'WARD-114 • SEC-4B',
    anomaly: '+2.8°C',
    trend: '+0.03°C / mo',
    status: 'EMERGING',
    population: '4,180',
    density: '28,400/km²',
    sensitiveHubs: '2 Schools',
    sensitiveDetails: '1 Maternity Clinic, 1 Daycare',
    impervious: '84%',
    canopy: '4.1%',
    forecast2027: '+3.6°C',
    center: [80.245, 13.040],
  },
  '117': {
    id: '117',
    name: 'T. Nagar Core • Ward 117',
    zone: 'Zone X (Kodambakkam), Usman Rd & Pondy Bazaar Corridor',
    secCode: 'WARD-117 • SEC-1A',
    anomaly: '+4.2°C',
    trend: '+0.05°C / mo',
    status: 'PERSISTENT',
    population: '6,420',
    density: '38,200/km²',
    sensitiveHubs: '4 Schools',
    sensitiveDetails: '2 Hospitals, 1 Bus Terminus',
    impervious: '93%',
    canopy: '2.3%',
    forecast2027: '+4.9°C',
    center: [80.233, 13.041],
  },
  '119': {
    id: '119',
    name: 'CIT Nagar • Ward 119',
    zone: 'Zone X (South Extension), South Usman & Venkatanarayana',
    secCode: 'WARD-119 • SEC-3C',
    anomaly: '+1.8°C',
    trend: '+0.02°C / mo',
    status: 'WATCH',
    population: '3,890',
    density: '22,100/km²',
    sensitiveHubs: '1 School',
    sensitiveDetails: '1 Urban Health Post',
    impervious: '76%',
    canopy: '7.8%',
    forecast2027: '+2.4°C',
    center: [80.228, 13.030],
  },
};

const CHENNAI_PRESETS: Record<string, { center: [number, number]; key: string }> = {
  'teynampet': { center: [80.245, 13.040], key: '114' },
  't. nagar': { center: [80.233, 13.041], key: '117' },
  'tnagar': { center: [80.233, 13.041], key: '117' },
  'cit nagar': { center: [80.228, 13.030], key: '119' },
  'guindy': { center: [80.212, 13.008], key: '117' },
  'george town': { center: [80.285, 13.090], key: '117' },
  'anna nagar': { center: [80.215, 13.085], key: '114' },
  'velachery': { center: [80.220, 12.975], key: '119' },
};

export default function MultiViewScreen() {
  const [activeMode, setActiveMode] = useState<SpatialMode>('thermal');
  const [activeTab, setActiveTab] = useState<WardTab>('overview');
  const [selectedWardKey, setSelectedWardKey] = useState<string>('114');
  const [selectedCellId, setSelectedCellId] = useState<string>('CHE_1042');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('Ward 114 • Teynampet');
  const [filterState, setFilterState] = useState<'all' | 'emerging' | 'hotspots'>('all');
  const [tenderModalOpen, setTenderModalOpen] = useState<boolean>(false);
  const [sensorModalOpen, setSensorModalOpen] = useState<boolean>(false);
  const [tenderManifest, setTenderManifest] = useState<TenderManifest | null>(null);
  const [tenderLoading, setTenderLoading] = useState<boolean>(false);
  const [is3DTilt, setIs3DTilt] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const storedDataRef = useRef<any>(null);
  const currentBaseStyleRef = useRef<'dark' | 'voyager'>('dark');
  const activeModeRef = useRef<SpatialMode>(activeMode);
  activeModeRef.current = activeMode;

  const currentWard = WARDS_DATA[selectedWardKey] || WARDS_DATA['114'];

  const applyModePaint = (map: maplibregl.Map, mode: SpatialMode) => {
    if (!map) return;
    if (storedDataRef.current && !map.getLayer('heat-cells-fill')) {
      setupMapLayers(map, storedDataRef.current);
    }
    if (!map.getLayer('heat-cells-fill')) return;
    try {
      if (mode === 'thermal') {
        map.setPaintProperty('heat-cells-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'mean_anomaly'], ['get', 'contextual_anomaly_celsius'], 2.4],
          0.0, '#38bdf8',  // Cool marine blue (< 1.0°C)
          1.5, '#34d399',  // Normal green (1.5°C)
          2.5, '#fbbf24',  // Moderate amber (2.5°C)
          3.5, '#fb923c',  // Elevated orange (3.5°C)
          4.5, '#ef4444',  // Severe hotspot red (4.5°C)
          5.5, '#991b1b',  // Critical core crimson (> 5.5°C)
        ]);
        map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.82);
      } else if (mode === 'satellite') {
        map.setPaintProperty('heat-cells-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'tree_canopy_fraction'], 0.05],
          0.00, '#292524', // Deficit stone/concrete barren
          0.04, '#57534e', // Minimal vegetation
          0.08, '#84cc16', // Sparse canopy lime
          0.15, '#22c55e', // Moderate canopy green
          0.25, '#15803d', // Healthy canopy emerald
          0.35, '#052e16', // Dense lush forest
        ]);
        map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.85);
      } else if (mode === 'street') {
        map.setPaintProperty('heat-cells-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'impervious_fraction'], 0.8],
          0.20, '#0ea5e9', // Cool pervious / soil / park
          0.50, '#38bdf8', // Semi-pervious
          0.70, '#fbbf24', // Urban built amber
          0.85, '#f97316', // Dense asphalt orange
          0.95, '#ef4444', // High heat absorbing sealed concrete
        ]);
        map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.78);
      } else if (mode === 'vulnerability') {
        map.setPaintProperty('heat-cells-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'population_density_sqkm'], 4000],
          1000, '#06b6d4',  // Low exposure cyan
          8000, '#6366f1',  // Moderate indigo
          18000, '#a855f7', // High purple
          28000, '#ec4899', // Dense pink
          40000, '#e11d48', // Extreme crimson
        ]);
        map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.85);
      }
    } catch (err) {
      console.warn('Could not apply mode paint:', err);
    }
  };

  const setupMapLayers = (map: maplibregl.Map, data: any) => {
    if (!map || !data) return;

    if (!map.getSource('heat-cells')) {
      map.addSource('heat-cells', {
        type: 'geojson',
        data: data,
      });
    }

    if (!map.getLayer('heat-cells-fill')) {
      map.addLayer({
        id: 'heat-cells-fill',
        type: 'fill',
        source: 'heat-cells',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'mean_anomaly'], ['get', 'contextual_anomaly_celsius'], 2.4],
            0.0, '#38bdf8',
            1.5, '#34d399',
            2.5, '#fbbf24',
            3.5, '#fb923c',
            4.5, '#ef4444',
            5.5, '#991b1b',
          ],
          'fill-opacity': 0.82,
        },
      });
    }

    if (!map.getLayer('heat-cells-line')) {
      map.addLayer({
        id: 'heat-cells-line',
        type: 'line',
        source: 'heat-cells',
        paint: {
          'line-color': '#0f172a',
          'line-width': 0.8,
          'line-opacity': 0.75,
        },
      });
    }

    if (!map.getLayer('heat-cell-selected-outline')) {
      map.addLayer({
        id: 'heat-cell-selected-outline',
        type: 'line',
        source: 'heat-cells',
        paint: {
          'line-color': '#00f0ff',
          'line-width': 3.5,
          'line-opacity': 1.0,
        },
        filter: ['==', ['get', 'cell_id'], selectedCellId],
      });
    }

    const showHoverPopup = (e: any) => {
      if (!e.features || !e.features[0]) return;
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const stateBadge =
        p.trajectory_state === 'PERSISTENT'
          ? '<span style="background:rgba(217,119,87,0.25);color:#D97757;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">PERSISTENT</span>'
          : p.trajectory_state === 'EMERGING'
          ? '<span style="background:rgba(239,68,68,0.25);color:#ef4444;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">EMERGING</span>'
          : '<span style="background:rgba(16,185,129,0.25);color:#10b981;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">IMPROVING</span>';

      const html = `
        <div style="background:#09090b;border:1px solid #3f3f46;border-radius:10px;padding:8px 12px;font-family:ui-monospace,monospace;font-size:11px;color:#f4f4f5;box-shadow:0 8px 24px rgba(0,0,0,0.8);min-width:180px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;">
            <strong style="color:#38bdf8;">Cell ${p.cell_id || 'CHE_1042'}</strong>
            ${stateBadge}
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px;">
            <span style="color:#a1a1aa;">Surface Anomaly:</span>
            <span style="color:#fb923c;font-weight:bold;">+${Number(p.mean_anomaly || p.contextual_anomaly_celsius || 2.4).toFixed(1)}°C</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px;">
            <span style="color:#a1a1aa;">Tree Canopy:</span>
            <span style="color:#4ade80;">${(Number(p.tree_canopy_fraction || 0.05) * 100).toFixed(1)}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px;">
            <span style="color:#a1a1aa;">Impervious:</span>
            <span style="color:#cbd5e1;">${(Number(p.impervious_fraction || 0.82) * 100).toFixed(0)}%</span>
          </div>
        </div>
      `;
      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'custom-heatscape-popup',
          offset: 14,
        });
      }
      popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
    };

    const hideHoverPopup = () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) popupRef.current.remove();
    };

    map.on('mousemove', 'heat-cells-fill', showHoverPopup);
    map.on('mouseleave', 'heat-cells-fill', hideHoverPopup);

    map.on('click', 'heat-cells-fill', (e) => {
      if (!e.features || !e.features[0]) return;
      const p = e.features[0].properties;
      const cid = p.cell_id || 'CHE_1042';
      setSelectedCellId(cid);
      setDrawerOpen(true);

      if (map.getLayer('heat-cell-selected-outline')) {
        map.setFilter('heat-cell-selected-outline', ['==', ['get', 'cell_id'], cid]);
      }

      // Update current ward view if it matches a preset or updates custom
      const matchedKey = Object.keys(WARDS_DATA).find((k) =>
        (p.ward_id || '').includes(k) || (p.ward_name || '').includes(WARDS_DATA[k].name)
      );
      if (matchedKey) {
        setSelectedWardKey(matchedKey);
        setSearchQuery(WARDS_DATA[matchedKey].name);
      }
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const initialStyle = activeMode === 'street' ? MAP_STYLES.voyager : MAP_STYLES.dark;
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: initialStyle,
        center: [80.24, 13.04],
        zoom: 12.6,
        pitch: 0,
        attributionControl: false,
      });

      map.on('load', async () => {
        try {
          const data = await apiClient.getCellsGeoJSON();
          if (!data) return;
          storedDataRef.current = data;
          setupMapLayers(map, data);
          applyModePaint(map, activeMode);
        } catch (err) {
          console.warn('Multiview map data loading failed:', err);
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.warn('MapLibre GL failed to initialize in MultiView:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update mode paint when activeMode changes
  const handleModeChange = (newMode: SpatialMode) => {
    setActiveMode(newMode);
    activeModeRef.current = newMode;
    const map = mapRef.current;
    if (!map) return;

    const desiredStyleName: 'dark' | 'voyager' = newMode === 'street' ? 'voyager' : 'dark';

    // Only reload the style if we need a different basemap (e.g. Dark Matter vs Voyager Street)
    if (desiredStyleName !== currentBaseStyleRef.current) {
      currentBaseStyleRef.current = desiredStyleName;
      map.setStyle(MAP_STYLES[desiredStyleName]);
      map.once('style.load', () => {
        if (storedDataRef.current) {
          setupMapLayers(map, storedDataRef.current);
          applyModePaint(map, activeModeRef.current);
        }
      });
    } else {
      // Same basemap style: instantly switch paint without tearing down the map
      if (storedDataRef.current && !map.getLayer('heat-cells-fill')) {
        setupMapLayers(map, storedDataRef.current);
      }
      applyModePaint(map, newMode);
    }
  };

  const handleSelectWard = (key: string) => {
    setSelectedWardKey(key);
    setDrawerOpen(true);
    setSearchQuery(WARDS_DATA[key]?.name || '');

    const target = WARDS_DATA[key];
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: target.center,
        zoom: 14.5,
        duration: 1000,
      });
    }
  };

  const handleFilter = (filter: 'all' | 'emerging' | 'hotspots') => {
    setFilterState(filter);
    const map = mapRef.current;
    if (!map || !map.getLayer('heat-cells-fill')) return;

    if (filter === 'all') {
      map.setFilter('heat-cells-fill', null);
    } else if (filter === 'emerging') {
      map.setFilter('heat-cells-fill', ['==', ['get', 'trajectory_state'], 'EMERGING']);
    } else if (filter === 'hotspots') {
      map.setFilter('heat-cells-fill', ['==', ['get', 'trajectory_state'], 'PERSISTENT']);
    }
  };

  const handleFetchTender = async () => {
    setTenderLoading(true);
    setTenderModalOpen(true);
    try {
      const data = await apiClient.getTenderManifest({
        budget_inr: 5000000,
        mode: 'EXPECTED',
        target_wards: [currentWard.name],
        equity_weight: 0.6,
        contiguity_priority: true,
      });
      setTenderManifest(data);
    } catch (err) {
      console.error('Failed to generate tender manifest', err);
    } finally {
      setTenderLoading(false);
    }
  };

  const handleExportGISData = async () => {
    try {
      const data = await apiClient.getCellsGeoJSON();
      downloadGeoJSON(data, 'chennai_heatscape_100m_grid.geojson');
    } catch (err) {
      console.error('Failed to export GeoJSON:', err);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    const matchedKey = Object.keys(CHENNAI_PRESETS).find((k) => q.includes(k) || k.includes(q));
    if (matchedKey) {
      const preset = CHENNAI_PRESETS[matchedKey];
      setSelectedWardKey(preset.key);
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: preset.center,
          zoom: 14.5,
          duration: 1100,
        });
      }
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Main Navigation Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container-highest/40 shadow-sm">
        <div className="w-full h-header-height px-gutter-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0">
              <HeatScapeLogo size={32} animate={true} />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight hidden sm:inline-block">
                Heat<span className="text-[#D97757]">Scape</span>
              </span>
            </Link>
            <div className="h-4 w-px bg-surface-container-highest/60 hidden md:block" />
            <div className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low border border-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">radar</span>
              <span className="text-on-surface font-medium">Chennai Metropolitan Region</span>
              <span className="text-outline/60">•</span>
              <span className="flex items-center gap-1 text-tertiary font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
                </span>
                Multi-View Matrix
              </span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-surface-container-low border border-surface-container-highest/40 text-label-sm">
            <Link
              href="/"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Overview
            </Link>
            <Link
              href="/explorer"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Trajectories Map
            </Link>
            <Link
              href="/multiview"
              className="px-space-md py-1 rounded-full bg-surface-container-high text-on-surface font-semibold shadow-sm"
            >
              Multi-View
            </Link>
            <Link
              href="/simulator"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Scenario Simulator
            </Link>
            <Link
              href="/monitoring"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Impact Monitoring
            </Link>
            <Link
              href="/intelligence"
              className="px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              Urban Intelligence
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setSensorModalOpen(true)}
              className="hidden xl:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/15 hover:bg-tertiary-container/30 border border-tertiary/30 hover:border-tertiary text-tertiary font-label-sm text-label-sm transition-all cursor-pointer shadow-sm"
              title="Click to view live 842 IoT sensor telemetry"
            >
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-medium">842 Sensors • Healthy</span>
            </button>
            <button
              onClick={handleExportGISData}
              className="flex items-center gap-1.5 px-space-md py-1 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#2e2e2e] hover:border-emerald-500 text-emerald-400 font-label-sm text-label-sm font-semibold transition-all cursor-pointer shadow-sm"
              title="Download Chennai 100m Grid GeoJSON for QGIS / ArcGIS Pro"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="hidden sm:inline">Export GeoJSON</span>
            </button>
            <button
              onClick={handleFetchTender}
              className="flex items-center gap-1.5 px-space-md py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span className="hidden sm:inline">Tender BOQ</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header Context Bar */}
      <section className="sticky top-header-height z-30 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest/40">
        <div className="w-full px-gutter-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
            <span>GCC Command</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Microclimate Ops</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-medium">Multi-View Thermal, NDVI & Infrastructure Matrix</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all">
              <span className="material-symbols-outlined text-[16px]">date_range</span>
              <span>Last 24 Hours</span>
            </button>
            <button
              onClick={() => {
                const geojsonBlob = new Blob([JSON.stringify(currentWard, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(geojsonBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentWard.secCode}_Telemetry.json`;
                a.click();
              }}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Telemetry</span>
            </button>
            <Link
              href={`/simulator?ward=${selectedWardKey}`}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Run Simulation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Full-Height Spatial Canvas */}
      <main className="relative w-full h-[calc(100vh-theme(spacing.header-height)-3.25rem)] overflow-hidden bg-surface-container-lowest select-none">
        {/* Interactive MapLibre GL Canvas */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Top Controls Bar: Search & Mode Segmented Switcher */}
        <div className="absolute top-4 inset-x-6 z-30 flex items-center justify-between gap-4 pointer-events-none">
          {/* Left: Search input */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 pointer-events-auto p-1.5 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-container-highest/60 shadow-xl w-80"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant flex-1 focus-within:text-on-surface border border-surface-container-highest/40">
              <span className="material-symbols-outlined text-[18px] text-primary-container">search</span>
              <input
                className="w-full bg-transparent text-on-surface font-label-md text-label-md outline-none placeholder:text-outline/70 font-medium"
                placeholder="Find ward, node or corridor..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="text-outline/60 text-code-sm font-code-sm bg-surface-container-high px-1 py-0.5 rounded border border-surface-container-highest/80">
                CHE
              </span>
            </div>
          </form>

          {/* Center: Multi-View Spatial Mode Segmented Switcher */}
          <div className="pointer-events-auto flex items-center p-1 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-xl">
            <button
              onClick={() => handleModeChange('thermal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all ${
                activeMode === 'thermal'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">thermostat</span>
              <span>Thermal Anomaly</span>
              <span className="px-1.5 py-0.2 rounded-full bg-on-primary-container/20 text-on-primary-container text-[11px] font-bold">
                LST
              </span>
            </button>
            <button
              onClick={() => handleModeChange('satellite')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'satellite'
                  ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">satellite_alt</span>
              <span>Satellite & NDVI</span>
            </button>
            <button
              onClick={() => handleModeChange('street')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'street'
                  ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">alt_route</span>
              <span>Street & Impervious</span>
            </button>
            <button
              onClick={() => handleModeChange('vulnerability')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-label-md font-medium transition-all ${
                activeMode === 'vulnerability'
                  ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
              <span>Vulnerability Matrix</span>
            </button>
          </div>

          {/* Right Quick Filter Pills */}
          <div className="pointer-events-auto hidden xl:flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-highest/60 shadow-xl">
            <button
              onClick={() => handleFilter('all')}
              className={`px-3 py-1 rounded-xl font-label-sm text-label-sm font-medium transition-all ${
                filterState === 'all'
                  ? 'bg-surface-container-high text-on-surface shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              All Wards
            </button>
            <button
              onClick={() => {
                handleFilter('emerging');
                handleSelectWard('114');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-label-sm text-label-sm transition-colors ${
                filterState === 'emerging'
                  ? 'bg-primary-container/20 border border-primary-container text-primary font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span>38 Emerging</span>
            </button>
            <button
              onClick={() => {
                handleFilter('hotspots');
                handleSelectWard('117');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-label-sm text-label-sm transition-colors ${
                filterState === 'hotspots'
                  ? 'bg-error/20 border border-error text-error font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error" />
              <span>126 Hotspots</span>
            </button>
          </div>
        </div>

        {/* Dynamic Bottom-Left Map Legend */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2.5 p-3.5 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-xl w-80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary-container">
                {activeMode === 'satellite'
                  ? 'park'
                  : activeMode === 'street'
                  ? 'domain'
                  : activeMode === 'vulnerability'
                  ? 'groups'
                  : 'device_thermostat'}
              </span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface tracking-wide">
                {activeMode === 'satellite'
                  ? 'NDVI Tree Canopy Scale'
                  : activeMode === 'street'
                  ? 'Built Impervious Ratio'
                  : activeMode === 'vulnerability'
                  ? 'Social Vulnerability Exposure'
                  : 'Thermal Anomaly Scale'}
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-outline px-1.5 py-0.5 rounded bg-surface-container-low border border-surface-container-highest/40">
              100m Grids
            </span>
          </div>

          {/* Divergent Gradient Bar */}
          <div className="relative w-full">
            <div
              className={`w-full h-2.5 rounded-full shadow-inner border border-surface-container-highest/60 ${
                activeMode === 'thermal'
                  ? 'bg-gradient-to-r from-sky-400 via-amber-400 to-red-600'
                  : activeMode === 'satellite'
                  ? 'bg-gradient-to-r from-stone-800 via-lime-500 to-emerald-950'
                  : activeMode === 'street'
                  ? 'bg-gradient-to-r from-sky-500 via-amber-400 to-red-500'
                  : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-600'
              }`}
            />
          </div>

          <div className="flex items-center justify-between font-code-sm text-code-sm pt-0.5">
            {activeMode === 'thermal' && (
              <>
                <div className="flex flex-col">
                  <span className="text-sky-400 font-bold">&lt;1.0°C</span>
                  <span className="text-[11px] font-label-sm text-on-surface-variant">Cool Buffer</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-amber-400 font-semibold">+2.5°C</span>
                  <span className="text-[11px] font-label-sm text-outline">Normal</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-red-500 font-bold">&gt;+5.0°C</span>
                  <span className="text-[11px] font-label-sm text-error">Extreme</span>
                </div>
              </>
            )}
            {activeMode === 'satellite' && (
              <>
                <div className="flex flex-col">
                  <span className="text-stone-400 font-bold">0%</span>
                  <span className="text-[11px] font-label-sm text-on-surface-variant">Barren Soil</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-lime-400 font-semibold">15%</span>
                  <span className="text-[11px] font-label-sm text-outline">Moderate</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-emerald-400 font-bold">&gt;35%</span>
                  <span className="text-[11px] font-label-sm text-emerald-400">Lush Canopy</span>
                </div>
              </>
            )}
            {activeMode === 'street' && (
              <>
                <div className="flex flex-col">
                  <span className="text-sky-400 font-bold">&lt;30%</span>
                  <span className="text-[11px] font-label-sm text-on-surface-variant">Permeable</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-amber-400 font-semibold">70%</span>
                  <span className="text-[11px] font-label-sm text-outline">Built Road</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-red-400 font-bold">&gt;95%</span>
                  <span className="text-[11px] font-label-sm text-error">Sealed Hardscape</span>
                </div>
              </>
            )}
            {activeMode === 'vulnerability' && (
              <>
                <div className="flex flex-col">
                  <span className="text-cyan-400 font-bold">&lt;5k</span>
                  <span className="text-[11px] font-label-sm text-on-surface-variant">Low Exposure</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-purple-400 font-semibold">18k</span>
                  <span className="text-[11px] font-label-sm text-outline">Moderate</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-rose-400 font-bold">&gt;40k</span>
                  <span className="text-[11px] font-label-sm text-rose-400">Dense Risk</span>
                </div>
              </>
            )}
          </div>

          {/* Sensor Live Callout */}
          <div className="pt-2 border-t border-surface-container-highest/50 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              842 IoT Nodes Active
            </span>
            <span className="font-code-sm text-code-sm text-tertiary">±0.2°C accuracy</span>
          </div>
        </div>

        {/* Floating Right Map Navigation Controls */}
        <div
          className={`absolute bottom-6 z-20 flex flex-col gap-1 p-1 rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-highest/60 shadow-xl transition-all duration-300 ${
            drawerOpen ? 'right-[450px]' : 'right-6'
          }`}
        >
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <div className="w-full h-px bg-surface-container-highest/40 my-0.5" />
          <button
            onClick={() => {
              const newTilt = !is3DTilt;
              setIs3DTilt(newTilt);
              mapRef.current?.easeTo({
                pitch: newTilt ? 55 : 0,
                bearing: newTilt ? -20 : 0,
                duration: 900,
              });
            }}
            className={`p-2 rounded-lg transition-colors ${
              is3DTilt
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            title="Toggle 3D Pitch"
          >
            <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
          </button>
          <button
            onClick={() => {
              setIs3DTilt(false);
              mapRef.current?.flyTo({
                center: [80.24, 13.04],
                zoom: 12.6,
                pitch: 0,
                bearing: 0,
                duration: 900,
              });
            }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Reset Center"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
          </button>
        </div>

        {/* Floating Right Detail Drawer */}
        {drawerOpen ? (
          <aside className="absolute top-4 right-6 bottom-6 w-[420px] z-30 flex flex-col rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl overflow-hidden transition-all duration-300">
            {/* Drawer Header */}
            <div className="p-5 pb-4 bg-surface-container-low border-b border-surface-container-highest/60 flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-label-sm font-bold tracking-wide uppercase flex items-center gap-1 ${
                      currentWard.status === 'PERSISTENT'
                        ? 'bg-error/20 border-error/40 text-error'
                        : 'bg-primary-container/20 border-primary-container/40 text-primary'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentWard.status === 'PERSISTENT' ? 'bg-error' : 'bg-primary-container'
                      }`}
                    />
                    {currentWard.status} HOTSPOT
                  </span>
                  <span className="font-code-sm text-code-sm text-outline px-1.5 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
                    {currentWard.secCode}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                  {currentWard.name}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">location_on</span>
                  {currentWard.zone}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Dismiss details"
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors border border-surface-container-highest/60"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* Highlight Metric Tile */}
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-highest/60 flex flex-col gap-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Urban Heat Delta (LST)
                  </span>
                  <span className="flex items-center gap-1 font-code-sm text-code-sm text-primary font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>{' '}
                    {currentWard.trend}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                    {currentWard.anomaly}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                    above GCC 10y baseline
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Projected to compound to{' '}
                  <span className="text-error font-semibold">{currentWard.forecast2027}</span> by Q3 2026
                  without immediate cool pavement reflectance or micro-canopy interventions.
                </p>
              </div>

              {/* Segmented Tabs */}
              <div className="flex p-1 rounded-xl bg-surface-container-low border border-surface-container-highest/60 text-label-sm font-label-sm">
                {(['overview', 'whymatters', 'interventions', 'historical'] as WardTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center capitalize ${
                      activeTab === tab
                        ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                  >
                    {tab === 'whymatters'
                      ? 'Why Hot'
                      : tab === 'interventions'
                      ? 'Interventions'
                      : tab}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <>
                  {/* Trajectory Forecast Curve */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          timeline
                        </span>
                        Thermal Projection (2022-2027)
                      </span>
                      <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-primary font-semibold border border-surface-container-highest/60">
                        94% Confidence
                      </span>
                    </div>
                    <div className="relative w-full h-24 pt-2">
                      <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 320 80">
                        <line stroke="#273647" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="20" y2="20" />
                        <line stroke="#273647" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="50" y2="50" />
                        <polygon fill="#D97757" fillOpacity="0.16" points="180,45 310,12 310,38 180,45" />
                        <path d="M10,65 Q50,60 90,52 T180,45" fill="none" stroke="#00d4ff" strokeLinecap="round" strokeWidth="2.5" />
                        <path d="M180,45 Q240,32 310,24" fill="none" stroke="#D97757" strokeDasharray="4 3" strokeLinecap="round" strokeWidth="2.5" />
                        <circle cx="180" cy="45" fill="#D97757" r="4.5" />
                        <circle cx="310" cy="24" fill="#ef4444" r="4" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between font-code-sm text-code-sm text-outline pt-1">
                      <span>2022 (Actual)</span>
                      <span className="text-on-surface font-semibold">Now ({currentWard.anomaly})</span>
                      <span className="text-error font-bold">2027 ({currentWard.forecast2027})</span>
                    </div>
                  </div>

                  {/* Ward Vulnerability Matrix Bento Grid */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                        Ward Vulnerability Matrix
                      </span>
                      <span className="text-[11px] font-code-sm text-secondary">
                        Zone High Exposure
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Box 1: Population */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">groups</span>
                          <span className="font-label-sm text-label-sm font-medium">Population</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.population}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Density: {currentWard.density}
                        </span>
                      </div>

                      {/* Box 2: Sensitive Hubs */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-tertiary">
                          <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                          <span className="font-label-sm text-label-sm font-medium">Sensitive Hubs</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.sensitiveHubs}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {currentWard.sensitiveDetails}
                        </span>
                      </div>

                      {/* Box 3: Impervious Cover */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-[18px]">domain</span>
                          <span className="font-label-sm text-label-sm font-medium">Impervious Cover</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.impervious}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          High thermal mass asphalt
                        </span>
                      </div>

                      {/* Box 4: Canopy Index */}
                      <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-error">
                          <span className="material-symbols-outlined text-[18px]">park</span>
                          <span className="font-label-sm text-label-sm font-medium">Canopy Index</span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          {currentWard.canopy}
                        </span>
                        <span className="font-body-sm text-body-sm text-error font-medium">
                          Severe Deficit (&lt;15%)
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Why Hot (TreeSHAP Decomposition) */}
              {activeTab === 'whymatters' && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                      TreeSHAP Biophysical Contributors
                    </span>
                    <span className="font-code-sm text-code-sm text-outline">XGBoost Surrogate</span>
                  </div>
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                        <span>Low Albedo Asphalt Pavement</span>
                        <span className="font-code-sm text-error font-bold">+1.24°C</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-error h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                        <span>Tree Canopy Deficit (&lt;5%)</span>
                        <span className="font-code-sm text-primary font-bold">+0.88°C</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                        <span>High Building Density &amp; AC Heat</span>
                        <span className="font-code-sm text-secondary font-bold">+0.68°C</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Street Interventions */}
              {activeTab === 'interventions' && (
                <div className="flex flex-col gap-2.5">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Tamil Nadu PWD Targeted Solutions
                  </span>
                  <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">forest</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-on-surface font-semibold">Miyawaki Urban Pocket Forest</span>
                        <span className="font-body-sm text-on-surface-variant text-[12px]">PWD-HORT-8104 • 400 saplings</span>
                      </div>
                    </div>
                    <span className="font-code-sm text-tertiary font-bold">-1.1°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">roofing</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-on-surface font-semibold">Cool Roof Polyurethane Membrane</span>
                        <span className="font-body-sm text-on-surface-variant text-[12px]">PWD-CIV-4412 • 4,500 m²</span>
                      </div>
                    </div>
                    <span className="font-code-sm text-primary font-bold">-0.8°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-on-surface font-semibold">High-Albedo Permeable Pavers</span>
                        <span className="font-body-sm text-on-surface-variant text-[12px]">PWD-CIV-2915 • 1,200 m²</span>
                      </div>
                    </div>
                    <span className="font-code-sm text-secondary font-bold">-0.5°C</span>
                  </div>
                </div>
              )}

              {/* Tab 4: Historical */}
              {activeTab === 'historical' && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-2.5">
                  <span className="font-label-sm text-on-surface font-semibold">36-Month Satellite Telemetry</span>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>Sen&apos;s Slope Trend</span>
                    <span className="font-code-sm text-error font-bold">+0.038°C / month</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>PELT Change-Point Shift</span>
                    <span className="font-code-sm text-on-surface">March 2024 (Regime Shift)</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>Recurrence Rate</span>
                    <span className="font-code-sm text-primary font-semibold">88.4% of summer passes</span>
                  </div>
                </div>
              )}

              {/* Live Telemetry Station Status */}
              <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center border border-tertiary/20">
                    <span className="material-symbols-outlined text-[18px]">sensors</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Telemetry Node TN-104 (Anna Salai)
                    </span>
                    <span className="font-code-sm text-code-sm text-outline">
                      Updated 40s ago • 38.6°C Ambient • 68% RH
                    </span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
              </div>
            </div>

            {/* Action Bar at Drawer Foot */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/60 flex flex-col gap-2.5">
              <Link
                href={`/simulator?ward=${selectedWardKey}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-bold tracking-wide transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Simulate Cooling Solutions for this Ward</span>
              </Link>
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={handleFetchTender}
                  className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-[15px]">description</span>
                  <span>TN PWD Tender BOQ</span>
                </button>
                <span className="font-code-sm text-code-sm text-outline">
                  Cell Res: 100m² • {currentWard.secCode.split('•')[1]?.trim() || 'CHE_1042'}
                </span>
              </div>
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute top-4 right-6 z-30 p-3 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 text-on-surface hover:text-primary shadow-xl transition-all"
            title="Open Ward Insights"
          >
            <span className="material-symbols-outlined text-[20px]">dock_to_left</span>
          </button>
        )}
      </main>

      {/* Official Tamil Nadu PWD Contractor Tender BOQ Modal */}
      {tenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-surface-container-lowest border border-surface-container-highest/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-surface-container-low border-b border-surface-container-highest/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary-container/40 font-code-sm text-[11px] font-bold">
                    TAMIL NADU PWD SCHEDULE OF RATES (SSR 2024-25)
                  </span>
                  <span className="text-outline text-code-sm font-code-sm">
                    {tenderManifest?.council_resolution_ref || 'GCC-RES-2024/CW-UHI'}
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                  Contractor Bill of Quantities (BOQ) &amp; Tender Manifest
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Greater Chennai Corporation • Special Projects &amp; Microclimate Action Directorate
                </p>
              </div>
              <button
                onClick={() => setTenderModalOpen(false)}
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {tenderLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Formulating Tamil Nadu PWD Rate Specifications...
                  </span>
                </div>
              ) : tenderManifest ? (
                <>
                  {/* Summary Header Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Target Zone</span>
                      <div className="font-bold text-on-surface text-label-md mt-0.5">
                        {tenderManifest.target_zone}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Cells Covered</span>
                      <div className="font-bold text-primary text-label-md mt-0.5">
                        {tenderManifest.total_cells_covered} Spatial Grids
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Population Benefited</span>
                      <div className="font-bold text-tertiary text-label-md mt-0.5">
                        {tenderManifest.population_benefited.toLocaleString()} Residents
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest/40">
                      <span className="text-label-sm font-label-sm text-outline">Expected Cooling</span>
                      <div className="font-bold text-secondary text-label-md mt-0.5">
                        -{tenderManifest.estimated_cooling_celsius}°C Anomaly
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="rounded-xl border border-surface-container-highest/60 overflow-hidden bg-surface-container-low">
                    <table className="w-full text-left font-body-sm text-[13px]">
                      <thead className="bg-surface-container text-on-surface-variant uppercase font-code-sm text-[11px] border-b border-surface-container-highest/60">
                        <tr>
                          <th className="p-3">SSR Item Code</th>
                          <th className="p-3">Description of Work</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Rate (₹)</th>
                          <th className="p-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-highest/40 text-on-surface">
                        {tenderManifest.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-container/50 transition-colors">
                            <td className="p-3 font-code-sm text-primary font-medium whitespace-nowrap">
                              {item.item_code}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-on-surface">{item.category}</div>
                              <div className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                                {item.description}
                              </div>
                              <div className="text-[10px] font-code-sm text-outline mt-1">
                                Spec: {item.tamil_nadu_pwd_spec}
                              </div>
                            </td>
                            <td className="p-3 text-right font-code-sm">
                              {item.quantity.toLocaleString()} {item.unit}
                            </td>
                            <td className="p-3 text-right font-code-sm">₹{item.unit_rate_inr.toLocaleString()}</td>
                            <td className="p-3 text-right font-code-sm font-bold text-on-surface">
                              ₹{item.amount_inr.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cost Calculation Summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-4 rounded-xl bg-surface-container border border-surface-container-highest/60">
                    <div className="text-body-sm text-on-surface-variant">
                      <div className="font-semibold text-on-surface">
                        Signatory: {tenderManifest.signatory_designation}
                      </div>
                      <div className="text-[12px] text-outline mt-0.5">
                        Issuing Authority: {tenderManifest.authority}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-64 text-right">
                      <div className="flex justify-between text-body-sm text-on-surface-variant">
                        <span>Works Subtotal:</span>
                        <span className="font-code-sm text-on-surface">
                          ₹{tenderManifest.subtotal_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-sm text-on-surface-variant">
                        <span>Statutory GST (18%):</span>
                        <span className="font-code-sm text-on-surface">
                          ₹{tenderManifest.statutory_gst_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-sm text-on-surface-variant">
                        <span>Contingency &amp; QA (3%):</span>
                        <span className="font-code-sm text-on-surface">
                          ₹{tenderManifest.contingency_overhead_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-label-md font-bold text-primary border-t border-surface-container-highest/60 pt-1.5 mt-0.5">
                        <span>Grand Total (INR):</span>
                        <span className="font-code-sm text-[16px]">
                          ₹{tenderManifest.grand_total_inr.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/60 flex items-center justify-between">
              <button
                onClick={() => setTenderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium transition-all"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csvContent =
                      'Item Code,Category,Description,Unit,Quantity,Rate,Amount\n' +
                      tenderManifest?.items
                        .map(
                          (i) =>
                            `"${i.item_code}","${i.category}","${i.description}","${i.unit}",${i.quantity},${i.unit_rate_inr},${i.amount_inr}`
                        )
                        .join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GCC_Tender_BOQ_${tenderManifest?.tender_id || '2024'}.csv`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    const jsonBlob = new Blob([JSON.stringify(tenderManifest, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(jsonBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GCC_Council_Resolution_${tenderManifest?.tender_id || '2024'}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Download Council Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live IoT Sensor Telemetry Console Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />
    </div>
  );
}
