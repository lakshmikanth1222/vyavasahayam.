from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.deps import require_auth
from app.models.models import RescueEvent, RescueOption, User
from app.schemas.schemas import RescueTriggerRequest, RescueActionExecute
from app.services.rescue_engine import RescueEngineService

router = APIRouter(prefix="/rescue", tags=["Post-Harvest Rescue Engine"])

@router.get("/events")
def list_rescue_events(db: Session = Depends(get_db)):
    events = db.query(RescueEvent).order_by(RescueEvent.created_at.desc()).all()
    results = []
    for ev in events:
        results.append({
            "id": ev.id,
            "product_name": ev.product_name,
            "quantity_kg": ev.quantity_kg,
            "trigger_reason": ev.trigger_reason,
            "remaining_shelf_life_hours": ev.remaining_shelf_life_hours,
            "freshness_score": ev.freshness_score,
            "quality_grade": ev.quality_grade,
            "is_safe_for_consumption": ev.is_safe_for_consumption,
            "contamination_flag": ev.contamination_flag,
            "selected_route": ev.selected_route,
            "status": ev.status,
            "resolution_notes": ev.resolution_notes,
            "created_at": ev.created_at,
            "options": [
                {
                    "id": opt.id,
                    "channel_type": opt.channel_type,
                    "target_entity_name": opt.target_entity_name,
                    "target_location": opt.target_location,
                    "distance_km": opt.distance_km,
                    "estimated_recovery_value": opt.estimated_recovery_value,
                    "viability_score": opt.viability_score,
                    "is_safe": opt.is_safe,
                    "safety_verification_notes": opt.safety_verification_notes,
                    "is_selected": opt.is_selected
                }
                for opt in ev.options
            ]
        })
    return results

@router.post("/trigger")
def trigger_rescue(
    data: RescueTriggerRequest,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    Triggers Rescue Engine evaluation when an order is cancelled, transit is delayed,
    or produce freshness approaches shelf-life threshold.
    """
    event = RescueEngineService.trigger_rescue_event(
        db=db,
        trigger_reason=data.trigger_reason,
        product_name="Tomatoes (Grade B Rescued)",
        quantity_kg=500.0,
        quality_grade="GRADE_B",
        freshness_score=72.0,
        remaining_shelf_life_hours=24.0,
        order_id=data.order_id,
        batch_id=data.batch_id
    )
    return {
        "success": True,
        "message": f"Rescue Engine activated for trigger '{data.trigger_reason}'. Evaluated {len(event.options)} viable recovery channels.",
        "rescue_event_id": event.id,
        "options_count": len(event.options)
    }

@router.post("/execute")
def execute_rescue(
    data: RescueActionExecute,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    event = RescueEngineService.execute_rescue_action(
        db=db,
        rescue_event_id=data.rescue_event_id,
        selected_option_id=data.selected_option_id,
        operator_user_id=current_user.id,
        notes=data.resolution_notes
    )
    return {
        "success": True,
        "message": f"Produce successfully routed to {event.selected_route}.",
        "event_id": event.id,
        "status": event.status,
        "selected_route": event.selected_route,
        "resolution_notes": event.resolution_notes
    }
