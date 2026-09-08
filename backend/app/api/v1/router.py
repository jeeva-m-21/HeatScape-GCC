from fastapi import APIRouter
from app.api.v1.endpoints import heat, trajectories, interventions, scenarios, pipelines, sensors, heatwave, routing, ingest, ogc, terrain, copilot, incidents, ws, drone, hazard, models, google

api_router = APIRouter()

api_router.include_router(heat.router, prefix="/heat", tags=["Heat & Cells"])
api_router.include_router(trajectories.router, prefix="/trajectories", tags=["Trajectories"])
api_router.include_router(interventions.router, prefix="/interventions", tags=["Interventions"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenarios"])
api_router.include_router(pipelines.router, prefix="/pipelines", tags=["Data Pipelines"])
api_router.include_router(sensors.router, prefix="/sensors", tags=["IoT Telemetry & Sensors"])
api_router.include_router(heatwave.router, prefix="/heatwave", tags=["Heatwave EAP & GRAP"])
api_router.include_router(routing.router, prefix="/routing", tags=["Citizen Cool Routing"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["Earth Observation & Satellite Ingest"])
api_router.include_router(ogc.router, prefix="/ogc", tags=["OGC API & Open Data"])
api_router.include_router(terrain.router, prefix="/terrain", tags=["3D Terrain & Street Canyons"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["AI Climate Copilot & NLP"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Emergency Incidents & Field Audits"])
api_router.include_router(ws.router, prefix="/ws", tags=["Real-Time WebSockets Telemetry"])
api_router.include_router(drone.router, prefix="/drone", tags=["UAV & Drone Thermal Orthomosaics"])
api_router.include_router(hazard.router, prefix="/hazard", tags=["Compound Multi-Hazard & Sponge Infrastructure"])
api_router.include_router(models.router, prefix="/models", tags=["Machine Learning Models"])
api_router.include_router(google.router, prefix="/google", tags=["Google Cloud Platform & Maps"])



