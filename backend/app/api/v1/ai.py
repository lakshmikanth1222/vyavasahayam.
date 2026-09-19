from fastapi import APIRouter
from app.schemas.schemas import DhenuQueryInput, DhenuQueryResponse, FreshnessScreeningResult
from app.services.dhenu_service import DhenuAIService
from app.services.freshness_service import FreshnessAIService

router = APIRouter(prefix="/ai", tags=["AI & Dhenu Assistant"])

@router.post("/dhenu/query", response_model=DhenuQueryResponse)
def query_dhenu_assistant(data: DhenuQueryInput):
    """
    Dhenu Agricultural AI Assistant for market prices, crop advice, schemes, and shelf-life diagnostics.
    """
    res = DhenuAIService.query(
        prompt=data.query,
        language=data.language,
        farmer_context=data.farmer_context
    )
    return res

@router.post("/freshness/scan", response_model=FreshnessScreeningResult)
def scan_freshness(
    product_name: str,
    image_url: str = None,
    harvest_age_hours: float = 4.0
):
    """Computer Vision Freshness & Spoilage Risk scan"""
    return FreshnessAIService.analyze_image(
        product_name=product_name,
        image_url=image_url,
        harvest_age_hours=harvest_age_hours
    )
