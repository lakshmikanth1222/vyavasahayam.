from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Order, EscrowTransaction, User, Notification

class EscrowPaymentService:
    """
    Escrow Payment & Settlement State Machine.
    Protects both buyers and farmers: holds buyer funds securely until produce delivery
    and quality confirmation, then releases net payout to farmer.
    """

    @classmethod
    def create_escrow_hold(
        cls,
        db: Session,
        order: Order,
        farmer_id: str,
        gross_amount: float,
        transport_fee: float = 0.0
    ) -> EscrowTransaction:
        # Platform fee (2%)
        platform_fee = round(gross_amount * (settings.PLATFORM_COMMISSION_PERCENTAGE / 100.0), 2)
        
        # Insurance contribution (3% if enabled in settings and farmer opt-in)
        insurance_deduction = 0.0
        if settings.FARMER_INSURANCE_ENABLED:
            insurance_deduction = round(gross_amount * (settings.FARMER_INSURANCE_PERCENTAGE / 100.0), 2)
        
        net_payout = round(gross_amount - transport_fee - platform_fee - insurance_deduction, 2)

        escrow = EscrowTransaction(
            order_id=order.id,
            amount=gross_amount,
            farmer_id=farmer_id,
            farmer_gross_amount=gross_amount,
            transport_charge=transport_fee,
            platform_fee=platform_fee,
            insurance_deduction=insurance_deduction,
            farmer_net_payout=net_payout,
            status="HELD"
        )
        db.add(escrow)
        order.payment_status = "HELD"
        db.commit()
        db.refresh(escrow)
        return escrow

    @classmethod
    def confirm_and_release_payout(
        cls,
        db: Session,
        order_id: str,
        confirmed_by_user_id: Optional[str] = None
    ) -> EscrowTransaction:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")

        escrow = db.query(EscrowTransaction).filter(EscrowTransaction.order_id == order_id).first()
        if not escrow:
            raise ValueError("Escrow transaction not found")

        if escrow.status == "RELEASED":
            return escrow

        escrow.status = "RELEASED"
        escrow.release_date = datetime.now(timezone.utc)
        order.payment_status = "RELEASED"
        order.status = "COMPLETED"

        # Create notification for farmer
        notif = Notification(
            user_id=escrow.farmer_id,
            title="Payment Released! 💰",
            message=f"₹{escrow.farmer_net_payout} net payout for Order #{order.order_number} has been transferred to your bank account.",
            notification_type="SUCCESS",
            channel="IN_APP"
        )
        db.add(notif)
        db.commit()
        db.refresh(escrow)
        return escrow

    @classmethod
    def raise_dispute(
        cls,
        db: Session,
        order_id: str,
        reason: str
    ) -> EscrowTransaction:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")

        escrow = db.query(EscrowTransaction).filter(EscrowTransaction.order_id == order_id).first()
        if not escrow:
            raise ValueError("Escrow transaction not found")

        escrow.status = "DISPUTED"
        escrow.dispute_reason = reason
        order.payment_status = "DISPUTED"
        order.status = "DISPUTED"

        db.commit()
        db.refresh(escrow)
        return escrow

    @classmethod
    def resolve_dispute(
        cls,
        db: Session,
        order_id: str,
        resolution_type: str, # RELEASE_FULL, PARTIAL_REFUND, FULL_REFUND
        refund_amount: float = 0.0,
        admin_notes: str = ""
    ) -> EscrowTransaction:
        escrow = db.query(EscrowTransaction).filter(EscrowTransaction.order_id == order_id).first()
        order = db.query(Order).filter(Order.id == order_id).first()
        if not escrow or not order:
            raise ValueError("Escrow or Order not found")

        if resolution_type == "RELEASE_FULL":
            escrow.status = "RELEASED"
            escrow.admin_resolution = f"Admin approved full payout. {admin_notes}"
            escrow.release_date = datetime.now(timezone.utc)
            order.payment_status = "RELEASED"
        elif resolution_type == "FULL_REFUND":
            escrow.status = "REFUNDED"
            escrow.admin_resolution = f"Full refund of ₹{order.total_amount} issued to buyer. {admin_notes}"
            order.payment_status = "REFUNDED"
        elif resolution_type == "PARTIAL_REFUND":
            escrow.status = "RELEASED"
            adjusted_payout = max(0.0, escrow.farmer_net_payout - refund_amount)
            escrow.farmer_net_payout = adjusted_payout
            escrow.admin_resolution = f"Partial refund of ₹{refund_amount} to buyer, adjusted payout ₹{adjusted_payout} released to farmer. {admin_notes}"
            order.payment_status = "RELEASED"

        db.commit()
        db.refresh(escrow)
        return escrow
