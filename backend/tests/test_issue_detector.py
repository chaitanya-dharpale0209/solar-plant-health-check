import os
import pytest
from app.data_cleaner import clean_and_load_csv, CleanedRow
from app.issue_detector import calculate_daily_metrics

CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "solar_plant_data.csv",
)


def test_pr_formula_accuracy():
    # Example from spec:
    # 50 kW plant on day with irradiance 5.0 kWh/m² ideally produces 50 * 5.0 = 250 kWh.
    # If generated 195 kWh -> PR = 195 / 250 = 0.78.
    rows = [
        CleanedRow(
            date_str="2026-01-01",
            site_id="S1",
            capacity_kw=50.0,
            generation_kwh=195.0,
            irradiance=5.0,
            cloud_cover=20.0,
            temperature=25.0,
        )
    ]
    readings, issues, summary = calculate_daily_metrics(rows)
    assert len(readings) == 1
    assert readings[0].ideal_generation_kwh == 250.0
    assert readings[0].pr == 0.78


def test_outage_detection_and_exclusion_from_rolling():
    rows = [
        CleanedRow(
            date_str=f"2026-01-0{i}",
            site_id="S1",
            capacity_kw=50.0,
            generation_kwh=200.0,
            irradiance=5.0,
            cloud_cover=10.0,
            temperature=25.0,
        )
        for i in range(1, 6)
    ]
    # Add an outage day on Jan 6 (0 kWh on 5.0 irradiance)
    rows.append(
        CleanedRow(
            date_str="2026-01-06",
            site_id="S1",
            capacity_kw=50.0,
            generation_kwh=0.0,
            irradiance=5.0,
            cloud_cover=10.0,
            temperature=25.0,
        )
    )
    # Add normal day on Jan 7
    rows.append(
        CleanedRow(
            date_str="2026-01-07",
            site_id="S1",
            capacity_kw=50.0,
            generation_kwh=200.0,
            irradiance=5.0,
            cloud_cover=10.0,
            temperature=25.0,
        )
    )

    readings, issues, summary = calculate_daily_metrics(rows)
    outage_issues = [iss for iss in issues if iss.issue_type == "OUTAGE"]
    assert len(outage_issues) == 1
    assert outage_issues[0].date == "2026-01-06"

    # Outage reading must be flagged
    jan6 = next(r for r in readings if r.date == "2026-01-06")
    assert jan6.is_outage is True

    # Jan 7 rolling average should only average the 6 normal days (PR = 200/250 = 0.80),
    # completely leaving out the 0.0 outage day
    jan7 = next(r for r in readings if r.date == "2026-01-07")
    assert jan7.rolling_pr_7d == 0.80


def test_real_dataset_patterns():
    grouped, _ = clean_and_load_csv(CSV_PATH)

    # 1. Plant S1: Healthy
    _, _, summary_s1 = calculate_daily_metrics(grouped["S1"])
    assert summary_s1.current_status == "Healthy"
    assert summary_s1.current_pr_7d >= 0.70

    # 2. Plant S3: Sudden Drop detected (around Feb 22)
    _, issues_s3, summary_s3 = calculate_daily_metrics(grouped["S3"])
    sudden_drops = [iss for iss in issues_s3 if iss.issue_type == "SUDDEN_DROP"]
    assert len(sudden_drops) >= 1
    assert summary_s3.current_status == "Underperforming"

    # 3. Plant S4: Multiple Outages detected
    _, issues_s4, summary_s4 = calculate_daily_metrics(grouped["S4"])
    outages_s4 = [iss for iss in issues_s4 if iss.issue_type == "OUTAGE"]
    assert len(outages_s4) == 6
    assert summary_s4.outage_days_count == 6

    # 4. Plant S2: Gradual Decline
    _, issues_s2, summary_s2 = calculate_daily_metrics(grouped["S2"])
    gradual_declines = [iss for iss in issues_s2 if iss.issue_type == "GRADUAL_DECLINE"]
    assert len(gradual_declines) >= 1
    assert summary_s2.current_status in ["Needs attention", "Underperforming"]

    # 5. Plant S5: Cloudy site, but healthy PR
    _, _, summary_s5 = calculate_daily_metrics(grouped["S5"])
    assert summary_s5.current_status == "Healthy"
    assert summary_s5.lifetime_avg_pr >= 0.70
