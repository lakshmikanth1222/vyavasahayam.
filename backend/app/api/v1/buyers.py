from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.v1.deps import require_role, require_auth
from app.models.models import (
    User, ProductListing, DemandRequest, MatchResult,
    Order, OrderItem, EscrowTransaction, ProduceBatch
)
from app.schemas.schemas import DemandRequestCreate, DemandRequestOut, MatchResultOut, OrderCreate
from app.services.matching_service import MatchingEngine
from app.services.escrow_service import EscrowPaymentService

from app.services.mandi_service import GovtMandiPriceService

router = APIRouter(prefix="/buyers", tags=["B2B Buyer Marketplace"])

@router.get("/marketplace")
def get_b2b_marketplace(
    product: Optional[str] = None,
    grade: Optional[str] = None,
    max_price: Optional[float] = None,
    min_quantity: Optional[float] = None,
    min_freshness: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductListing).filter(
        ProductListing.status.in_(["ACTIVE", "PARTIALLY_SOLD"]),
        ProductListing.available_quantity > 0
    )
    
    if product:
        query = query.filter(ProductListing.title.ilike(f"%{product}%"))
    if grade:
        query = query.filter(ProductListing.quality_grade == grade.upper())
    if max_price:
        query = query.filter(ProductListing.asking_price <= max_price)
    if min_quantity:
        query = query.filter(ProductListing.available_quantity >= min_quantity)
    if min_freshness:
        query = query.filter(ProductListing.ai_freshness_score >= min_freshness)

    listings = query.order_by(ProductListing.ai_freshness_score.desc()).all()
    results = []
    for l in listings:
        p_name = l.product.name if l.product else l.title
        benchmark = GovtMandiPriceService.get_benchmark_for_crop(
            product_name=p_name,
            district=l.district or "Krishna"
        )
        modal_p = float(benchmark.get("govt_modal_price_kg", l.asking_price))
        min_p = float(benchmark.get("govt_min_price_kg", modal_p * 0.85))
        max_p = float(benchmark.get("govt_max_price_kg", modal_p * 1.15))
        asking_p = float(l.asking_price)
        qty = float(l.available_quantity)

        # Per unit savings & wholesale volume metrics
        savings_kg = round(modal_p - asking_p, 2)
        savings_qtl = round(savings_kg * 100.0, 2)
        savings_pct = round(((modal_p - asking_p) / modal_p) * 100.0, 1) if modal_p > 0 else 0.0
        batch_mandi_cost = round(modal_p * qty, 2)
        batch_asking_cost = round(asking_p * qty, 2)
        batch_total_savings = round(max(0.0, batch_mandi_cost - batch_asking_cost), 2)

        # MSP compliance check
        msp_app = benchmark.get("msp_applicable", False)
        msp_rate = benchmark.get("msp_rate_kg")
        if msp_app and msp_rate:
            if asking_p >= msp_rate:
                msp_status = "MSP_COMPLIANT_FAIR"
            else:
                msp_status = "BELOW_MSP_DISTRESS"
        else:
            msp_status = "MARKET_DRIVEN"

        govt_comparison = {
            "commodity_name": benchmark.get("matched_commodity", p_name),
            "variety": benchmark.get("matched_variety", "Standard Commercial"),
            "govt_modal_price_kg": modal_p,
            "govt_min_price_kg": min_p,
            "govt_max_price_kg": max_p,
            "govt_modal_price_quintal": round(modal_p * 100.0, 2),
            "asking_price_quintal": round(asking_p * 100.0, 2),
            "savings_per_kg": savings_kg,
            "savings_per_quintal": savings_qtl,
            "savings_pct": savings_pct,
            "batch_total_savings": batch_total_savings,
            "batch_mandi_cost": batch_mandi_cost,
            "batch_asking_cost": batch_asking_cost,
            "msp_applicable": msp_app,
            "msp_rate_kg": msp_rate,
            "msp_rate_quintal": round(msp_rate * 100.0, 2) if msp_rate else None,
            "msp_status": msp_status,
            "market_name": benchmark.get("market_name", "APMC Wholesale Yard"),
            "district": benchmark.get("district", l.district or "Krishna"),
            "state": benchmark.get("state", "Andhra Pradesh"),
            "arrival_date": benchmark.get("arrival_date"),
            "trend": benchmark.get("trend", "STABLE"),
            "govt_agency": benchmark.get("govt_agency", "Agmarknet DMI & AP Rythu Bazar")
        }

        results.append({
            "id": l.id,
            "farmer_id": l.farmer_id,
            "farmer_name": l.farmer.full_name if l.farmer else "Local Farmer",
            "product_id": l.product_id,
            "product_name": p_name,
            "title": l.title,
            "quantity": l.quantity,
            "available_quantity": l.available_quantity,
            "unit": l.unit,
            "asking_price": l.asking_price,
            "discount_price": l.discount_price,
            "quality_grade": l.quality_grade,
            "harvest_date": l.harvest_date,
            "remaining_shelf_life_days": l.remaining_shelf_life_days,
            "location_address": l.location_address,
            "village": l.village,
            "district": l.district,
            "image_url": l.image_url,
            "ai_freshness_score": l.ai_freshness_score,
            "ai_freshness_category": l.ai_freshness_category,
            "ai_spoilage_risk_pct": l.ai_spoilage_risk_pct,
            "ai_visible_defects": l.ai_visible_defects,
            "govt_comparison": govt_comparison
        })
    return results

@router.post("/demand-requests")
def create_demand_request(
    data: DemandRequestCreate,
    current_user: User = Depends(require_role(["BUYER_B2B"])),
    db: Session = Depends(get_db)
):
    demand = DemandRequest(
        buyer_id=current_user.id,
        product_name=data.product_name.strip().title(),
        required_quantity_kg=data.required_quantity_kg,
        max_budget_per_kg=data.max_budget_per_kg,
        required_grade=data.required_grade,
        delivery_district=data.delivery_district,
        urgency=data.urgency,
        status="OPEN"
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand

@router.get("/demand-requests")
def get_buyer_demands(
    current_user: User = Depends(require_role(["BUYER_B2B"])),
    db: Session = Depends(get_db)
):
    return db.query(DemandRequest).filter(DemandRequest.buyer_id == current_user.id).order_by(DemandRequest.created_at.desc()).all()

@router.get("/demand-requests/{demand_id}/matches")
def get_demand_matches(
    demand_id: str,
    db: Session = Depends(get_db)
):
    demand = db.query(DemandRequest).filter(DemandRequest.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand request not found")

    # Fetch Government APMC Benchmark for this demand's commodity
    govt_benchmark = GovtMandiPriceService.get_benchmark_for_crop(
        product_name=demand.product_name,
        district=demand.delivery_district or "Krishna"
    )

    listings = db.query(ProductListing).filter(
        ProductListing.status.in_(["ACTIVE", "PARTIALLY_SOLD"]),
        ProductListing.available_quantity > 0
    ).all()
    
    buyer_lat = 16.5150
    buyer_lon = 80.6320
    if demand.buyer and demand.buyer.buyer_profile:
        buyer_lat = demand.buyer.buyer_profile.latitude or buyer_lat
        buyer_lon = demand.buyer.buyer_profile.longitude or buyer_lon

    scored_matches = []
    for l in listings:
        eval_res = MatchingEngine.evaluate_match(
            demand=demand,
            listing=l,
            buyer_lat=buyer_lat,
            buyer_lon=buyer_lon
        )
        if eval_res["product_match"]:
            modal_p = float(govt_benchmark.get("govt_modal_price_kg", l.asking_price))
            asking_p = float(l.asking_price)
            budget_p = float(demand.max_budget_per_kg)
            
            # Commercial Arbitrage
            arbitrage_vs_mandi = round(modal_p - asking_p, 2)
            budget_savings = round(budget_p - asking_p, 2)

            scored_matches.append({
                "listing_id": l.id,
                "listing_title": l.title,
                "farmer_name": l.farmer.full_name if l.farmer else "Local Farmer",
                "farmer_phone": l.farmer.phone if l.farmer else "",
                "product_name": l.product.name if l.product else l.title,
                "available_quantity": l.available_quantity,
                "unit": l.unit,
                "asking_price": l.asking_price,
                "asking_price_quintal": round(asking_p * 100.0, 2),
                "quality_grade": l.quality_grade,
                "freshness_score": l.ai_freshness_score,
                "remaining_shelf_life_days": l.remaining_shelf_life_days,
                "location": f"{l.village}, {l.district}",
                "image_url": l.image_url,
                "match_details": eval_res,
                "commercial_metrics": {
                    "govt_modal_price_kg": modal_p,
                    "govt_modal_price_quintal": round(modal_p * 100.0, 2),
                    "arbitrage_vs_mandi_kg": arbitrage_vs_mandi,
                    "budget_savings_per_kg": budget_savings,
                    "is_below_govt_mandi": asking_p < modal_p,
                    "is_within_buyer_budget": asking_p <= budget_p
                }
            })

    scored_matches.sort(key=lambda x: x["match_details"]["match_score_pct"], reverse=True)
    return {
        "demand_id": demand.id,
        "product_name": demand.product_name,
        "required_quantity_kg": demand.required_quantity_kg,
        "max_budget_per_kg": demand.max_budget_per_kg,
        "required_grade": demand.required_grade,
        "govt_benchmark": govt_benchmark,
        "matches_count": len(scored_matches),
        "matches": scored_matches
    }

@router.post("/orders")
def place_b2b_order(
    data: OrderCreate,
    current_user: User = Depends(require_role(["BUYER_B2B"])),
    db: Session = Depends(get_db)
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one produce item")

    subtotal = 0.0
    items_to_create = []

    for item in data.items:
        listing = db.query(ProductListing).filter(ProductListing.id == item.listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail=f"Listing {item.listing_id} not found")
        if listing.available_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient quantity for {listing.title}. Available: {listing.available_quantity} kg, Requested: {item.quantity} kg"
            )

        unit_price = listing.discount_price if listing.discount_price else listing.asking_price
        line_total = round(unit_price * item.quantity, 2)
        subtotal += line_total

        # Decrement listing stock
        listing.available_quantity -= item.quantity
        if listing.available_quantity == 0:
            listing.status = "SOLD"
        else:
            listing.status = "PARTIALLY_SOLD"

        items_to_create.append({
            "listing": listing,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "total_price": line_total
        })

    total_amount = subtotal # B2B freight included or calculated separately
    order = Order(
        order_number=f"ORD-B2B-{datetime.now().year}-{int(datetime.now().timestamp()) % 100000}",
        order_type="B2B",
        buyer_id=current_user.id,
        status="CONFIRMED",
        subtotal=subtotal,
        delivery_fee=0.0,
        total_amount=total_amount,
        payment_method="ONLINE_ESCROW",
        payment_status="HELD",
        delivery_address=data.delivery_address,
        delivery_slot=data.delivery_slot or "Next Day Morning Logistics",
        buyer_notes=data.buyer_notes
    )
    db.add(order)
    db.flush()

    # Create Order Items and Escrow Hold
    first_listing = items_to_create[0]["listing"]
    for it in items_to_create:
        oi = OrderItem(
            order_id=order.id,
            listing_id=it["listing"].id,
            farmer_id=it["listing"].farmer_id,
            product_name=it["listing"].product.name if it["listing"].product else it["listing"].title,
            quantity=it["quantity"],
            unit=it["listing"].unit,
            unit_price=it["unit_price"],
            total_price=it["total_price"],
            grade=it["listing"].quality_grade
        )
        db.add(oi)

    # Initialize Escrow Hold
    escrow = EscrowPaymentService.create_escrow_hold(
        db=db,
        order=order,
        farmer_id=first_listing.farmer_id,
        gross_amount=total_amount,
        transport_fee=0.0
    )

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "B2B Bulk order confirmed. Payment held securely in Escrow.",
        "order_number": order.order_number,
        "order_id": order.id,
        "total_amount": total_amount,
        "escrow_id": escrow.id
    }
