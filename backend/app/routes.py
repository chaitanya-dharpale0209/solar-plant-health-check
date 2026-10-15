import os
from typing import Optional, List, Dict
from fastapi import APIRouter, HTTPException, Query
from app.models import (
    FleetOverviewResponse,
    PlantSummary,
    PlantDetailResponse,
    HealthStatus,
    DataQualityFlag,
)
from app.data_cleaner import clean_and_load_csv
from app.issue_detector import calculate_daily_metrics

router = APIRouter()

# Default path to CSV
DEFAULT_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "solar_plant_data.csv",
)

# In-memory storage/cache
_cached_data = None


def get_processed_data(csv_path: Optional[str] = None):
    global _cached_data
    target_path = csv_path or DEFAULT_CSV_PATH
    if _cached_data is None:
        if not os.path.exists(target_path):
            raise RuntimeError(f"CSV dataset not found at {target_path}")
        grouped_rows, quality_logs = clean_and_load_csv(target_path)
        plants_dict = {}
        for site_id, rows in grouped_rows.items():
            daily_readings, issues, summary = calculate_daily_metrics(rows)
            # Filter quality logs for this site
            site_logs = [log for log in quality_logs if log.site_id == site_id]
            plants_dict[site_id] = {
                "summary": summary,
                "readings": daily_readings,
                "issues": issues,
                "quality_logs": site_logs,
            }
        _cached_data = {
            "plants": plants_dict,
            "all_quality_logs": quality_logs,
        }
    return _cached_data


@router.get("/plants", response_model=FleetOverviewResponse)
def get_all_plants():
    """
    Returns an overview of all 5 solar plants with their current health status
    (Healthy / Needs attention / Underperforming), latest 7-day rolling PR,
    installed capacity, and summary statistics.
    """
    data = get_processed_data()
    plants_data = data["plants"]

    plant_summaries: List[PlantSummary] = [
        info["summary"] for site_id, info in sorted(plants_data.items())
    ]

    total_capacity = sum(p.capacity_kw for p in plant_summaries)
    total_generation = sum(p.total_generation_kwh for p in plant_summaries)
    total_outages = sum(p.outage_days_count for p in plant_summaries)

    health_counts = {
        HealthStatus.HEALTHY.value: sum(
            1 for p in plant_summaries if p.current_status == HealthStatus.HEALTHY
        ),
        HealthStatus.NEEDS_ATTENTION.value: sum(
            1 for p in plant_summaries if p.current_status == HealthStatus.NEEDS_ATTENTION
        ),
        HealthStatus.UNDERPERFORMING.value: sum(
            1 for p in plant_summaries if p.current_status == HealthStatus.UNDERPERFORMING
        ),
    }

    return FleetOverviewResponse(
        plants=plant_summaries,
        total_fleet_capacity_kw=total_capacity,
        total_fleet_generation_kwh=round(total_generation, 1),
        fleet_health_summary=health_counts,
        total_outage_events=total_outages,
        data_quality_issues_count=len(data["all_quality_logs"]),
    )


@router.get("/plants/{plant_id}", response_model=PlantDetailResponse)
def get_plant_detail(
    plant_id: str,
    start_date: Optional[str] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter end date (YYYY-MM-DD)"),
):
    """
    Returns daily timeseries data for a specific plant, including generation,
    irradiance, Performance Ratio, 7-day rolling average, problem flags, and
    all detected issues with dates and diagnostic explanations.
    Supports optional date range filtering (?start_date=...&end_date=...).
    """
    data = get_processed_data()
    site_key = plant_id.strip().upper()

    if site_key not in data["plants"]:
        valid_sites = list(data["plants"].keys())
        raise HTTPException(
            status_code=404,
            detail=f"Plant '{plant_id}' not found. Available plants: {', '.join(valid_sites)}",
        )

    plant_info = data["plants"][site_key]
    readings = plant_info["readings"]
    issues = plant_info["issues"]
    quality_logs = plant_info["quality_logs"]
    summary = plant_info["summary"]

    # Filter readings by date range if provided
    filtered_readings = readings
    if start_date:
        filtered_readings = [r for r in filtered_readings if r.date >= start_date]
    if end_date:
        filtered_readings = [r for r in filtered_readings if r.date <= end_date]

    # Filter issues by date range if relevant
    filtered_issues = issues
    if start_date or end_date:
        filtered_issues = [
            iss for iss in issues
            if iss.date is None or (
                (not start_date or iss.date >= start_date) and (not end_date or iss.date <= end_date)
            )
        ]

    return PlantDetailResponse(
        plant=summary,
        daily_readings=filtered_readings,
        issues=filtered_issues,
        data_quality_log=quality_logs,
        filter_start_date=start_date,
        filter_end_date=end_date,
    )


@router.get("/data-quality-logs", response_model=List[DataQualityFlag])
def get_all_data_quality_logs():
    """
    Returns the comprehensive data audit log documenting all sanitized duplicates,
    missing values, impossible spikes, and clamped percentages.
    """
    data = get_processed_data()
    return data["all_quality_logs"]
