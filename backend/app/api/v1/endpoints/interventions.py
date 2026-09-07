from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.intervention import InterventionTypeSchema, OptimizationRequest, OptimizationResponse

router = APIRouter()


@router.get("/types", response_model=List[InterventionTypeSchema])
def list_intervention_types(db: Session = Depends(get_db)):
    """
    Get the standardized catalog of urban cooling interventions.
    """
    return []


@router.post("/optimize", response_model=OptimizationResponse)
def run_optimization(payload: OptimizationRequest, db: Session = Depends(get_db)):
    """
    Run Google OR-Tools MILP portfolio optimization under budget constraints.
    """
    return {
        "status": "NOT_CONFIGURED",
        "mode": payload.mode,
        "allocated_budget_inr": payload.budget_inr,
        "total_cost_inr": 0.0,
        "total_risk_reduction_score": 0.0,
        "population_protected": 0,
        "allocations_count": 0,
        "portfolio": [],
    }
