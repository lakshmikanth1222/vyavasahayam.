import pytest
from app.core.database import SessionLocal
from app.services.rescue_engine import RescueEngineService

def test_unsafe_contaminated_produce_blocked_from_food_and_feed():
    """
    CRITICAL ACCEPTANCE TEST:
    Verify that produce marked as contaminated or unsafe is STRICTLY BLOCKED
    from entering food sale, solar drying, or animal feed, and routed ONLY to
    Waste-to-Value Composting.
    """
    db = SessionLocal()
    try:
        # Evaluate rescue options for chemically contaminated produce
        options = RescueEngineService.evaluate_rescue_routes(
            db=db,
            product_name="Tomatoes (Pesticide Residue Detected)",
            quantity_kg=500.0,
            quality_grade="REJECTED",
            freshness_score=20.0,
            remaining_shelf_life_hours=5.0,
            is_safe_for_consumption=False,
            contamination_flag=True
        )

        assert len(options) == 1
        assert options[0]["channel_type"] == "WASTE_TO_VALUE_DISPOSAL"
        
        # Verify forbidden channels are completely absent
        channel_types = [opt["channel_type"] for opt in options]
        assert "BUYER_SWITCHING" not in channel_types
        assert "SOLAR_DRYING" not in channel_types
        assert "ALTERNATIVE_PROCESSING" not in channel_types
        assert "SAFE_CATTLE_FEED" not in channel_types
    finally:
        db.close()

def test_safe_produce_solar_drying_and_switching():
    """
    Verify that safe fresh produce with reduced shelf life evaluates solar drying
    and buyer switching routes correctly.
    """
    db = SessionLocal()
    try:
        options = RescueEngineService.evaluate_rescue_routes(
            db=db,
            product_name="Hybrid Vine Tomato",
            quantity_kg=300.0,
            quality_grade="GRADE_B",
            freshness_score=75.0,
            remaining_shelf_life_hours=20.0,
            is_safe_for_consumption=True,
            contamination_flag=False
        )

        channel_types = [opt["channel_type"] for opt in options]
        assert "BUYER_SWITCHING" in channel_types
        assert "SOLAR_DRYING" in channel_types
    finally:
        db.close()
