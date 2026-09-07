# HeatScape: Frontend Design System & UI Specification

## 1. Visual Aesthetics & Design System Tokens

HeatScape adheres to a **Technical Dark Mode** aesthetic tailored for command-center geospatial operations, municipal engineers, and urban heat resilience planners at Greater Chennai Corporation.

### 1.1 Color Palette
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `surface-canvas` | `#0F172A` | Primary background canvas (Deep Slate) |
| `surface-panel` | `#1E293B` | Floating sidebars, drawers, modals (Dark Charcoal) |
| `surface-panel-subtle`| `#182234` | Nested metric containers, table striping |
| `border-primary` | `#334155` | 1px sharp structural borders between views and modules |
| `border-subtle` | `#1E293B` | Subtle grid dividers |
| `accent-primary` | `#F38020` | Cloudflare Orange: Primary CTAs, active highlights |
| `accent-hover` | `#EA580C` | Hover / interactive focus state for primary buttons |
| `text-primary` | `#F8FAFC` | Primary labels, numerical values, headers |
| `text-secondary` | `#94A3B8` | Subtext, units, captions |
| `text-muted` | `#64748B` | Inactive states, placeholder text |

### 1.2 Trajectory State Color Mapping
State colors are strictly synchronized across the MapLibre GL vector layer, legend badges, and data tables:
| Operational State | Primary Hex | Accent Hex | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **`EMERGING`** | `#EF4444` | `#F38020` | Accelerating severe heat, recent regime shift |
| **`PERSISTENT`**| `#F97316` | `#FB923C` | Chronic structural hotspot |
| **`TEMPORARY`** | `#EAB308` | `#FACC15` | Transient spike |
| **`IMPROVING`** | `#10B981` | `#34D399` | Cooling trend, recovered area |
| **`WATCH`** | `#64748B` | `#94A3B8` | Volatile / low confidence baseline |

### 1.3 Typography & Geometry Rules
- **Header & Body Font**: `Inter`, sans-serif (crisp, high legibility at dense scales).
- **Technical & Monospace Font**: `IBM Plex Mono` (strictly applied to: Coordinates, Cell IDs `CHE_XXX_YYY`, currency values in INR, temperatures in °C, dates, and percentages).
- **Borders & Corners**:
  - `rounded-none` or `rounded-sm` (strictly no soft, bubbly rounded corners).
  - Sharp `1px solid #334155` borders.
  - Zero decorative drop shadows; depth is conveyed strictly through high-contrast border and surface shades.
- **Background Pattern**: A subtle 1px geometric grid pattern (`rgba(30, 41, 59, 0.4)`) rendered on non-map surfaces to echo the 100m analytical grid.

---

## 2. Component Architecture

```
frontend/src/
├── app/
│   ├── layout.tsx         # Root layout with IBM Plex Mono & Inter font definitions
│   ├── page.tsx           # Main Explorer Dashboard (Map + Drawer + Sidebar)
│   └── simulator/
│       └── page.tsx       # Intervention Optimizer / Scenario Simulator
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx    # MapLibre GL wrapper, Carto Dark Matter, grid polygon fill
│   │   └── LayerControls.tsx   # Layer switcher (State, Anomaly, Population, Satellite)
│   ├── dashboard/
│   │   ├── KpiOverview.tsx     # Citywide top-level metrics cards
│   │   ├── CellDetailDrawer.tsx# Right sliding contextual analysis panel
│   │   ├── TrajectorySparkline.tsx # 36-month trendline visualization
│   │   ├── WhyHotCard.tsx      # TreeSHAP physical contributor distribution
│   │   └── WhyNowCard.tsx      # Temporal drift and regime shift diagnosis
│   └── simulator/
│       ├── BudgetSlider.tsx    # INR budget slider (₹10 Lakh - ₹2.5 Crore)
│       ├── UncertaintyToggle.tsx # Conservative vs Expected selector
│       └── PortfolioTable.tsx  # Dense sortable table of allocated interventions
└── lib/
    ├── api-client.ts           # Typed fetcher with error handling
    └── types.ts                # TypeScript interfaces for cells, GeoJSON, trajectories
```

---

## 3. View Workflows

### 3.1 Main Explorer Dashboard (`/`)
1. **Left Sidebar (280px fixed width)**:
   - Platform branding: `HEATSCAPE // GCC CHENNAI`.
   - KPI Summary Cards: Total Cells, Emerging Hotspots (with pulse alert), Persistent Hotspots, Exposed Population.
   - Filter Panel: Filter by State (`ALL`, `EMERGING`, `PERSISTENT`, `IMPROVING`, `TEMPORARY`, `WATCH`), Min Anomaly Slider (+0.5°C to +4.0°C).
   - Layer Controls: Switch polygon color styling between:
     - *Trajectory State* (Discrete categorical palette)
     - *Mean Anomaly °C* (Continuous heat ramp: Blue -> Yellow -> Red)
     - *Population Density* (Monochrome purple/orange density ramp)
2. **Center Viewport**:
   - MapLibre GL map initialized over Chennai coordinates `[80.24, 13.04]`, zoom level 12.
   - Vector polygons loaded via GeoJSON endpoint `GET /api/v1/heat/cells/geojson`.
   - Hover tooltip displaying Cell ID, Current Anomaly, and State.
   - Cell click selects the polygon (highlighted in cyan `#06B6D4`) and opens the Right Context Drawer.
3. **Right Context Drawer (Selected Cell Details)**:
   - Slide-in panel (380px fixed width).
   - Header with Cell ID in IBM Plex Mono + status badge (`EMERGING`).
   - Quick statistics grid: Anomaly (+2.4°C), Sen's Slope (+0.04°C/mo), Population (1,420), Impervious (82%).
   - Interactive 36-month timeline sparkline with baseline vs observed anomaly.
   - "Why Hot?" Card: TreeSHAP contribution bars for built-environment drivers.
   - "Why Now?" Card: Temporal regime shift indicator and land-cover change diagnosis.

### 3.2 Intervention Simulator (`/simulator`)
- Navigation link in top header: `[EXPLORER]` | `[SIMULATOR]`.
- **Left Control Panel (360px)**:
  - Budget Allocation Slider: Range ₹1,000,000 (₹10L) to ₹25,000,000 (₹2.5Cr), step ₹500,000.
  - Mode Selection:
    - `EXPECTED`: Average cooling effect and unit costs.
    - `CONSERVATIVE`: P10 cooling lower bound and high unit costs.
  - Action Button: `RUN PORTFOLIO OPTIMIZATION` (calls `POST /api/v1/optimize`).
- **Right Results View**:
  - Summary KPI strip: Total Capital Allocated, Risk Points Reduced, Population Protected.
  - Dense, sortable intervention allocation table:
    - Columns: Cell ID, Ward, State, Interventions Allocated (Cool Roof $m^2$, Trees, Cool Pavement $m^2$, Shade Canopies), Total Cell Cost (INR), Estimated Cooling (°C).
    - Export button for municipal report (CSV / JSON format).
