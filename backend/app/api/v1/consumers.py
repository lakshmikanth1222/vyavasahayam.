from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import get_db
from app.api.v1.deps import require_role, require_auth
from app.models.models import (
    User, ProductListing, Order, OrderItem, CustomerFeedback,
    EscrowTransaction, CollectionCentre
)
from app.schemas.schemas import OrderCreate
from app.services.escrow_service import EscrowPaymentService

router = APIRouter(prefix="/consumers", tags=["B2C Consumer Marketplace"])

@router.get("/products")
def get_consumer_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductListing).filter(
        ProductListing.status == "ACTIVE",
        ProductListing.available_quantity > 0,
        ProductListing.quality_grade != "REJECTED"
    )

    if search:
        query = query.filter(ProductListing.title.ilike(f"%{search}%"))

    listings = query.order_by(ProductListing.ai_freshness_score.desc()).all()
    results = []
    for l in listings:
        results.append({
            "id": l.id,
            "product_id": l.product_id,
            "title": l.title,
            "product_name": l.product.name if l.product else l.title,
            "category": l.product.category if l.product else "Fresh Vegetables",
            "quantity": l.quantity,
            "available_quantity": l.available_quantity,
            "unit": l.unit,
            "asking_price": l.asking_price,
            "discount_price": l.discount_price,
            "quality_grade": l.quality_grade,
            "harvest_date": l.harvest_date,
            "expected_shelf_life_days": l.expected_shelf_life_days,
            "remaining_shelf_life_days": l.remaining_shelf_life_days,
            "farmer_name": l.farmer.full_name if l.farmer else "Local Farmer",
            "village": l.village,
            "district": l.district,
            "image_url": l.image_url or (l.product.image_url if l.product else None),
            "ai_freshness_score": l.ai_freshness_score,
            "ai_freshness_category": l.ai_freshness_category,
            "ai_spoilage_risk_pct": l.ai_spoilage_risk_pct,
            "ai_visible_defects": l.ai_visible_defects
        })
    return results

@router.post("/cart/calculate")
def calculate_cart(items: List[dict]):
    """
    Calculates subtotal, delivery fees, and dynamic discount savings.
    Free delivery when subtotal >= FREE_DELIVERY_MIN_ORDER (e.g. ₹500)
    """
    subtotal = 0.0
    discount_savings = 0.0

    for item in items:
        qty = float(item.get("quantity", 1.0))
        price = float(item.get("asking_price", 30.0))
        disc_price = item.get("discount_price")
        
        if disc_price and float(disc_price) < price:
            effective_price = float(disc_price)
            discount_savings += (price - effective_price) * qty
        else:
            effective_price = price

        subtotal += round(effective_price * qty, 2)

    subtotal = round(subtotal, 2)
    delivery_fee = 0.0 if subtotal >= settings.FREE_DELIVERY_MIN_ORDER else settings.DEFAULT_DELIVERY_FEE
    total_amount = round(subtotal + delivery_fee, 2)

    return {
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "free_delivery_threshold": settings.FREE_DELIVERY_MIN_ORDER,
        "qualifies_for_free_delivery": subtotal >= settings.FREE_DELIVERY_MIN_ORDER,
        "amount_needed_for_free_delivery": max(0.0, round(settings.FREE_DELIVERY_MIN_ORDER - subtotal, 2)),
        "discount_savings": round(discount_savings, 2),
        "total_amount": total_amount
    }

@router.post("/orders")
def place_consumer_order(
    data: OrderCreate,
    current_user: User = Depends(require_role(["CONSUMER_B2C"])),
    db: Session = Depends(get_db)
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Check COD eligibility if payment method is COD
    if data.payment_method == "COD":
        if current_user.consumer_profile and not current_user.consumer_profile.cod_eligible:
            raise HTTPException(
                status_code=400,
                detail=f"Cash on Delivery is currently restricted for your account: {current_user.consumer_profile.cod_restriction_reason or 'Trust score below threshold'}. Please use Online Escrow."
            )

    subtotal = 0.0
    order_items_to_create = []

    for item in data.items:
        listing = db.query(ProductListing).filter(ProductListing.id == item.listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail=f"Item {item.listing_id} not found")
        if listing.available_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {listing.title}. Available: {listing.available_quantity}kg"
            )

        unit_price = listing.discount_price if listing.discount_price else listing.asking_price
        line_total = round(unit_price * item.quantity, 2)
        subtotal += line_total

        listing.available_quantity -= item.quantity
        if listing.available_quantity <= 0:
            listing.status = "SOLD"
        else:
            listing.status = "PARTIALLY_SOLD"

        order_items_to_create.append({
            "listing": listing,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "total_price": line_total
        })

    subtotal = round(subtotal, 2)
    delivery_fee = 0.0 if subtotal >= settings.FREE_DELIVERY_MIN_ORDER else settings.DEFAULT_DELIVERY_FEE
    total_amount = round(subtotal + delivery_fee, 2)

    # Route through nearest Rythu Bazar hub
    rythu_hub = db.query(CollectionCentre).filter(CollectionCentre.centre_type == "RYTHU_BAZAR").first()

    order = Order(
        order_number=f"ORD-B2C-{datetime.now().year}-{int(datetime.now().timestamp()) % 100000}",
        order_type="B2C",
        buyer_id=current_user.id,
        collection_centre_id=rythu_hub.id if rythu_hub else None,
        status="CONFIRMED",
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        payment_method=data.payment_method,
        payment_status="HELD" if data.payment_method == "ONLINE_ESCROW" else "AUTHORIZED",
        delivery_address=data.delivery_address,
        delivery_slot=data.delivery_slot or "Today Evening 5:00 PM - 8:00 PM",
        buyer_notes=data.buyer_notes
    )
    db.add(order)
    db.flush()

    first_farmer_id = order_items_to_create[0]["listing"].farmer_id
    for it in order_items_to_create:
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

    # Escrow Hold
    EscrowPaymentService.create_escrow_hold(
        db=db,
        order=order,
        farmer_id=first_farmer_id,
        gross_amount=subtotal,
        transport_fee=delivery_fee
    )

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "Order placed successfully! Routed via Rythu Bazar local fulfillment center.",
        "order_id": order.id,
        "order_number": order.order_number,
        "total_amount": total_amount,
        "delivery_slot": order.delivery_slot,
        "fulfillment_hub": rythu_hub.name if rythu_hub else "Local Rythu Bazar"
    }

@router.get("/orders")
def get_consumer_orders(
    current_user: User = Depends(require_role(["CONSUMER_B2C"])),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
    results = []
    for o in orders:
        results.append({
            "id": o.id,
            "order_number": o.order_number,
            "status": o.status,
            "subtotal": o.subtotal,
            "delivery_fee": o.delivery_fee,
            "total_amount": o.total_amount,
            "payment_method": o.payment_method,
            "payment_status": o.payment_status,
            "delivery_address": o.delivery_address,
            "delivery_slot": o.delivery_slot,
            "created_at": o.created_at,
            "items": [
                {
                    "id": it.id,
                    "product_name": it.product_name,
                    "quantity": it.quantity,
                    "unit": it.unit,
                    "unit_price": it.unit_price,
                    "total_price": it.total_price,
                    "grade": it.grade
                }
                for it in o.items
            ]
        })
    return results

@router.post("/orders/{order_id}/confirm-delivery")
def confirm_delivery_and_release(
    order_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Consumer confirms delivery quality -> releases held escrow directly to farmer bank ledger"""
    escrow = EscrowPaymentService.confirm_and_release_payout(
        db=db,
        order_id=order_id,
        confirmed_by_user_id=current_user.id
    )
    return {
        "success": True,
        "message": f"Delivery confirmed! Escrow payout of ₹{escrow.farmer_net_payout} released to farmer.",
        "escrow_status": escrow.status,
        "release_date": escrow.release_date
    }

@router.post("/orders/{order_id}/feedback")
def submit_order_feedback(
    order_id: str,
    freshness_rating: int,
    quality_rating: int,
    delivery_rating: int,
    comments: Optional[str] = None,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    fb = CustomerFeedback(
        order_id=order_id,
        user_id=current_user.id,
        freshness_rating=freshness_rating,
        quality_rating=quality_rating,
        delivery_rating=delivery_rating,
        overall_rating=round((freshness_rating + quality_rating + delivery_rating) / 3),
        comments=comments or "Fresh directly from farm!"
    )
    db.add(fb)
    db.commit()
    return {"success": True, "message": "Thank you for supporting our local farming community!"}
