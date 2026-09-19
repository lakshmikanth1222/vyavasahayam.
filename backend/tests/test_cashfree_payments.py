import json
import time
import hmac
import hashlib
import base64
import pytest
from fastapi.testclient import TestClient

from main import app
from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.models.models import User, Order, ProductListing, Payment, PaymentEvent, EscrowTransaction, Product
from app.services.cashfree_service import CashfreePaymentService
from app.seed.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_data():
    Base.metadata.create_all(bind=engine)
    seed_database()

def get_auth_token(email: str, password: str = "password123") -> str:
    res = client.post("/api/v1/auth/login", json={"email_or_phone": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def get_or_create_test_listing():
    db = SessionLocal()
    try:
        listing = db.query(ProductListing).filter(ProductListing.status == "ACTIVE", ProductListing.available_quantity > 10).first()
        if not listing:
            farmer = db.query(User).filter(User.role == "FARMER").first()
            product = db.query(Product).first()
            listing = ProductListing(
                farmer_id=farmer.id if farmer else "test_farmer",
                product_id=product.id if product else None,
                title="Test Farm Produce",
                quantity=1000.0,
                available_quantity=1000.0,
                unit="kg",
                asking_price=25.0,
                quality_grade="GRADE_A",
                location_address="Plot 14, Gannavaram Rural Road",
                village="Gannavaram",
                district="Krishna",
                state="Andhra Pradesh",
                status="ACTIVE"
            )
            db.add(listing)
            db.commit()
            db.refresh(listing)
        return listing.id, listing.asking_price
    finally:
        db.close()



def test_status_normalization():
    """Validates mapping of Cashfree raw statuses to internal enum states."""
    assert CashfreePaymentService.normalize_status("PAID") == "PAYMENT_SUCCESS"
    assert CashfreePaymentService.normalize_status("SUCCESS") == "PAYMENT_SUCCESS"
    assert CashfreePaymentService.normalize_status("FAILED") == "PAYMENT_FAILED"
    assert CashfreePaymentService.normalize_status("USER_DROPPED") == "PAYMENT_USER_DROPPED"
    assert CashfreePaymentService.normalize_status("ACTIVE") == "PAYMENT_PENDING"
    assert CashfreePaymentService.normalize_status("REFUNDED") == "REFUNDED"


def test_create_payment_order_unauthorized():
    """Unauthenticated payment initiation must return 401."""
    res = client.post("/api/v1/payments/create-order", json={"order_id": "dummy_id"})
    assert res.status_code == 401


def test_create_payment_order_not_found():
    """Attempting to pay for a non-existent order must return 404."""
    token = get_auth_token("consumer@vyavasahayam.org")
    res = client.post(
        "/api/v1/payments/create-order",
        headers={"Authorization": f"Bearer {token}"},
        json={"order_id": "non_existent_uuid"}
    )
    assert res.status_code == 404


def test_full_cashfree_order_lifecycle():
    """
    Tests end-to-end order placement, Cashfree session creation,
    payment status verification, and Escrow synchronization.
    """
    token = get_auth_token("consumer@vyavasahayam.org")
    headers = {"Authorization": f"Bearer {token}"}
    listing_id, _ = get_or_create_test_listing()

    # Place B2C Online Escrow Order
    order_payload = {
        "items": [{"listing_id": listing_id, "quantity": 2.0}],
        "delivery_address": "Flat 101, Green Meadows, Vijayawada",
        "delivery_slot": "Today Evening 5:00 PM - 8:00 PM",
        "payment_method": "ONLINE_ESCROW",
        "buyer_notes": "Handle with care"
    }

    order_res = client.post("/api/v1/consumers/orders", headers=headers, json=order_payload)
    assert order_res.status_code == 200
    order_data = order_res.json()
    order_id = order_data["order_id"]
    total_amount = order_data["total_amount"]
    assert order_data["payment_status"] == "PENDING"

    # Create Cashfree Payment Order
    pay_res = client.post(
        "/api/v1/payments/create-order",
        headers=headers,
        json={"order_id": order_id}
    )
    assert pay_res.status_code == 200
    pay_data = pay_res.json()
    assert pay_data["success"] is True
    assert "payment_session_id" in pay_data
    assert pay_data["amount"] == total_amount
    assert pay_data["gateway"] == "cashfree"

    # Verify Payment Status Endpoint (Post-Redirect Verification)
    status_res = client.post(
        f"/api/v1/payments/{order_id}/verify",
        headers=headers
    )
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["order_id"] == order_id
    assert status_data["payment"]["status"] in ["PAYMENT_SUCCESS", "PAYMENT_PENDING"]


def test_webhook_signature_and_idempotency():
    """
    Tests Cashfree webhook HMAC-SHA256 signature verification and payload deduplication.
    """
    token = get_auth_token("consumer@vyavasahayam.org")
    headers = {"Authorization": f"Bearer {token}"}
    listing_id, _ = get_or_create_test_listing()

    order_res = client.post("/api/v1/consumers/orders", headers=headers, json={
        "items": [{"listing_id": listing_id, "quantity": 1.0}],
        "delivery_address": "Benz Circle, Vijayawada",
        "payment_method": "ONLINE_ESCROW"
    })
    assert order_res.status_code == 200
    order_id = order_res.json()["order_id"]

    # Initialize payment order
    pay_res = client.post("/api/v1/payments/create-order", headers=headers, json={"order_id": order_id})
    assert pay_res.status_code == 200
    gateway_order_id = pay_res.json()["gateway_order_id"]

    # Construct Webhook Payload
    webhook_body_dict = {
        "type": "PAYMENT_SUCCESS_WEBHOOK",
        "event_time": str(int(time.time())),
        "data": {
            "order": {
                "order_id": gateway_order_id,
                "order_amount": 100.0,
                "order_currency": "INR"
            },
            "payment": {
                "cf_payment_id": "cf_pay_test_998877",
                "payment_status": "SUCCESS",
                "payment_amount": 100.0,
                "payment_currency": "INR",
                "payment_method": {"upi": {"channel": "gpay"}},
                "bank_reference": "UTR9988776655"
            }
        }
    }
    raw_body = json.dumps(webhook_body_dict).encode("utf-8")
    timestamp_str = str(int(time.time()))

    # Compute valid signature
    secret_key = settings.CASHFREE_CLIENT_SECRET.encode("utf-8")
    data_to_sign = timestamp_str.encode("utf-8") + raw_body
    computed_hmac = hmac.new(secret_key, data_to_sign, hashlib.sha256).digest()
    valid_signature = base64.b64encode(computed_hmac).decode("utf-8")

    # 1. Send Valid Webhook
    wb_res = client.post(
        "/api/v1/payments/cashfree/webhook",
        content=raw_body,
        headers={
            "x-webhook-signature": valid_signature,
            "x-webhook-timestamp": timestamp_str,
            "Content-Type": "application/json"
        }
    )
    assert wb_res.status_code == 200
    assert wb_res.json()["status"] == "success"

    # 2. Send Duplicate Webhook (Test Idempotency)
    wb_dup_res = client.post(
        "/api/v1/payments/cashfree/webhook",
        content=raw_body,
        headers={
            "x-webhook-signature": valid_signature,
            "x-webhook-timestamp": timestamp_str,
            "Content-Type": "application/json"
        }
    )
    assert wb_dup_res.status_code == 200
    assert "Duplicate" in wb_dup_res.json().get("message", "")


def test_admin_refund_and_permissions():
    """
    Validates that only ADMIN users can initiate refunds and non-admin requests are rejected.
    """
    consumer_token = get_auth_token("consumer@vyavasahayam.org")
    admin_token = get_auth_token("admin@vyavasahayam.org")
    listing_id, _ = get_or_create_test_listing()

    # Place an order and confirm payment
    headers_consumer = {"Authorization": f"Bearer {consumer_token}"}
    order_res = client.post("/api/v1/consumers/orders", headers=headers_consumer, json={
        "items": [{"listing_id": listing_id, "quantity": 1.0}],
        "delivery_address": "Governorpet, Vijayawada",
        "payment_method": "ONLINE_ESCROW"
    })
    assert order_res.status_code == 200
    order_id = order_res.json()["order_id"]

    # Create & verify payment
    client.post("/api/v1/payments/create-order", headers=headers_consumer, json={"order_id": order_id})
    client.post(f"/api/v1/payments/{order_id}/verify", headers=headers_consumer)

    # 1. Consumer attempting refund must be forbidden (403)
    consumer_refund = client.post(
        f"/api/v1/payments/{order_id}/refund",
        headers=headers_consumer,
        json={"refund_amount": 10.0, "refund_note": "I want money back"}
    )
    assert consumer_refund.status_code == 403

    # 2. Admin attempting refund must succeed
    admin_refund = client.post(
        f"/api/v1/payments/{order_id}/refund",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"refund_amount": 10.0, "refund_note": "Quality dispute resolution"}
    )
    assert admin_refund.status_code == 200
    assert admin_refund.json()["success"] is True


def test_market_prices_daily_and_benchmark():
    """
    Tests government daily market prices endpoint and crop benchmark calculations.
    """
    # 1. Daily prices list
    daily_res = client.get("/api/v1/market-prices/daily")
    assert daily_res.status_code == 200
    daily_data = daily_res.json()
    assert daily_data["status"] == "success"
    assert len(daily_data["records"]) > 0

    # 2. Crop benchmark for Tomato
    bench_res = client.get("/api/v1/market-prices/benchmark?product_name=Tomato&district=Krishna")
    assert bench_res.status_code == 200
    bench_data = bench_res.json()
    assert bench_data["found"] is True
    assert bench_data["govt_modal_price_kg"] == 25.0
    assert "recommended_fair_range" in bench_data
