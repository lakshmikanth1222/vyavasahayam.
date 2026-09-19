from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import require_role, require_auth
from app.models.models import User, Order, ProductListing, RescueEvent, SolarDryingBatch
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])

@router.get("/analytics")
def get_analytics(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_admin_kpis(db=db)

@router.get("/users")
def list_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    users = query.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "profile_info": (
                u.farmer_profile.village if u.farmer_profile else (
                    u.buyer_profile.organization_name if u.buyer_profile else (
                        u.consumer_profile.district if u.consumer_profile else None
                    )
                )
            )
        }
        for u in users
    ]

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"success": True, "user_id": user.id, "is_active": user.is_active}

@router.get("/orders")
def get_all_orders(
    status: Optional[str] = None,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status.upper())
    orders = query.order_by(Order.created_at.desc()).all()
    results = []
    for o in orders:
        results.append({
            "id": o.id,
            "order_number": o.order_number,
            "order_type": o.order_type,
            "buyer_name": o.buyer.full_name if o.buyer else "Customer",
            "status": o.status,
            "total_amount": o.total_amount,
            "payment_method": o.payment_method,
            "payment_status": o.payment_status,
            "delivery_address": o.delivery_address,
            "delivery_slot": o.delivery_slot,
            "created_at": o.created_at,
            "items_count": len(o.items)
        })
    return results

@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: str,
    new_status: str, # CONFIRMED, PICKING, PACKED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = new_status.upper()
    if new_status.upper() == "DELIVERED":
        order.payment_status = "DELIVERED"
    db.commit()
    return {"success": True, "order_id": order.id, "status": order.status}

@router.get("/settings")
def get_system_settings(current_user: User = Depends(require_role(["ADMIN"]))):
    return {
        "free_delivery_min_order": settings.FREE_DELIVERY_MIN_ORDER,
        "default_delivery_fee": settings.DEFAULT_DELIVERY_FEE,
        "farmer_insurance_enabled": settings.FARMER_INSURANCE_ENABLED,
        "farmer_insurance_percentage": settings.FARMER_INSURANCE_PERCENTAGE,
        "platform_commission_percentage": settings.PLATFORM_COMMISSION_PERCENTAGE,
        "discount_window_tier1_percent": settings.DISCOUNT_WINDOW_TIER1_PERCENT,
        "discount_window_tier2_percent": settings.DISCOUNT_WINDOW_TIER2_PERCENT,
        "cod_min_trust_score": settings.COD_MIN_TRUST_SCORE,
        "mock_ai": settings.MOCK_AI,
        "mock_payment": settings.MOCK_PAYMENT,
        "mock_voice": settings.MOCK_VOICE
    }

@router.post("/settings")
def update_system_settings(
    free_delivery_min_order: Optional[float] = None,
    farmer_insurance_enabled: Optional[bool] = None,
    farmer_insurance_percentage: Optional[float] = None,
    discount_tier1: Optional[float] = None,
    discount_tier2: Optional[float] = None,
    current_user: User = Depends(require_role(["ADMIN"]))
):
    if free_delivery_min_order is not None:
        settings.FREE_DELIVERY_MIN_ORDER = free_delivery_min_order
    if farmer_insurance_enabled is not None:
        settings.FARMER_INSURANCE_ENABLED = farmer_insurance_enabled
    if farmer_insurance_percentage is not None:
        settings.FARMER_INSURANCE_PERCENTAGE = farmer_insurance_percentage
    if discount_tier1 is not None:
        settings.DISCOUNT_WINDOW_TIER1_PERCENT = discount_tier1
    if discount_tier2 is not None:
        settings.DISCOUNT_WINDOW_TIER2_PERCENT = discount_tier2

    return {"success": True, "message": "System configuration updated successfully."}
