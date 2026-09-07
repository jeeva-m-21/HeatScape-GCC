from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db

router = APIRouter()


@router.get("/")
def list_saved_scenarios(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    List historical or saved intervention planning scenarios.
    """
    return []
