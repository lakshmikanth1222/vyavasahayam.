import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_seasonal_calendar():
    """Test retrieving full seasonal calendar with cultural drivers."""
    response = client.get("/api/v1/forecasting/seasonal-calendar")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_events"] >= 6

    # Verify Kartheeka Maasam driver exists with strict vegetarian dietary shift
    kartheeka = next((e for e in data["events"] if "kartheeka" in e["id"]), None)
    assert kartheeka is not None
    assert "VEGETARIAN_SURGE" in kartheeka["dietary_shift"]
    assert len(kartheeka["top_demand_crops"]) > 0
    assert any("Spinach" in c["crop"] or "Palak" in c["crop"] or "Amaranthus" in c["crop"] for c in kartheeka["top_demand_crops"])

def test_get_predictions_by_month():
    """Test monthly predictive demand forecasts."""
    # Test Month 11 (November - Kartheeka Maasam)
    response = client.get("/api/v1/forecasting/predictions?month=11")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_forecasts"] > 0
    assert data["evaluated_month"] == 11

    # First item should have a positive demand spike
    first = data["predictions"][0]
    assert "commodity" in first
    assert "projected_price_kg" in first
    assert "demand_spike_pct" in first
    assert "optimal_sowing_window" in first
    assert first["demand_spike_pct"] > 0

def test_get_single_crop_forecast():
    """Test 12-month demand trajectory for Tomato."""
    response = client.get("/api/v1/forecasting/crop/Tomato")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    forecast = data["forecast"]
    assert forecast["commodity"] == "Tomato"
    assert len(forecast["annual_demand_curve"]) == 12
    assert "peak_demand_analysis" in forecast
    assert forecast["peak_demand_analysis"]["peak_spike_pct"] > 0
    assert "recommended_sowing_period" in forecast["peak_demand_analysis"]

def test_get_farmer_sowing_recommendations():
    """Test farmer planting recommendations with acreage simulation."""
    response = client.get("/api/v1/forecasting/farmer-advisory?district=Krishna&acreage=3.0")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["recommendations"]) > 0
    rec = data["recommendations"][0]
    assert "crop" in rec
    assert "sow_window" in rec
    assert "harvest_window" in rec
    assert "estimated_net_profit_inr" in rec
    assert rec["estimated_net_profit_inr"] > 0
