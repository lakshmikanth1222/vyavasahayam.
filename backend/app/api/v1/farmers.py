from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.deps import require_role, require_auth
from app.models.models import (
    User, Product, ProductListing, ProduceBatch, FreshnessDigitalTwin,
    Order, OrderItem, EscrowTransaction, QualityCheck
)
from app.schemas.schemas import ListingCreate, ListingOut, FreshnessScreeningResult
from app.services.freshness_service import FreshnessAIService

router = APIRouter(prefix="/farmers", tags=["Farmer Dashboard"])

@router.post("/screen-image", response_model=FreshnessScreeningResult)
def screen_produce_image(
    product_name: str,
    image_url: Optional[str] = None,
    harvest_age_hours: float = 4.0,
    iot_temp: float = 24.0,
    iot_humidity: float = 65.0
):
    """AI Computer Vision screening layer for instant quality & shelf life evaluation"""
    return FreshnessAIService.analyze_image(
        product_name=product_name,
        image_url=image_url,
        harvest_age_hours=harvest_age_hours,
        iot_temp=iot_temp,
        iot_humidity=iot_humidity
    )

@router.get("/listings")
def get_farmer_listings(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_role(["FARMER"])),
    db: Session = Depends(get_db)
):
    query = db.query(ProductListing).filter(ProductListing.farmer_id == current_user.id)
    if status_filter:
        query = query.filter(ProductListing.status == status_filter.upper())
    
    listings = query.order_by(ProductListing.created_at.desc()).all()
    results = []
    for l in listings:
        results.append({
            "id": l.id,
            "farmer_id": l.farmer_id,
            "product_id": l.product_id,
            "product_name": l.product.name if l.product else l.title,
            "title": l.title,
            "quantity": l.quantity,
            "available_quantity": l.available_quantity,
            "unit": l.unit,
            "asking_price": l.asking_price,
            "discount_price": l.discount_price,
            "quality_grade": l.quality_grade,
            "harvest_date": l.harvest_date,
            "expected_shelf_life_days": l.expected_shelf_life_days,
            "remaining_shelf_life_days": l.remaining_shelf_life_days,
            "location_address": l.location_address,
            "village": l.village,
            "district": l.district,
            "image_url": l.image_url,
            "ai_analyzed": l.ai_analyzed,
            "ai_freshness_score": l.ai_freshness_score,
            "ai_freshness_category": l.ai_freshness_category,
            "ai_spoilage_risk_pct": l.ai_spoilage_risk_pct,
            "ai_visible_defects": l.ai_visible_defects,
            "status": l.status,
            "created_at": l.created_at
        })
    return results

@router.post("/listings")
def create_farmer_listing(
    data: ListingCreate,
    current_user: User = Depends(require_role(["FARMER"])),
    db: Session = Depends(get_db)
):
    # Lookup or create base product
    prod = db.query(Product).filter(Product.name.ilike(data.product_name.strip())).first()
    if not prod:
        prod = Product(
            name=data.product_name.strip().title(),
            category="Fresh Produce",
            standard_unit=data.unit,
            drying_suitable="Tomato" in data.product_name or "Chilli" in data.product_name or "Onion" in data.product_name
        )
        db.add(prod)
        db.flush()

    # Run AI Freshness screening
    ai_result = FreshnessAIService.analyze_image(
        product_name=data.product_name,
        image_url=data.image_url,
        harvest_age_hours=3.0,
        iot_temp=data.iot_temp or 24.5,
        iot_humidity=data.iot_humidity or 68.0
    )

    listing = ProductListing(
        farmer_id=current_user.id,
        product_id=prod.id,
        title=data.title or f"{prod.name} (Direct Harvest)",
        quantity=data.quantity,
        available_quantity=data.quantity,
        unit=data.unit,
        asking_price=data.asking_price,
        quality_grade=ai_result["quality_grade"],
        harvest_date=data.harvest_date or datetime.now(timezone.utc),
        expected_shelf_life_days=int(ai_result["estimated_shelf_life_days"]),
        remaining_shelf_life_days=ai_result["estimated_shelf_life_days"],
        location_address=data.location_address,
        village=data.village or "Gannavaram",
        district=data.district or "Krishna",
        image_url=data.image_url or prod.image_url,
        ai_analyzed=True,
        ai_freshness_score=ai_result["freshness_score"],
        ai_freshness_category=ai_result["freshness_category"],
        ai_spoilage_risk_pct=ai_result["spoilage_risk_pct"],
        ai_visible_defects=ai_result["visible_defects"],
        ai_confidence=ai_result["confidence"],
        iot_temp=data.iot_temp or 24.5,
        iot_humidity=data.iot_humidity or 68.0,
        status="ACTIVE" if ai_result["quality_grade"] != "REJECTED" else "REJECTED",
        notes=data.notes
    )
    db.add(listing)
    db.flush()

    # Initialize Traceable Batch
    batch = ProduceBatch(
        batch_code=f"BATCH-{datetime.now().year}-{prod.name[:3].upper()}-{listing.id[:6].upper()}",
        listing_id=listing.id,
        product_id=prod.id,
        farmer_id=current_user.id,
        quantity_kg=data.quantity,
        current_stage="HARVESTED",
        current_grade=listing.quality_grade,
        freshness_score=ai_result["freshness_score"],
        freshness_category=ai_result["freshness_category"],
        remaining_shelf_life_days=ai_result["estimated_shelf_life_days"],
        spoilage_risk_pct=ai_result["spoilage_risk_pct"],
        current_location=f"Farm Packhouse, {listing.village}, {listing.district}"
    )
    db.add(batch)
    db.flush()

    # Initialize Digital Twin
    twin = FreshnessDigitalTwin(
        batch_id=batch.id,
        initial_shelf_life_days=ai_result["estimated_shelf_life_days"],
        current_shelf_life_days=ai_result["estimated_shelf_life_days"],
        freshness_score=ai_result["freshness_score"],
        current_state=ai_result["freshness_category"]
    )
    db.add(twin)

    # Record Initial Quality Check
    qc = QualityCheck(
        batch_id=batch.id,
        stage="FARMER_PICKUP",
        grade=listing.quality_grade,
        inspector_name="AI Automated Sensor & Vision Gate",
        weight_kg=data.quantity,
        freshness_score=ai_result["freshness_score"],
        notes="Automated harvest screening completed successfully."
    )
    db.add(qc)

    db.commit()
    db.refresh(listing)

    return {
        "success": True,
        "message": "Produce listing created and batch digital twin activated.",
        "listing_id": listing.id,
        "batch_code": batch.batch_code,
        "ai_screening": ai_result
    }

@router.get("/orders")
def get_farmer_orders(
    current_user: User = Depends(require_role(["FARMER"])),
    db: Session = Depends(get_db)
):
    items = db.query(OrderItem).filter(OrderItem.farmer_id == current_user.id).all()
    results = []
    for item in items:
        order = item.order
        results.append({
            "order_id": order.id,
            "order_number": order.order_number,
            "order_type": order.order_type,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit": item.unit,
            "unit_price": item.unit_price,
            "total_price": item.total_price,
            "order_status": order.status,
            "payment_status": order.payment_status,
            "delivery_address": order.delivery_address,
            "delivery_slot": order.delivery_slot,
            "created_at": order.created_at
        })
    return results

@router.get("/earnings")
def get_farmer_earnings(
    current_user: User = Depends(require_role(["FARMER"])),
    db: Session = Depends(get_db)
):
    escrows = db.query(EscrowTransaction).filter(EscrowTransaction.farmer_id == current_user.id).all()
    gross = sum(e.farmer_gross_amount for e in escrows)
    transport = sum(e.transport_charge for e in escrows)
    platform = sum(e.platform_fee for e in escrows)
    insurance = sum(e.insurance_deduction for e in escrows)
    net_released = sum(e.farmer_net_payout for e in escrows if e.status == "RELEASED")
    net_held = sum(e.farmer_net_payout for e in escrows if e.status in ["HELD", "BUYER_CONFIRMED"])

    return {
        "gross_sales_inr": round(gross, 2),
        "transport_deductions_inr": round(transport, 2),
        "platform_fee_inr": round(platform, 2),
        "insurance_contributions_inr": round(insurance, 2),
        "net_payout_released_inr": round(net_released, 2),
        "escrow_held_inr": round(net_held, 2),
        "transactions": [
            {
                "id": e.id,
                "order_id": e.order_id,
                "gross_amount": e.farmer_gross_amount,
                "insurance_deduction": e.insurance_deduction,
                "net_payout": e.farmer_net_payout,
                "status": e.status,
                "release_date": e.release_date,
                "created_at": e.created_at
            }
            for e in escrows
        ]
    }

from app.services.demand_forecasting_service import DemandForecastingService

@router.get("/recommendations")
def get_farmer_crop_recommendations(
    district: Optional[str] = Query("Krishna", description="Farmer district"),
    soil_type: Optional[str] = Query("Alluvial / Black Clay", description="Soil type"),
    acreage: float = Query(2.0, description="Farmer land acreage"),
    current_user: User = Depends(require_auth)
):
    return DemandForecastingService.get_farmer_planting_recommendations(
        district=district,
        soil_type=soil_type,
        acreage=acreage
    )
