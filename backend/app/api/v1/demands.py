"""
Demands API Router — VyavaSahayam Demand-First Marketplace
===========================================================
Endpoints:
  POST /api/v1/demands                              - Bulk buyer posts demand -> triggers AI match & farmer notifications
  GET  /api/v1/demands                              - List active & historical demands
  GET  /api/v1/demands/{demand_id}                  - Demand details with offers & fulfillment progress
  POST /api/v1/demands/{demand_id}/offers           - Farmer commits supply offer
  GET  /api/v1/demands/{demand_id}/offers           - List supply offers for a demand
  POST /api/v1/demands/{demand_id}/offers/{offer_id}/accept - Buyer accepts offer -> creates real Order & Escrow hold
  POST /api/v1/demands/{demand_id}/offers/{offer_id}/reject - Buyer rejects offer
  GET  /api/v1/demands/opportunities/farmer         - Farmer personalized opportunities feed
  GET  /api/v1/demands/radar                        - Live Demand Radar (B2B + Forecast Gaps + Pre-Orders)
  GET  /api/v1/demands/analytics                    - Demand-First platform analytics
  GET  /api/v1/demands/heatmap                      - District-level demand intensity
"""

from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.v1.deps import require_auth, get_current_user
from app.models.models import (
    User, DemandRequest, DemandOpportunity, DemandOffer, DemandEvent, Order
)
from app.services.demand_engine import DemandFirstEngine

router = APIRouter(prefix="/demands", tags=["Demands"])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────────────────────────────

class CreateDemandRequest(BaseModel):
    product_name: str
    required_quantity_kg: float = Field(..., gt=0)
    unit: str = "kg"
    max_budget_per_kg: float = Field(..., gt=0)
    required_grade: str = "GRADE_A"
    delivery_district: str
    delivery_address: Optional[str] = None
    required_by_date: Optional[datetime] = None
    recurring_demand: bool = False
    recurrence_frequency: Optional[str] = "WEEKLY"
    urgency: str = "NORMAL"  # IMMEDIATE, WITHIN_24H, NORMAL, FLEXIBLE
    notes: Optional[str] = None


class SubmitOfferRequest(BaseModel):
    offered_quantity_kg: float = Field(..., gt=0)
    expected_price_per_kg: float = Field(..., gt=0)
    available_date: Optional[datetime] = None
    quality_grade: str = "GRADE_A"
    listing_id: Optional[str] = None
    notes: Optional[str] = None


class AcceptOfferRequest(BaseModel):
    delivery_address: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# 1. Demand Radar, Analytics & District Heatmap (Public/Auth)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/radar")
def get_demand_radar(db: Session = Depends(get_db)):
    """Live Demand Radar combining Confirmed B2B, AI Forecast Gaps, and Consumer Pre-Orders."""
    return DemandFirstEngine.get_demand_radar(db)


@router.get("/analytics")
def get_demand_analytics(db: Session = Depends(get_db)):
    """Platform-level Demand-First KPIs and conversion metrics."""
    return DemandFirstEngine.get_demand_analytics(db)


@router.get("/heatmap")
def get_demand_heatmap(db: Session = Depends(get_db)):
    """Andhra Pradesh district-level demand intensity heatmap."""
    return DemandFirstEngine.get_district_heatmap(db)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Farmer Demand Opportunities Feed
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/opportunities/farmer")
def get_farmer_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Personalized opportunity feed for the logged-in farmer/FPO,
    complete with AI match scores and transparent explanation breakdown.
    """
    if current_user.role not in ["FARMER", "FPO", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers and FPOs can access the opportunity feed."
        )

    opportunities = (
        db.query(DemandOpportunity)
        .filter(DemandOpportunity.farmer_id == current_user.id)
        .order_by(desc(DemandOpportunity.match_score), desc(DemandOpportunity.created_at))
        .all()
    )

    results = []
    for opp in opportunities:
        d = opp.demand
        if not d or d.status in ["CANCELLED", "EXPIRED", "FULFILLED"]:
            continue
        
        remaining = max(0.0, d.required_quantity_kg - (d.filled_quantity_kg or 0.0))
        results.append({
            "opportunity_id": opp.id,
            "demand_id": d.id,
            "status": opp.status,
            "match_score": opp.match_score,
            "matched_quantity_kg": opp.matched_quantity_kg,
            "estimated_distance_km": opp.estimated_distance_km,
            "estimated_delivery_time": opp.estimated_delivery_time,
            "score_breakdown": opp.score_breakdown_json,
            "explanations": opp.explanation_json or [],
            "created_at": opp.created_at.isoformat() if opp.created_at else None,
            "demand": {
                "id": d.id,
                "product_name": d.product_name,
                "required_quantity_kg": d.required_quantity_kg,
                "filled_quantity_kg": d.filled_quantity_kg or 0.0,
                "remaining_quantity_kg": remaining,
                "unit": d.unit,
                "max_budget_per_kg": d.max_budget_per_kg,
                "required_grade": d.required_grade,
                "delivery_district": d.delivery_district,
                "delivery_address": d.delivery_address,
                "required_by_date": d.required_by_date.isoformat() if d.required_by_date else None,
                "urgency": d.urgency,
                "status": d.status,
                "notes": d.notes,
                "buyer_name": d.buyer.full_name if d.buyer else "Verified Buyer",
            }
        })

    return {
        "status": "success",
        "farmer_id": current_user.id,
        "total_opportunities": len(results),
        "opportunities": results,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. Create and List Demands
# ─────────────────────────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
def create_demand(
    payload: CreateDemandRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Bulk Buyer creates a new procurement demand.
    Triggers the AI matching engine and automatically notifies eligible farmers/FPOs.
    """
    if current_user.role not in ["BUYER", "BUYER_B2B", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered buyers can post procurement demands."
        )

    req_by = payload.required_by_date
    if not req_by:
        req_by = datetime.now(timezone.utc) + timedelta(days=2)

    demand = DemandRequest(
        buyer_id=current_user.id,
        product_name=payload.product_name.strip().title(),
        required_quantity_kg=payload.required_quantity_kg,
        filled_quantity_kg=0.0,
        unit=payload.unit,
        max_budget_per_kg=payload.max_budget_per_kg,
        required_grade=payload.required_grade,
        delivery_district=payload.delivery_district.strip().title(),
        delivery_address=payload.delivery_address,
        required_by_date=req_by,
        recurring_demand=payload.recurring_demand,
        recurrence_frequency=payload.recurrence_frequency,
        urgency=payload.urgency,
        notes=payload.notes,
        status="OPEN",
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)

    # Process matching & notifications
    match_result = DemandFirstEngine.process_new_demand(db, demand)

    return {
        "status": "success",
        "message": f"Demand for {demand.required_quantity_kg:,.0f} kg {demand.product_name} created successfully!",
        "demand": {
            "id": demand.id,
            "product_name": demand.product_name,
            "required_quantity_kg": demand.required_quantity_kg,
            "max_budget_per_kg": demand.max_budget_per_kg,
            "delivery_district": demand.delivery_district,
            "status": demand.status,
            "created_at": demand.created_at.isoformat() if demand.created_at else None,
        },
        "matching_summary": match_result,
    }


@router.get("")
def list_demands(
    status_filter: Optional[str] = Query(None, alias="status"),
    product: Optional[str] = None,
    district: Optional[str] = None,
    buyer_only: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Lists demands with optional filtering."""
    query = db.query(DemandRequest)

    if buyer_only and current_user:
        query = query.filter(DemandRequest.buyer_id == current_user.id)

    if status_filter:
        query = query.filter(DemandRequest.status == status_filter.upper())
    
    if product:
        query = query.filter(DemandRequest.product_name.ilike(f"%{product}%"))
        
    if district:
        query = query.filter(DemandRequest.delivery_district.ilike(f"%{district}%"))

    demands = query.order_by(desc(DemandRequest.created_at)).all()

    items = []
    for d in demands:
        items.append({
            "id": d.id,
            "buyer_id": d.buyer_id,
            "buyer_name": d.buyer.full_name if d.buyer else "Verified Buyer",
            "product_name": d.product_name,
            "required_quantity_kg": d.required_quantity_kg,
            "filled_quantity_kg": d.filled_quantity_kg or 0.0,
            "remaining_quantity_kg": max(0.0, d.required_quantity_kg - (d.filled_quantity_kg or 0.0)),
            "unit": d.unit,
            "max_budget_per_kg": d.max_budget_per_kg,
            "required_grade": d.required_grade,
            "delivery_district": d.delivery_district,
            "delivery_address": d.delivery_address,
            "required_by_date": d.required_by_date.isoformat() if d.required_by_date else None,
            "urgency": d.urgency,
            "status": d.status,
            "notes": d.notes,
            "offers_count": len(d.offers) if d.offers else 0,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })

    return {
        "status": "success",
        "total": len(items),
        "demands": items,
    }


@router.get("/{demand_id}")
def get_demand_details(
    demand_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Full detail of a demand including all submitted offers, timeline events, and match stats."""
    demand = db.query(DemandRequest).filter(DemandRequest.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demand not found")

    offers = []
    for o in demand.offers:
        offers.append({
            "id": o.id,
            "farmer_id": o.farmer_id,
            "farmer_name": o.farmer.full_name if o.farmer else "Farmer",
            "farmer_phone": o.farmer.phone if o.farmer else None,
            "offered_quantity_kg": o.offered_quantity_kg,
            "expected_price_per_kg": o.expected_price_per_kg,
            "quality_grade": o.quality_grade,
            "available_date": o.available_date.isoformat() if o.available_date else None,
            "status": o.status,
            "order_id": o.order_id,
            "notes": o.notes,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })

    events = []
    for e in demand.events:
        events.append({
            "id": e.id,
            "event_type": e.event_type,
            "payload": e.payload_json,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        })

    remaining = max(0.0, demand.required_quantity_kg - (demand.filled_quantity_kg or 0.0))
    pct_filled = round(((demand.filled_quantity_kg or 0.0) / max(demand.required_quantity_kg, 1.0)) * 100, 1)

    return {
        "status": "success",
        "demand": {
            "id": demand.id,
            "buyer_id": demand.buyer_id,
            "buyer_name": demand.buyer.full_name if demand.buyer else "Verified Buyer",
            "product_name": demand.product_name,
            "required_quantity_kg": demand.required_quantity_kg,
            "filled_quantity_kg": demand.filled_quantity_kg or 0.0,
            "remaining_quantity_kg": remaining,
            "fill_percentage": pct_filled,
            "unit": demand.unit,
            "max_budget_per_kg": demand.max_budget_per_kg,
            "required_grade": demand.required_grade,
            "delivery_district": demand.delivery_district,
            "delivery_address": demand.delivery_address,
            "required_by_date": demand.required_by_date.isoformat() if demand.required_by_date else None,
            "urgency": demand.urgency,
            "status": demand.status,
            "notes": demand.notes,
            "created_at": demand.created_at.isoformat() if demand.created_at else None,
            "offers": offers,
            "events": events,
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. Supply Offer Lifecycle (Submit, List, Accept, Reject)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{demand_id}/offers", status_code=status.HTTP_201_CREATED)
def submit_supply_offer(
    demand_id: str,
    payload: SubmitOfferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Farmer commits supply against a posted demand."""
    if current_user.role not in ["FARMER", "FPO", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered farmers and FPOs can offer supply."
        )

    try:
        res = DemandFirstEngine.submit_supply_offer(
            db=db,
            farmer_user=current_user,
            demand_id=demand_id,
            offered_quantity_kg=payload.offered_quantity_kg,
            expected_price_per_kg=payload.expected_price_per_kg,
            available_date=payload.available_date,
            quality_grade=payload.quality_grade,
            listing_id=payload.listing_id,
            notes=payload.notes,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{demand_id}/offers")
def list_demand_offers(
    demand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """List all supply offers submitted for a specific demand."""
    demand = db.query(DemandRequest).filter(DemandRequest.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demand not found")

    offers = (
        db.query(DemandOffer)
        .filter(DemandOffer.demand_id == demand_id)
        .order_by(desc(DemandOffer.created_at))
        .all()
    )

    results = []
    for o in offers:
        results.append({
            "id": o.id,
            "demand_id": o.demand_id,
            "farmer_id": o.farmer_id,
            "farmer_name": o.farmer.full_name if o.farmer else "Farmer",
            "offered_quantity_kg": o.offered_quantity_kg,
            "expected_price_per_kg": o.expected_price_per_kg,
            "total_value": round(o.offered_quantity_kg * o.expected_price_per_kg, 2),
            "quality_grade": o.quality_grade,
            "available_date": o.available_date.isoformat() if o.available_date else None,
            "status": o.status,
            "order_id": o.order_id,
            "notes": o.notes,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })

    return {
        "status": "success",
        "demand_id": demand_id,
        "total_offers": len(results),
        "offers": results,
    }


@router.post("/{demand_id}/offers/{offer_id}/accept")
def accept_supply_offer(
    demand_id: str,
    offer_id: str,
    payload: AcceptOfferRequest = AcceptOfferRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Buyer accepts a farmer's supply offer.
    Triggers order creation, Escrow hold, and marks demand PARTIALLY_FILLED or FULLY_FILLED.
    """
    try:
        res = DemandFirstEngine.accept_supply_offer(
            db=db,
            buyer_user=current_user,
            demand_id=demand_id,
            offer_id=offer_id,
            delivery_address=payload.delivery_address,
        )
        return res
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{demand_id}/offers/{offer_id}/reject")
def reject_supply_offer(
    demand_id: str,
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Buyer rejects a supply offer."""
    demand = db.query(DemandRequest).filter(DemandRequest.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demand not found")

    if demand.buyer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    offer = db.query(DemandOffer).filter(DemandOffer.id == offer_id, DemandOffer.demand_id == demand_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    offer.status = "REJECTED"
    db.commit()

    return {
        "status": "success",
        "message": f"Supply offer from {offer.farmer.full_name} has been rejected.",
    }
