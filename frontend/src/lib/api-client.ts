import {
  GeoJSONFeatureCollection,
  CellObservation,
  CellExplain,
  KpiSummary,
  OptimizationResult,
  InterventionType,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
  async getCellsGeoJSON(params?: {
    min_anomaly?: number;
    state?: string;
    ward_id?: string;
  }): Promise<GeoJSONFeatureCollection> {
    const query = new URLSearchParams();
    if (params?.min_anomaly !== undefined) query.append('min_anomaly', params.min_anomaly.toString());
    if (params?.state) query.append('state', params.state);
    if (params?.ward_id) query.append('ward_id', params.ward_id);

    const res = await fetch(`${API_BASE}/heat/cells/geojson?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch GeoJSON: ${res.statusText}`);
    return res.json();
  },

  async getCellHistory(cellId: string): Promise<CellObservation[]> {
    const res = await fetch(`${API_BASE}/heat/cells/${cellId}/history`);
    if (!res.ok) throw new Error(`Failed to fetch cell history: ${res.statusText}`);
    return res.json();
  },

  async getCellExplain(cellId: string): Promise<CellExplain> {
    const res = await fetch(`${API_BASE}/heat/cells/${cellId}/explain`);
    if (!res.ok) throw new Error(`Failed to fetch cell explanation: ${res.statusText}`);
    return res.json();
  },

  async getKpi(): Promise<KpiSummary> {
    const res = await fetch(`${API_BASE}/heat/kpi`);
    if (!res.ok) throw new Error(`Failed to fetch KPIs: ${res.statusText}`);
    return res.json();
  },

  async getInterventionTypes(): Promise<InterventionType[]> {
    const res = await fetch(`${API_BASE}/interventions/types`);
    if (!res.ok) throw new Error(`Failed to fetch interventions: ${res.statusText}`);
    return res.json();
  },

  async runOptimization(payload: {
    budget_inr: number;
    mode: 'EXPECTED' | 'CONSERVATIVE';
    target_wards?: string[];
  }): Promise<OptimizationResult> {
    const res = await fetch(`${API_BASE}/interventions/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Optimization failed: ${res.statusText}`);
    return res.json();
  },
};
