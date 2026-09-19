import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_daily_mandi_prices_all():
    """Test retrieving all government mandi prices without filters."""
    response = client.get("/api/v1/market-prices/daily?limit=150")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total"] >= 75
    assert len(data["records"]) >= 75

    first = data["records"][0]
    assert "commodity" in first
    assert "variety" in first
    assert "modal_price_kg" in first
    assert "daily_change_pct" in first
    assert "trend" in first
    assert "price_history_7d" in first
    assert len(first["price_history_7d"]) == 7
    assert "quality_specs" in first

def test_get_daily_mandi_prices_state_filter():
    """Test state filter."""
    response = client.get("/api/v1/market-prices/daily?state=Andhra+Pradesh")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert all(r["state"].lower() == "andhra pradesh" for r in data["records"])

def test_get_daily_mandi_prices_commodity_filter():
    """Test commodity filter."""
    response = client.get("/api/v1/market-prices/daily?commodity=Tomato")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert all("tomato" in r["commodity"].lower() for r in data["records"])

def test_get_crop_benchmark():
    """Test single crop benchmark matching."""
    response = client.get("/api/v1/market-prices/benchmark?product_name=Paddy")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert "Paddy" in data["matched_commodity"]
    assert data["govt_modal_price_kg"] > 0
    assert data["recommended_fair_range"]["ideal"] > 0
