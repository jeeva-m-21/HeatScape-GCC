import os
import sys
import logging
from sqlalchemy import text
from geoalchemy2.shape import from_shape
from app.core.database import Base, engine, SessionLocal
from app.models import SpatialCell, CellObservation, ThermalTrajectory, InterventionType
from app.services.synthetic_service import SyntheticSeedService
from app.services.trajectory_service import TrajectoryService
from datetime import datetime
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("heatscape_init")


def init_db(seed_cells_count: int = 1200):
    logger.info("Connecting to database and enabling PostGIS extension...")
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.commit()

    logger.info("Creating relational and spatial tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Intervention Types if empty
        existing_types = db.query(InterventionType).count()
        if existing_types == 0:
            logger.info("Seeding default intervention catalog...")
            for it in SyntheticSeedService.DEFAULT_INTERVENTIONS:
                new_type = InterventionType(
                    id=it["id"],
                    name=it["name"],
                    category=it["category"],
                    unit_name=it["unit_name"],
                    unit_cost_inr_low=it["unit_cost_inr_low"],
                    unit_cost_inr_high=it["unit_cost_inr_high"],
                    cooling_effect_per_unit_low=it["cooling_effect_per_unit_low"],
                    cooling_effect_per_unit_high=it["cooling_effect_per_unit_high"],
                    evidence_grade=it["evidence_grade"],
                    maintenance_overhead_annual_inr=it["maintenance_overhead_annual_inr"],
                )
                db.add(new_type)
            db.commit()
            logger.info("✓ Intervention catalog seeded.")

        # 2. Seed Spatial Cells & Observations if empty
        existing_cells = db.query(SpatialCell).count()
        if existing_cells == 0:
            logger.info(f"Generating {seed_cells_count} analytical cells across Chennai...")
            cells_data = SyntheticSeedService.generate_seed_cells(count=seed_cells_count)

            # Archetype quotas: 20% Emerging, 20% Persistent, 10% Improving, 15% Temporary, 35% Watch
            archetypes = (
                ["EMERGING"] * int(seed_cells_count * 0.20)
                + ["PERSISTENT"] * int(seed_cells_count * 0.20)
                + ["IMPROVING"] * int(seed_cells_count * 0.10)
                + ["TEMPORARY"] * int(seed_cells_count * 0.15)
            )
            # Fill remaining with WATCH
            while len(archetypes) < seed_cells_count:
                archetypes.append("WATCH")

            cell_models = []
            obs_models = []
            traj_models = []

            for idx, c in enumerate(cells_data):
                arch = archetypes[idx]

                # Convert shapely geometry into GeoAlchemy2 element
                geom_utm = from_shape(c["poly_utm"], srid=32644)
                geom_wgs = from_shape(c["poly_wgs84"], srid=4326)

                cell_models.append(SpatialCell(
                    id=c["id"],
                    centroid_lat=c["centroid_lat"],
                    centroid_lon=c["centroid_lon"],
                    ward_id=c["ward_id"],
                    zone_id=c["zone_id"],
                    geom=geom_utm,
                    geom_4326=geom_wgs,
                    building_density=c["building_density"],
                    road_density=c["road_density"],
                    impervious_fraction=c["impervious_fraction"],
                    tree_canopy_fraction=c["tree_canopy_fraction"],
                    roof_area_sqm=c["roof_area_sqm"],
                    water_distance_m=c["water_distance_m"],
                    elevation_m=c["elevation_m"],
                    population=c["population"],
                    population_density_sqkm=c["population_density_sqkm"],
                    sensitive_site_count=c["sensitive_site_count"],
                ))

                # Generate 36 monthly observations
                observations = SyntheticSeedService.generate_cell_observations(c["id"], archetype=arch)
                anomalies = []
                for o in observations:
                    anomalies.append(o["contextual_anomaly_celsius"])
                    obs_models.append(CellObservation(
                        cell_id=c["id"],
                        observation_date=o["observation_date"],
                        lst_celsius=o["lst_celsius"],
                        ndvi=o["ndvi"],
                        cloud_mask_qa=o["cloud_mask_qa"],
                        valid_pixel_fraction=o["valid_pixel_fraction"],
                        air_temp_2m=o["air_temp_2m"],
                        relative_humidity_2m=o["relative_humidity_2m"],
                        seasonal_baseline_lst=o["seasonal_baseline_lst"],
                        contextual_anomaly_celsius=o["contextual_anomaly_celsius"],
                        spatial_anomaly_celsius=o["spatial_anomaly_celsius"],
                    ))

                # Calculate trajectory
                t_stats = TrajectoryService.classify_trajectory_state(np.array(anomalies, dtype=float))
                traj_models.append(ThermalTrajectory(
                    cell_id=c["id"],
                    calculation_window_start=observations[0]["observation_date"],
                    calculation_window_end=observations[-1]["observation_date"],
                    mean_anomaly_celsius=t_stats["mean_anomaly"],
                    median_anomaly_celsius=t_stats["median_anomaly"],
                    recurrence_frequency=t_stats["recurrence"],
                    trend_slope=t_stats["slope"],
                    trend_p_value=t_stats["p_value"],
                    volatility_std=t_stats["volatility"],
                    regime_shift_detected=t_stats["regime_shift"],
                    state_label=t_stats["state"],
                    state_probabilities=t_stats["probabilities"],
                    confidence_score=t_stats["confidence"],
                ))

            logger.info("Inserting spatial cells batch...")
            db.bulk_save_objects(cell_models)
            db.commit()

            logger.info(f"Inserting {len(obs_models)} cell observations batch...")
            db.bulk_save_objects(obs_models)
            db.commit()

            logger.info(f"Inserting {len(traj_models)} thermal trajectories batch...")
            db.bulk_save_objects(traj_models)
            db.commit()

            logger.info("✓ Database initialized and populated with high-fidelity synthetic seed data.")
        else:
            logger.info(f"Database already contains {existing_cells} cells. Skipping initial seeding.")
    finally:
        db.close()


if __name__ == "__main__":
    count = 1200
    if len(sys.argv) > 1:
        count = int(sys.argv[1])
    init_db(count)
