import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.v1.deps import require_auth, require_role
from app.models.models import User, Order, Payment, PaymentEvent, EscrowTransaction
from app.services.cashfree_service import CashfreePaymentService
from app.services.escrow_service import EscrowPaymentService

router = APIRouter(prefix="/payments", tags=["Cashfree Payments"])


class CreatePaymentOrderRequest(BaseModel):
    order_id: str


class RefundPaymentRequest(BaseModel):
    refund_amount: Optional[float] = None
    refund_note: Optional[str] = "Customer refund requested"


@router.post("/create-order")
def create_payment_order(
    payload: CreatePaymentOrderRequest,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    1. Authenticates user.
    2. Fetches internal Order from database.
    3. Verifies order ownership.
    4. Calculates/retrieves amount strictly from DB (never trusts frontend).
    5. Creates Cashfree Order and returns payment_session_id.
    """
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Verify authorization
    if order.buyer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to pay for this order"
        )

    # Verify amount from database
    order_amount = float(order.total_amount)
    if order_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order amount"
        )

    # Check if order is already paid
    if order.payment_status in ["HELD", "RELEASED", "PAID"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already paid and confirmed"
        )

    # Call Cashfree PG Service
    # Use order_number or generate unique gateway order id to prevent collision on retries
    gateway_order_id = f"{order.order_number}-{int(datetime.now(timezone.utc).timestamp())}"
    
    cf_response = CashfreePaymentService.create_order(
        order_id=gateway_order_id,
        amount=order_amount,
        customer_id=current_user.id,
        customer_phone=current_user.phone or "9876543210",
        customer_email=current_user.email,
        customer_name=current_user.full_name,
        order_note=f"VyavaSahayam Farm Order #{order.order_number}"
    )

    if not cf_response.get("success"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=cf_response.get("error", "Failed to initialize payment gateway order")
        )

    payment_session_id = cf_response.get("payment_session_id")
    cf_order_id = cf_response.get("cf_order_id")

    # Record / Update Payment entry
    payment = Payment(
        order_id=order.id,
        user_id=current_user.id,
        gateway="cashfree",
        gateway_order_id=gateway_order_id,
        payment_session_id=payment_session_id,
        amount=order_amount,
        currency="INR",
        status="PAYMENT_PENDING",
        raw_response=cf_response.get("raw")
    )
    db.add(payment)
    order.payment_status = "PENDING"
    db.commit()
    db.refresh(payment)

    return {
        "success": True,
        "order_id": order.id,
        "order_number": order.order_number,
        "gateway_order_id": gateway_order_id,
        "cf_order_id": cf_order_id,
        "payment_session_id": payment_session_id,
        "amount": order_amount,
        "currency": "INR",
        "gateway": "cashfree",
        "environment": settings.CASHFREE_ENVIRONMENT
    }


@router.get("/{order_id}/status")
def get_payment_status(
    order_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    Fetches the verified payment status for an order.
    Queries Cashfree and syncs PostgreSQL state.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized")

    latest_payment = (
        db.query(Payment)
        .filter(Payment.order_id == order_id)
        .order_by(Payment.created_at.desc())
        .first()
    )

    # Query gateway if active payment exists
    if latest_payment and latest_payment.gateway_order_id:
        cf_status = CashfreePaymentService.get_order_status(latest_payment.gateway_order_id)
        normalized = cf_status.get("normalized_status", latest_payment.status)
        
        # If Cashfree reports payment success, update DB
        if normalized == "PAYMENT_SUCCESS" and latest_payment.status != "PAYMENT_SUCCESS":
            latest_payment.status = "PAYMENT_SUCCESS"
            latest_payment.gateway_payment_id = cf_status.get("cf_payment_id")
            latest_payment.payment_method = cf_status.get("payment_method", "UPI")
            latest_payment.bank_reference = cf_status.get("bank_reference")
            latest_payment.auth_id = cf_status.get("auth_id")

            # Update Order
            order.payment_status = "HELD"  # Funds held in escrow
            order.status = "CONFIRMED"

            # Check or create Escrow Hold
            if not order.escrow and order.items:
                first_farmer_id = order.items[0].farmer_id or current_user.id
                EscrowPaymentService.create_escrow_hold(
                    db=db,
                    order=order,
                    farmer_id=first_farmer_id,
                    gross_amount=order.subtotal,
                    transport_fee=order.delivery_fee
                )
            db.commit()
            db.refresh(latest_payment)
            db.refresh(order)

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "order_status": order.status,
        "order_payment_status": order.payment_status,
        "total_amount": order.total_amount,
        "payment": {
            "id": latest_payment.id if latest_payment else None,
            "status": latest_payment.status if latest_payment else "PAYMENT_PENDING",
            "gateway": "cashfree",
            "gateway_order_id": latest_payment.gateway_order_id if latest_payment else None,
            "gateway_payment_id": latest_payment.gateway_payment_id if latest_payment else None,
            "payment_method": latest_payment.payment_method if latest_payment else None,
            "bank_reference": latest_payment.bank_reference if latest_payment else None,
            "amount": latest_payment.amount if latest_payment else order.total_amount,
            "created_at": latest_payment.created_at if latest_payment else order.created_at
        } if latest_payment else None
    }


@router.post("/{order_id}/verify")
def verify_order_payment(
    order_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    Triggered by frontend callback to verify payment status server-side.
    """
    return get_payment_status(order_id=order_id, current_user=current_user, db=db)


@router.post("/cashfree/webhook")
async def cashfree_webhook_handler(
    request: Request,
    db: Session = Depends(get_db),
    x_webhook_signature: Optional[str] = Header(None, alias="x-webhook-signature"),
    x_webhook_timestamp: Optional[str] = Header(None, alias="x-webhook-timestamp"),
    x_signature: Optional[str] = Header(None, alias="x-signature"),
    x_timestamp: Optional[str] = Header(None, alias="x-timestamp")
):
    """
    Receives and processes Cashfree webhooks:
    1. Reads raw payload bytes.
    2. Verifies HMAC-SHA256 signature with timestamp.
    3. Enforces idempotency via payment_events table.
    4. Synchronizes payment and order status in PostgreSQL.
    """
    raw_body = await request.body()
    effective_signature = x_webhook_signature or x_signature
    effective_timestamp = x_webhook_timestamp or x_timestamp

    # 1. Verify Webhook Signature
    is_valid = CashfreePaymentService.verify_webhook_signature(
        raw_body_bytes=raw_body,
        signature=effective_signature,
        timestamp=effective_timestamp
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Cashfree webhook signature"
        )

    # 2. Check Idempotency via SHA-256 Payload Hash
    payload_hash = hashlib.sha256(raw_body).hexdigest()
    existing_event = db.query(PaymentEvent).filter(PaymentEvent.payload_hash == payload_hash).first()
    if existing_event:
        return {"status": "success", "message": "Duplicate event ignored"}

    try:
        data = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Malformed JSON payload: {e}")

    # Extract event fields
    event_type = data.get("type", "PAYMENT_WEBHOOK")
    data_payload = data.get("data", {})
    order_data = data_payload.get("order", {})
    payment_data = data_payload.get("payment", {})

    gateway_order_id = order_data.get("order_id") or data_payload.get("order_id")
    cf_payment_id = payment_data.get("cf_payment_id") or data_payload.get("cf_payment_id")
    raw_payment_status = payment_data.get("payment_status") or data_payload.get("payment_status")
    payment_method_val = CashfreePaymentService.extract_payment_method(payment_data)

    normalized_status = CashfreePaymentService.normalize_status(raw_payment_status)

    # Record Payment Event for Audit & Idempotency
    event_record = PaymentEvent(
        gateway="cashfree",
        gateway_event_id=data.get("event_time", str(int(datetime.now(timezone.utc).timestamp()))),
        order_id=gateway_order_id,
        event_type=event_type,
        payload_hash=payload_hash,
        raw_payload=data,
        processed_at=datetime.now(timezone.utc),
        status="PROCESSED"
    )
    db.add(event_record)

    # Find matching Payment in database
    payment = None
    if gateway_order_id:
        payment = db.query(Payment).filter(Payment.gateway_order_id == gateway_order_id).first()

    if payment:
        payment.status = normalized_status
        if cf_payment_id:
            payment.gateway_payment_id = str(cf_payment_id)
        if payment_method_val:
            payment.payment_method = payment_method_val
        if payment_data.get("bank_reference"):
            payment.bank_reference = str(payment_data.get("bank_reference"))
        if payment_data.get("auth_id"):
            payment.auth_id = str(payment_data.get("auth_id"))

        # Update Order
        order = payment.order
        if order and normalized_status == "PAYMENT_SUCCESS":
            order.payment_status = "HELD"
            order.status = "CONFIRMED"

            # Create Escrow Hold if not yet created
            if not order.escrow and order.items:
                first_farmer_id = order.items[0].farmer_id or payment.user_id
                EscrowPaymentService.create_escrow_hold(
                    db=db,
                    order=order,
                    farmer_id=first_farmer_id,
                    gross_amount=order.subtotal,
                    transport_fee=order.delivery_fee
                )
        elif order and normalized_status in ["PAYMENT_FAILED", "PAYMENT_USER_DROPPED"]:
            if order.payment_status == "PENDING":
                order.payment_status = normalized_status

    db.commit()
    return {"status": "success", "event_type": event_type, "processed": True}


@router.post("/{order_id}/refund")
def initiate_order_refund(
    order_id: str,
    payload: RefundPaymentRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint to initiate full or partial refunds via Cashfree.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order_id, Payment.status == "PAYMENT_SUCCESS")
        .first()
    )
    if not payment:
        raise HTTPException(
            status_code=400,
            detail="No successful online payment found for this order to refund"
        )

    refund_amount = payload.refund_amount or payment.amount
    if refund_amount <= 0 or refund_amount > payment.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid refund amount. Must be between ₹1 and ₹{payment.amount}"
        )

    # Call Cashfree Refund API
    cf_refund = CashfreePaymentService.create_refund(
        order_id=payment.gateway_order_id or order.order_number,
        refund_amount=refund_amount,
        refund_note=payload.refund_note or "Customer Refund"
    )

    if not cf_refund.get("success"):
        raise HTTPException(
            status_code=502,
            detail=cf_refund.get("error", "Cashfree refund processing failed")
        )

    payment.refund_id = cf_refund.get("refund_id")
    payment.refund_amount = refund_amount
    payment.refund_status = cf_refund.get("status", "SUCCESS")
    if refund_amount >= payment.amount:
        payment.status = "REFUNDED"
        order.payment_status = "REFUNDED"
    
    # Update Escrow record if exists
    if order.escrow:
        order.escrow.status = "REFUNDED"
        order.escrow.admin_resolution = f"Refunded ₹{refund_amount} via Cashfree: {payload.refund_note}"

    db.commit()
    return {
        "success": True,
        "message": f"Refund of ₹{refund_amount} processed successfully via Cashfree.",
        "refund_id": payment.refund_id,
        "payment_status": payment.status
    }


@router.get("/admin/all")
def get_all_payments_admin(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Admin telemetry for all Cashfree transactions, payment methods, and settlements.
    """
    payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(100).all()
    results = []
    for p in payments:
        results.append({
            "id": p.id,
            "order_id": p.order_id,
            "order_number": p.order.order_number if p.order else "ORD",
            "customer_name": p.user.full_name if p.user else "Customer",
            "customer_phone": p.user.phone if p.user else "",
            "gateway": p.gateway,
            "gateway_order_id": p.gateway_order_id,
            "gateway_payment_id": p.gateway_payment_id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "payment_method": p.payment_method or "ONLINE",
            "bank_reference": p.bank_reference,
            "refund_id": p.refund_id,
            "refund_amount": p.refund_amount,
            "created_at": p.created_at
        })
    return results
