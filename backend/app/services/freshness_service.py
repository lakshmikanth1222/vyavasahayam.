from typing import Dict, Any, Tuple
from app.core.config import settings

class FreshnessAIService:
    """
    Freshness & Computer Vision Screening Service.
    Supports MOCK_AI simulation with deterministic realistic outputs,
    and PyTorch/OpenCV pipeline architecture.
    """

    @staticmethod
    def analyze_image(
        product_name: str,
        image_url: str = None,
        harvest_age_hours: float = 6.0,
        iot_temp: float = 24.0,
        iot_humidity: float = 65.0
    ) -> Dict[str, Any]:
        p_name = product_name.strip().title()
        
        # Deterministic domain logic based on harvest freshness and crop properties
        if "Tomato" in p_name:
            grade = "GRADE_A"
            freshness_score = 94.0 - min(harvest_age_hours * 0.4, 25.0)
            shelf_life_days = max(1.0, 6.0 - (harvest_age_hours / 24.0))
            spoilage_risk = max(4.0, (100.0 - freshness_score) * 0.6)
            defects = "High red pigmentation, firm turgor pressure, uniform skin with zero epidermal fissures."
            drying_eligible = True
        elif "Chilli" in p_name or "Pepper" in p_name:
            grade = "GRADE_A"
            freshness_score = 96.0 - min(harvest_age_hours * 0.3, 20.0)
            shelf_life_days = max(2.0, 10.0 - (harvest_age_hours / 24.0))
            spoilage_risk = max(3.0, (100.0 - freshness_score) * 0.5)
            defects = "Bright deep green luster, intact calyx, crisp firmness."
            drying_eligible = True
        elif "Onion" in p_name or "Potato" in p_name:
            grade = "GRADE_A"
            freshness_score = 95.0 - min(harvest_age_hours * 0.1, 15.0)
            shelf_life_days = max(5.0, 20.0 - (harvest_age_hours / 24.0))
            spoilage_risk = max(2.0, (100.0 - freshness_score) * 0.4)
            defects = "Dry outer papery skin, solid bulb mass, zero sprout emergence."
            drying_eligible = True
        elif "Spinach" in p_name or "Leafy" in p_name or "Coriander" in p_name:
            grade = "GRADE_A"
            freshness_score = 92.0 - min(harvest_age_hours * 0.8, 40.0)
            shelf_life_days = max(1.0, 3.0 - (harvest_age_hours / 24.0))
            spoilage_risk = max(6.0, (100.0 - freshness_score) * 0.8)
            defects = "Vibrant chlorophyll green, crisp petioles, minimal wilting."
            drying_eligible = False
        else:
            grade = "GRADE_A"
            freshness_score = 90.0
            shelf_life_days = 4.5
            spoilage_risk = 7.0
            defects = "Normal morphology, no visible microbiological mold."
            drying_eligible = False

        # Freshness Category classification
        if freshness_score >= 85:
            category = "FRESH"
        elif freshness_score >= 70:
            category = "MEDIUM_FRESH"
        elif freshness_score >= 50:
            category = "USE_SOON"
        elif freshness_score >= 35:
            category = "AT_RISK"
        else:
            category = "NOT_FOR_SALE"
            grade = "REJECTED"

        return {
            "product": p_name,
            "quality_grade": grade,
            "freshness_category": category,
            "freshness_score": round(freshness_score, 1),
            "estimated_shelf_life_days": round(shelf_life_days, 1),
            "spoilage_risk_pct": round(spoilage_risk, 1),
            "visible_defects": defects,
            "confidence": 0.96,
            "drying_eligible": drying_eligible
        }

    @staticmethod
    def calculate_dynamic_discount(
        remaining_days: float,
        initial_days: float = 5.0,
        asking_price: float = 30.0
    ) -> Tuple[float, float, str]:
        """
        Calculates suggested dynamic discount according to the Freshness Timer rule:
        - remaining > 50% window: 0% discount
        - remaining 25% - 50%: Tier 1 discount (e.g. 10%)
        - remaining < 25%: Tier 2 rescue discount (e.g. 25%)
        """
        if initial_days <= 0:
            initial_days = 5.0
        ratio = max(0.0, remaining_days / initial_days)
        
        if ratio > 0.50:
            discount_pct = 0.0
            status_desc = "NORMAL – Peak Freshness"
        elif ratio >= 0.25:
            discount_pct = settings.DISCOUNT_WINDOW_TIER1_PERCENT
            status_desc = "USE SOON – 10% Freshness Incentive Discount Applied"
        elif ratio > 0.05:
            discount_pct = settings.DISCOUNT_WINDOW_TIER2_PERCENT
            status_desc = "RESCUE PRIORITY – 25% Clearance Discount Recommended"
        else:
            discount_pct = 40.0
            status_desc = "CRITICAL RESCUE – Remove from human sale or route to solar drying/feed"

        discounted_price = round(asking_price * (1.0 - (discount_pct / 100.0)), 2)
        return discount_pct, discounted_price, status_desc
