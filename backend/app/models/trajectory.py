from sqlalchemy import Column, BigInteger, String, Float, DateTime, ForeignKey, JSON, func
from app.core.database import Base


class ThermalTrajectory(Base):
    __tablename__ = "thermal_trajectories"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    cell_id = Column(String(32), ForeignKey("spatial_cells.id", ondelete="CASCADE"), nullable=False, index=True)

    calculation_window_start = Column(DateTime(timezone=True), nullable=False)
    calculation_window_end = Column(DateTime(timezone=True), nullable=False)

    mean_anomaly_celsius = Column(Float, nullable=False)
    median_anomaly_celsius = Column(Float, nullable=False)
    recurrence_frequency = Column(Float, nullable=False)  # Fraction exceeding +1.5°C
    trend_slope = Column(Float, nullable=False)           # Sen's Slope (°C/month)
    trend_p_value = Column(Float, nullable=False)         # Mann-Kendall p-value
    volatility_std = Column(Float, nullable=False)
    regime_shift_detected = Column(Float, default=0.0)    # 0.0 or 1.0 from PELT

    # Classification & calibration
    state_label = Column(String(16), nullable=False, index=True)  # PERSISTENT, EMERGING, TEMPORARY, IMPROVING, WATCH
    state_probabilities = Column(JSON, nullable=False)            # e.g., {"PERSISTENT": 0.72, ...}
    confidence_score = Column(Float, nullable=False)

    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
