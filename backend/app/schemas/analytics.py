from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ShapFeatureContribution(BaseModel):
    feature: str
    value: float
    contribution_celsius: float


class WhyHotResponse(BaseModel):
    base_value_celsius: float
    predicted_lst_celsius: float
    shap_values: List[ShapFeatureContribution]
    primary_driver: str


class WhyNowResponse(BaseModel):
    regime_shift_detected: bool
    regime_shift_estimated_date: Optional[datetime] = None
    ndvi_drift: float
    lst_drift_celsius: float
    spatial_anomaly_drift_celsius: float
    diagnosis: str


class CellExplainResponse(BaseModel):
    cell_id: str
    why_hot: WhyHotResponse
    why_now: WhyNowResponse


class KpiResponse(BaseModel):
    total_cells: int
    persistent_count: int
    emerging_count: int
    temporary_count: int
    improving_count: int
    watch_count: int
    exposed_population: int
    mean_city_anomaly: float
    max_observed_anomaly: float
