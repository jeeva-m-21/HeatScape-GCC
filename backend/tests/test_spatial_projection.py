import pytest
from app.services.grid_service import GridService


def test_crs_projection_roundtrip():
    """
    Test coordinate projection roundtrip between WGS84 (EPSG:4326) and UTM Zone 44N (EPSG:32644).
    """
    # Chennai Central Railway Station coordinates
    orig_lon = 80.2755
    orig_lat = 13.0827

    easting, northing = GridService.wgs84_to_utm(orig_lon, orig_lat)
    assert easting > 0
    assert northing > 0

    reproj_lon, reproj_lat = GridService.utm_to_wgs84(easting, northing)
    assert pytest.approx(orig_lon, abs=1e-5) == reproj_lon
    assert pytest.approx(orig_lat, abs=1e-5) == reproj_lat


def test_100m_cell_polygon_area():
    """
    Verify that 100m x 100m cell polygon in EPSG:32644 has area exactly 10,000 sqm.
    """
    easting, northing = GridService.wgs84_to_utm(80.2400, 13.0400)
    poly = GridService.create_100m_cell_polygon(easting, northing)

    assert pytest.approx(10000.0, abs=1e-2) == poly.area
    poly_wgs84 = GridService.polygon_utm_to_wgs84(poly)
    assert len(poly_wgs84.exterior.coords) == 5
