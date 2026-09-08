import pytest
from app.services.synthetic_service import SyntheticSeedService


def test_synthetic_cells_count_and_bounds():
    """
    Verify synthetic generator creates specified number of cells with valid physical bounds.
    """
    cells = SyntheticSeedService.generate_seed_cells(count=150)
    assert len(cells) >= 120

    for c in cells:
        assert 80.10 <= c["centroid_lon"] <= 80.35
        assert 12.85 <= c["centroid_lat"] <= 13.25
        assert 0.0 <= c["building_density"] <= 1.0
        assert 0.0 <= c["impervious_fraction"] <= 1.0
        assert 0.0 <= c["tree_canopy_fraction"] <= 1.0
        assert c["population"] >= 0


def test_synthetic_observations_36_months():
    """
    Verify that 36 monthly observations are generated with valid temperature and NDVI ranges.
    """
    obs = SyntheticSeedService.generate_cell_observations("CHE_TEST_001", archetype="EMERGING")
    assert len(obs) == 36

    for o in obs:
        assert 20.0 <= o["lst_celsius"] <= 55.0
        assert 0.0 <= o["ndvi"] <= 1.0
        assert o["cloud_mask_qa"] == "VALID"
