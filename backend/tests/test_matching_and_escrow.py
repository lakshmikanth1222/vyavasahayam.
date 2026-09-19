import pytest
from app.services.matching_service import MatchingEngine
from app.models.models import DemandRequest, ProductListing, Product
from app.services.escrow_service import EscrowPaymentService
from app.core.database import SessionLocal

def test_b2b_matching_scoring():
    demand = DemandRequest(
        product_name="Tomato",
        required_quantity_kg=500.0,
        max_budget_per_kg=28.0,
        required_grade="GRADE_A",
        urgency="WITHIN_24H"
    )

    dummy_product = Product(name="Hybrid Vine Tomato")
    listing = ProductListing(
        title="Grade A Fresh Tomatoes",
        product=dummy_product,
        available_quantity=500.0,
        asking_price=24.0, # ₹4 under budget!
        discount_price=None,
        quality_grade="GRADE_A",
        remaining_shelf_life_days=4.5,
        ai_freshness_score=94.0,
        latitude=16.5410,
        longitude=80.8035
    )

    match_res = MatchingEngine.evaluate_match(
        demand=demand,
        listing=listing,
        buyer_lat=16.5150,
        buyer_lon=80.6320
    )

    assert match_res["product_match"] is True
    assert match_res["match_score_pct"] >= 85.0
    assert match_res["grade_match"] is True
    assert match_res["shelf_life_sufficient"] is True
    assert "under budget" in match_res["explanation"]

def test_distance_calculation():
    dist = MatchingEngine.calculate_distance_km(16.5062, 80.6480, 16.5150, 80.6320)
    assert 1.0 <= dist <= 10.0
