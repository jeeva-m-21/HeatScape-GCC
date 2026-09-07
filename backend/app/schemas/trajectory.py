from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict
from datetime import datetime


class TrajectoryResponse(BaseModel):
    cell_id: str
    calculation_window_start: datetime
    calculation_window_end: datetime
    mean_anomaly_celsius: float
    median_anomaly_celsius: float
    recurrence_frequency: float
    trend_slope: float
    trend_p_value: float
    volatility_std: float
    regime_shift_detected: float
    state_label: str
    state_probabilities: Dict[str, float]
    confidence_score: float
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CellObservationItem(BaseModel):
    observation_date: datetime
    lst_celsius: float
    ndvi: Optional[float] = None
    air_temp_2m: Optional[float] = None
    relative_humidity_2m: Optional[float] = None
    seasonal_baseline_lst: Optional[float] = None
    contextual_anomaly_celsius: Optional[float] = None
    spatial_anomaly_celsius: Optional[float] = None
    cloud_mask_qa: str = "VALID"

    model_config = ConfigDict(from_attributes=True)
