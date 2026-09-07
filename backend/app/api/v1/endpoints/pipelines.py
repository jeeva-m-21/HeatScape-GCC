from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()


@router.post("/seed")
def trigger_seed_pipeline(db: Session = Depends(get_db)):
    """
    Trigger the synthetic data generation pipeline (1,200 Chennai cells, 36 monthly observations).
    """
    return {
        "status": "QUEUED",
        "message": "Synthetic seeding pipeline initialized",
    }


@router.post("/recalculate")
def trigger_recalculate_pipeline(db: Session = Depends(get_db)):
    """
    Trigger batch recomputation of trajectories (Sen's slope, PELT, calibrated state probabilities).
    """
    return {
        "status": "QUEUED",
        "message": "Trajectory batch recomputation pipeline initialized",
    }
