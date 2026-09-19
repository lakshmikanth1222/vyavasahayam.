import math
from typing import List, Dict, Any
from app.models.models import ProductListing, DemandRequest

class MatchingEngine:
    """
    Transparent Multi-Factor B2B Matching Algorithm.
    Evaluates:
    1. Product compatibility (binary)
    2. Quantity compatibility (ratio)
    3. Quality/grade match (penalty if below required)
    4. Price vs buyer budget (score higher if under budget)
    5. Haversine distance (proximity scoring)
    6. Freshness & shelf life vs buyer urgency
    """

    @staticmethod
    def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0 # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 1)

    @classmethod
    def evaluate_match(
        cls,
        demand: DemandRequest,
        listing: ProductListing,
        buyer_lat: float = 16.5150,
        buyer_lon: float = 80.6320
    ) -> Dict[str, Any]:
        # 1. Product Match Check
        product_match = (
            demand.product_name.strip().lower() in listing.title.lower() or
            demand.product_name.strip().lower() == listing.product.name.lower()
        )
        if not product_match:
            return {
                "match_score_pct": 0.0,
                "product_match": False,
                "quantity_match_pct": 0.0,
                "grade_match": False,
                "price_match_pct": 0.0,
                "distance_km": 0.0,
                "shelf_life_sufficient": False,
                "explanation": "Product mismatch"
            }

        # 2. Quantity compatibility (Max score when listing covers demand)
        req_qty = demand.required_quantity_kg
        avail_qty = listing.available_quantity
        if req_qty <= 0:
            req_qty = 100.0
        
        qty_ratio = min(1.0, avail_qty / req_qty)
        qty_score = qty_ratio * 100.0

        # 3. Grade compatibility
        grade_order = {"GRADE_A": 3, "GRADE_B": 2, "GRADE_C": 1, "REJECTED": 0}
        req_grade_val = grade_order.get(demand.required_grade, 3)
        list_grade_val = grade_order.get(listing.quality_grade, 3)
        grade_match = list_grade_val >= req_grade_val
        grade_score = 100.0 if grade_match else (60.0 if list_grade_val == req_grade_val - 1 else 20.0)

        # 4. Price compatibility (Asking price vs Buyer max budget)
        effective_price = listing.discount_price if listing.discount_price else listing.asking_price
        max_budget = demand.max_budget_per_kg
        if effective_price <= max_budget:
            savings_pct = (max_budget - effective_price) / max_budget
            price_score = min(100.0, 85.0 + (savings_pct * 30.0))
        else:
            over_budget_pct = (effective_price - max_budget) / max_budget
            price_score = max(0.0, 70.0 - (over_budget_pct * 100.0))

        # 5. Distance Calculation
        dist_km = cls.calculate_distance_km(
            buyer_lat, buyer_lon,
            listing.latitude or 16.5410,
            listing.longitude or 80.8035
        )
        # 0-15 km is top score, decaying gracefully up to 100 km
        dist_score = max(20.0, 100.0 - (dist_km * 0.8))

        # 6. Freshness & Shelf-life vs Urgency
        remaining_days = listing.remaining_shelf_life_days
        if demand.urgency == "IMMEDIATE":
            shelf_life_sufficient = remaining_days >= 1.0
        elif demand.urgency == "WITHIN_24H":
            shelf_life_sufficient = remaining_days >= 2.0
        else:
            shelf_life_sufficient = remaining_days >= 3.0
        
        freshness_score = listing.ai_freshness_score

        # Weighted Total (Weights: Qty 20%, Grade 20%, Price 25%, Distance 20%, Freshness 15%)
        composite_score = (
            (qty_score * 0.20) +
            (grade_score * 0.20) +
            (price_score * 0.25) +
            (dist_score * 0.20) +
            (freshness_score * 0.15)
        )
        composite_score = round(min(99.0, max(10.0, composite_score)), 1)

        # Transparent explanation generator
        price_diff = round(max_budget - effective_price, 2)
        price_txt = f"₹{abs(price_diff)}/kg under budget" if price_diff >= 0 else f"₹{abs(price_diff)}/kg over budget"
        explanation = (
            f"Overall Match: {composite_score}% | "
            f"Quantity: {avail_qty}kg ({round(qty_ratio*100)}% of demand) | "
            f"Quality: {listing.quality_grade} (Req: {demand.required_grade}) | "
            f"Price: ₹{effective_price}/kg ({price_txt}) | "
            f"Distance: {dist_km} km | "
            f"Freshness: {listing.ai_freshness_score}/100 ({remaining_days} days shelf-life)"
        )

        return {
            "match_score_pct": composite_score,
            "product_match": True,
            "quantity_match_pct": round(qty_score, 1),
            "grade_match": grade_match,
            "price_match_pct": round(price_score, 1),
            "distance_km": dist_km,
            "shelf_life_sufficient": shelf_life_sufficient,
            "explanation": explanation
        }
