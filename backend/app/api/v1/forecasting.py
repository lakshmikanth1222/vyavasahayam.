from fastapi import APIRouter, Query, Depends
from typing import Optional, List, Dict, Any
from app.services.demand_forecasting_service import DemandForecastingService

router = APIRouter(prefix="/forecasting", tags=["AI Demand Forecasting & Seasonal Intelligence"])

@router.get("/seasonal-calendar")
def get_seasonal_calendar():
    """
    Returns the comprehensive Indian agricultural & cultural seasonal calendar.
    Includes major demand drivers such as:
    - Kartheeka Maasam (Massive vegetarian surge)
    - Shravana Maasam & Varalakshmi Vratam
    - Sankranti / Pongal Harvest Gala
    - Summer Hydration & Andhra Avakaya Pickle Season
    - Ramadan & Iftar Festivities
    - Navratri, Dussehra & Bathukamma
    - Peak Wedding & Muhurtham Banqueting
    """
    events = DemandForecastingService.get_seasonal_calendar()
    return {
        "status": "success",
        "total_events": len(events),
        "events": events
    }

@router.get("/predictions")
def get_crop_demand_predictions(
    month: Optional[int] = Query(None, ge=1, le=12, description="Target evaluation month (1-12)"),
    season: Optional[str] = Query(None, description="Kharif, Rabi, Zaid, or Festival"),
    category: Optional[str] = Query(None, description="Vegetables, Fruits, Grains, etc."),
    district: Optional[str] = Query("Krishna", description="District for localized mandi forecasts")
):
    """
    Generates crop-wise demand forecasts, price appreciation estimates, and supply deficit risk indices
    by combining historical APMC arrival data with active cultural & seasonal multipliers.
    """
    predictions = DemandForecastingService.get_predictions_for_crops(
        month=month,
        season=season,
        category=category,
        district=district
    )
    return {
        "status": "success",
        "evaluated_month": month,
        "district": district,
        "total_forecasts": len(predictions),
        "predictions": predictions
    }

@router.get("/crop/{crop_name}")
def get_single_crop_forecast(
    crop_name: str,
    district: Optional[str] = Query("Krishna", description="Farmer / buyer district")
):
    """
    Returns a comprehensive 12-month annual demand curve, peak festival spikes,
    price projection trajectory, and optimal sowing calendar for a specific crop.
    """
    detail = DemandForecastingService.get_crop_forecast_detail(
        crop_name=crop_name,
        district=district
    )
    return {
        "status": "success",
        "forecast": detail
    }

@router.get("/farmer-advisory")
def get_farmer_sowing_recommendations(
    district: Optional[str] = Query("Krishna", description="Farmer district"),
    soil_type: Optional[str] = Query("Alluvial / Black Clay", description="Soil typology"),
    acreage: float = Query(2.0, ge=0.5, le=500.0, description="Available agricultural land acreage")
):
    """
    Recommends the highest-margin crop sowing schedules to help farmers target upcoming
    high-demand cultural windows (Kartheeka Maasam, Sankranti, Summer Avakaya, etc.).
    """
    recs = DemandForecastingService.get_farmer_planting_recommendations(
        district=district,
        soil_type=soil_type,
        acreage=acreage
    )
    return {
        "status": "success",
        "district": district,
        "acreage": acreage,
        "recommendations": recs
    }
