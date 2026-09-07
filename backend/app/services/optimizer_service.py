from ortools.linear_solver import pywraplp
from typing import List, Dict, Any, Optional


class OptimizerService:
    """
    Mixed-Integer Linear Programming portfolio solver using Google OR-Tools.
    Optimizes intervention allocations across urban cells subject to physical constraints
    and municipal budget ceilings.
    """

    STATE_WEIGHTS = {
        "EMERGING": 2.0,
        "PERSISTENT": 1.5,
        "TEMPORARY": 1.0,
        "WATCH": 1.0,
        "IMPROVING": 0.8,
    }

    @classmethod
    def solve_portfolio(
        cls,
        cells: List[Dict[str, Any]],
        intervention_types: List[Dict[str, Any]],
        budget_inr: float,
        mode: str = "EXPECTED",
    ) -> Dict[str, Any]:
        """
        Solves the MILP intervention portfolio.
        mode: "EXPECTED" (mean cost & cooling) or "CONSERVATIVE" (high cost & P10 cooling)
        """
        solver = pywraplp.Solver.CreateSolver("SCIP")
        if not solver:
            return {"status": "SOLVER_NOT_AVAILABLE", "portfolio": []}

        # Index intervention types
        types_by_id = {it["id"]: it for it in intervention_types}

        # Parameter lookup by mode
        unit_costs = {}
        cooling_effects = {}

        for it_id, it in types_by_id.items():
            if mode == "CONSERVATIVE":
                unit_costs[it_id] = it["unit_cost_inr_high"]
                cooling_effects[it_id] = it["cooling_effect_per_unit_low"]
            else:  # EXPECTED
                unit_costs[it_id] = (it["unit_cost_inr_low"] + it["unit_cost_inr_high"]) / 2.0
                cooling_effects[it_id] = (it["cooling_effect_per_unit_low"] + it["cooling_effect_per_unit_high"]) / 2.0

        # Decision variables: x[cell_id, intervention_id] >= 0
        x = {}
        for c in cells:
            cid = c["id"]
            # Physical capacity limits
            roof_limit = c.get("roof_area_sqm", 0.0) * 0.80
            bld_density = c.get("building_density", 0.0)
            road_density = c.get("road_density", 0.0)
            open_area = max(0.0, 10000.0 * (1.0 - bld_density - road_density))
            tree_limit = max(0.0, open_area / 25.0)  # Min 25 sqm per canopy tree
            pavement_limit = 10000.0 * road_density * 0.50
            sensitive_count = c.get("sensitive_site_count", 0)
            shade_limit = min(4.0, float(sensitive_count * 2))

            limits = {
                "COOL_ROOF": roof_limit,
                "URBAN_CANOPY": tree_limit,
                "COOL_PAVEMENT": pavement_limit,
                "SHADE_CANOPY": shade_limit,
            }

            for it_id in types_by_id:
                var_name = f"x_{cid}_{it_id}"
                upper_bound = limits.get(it_id, 0.0)
                # Tree count and shade canopy can be integer, others continuous
                if it_id in ["URBAN_CANOPY", "SHADE_CANOPY"]:
                    x[cid, it_id] = solver.IntVar(0.0, upper_bound, var_name)
                else:
                    x[cid, it_id] = solver.NumVar(0.0, upper_bound, var_name)

        # Budget Constraint: sum(unit_cost * x) <= budget_inr
        budget_expr = solver.Sum(
            unit_costs[it_id] * x[c["id"], it_id]
            for c in cells
            for it_id in types_by_id
        )
        solver.Add(budget_expr <= budget_inr)

        # Objective Function: Maximize sum(cooling * population * state_weight * x)
        objective = solver.Objective()
        for c in cells:
            cid = c["id"]
            pop = max(1, c.get("population", 100))
            st = c.get("state", "WATCH")
            w = cls.STATE_WEIGHTS.get(st, 1.0)
            for it_id in types_by_id:
                coeff = cooling_effects[it_id] * pop * w
                objective.SetCoefficient(x[cid, it_id], coeff)

        objective.SetMaximization()

        # Solve
        status = solver.Solve()

        status_str = "UNKNOWN"
        if status == pywraplp.Solver.OPTIMAL:
            status_str = "OPTIMAL"
        elif status == pywraplp.Solver.FEASIBLE:
            status_str = "FEASIBLE"
        else:
            return {
                "status": "INFEASIBLE",
                "mode": mode,
                "allocated_budget_inr": budget_inr,
                "total_cost_inr": 0.0,
                "total_risk_reduction_score": 0.0,
                "population_protected": 0,
                "allocations_count": 0,
                "portfolio": [],
            }

        total_cost = 0.0
        total_risk_score = 0.0
        protected_population = 0
        portfolio = []

        for c in cells:
            cid = c["id"]
            cell_allocations = []
            cell_cost = 0.0
            for it_id in types_by_id:
                qty = x[cid, it_id].solution_value()
                if qty > 0.01:
                    cost = qty * unit_costs[it_id]
                    cooling = qty * cooling_effects[it_id]
                    cell_allocations.append({
                        "type_id": it_id,
                        "quantity": round(qty, 2),
                        "unit_name": types_by_id[it_id]["unit_name"],
                        "cost_inr": round(cost, 2),
                        "cooling_effect_celsius": round(cooling, 3),
                    })
                    cell_cost += cost

            if cell_allocations:
                portfolio.append({
                    "cell_id": cid,
                    "ward_id": c.get("ward_id"),
                    "state": c.get("state", "WATCH"),
                    "population": c.get("population", 0),
                    "interventions": cell_allocations,
                    "cell_total_cost_inr": round(cell_cost, 2),
                })
                total_cost += cell_cost
                protected_population += c.get("population", 0)

        total_risk_score = objective.Value()

        return {
            "status": status_str,
            "mode": mode,
            "allocated_budget_inr": budget_inr,
            "total_cost_inr": round(total_cost, 2),
            "total_risk_reduction_score": round(total_risk_score, 2),
            "population_protected": protected_population,
            "allocations_count": len(portfolio),
            "portfolio": portfolio,
        }
