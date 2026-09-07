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
