import pytest
from app.services.clustering_service import SpatialClusteringService
from app.services.optimizer_service import OptimizerService


def test_getis_ord_gi_star_detects_hotspot_cluster():
    # 5 cells where the first 3 form an intense local heat cluster
    cells = [
        {"id": "C1", "centroid_x": 400000.0, "centroid_y": 1440000.0, "contextual_anomaly_celsius": 4.5, "tree_canopy_fraction": 0.02, "impervious_fraction": 0.95, "population": 6000},
        {"id": "C2", "centroid_x": 400100.0, "centroid_y": 1440000.0, "contextual_anomaly_celsius": 4.2, "tree_canopy_fraction": 0.03, "impervious_fraction": 0.90, "population": 5500},
        {"id": "C3", "centroid_x": 400050.0, "centroid_y": 1440100.0, "contextual_anomaly_celsius": 4.0, "tree_canopy_fraction": 0.04, "impervious_fraction": 0.88, "population": 5000},
        {"id": "C4", "centroid_x": 405000.0, "centroid_y": 1445000.0, "contextual_anomaly_celsius": 0.5, "tree_canopy_fraction": 0.30, "impervious_fraction": 0.30, "population": 1200},
        {"id": "C5", "centroid_x": 406000.0, "centroid_y": 1446000.0, "contextual_anomaly_celsius": 0.2, "tree_canopy_fraction": 0.35, "impervious_fraction": 0.20, "population": 1000},
    ]

    enriched = SpatialClusteringService.compute_getis_ord_gi_star(cells, distance_threshold_m=250.0)
    assert len(enriched) == 5

    # C1, C2, C3 should have significantly positive Z-scores compared to distant cool cells
    assert enriched[0]["gi_star_z"] > enriched[3]["gi_star_z"]
    assert enriched[0]["is_hotspot_cluster"] is True


def test_equity_index_bounds():
    cell_high_vulnerability = {
        "tree_canopy_fraction": 0.01,
        "impervious_fraction": 0.95,
        "population": 9000,
        "sensitive_site_count": 4,
    }
    cell_low_vulnerability = {
        "tree_canopy_fraction": 0.40,
        "impervious_fraction": 0.20,
        "population": 1000,
        "sensitive_site_count": 0,
    }

    sevi_high = SpatialClusteringService.compute_equity_index(cell_high_vulnerability)
    sevi_low = SpatialClusteringService.compute_equity_index(cell_low_vulnerability)

    assert 0.0 <= sevi_high <= 1.0
    assert 0.0 <= sevi_low <= 1.0
    assert sevi_high > sevi_low


def test_optimizer_with_equity_and_clustering():
    cells = [
        {"id": "C1", "state": "EMERGING", "centroid_x": 400000.0, "centroid_y": 1440000.0, "contextual_anomaly_celsius": 3.5, "tree_canopy_fraction": 0.02, "impervious_fraction": 0.95, "roof_area_sqm": 4000, "building_density": 0.7, "road_density": 0.2, "population": 5000, "sensitive_site_count": 2},
        {"id": "C2", "state": "WATCH", "centroid_x": 405000.0, "centroid_y": 1445000.0, "contextual_anomaly_celsius": 0.5, "tree_canopy_fraction": 0.30, "impervious_fraction": 0.30, "roof_area_sqm": 4000, "building_density": 0.4, "road_density": 0.2, "population": 1000, "sensitive_site_count": 0},
    ]
    types = [
        {
            "id": "COOL_ROOF",
            "unit_name": "sq_m",
            "unit_cost_inr_low": 120.0,
            "unit_cost_inr_high": 180.0,
            "cooling_effect_per_unit_low": 0.0003,
            "cooling_effect_per_unit_high": 0.0006,
        }
    ]

    result = OptimizerService.solve_portfolio(
        cells=cells,
        intervention_types=types,
        budget_inr=300000.0,
        mode="EXPECTED",
        equity_weight=0.8,
        contiguity_priority=True,
    )

    assert result["status"] in ["OPTIMAL", "FEASIBLE"]
    assert result["total_cost_inr"] <= 300000.0
    # High-vulnerability C1 should receive allocation before C2
    alloc_cell_ids = [p["cell_id"] for p in result["portfolio"]]
    assert "C1" in alloc_cell_ids
