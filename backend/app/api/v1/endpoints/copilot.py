"""
API Endpoints for Chennai HeatScape AI Copilot & Natural Language Spatial Query Engine.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.copilot_service import CopilotService

router = APIRouter()


class CopilotQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Natural language prompt or query")
    context: Optional[Dict[str, Any]] = Field(None, description="Current client context (active route, selected ward, etc.)")


class CopilotQueryResponse(BaseModel):
    query: str
    reply: str
    spatial_filters: Dict[str, Any]
    suggested_actions: List[Dict[str, Any]]
    referenced_policies: List[str]
    map_action: Optional[Dict[str, Any]] = None


@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(req: CopilotQueryRequest):
    """
    Evaluates conversational query, extracts spatial filters, and provides grounded policy advisory.
    """
    return CopilotService.answer_query(message=req.message, context=req.context)


@router.get("/sample-prompts")
def get_sample_prompts():
    """
    Returns curated quick prompts for judges and municipal officers.
    """
    return {
        "sample_prompts": CopilotService.SAMPLE_PROMPTS
    }
