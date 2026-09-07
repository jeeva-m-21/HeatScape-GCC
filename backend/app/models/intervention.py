from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, func
from app.core.database import Base


class InterventionType(Base):
    __tablename__ = "intervention_types"

    id = Column(String(32), primary_key=True)  # COOL_ROOF, URBAN_CANOPY, COOL_PAVEMENT, SHADE_CANOPY
    name = Column(String(64), nullable=False)
    category = Column(String(32), nullable=False)
    unit_name = Column(String(16), nullable=False)  # sq_m, tree_count, linear_m, canopy_count
    unit_cost_inr_low = Column(Float, nullable=False)
    unit_cost_inr_high = Column(Float, nullable=False)
    cooling_effect_per_unit_low = Column(Float, nullable=False)   # °C anomaly reduction
    cooling_effect_per_unit_high = Column(Float, nullable=False)
    evidence_grade = Column(String(4), default="B")               # A, B, C, D
    maintenance_overhead_annual_inr = Column(Float, default=0.0)


class InterventionScenario(Base):
    __tablename__ = "intervention_scenarios"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    allocated_budget_inr = Column(Float, nullable=False)
    optimization_mode = Column(String(16), default="EXPECTED")  # EXPECTED, CONSERVATIVE
    portfolio = Column(JSON, nullable=False)                     # Allocated intervention quantities per cell
    total_cost_inr = Column(Float, nullable=False)
    expected_risk_reduction = Column(Float, nullable=False)
    conservative_risk_reduction = Column(Float, nullable=False)
    population_protected = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
