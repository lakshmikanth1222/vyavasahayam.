"""
Pre-Orders API Router — VyavaSahayam Consumer Pre-Order System
==============================================================
Aggregates hyper-local consumer pre-orders into collective demand signals
that farmers and FPOs can commit to fulfilling in advance.
"""

from typing import Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.api.v1.deps import require_auth, get_current_user
from app.models.models import User, PreOrder, Product

router = APIRouter(prefix="/preorders", tags=["Pre-Orders"])


class CreatePreOrderRequest(BaseModel):
    product_name: str
    quantity_kg: float = Field(..., gt=0)
    requested_delivery_date: Optional[datetime] = None
    location: str
    target_price: Optional[float] = None
    notes: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
def create_preorder(
    payload: CreatePreOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Consumer creates a future harvest pre-order."""
    prod = db.query(Product).filter(Product.name.ilike(f"%{payload.product_name}%")).first()

    req_date = payload.requested_delivery_date
    if not req_date:
        req_date = datetime.now(timezone.utc) + timedelta(days=7)

    preorder = PreOrder(
        consumer_id=current_user.id,
        product_name=payload.product_name.strip().title(),
        quantity_kg=payload.quantity_kg,
        requested_date=req_date,
        location=payload.location.strip().title(),
        max_price_per_kg=payload.target_price,
        notes=payload.notes,
        status="PENDING",
    )
    db.add(preorder)
    db.commit()
    db.refresh(preorder)

    return {
        "status": "success",
        "message": f"Pre-order for {payload.quantity_kg:.1f} kg {payload.product_name} registered successfully!",
        "preorder": {
            "id": preorder.id,
            "product_name": preorder.product_name,
            "quantity_kg": preorder.quantity_kg,
            "location": preorder.location,
            "requested_delivery_date": preorder.requested_date.isoformat() if preorder.requested_date else None,
            "status": preorder.status,
            "created_at": preorder.created_at.isoformat() if preorder.created_at else None,
        }
    }


@router.get("")
def list_user_preorders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Lists pre-orders placed by the logged-in user (or all if admin)."""
    query = db.query(PreOrder)
    if current_user.role != "ADMIN":
        query = query.filter(PreOrder.consumer_id == current_user.id)

    preorders = query.order_by(desc(PreOrder.created_at)).all()
    results = []
    for p in preorders:
        results.append({
            "id": p.id,
            "product_name": p.product_name,
            "quantity_kg": p.quantity_kg,
            "location": p.location,
            "requested_delivery_date": p.requested_date.isoformat() if p.requested_date else None,
            "target_price": p.max_price_per_kg,
            "status": p.status,
            "notes": p.notes,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    return {
        "status": "success",
        "total": len(results),
        "preorders": results,
    }


@router.get("/aggregated")
def get_aggregated_preorders(db: Session = Depends(get_db)):
    """Groups pending pre-orders by crop and district into collective demand clusters."""
    aggregated = (
        db.query(
            PreOrder.product_name,
            PreOrder.location,
            func.sum(PreOrder.quantity_kg).label("total_demand_kg"),
            func.count(PreOrder.id).label("consumer_count"),
            func.min(PreOrder.requested_date).label("earliest_date"),
        )
        .filter(PreOrder.status.in_(["PENDING", "MATCHING"]))
        .group_by(PreOrder.product_name, PreOrder.location)
        .order_by(desc("total_demand_kg"))
        .all()
    )

    results = []
    for row in aggregated:
        results.append({
            "product_name": row.product_name,
            "location": row.location,
            "total_demand_kg": round(float(row.total_demand_kg), 1),
            "consumer_count": row.consumer_count,
            "earliest_date": row.earliest_date.strftime("%d %b %Y") if row.earliest_date else None,
            "status": "COLLECTIVE_SIGNAL",
        })

    return {
        "status": "success",
        "total_clusters": len(results),
        "aggregated_demand": results,
    }
