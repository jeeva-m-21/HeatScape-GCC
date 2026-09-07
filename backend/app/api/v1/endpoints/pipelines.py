from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, SessionLocal
from app.init_db import init_db
from app.models import ThermalTrajectory, CellObservation, SpatialCell
from app.services.trajectory_service import TrajectoryService
import numpy as np
import logging

logger = logging.getLogger("heatscape_pipeline")
router = APIRouter()


def _recalculate_trajectories_task():
    db = SessionLocal()
    try:
        logger.info("Starting background trajectory recomputation pipeline...")
        cells = db.query(SpatialCell.id).all()
        recomputed = 0
        for (cell_id,) in cells:
            obs = (
                db.query(CellObservation.contextual_anomaly_celsius)
                .filter(CellObservation.cell_id == cell_id)
                .order_by(CellObservation.observation_date.asc())
                .all()
            )
            if not obs:
                continue
            anomalies = np.array([o[0] for o in obs], dtype=float)
            stats = TrajectoryService.classify_trajectory_state(anomalies)

            traj = db.query(ThermalTrajectory).filter(ThermalTrajectory.cell_id == cell_id).first()
            if traj:
                traj.mean_anomaly_celsius = stats["mean_anomaly"]
                traj.median_anomaly_celsius = stats["median_anomaly"]
                traj.recurrence_frequency = stats["recurrence"]
                traj.trend_slope = stats["slope"]
                traj.trend_p_value = stats["p_value"]
                traj.volatility_std = stats["volatility"]
                traj.regime_shift_detected = stats["regime_shift"]
                traj.state_label = stats["state"]
                traj.state_probabilities = stats["probabilities"]
                traj.confidence_score = stats["confidence"]
                recomputed += 1

        db.commit()
        logger.info(f"✓ Background trajectory recomputation finished: {recomputed} cells updated.")
    except Exception as e:
        logger.error(f"Error in recalculate task: {e}")
        db.rollback()
    finally:
        db.close()


@router.post("/seed")
def trigger_seed_pipeline(background_tasks: BackgroundTasks, count: int = 1200):
    """
    Trigger the synthetic data generation pipeline (1,200 Chennai cells, 36 monthly observations).
    """
    background_tasks.add_task(init_db, count)
    return {
        "status": "QUEUED",
        "message": f"Synthetic seeding pipeline queued for {count} cells",
    }


@router.post("/recalculate")
def trigger_recalculate_pipeline(background_tasks: BackgroundTasks):
    """
    Trigger batch recomputation of trajectories (Sen's slope, PELT, calibrated state probabilities).
    """
    background_tasks.add_task(_recalculate_trajectories_task)
    return {
        "status": "QUEUED",
        "message": "Trajectory batch recomputation pipeline queued in background",
    }

