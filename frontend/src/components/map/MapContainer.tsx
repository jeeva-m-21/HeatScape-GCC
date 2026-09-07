'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoJSONFeatureCollection, CellFeatureProperties } from '@/lib/types';

interface MapContainerProps {
  geojsonData: GeoJSONFeatureCollection | null;
  activeMode: 'state' | 'anomaly' | 'population';
  onSelectCell: (cell: CellFeatureProperties | null) => void;
  selectedCellId?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  geojsonData,
  activeMode,
  onSelectCell,
  selectedCellId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [80.2400, 13.0400], // Chennai Central Coordinates
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-left');

    map.on('load', () => {
      // Add empty source for heatscape grid cells
      map.addSource('heatscape-cells', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Fill layer
      map.addLayer({
        id: 'cells-fill',
        type: 'fill',
        source: 'heatscape-cells',
        paint: {
          'fill-color': [
            'match',
            ['get', 'state'],
            'EMERGING', '#EF4444',
            'PERSISTENT', '#F97316',
            'TEMPORARY', '#EAB308',
            'IMPROVING', '#10B981',
            'WATCH', '#64748B',
            '#64748B',
          ],
          'fill-opacity': 0.72,
        },
      });

      // Outline border layer
      map.addLayer({
        id: 'cells-outline',
        type: 'line',
        source: 'heatscape-cells',
        paint: {
          'line-color': '#334155',
          'line-width': 0.8,
        },
      });

      // Selected cell highlight outline
      map.addLayer({
        id: 'cells-highlight',
        type: 'line',
        source: 'heatscape-cells',
        filter: ['==', 'cell_id', ''],
        paint: {
          'line-color': '#06B6D4',
          'line-width': 2.5,
        },
      });

      // Interaction listeners
      map.on('click', 'cells-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties as CellFeatureProperties;
        onSelectCell(props);
      });

      map.on('mouseenter', 'cells-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'cells-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('heatscape-cells') as maplibregl.GeoJSONSource;
    if (source && geojsonData) {
      source.setData(geojsonData as any);
    }
  }, [geojsonData]);

  // Update dynamic coloring based on activeMode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('cells-fill')) return;

    if (activeMode === 'state') {
      map.setPaintProperty('cells-fill', 'fill-color', [
        'match',
        ['get', 'state'],
        'EMERGING', '#EF4444',
        'PERSISTENT', '#F97316',
        'TEMPORARY', '#EAB308',
        'IMPROVING', '#10B981',
        'WATCH', '#64748B',
        '#64748B',
      ]);
    } else if (activeMode === 'anomaly') {
      map.setPaintProperty('cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['get', 'mean_anomaly'],
        0.0, '#3B82F6',
        1.5, '#EAB308',
        2.5, '#F97316',
        4.0, '#EF4444',
      ]);
    } else if (activeMode === 'population') {
      map.setPaintProperty('cells-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        0, '#334155',
        1000, '#8B5CF6',
        3000, '#EC4899',
      ]);
    }
  }, [activeMode]);

  // Update highlight layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('cells-highlight')) return;

    map.setFilter('cells-highlight', ['==', 'cell_id', selectedCellId || '']);
  }, [selectedCellId]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
