from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.v1.deps import require_auth
from app.models.models import (
    ProduceBatch, QualityCheck, CollectionCentre, FreshnessDigitalTwin,
    ProductListing, User
)
from app.schemas.schemas import QualityCheckCreate, ProduceBatchOut

router = APIRouter(prefix="/quality", tags=["Quality Grading & Traceability"])

@router.get("/batches")
def list_produce_batches(
    stage: Optional[str] = None,
    grade: Optional[str] = None,
    freshness: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProduceBatch)
    if stage:
        query = query.filter(ProduceBatch.current_stage == stage.upper())
    if grade:
        query = query.filter(ProduceBatch.current_grade == grade.upper())
    if freshness:
        query = query.filter(ProduceBatch.freshness_category == freshness.upper())

    batches = query.order_by(ProduceBatch.created_at.desc()).all()
    results = []
    for b in batches:
        results.append({
            "id": b.id,
            "batch_code": b.batch_code,
            "product_name": b.product.name if b.product else "Fresh Produce",
            "farmer_name": b.farmer.full_name if b.farmer else "Local Farmer",
            "quantity_kg": b.quantity_kg,
            "current_stage": b.current_stage,
            "current_grade": b.current_grade,
            "freshness_score": b.freshness_score,
            "freshness_category": b.freshness_category,
            "remaining_shelf_life_days": b.remaining_shelf_life_days,
            "spoilage_risk_pct": b.spoilage_risk_pct,
            "current_location": b.current_location,
            "rescue_status": b.rescue_status,
            "iot_temp": b.iot_temp,
            "iot_humidity": b.iot_humidity,
            "created_at": b.created_at
        })
    return results

@router.get("/batches/{batch_id}/traceability")
def get_batch_traceability(batch_id: str, db: Session = Depends(get_db)):
    batch = db.query(ProduceBatch).filter(ProduceBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Produce batch not found")

    checks = db.query(QualityCheck).filter(QualityCheck.batch_id == batch.id).order_by(QualityCheck.created_at.asc()).all()

    # Build chronological timeline
    timeline = [
        {
            "step": "Harvested at Farm",
            "completed": True,
            "date": batch.created_at.strftime("%d %b %Y, %I:%M %p"),
            "location": f"Farm Gate ({batch.farmer.farmer_profile.village if batch.farmer and batch.farmer.farmer_profile else 'Krishna'})",
            "inspector": batch.farmer.full_name if batch.farmer else "Farmer Self-Declaration",
            "details": f"Initial weight: {batch.quantity_kg} kg. Clean harvest under morning conditions."
        }
    ]

    for qc in checks:
        stage_names = {
            "FARMER_PICKUP": "Field Quality Screening & Sensor Check",
            "COLLECTION_CENTRE": "Received at Rythu Bazar Hub & Weighed",
            "WAREHOUSE_RECEIVING": "Hub Sorting & Grading Inspection",
            "FINAL_PACKING": "Pre-Dispatch Quality & Cold Chain Packing"
        }
        timeline.append({
            "step": stage_names.get(qc.stage, qc.stage),
            "completed": True,
            "date": qc.created_at.strftime("%d %b %Y, %I:%M %p"),
            "location": "Rythu Bazar Gannavaram Local Hub",
            "inspector": qc.inspector_name,
            "details": f"Verified Grade: {qc.grade} | Freshness Score: {qc.freshness_score}/100 | Weight: {qc.weight_kg} kg. {qc.notes or ''}"
        })

    if batch.current_stage in ["IN_TRANSIT", "DELIVERED"]:
        timeline.append({
            "step": "Dispatched via Temperature-Monitored Transit",
            "completed": True,
            "date": datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "location": "Transit Corridor (Gannavaram -> Vijayawada City)",
            "inspector": "IoT Telematics Link",
            "details": f"Cold transit at {batch.iot_temp}°C / {batch.iot_humidity}% RH."
        })

    if batch.current_stage == "DELIVERED":
        timeline.append({
            "step": "Delivered & Quality Verified by Consumer",
            "completed": True,
            "date": datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "location": "Customer Destination",
            "inspector": "Customer Final Acceptance",
            "details": "Customer confirmed fresh farm condition. Escrow released."
        })

    return {
        "batch_code": batch.batch_code,
        "product_name": batch.product.name if batch.product else "Fresh Produce",
        "farmer_name": batch.farmer.full_name if batch.farmer else "Local Farmer",
        "village": batch.farmer.farmer_profile.village if batch.farmer and batch.farmer.farmer_profile else "Krishna",
        "current_grade": batch.current_grade,
        "freshness_score": batch.freshness_score,
        "freshness_category": batch.freshness_category,
        "remaining_shelf_life_days": batch.remaining_shelf_life_days,
        "current_stage": batch.current_stage,
        "timeline": timeline
    }

@router.post("/inspect")
def perform_quality_inspection(
    data: QualityCheckCreate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    batch = db.query(ProduceBatch).filter(ProduceBatch.id == data.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    qc = QualityCheck(
        batch_id=batch.id,
        stage=data.stage,
        grade=data.grade,
        weight_kg=data.weight_kg,
        freshness_score=data.freshness_score,
        inspector_name=data.inspector_name or current_user.full_name,
        inspector_id=current_user.id,
        rejection_reason=data.rejection_reason,
        notes=data.notes,
        ai_verified=True
    )
    db.add(qc)

    # Update Batch state
    batch.current_grade = data.grade
    batch.quantity_kg = data.weight_kg
    batch.freshness_score = data.freshness_score
    if data.grade == "REJECTED":
        batch.freshness_category = "NOT_FOR_SALE"
        batch.current_stage = "DISPOSED"
    elif data.stage == "COLLECTION_CENTRE":
        batch.current_stage = "RECEIVED_CC"
    elif data.stage == "WAREHOUSE_RECEIVING":
        batch.current_stage = "GRADED"
    elif data.stage == "FINAL_PACKING":
        batch.current_stage = "PACKED"

    db.commit()
    db.refresh(qc)

    return {
        "success": True,
        "message": f"Quality inspection recorded. Grade: {data.grade}, Freshness: {data.freshness_score}/100",
        "quality_check_id": qc.id,
        "new_batch_stage": batch.current_stage
    }

@router.get("/collection-centres")
def get_collection_centres(db: Session = Depends(get_db)):
    centres = db.query(CollectionCentre).filter(CollectionCentre.is_active == True).all()
    return centres
