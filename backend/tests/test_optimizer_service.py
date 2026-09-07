import pytest
from app.services.optimizer_service import OptimizerService
from app.services.synthetic_service import SyntheticSeedService


def test_optimizer_budget_constraint():
    """
    Optimizer total cost must never exceed the allocated budget ceiling.
    """
    interventions = SyntheticSeedService.DEFAULT_INTERVENTIONS
    dummy_cells = [
        {
            "id": f"CHE_TEST_{i}",
            "ward_id": "WARD_01",
            "state": "EMERGING" if i % 2 == 0 else "PERSISTENT",
            "population": 1500,
            "building_density": 0.60,
            "road_density": 0.20,
            "roof_area_sqm": 3000.0,
            "sensitive_site_count": 2,
        }
        for i in range(10)
    ]

    budget = 1000000.0  # 10 Lakhs INR
    result = OptimizerService.solve_portfolio(dummy_cells, interventions, budget, mode="EXPECTED")

    assert result["status"] in ["OPTIMAL", "FEASIBLE"]
    assert result["total_cost_inr"] <= budget
    assert result["total_cost_inr"] > 0
    assert result["allocations_count"] > 0
    assert result["population_protected"] > 0


def test_optimizer_conservative_vs_expected():
    """
    Conservative mode uses higher unit costs and lower cooling effects.
    """
    interventions = SyntheticSeedService.DEFAULT_INTERVENTIONS
    dummy_cells = [
        {
            "id": "CHE_TEST_SINGLE",
            "ward_id": "WARD_01",
            "state": "EMERGING",
            "population": 2000,
            "building_density": 0.50,
            "road_density": 0.20,
            "roof_area_sqm": 4000.0,
            "sensitive_site_count": 1,
        }
    ]

    budget = 500000.0  # 5 Lakhs INR
    exp_res = OptimizerService.solve_portfolio(dummy_cells, interventions, budget, mode="EXPECTED")
    cons_res = OptimizerService.solve_portfolio(dummy_cells, interventions, budget, mode="CONSERVATIVE")

    # Risk reduction score in conservative mode should be lower or equal to expected mode
    assert cons_res["total_risk_reduction_score"] <= exp_res["total_risk_reduction_score"]
