from fastapi import APIRouter, Query, Depends
from typing import Optional, List, Dict, Any
from app.services.mandi_service import GovtMandiPriceService

router = APIRouter(prefix="/market-prices", tags=["Government Market Prices & MSP"])

@router.get("/daily")
def get_daily_mandi_prices(
    state: Optional[str] = Query(None, description="Filters result with State (e.g. 'Andhra Pradesh', 'Telangana')"),
    district: Optional[str] = Query(None, description="Filters result with District (e.g. 'Krishna', 'Guntur')"),
    market: Optional[str] = Query(None, description="Filters result with APMC Market (e.g. 'Vijayawada')"),
    commodity: Optional[str] = Query(None, description="Filters result with Commodity (e.g. 'Tomato', 'Onion')"),
    variety: Optional[str] = Query(None, description="Filters result with Variety (e.g. 'Hybrid Vine')"),
    grade: Optional[str] = Query(None, description="Filters result with Grade (e.g. 'FAQ')"),
    arrival_date: Optional[str] = Query(None, description="Filters result with Arrival Date (e.g. '19/09/2026')"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip for pagination")
):
    """
    Returns daily agricultural prices reported by Government APMC mandis and Rythu Bazars (Agmarknet DMI).
    Supports all Data.gov.in Swagger query & filter parameters across both datasets:
    - Current Daily Price of Various Commodities from Various Markets (Mandi)
    - Variety-wise Daily Market Prices Data of Commodity
    """
    prices = GovtMandiPriceService.get_all_daily_prices(
        state=state,
        district=district,
        market=market,
        commodity=commodity,
        variety=variety,
        grade=grade,
        arrival_date=arrival_date,
        limit=limit,
        offset=offset
    )
    return {
        "status": "success",
        "source": "Government of India – Agmarknet (DMI) & AP Rythu Bazar",
        "total": len(prices),
        "limit": limit,
        "offset": offset,
        "records": prices
    }

@router.get("/benchmark")
def get_crop_govt_benchmark(
    product_name: str = Query(..., description="Name of crop / produce"),
    district: Optional[str] = Query("Krishna", description="District of farmer harvest")
):
    """
    Returns the current government fixed/modal market rate for a specific crop to assist
    farmers during product listing and buyers during procurement.
    """
    benchmark = GovtMandiPriceService.get_benchmark_for_crop(product_name=product_name, district=district)
    return benchmark
