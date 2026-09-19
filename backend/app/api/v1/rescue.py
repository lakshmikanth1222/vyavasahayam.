"""
Rescue Engine & Government Infrastructure API Router — VyavaSahayam
===================================================================
Endpoints for post-harvest loss prevention, real-time disruption mitigation,
multi-tier alternative routing, and government infrastructure registries.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.api.v1.deps import require_auth, get_optional_current_user
from app.models.models import (
    RescueEvent, RescueOption, GovernmentInfrastructure,
    InfrastructureSource, SolarDryingCentre, User
)
from app.schemas.schemas import RescueTriggerRequest, RescueActionExecute
from app.services.rescue_engine import RescueEngineService

router = APIRouter(prefix="/rescue", tags=["Post-Harvest Rescue Engine"])


@router.get("/sources")
def get_infrastructure_sources(db: Session = Depends(get_db)):
    """
    Returns authoritative government registries feeding the infrastructure layer
    (NHB, Open Government Data, AP Horticulture, MoFPI, WDRA).
    """
    sources = db.query(InfrastructureSource).order_by(InfrastructureSource.source_name).all()
    return [
        {
            "id": s.id,
            "source_name": s.source_name,
            "agency": s.agency,
            "source_type": s.source_type,
            "api_url": s.api_url,
            "source_url": s.source_url,
            "update_frequency": s.update_frequency,
            "records_count": s.records_count,
            "last_sync": s.last_sync,
            "next_sync": s.next_sync,
            "status": s.status,
        }
        for s in sources
    ]


@router.get("/infrastructure")
def search_government_infrastructure(
    district: Optional[str] = Query(None, description="Filter by district (e.g. Krishna, Guntur)"),
    facility_type: Optional[str] = Query(None, description="Filter by type (e.g. COLD_STORAGE, PULPING_UNIT, PACK_HOUSE)"),
    commodity: Optional[str] = Query(None, description="Filter by supported commodity (e.g. Tomato, Onion)"),
    ownership_type: Optional[str] = Query(None, description="Filter by ownership (e.g. GOVERNMENT, GOVERNMENT_ASSISTED, FPO_COOPERATIVE)"),
    db: Session = Depends(get_db)
):
    """
    Searches verified government-owned and assisted post-harvest infrastructure facilities.
    """
    query = db.query(GovernmentInfrastructure).filter(GovernmentInfrastructure.operating_status == "ACTIVE")
    
    if district and district.upper() != "ALL":
        query = query.filter(GovernmentInfrastructure.district.ilike(f"%{district}%"))
    
    if facility_type and facility_type.upper() != "ALL":
        query = query.filter(GovernmentInfrastructure.facility_type == facility_type)
        
    if ownership_type and ownership_type.upper() != "ALL":
        query = query.filter(GovernmentInfrastructure.ownership_type == ownership_type)
        
    facilities = query.all()
    
    results = []
    for f in facilities:
        supported = f.commodities_supported or []
        if commodity and commodity.upper() != "ALL":
            if not any(commodity.lower() in str(c).lower() for c in supported) and "Vegetables" not in supported:
                continue
                
        results.append({
            "id": f.id,
            "name": f.name,
            "facility_type": f.facility_type,
            "ownership_type": f.ownership_type,
            "assistance_type": f.assistance_type,
            "government_scheme": f.government_scheme,
            "ministry": f.ministry,
            "state": f.state,
            "district": f.district,
            "mandal": f.mandal,
            "village": f.village,
            "address": f.address,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "phone": f.phone,
            "email": f.email,
            "contact_person": f.contact_person,
            "capacity_mt": f.capacity_mt,
            "available_capacity_mt": f.available_capacity_mt,
            "commodities_supported": f.commodities_supported,
            "temperature_range": f.temperature_range,
            "operating_status": f.operating_status,
            "availability_status": f.availability_status,
            "source": f.source,
            "source_url": f.source_url,
            "data_confidence": f.data_confidence,
            "last_verified_at": f.last_verified_at
        })
    return results


@router.get("/quick-evaluate")
def quick_evaluate_rescue(
    product: str = Query("Tomato", description="Product name"),
    quantity: float = Query(2000.0, description="Quantity in kg"),
    lat: float = Query(16.5062, description="Latitude"),
    lon: float = Query(80.6480, description="Longitude"),
    freshness: float = Query(72.0, description="Freshness score (0-100)"),
    shelf_life_hours: float = Query(24.0, description="Remaining shelf life in hours"),
    quality_grade: str = Query("GRADE_B", description="Quality grade"),
    trigger_reason: str = Query("TRANSPORT_BREAKDOWN", description="Disruption trigger reason"),
    db: Session = Depends(get_db)
):
    """
    Evaluates multi-tier rescue options instantly for simulator / radar view without storing an incident.
    """
    options = RescueEngineService.evaluate_rescue_routes(
        db=db,
        product_name=product,
        quantity_kg=quantity,
        latitude=lat,
        longitude=lon,
        quality_grade=quality_grade,
        freshness_score=freshness,
        remaining_shelf_life_hours=shelf_life_hours,
        trigger_reason=trigger_reason
    )
    return {
        "product_name": product,
        "quantity_kg": quantity,
        "freshness_score": freshness,
        "remaining_shelf_life_hours": shelf_life_hours,
        "trigger_reason": trigger_reason,
        "options_count": len(options),
        "options": options
    }


@router.get("/events")
def list_rescue_events(db: Session = Depends(get_db)):
    """
    Lists recent active and resolved rescue disruption events with their evaluated recovery options.
    """
    events = db.query(RescueEvent).order_by(RescueEvent.created_at.desc()).limit(20).all()
    results = []
    for ev in events:
        results.append({
            "id": ev.id,
            "product_name": ev.product_name,
            "quantity_kg": ev.quantity_kg,
            "trigger_reason": ev.trigger_reason,
            "latitude": ev.latitude,
            "longitude": ev.longitude,
            "location_name": ev.location_name,
            "remaining_shelf_life_hours": ev.remaining_shelf_life_hours,
            "freshness_score": ev.freshness_score,
            "quality_grade": ev.quality_grade,
            "is_safe_for_consumption": ev.is_safe_for_consumption,
            "contamination_flag": ev.contamination_flag,
            "selected_route": ev.selected_route,
            "selected_facility_name": ev.selected_facility_name,
            "status": ev.status,
            "resolution_notes": ev.resolution_notes,
            "created_at": ev.created_at,
            "resolved_at": ev.resolved_at,
            "options": [
                {
                    "id": opt.id,
                    "tier": opt.tier,
                    "channel_type": opt.channel_type,
                    "target_entity_name": opt.target_entity_name,
                    "target_location": opt.target_location,
                    "latitude": opt.latitude,
                    "longitude": opt.longitude,
                    "phone": opt.phone,
                    "facility_id": opt.facility_id,
                    "ownership_type": opt.ownership_type,
                    "assistance_badge": opt.assistance_badge,
                    "distance_km": opt.distance_km,
                    "estimated_transit_minutes": opt.estimated_transit_minutes,
                    "estimated_recovery_value": opt.estimated_recovery_value,
                    "recovery_rate_per_kg": opt.recovery_rate_per_kg,
                    "viability_score": opt.viability_score,
                    "availability_status": opt.availability_status,
                    "is_safe": opt.is_safe,
                    "safety_verification_notes": opt.safety_verification_notes,
                    "why_recommended": opt.why_recommended,
                    "is_selected": opt.is_selected
                }
                for opt in ev.options
            ]
        })
    return results


@router.post("/trigger")
def trigger_rescue(
    data: RescueTriggerRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers Rescue Engine evaluation when a vehicle breaks down, order is cancelled,
    or produce is at risk of spoilage.
    """
    event = RescueEngineService.trigger_rescue_event(
        db=db,
        trigger_reason=data.trigger_reason,
        product_name=data.product_name,
        quantity_kg=data.quantity_kg,
        latitude=data.latitude or 16.5062,
        longitude=data.longitude or 80.6480,
        quality_grade=data.quality_grade or "GRADE_B",
        freshness_score=data.freshness_score or 72.0,
        remaining_shelf_life_hours=data.remaining_shelf_life_hours or 24.0,
        order_id=data.order_id,
        batch_id=data.batch_id,
        farmer_id=current_user.id if current_user else None
    )
    return {
        "success": True,
        "message": f"🚨 Rescue SOS activated for {data.product_name} ({data.quantity_kg} kg). Evaluated {len(event.options)} viable recovery options.",
        "rescue_event_id": event.id,
        "options_count": len(event.options),
        "options": [
            {
                "id": opt.id,
                "tier": opt.tier,
                "channel_type": opt.channel_type,
                "target_entity_name": opt.target_entity_name,
                "target_location": opt.target_location,
                "latitude": opt.latitude,
                "longitude": opt.longitude,
                "phone": opt.phone,
                "facility_id": opt.facility_id,
                "ownership_type": opt.ownership_type,
                "assistance_badge": opt.assistance_badge,
                "distance_km": opt.distance_km,
                "estimated_transit_minutes": opt.estimated_transit_minutes,
                "estimated_recovery_value": opt.estimated_recovery_value,
                "recovery_rate_per_kg": opt.recovery_rate_per_kg,
                "viability_score": opt.viability_score,
                "availability_status": opt.availability_status,
                "is_safe": opt.is_safe,
                "safety_verification_notes": opt.safety_verification_notes,
                "why_recommended": opt.why_recommended,
                "is_selected": opt.is_selected
            }
            for opt in event.options
        ]
    }


@router.post("/execute")
def execute_rescue(
    data: RescueActionExecute,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes the selected rescue action (Books capacity, triggers buyer dispatch, or assigns solar batch).
    """
    event = RescueEngineService.execute_rescue_action(
        db=db,
        rescue_event_id=data.rescue_event_id,
        selected_option_id=data.selected_option_id,
        operator_user_id=current_user.id if current_user else None,
        notes=data.resolution_notes
    )
    return {
        "success": True,
        "message": f"Produce successfully dispatched to {event.selected_facility_name or event.selected_route}.",
        "event_id": event.id,
        "status": event.status,
        "selected_route": event.selected_route,
        "selected_facility_name": event.selected_facility_name,
        "resolution_notes": event.resolution_notes
    }
