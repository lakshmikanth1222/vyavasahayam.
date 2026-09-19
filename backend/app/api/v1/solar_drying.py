from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.v1.deps import require_auth
from app.models.models import SolarDryingCentre, SolarDryingBatch, DriedProduct, User
from app.schemas.schemas import SolarBatchCreate

router = APIRouter(prefix="/solar-drying", tags=["Solar Drying Value-Addition Module"])

@router.get("/centres")
def get_solar_centres(db: Session = Depends(get_db)):
    centres = db.query(SolarDryingCentre).all()
    return centres

@router.get("/batches")
def get_solar_batches(db: Session = Depends(get_db)):
    batches = db.query(SolarDryingBatch).order_by(SolarDryingBatch.created_at.desc()).all()
    results = []
    for b in batches:
        results.append({
            "id": b.id,
            "batch_code": b.batch_code,
            "product_name": b.product_name,
            "input_quantity_kg": b.input_quantity_kg,
            "input_quality_grade": b.input_quality_grade,
            "input_freshness_score": b.input_freshness_score,
            "drying_centre_name": b.drying_centre.name if b.drying_centre else "Gannavaram Agro Solar-Drying Facility",
            "start_time": b.start_time,
            "estimated_yield_kg": b.estimated_yield_kg,
            "final_output_quantity_kg": b.final_output_quantity_kg,
            "status": b.status,
            "moisture_level_pct": b.moisture_level_pct,
            "notes": b.notes,
            "created_at": b.created_at
        })
    return results

@router.post("/batches")
def create_solar_batch(
    data: SolarBatchCreate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    centre = db.query(SolarDryingCentre).filter(SolarDryingCentre.id == data.drying_centre_id).first()
    if not centre:
        centre = db.query(SolarDryingCentre).first()

    # Yield estimation based on moisture evaporation (typically 10:1 ratio)
    yield_ratio = 0.10 if "Tomato" in data.product_name else 0.15
    est_yield = round(data.input_quantity_kg * yield_ratio, 2)

    batch = SolarDryingBatch(
        batch_code=f"SDB-2026-{data.product_name[:3].upper()}-{int(datetime.now().timestamp()) % 10000}",
        source_batch_id=data.source_batch_id,
        rescue_event_id=data.rescue_event_id,
        product_name=data.product_name,
        input_quantity_kg=data.input_quantity_kg,
        input_quality_grade=data.input_quality_grade,
        input_freshness_score=75.0,
        drying_centre_id=centre.id if centre else "default-centre",
        estimated_yield_kg=est_yield,
        status="PREPARING",
        notes=data.notes or "Pre-washed and sliced for solar drying tunnel."
    )
    db.add(batch)
    db.flush()

    # Create associated value-added product inventory entry
    dp = DriedProduct(
        solar_batch_id=batch.id,
        product_name=f"Premium Sun-Dried {data.product_name} (Vacuum Sealed)",
        packaging_type="250g Nitrogen Flush Sealed Pouch",
        quantity_kg=est_yield,
        unit_cost=160.0,
        sale_price=320.0,
        status="IN_INVENTORY"
    )
    db.add(dp)
    db.commit()
    db.refresh(batch)

    return {
        "success": True,
        "message": f"Solar drying batch {batch.batch_code} initiated. Estimated dried yield: {est_yield} kg.",
        "batch_id": batch.id,
        "batch_code": batch.batch_code,
        "estimated_yield_kg": est_yield
    }

@router.patch("/batches/{batch_id}/status")
def update_solar_batch_status(
    batch_id: str,
    new_status: str, # APPROVED, PREPARING, DRYING, QUALITY_CHECK, COMPLETED, REJECTED
    final_output_kg: Optional[float] = None,
    moisture_pct: Optional[float] = None,
    db: Session = Depends(get_db)
):
    batch = db.query(SolarDryingBatch).filter(SolarDryingBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Solar drying batch not found")

    batch.status = new_status.upper()
    if final_output_kg is not None:
        batch.final_output_quantity_kg = final_output_kg
    if moisture_pct is not None:
        batch.moisture_level_pct = moisture_pct

    if new_status.upper() == "COMPLETED":
        batch.actual_completion_time = datetime.now(timezone.utc)
        # Update dried products inventory
        for dp in batch.dried_products:
            dp.quantity_kg = batch.final_output_quantity_kg or batch.estimated_yield_kg
            dp.status = "IN_INVENTORY"

    db.commit()
    db.refresh(batch)
    return {"success": True, "batch_code": batch.batch_code, "status": batch.status}

@router.get("/inventory")
def get_dried_product_inventory(db: Session = Depends(get_db)):
    products = db.query(DriedProduct).all()
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "product_name": p.product_name,
            "packaging_type": p.packaging_type,
            "quantity_kg": p.quantity_kg,
            "unit_cost": p.unit_cost,
            "sale_price": p.sale_price,
            "shelf_life_months": p.shelf_life_months,
            "status": p.status,
            "created_at": p.created_at
        })
    return results
