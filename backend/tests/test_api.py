import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_plants_endpoint():
    response = client.get("/plants")
    assert response.status_code == 200
    data = response.json()
    assert "plants" in data
    assert len(data["plants"]) == 5
    assert data["total_fleet_capacity_kw"] == 315.0  # 50+100+75+30+60
    assert data["total_outage_events"] == 6

    # Verify site IDs
    site_ids = [p["site_id"] for p in data["plants"]]
    assert site_ids == ["S1", "S2", "S3", "S4", "S5"]


def test_get_plant_detail_endpoint():
    response = client.get("/plants/S1")
    assert response.status_code == 200
    data = response.json()
    assert data["plant"]["site_id"] == "S1"
    assert len(data["daily_readings"]) == 90
    assert "issues" in data
    assert "data_quality_log" in data


def test_get_plant_detail_date_filter():
    response = client.get("/plants/S1?start_date=2026-02-01&end_date=2026-02-15")
    assert response.status_code == 200
    data = response.json()
    assert len(data["daily_readings"]) == 15
    assert data["daily_readings"][0]["date"] == "2026-02-01"
    assert data["daily_readings"][-1]["date"] == "2026-02-15"


def test_get_nonexistent_plant():
    response = client.get("/plants/INVALID_SITE")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
