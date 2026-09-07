from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.trajectory import TrajectoryResponse

router = APIRouter()


@router.get("/{cell_id}", response_model=TrajectoryResponse)
def get_cell_trajectory(cell_id: str, db: Session = Depends(get_db)):
    """
    Get calculated thermal trajectory parameters and classification state for a specific cell.
    """
    raise HTTPException(status_code=404, detail="Cell trajectory not found")
