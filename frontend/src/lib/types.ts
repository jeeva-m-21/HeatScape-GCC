export type TrajectoryState = 'PERSISTENT' | 'EMERGING' | 'TEMPORARY' | 'IMPROVING' | 'WATCH';

export interface CellFeatureProperties {
  cell_id: string;
  ward_id?: string;
  zone_id?: string;
  population: number;
  population_density_sqkm: number;
  building_density: number;
  impervious_fraction: number;
  tree_canopy_fraction: number;
  state: TrajectoryState;
  mean_anomaly: number;
  trend_slope: number;
  recurrence: number;
  confidence: number;
  regime_shift: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: CellFeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface CellObservation {
  observation_date: string;
  lst_celsius: number;
  ndvi?: number;
  air_temp_2m?: number;
  relative_humidity_2m?: number;
  seasonal_baseline_lst?: number;
  contextual_anomaly_celsius?: number;
  spatial_anomaly_celsius?: number;
  cloud_mask_qa: string;
}

export interface ShapValue {
  feature: string;
  value: number;
  contribution_celsius: number;
}

export interface CellExplain {
  cell_id: string;
  why_hot: {
    base_value_celsius: number;
    predicted_lst_celsius: number;
    shap_values: ShapValue[];
    primary_driver: string;
  };
  why_now: {
    regime_shift_detected: boolean;
    regime_shift_estimated_date?: string;
    ndvi_drift: number;
    lst_drift_celsius: number;
    spatial_anomaly_drift_celsius: number;
    diagnosis: string;
  };
}

export interface KpiSummary {
  total_cells: number;
  persistent_count: number;
  emerging_count: number;
  temporary_count: number;
  improving_count: number;
  watch_count: number;
  exposed_population: number;
  mean_city_anomaly: number;
  max_observed_anomaly: number;
}

export interface InterventionType {
  id: string;
  name: string;
  category: string;
  unit_name: string;
  unit_cost_inr_low: number;
  unit_cost_inr_high: number;
  cooling_effect_per_unit_low: number;
  cooling_effect_per_unit_high: number;
  evidence_grade: string;
}

export interface PortfolioAllocation {
  cell_id: string;
  ward_id?: string;
  state: string;
  population: number;
  interventions: {
    type_id: string;
    quantity: number;
    unit_name: string;
    cost_inr: number;
    cooling_effect_celsius: number;
  }[];
  cell_total_cost_inr: number;
}

export interface OptimizationResult {
  status: string;
  mode: string;
  allocated_budget_inr: number;
  total_cost_inr: number;
  total_risk_reduction_score: number;
  population_protected: number;
  allocations_count: number;
  portfolio: PortfolioAllocation[];
}

export interface TenderBOQItem {
  item_code: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unit_rate_inr: number;
  amount_inr: number;
  tamil_nadu_pwd_spec: string;
}

export interface TenderManifest {
  tender_id: string;
  council_resolution_ref: string;
  authority: string;
  issuing_division: string;
  prepared_date: string;
  target_zone: string;
  target_wards: string[];
  total_cells_covered: number;
  population_benefited: number;
  estimated_cooling_celsius: number;
  items: TenderBOQItem[];
  subtotal_inr: number;
  statutory_gst_inr: number;
  contingency_overhead_inr: number;
  grand_total_inr: number;
  signatory_designation: string;
}

export interface SensorNode {
  node_id: string;
  name: string;
  ward: string;
  zone: string;
  latitude: number;
  longitude: number;
  ambient_temp_c: number;
  relative_humidity: number;
  apparent_heat_index_c: number;
  status: string;
  is_spike: boolean;
  battery_pct: number;
  signal_dbm: number;
  last_seen: string;
}

export interface SensorTelemetryResponse {
  timestamp: string;
  network_status: string;
  total_nodes_online: number;
  total_nodes_reporting: number;
  active_heat_alerts: number;
  sampling_frequency_sec: number;
  protocol: string;
  gateway_coverage_pct: number;
  corridors: SensorNode[];
}

export interface StrategyDetail {
  name: string;
  focus: string;
  total_cost_inr: number;
  total_cooling_celsius: number;
  population_protected: number;
  cost_per_resident_inr: number;
  maintenance_5yr_inr: number;
  biodiversity_score: number;
  carbon_offset_tons_yr: number;
  allocations_count: number;
  portfolio: PortfolioAllocation[];
}

export interface ScenarioComparisonResponse {
  budget_inr: number;
  mode: string;
  strategy_a: StrategyDetail;
  strategy_b: StrategyDetail;
  delta_cooling_celsius: number;
  delta_population: number;
  recommendation: string;
}

export interface CouncilBriefResponse {
  brief_id: string;
  resolution_title: string;
  issuing_authority: string;
  executive_officer: string;
  tabled_to: string;
  report_date: string;
  budget_outlay_inr: number;
  executive_summary: string;
  comparison: ScenarioComparisonResponse;
  tender_manifest: TenderManifest;
  key_recommendations: string[];
  compliance_standards: string[];
}

export interface HeatwaveForecastDay {
  date: string;
  day_name: string;
  short_date: string;
  max_temp_c: number;
  min_temp_c: number;
  relative_humidity_pct: number;
  apparent_heat_index_c: number;
  wind_speed_kmh: number;
  condition: string;
  consecutive_hot_days: number;
  imd_alert: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  severity_code: number;
  alert_title: string;
  color_hex: string;
  action_summary: string;
}

export interface VulnerableZoneForecast {
  zone_id: string;
  name: string;
  peak_temp_c: number;
  apparent_c: number;
  risk_tier: string;
}

export interface HeatwaveForecastResponse {
  issuing_office: string;
  forecast_generated_at: string;
  region: string;
  highest_projected_apparent_c: number;
  peak_alert_level: string;
  days_above_40c: number;
  daily_forecasts: HeatwaveForecastDay[];
  vulnerable_zones: VulnerableZoneForecast[];
}

export interface DepartmentalTask {
  task: string;
  done: boolean;
}

export interface DepartmentAction {
  department: string;
  head_officer: string;
  status: string;
  tasks: DepartmentalTask[];
}

export interface GRAPStatusResponse {
  current_stage: number;
  stage_name: string;
  alert_level: string;
  severity_label: string;
  labor_mandate: string;
  cooling_shelters_count: number;
  misting_trucks_count: number;
  water_kiosks_count: number;
  statutory_authority: string;
  enforcement_officer: string;
  last_escalated: string;
  departmental_actions: DepartmentAction[];
}

export interface MistingVehicle {
  vehicle_id: string;
  registration: string;
  capacity_liters: number;
  spray_rate_lpm: number;
  driver_name: string;
  driver_phone: string;
  target_corridor: string;
  zone: string;
  status: string;
  scheduled_hours: string;
  evaporative_cooling_delta: string;
}

export interface CoolingShelter {
  facility_id: string;
  name: string;
  address: string;
  zone: string;
  capacity_persons: number;
  current_occupancy: number;
  facilities: string[];
  contact: string;
  is_open_24_7: boolean;
}

export interface DispatchManifestResponse {
  dispatch_id: string;
  authorized_by: string;
  active_misting_vehicles: MistingVehicle[];
  total_water_dispatched_liters: number;
  emergency_cooling_shelters: CoolingShelter[];
  total_shelter_capacity: number;
  total_current_shelter_occupancy: number;
  operational_readiness: string;
}

export interface RouteWaypoint {
  lat: number;
  lon: number;
  anomaly_c: number;
  canopy_pct: number;
  is_water_point: boolean;
  is_shelter: boolean;
  name: string;
}

export interface RouteMetrics {
  distance_meters: number;
  distance_km: number;
  duration_mins: number;
  avg_apparent_temp_c: number;
  avg_anomaly_c: number;
  canopy_coverage_pct: number;
  sun_exposed_pct: number;
  waypoints_count: number;
  waypoints: RouteWaypoint[];
  geojson: any;
}

export interface ComparisonSummary {
  thermal_relief_celsius: string;
  canopy_increase: string;
  additional_walk_mins: string;
  water_points_encountered: number;
  cooling_shelters_encountered: number;
  recommendation: string;
}

export interface CoolRouteResponse {
  origin: { lat: number; lon: number; name: string };
  destination: { lat: number; lon: number; name: string };
  comparison_summary: ComparisonSummary;
  direct_route: RouteMetrics;
  cool_route: RouteMetrics;
}

export interface PublicRefuge {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  facilities: string[];
}

export interface SampleCorridor {
  id: string;
  title: string;
  origin: { lat: number; lon: number; name: string };
  destination: { lat: number; lon: number; name: string };
  description: string;
}

export interface SatelliteRecentAcquisition {
  satellite: string;
  agency: string;
  scene_id: string;
  orbit_path?: number;
  orbit_row?: number;
  tile_id?: string;
  acquisition_time: string;
  cloud_cover_pct: number;
  sun_elevation_deg: number;
  sun_azimuth_deg: number;
  thermal_bands?: string[];
  multispectral_bands?: string[];
  resolution_meters: number;
  status: string;
}

export interface SatelliteUpcomingOverpass {
  satellite: string;
  expected_overpass: string;
  revisit_interval_days: number;
  target_product: string;
}

export interface SatelliteStatusResponse {
  ingest_engine: string;
  monitored_region: string;
  total_scenes_indexed: number;
  mean_cloud_cover_pct: number;
  recent_acquisitions: SatelliteRecentAcquisition[];
  upcoming_overpasses: SatelliteUpcomingOverpass[];
}

export interface SatelliteIngestResponse {
  ingest_id: string;
  satellite: string;
  scene_id: string;
  acquisition_timestamp: string;
  cloud_cover_pct: number;
  qc_status: string;
  spatial_coverage: {
    bbox_utm32644: number[];
    cells_updated: number;
    grid_resolution: string;
  };
  radiometric_summary: {
    mean_surface_temp_c: number;
    maximum_surface_temp_c: number;
    minimum_surface_temp_c: number;
    mean_ndvi: number;
    sensor_radiance_calibration: string;
  };
  new_emerging_hotspots_detected: number;
  flagged_cells: {
    cell_id: string;
    ward: string;
    lst_c: number;
    anomaly_c: number;
    driver: string;
  }[];
  next_pipeline_action: string;
}

export interface SensorSatelliteCorrelationResponse {
  title: string;
  sample_nodes_evaluated: number;
  satellite_sensor: string;
  ground_sensors: string;
  pearson_correlation_r2: number;
  mean_absolute_error_c: number;
  validation_verdict: string;
  corridor_pairs: {
    corridor: string;
    satellite_lst_c: number;
    ground_sensor_c: number;
    delta_c: number;
    correlation: number;
  }[];
}

export interface ElevationResponse {
  lat: number;
  lon: number;
  elevation_m: number;
  vertical_datum: string;
  provider: string;
}

export interface TransectSummary {
  id: string;
  name: string;
  start: { lat: number; lon: number; label: string };
  end: { lat: number; lon: number; label: string };
  description: string;
}

export interface TransectPoint {
  step_index: number;
  cumulative_dist_km: number;
  lat: number;
  lon: number;
  elevation_m: number;
  slope_pct: number;
  sea_breeze_cooling_c: number;
  ambient_temp_c: number;
  wind_speed_ms: number;
  is_sea_breeze_active: boolean;
  land_use: string;
  building_height_avg_m: number;
}

export interface TransectProfileResponse {
  transect_id: string;
  name: string;
  description: string;
  total_distance_km: number;
  min_elevation_m: number;
  max_elevation_m: number;
  elevation_gain_m: number;
  max_sea_breeze_relief_c: number;
  profile_points: TransectPoint[];
}

export interface SeaBreezeResponse {
  dist_to_coast_km: number;
  elevation_m: number;
  status: string;
  is_sea_breeze_active: boolean;
  cooling_relief_c: number;
  effective_air_temp_c: number;
  local_wind_speed_ms: number;
  humidity_boost_pct: number;
  max_penetration_reach_km: number;
  front_arrival_time: string;
  marine_boundary_layer_depth_m: number;
}

export interface StreetCanyonRequest {
  building_height_m: number;
  street_width_m: number;
  canyon_orientation_deg: number;
  ambient_wind_speed_ms: number;
  ambient_wind_dir_deg: number;
}

export interface StreetCanyonResponse {
  aspect_ratio_hw: number;
  sky_view_factor: number;
  flow_regime: string;
  flow_description: string;
  wind_street_angle_deg: number;
  canyon_wind_speed_ms: number;
  wind_attenuation_pct: number;
  thermal_entrapment_index: number;
  nocturnal_uhi_excess_c: number;
  recommended_interventions: string[];
}

export interface TerrainMeshNode {
  row: number;
  col: number;
  lat: number;
  lon: number;
  elevation_m: number;
  sea_breeze_cooling_c: number;
  surface_temp_adjusted_c: number;
  is_marine_cooled: boolean;
  canyon_hw_estimate: number;
}

export interface TerrainMeshResponse {
  grid_dimensions: { rows: number; cols: number; total_nodes: number };
  bbox: { min_lat: number; max_lat: number; min_lon: number; max_lon: number };
  crs: string;
  vertical_datum: string;
  gcp_3d_elevation_mode: string;
  nodes: TerrainMeshNode[];
}

export interface CopilotSamplePrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export interface CopilotSuggestedAction {
  label: string;
  action: string;
}

export interface CopilotQueryResponse {
  query: string;
  reply: string;
  spatial_filters: Record<string, any>;
  suggested_actions: CopilotSuggestedAction[];
  referenced_policies: string[];
  map_action?: {
    type: string;
    center: [number, number];
    zoom: number;
    filters: Record<string, any>;
  };
}

export interface HeatIncident {
  id: string;
  reporter_name: string;
  reporter_role: string;
  category: string;
  severity: 'CRITICAL' | 'URGENT' | 'MODERATE';
  status: 'REPORTED' | 'DISPATCHED' | 'RESOLVED';
  ward_id: string;
  zone: string;
  lat: number;
  lon: number;
  location_name: string;
  description: string;
  dispatched_unit: string;
  reported_at: string;
  resolved_at?: string;
  eta_minutes: number;
}

export interface FieldAudit {
  audit_id: string;
  auditor_name: string;
  ward_id: string;
  intervention_type: string;
  site_name: string;
  condition: 'OPTIMAL' | 'NEEDS_ATTENTION' | 'CRITICAL_DEGRADATION';
  notes: string;
  verified_albedo?: number;
  survival_rate_pct?: number;
  tree_count_surveyed?: number;
  timestamp: string;
}

export interface ClimateProjectionMonthly {
  date: string;
  year: number;
  month: number;
  surface_temp_c: number;
  apparent_temp_c: number;
  anomaly_c: number;
  is_projected: boolean;
  data_mode: 'OBSERVED' | 'PROJECTED';
}

export interface ClimateProjectionAnnual {
  year: number;
  is_projected: boolean;
  annual_mean_temp_c: number;
  annual_max_temp_c: number;
  extreme_heat_days: number;
  population_exposed_thousands: number;
}

export interface ClimateProjectionResponse {
  pathway: string;
  pathway_metadata: {
    name: string;
    decadal_warming_rate_c: number;
    extreme_days_multiplier: number;
    description: string;
  };
  period: string;
  historical_period: string;
  projection_period: string;
  annual_summaries: ClimateProjectionAnnual[];
  monthly_time_series: ClimateProjectionMonthly[];
  ward_forecasts: {
    ward_id: string;
    name: string;
    zone: string;
    baseline_2020_peak_c: number;
    projected_2030_peak_c: number;
    driver: string;
  }[];
}

export interface CouncilResolutionApprovedIntervention {
  intervention: string;
  allocation_inr: number;
  target_coverage: string;
  beneficiaries: number;
  cooling_yield: string;
}

export interface CouncilResolutionResponse {
  resolution_id: string;
  session_title: string;
  issuing_authority: string;
  municipal_seat: string;
  date: string;
  tabled_by: string;
  statutory_mandate: string;
  executive_summary: string;
  approved_interventions: CouncilResolutionApprovedIntervention[];
  total_budget_inr: number;
  total_citizens_protected: number;
  projected_uhi_suppression_c: number;
  tender_commencement_date: string;
  compliance_ratification: string[];
  digital_signature_stamp: {
    signatory: string;
    designation: string;
    hash: string;
    verified: boolean;
  };
}



