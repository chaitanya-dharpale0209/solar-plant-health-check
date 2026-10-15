import csv
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from app.models import DataQualityFlag

SITE_NAMES = {
    "S1": "Solaria North - 50 kW",
    "S2": "Helios Array - 100 kW",
    "S3": "SunPeak Station - 75 kW",
    "S4": "Amber Fields - 30 kW",
    "S5": "CloudHaven Site - 60 kW",
}

SITE_CAPACITIES = {
    "S1": 50.0,
    "S2": 100.0,
    "S3": 75.0,
    "S4": 30.0,
    "S5": 60.0,
}


class CleanedRow:
    def __init__(
        self,
        date_str: str,
        site_id: str,
        capacity_kw: float,
        generation_kwh: Optional[float],
        irradiance: Optional[float],
        cloud_cover: Optional[float],
        temperature: Optional[float],
        is_anomaly: bool = False,
    ):
        self.date = date_str
        self.site_id = site_id
        self.capacity_kw = capacity_kw
        self.generation_kwh = generation_kwh
        self.irradiance = irradiance
        self.cloud_cover = cloud_cover
        self.temperature = temperature
        self.is_anomaly = is_anomaly


def parse_float_safely(val: str) -> Optional[float]:
    if val is None:
        return None
    val_clean = str(val).strip()
    if not val_clean:
        return None
    try:
        return float(val_clean)
    except ValueError:
        return None


def clean_and_load_csv(csv_path: str) -> Tuple[Dict[str, List[CleanedRow]], List[DataQualityFlag]]:
    """
    Reads the CSV, performs deduplication, type casting, physical bounds checking,
    sensor spike rejection, and returns sanitized rows grouped by site_id plus an audit log.
    """
    quality_logs: List[DataQualityFlag] = []
    raw_rows: List[dict] = []

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for line_num, row in enumerate(reader, start=2):
            raw_rows.append(row)

    # 1. Deduplication on (site_id, date)
    seen_site_dates: Dict[Tuple[str, str], dict] = {}
    deduped_rows: List[dict] = []

    for row in raw_rows:
        date_str = row.get("date", "").strip()
        # Normalize date format if required (e.g., YYYY-MM-DD or M/D/YYYY)
        try:
            if "/" in date_str:
                dt = datetime.strptime(date_str, "%m/%d/%Y")
            else:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
            normalized_date = dt.strftime("%Y-%m-%d")
        except Exception:
            normalized_date = date_str

        site_id = row.get("site_id", "").strip().upper()
        row["normalized_date"] = normalized_date
        row["site_id"] = site_id

        key = (site_id, normalized_date)
        if key in seen_site_dates:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=normalized_date,
                    field="record",
                    raw_value=f"duplicate row for {site_id}",
                    action_taken="dropped_duplicate",
                    description=f"Duplicate entry for plant {site_id} on {normalized_date} discarded.",
                )
            )
            continue

        seen_site_dates[key] = row
        deduped_rows.append(row)

    # 2. Field cleaning & physical bound validation
    grouped_rows: Dict[str, List[CleanedRow]] = {}

    for row in deduped_rows:
        site_id = row["site_id"]
        date_str = row["normalized_date"]
        is_anomaly = False

        # Capacity
        capacity_kw = parse_float_safely(row.get("capacity_kw", ""))
        if capacity_kw is None or capacity_kw <= 0:
            capacity_kw = SITE_CAPACITIES.get(site_id, 50.0)

        # Irradiance
        raw_irr = row.get("irradiance", "")
        irradiance = parse_float_safely(raw_irr)
        if irradiance is None:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="irradiance",
                    raw_value=raw_irr,
                    action_taken="marked_missing",
                    description=f"Missing irradiance measurement on {date_str} for {site_id}.",
                )
            )
            is_anomaly = True
        elif irradiance < 0:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="irradiance",
                    raw_value=str(irradiance),
                    action_taken="rejected_negative",
                    description=f"Physically impossible negative irradiance ({irradiance} kWh/m²) rejected for {site_id}.",
                )
            )
            irradiance = None
            is_anomaly = True

        # Generation
        raw_gen = row.get("generation_kwh", "")
        generation_kwh = parse_float_safely(raw_gen)
        if generation_kwh is None:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="generation_kwh",
                    raw_value=raw_gen,
                    action_taken="marked_missing",
                    description=f"Missing energy generation value on {date_str} for {site_id}.",
                )
            )
            is_anomaly = True
        elif generation_kwh < 0:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="generation_kwh",
                    raw_value=str(generation_kwh),
                    action_taken="rejected_negative",
                    description=f"Physically impossible negative generation ({generation_kwh} kWh) rejected for {site_id}.",
                )
            )
            generation_kwh = None
            is_anomaly = True
        else:
            # Check maximum theoretical generation limit
            # Theoretical max energy = capacity_kw * irradiance
            # In physical systems PR never exceeds 1.0 (real plants 0.75-0.80)
            if irradiance is not None and irradiance > 0:
                max_theoretical = capacity_kw * irradiance
                # Allow a small 15% margin above theoretical 1.0 for pyranometer calibration variations,
                # but an extreme spike (like 48210 kWh vs 561 kWh) must be rejected
                if generation_kwh > max_theoretical * 1.5:
                    quality_logs.append(
                        DataQualityFlag(
                            site_id=site_id,
                            date=date_str,
                            field="generation_kwh",
                            raw_value=str(generation_kwh),
                            action_taken="rejected_sensor_spike",
                            description=(
                                f"Impossible generation spike ({generation_kwh:,.1f} kWh vs "
                                f"theoretical physical maximum of {max_theoretical:.1f} kWh) rejected for {site_id}."
                            ),
                        )
                    )
                    generation_kwh = None
                    is_anomaly = True

        # Cloud Cover
        raw_cloud = row.get("cloud_cover", "")
        cloud_cover = parse_float_safely(raw_cloud)
        if cloud_cover is None:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="cloud_cover",
                    raw_value=raw_cloud,
                    action_taken="marked_missing",
                    description=f"Missing cloud cover observation on {date_str} for {site_id}.",
                )
            )
        elif cloud_cover > 100.0:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="cloud_cover",
                    raw_value=str(cloud_cover),
                    action_taken="clamped_to_100",
                    description=f"Cloud cover exceeded 100% ({cloud_cover}%). Clamped to 100.0% for {site_id}.",
                )
            )
            cloud_cover = 100.0
            is_anomaly = True
        elif cloud_cover < 0:
            cloud_cover = 0.0

        # Temperature
        raw_temp = row.get("temperature", "")
        temperature = parse_float_safely(raw_temp)
        if temperature is None:
            quality_logs.append(
                DataQualityFlag(
                    site_id=site_id,
                    date=date_str,
                    field="temperature",
                    raw_value=raw_temp,
                    action_taken="marked_missing",
                    description=f"Missing ambient temperature reading on {date_str} for {site_id}.",
                )
            )

        cleaned_item = CleanedRow(
            date_str=date_str,
            site_id=site_id,
            capacity_kw=capacity_kw,
            generation_kwh=generation_kwh,
            irradiance=irradiance,
            cloud_cover=cloud_cover,
            temperature=temperature,
            is_anomaly=is_anomaly,
        )

        if site_id not in grouped_rows:
            grouped_rows[site_id] = []
        grouped_rows[site_id].append(cleaned_item)

    # Sort each plant's rows chronologically
    for site_id in grouped_rows:
        grouped_rows[site_id].sort(key=lambda r: r.date)

    return grouped_rows, quality_logs
