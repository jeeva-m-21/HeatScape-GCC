import {
  GeoJSONFeatureCollection,
  CellObservation,
  CellExplain,
  KpiSummary,
  OptimizationResult,
  InterventionType,
  HeatwaveForecastResponse,
  GRAPStatusResponse,
  DispatchManifestResponse,
  CoolRouteResponse,
  PublicRefuge,
  SampleCorridor,
  SatelliteStatusResponse,
  SatelliteIngestResponse,
  SensorSatelliteCorrelationResponse,
  ElevationResponse,
  TransectSummary,
  TransectProfileResponse,
  SeaBreezeResponse,
  StreetCanyonRequest,
  StreetCanyonResponse,
  TerrainMeshResponse,
  CopilotSamplePrompt,
  CopilotQueryResponse,
  HeatIncident,
  FieldAudit,
  ClimateProjectionResponse,
  CouncilResolutionResponse,
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
    max_cells?: number;
    equity_weight?: number;
    contiguity_priority?: boolean;
    allowed_intervention_types?: string[];
  }): Promise<OptimizationResult> {
    const res = await fetch(`${API_BASE}/interventions/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Optimization failed: ${res.statusText}`);
    return res.json();
  },

  async optimizePortfolio(payload: any): Promise<OptimizationResult> {
    return this.runOptimization({
      budget_inr: payload.budget_inr,
      mode: payload.uncertainty_model || payload.mode || 'EXPECTED',
      max_cells: payload.max_cells,
      equity_weight: payload.equity_weight,
    });
  },

  async getTenderManifest(payload: {
    budget_inr: number;
    mode: 'EXPECTED' | 'CONSERVATIVE';
    target_wards?: string[];
    max_cells?: number;
    equity_weight?: number;
    contiguity_priority?: boolean;
  }) {
    const res = await fetch(`${API_BASE}/interventions/tender-manifest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Tender manifest generation failed: ${res.statusText}`);
    return res.json();
  },

  async getLiveSensors() {
    const res = await fetch(`${API_BASE}/sensors/live`);
    if (!res.ok) throw new Error(`Failed to fetch sensor telemetry: ${res.statusText}`);
    return res.json();
  },

  async compareScenarios(payload: {
    budget_inr: number;
    mode: 'EXPECTED' | 'CONSERVATIVE';
    equity_weight?: number;
    max_cells?: number;
  }) {
    const res = await fetch(`${API_BASE}/interventions/compare-scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Comparative scenario analysis failed: ${res.statusText}`);
    return res.json();
  },

  async getCouncilBrief(payload: {
    budget_inr: number;
    mode: 'EXPECTED' | 'CONSERVATIVE';
    equity_weight?: number;
    max_cells?: number;
  }) {
    const res = await fetch(`${API_BASE}/interventions/council-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Council brief generation failed: ${res.statusText}`);
    return res.json();
  },

  async getHeatwaveForecast(): Promise<HeatwaveForecastResponse> {
    const res = await fetch(`${API_BASE}/heatwave/forecast`);
    if (!res.ok) throw new Error(`Failed to fetch heatwave forecast: ${res.statusText}`);
    return res.json();
  },

  async getGRAPStatus(stage: number = 2): Promise<GRAPStatusResponse> {
    const res = await fetch(`${API_BASE}/heatwave/grap-status?stage=${stage}`);
    if (!res.ok) throw new Error(`Failed to fetch GRAP status: ${res.statusText}`);
    return res.json();
  },

  async getDispatchManifest(): Promise<DispatchManifestResponse> {
    const res = await fetch(`${API_BASE}/heatwave/dispatch-manifest`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to generate dispatch manifest: ${res.statusText}`);
    return res.json();
  },

  async getCoolingShelters() {
    const res = await fetch(`${API_BASE}/heatwave/shelters`);
    if (!res.ok) throw new Error(`Failed to fetch cooling shelters: ${res.statusText}`);
    return res.json();
  },

  async getCoolPath(payload: {
    origin_lat: number;
    origin_lon: number;
    dest_lat: number;
    dest_lon: number;
    prioritize_shade?: boolean;
  }): Promise<CoolRouteResponse> {
    const res = await fetch(`${API_BASE}/routing/cool-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to compute cool path: ${res.statusText}`);
    return res.json();
  },

  async getPublicRefuges(): Promise<{ total_refuges: number; refuges: PublicRefuge[] }> {
    const res = await fetch(`${API_BASE}/routing/refuges`);
    if (!res.ok) throw new Error(`Failed to fetch thermal refuges: ${res.statusText}`);
    return res.json();
  },

  async getSampleCorridors(): Promise<{ corridors: SampleCorridor[] }> {
    const res = await fetch(`${API_BASE}/routing/sample-corridors`);
    if (!res.ok) throw new Error(`Failed to fetch sample corridors: ${res.statusText}`);
    return res.json();
  },

  async getSatelliteStatus(): Promise<SatelliteStatusResponse> {
    const res = await fetch(`${API_BASE}/ingest/satellite-status`);
    if (!res.ok) throw new Error(`Failed to fetch satellite status: ${res.statusText}`);
    return res.json();
  },

  async triggerSatelliteOverpass(): Promise<SatelliteIngestResponse> {
    const res = await fetch(`${API_BASE}/ingest/trigger-overpass`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to trigger satellite overpass: ${res.statusText}`);
    return res.json();
  },

  async getSensorsVsSatelliteCorrelation(): Promise<SensorSatelliteCorrelationResponse> {
    const res = await fetch(`${API_BASE}/ingest/sensors-vs-satellite`);
    if (!res.ok) throw new Error(`Failed to fetch sensor correlation report: ${res.statusText}`);
    return res.json();
  },

  async getElevation(lat: number, lon: number): Promise<ElevationResponse> {
    const res = await fetch(`${API_BASE}/terrain/elevation?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Failed to fetch elevation: ${res.statusText}`);
    return res.json();
  },

  async getTransects(): Promise<{ transects: TransectSummary[] }> {
    const res = await fetch(`${API_BASE}/terrain/transects`);
    if (!res.ok) throw new Error(`Failed to fetch transects: ${res.statusText}`);
    return res.json();
  },

  async getTransectProfile(transectId: string, steps: number = 40): Promise<TransectProfileResponse> {
    const res = await fetch(`${API_BASE}/terrain/transects/${transectId}?steps=${steps}`);
    if (!res.ok) throw new Error(`Failed to fetch transect profile: ${res.statusText}`);
    return res.json();
  },

  async getCustomTransect(req: {
    start_lat: number;
    start_lon: number;
    end_lat: number;
    end_lon: number;
    steps?: number;
  }): Promise<TransectProfileResponse> {
    const res = await fetch(`${API_BASE}/terrain/transect/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Failed to compute custom transect: ${res.statusText}`);
    return res.json();
  },

  async getSeaBreeze(params?: {
    lat?: number;
    lon?: number;
    coastal_wind_speed_ms?: number;
    inland_air_temp_c?: number;
    hour_of_day?: number;
  }): Promise<SeaBreezeResponse> {
    const query = new URLSearchParams();
    if (params?.lat !== undefined) query.append('lat', params.lat.toString());
    if (params?.lon !== undefined) query.append('lon', params.lon.toString());
    if (params?.coastal_wind_speed_ms !== undefined) query.append('coastal_wind_speed_ms', params.coastal_wind_speed_ms.toString());
    if (params?.inland_air_temp_c !== undefined) query.append('inland_air_temp_c', params.inland_air_temp_c.toString());
    if (params?.hour_of_day !== undefined) query.append('hour_of_day', params.hour_of_day.toString());

    const res = await fetch(`${API_BASE}/terrain/sea-breeze?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch sea breeze dynamics: ${res.statusText}`);
    return res.json();
  },

  async analyzeStreetCanyon(req: StreetCanyonRequest): Promise<StreetCanyonResponse> {
    const res = await fetch(`${API_BASE}/terrain/street-canyon/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Failed to analyze street canyon: ${res.statusText}`);
    return res.json();
  },

  async get3DTerrainMesh(params?: { rows?: number; cols?: number }): Promise<TerrainMeshResponse> {
    const query = new URLSearchParams();
    if (params?.rows) query.append('rows', params.rows.toString());
    if (params?.cols) query.append('cols', params.cols.toString());
    const res = await fetch(`${API_BASE}/terrain/mesh-3d?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch 3D terrain mesh: ${res.statusText}`);
    return res.json();
  },

  async normalizeOpenData(payload: { items?: any[]; feature_collection?: any }): Promise<any> {
    const res = await fetch(`${API_BASE}/ogc/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to normalize open dataset: ${res.statusText}`);
    return res.json();
  },

  async queryCopilot(message: string, context?: any): Promise<CopilotQueryResponse> {
    const res = await fetch(`${API_BASE}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });
    if (!res.ok) throw new Error(`Failed to query copilot: ${res.statusText}`);
    return res.json();
  },

  async getCopilotSamplePrompts(): Promise<{ sample_prompts: CopilotSamplePrompt[] }> {
    const res = await fetch(`${API_BASE}/copilot/sample-prompts`);
    if (!res.ok) throw new Error(`Failed to fetch copilot sample prompts: ${res.statusText}`);
    return res.json();
  },

  async getIncidents(status?: string): Promise<{ total: number; incidents: HeatIncident[] }> {
    const url = status ? `${API_BASE}/incidents?status=${status}` : `${API_BASE}/incidents`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    return res.json();
  },

  async reportIncident(payload: Partial<HeatIncident>): Promise<HeatIncident> {
    const res = await fetch(`${API_BASE}/incidents/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to report incident: ${res.statusText}`);
    return res.json();
  },

  async updateIncidentStatus(incidentId: string, status: string): Promise<HeatIncident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Failed to update incident status: ${res.statusText}`);
    return res.json();
  },

  async getFieldAudits(): Promise<{ total_audits: number; audits: FieldAudit[] }> {
    const res = await fetch(`${API_BASE}/incidents/audits`);
    if (!res.ok) throw new Error(`Failed to fetch field audits: ${res.statusText}`);
    return res.json();
  },

  async logFieldAudit(payload: Partial<FieldAudit>): Promise<FieldAudit> {
    const res = await fetch(`${API_BASE}/incidents/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to log field audit: ${res.statusText}`);
    return res.json();
  },

  async getClimateProjections(params?: {
    pathway?: string;
    start_year?: number;
    end_year?: number;
  }): Promise<ClimateProjectionResponse> {
    const query = new URLSearchParams();
    if (params?.pathway) query.append('pathway', params.pathway);
    if (params?.start_year) query.append('start_year', params.start_year.toString());
    if (params?.end_year) query.append('end_year', params.end_year.toString());
    const res = await fetch(`${API_BASE}/scenarios/climate-projections?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch climate projections: ${res.statusText}`);
    return res.json();
  },

  async getCouncilResolution(budgetInr: number = 500000000.0): Promise<CouncilResolutionResponse> {
    const res = await fetch(`${API_BASE}/scenarios/council-resolution?budget_inr=${budgetInr}`);
    if (!res.ok) throw new Error(`Failed to fetch council resolution: ${res.statusText}`);
    return res.json();
  },

  async getDroneMissions(zone?: string): Promise<{ missions: any[] }> {
    const query = zone ? `?zone=${encodeURIComponent(zone)}` : '';
    const res = await fetch(`${API_BASE}/drone/missions${query}`);
    if (!res.ok) throw new Error(`Failed to fetch drone missions: ${res.statusText}`);
    return res.json();
  },

  async generateGCPUploadUrl(filename: string): Promise<any> {
    const res = await fetch(`${API_BASE}/drone/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content_type: 'image/tiff', bucket_name: 'chennai-heatscape-drone-tiles' }),
    });
    if (!res.ok) throw new Error(`Failed to generate GCP upload URL: ${res.statusText}`);
    return res.json();
  },

  async calibratePixel(dn: number, emissivity: number = 0.95): Promise<any> {
    const res = await fetch(`${API_BASE}/drone/calibrate-pixel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digital_number: dn, emissivity, calibration_scale: 0.04 }),
    });
    if (!res.ok) throw new Error(`Failed to calibrate radiometric pixel: ${res.statusText}`);
    return res.json();
  },

  async getCompoundHazardZones(weightHeat: number = 0.55, weightFlood: number = 0.45): Promise<any> {
    const res = await fetch(`${API_BASE}/hazard/zones?weight_heat=${weightHeat}&weight_flood=${weightFlood}`);
    if (!res.ok) throw new Error(`Failed to fetch compound hazard zones: ${res.statusText}`);
    return res.json();
  },

  async calculateSpongeCoBenefits(budgetCrores: number = 50.0): Promise<any> {
    const res = await fetch(`${API_BASE}/hazard/sponge-co-benefits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_crores: budgetCrores, miyawaki_fraction: 0.4, bioswale_fraction: 0.35, cool_roof_fraction: 0.25 }),
    });
    if (!res.ok) throw new Error(`Failed to calculate sponge co-benefits: ${res.statusText}`);
    return res.json();
  },
};


