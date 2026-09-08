'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoJSONFeatureCollection, CellFeatureProperties } from '@/lib/types';
import { mergeWithMetropolitanGrid, generateMetropolitanGrid } from '@/lib/metropolitan-grid';

export interface CommandMap2DProps {
  onSelectWard?: (data: {
    wardTitle: string;
    zoneName: string;
    anomaly: string;
    population: string;
    canopy: string;
    impervious: string;
    cellId: string;
    lat: number;
    lon: number;
  }) => void;
  selectedWard?: string;
  className?: string;
}

export const CommandMap2D: React.FC<CommandMap2DProps> = ({
  onSelectWard,
  selectedWard,
  className = 'h-[520px] w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'heat' | 'ndvi' | 'temp' | 'impervious' | 'terrain'>('heat');
  const [activeMode, setActiveMode] = useState<'grid' | 'heatmap' | 'prisms'>('grid');
  const [coordinatesHud, setCoordinatesHud] = useState('13.0418° N • 80.2507° E');
  const [zoomLevel, setZoomLevel] = useState<number>(12.2);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [80.24, 13.04], // Central Chennai
      zoom: 12.0,
      pitch: 20,
      bearing: -10,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-left');

    map.on('mousemove', (e) => {
      setCoordinatesHud(`${e.lngLat.lat.toFixed(4)}° N • ${e.lngLat.lng.toFixed(4)}° E`);
    });

    map.on('zoom', () => {
      setZoomLevel(Number(map.getZoom().toFixed(1)));
    });

    map.on('load', () => {
      // 1. Generate full citywide metropolitan 100m grid covering all 15 zones
      const fullGridData = generateMetropolitanGrid();

      // Convert features to point centroids for Gaussian heatmap
      const heatPoints = fullGridData.features.map((f: any) => {
        const ring = f.geometry.coordinates[0];
        const lons = ring.map((c: any) => c[0]);
        const lats = ring.map((c: any) => c[1]);
        const center = [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
        const anomaly = Number(f.properties?.contextual_anomaly_celsius || f.properties?.mean_anomaly || 2.4);
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: center },
          properties: { ...f.properties, weight: Math.max(0.2, Math.min(5.0, anomaly)) },
        };
      });

      // Add Sources
      map.addSource('command-cells', {
        type: 'geojson',
        data: fullGridData as any,
      });

      map.addSource('command-heat-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: heatPoints,
        } as any,
      });

      // Add Continuous Heatmap Layer
      map.addLayer({
        id: 'command-continuous-heatmap',
        type: 'heatmap',
        source: 'command-heat-points',
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0.2, 2.5, 0.6, 5.0, 1.0],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.9, 12, 1.8, 15, 3.0],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.15, 'rgba(67, 214, 181, 0.70)',   // Cool teal (#43D6B5)
            0.35, 'rgba(234, 179, 8, 0.85)',    // Warning amber
            0.65, 'rgba(242, 139, 98, 0.95)',   // Thermal orange (#F28B62)
            0.85, 'rgba(255, 69, 58, 0.98)',    // Critical crimson (#FF453A)
            1.0, 'rgba(185, 28, 28, 1.0)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 24, 12, 54, 15, 95],
          'heatmap-opacity': 0.88,
        },
      });

      // Add 2D Grid Cells Fill Layer
      map.addLayer({
        id: 'command-cells-fill',
        type: 'fill',
        source: 'command-cells',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'mean_anomaly'], ['get', 'contextual_anomaly_celsius'], 2.4],
            0.0, '#38bdf8',
            1.5, '#43D6B5',
            2.5, '#fbbf24',
            3.5, '#F28B62',
            4.5, '#FF453A',
            5.5, '#991b1b',
          ],
          'fill-opacity': 0.82,
        },
      });

      // Add 2D Grid Cell Borders
      map.addLayer({
        id: 'command-cells-line',
        type: 'line',
        source: 'command-cells',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.12)',
          'line-width': 0.8,
          'line-opacity': 0.85,
        },
      });

      // Add 3D Extruded Prisms Layer
      map.addLayer({
        id: 'command-cells-3d',
        type: 'fill-extrusion',
        source: 'command-cells',
        layout: { visibility: 'none' },
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'mean_anomaly'], 2.4],
            0.0, '#38bdf8',
            2.0, '#43D6B5',
            3.2, '#F28B62',
            4.5, '#FF453A',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'mean_anomaly'], 2.4],
            0, 40,
            2, 120,
            4, 280,
            6, 480,
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.90,
        },
      });

      // Highlight Layer for Selected Cell
      map.addLayer({
        id: 'command-cell-highlight',
        type: 'line',
        source: 'command-cells',
        filter: ['==', 'cell_id', ''],
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2.5,
        },
      });

      // Popups and Hover Interaction
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'ops-map-popup',
        offset: 12,
      });
      popupRef.current = popup;

      map.on('mousemove', 'command-cells-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0];
        const p = f.properties || {};

        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="background:#141719; color:#F3F4F6; padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.12); font-family:Inter, sans-serif; box-shadow:0 8px 24px rgba(0,0,0,0.6);">
              <div style="font-size:11px; font-weight:700; color:#8B9299; text-transform:uppercase; letter-spacing:0.05em;">${p.zone_name || p.zone_id || 'Chennai Ward'}</div>
              <div style="font-size:14px; font-weight:600; color:#FFFFFF; margin-top:2px;">${p.ward_id || p.cell_id}</div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:6px; font-size:12px;">
                <span style="color:#F28B62; font-family:'IBM Plex Mono', monospace; font-weight:700;">+${Number(p.mean_anomaly || 2.4).toFixed(1)}°C Anomaly</span>
                <span style="color:rgba(255,255,255,0.2);">|</span>
                <span style="color:#8B9299;">Built: ${Math.round((p.impervious_fraction || 0.8) * 100)}%</span>
              </div>
              <div style="font-size:10px; color:#5F666D; margin-top:4px;">Click to inspect biophysical profile &amp; interventions</div>
            </div>`
          )
          .addTo(map);
      });

      map.on('mouseleave', 'command-cells-fill', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Click handler
      map.on('click', 'command-cells-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const p = e.features[0].properties || {};
        const cellId = p.cell_id || '';
        map.setFilter('command-cell-highlight', ['==', 'cell_id', cellId]);

        if (onSelectWard) {
          onSelectWard({
            wardTitle: `${p.ward_id || 'Ward 118'} (${p.zone_name || 'Core'})`,
            zoneName: p.zone_name || p.zone_id || 'Zone IX Teynampet',
            anomaly: `+${Number(p.mean_anomaly || 2.4).toFixed(1)}°C`,
            population: Number(p.population_density_sqkm || 18400).toLocaleString(),
            canopy: `${Math.round((p.tree_canopy_fraction || 0.08) * 100)}%`,
            impervious: `${Math.round((p.impervious_fraction || 0.82) * 100)}%`,
            cellId: cellId,
            lat: e.lngLat.lat,
            lon: e.lngLat.lng,
          });
        }
      });
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update paint properties based on activeLayer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('command-cells-fill')) return;

    if (activeLayer === 'heat') {
      map.setPaintProperty('command-cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'mean_anomaly'], ['get', 'contextual_anomaly_celsius'], 2.4],
        0.0, '#38bdf8',
        1.5, '#43D6B5',
        2.5, '#fbbf24',
        3.5, '#F28B62',
        4.5, '#FF453A',
        5.5, '#991b1b',
      ]);
      map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.82);
    } else if (activeLayer === 'ndvi') {
      map.setPaintProperty('command-cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'tree_canopy_fraction'], 0.1],
        0.02, '#450a0a',
        0.08, '#d97706',
        0.18, '#84cc16',
        0.35, '#10b981',
        0.50, '#047857',
      ]);
      map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.85);
    } else if (activeLayer === 'temp') {
      map.setPaintProperty('command-cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'mean_anomaly'], 2.4],
        0.0, '#0284c7',
        1.5, '#38bdf8',
        2.8, '#f59e0b',
        4.0, '#ea580c',
        5.2, '#b91c1c',
      ]);
      map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.85);
    } else if (activeLayer === 'impervious') {
      map.setPaintProperty('command-cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'impervious_fraction'], 0.7],
        0.30, '#10b981',
        0.55, '#f59e0b',
        0.75, '#f97316',
        0.92, '#7f1d1d',
      ]);
      map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.85);
    } else if (activeLayer === 'terrain') {
      map.setPaintProperty('command-cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'elevation_m'], 12.0],
        2.0, '#047857',
        8.0, '#059669',
        16.0, '#d97706',
        28.0, '#b45309',
        50.0, '#78350f',
      ]);
      map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.78);
    }
  }, [activeLayer]);

  // Update display mode (grid vs heatmap vs 3d prisms)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (activeMode === 'grid') {
      if (map.getLayer('command-cells-fill')) map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.82);
      if (map.getLayer('command-cells-line')) map.setPaintProperty('command-cells-line', 'line-opacity', 0.85);
      if (map.getLayer('command-continuous-heatmap')) map.setLayoutProperty('command-continuous-heatmap', 'visibility', 'none');
      if (map.getLayer('command-cells-3d')) map.setLayoutProperty('command-cells-3d', 'visibility', 'none');
    } else if (activeMode === 'heatmap') {
      if (map.getLayer('command-cells-fill')) map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.15);
      if (map.getLayer('command-cells-line')) map.setPaintProperty('command-cells-line', 'line-opacity', 0.20);
      if (map.getLayer('command-continuous-heatmap')) map.setLayoutProperty('command-continuous-heatmap', 'visibility', 'visible');
      if (map.getLayer('command-cells-3d')) map.setLayoutProperty('command-cells-3d', 'visibility', 'none');
    } else if (activeMode === 'prisms') {
      if (map.getLayer('command-cells-fill')) map.setPaintProperty('command-cells-fill', 'fill-opacity', 0.0);
      if (map.getLayer('command-cells-line')) map.setPaintProperty('command-cells-line', 'line-opacity', 0.15);
      if (map.getLayer('command-continuous-heatmap')) map.setLayoutProperty('command-continuous-heatmap', 'visibility', 'none');
      if (map.getLayer('command-cells-3d')) map.setLayoutProperty('command-cells-3d', 'visibility', 'visible');
      map.easeTo({ pitch: 50, bearing: -20, duration: 1000 });
    }
  }, [activeMode]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#101214] ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top HUD Overlay */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10 gap-2">
        <div className="pointer-events-auto flex items-center gap-2 px-2.5 py-1 rounded bg-[#101214]/90 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-[#F3F4F6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43D6B5] animate-pulse"></span>
          <span>{coordinatesHud}</span>
          <span className="text-[#5F666D]">|</span>
          <span className="text-[#8B9299]">Z {zoomLevel}</span>
        </div>

        {/* Layer Selectors */}
        <div className="pointer-events-auto flex items-center gap-1 p-0.5 rounded bg-[#101214]/90 backdrop-blur-md border border-white/[0.08]">
          {(['heat', 'ndvi', 'temp', 'impervious', 'terrain'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setActiveLayer(l)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                activeLayer === l
                  ? 'bg-[#181B1E] text-white border border-white/10 shadow-sm'
                  : 'text-[#8B9299] hover:text-white'
              }`}
            >
              {l === 'heat' && 'Heat Index'}
              {l === 'ndvi' && 'NDVI Canopy'}
              {l === 'temp' && 'Surface Temp'}
              {l === 'impervious' && 'Built Impervious'}
              {l === 'terrain' && 'Terrain / Elev'}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Mode Switcher & Legend */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        {/* Mode Selector */}
        <div className="pointer-events-auto flex items-center gap-1 p-0.5 rounded bg-[#101214]/90 backdrop-blur-md border border-white/[0.08]">
          <button
            onClick={() => setActiveMode('grid')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeMode === 'grid'
                ? 'bg-[#F28B62] text-[#090A0B] font-semibold'
                : 'text-[#8B9299] hover:text-white'
            }`}
          >
            100m Grid
          </button>
          <button
            onClick={() => setActiveMode('heatmap')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeMode === 'heatmap'
                ? 'bg-[#F28B62] text-[#090A0B] font-semibold'
                : 'text-[#8B9299] hover:text-white'
            }`}
          >
            Thermal Blanket
          </button>
          <button
            onClick={() => setActiveMode('prisms')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeMode === 'prisms'
                ? 'bg-[#F28B62] text-[#090A0B] font-semibold'
                : 'text-[#8B9299] hover:text-white'
            }`}
          >
            3D Prisms
          </button>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded bg-[#101214]/90 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-[#8B9299]">
          <span>+0.5°C</span>
          <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-[#43D6B5] via-[#fbbf24] to-[#FF453A]" />
          <span>+5.5°C</span>
        </div>
      </div>
    </div>
  );
};
