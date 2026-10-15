import os
import pytest
from app.data_cleaner import clean_and_load_csv, parse_float_safely

CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "solar_plant_data.csv",
)


def test_parse_float_safely():
    assert parse_float_safely("123.45") == 123.45
    assert parse_float_safely("  0.0 ") == 0.0
    assert parse_float_safely("") is None
    assert parse_float_safely(None) is None
    assert parse_float_safely("abc") is None


def test_clean_and_load_csv_deduplication():
    grouped, logs = clean_and_load_csv(CSV_PATH)
    # Check that all 5 sites are present
    assert set(grouped.keys()) == {"S1", "S2", "S3", "S4", "S5"}

    # Check that duplicate entries (e.g. S1 on 2026-01-15, S4 on 2026-03-10) were caught
    dup_logs = [l for l in logs if l.action_taken == "dropped_duplicate"]
    assert len(dup_logs) >= 2

    # Verify no duplicate dates exist in any plant's series
    for site_id, rows in grouped.items():
        dates = [r.date for r in rows]
        assert len(dates) == len(set(dates)), f"Duplicate dates found in {site_id}"


def test_clean_and_load_csv_sensor_spikes_and_negatives():
    grouped, logs = clean_and_load_csv(CSV_PATH)

    # Check impossible spike on S2 Jan 20 (48210.0 kWh) was rejected
    spike_logs = [l for l in logs if l.action_taken == "rejected_sensor_spike"]
    assert len(spike_logs) >= 1
    s2_jan20 = next(r for r in grouped["S2"] if r.date == "2026-01-20")
    assert s2_jan20.generation_kwh is None

    # Check negative generation on S1 Feb 11 was rejected
    neg_gen_logs = [l for l in logs if l.action_taken == "rejected_negative" and l.field == "generation_kwh"]
    assert len(neg_gen_logs) >= 1
    s1_feb11 = next(r for r in grouped["S1"] if r.date == "2026-02-11")
    assert s1_feb11.generation_kwh is None

    # Check negative irradiance on S5 Mar 05 was rejected
    neg_irr_logs = [l for l in logs if l.action_taken == "rejected_negative" and l.field == "irradiance"]
    assert len(neg_irr_logs) >= 1
    s5_mar05 = next(r for r in grouped["S5"] if r.date == "2026-03-05")
    assert s5_mar05.irradiance is None

    # Check cloud cover clamped to 100 on S3 Jan 28
    clamp_logs = [l for l in logs if l.action_taken == "clamped_to_100"]
    assert len(clamp_logs) >= 1
    s3_jan28 = next(r for r in grouped["S3"] if r.date == "2026-01-28")
    assert s3_jan28.cloud_cover == 100.0
