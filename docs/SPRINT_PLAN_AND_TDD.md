# HeatScape: Sprint Plan & Test-Driven Development (TDD) Strategy

## 1. TDD Philosophy & Testing Pyramid

In accordance with strict production-grade engineering standards, all mathematical, spatial, and analytical logic is constructed using **Test-Driven Development (TDD)**:
1. **Red**: Write a failing test capturing mathematical bounds, constraint violations, or API contract expectations.
2. **Green**: Write the minimal production code necessary to satisfy the test.
3. **Refactor**: Optimize performance, vectorize with NumPy/SciPy/Shapely, and ensure complete typing and docstrings.

```
                  ▲
                 / \
                /E2E\     Integration & E2E Tests (Full Stack API & DB)
               /-----\
              /Service\    Analytical Engine Tests (PELT, Sen's Slope, MILP)
             /---------\
            /Unit Tests \   Math, Formulations, Geometric Projections
           +-------------+
```

---

## 2. Sprint Roadmap Breakdown

### Sprint 1: Project Scaffolding & Geospatial Infrastructure
- **Objective**: Establish repo scaffolding, Docker Compose orchestration, PostgreSQL 16 + PostGIS 3.4 setup, and coordinate system transformation verification.
- **Deliverables**:
  - `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `.env.example`, `README.md`.
  - SQLAlchemy models (`spatial.py`, `observation.py`, `trajectory.py`, `intervention.py`) with spatial indices on `geom` (32644) and `geom_4326` (4326).
  - PostGIS connection and Alembic migration scripts.
- **TDD Tests**:
  - `test_spatial_projection.py`: Test forward and backward transformation between EPSG:4326 and EPSG:32644. Ensure 100m grid cell geometry has area exactly $10,000 \pm 10\text{ m}^2$.
  - `test_database_models.py`: Verify foreign keys, cascade deletions, and spatial geometry columns.

### Sprint 2: Synthetic Seed Generator & Spatial Grid Engine
- **Objective**: Construct high-fidelity offline seed generator populating 1,200 Chennai analytical cells and 43,200 longitudinal observations with distinct thermal archetypes.
- **Deliverables**:
  - `grid_service.py`: Generates uniform 100m grid polygons across Central, North, and South Chennai.
  - `synthetic_service.py`: Generates 36 monthly observations per cell featuring:
    - 20% Emerging hotspots (accelerating positive anomaly in months 19-36).
    - 20% Persistent hotspots (chronic +2.5°C anomaly).
    - 10% Improving cells (sustained cooling trend).
    - 15% Temporary spikes (intermittent high spikes).
    - 35% Normal/Watch variations.
  - Default intervention types catalog seeded (`COOL_ROOF`, `URBAN_CANOPY`, `COOL_PAVEMENT`, `SHADE_CANOPY`).
- **TDD Tests**:
  - `test_synthetic_service.py`: Test that exactly 1,200 cells and 43,200 observations are generated, archetypes match target distributions, and NDVI/temperature values lie in valid physical ranges.

### Sprint 3: Analytical Engine (PELT, Sen's Slope, Mann-Kendall, State Classifier, Explainers)
- **Objective**: Implement analytical services with vectorized scientific libraries (`numpy`, `scipy`, `ruptures`, `shap`).
- **Deliverables**:
  - `trajectory_service.py`:
    - Contextual Anomaly Engine ($A_{self}$ & Queen neighborhood $A_{spatial}$).
    - Sen's Slope calculation & Mann-Kendall trend significance ($S$, $Z$, $p$).
    - PELT regime shift detection with BIC penalty.
    - Calibrated softmax state probability classifier.
  - `explainer_service.py`:
    - TreeSHAP feature attribution for "Why Hot?".
    - Feature drift attribution for "Why Now?".
- **TDD Tests**:
  - `test_trajectory_service.py`:
    - Synthetic monotonic series produces positive Sen's slope with $p < 0.01$.
    - Step-function series triggers PELT regime shift detection at exact index.
    - Verified classification output matches expected state for canonical synthetic profiles.
  - `test_explainer_service.py`: Validate that Shapley values sum to predicted minus expected value.

### Sprint 4: MILP Portfolio Optimizer & FastAPI Core Routes
- **Objective**: Implement the Google OR-Tools optimization engine and expose full REST API.
- **Deliverables**:
  - `optimizer_service.py`: Formulate and solve the MILP portfolio optimization under `EXPECTED` and `CONSERVATIVE` modes using `pywraplp.Solver.CreateSolver('SCIP')`.
  - API Endpoints:
    - `GET /api/v1/heat/cells/geojson`: PostGIS `ST_AsGeoJSON` streaming endpoint.
    - `GET /api/v1/heat/cells/{cell_id}/history`: Chronological observations.
    - `GET /api/v1/heat/cells/{cell_id}/explain`: "Why Hot?" & "Why Now?".
    - `GET /api/v1/heat/kpi`: Citywide summary metrics.
    - `POST /api/v1/optimize`: OR-Tools solver execution.
    - `GET /api/v1/interventions/types`: Catalog retrieval.
- **TDD Tests**:
  - `test_optimizer_service.py`:
    - Total allocated cost never exceeds specified `BudgetINR`.
    - Physical feasibility constraints (roof area, tree spacing, road density) are strictly respected.
    - `CONSERVATIVE` mode produces lower or equal risk reduction per rupee than `EXPECTED` mode.
  - `test_api_endpoints.py`: Verify GeoJSON structure, status codes, and payload schemas.

### Sprint 5: Frontend Dashboard & Intervention Simulator
- **Objective**: Build Next.js 14 application with MapLibre GL JS, technical dark theme, and interactive simulator.
- **Deliverables**:
  - MapLibre GL map view with Carto Dark Matter basemap and 100m grid polygons colored by trajectory state or heat anomaly.
  - Left sidebar KPI overview and filtering.
  - Right sliding drawer with sparkline, "Why Hot?" SHAP bars, and "Why Now?" drift card.
  - Intervention Simulator (`/simulator`) with budget slider, uncertainty toggle, and sortable portfolio allocation table.
- **TDD & Verification Tests**:
  - Component rendering tests and API client contract checks.
  - End-to-end integration smoke test verifying full user journey: explore map -> select cell -> inspect diagnostics -> simulate portfolio.
