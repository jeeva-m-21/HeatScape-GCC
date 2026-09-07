from fastapi import APIRouter
from app.api.v1.endpoints import heat, trajectories, interventions, scenarios, pipelines

api_router = APIRouter()

api_router.include_router(heat.router, prefix="/heat", tags=["Heat & Cells"])
api_router.include_router(trajectories.router, prefix="/trajectories", tags=["Trajectories"])
api_router.include_router(interventions.router, prefix="/interventions", tags=["Interventions"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenarios"])
api_router.include_router(pipelines.router, prefix="/pipelines", tags=["Data Pipelines"])
