from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.deps import require_auth, require_role
from app.models.models import EscrowTransaction, Order, User
from app.services.escrow_service import EscrowPaymentService

router = APIRouter(prefix="/escrow", tags=["Escrow Payments"])

@router.get("/transactions")
def get_escrow_transactions(db: Session = Depends(get_db)):
    txs = db.query(EscrowTransaction).order_by(EscrowTransaction.created_at.desc()).all()
    results = []
    for t in txs:
        results.append({
            "id": t.id,
            "order_id": t.order_id,
            "order_number": t.order.order_number if t.order else "ORD",
            "farmer_name": t.farmer.full_name if t.farmer else "Farmer",
            "amount": t.amount,
            "farmer_gross_amount": t.farmer_gross_amount,
            "transport_charge": t.transport_charge,
            "platform_fee": t.platform_fee,
            "insurance_deduction": t.insurance_deduction,
            "farmer_net_payout": t.farmer_net_payout,
            "status": t.status,
            "release_date": t.release_date,
            "dispute_reason": t.dispute_reason,
            "admin_resolution": t.admin_resolution,
            "created_at": t.created_at
        })
    return results

@router.post("/dispute")
def raise_order_dispute(
    order_id: str,
    reason: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    escrow = EscrowPaymentService.raise_dispute(db=db, order_id=order_id, reason=reason)
    return {"success": True, "message": "Dispute lodged. Escrow funds held pending Admin investigation.", "status": escrow.status}

@router.post("/resolve")
def resolve_escrow_dispute(
    order_id: str,
    resolution_type: str, # RELEASE_FULL, PARTIAL_REFUND, FULL_REFUND
    refund_amount: float = 0.0,
    admin_notes: str = "",
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    escrow = EscrowPaymentService.resolve_dispute(
        db=db,
        order_id=order_id,
        resolution_type=resolution_type,
        refund_amount=refund_amount,
        admin_notes=admin_notes
    )
    return {"success": True, "message": f"Dispute resolved via {resolution_type}.", "status": escrow.status}
