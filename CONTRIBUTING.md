# Contributing to HeatScape

Thank you for your interest in contributing to HeatScape — the Urban Heat Intelligence Platform for Greater Chennai Corporation.

---

## Development Prerequisites

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| Docker | 24+ | Container orchestration |
| Docker Compose | v2.x | Multi-service dev environment |
| Node.js | 18+ | Frontend development |
| Python | 3.11+ | Backend development |
| `gh` CLI | 2.x | GitHub operations |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/jeeva-m-21/HeatScape-GCC.git
cd HeatScape-GCC

# 2. Copy env (edit if needed — defaults work out of the box)
cp .env.example .env

# 3. Launch all services
docker compose up --build

# Services:
#   Frontend:  http://localhost:3002
#   Backend:   http://localhost:8000
#   API Docs:  http://localhost:8000/docs   (Swagger UI)
#   PostGIS:   localhost:5432
#   Redis:     localhost:6379
```

> **First run:** The backend will auto-train all 3 ML models (~30s). You'll see log messages like `[ModelService] Training xgboost...`.

---

## Repository Structure

```
HeatScape-GCC/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # FastAPI route handlers (16 modules)
│   │   ├── services/           # Business logic + ML engine (14 services)
│   │   ├── schemas/            # Pydantic v2 request/response models
│   │   ├── core/               # Config, database, Redis
│   │   └── ml_artifacts/       # Serialized .joblib models (gitignored)
│   ├── tests/                  # 91 pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/app/                # Next.js 15 App Router (11 routes)
│   ├── src/components/         # Reusable UI components
│   └── src/lib/                # API client, types, utilities
├── docs/                       # Detailed technical documentation
│   ├── ARCHITECTURE.md         # System design and data flow
│   ├── API_SPEC.md             # Full REST API reference
│   ├── ML_MODELS.md            # ML engine, training, and inference
│   ├── ANALYTICS_SPEC.md       # Mathematical models and algorithms
│   ├── FRONTEND_DESIGN.md      # UI/UX design system
│   └── SPRINT_PLAN_AND_TDD.md  # Sprint history and TDD approach
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Backend Development

### Running tests

```bash
# Run from host (using Docker exec)
docker exec heatscape_backend pytest backend/tests/ -v

# Or inside a local venv
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

All 91 tests should pass. We enforce:
- **No skipped tests**
- **No warnings-as-errors** for ML training (numpy deprecations are upstream)

### Adding a new API endpoint

1. Create `backend/app/api/v1/endpoints/<your_module>.py`
2. Define a `router = APIRouter()` and your route handlers
3. Import and register in `backend/app/api/v1/router.py`:
   ```python
   from .endpoints import your_module
   api_router.include_router(your_module.router, prefix="/your-prefix", tags=["Your Tag"])
   ```
4. Add a corresponding `backend/tests/test_<your_module>.py` with at least happy-path and error-case coverage

### Adding a new service

Services live in `backend/app/services/`. Follow the singleton pattern:
```python
# my_service.py
class MyService:
    def __init__(self):
        # initialize state
        pass

my_service = MyService()  # module-level singleton
```

---

## Frontend Development

### Local dev server (without Docker)

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:3000
```

> Note: The Docker Compose frontend runs on port **3002**. Local dev uses 3000.

### Adding a new page

1. Create `frontend/src/app/<route-name>/page.tsx`
2. Add to the navigation in `frontend/src/components/navigation/`
3. Follow the **Pure OLED Black** design system:
   - Background: `#000000` (never `#0a0a0a`)
   - Surface: `#0a0a0a` / `#111111`
   - Accent: Google Blue `#4285F4`
   - Text primary: `#ffffff`
   - Borders: `rgba(255,255,255,0.08)`

### MapLibre GL JS conventions

- Map instance stored in `mapRef` (never in React state — avoid rerenders)
- Popup instance stored in `popupRef` (reuse to avoid memory leaks)
- GeoJSON data cached in `storedDataRef` for style-swap resilience
- Base map styles defined in `BASE_MAP_STYLES` object (Dark Matter, Carto Voyager, Positron)

---

## Code Style

### Python
- **Formatter:** `black` (line length 100)
- **Types:** Type hints required on all public functions
- **Docstrings:** Google-style docstrings for all service methods
- **No ORM:** Direct SQL via `asyncpg` or `psycopg2` where PostGIS queries are needed

### TypeScript / Next.js
- **Formatter:** Prettier (default config)
- **Strict mode:** `tsconfig.json` has `"strict": true`
- **No `any` except:** MapLibre filter expressions (upstream typing limitation — use `as any` and comment why)
- **Components:** Functional components only, hooks for all state

---

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | PostGIS connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis cache/pub-sub |
| `BACKEND_PORT` | `8000` | FastAPI listen port |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Frontend → backend URL |
| `GCP_PROJECT_ID` | _(optional)_ | GCP project for Maps/Vision APIs |

---

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make changes with tests
4. Run the full test suite: `pytest backend/tests/ -v`
5. Submit a Pull Request with:
   - Description of changes
   - Screenshot/recording for UI changes
   - API documentation updates if new endpoints added

---

## Reporting Issues

Open a GitHub Issue with:
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment** (Docker version, OS, browser for frontend issues)

---

## License

MIT License — see `LICENSE` file for details.
