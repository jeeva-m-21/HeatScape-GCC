# HeatScape: Spatiotemporal Urban Heat Intelligence & Intervention Planner

**HeatScape** is an enterprise-grade spatiotemporal decision-support platform designed for the **Greater Chennai Corporation (GCC)**, Tamil Nadu, India.

It transforms raw Land Surface Temperature (LST) observations into actionable urban resilience operations by classifying multi-year thermal trajectories, explaining root physical drivers, and optimizing capital-constrained cooling interventions using Mixed-Integer Linear Programming (MILP).

---

## Key Features

1. **Analytical Grid System**: 100m × 100m uniform spatial grid units ($10,000\text{ m}^2$ per cell) projected in **UTM Zone 44N (EPSG:32644)** with automatic GeoJSON projection in **WGS84 (EPSG:4326)**.
2. **Contextual Anomaly Engine**: Decouples macro-seasonal swings ($A_{self}$) and localized spatial micro-climate variances ($A_{spatial}$) via Queen-contiguous neighborhood analysis.
3. **Statistical Trajectory Classification**:
   - Non-parametric monotonic trend detection via **Sen's Slope** and **Mann-Kendall** rank correlation.
   - Structural regime-shift detection via **PELT** (`ruptures`) with BIC penalty.
   - Calibrated 5-state trajectory classification: `PERSISTENT`, `EMERGING`, `TEMPORARY`, `IMPROVING`, and `WATCH`.
4. **Explainable AI (XAI)**:
   - **"Why Hot?"**: Local TreeSHAP attribution of built-environment contributors (impervious cover, building density, canopy deficit, elevation).
   - **"Why Now?"**: Temporal feature drift attribution isolating land-use change, vegetation loss, and abrupt microclimate shifts.
5. **Prescriptive Portfolio Optimizer**:
   - Google OR-Tools MILP solver allocating Cool Roofs, Urban Forest Canopies, Cool Pavements, and Transit Hub Shade Canopies under physical space limits and hard municipal budget constraints.
   - Dual uncertainty modes: `EXPECTED` vs. `CONSERVATIVE`.
6. **Command-Center User Interface**:
   - Next.js 14 App Router with Tailwind CSS in **Technical Dark Mode** (`#0F172A`).
   - MapLibre GL JS rendering live analytical polygons on Carto Dark Matter basemap.
   - Dynamic slide-out diagnostic drawer and split-screen intervention simulator.

---

## Project Documentation

Detailed design specifications and architectural documents are located in `/docs`:
- [Architecture & Coordinate Reference Systems](docs/ARCHITECTURE.md)
- [Mathematical & Analytical Specifications](docs/ANALYTICS_SPEC.md)
- [REST API Specification (v1)](docs/API_SPEC.md)
- [Frontend Design System & UI Specification](docs/FRONTEND_DESIGN.md)
- [Sprint Plan & TDD Strategy](docs/SPRINT_PLAN_AND_TDD.md)

---

## Quickstart & Local Deployment

### Prerequisites
- Docker (v24+) & Docker Compose (v2+)
- Python 3.11+ (for local backend development)
- Node.js 18+ and npm (for local frontend development)

### Launching via Docker Compose

```bash
# 1. Clone or navigate to the repository
cd /home/jeeva/projects/Hackathon-1

# 2. Copy environment configuration
cp .env.example .env

# 3. Launch the full stack (PostGIS, Redis, FastAPI Backend, Next.js Frontend)
docker compose up --build -d

# 4. View running services
docker compose ps
```

The services will be reachable at:
- **Frontend Web Dashboard**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostGIS Database**: `localhost:5432` (User: `heatscape_admin`, DB: `heatscape_db`)

---

## Repository Structure

```text
heatscape/
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ANALYTICS_SPEC.md
│   ├── API_SPEC.md
│   ├── FRONTEND_DESIGN.md
│   └── SPRINT_PLAN_AND_TDD.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_spatial_projection.py
│   │   ├── test_trajectory_service.py
│   │   ├── test_optimizer_service.py
│   │   └── test_api_endpoints.py
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── celery_app.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── spatial.py
│       │   ├── observation.py
│       │   ├── trajectory.py
│       │   └── intervention.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── spatial.py
│       │   ├── trajectory.py
│       │   ├── intervention.py
│       │   └── analytics.py
│       ├── api/
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── router.py
│       │       └── endpoints/
│       │           ├── heat.py
│       │           ├── trajectories.py
│       │           ├── interventions.py
│       │           ├── scenarios.py
│       │           └── pipelines.py
│       └── services/
│           ├── __init__.py
│           ├── grid_service.py
│           ├── trajectory_service.py
│           ├── optimizer_service.py
│           ├── explainer_service.py
│           └── synthetic_service.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── next.config.mjs
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   └── simulator/
        │       └── page.tsx
        ├── components/
        │   ├── map/
        │   │   ├── MapContainer.tsx
        │   │   └── LayerControls.tsx
        │   ├── dashboard/
        │   │   ├── CellDetailDrawer.tsx
        │   │   ├── KpiOverview.tsx
        │   │   ├── TrajectorySparkline.tsx
        │   │   ├── WhyNowCard.tsx
        │   │   └── WhyHotCard.tsx
        │   └── simulator/
        │       ├── BudgetSlider.tsx
        │       ├── UncertaintyToggle.tsx
        │       └── PortfolioTable.tsx
        └── lib/
            ├── api-client.ts
            └── types.ts
```
