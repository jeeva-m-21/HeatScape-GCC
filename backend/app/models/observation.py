from sqlalchemy import Column, BigInteger, String, Float, DateTime, ForeignKey, UniqueConstraint, func
from app.core.database import Base


class CellObservation(Base):
    __tablename__ = "cell_observations"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    cell_id = Column(String(32), ForeignKey("spatial_cells.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(DateTime(timezone=True), nullable=False, index=True)

    lst_celsius = Column(Float, nullable=False)
    ndvi = Column(Float, nullable=True)
    cloud_mask_qa = Column(String(16), default="VALID")  # VALID, CLOUD, SHADOW, SATURATED
    valid_pixel_fraction = Column(Float, default=1.0)
    air_temp_2m = Column(Float, nullable=True)
    relative_humidity_2m = Column(Float, nullable=True)

    # Anomaly fields
    seasonal_baseline_lst = Column(Float, nullable=True)
    contextual_anomaly_celsius = Column(Float, nullable=True)
    spatial_anomaly_celsius = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("cell_id", "observation_date", name="uq_cell_observation_date"),
    )
