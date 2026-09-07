from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class InterventionTypeSchema(BaseModel):
    id: str
    name: str
    category: str
    unit_name: str
    unit_cost_inr_low: float
    unit_cost_inr_high: float
    cooling_effect_per_unit_low: float
    cooling_effect_per_unit_high: float
    evidence_grade: str
    maintenance_overhead_annual_inr: float

    model_config = ConfigDict(from_attributes=True)


class CellInterventionAllocation(BaseModel):
    type_id: str
    quantity: float
    unit_name: str
    cost_inr: float
    cooling_effect_celsius: float


class PortfolioCellAllocation(BaseModel):
    cell_id: str
    ward_id: Optional[str] = None
    state: str
    population: int
    interventions: List[CellInterventionAllocation]
    cell_total_cost_inr: float


class OptimizationRequest(BaseModel):
    budget_inr: float
    mode: str = "EXPECTED"  # EXPECTED, CONSERVATIVE
    target_wards: Optional[List[str]] = None
    max_cells: Optional[int] = 50
    equity_weight: Optional[float] = 0.5
    contiguity_priority: Optional[bool] = True


class OptimizationResponse(BaseModel):
    status: str
    mode: str
    allocated_budget_inr: float
    total_cost_inr: float
    total_risk_reduction_score: float
    population_protected: int
    allocations_count: int
    portfolio: List[PortfolioCellAllocation]


class TenderBOQItem(BaseModel):
    item_code: str
    category: str
    description: str
    unit: str
    quantity: float
    unit_rate_inr: float
    amount_inr: float
    tamil_nadu_pwd_spec: str


class TenderManifestResponse(BaseModel):
    tender_id: str
    council_resolution_ref: str
    authority: str
    issuing_division: str
    prepared_date: str
    target_zone: str
    target_wards: List[str]
    total_cells_covered: int
    population_benefited: int
    estimated_cooling_celsius: float
    items: List[TenderBOQItem]
    subtotal_inr: float
    statutory_gst_inr: float
    contingency_overhead_inr: float
    grand_total_inr: float
    signatory_designation: str

