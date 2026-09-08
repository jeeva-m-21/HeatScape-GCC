'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiClient } from '@/lib/api-client';
import { GeoJSONFeatureCollection, CellFeatureProperties } from '@/lib/types';
import { downloadGeoJSON } from '@/lib/export-utils';
import { SensorTelemetryModal } from '@/components/modals/SensorTelemetryModal';
import { CouncilResolutionModal } from '@/components/modals/CouncilResolutionModal';
import { HeatScapeLogo } from '@/components/brand/HeatScapeLogo';
import { mergeWithMetropolitanGrid } from '@/lib/metropolitan-grid';

const CHENNAI_PRESETS: Record<string, { center: [number, number]; ward: string; cell: string; anomaly: string; pop: string; canopy: string; impervious: string; zone: string }> = {
  't. nagar': { center: [80.233, 13.041], ward: 'T. Nagar • Ward 117', cell: 'CHE_1042', anomaly: '+4.8°C', pop: '14,200', canopy: '2.1%', impervious: '92%', zone: 'Zone X (Kodambakkam), Chennai' },
  'tnagar': { center: [80.233, 13.041], ward: 'T. Nagar • Ward 117', cell: 'CHE_1042', anomaly: '+4.8°C', pop: '14,200', canopy: '2.1%', impervious: '92%', zone: 'Zone X (Kodambakkam), Chennai' },
  'george town': { center: [80.285, 13.090], ward: 'George Town • Ward 54', cell: 'CHE_1088', anomaly: '+5.2°C', pop: '28,400', canopy: '1.2%', impervious: '96%', zone: 'Zone V (Royapuram), Chennai' },
  'parrys': { center: [80.285, 13.090], ward: 'Parrys Broadway • Ward 55', cell: 'CHE_1089', anomaly: '+5.1°C', pop: '26,100', canopy: '1.4%', impervious: '95%', zone: 'Zone V (Royapuram), Chennai' },
  'guindy': { center: [80.212, 13.008], ward: 'Guindy Industrial • Ward 168', cell: 'CHE_1120', anomaly: '+4.6°C', pop: '9,800', canopy: '3.8%', impervious: '88%', zone: 'Zone XIII (Adyar), Chennai' },
  'manali': { center: [80.260, 13.165], ward: 'Manali Petrochem • Ward 19', cell: 'CHE_1012', anomaly: '+5.5°C', pop: '6,400', canopy: '4.2%', impervious: '89%', zone: 'Zone II (Manali), Chennai' },
  'ambattur': { center: [80.155, 13.110], ward: 'Ambattur Industrial • Ward 82', cell: 'CHE_1065', anomaly: '+4.4°C', pop: '11,300', canopy: '3.1%', impervious: '86%', zone: 'Zone VII (Ambattur), Chennai' },
  'anna nagar': { center: [80.215, 13.085], ward: 'Anna Nagar West • Ward 101', cell: 'CHE_1050', anomaly: '+3.2°C', pop: '8,900', canopy: '12.4%', impervious: '74%', zone: 'Zone VIII (Anna Nagar), Chennai' },
  'velachery': { center: [80.220, 12.975], ward: 'Velachery Bypass • Ward 178', cell: 'CHE_1145', anomaly: '+3.8°C', pop: '12,500', canopy: '4.9%', impervious: '84%', zone: 'Zone XIII (Velachery), Chennai' },
  'marina': { center: [80.280, 13.045], ward: 'Marina Coast • Ward 115', cell: 'CHE_1099', anomaly: '+0.5°C', pop: '3,200', canopy: '8.5%', impervious: '42%', zone: 'Zone IX (Teynampet), Chennai' },
  'teynampet': { center: [80.245, 13.040], ward: 'Teynampet • Ward 114', cell: 'CHE_1042', anomaly: '+2.8°C', pop: '4,180', canopy: '4.1%', impervious: '84%', zone: 'Zone IX (Teynampet South), Chennai' },
  'adyar': { center: [80.255, 13.006], ward: 'Adyar Estuary • Ward 173', cell: 'CHE_1132', anomaly: '+1.6°C', pop: '7,400', canopy: '14.8%', impervious: '62%', zone: 'Zone XIII (Adyar), Chennai' },
  'mylapore': { center: [80.268, 13.033], ward: 'Mylapore Tank • Ward 122', cell: 'CHE_1077', anomaly: '+3.6°C', pop: '18,200', canopy: '5.2%', impervious: '89%', zone: 'Zone IX (Teynampet), Chennai' },
};

export default function TrajectoryExplorerPage() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [sensorModalOpen, setSensorModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'why' | 'interventions'>('overview');
  const [filterState, setFilterState] = useState<'ALL' | 'EMERGING' | 'PERSISTENT' | 'IMPROVING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('Teynampet, Ward 114');
  const [selectedWardTitle, setSelectedWardTitle] = useState('Teynampet • Ward 114');
  const [selectedCellCode, setSelectedCellCode] = useState('CHE_1042');
  const [selectedZone, setSelectedZone] = useState('Zone IX (Teynampet South), Chennai');
  const [anomalyVal, setAnomalyVal] = useState('+2.8°C');
  const [popVal, setPopVal] = useState('4,180');
  const [canopyVal, setCanopyVal] = useState('4.1%');
  const [imperviousVal, setImperviousVal] = useState('84%');
  const [activeLayer, setActiveLayer] = useState('Surface Temp');
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'normal' | 'full-heatmap' | 'grid' | 'prisms-3d'>('grid');
  const [baseMapStyle, setBaseMapStyle] = useState<'dark' | 'voyager' | 'light'>('dark');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.85);
  const [timeRange, setTimeRange] = useState<'12M' | '24M' | '36M' | '60M'>('36M');
  const storedDataRef = useRef<any>(null);

  const displayModeRef = useRef(displayMode);
  displayModeRef.current = displayMode;
  const activeLayerRef = useRef(activeLayer);
  activeLayerRef.current = activeLayer;
  const heatmapOpacityRef = useRef(heatmapOpacity);
  heatmapOpacityRef.current = heatmapOpacity;
  const baseMapStyleRef = useRef(baseMapStyle);
  baseMapStyleRef.current = baseMapStyle;

  // 2020-2030 Climate Projection Timeline state
  const [timelineYear, setTimelineYear] = useState<number>(2024);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [pathwayMode, setPathwayMode] = useState<'SSP5_85' | 'SSP2_45'>('SSP5_85');

  // Playback timer effect
  useEffect(() => {
    let interval: any = null;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setTimelineYear((prev) => (prev >= 2030 ? 2020 : prev + 1));
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingTimeline]);

  // MapLibre map reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const BASE_MAP_STYLES = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Normal Colorful Street Map
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  };

  // Generate dense spatial interpolation points across all 15 GCC zones for a continuous heatmap blanket
  const generateFullCitywidePoints = (features: any[]) => {
    const points: any[] = [];

    // 1. Centroids from analytical cells
    (features || []).forEach((feat: any) => {
      let center = [80.24, 13.04];
      if (feat.geometry?.coordinates?.[0]?.[0]) {
        const ring = feat.geometry.coordinates[0];
        const lons = ring.map((c: any) => c[0]);
        const lats = ring.map((c: any) => c[1]);
        center = [
          (Math.min(...lons) + Math.max(...lons)) / 2,
          (Math.min(...lats) + Math.max(...lats)) / 2,
        ];
      }
      const anomaly = Number(feat.properties?.contextual_anomaly_celsius || 2.4);
      points.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: center },
        properties: {
          ...feat.properties,
          weight: Math.max(0.2, Math.min(5.0, anomaly)),
        },
      });
    });

    // 2. Dense spatial grid across Chennai (12.92°N to 13.22°N, 80.12°E to 80.30°E)
    // Ensures the heatmap covers the ENTIRE metropolitan canvas without holes
    const heatCentres = [
      { lat: 13.041, lon: 80.233, anomaly: 4.8, radius: 0.040 }, // T. Nagar Commercial Corridor
      { lat: 13.090, lon: 80.285, anomaly: 5.2, radius: 0.035 }, // George Town & Parrys Broadway
      { lat: 13.008, lon: 80.212, anomaly: 4.6, radius: 0.035 }, // Guindy Industrial Estate
      { lat: 13.165, lon: 80.260, anomaly: 5.5, radius: 0.045 }, // Manali Petrochemicals
      { lat: 13.110, lon: 80.155, anomaly: 4.4, radius: 0.040 }, // Ambattur Industrial Estate
      { lat: 13.085, lon: 80.215, anomaly: 3.2, radius: 0.035 }, // Anna Nagar
      { lat: 12.975, lon: 80.220, anomaly: 3.8, radius: 0.040 }, // Velachery Transit Hub
      { lat: 13.045, lon: 80.280, anomaly: 0.5, radius: 0.030 }, // Marina Beach Marine Cooling
      { lat: 13.005, lon: 80.260, anomaly: 0.8, radius: 0.030 }, // Besant Nagar Beach Buffer
      { lat: 13.007, lon: 80.235, anomaly: 0.4, radius: 0.025 }, // Guindy National Park Canopy Sink
      { lat: 13.125, lon: 80.220, anomaly: 3.9, radius: 0.035 }, // Kolathur / Perambur
      { lat: 12.925, lon: 80.120, anomaly: 3.5, radius: 0.040 }, // Tambaram Gateway
    ];

    const minLat = 12.92, maxLat = 13.22;
    const minLon = 80.12, maxLon = 80.30;
    const step = 0.007; // ~770m grid grain

    for (let lat = minLat; lat <= maxLat; lat += step) {
      for (let lon = minLon; lon <= maxLon; lon += step) {
        const distToCoastKm = Math.max(0, (80.28 - lon) * 111);
        let anomaly = 1.2 + Math.min(2.8, distToCoastKm * 0.18);

        heatCentres.forEach((hc) => {
          const d = Math.hypot(lat - hc.lat, lon - hc.lon);
          if (d < hc.radius) {
            const factor = Math.cos((d / hc.radius) * (Math.PI / 2));
            anomaly = anomaly * (1 - factor) + hc.anomaly * factor;
          }
        });

        points.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [Number(lon.toFixed(4)), Number(lat.toFixed(4))] },
          properties: {
            contextual_anomaly_celsius: anomaly,
            weight: Math.min(5.0, Math.max(0.1, anomaly)),
          },
        });
      }
    }

    return points;
  };

  const setupMapLayers = (map: maplibregl.Map, data: any) => {
    if (!map || !data) return;

    if (!map.getSource('heat-cells')) {
      map.addSource('heat-cells', {
        type: 'geojson',
        data: data as any,
      });
    }

    const fullPoints = generateFullCitywidePoints((data as any).features || []);
    if (!map.getSource('heat-points')) {
      map.addSource('heat-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fullPoints,
        } as any,
      });
    }

    // Continuous Gaussian Thermal Heatmap Layer (Full City Coverage)
    if (!map.getLayer('heat-continuous-glow')) {
      map.addLayer({
        id: 'heat-continuous-glow',
        type: 'heatmap',
        source: 'heat-points',
        layout: {
          visibility: 'none',
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0.2,
            2.5, 0.6,
            5.0, 1.0,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 0.9,
            11, 1.5,
            13, 2.2,
            16, 3.2,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.15, 'rgba(56, 189, 248, 0.75)',  // Marine cyan/blue
            0.35, 'rgba(52, 211, 153, 0.85)',  // Moderate green
            0.55, 'rgba(251, 191, 36, 0.9)',   // Warm amber
            0.75, 'rgba(249, 115, 22, 0.95)',  // Severe orange
            0.90, 'rgba(239, 68, 68, 0.98)',   // Hot red
            1.0, 'rgba(153, 27, 27, 1.0)',     // Critical core crimson
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 22,
            11, 44,
            13, 72,
            15, 105,
          ],
          'heatmap-opacity': 0.85,
        },
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
            0.0, '#38bdf8',  // Cool marine blue (< 1.0°C)
            1.5, '#34d399',  // Normal green (1.5°C)
            2.5, '#fbbf24',  // Moderate amber (2.5°C)
            3.5, '#fb923c',  // Elevated orange (3.5°C)
            4.5, '#ef4444',  // Severe hotspot red (4.5°C)
            5.5, '#991b1b',  // Critical core crimson (> 5.5°C)
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
          'line-opacity': 0.85,
        },
      });
    }

    // High-contrast Selected 100m Grid Cell Outline
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
        filter: ['==', ['get', 'cell_id'], selectedCellCode || 'CHE_1042'],
      });
    }

    // 3D Hexagonal Volumetric Prisms
    if (!map.getLayer('heat-cells-3d-prisms')) {
      map.addLayer({
        id: 'heat-cells-3d-prisms',
        type: 'fill-extrusion',
        source: 'heat-cells',
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'contextual_anomaly_celsius'], 2.0],
            0, '#10b981',
            1.5, '#22c55e',
            2.5, '#eab308',
            3.5, '#f97316',
            4.5, '#ef4444',
            5.5, '#991b1b',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'contextual_anomaly_celsius'], 2.0],
            0, 30,
            2.0, 140,
            3.5, 340,
            5.0, 600,
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.88,
        },
      });
    }

    const handleCellSelect = (props: any) => {
      const cellId = props.cell_id || 'CHE_1042';
      setSelectedCellCode(cellId);
      setSelectedWardTitle(props.ward_name ? `${props.ward_name} • Cell ${cellId}` : `Cell ${cellId}`);
      setAnomalyVal(`+${Number(props.contextual_anomaly_celsius || 2.4).toFixed(1)}°C`);
      setPopVal(Number(props.population_density_sqkm || 3800).toLocaleString());
      setCanopyVal(`${(Number(props.tree_canopy_fraction || 0.05) * 100).toFixed(1)}%`);
      setImperviousVal(`${(Number(props.impervious_fraction || 0.82) * 100).toFixed(0)}%`);
      setDrawerOpen(true);
      if (map.getLayer('heat-cell-selected-outline')) {
        map.setFilter('heat-cell-selected-outline', ['==', ['get', 'cell_id'], cellId]);
      }
    };

    // Interactive Hover Popup & Pointer Cursor for 100m Grids
    if (!popupRef.current) {
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'custom-heatscape-popup',
        offset: 14,
      });
    }

    const showHoverPopup = (e: any) => {
      if (!e.features || !e.features[0]) return;
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const stateBadge =
        p.trajectory_state === 'PERSISTENT'
          ? '<span style="background:rgba(243,128,32,0.25);color:#f38020;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">PERSISTENT</span>'
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
            <span style="color:#fb923c;font-weight:bold;">+${Number(p.contextual_anomaly_celsius || 2.4).toFixed(1)}°C</span>
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
      if (popupRef.current) {
        popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
      }
    };

    const hideHoverPopup = () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) popupRef.current.remove();
    };

    map.on('mousemove', 'heat-cells-fill', showHoverPopup);
    map.on('mouseleave', 'heat-cells-fill', hideHoverPopup);
    map.on('mousemove', 'heat-cells-3d-prisms', showHoverPopup);
    map.on('mouseleave', 'heat-cells-3d-prisms', hideHoverPopup);

    map.on('click', 'heat-cells-fill', (e) => {
      if (!e.features || !e.features[0]) return;
      handleCellSelect(e.features[0].properties);
    });

    map.on('click', 'heat-cells-3d-prisms', (e) => {
      if (!e.features || !e.features[0]) return;
      handleCellSelect(e.features[0].properties);
    });
  };

  const applyLayerPaint = (map: maplibregl.Map, layer: string) => {
    if (!map || !map.isStyleLoaded() || !map.getLayer('heat-cells-fill')) return;
    try {
      if (layer === 'Surface Temp') {
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
      } else if (layer === 'NDVI Canopy') {
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
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
      } else if (layer === 'Built Impervious') {
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
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
        map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.85);
      } else if (layer === 'Population Exposure') {
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
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
      } else if (layer === 'Terrain Elevation') {
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
        map.setPaintProperty('heat-cells-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'elevation_m'], 12.0],
          2.0, '#047857',   // Coastal lowlands (2m)
          8.0, '#059669',   // Alluvial plain (8m)
          16.0, '#d97706',  // Gentle rise (16m)
          28.0, '#b45309',  // Inland plateau (28m)
          50.0, '#78350f',  // Ridge topography (>50m)
        ]);
        map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.85);
      }
    } catch (err) {
      console.warn('Could not apply layer paint:', err);
    }
  };

  const applyDisplayMode = (map: maplibregl.Map, mode: string, opacity: number = 0.85) => {
    if (!map) return;

    try {
      // Re-add layers if missing
      if (storedDataRef.current && (!map.getLayer('heat-cells-fill') || !map.getLayer('heat-continuous-glow'))) {
        setupMapLayers(map, storedDataRef.current);
      }

      if (mode === 'normal') {
        // Normal View: clean streets and normal map without heat obstruction
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
        if (map.getLayer('heat-cells-fill')) {
          map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.0);
        }
        if (map.getLayer('heat-cells-line')) {
          map.setPaintProperty('heat-cells-line', 'line-opacity', 0.2);
        }
        if (map.getLayer('heat-cells-3d-prisms')) {
          map.setLayoutProperty('heat-cells-3d-prisms', 'visibility', 'none');
        }
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      } else if (mode === 'full-heatmap') {
        // Continuous Heatmap with interactive cell boundaries
        if (map.getLayer('heat-cells-3d-prisms')) {
          map.setLayoutProperty('heat-cells-3d-prisms', 'visibility', 'none');
        }
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'visible');
          map.setPaintProperty('heat-continuous-glow', 'heatmap-opacity', opacity);
        }
        if (map.getLayer('heat-cells-fill')) {
          map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.35);
        }
        if (map.getLayer('heat-cells-line')) {
          map.setPaintProperty('heat-cells-line', 'line-opacity', 0.25);
        }
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      } else if (mode === 'grid') {
        // 100m Analytical Grid
        if (map.getLayer('heat-cells-3d-prisms')) {
          map.setLayoutProperty('heat-cells-3d-prisms', 'visibility', 'none');
        }
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
        if (map.getLayer('heat-cells-fill')) {
          map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.82);
        }
        if (map.getLayer('heat-cells-line')) {
          map.setPaintProperty('heat-cells-line', 'line-opacity', 0.85);
        }
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      } else if (mode === 'prisms-3d') {
        // 3D Extrusion Prisms
        if (map.getLayer('heat-continuous-glow')) {
          map.setLayoutProperty('heat-continuous-glow', 'visibility', 'none');
        }
        if (map.getLayer('heat-cells-fill')) {
          map.setPaintProperty('heat-cells-fill', 'fill-opacity', 0.0);
        }
        if (map.getLayer('heat-cells-line')) {
          map.setPaintProperty('heat-cells-line', 'line-opacity', 0.15);
        }
        if (map.getLayer('heat-cells-3d-prisms')) {
          map.setLayoutProperty('heat-cells-3d-prisms', 'visibility', 'visible');
        }
        map.easeTo({ pitch: 55, bearing: -20, duration: 800 });
      }
    } catch (err) {
      console.warn('Could not apply display mode:', err);
    }
  };

  const handleDisplayModeChange = (newMode: 'normal' | 'full-heatmap' | 'grid' | 'prisms-3d') => {
    setDisplayMode(newMode);
    displayModeRef.current = newMode;
    const map = mapRef.current;
    if (map) {
      applyDisplayMode(map, newMode, heatmapOpacityRef.current);
    }
  };

  const handleSwitchBaseStyle = (newStyle: 'dark' | 'voyager' | 'light') => {
    if (newStyle === baseMapStyleRef.current) return;
    setBaseMapStyle(newStyle);
    baseMapStyleRef.current = newStyle;
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(BASE_MAP_STYLES[newStyle]);
    map.once('style.load', () => {
      if (storedDataRef.current) {
        setupMapLayers(map, storedDataRef.current);
        applyDisplayMode(map, displayModeRef.current, heatmapOpacityRef.current);
        applyLayerPaint(map, activeLayerRef.current);
      }
    });
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    // 1. Check presets
    const matchKey = Object.keys(CHENNAI_PRESETS).find((k) => query.includes(k) || k.includes(query));
    if (matchKey) {
      const preset = CHENNAI_PRESETS[matchKey];
      setSelectedCellCode(preset.cell);
      setSelectedWardTitle(preset.ward);
      setAnomalyVal(preset.anomaly);
      setPopVal(preset.pop);
      setCanopyVal(preset.canopy);
      setImperviousVal(preset.impervious);
      setSelectedZone(preset.zone);
      setDrawerOpen(true);
      if (mapRef.current) {
        mapRef.current.flyTo({ center: preset.center, zoom: 14.5, pitch: 35, bearing: 0, duration: 1200 });
        if (mapRef.current.getLayer('heat-cell-selected-outline')) {
          mapRef.current.setFilter('heat-cell-selected-outline', ['==', ['get', 'cell_id'], preset.cell]);
        }
      }
      return;
    }

    // 2. Check features in stored dataset
    if (storedDataRef.current?.features) {
      const feat = storedDataRef.current.features.find((f: any) => {
        const cid = (f.properties?.cell_id || '').toLowerCase();
        return cid.includes(query);
      });
      if (feat && feat.geometry?.coordinates?.[0]?.[0]) {
        const ring = feat.geometry.coordinates[0];
        const lons = ring.map((c: any) => c[0]);
        const lats = ring.map((c: any) => c[1]);
        const center: [number, number] = [
          (Math.min(...lons) + Math.max(...lons)) / 2,
          (Math.min(...lats) + Math.max(...lats)) / 2,
        ];
        const p = feat.properties;
        setSelectedCellCode(p.cell_id || query.toUpperCase());
        setSelectedWardTitle(`Cell ${p.cell_id}`);
        setAnomalyVal(`+${Number(p.contextual_anomaly_celsius || 2.5).toFixed(1)}°C`);
        setPopVal(Number(p.population_density_sqkm || 4000).toLocaleString());
        setCanopyVal(`${(Number(p.tree_canopy_fraction || 0.05) * 100).toFixed(1)}%`);
        setImperviousVal(`${(Number(p.impervious_fraction || 0.8) * 100).toFixed(0)}%`);
        setDrawerOpen(true);
        if (mapRef.current) {
          mapRef.current.flyTo({ center, zoom: 15, pitch: 40, duration: 1200 });
          if (mapRef.current.getLayer('heat-cell-selected-outline')) {
            mapRef.current.setFilter('heat-cell-selected-outline', ['==', ['get', 'cell_id'], p.cell_id]);
          }
        }
        return;
      }
    }

    // Fallback: fly to central Chennai
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [80.24, 13.04], zoom: 13, duration: 1000 });
    }
  };

  const handleExportGeoJSON = () => {
    if (storedDataRef.current) {
      downloadGeoJSON(storedDataRef.current, `chennai_heatscape_cells_${selectedCellCode}.geojson`);
    } else {
      apiClient.getCellsGeoJSON().then((data) => {
        downloadGeoJSON(data, 'chennai_heatscape_cells.geojson');
      });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: BASE_MAP_STYLES[baseMapStyle],
        center: [80.24, 13.04],
        zoom: 12.8,
        pitch: 0,
        attributionControl: false,
      });

      map.on('load', async () => {
        try {
          const backendData = await apiClient.getCellsGeoJSON().catch(() => null);
          const data = mergeWithMetropolitanGrid(backendData);
          storedDataRef.current = data;
          setupMapLayers(map, data);
          applyDisplayMode(map, displayMode, heatmapOpacity);
          applyLayerPaint(map, activeLayer);
        } catch (err) {
          console.warn('Map data streaming fell back to baseline styling:', err);
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.warn('MapLibre GL initialization fallback:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync displayMode & heatmapOpacity with MapLibre layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyDisplayMode(map, displayMode, heatmapOpacity);
  }, [displayMode, heatmapOpacity]);

  // Sync activeLayer paint properties with MapLibre layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyLayerPaint(map, activeLayer);
  }, [activeLayer]);

  // Sync 2020-2030 Climate Projection timeline with 3D prism heights and thermal glow
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const yearDelta = timelineYear - 2024;
    const heightMultiplier = Math.max(0.4, 1.0 + yearDelta * 0.1);

    if (map.getLayer('heat-cells-3d-prisms')) {
      try {
        map.setPaintProperty('heat-cells-3d-prisms', 'fill-extrusion-height', [
          '*',
          [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'contextual_anomaly_celsius'], 2.0],
            0, 30,
            2.0, 140,
            3.5, 340,
            5.0, 600,
          ],
          heightMultiplier,
        ]);
      } catch (err) {
        // ignore during style refresh
      }
    }

    if (map.getLayer('heat-continuous-glow')) {
      try {
        const glowOpacity = Math.min(1.0, Math.max(0.3, heatmapOpacity + yearDelta * 0.03));
        map.setPaintProperty('heat-continuous-glow', 'heatmap-opacity', glowOpacity);
      } catch (err) {
        // ignore
      }
    }
  }, [timelineYear, pathwayMode, heatmapOpacity]);

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + delta);
    }
  };

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [80.24, 13.04], zoom: 12.8, pitch: 35, bearing: 0 });
    }
  };

  const handleToggleTilt = () => {
    if (mapRef.current) {
      const currentPitch = mapRef.current.getPitch();
      mapRef.current.easeTo({ pitch: currentPitch > 20 ? 0 : 55 });
    }
  };

  const handleFilter = (filter: 'ALL' | 'EMERGING' | 'PERSISTENT' | 'IMPROVING') => {
    setFilterState(filter);
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const filterExpr: any = filter === 'ALL' ? null : ['==', ['get', 'trajectory_state'], filter];
    if (map.getLayer('heat-cells-fill')) {
      map.setFilter('heat-cells-fill', filterExpr);
    }
    if (map.getLayer('heat-cells-line')) {
      map.setFilter('heat-cells-line', filterExpr);
    }
    if (map.getLayer('heat-cells-3d-prisms')) {
      map.setFilter('heat-cells-3d-prisms', filterExpr);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Stitch Fixed Top Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-header-height bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/40 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="w-full h-header-height px-gutter-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg min-w-0">
            <Link href="/" className="flex items-center gap-space-md shrink-0">
              <HeatScapeLogo size={32} animate={true} />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight hidden sm:inline-block">
                Heat<span className="text-[#D97757]">Scape</span>
              </span>
            </Link>
            <div className="h-4 w-px bg-surface-container-highest/60 hidden md:block"></div>
            <div className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low border border-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">radar</span>
              <span className="text-on-surface font-medium">Chennai Metropolitan Region</span>
              <span className="text-outline/60">•</span>
              <span className="flex items-center gap-1 text-tertiary font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                Live Feed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-md px-space-md py-space-xs rounded-xl bg-surface-container-low border border-surface-container-highest/60 text-on-surface-variant hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="font-label-md text-label-md hidden md:inline">Search metrics, nodes...</span>
              <kbd className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-surface-container-highest/80 shadow-inner">
                ⌘K
              </kbd>
            </div>
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
            <Link
              href="/simulator"
              className="hidden md:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-md shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Open Simulator</span>
            </Link>
            <div className="h-4 w-px bg-surface-container-highest/60"></div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stitch Fixed Left Sidebar */}
      <aside className="fixed left-0 top-header-height bottom-0 w-sidebar-width z-40 bg-surface-container-lowest border-r border-surface-container-highest/40 flex flex-col justify-between py-space-lg">
        <div className="flex flex-col gap-space-lg px-space-md">
          <div className="px-space-md">
            <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Platform Workspaces
            </div>
          </div>
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/explorer"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl font-label-md transition-all bg-surface-container-high text-on-surface shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>Trajectories Map</span>
            </Link>
            <Link
              href="/multiview"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">layers</span>
              <span>Multi-View Map</span>
            </Link>
            <Link
              href="/simulator"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Intervention Simulator</span>
            </Link>
            <Link
              href="/monitoring"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">monitoring</span>
              <span>Impact Monitoring</span>
            </Link>
            <Link
              href="/intelligence"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Urban Intelligence</span>
            </Link>
          </nav>
        </div>

        <div className="px-space-md flex flex-col gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
              <span className="font-medium">Thermal Index Peak</span>
              <span className="text-primary-container font-code-sm text-code-sm">41.8°C</span>
            </div>
            <div className="w-full bg-surface-container-highest/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Spike warning in T. Nagar grid
            </span>
          </div>
          <div className="border-t border-surface-container-highest/40 pt-space-md flex flex-col gap-1">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">api</span>
              <span>API Reference</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Workspace Body with Sidebar Offset */}
      <div className="pl-sidebar-width flex flex-col min-h-screen">
        {/* Secondary Subheader / Status Ribbon */}
        <section className="sticky top-header-height z-30 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest/40">
          <div className="w-full px-gutter-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              <span>GCC Command</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Microclimate Ops</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-medium">Live Matrix</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => {
                  const ranges: ('12M' | '24M' | '36M' | '60M')[] = ['12M', '24M', '36M', '60M'];
                  const nextIdx = (ranges.indexOf(timeRange) + 1) % ranges.length;
                  setTimeRange(ranges[nextIdx]);
                }}
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all cursor-pointer"
                type="button"
                title="Click to cycle historical telemetry analysis window"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">date_range</span>
                <span>{timeRange === '12M' ? 'Last 12 Months' : timeRange === '24M' ? 'Last 24 Months' : timeRange === '36M' ? 'Last 36 Months' : '5-Year Horizon'}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
                <span>Center Chennai</span>
              </button>
              <button
                onClick={() => setResolutionModalOpen(true)}
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-label-sm text-label-sm font-semibold transition-all cursor-pointer shadow-sm"
                title="Generate Official GCC Municipal Council Resolution"
              >
                <span className="material-symbols-outlined text-[16px]">gavel</span>
                <span>Council Docket</span>
              </button>
              <Link
                href="/simulator"
                className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-all shadow-[0_2px_10px_rgba(243,128,32,0.3)]"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Run Optimization</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Spatial Workspace Canvas */}
        <main className="w-full flex-1 bg-surface relative">
          <div className="relative w-full h-[calc(100vh-theme(spacing.header-height)-3.25rem)] overflow-hidden bg-surface-container-lowest select-none">
            {/* Live WebGL MapLibre Canvas Container */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Gradient Overlays for Atmospheric Lighting */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-surface/40 via-transparent to-surface-container-lowest/70 z-10"></div>

            {/* Floating Top Bar: Search & Quick Filters Pill */}
            <div className="absolute top-4 left-6 z-30 max-w-4xl w-[calc(100%-theme(spacing.sidebar-width)-8rem)] flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-2xl">
                {/* Search Form */}
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low text-on-surface-variant flex-1 focus-within:text-on-surface"
                >
                  <button
                    type="submit"
                    title="Search location or cell"
                    className="cursor-pointer flex items-center justify-center text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </button>
                  <input
                    className="w-full bg-transparent text-on-surface font-body-md text-body-md outline-none placeholder:text-outline/70"
                    placeholder="Find ward, corridor (T. Nagar, Parrys, Guindy) or cell..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-outline">
                    ↵
                  </kbd>
                </form>

                {/* View Mode Switcher: Normal View vs Full Heatmap vs Grid vs 3D Prisms */}
                <div className="flex items-center rounded-xl bg-surface-container-low p-1 border border-surface-container-highest/60">
                  <button
                    onClick={() => handleDisplayModeChange('normal')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                      displayMode === 'normal'
                        ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Normal city basemap with roads, parks, coast, and landmarks"
                  >
                    <span className="material-symbols-outlined text-[15px]">map</span>
                    <span>Normal View</span>
                  </button>
                  <button
                    onClick={() => handleDisplayModeChange('full-heatmap')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                      displayMode === 'full-heatmap'
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Full continuous thermodynamic heat blanket across all 15 GCC zones"
                  >
                    <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
                    <span>Full Heatmap</span>
                  </button>
                  <button
                    onClick={() => handleDisplayModeChange('grid')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                      displayMode === 'grid'
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="100m analytical grid cells"
                  >
                    <span className="material-symbols-outlined text-[15px]">grid_4x4</span>
                    <span>100m Grid</span>
                  </button>
                  <button
                    onClick={() => handleDisplayModeChange('prisms-3d')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                      displayMode === 'prisms-3d'
                        ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Render 3D Hexagonal Extruded Prisms proportional to Heat Severity"
                  >
                    <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                    <span>3D Prisms</span>
                  </button>
                </div>

                {/* Heatmap Opacity Slider (visible when Full Heatmap is active) */}
                {displayMode === 'full-heatmap' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container-low border border-surface-container-highest/60 text-xs font-mono">
                    <span className="text-on-surface-variant text-[11px]">Opacity:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={heatmapOpacity}
                      onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                      className="w-16 h-1.5 accent-primary cursor-pointer"
                      title={`Heatmap Opacity: ${Math.round(heatmapOpacity * 100)}%`}
                    />
                    <span className="text-primary font-bold text-[11px] w-7 text-right">
                      {Math.round(heatmapOpacity * 100)}%
                    </span>
                  </div>
                )}

                {/* Base Map Style Selector */}
                <div className="hidden lg:flex items-center rounded-xl bg-surface-container-low p-1 border border-surface-container-highest/60 text-xs">
                  <button
                    onClick={() => handleSwitchBaseStyle('voyager')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      baseMapStyle === 'voyager'
                        ? 'bg-surface-container-high text-emerald-400 font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Streets Base Map (Carto Voyager)"
                  >
                    <span className="material-symbols-outlined text-[14px]">map</span>
                    <span>Streets</span>
                  </button>
                  <button
                    onClick={() => handleSwitchBaseStyle('dark')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      baseMapStyle === 'dark'
                        ? 'bg-surface-container-high text-cyan-400 font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Dark Matter Base Map"
                  >
                    <span className="material-symbols-outlined text-[14px]">dark_mode</span>
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => handleSwitchBaseStyle('light')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      baseMapStyle === 'light'
                        ? 'bg-surface-container-high text-amber-400 font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Positron Light Base Map"
                  >
                    <span className="material-symbols-outlined text-[14px]">light_mode</span>
                    <span>Light</span>
                  </button>
                </div>

                {/* Trajectory Status Filter Pills */}
                <div className="hidden xl:flex items-center gap-1">
                  <button
                    onClick={() => handleFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-label-sm text-label-sm font-medium transition-colors ${
                      filterState === 'ALL'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    All Wards
                  </button>
                  <button
                    onClick={() => handleFilter('EMERGING')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm transition-colors ${
                      filterState === 'EMERGING'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    <span>Emerging</span>
                  </button>
                  <button
                    onClick={() => handleFilter('PERSISTENT')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm transition-colors ${
                      filterState === 'PERSISTENT'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    <span>Persistent</span>
                  </button>
                  <button
                    onClick={() => handleFilter('IMPROVING')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm transition-colors ${
                      filterState === 'IMPROVING'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    <span>Improving</span>
                  </button>
                </div>

                {/* Layer Dropdown Pill */}
                <div className="relative">
                  <button
                    onClick={() => setLayerDropdownOpen(!layerDropdownOpen)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">layers</span>
                    <span className="font-medium">{activeLayer}</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
                  </button>
                  {layerDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-surface-container-lowest border border-surface-container-highest/60 shadow-2xl p-1 z-50">
                      {['Surface Temp', 'NDVI Canopy', 'Built Impervious', 'Population Exposure', 'Terrain Elevation'].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setActiveLayer(item);
                            setLayerDropdownOpen(false);
                            if (mapRef.current) {
                              applyLayerPaint(mapRef.current, item);
                            }
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-label-sm transition-colors ${
                            activeLayer === item
                              ? 'bg-surface-container-high text-primary font-semibold'
                              : 'text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Bottom-Left Map Legend */}
            <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 p-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl max-w-xs">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span className="font-medium text-on-surface">
                  {activeLayer === 'Surface Temp'
                    ? 'Thermal Trajectory'
                    : activeLayer === 'NDVI Canopy'
                    ? 'Tree Canopy Fraction'
                    : activeLayer === 'Built Impervious'
                    ? 'Built Impervious Fraction'
                    : 'Population Density Exposure'}
                </span>
                <span className="font-code-sm text-code-sm text-outline">100m Polygons</span>
              </div>
              <div
                className={`w-56 h-2 rounded-full shadow-inner ${
                  activeLayer === 'Surface Temp'
                    ? 'bg-gradient-to-r from-sky-400 via-amber-400 to-red-600'
                    : activeLayer === 'NDVI Canopy'
                    ? 'bg-gradient-to-r from-stone-800 via-lime-500 to-emerald-950'
                    : activeLayer === 'Built Impervious'
                    ? 'bg-gradient-to-r from-sky-500 via-amber-400 to-red-500'
                    : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-600'
                }`}
              ></div>
              <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
                {activeLayer === 'Surface Temp' && (
                  <>
                    <span className="text-sky-400">&lt;1°C Marine</span>
                    <span className="text-amber-400">+2.5°C</span>
                    <span className="text-red-500">&gt;+5°C Severe</span>
                  </>
                )}
                {activeLayer === 'NDVI Canopy' && (
                  <>
                    <span className="text-stone-400">0% Barren</span>
                    <span className="text-lime-400">15% Canopy</span>
                    <span className="text-emerald-400">&gt;35% Dense</span>
                  </>
                )}
                {activeLayer === 'Built Impervious' && (
                  <>
                    <span className="text-sky-400">&lt;30% Pervious</span>
                    <span className="text-amber-400">70% Built</span>
                    <span className="text-red-400">&gt;95% Sealed</span>
                  </>
                )}
                {activeLayer === 'Population Exposure' && (
                  <>
                    <span className="text-cyan-400">&lt;5k /km²</span>
                    <span className="text-purple-400">18k /km²</span>
                    <span className="text-rose-400">&gt;40k Dense</span>
                  </>
                )}
              </div>
            </div>

            {/* Floating Spatiotemporal Timeline Scrubber (2020 - 2030 CMIP6 Playback) */}
            <div className="absolute bottom-6 left-72 z-20 hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl font-mono text-xs select-none">
              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="w-8 h-8 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container flex items-center justify-center transition-all cursor-pointer shadow"
                title={isPlayingTimeline ? 'Pause Climate Timeline' : 'Play 2020-2030 Climate Projection'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPlayingTimeline ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <div className="flex flex-col gap-1 w-56 xl:w-72">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">
                    Year: <strong className="text-white">{timelineYear}</strong>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      timelineYear >= 2025
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {timelineYear >= 2025 ? `CMIP6 ${pathwayMode}` : 'OBSERVED DATA'}
                  </span>
                </div>
                <input
                  type="range"
                  min={2020}
                  max={2030}
                  step={1}
                  value={timelineYear}
                  onChange={(e) => setTimelineYear(Number(e.target.value))}
                  className="w-full accent-primary-container cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>2020 Base</span>
                  <span>2024 Present</span>
                  <span>2030 Horizon</span>
                </div>
              </div>

              <button
                onClick={() => setPathwayMode(pathwayMode === 'SSP5_85' ? 'SSP2_45' : 'SSP5_85')}
                className="px-2.5 py-1 rounded-lg bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] text-[10px] text-gray-300 font-bold transition-colors cursor-pointer"
                title="Toggle Climate Pathway"
              >
                {pathwayMode === 'SSP5_85' ? 'SSP5-8.5' : 'SSP2-4.5'}
              </button>
            </div>

            {/* Floating Navigation Controls */}
            <div className="absolute bottom-6 right-[450px] z-20 flex flex-col gap-1 p-1 rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl">
              <button
                onClick={() => handleZoom(1)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <button
                onClick={() => handleZoom(-1)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <div className="w-full h-px bg-surface-container-highest/40 my-0.5"></div>
              <button
                onClick={handleToggleTilt}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="3D Tilt"
              >
                <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Reset North Center"
              >
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </button>
            </div>

            {/* Redesigned Right Detail Drawer (Exact Stitch Screen 02) */}
            <aside
              className={`absolute top-4 right-6 bottom-6 w-[420px] z-30 flex flex-col rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-surface-container-highest/40 shadow-2xl overflow-hidden transition-all duration-300 ${
                drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-[460px] opacity-0 pointer-events-none'
              }`}
            >
              {/* Card Sticky Header */}
              <div className="p-5 pb-4 bg-surface-container-low flex items-start justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                      Emerging Hotspot
                    </span>
                    <span className="font-code-sm text-code-sm text-outline">{selectedCellCode}</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                    {selectedWardTitle}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">location_on</span>
                    <span>{selectedZone}</span>
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Drawer Scrollable Workspace Content */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                {/* Key Highlight Metric Tile */}
                <div className="p-4 rounded-xl bg-surface-container flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-medium">
                      Urban Heat Delta
                    </span>
                    <span className="flex items-center gap-1 font-code-sm text-code-sm text-primary font-medium">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span> +0.03°C / mo
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                      {anomalyVal}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                      above GCC 10y baseline
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Projected to compound to <span className="text-on-surface font-semibold">+3.4°C</span> by Q3 2026 without immediate reflectance or micro-canopy interventions.
                  </p>
                </div>

                {/* Segmented Tab Nav */}
                <div className="flex p-1 rounded-xl bg-surface-container-low text-label-md font-label-md">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
                      activeTab === 'overview'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('why')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
                      activeTab === 'why'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Why Hot?
                  </button>
                  <button
                    onClick={() => setActiveTab('interventions')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
                      activeTab === 'interventions'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Solutions
                  </button>
                </div>

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <>
                    {/* Trajectory Forecast Line Graph & Fan Projection */}
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                          Thermal Projection (2022–2027)
                        </span>
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-primary font-medium">
                          94% Confidence
                        </span>
                      </div>
                      <div className="relative w-full h-28 pt-2">
                        <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 320 80">
                          <line stroke="#273647" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="20" y2="20"></line>
                          <line stroke="#273647" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="50" y2="50"></line>
                          <polygon fill="#f38020" fillOpacity="0.12" points="180,45 310,12 310,38 180,45"></polygon>
                          <path d="M10,65 Q50,60 90,52 T180,45" fill="none" stroke="#7bd0ff" strokeLinecap="round" strokeWidth="2.5"></path>
                          <path d="M180,45 Q240,32 310,24" fill="none" stroke="#f38020" strokeDasharray="4 3" strokeLinecap="round" strokeWidth="2.5"></path>
                          <circle cx="180" cy="45" fill="#f38020" r="4" className="ring-2 ring-surface-container-low"></circle>
                          <circle cx="310" cy="24" fill="#f38020" r="3.5"></circle>
                        </svg>
                      </div>
                      <div className="flex items-center justify-between font-code-sm text-code-sm text-outline pt-1">
                        <span>2022 (Actual)</span>
                        <span className="text-on-surface-variant font-medium">Now ({anomalyVal})</span>
                        <span className="text-primary font-medium">2027 Projected</span>
                      </div>
                    </div>

                    {/* Human Vulnerability Indicators (2x2 Clean Bento Grid) */}
                    <div className="flex flex-col gap-2.5">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-medium">
                        Ward Vulnerability Matrix
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-secondary">
                            <span className="material-symbols-outlined text-[18px]">groups</span>
                            <span className="font-label-sm text-label-sm font-medium">Population</span>
                          </div>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {popVal}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Zone IX Density
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-tertiary">
                            <span className="material-symbols-outlined text-[18px]">school</span>
                            <span className="font-label-sm text-label-sm font-medium">Sensitive Hubs</span>
                          </div>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            2 Schools
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            1 Elder Day Center
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-primary">
                            <span className="material-symbols-outlined text-[18px]">domain</span>
                            <span className="font-label-sm text-label-sm font-medium">Impervious Cover</span>
                          </div>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {imperviousVal}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Concrete &amp; asphalt
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-error">
                            <span className="material-symbols-outlined text-[18px]">park</span>
                            <span className="font-label-sm text-label-sm font-medium">Canopy Index</span>
                          </div>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {canopyVal}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Critical deficit
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Tab 2: Why Hot (TreeSHAP & PELT Diagnostics) */}
                {activeTab === 'why' && (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-2">
                      <div className="flex justify-between font-label-sm text-label-sm text-outline uppercase">
                        <span>TreeSHAP Driver Attribution</span>
                        <span className="text-primary font-medium">Base: 32.0°C</span>
                      </div>
                      <div className="space-y-2 mt-1">
                        <div>
                          <div className="flex justify-between text-body-sm mb-1">
                            <span>Impervious Surface (Asphalt)</span>
                            <span className="text-error font-code-sm">+2.02°C</span>
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                            <div className="bg-error h-full rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-body-sm mb-1">
                            <span>Tree Canopy Deficit</span>
                            <span className="text-primary font-code-sm">+1.04°C</span>
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-body-sm mb-1">
                            <span>High Building Density</span>
                            <span className="text-primary font-code-sm">+0.92°C</span>
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                        Temporal Regime Shift (PELT)
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Detected structural upward inflection with BIC penalty in late 2023. Sen&apos;s slope confirms steady +0.03°C/mo positive trajectory.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 3: Solutions */}
                {activeTab === 'interventions' && (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                      <div>
                        <div className="font-label-md text-on-surface font-medium">Urban Miyawaki Planting</div>
                        <div className="font-body-sm text-on-surface-variant">1,200 sq.m vacant median strip</div>
                      </div>
                      <span className="font-code-sm text-tertiary font-bold">-1.1°C</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                      <div>
                        <div className="font-label-md text-on-surface font-medium">High-Albedo Cool Roof</div>
                        <div className="font-body-sm text-on-surface-variant">44 rooftop parcels enrolled</div>
                      </div>
                      <span className="font-code-sm text-primary font-bold">-0.8°C</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                      <div>
                        <div className="font-label-md text-on-surface font-medium">Permeable Reflective Paving</div>
                        <div className="font-body-sm text-on-surface-variant">Transit footpaths</div>
                      </div>
                      <span className="font-code-sm text-secondary font-bold">-0.4°C</span>
                    </div>
                  </div>
                )}

                {/* Recent Sensor Node Status */}
                <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">sensors</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-medium text-on-surface">
                        Telemetry Node TN-104
                      </span>
                      <span className="font-code-sm text-code-sm text-outline">
                        Last ping: 2 mins ago • 38.6°C Ambient
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                </div>
              </div>

              {/* Action Bar at Drawer Foot */}
              <div className="p-4 bg-surface-container-low flex flex-col gap-2">
                <Link
                  href={`/simulator?cell=${encodeURIComponent(selectedCellCode)}&anomaly=${encodeURIComponent(anomalyVal)}&ward=${encodeURIComponent(selectedWardTitle)}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-semibold tracking-wide transition-all shadow-[0_4px_16px_rgba(243,128,32,0.35)]"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Simulate Cooling Solutions for this Cell</span>
                </Link>
                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={handleExportGeoJSON}
                    className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download complete 100m GeoJSON package for this cell / ward"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span> Export GeoJSON
                  </button>
                  <span className="font-code-sm text-code-sm text-outline">Grid Res: 100m²</span>
                </div>
              </div>
            </aside>

            {/* If Drawer closed, floating reopen tab */}
            {!drawerOpen && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="absolute top-4 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-highest/60 text-on-surface font-label-sm shadow-xl hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                <span>Open Cell Inspector</span>
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Live IoT Sensor Telemetry Console Modal */}
      <SensorTelemetryModal
        isOpen={sensorModalOpen}
        onClose={() => setSensorModalOpen(false)}
      />

      {/* Official GCC Council Resolution Dossier Modal */}
      <CouncilResolutionModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
      />
    </div>
  );
}
