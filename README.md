# HeatScape: Spatiotemporal Urban Heat Intelligence & Intervention Planner

[![Greater Chennai Corporation](https://img.shields.io/badge/GCC-Urban%20Climate%20Resilience-orange?style=flat-square)](https://chennaicorporation.gov.in/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.1%20(App%20Router)-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4%20(PostgreSQL%2016)-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgis.net/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-APIs%20Connected-4285F4?style=flat-square&logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**HeatScape** is an enterprise-grade spatiotemporal decision-support, thermal risk observability, and capital intervention planning platform engineered for the **Greater Chennai Corporation (GCC)**, Tamil Nadu, India.

It bridges raw multi-spectral satellite thermal imagery (Landsat-8/9 TIRS, Sentinel-2 MSI), Google Cloud Platform APIs (Elevation & Air Quality), and real-time microclimate IoT sensor feeds into operational civic action. HeatScape classifies multi-year thermal trajectories across 100m spatial cells, isolates biophysical drivers using TreeSHAP, detects spatial clustering with Getis-Ord $G_i^*$, and prescribes budget-optimized cooling interventions via Mixed-Integer Linear Programming (MILP) mapped directly to the **Tamil Nadu PWD 2024 Schedule of Rates (SSR)**.

---

## 🏛️ System Architecture

```
                                  USER INTERFACE LAYER
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Next.js 14 (App Router) • React 18 • TypeScript • Tailwind CSS                          │
│                                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────────────────┐  │
│  │    MapLibre GL 2D    │  │   Three.js 3D WebGL  │  │  Keyboard Command Palette     │  │
│  │  100m Vector Grid    │  │   Urban Heat Field   │  │  (⌘K Ward Intelligence)       │  │
│  │  Multi-Layer Shading │  │   Procedural Masses  │  │  Fuzzy Locality Search        │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────────────────────┘  │
│                                                                                         │
│  11 Operational Screens:                                                                │
│  • / (Command Center)       • /explorer (Trajectories)  • /multiview (Matrix Grid)       │
│  • /simulator (MILP Solver) • /monitoring (MRV / DiD)   • /intelligence (TreeSHAP)       │
│  • /eoc (GRAP Crisis Room)  • /navigator (Cool Paths)   • /studio (Terrain & Sea Breeze) │
│  • /field (Incident Kanban) • /pitch (Executive Deck)                                   │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │ HTTP REST & WebSockets (Port 3002 -> 8000)
                                         ▼
                               APPLICATION SERVER LAYER
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ FastAPI (Python 3.11) Asynchronous Web Engine                                           │
│                                                                                         │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │   Spatial Endpoints    │  │   Optimizer Engine      │  │    Microclimate Services │  │
│  │   /api/v1/heat/*       │  │   Google OR-Tools MILP  │  │    Bay of Bengal Breeze  │  │
│  │   GeoJSON Streaming    │  │   PWD 2024 Cost Catalog │  │    Oke Street Canyon     │  │
│  └────────────────────────┘  └─────────────────────────┘  └──────────────────────────┘  │
│                                                                                         │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │   Google Cloud APIs    │  │   Explainability ML     │  │    IoT Telemetry Stream  │  │
│  │   Elevation API        │  │   XGBoost Regressor     │  │    842 LoRaWAN Sensors   │  │
│  │   Air Quality API      │  │   TreeSHAP Explainer    │  │    Steadman Heat Index   │  │
│  │   Geocoding API        │  │   Sen's Slope & PELT    │  │    IMD GRAP Tiers 0-3    │  │
│  └────────────────────────┘  └─────────────────────────┘  └──────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────────────┬──────────────┘
                       │                                                   │
                       ▼                                                   ▼
             DATA PERSISTENCE LAYER                             BACKGROUND ASYNC WORKERS
┌──────────────────────────────────────────────────┐     ┌────────────────────────────────┐
│ PostgreSQL 16 + PostGIS 3.4                      │     │ Redis 7.2 Cache + Celery       │
│                                                  │     │                                │
│ • spatial_cells (100m UTM Zone 44N EPSG:32644)   │     │ • Distributed Task Queue       │
│ • cell_observations (36-month time series)       │     │ • Satellite Raster Ingestion   │
│ • thermal_trajectories (Sen's slope, archetypes) │     │ • Real-time Telemetry Cache    │
│ • intervention_catalog (Tamil Nadu PWD rates)    │     │ • WebSocket Push Dispatcher    │
└──────────────────────────────────────────────────┘     └────────────────────────────────┘
```

---

## 📊 Data Sources & Earth Observation Inputs

HeatScape fuses continuous multi-source spatiotemporal data covering all **15 Zones and 200 Wards of Greater Chennai**:

| Data Layer | Source / Provider | Spatial Resolution | Temporal Frequency | Utilization in HeatScape |
| :--- | :--- | :--- | :--- | :--- |
| **Land Surface Temp (LST)** | Landsat-8/9 TIRS (Band 10) & ECOSTRESS | 30m / 70m resampled to 100m | 8-day revisit | Baseline temporal anomaly ($A_{\text{self}}$) and contextual anomaly ($A_{\text{spatial}}$). |
| **Vegetation Health (NDVI)** | Sentinel-2 MSI (Bands 4 & 8) | 10m | 5-day revisit | Tree canopy coverage ($0.0 - 1.0$) and green deficit mapping. |
| **Built-up Impervious Surface** | OpenStreetMap (OSM) & High-Res Sentinel-2 | Vector / 10m | Bi-annual sync | Impervious fraction, road density, and rooftop area calculations. |
| **3D Building Envelopes** | GCC City GIS & OSM 3D Poly | Metric polygons | Annual sync | Street canyon aspect ratio ($H/W$), sky view factor (SVF), and aerodynamic roughness. |
| **Topography & Elevation** | Google Elevation API & SRTM DEM | Metric MSL points | Continuous query | 3D terrain profile, contour shading, and elevation above sea level. |
| **Live Ambient Air Quality** | Google Air Quality API | Point coordinates | Real-time hourly | Microclimate PM2.5, PM10, Universal AQI, and health advisory metrics. |
| **In-Situ IoT Environmental Grid** | 842 LoRaWAN (IN865) / MQTT Sensors | Fixed street nodes | 1-minute telemetry | Ground-truth verification, ambient temperature, humidity, and Steadman Apparent Heat Index. |
| **Official Administrative Limits** | Greater Chennai Corporation (GCC) | 200 Wards, 15 Zones | Administrative | Zone-wise equity budgeting, PWD division boundaries, and ward council briefs. |

---

## 🔬 Core Algorithms & Mathematical Foundations

### 1. Unified 100m Spatiotemporal Grid
- **CRS**: UTM Zone 44N (**EPSG:32644**) for metric accuracy without projection distortion.
- **Cell Dimension**: Uniform $100\text{m} \times 100\text{m}$ grid cells ($10,000\text{ m}^2 = 1.0\text{ hectare}$).
- **Coverage**: Complete metropolitan canvas covering all 15 GCC Zones (North: Thiruvottiyur, Manali, Madhavaram; Central: Royapuram, Anna Nagar, Teynampet, Kodambakkam; South: Guindy, Adyar, Velachery, Sholinganallur).
- **Web Delivery**: Projected on-the-fly to WGS84 (**EPSG:4326**) via PostGIS `ST_AsGeoJSON`.

### 2. Dual-Anomaly Formulation
- **Temporal Baseline Anomaly ($A_{\text{self}}$)**: Deviation of cell $i$ in month $t$ from its multi-year seasonal climatological mean:
  $$A_{\text{self}}(i, t) = T(i, t) - \mu_{\text{clim}}(i, m(t))$$
- **Spatial Contextual Anomaly ($A_{\text{spatial}}$)**: Contrast with Queen-contiguous 8-neighborhood ($\mathcal{N}_8$):
  $$A_{\text{spatial}}(i, t) = T(i, t) - \frac{1}{|\mathcal{N}_8(i)|}\sum_{j \in \mathcal{N}_8(i)} T(j, t)$$

### 3. Trajectory Regime & Trend Detection
- **Non-Parametric Sen's Slope**:
  $$\beta = \text{median}\left(\left\{\frac{A(t_j) - A(t_i)}{t_j - t_i} : t_i < t_j\right\}\right)$$
- **PELT (Pruned Exact Linear Time)**: Segmentations with BIC penalty detecting structural regime shifts:
  $$\min_{\tau} \sum_{k=1}^{m} \mathcal{C}(y_{\tau_{k-1}:\tau_k}) + \beta_{\text{pen}} m$$
- **5-State Classification Machine**:
  - `PERSISTENT`: Consistently elevated anomaly ($A > +1.5^\circ\text{C}$) with minimal trend.
  - `EMERGING`: Statistically significant positive trend ($\beta > +0.02^\circ\text{C}/\text{month}$, $p < 0.05$).
  - `IMPROVING`: Statistically significant cooling trend ($\beta < -0.02^\circ\text{C}/\text{month}$).
  - `TEMPORARY`: Transient spike with regime shift reverting to baseline.
  - `WATCH`: Low variance, borderline anomaly ($0.5^\circ\text{C} \le A < 1.5^\circ\text{C}$).

### 4. TreeSHAP Biophysical Attribution
Trained Gradient Boosted Trees (XGBoost) model surface thermal anomaly as a function of biophysical parameters:
$$\text{Anomaly}_i = f(\text{NDVI}_i, \text{Impervious}_i, \text{BuildingDensity}_i, \text{WaterDist}_i, \text{Elevation}_i, \text{SVF}_i)$$
TreeSHAP computes exact Shapley values isolating the localized contribution of each physical factor:
$$\phi_j = \sum_{S \subseteq F \setminus \{j\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left( f_x(S \cup \{j\}) - f_x(S) \right)$$
Enables municipal engineers to see why a ward is hot (e.g., *42% Vegetation Deficit, 31% Impervious Asphalt, 18% Street Canyon Trapping*).

### 5. Mixed-Integer Linear Programming (MILP) Intervention Optimizer
Solves for maximum population thermal relief subject to municipal budget limits:
$$\max \sum_{i \in \text{Cells}} \sum_{k \in \text{Interventions}} \left( c_{ik} \cdot x_{ik} \cdot P_i \cdot E_i \cdot (1 + \lambda_{\text{cluster}} \cdot \mathbf{1}_{\text{hotspot}}(i)) \right)$$
$$\text{subject to: } \sum_{i} \sum_{k} \text{Cost}_k \cdot x_{ik} \le \text{Budget}_{\text{INR}}$$
$$\text{AreaLimit: } \sum_{k} \text{Footprint}_k \cdot x_{ik} \le \text{ApplicableArea}_i, \quad \forall i$$
Where:
- $c_{ik}$: Empirical cooling effect of intervention $k$ in cell $i$.
- $P_i$: Population density of cell $i$.
- $E_i$: Climate vulnerability equity index based on elderly, infant, and informal housing ratios.
- $x_{ik} \in \{0, 1\}$: Binary or integer allocation variables.

### 6. Official Tamil Nadu PWD 2024 Schedule of Rates (SSR)
- **`TN-PWD-2024-SSR-CIV-4412`**: High-Albedo Elastomeric Cool Roof Thermal Coating (SRI > 104) — ₹150/sq.m.
- **`TN-PWD-2024-SSR-HOR-1022`**: Dense Miyawaki Urban Canopy Forestry (Native *Pongamia pinnata*, *Azadirachta indica*) — ₹3,000/tree.
- **`TN-PWD-2024-SSR-CIV-2915`**: Permeable High-Albedo Interlocking Concrete Pavers (Albedo 0.42) — ₹600/sq.m.
- **`TN-PWD-2024-SSR-MEP-5530`**: Transit Hub Tensile Shade Membrane with Photovoltaic Backing — ₹55,000/canopy.
- **`TN-PWD-2024-ENV-8840`**: Urban Wetland & Retention Basin Bio-Engineering — ₹850/sq.m.

### 7. Bay of Bengal Sea Breeze (BBSB) & Street Canyon Microclimate Modeling
- **Marine Layer Intrusion**: Calculates sea breeze cooling delta as a function of coastal distance and inland air temperature:
  $$\Delta T_{\text{breeze}} = \Delta T_{\max} \cdot \exp\left(-\frac{d_{\text{coast}}}{L_{\text{decay}}}\right) \cdot \sin\left(\frac{\pi(h - 10)}{8}\right)$$
- **Oke (1988) Street Canyon Aerodynamic Trapping**:
  $$\text{SVF} = \cos(\arctan(2H/W)), \quad \text{TrappingIndex} = (1 - \text{SVF}) \cdot \left(1 - \frac{u_{\text{canyon}}}{u_{\text{ambient}}}\right)$$

---

## 🧭 Production Screen Directory

| Route | Name | Key Functionality |
| :--- | :--- | :--- |
| **`/`** | **Operational Landing** | Executive overview, clear value explanation, interactive ward search, impact metrics, and scenario previews. |
| **`/explorer`** | **Trajectories Map** | Full MapLibre GL 2D/3D map with 100m grid cells across all 15 zones, continuous thermal blanket, layer switcher, and time projection. |
| **`/multiview`** | **Multi-View Matrix** | 4-layer spatial inspection matrix (`Surface Temp`, `NDVI Canopy`, `Built Impervious`, `Vulnerability`), corridor vectors, and tender exports. |
| **`/simulator`** | **Cooling Scenario Planner** | Google OR-Tools MILP intervention optimizer with budget sliders, target wards, 5-year lifecycle O&M costing, and council briefs. |
| **`/monitoring`** | **Impact Monitoring & MRV** | Difference-in-Differences (DiD) causal counterfactual inference, pre/post intervention validation, and sensor drift telemetry. |
| **`/intelligence`** | **Urban Intelligence & Equity** | Getis-Ord $G_i^*$ spatial autocorrelation clusters ($Z > +2.58\sigma$), demographic vulnerability weights, and global TreeSHAP rankings. |
| **`/eoc`** | **EOC Crisis Room** | Emergency Operations Center: Real-time GCC Graded Response Action Plan (GRAP Stages 0–3), labor bans, and evaporative misting truck dispatch. |
| **`/navigator`** | **Citizen Cool Navigator** | A* Shaded Pedestrian Routing Engine: Direct vs. Shaded Cool Route comparisons with thermal relief deltas and hydration POIs. |
| **`/studio`** | **Open Data & 3D Studio** | STAC/GeoJSON upload, 3D elevation profiling, Oke street canyon analyzer, and Bay of Bengal sea breeze penetration graphs. |
| **`/field`** | **Field Ops & Kanban** | Citizen heat incident triage (English & Tamil), mobile field audit checklist, and real-time intervention photo verification. |
| **`/pitch`** | **Executive Pitch Deck** | 7-slide executive presentation suite with interactive sandboxes, apparent heat calculator, and live capital budget sliders. |

---

## 📡 REST API Reference

The backend exposes a fully documented, asynchronous REST API via FastAPI at `http://localhost:8000/docs`.

### Core Heat & Grid Endpoints
- `GET /api/v1/heat/cells/geojson`: Streams analytical 100m grid cells in GeoJSON format (EPSG:4326) with filter parameters (`min_anomaly`, `state`, `ward_id`, `limit`).
- `GET /api/v1/heat/cells/{cell_id}/history`: Chronological 36-month thermal and biophysical observation records.
- `GET /api/v1/heat/cells/{cell_id}/explain`: TreeSHAP biophysical feature contributions for a specific cell.
- `GET /api/v1/heat/kpi/summary`: Citywide macro-indicators (mean anomaly, persistent hotspots, vulnerable population).

### Google Cloud Platform Services
- `GET /api/v1/google/elevation?lat={lat}&lon={lon}`: Live topographical elevation (meters above MSL) via Google Elevation API.
- `GET /api/v1/google/air-quality?lat={lat}&lon={lon}`: Live ambient air quality (AQI, PM2.5, PM10) via Google Air Quality API.
- `GET /api/v1/google/geocode?address={address}`: Forward geocoding for Chennai landmarks and wards via Google Geocoding API.

### Optimization & Scenarios
- `POST /api/v1/scenarios/optimize`: Solves MILP capital allocation for user-selected budget, wards, and intervention constraints.
- `GET /api/v1/scenarios/catalog`: Catalogs eligible interventions mapped to Tamil Nadu PWD 2024 SSR unit rates.
- `POST /api/v1/scenarios/council-resolution`: Exports an automated GCC Municipal Briefing Memorandum in PDF/Markdown.

### Microclimate & Terrain
- `GET /api/v1/terrain/elevation?lat={lat}&lon={lon}`: High-precision terrain height above MSL.
- `GET /api/v1/terrain/transects/{transect_id}`: Cross-sectional elevation and sea breeze penetration along urban transects.
- `GET /api/v1/terrain/sea-breeze`: Calculates Bay of Bengal marine boundary layer intrusion and temperature offset.
- `POST /api/v1/terrain/street-canyon/analyze`: Computes street canyon aspect ratio ($H/W$), SVF, and thermal trapping index.

### IoT Sensor Mesh & EOC Crisis
- `GET /api/v1/sensors/live`: Real-time telemetry feed from Chennai's 842 LoRaWAN sensor nodes.
- `GET /api/v1/hazard/heatwave-forecast`: 7-day IMD heatwave alert levels (Green, Yellow, Orange, Red).
- `GET /api/v1/hazard/grap-status`: Active GCC GRAP protocol stage and mandatory civil enforcement triggers.
- `POST /api/v1/routing/cool-path`: Computes A* shaded pedestrian routes with hydration refuge waypoints.

---

## 🐳 Docker Deployment & Microservices

The entire platform runs in containerized microservices managed via `docker-compose.yml`:

```yaml
services:
  postgis:
    image: postgis/postgis:16-3.4
    ports: ["5432:5432"]
    volumes: [postgis_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d heatscape"]

  redis:
    image: redis:7.2-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: [.env]
    depends_on: { postgis: { condition: service_healthy }, redis: { condition: service_started } }

  frontend:
    build: ./frontend
    ports: ["3002:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Environment Configuration (`.env`)
```bash
# Database & Cache
DATABASE_URL=postgresql://postgres:postgres@postgis:5432/heatscape
REDIS_URL=redis://redis:6379/0

# Google Cloud Platform APIs
GOOGLE_MAPS_API_KEY=AIzaSyAWFtUnxI2yjqyAyxf7ZHbEDi6L7-TomZw

# Application Environment
ENVIRONMENT=production
CORS_ORIGINS=["http://localhost:3002", "http://localhost:3000"]
```

### Running Locally
```bash
# 1. Clone repository
git clone https://github.com/jeeva-m-21/HeatScape-GCC.git
cd HeatScape-GCC

# 2. Launch Docker microservices
docker compose up -d

# 3. Verify container health
docker compose ps

# 4. View live applications:
#    Frontend Dashboard: http://localhost:3002
#    FastAPI Swagger UI: http://localhost:8000/docs
```

---

## 🧪 Verification & Testing

```bash
# Execute backend test suite (80+ unit and integration tests)
docker exec heatscape_backend pytest tests/ -v

# Run Next.js production build check
docker exec heatscape_frontend npm run build

# Verify PostGIS 15-zone cell coverage
docker exec heatscape_backend python3 -c "
from app.core.database import SessionLocal
from app.models.spatial import SpatialCell
db = SessionLocal()
print('Total Seeded Spatial Cells:', db.query(SpatialCell).count())
"
```

---

## 📜 Municipal Governance & Sovereign Standards

- **Bilingual Tamil/English Interface**: Full linguistic parity supporting English and Tamil (தமிழ்) complying with Tamil Nadu Administrative Gazette standards.
- **Open Standards**: Fully compatible with OGC API Features, STAC (SpatioTemporal Asset Catalog), and GeoJSON open geospatial standards.
- **Tamil Nadu Climate Mission**: Engineered directly for GCC Special Projects Wing, CMDA (Chennai Metropolitan Development Authority), and the Tamil Nadu State Climate Change Council (TNSCCC).
