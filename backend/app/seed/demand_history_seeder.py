"""
Demand History Seeder — VyavaSahayam
=====================================
Generates 3 years of synthetic daily demand records (Jan 2022 – Sep 2025)
for 10 core products × 8 Andhra Pradesh districts.

Data characteristics:
  - Base seasonal curves derived from real Andhra Pradesh cropping calendars
  - Festival/cultural multipliers (Kartheeka, Sankranti, Avakaya, Ramadan, etc.)
  - Weekly demand patterns (Friday/Saturday B2C peaks)
  - Year-over-year growth trend (~8% per year)
  - Gaussian noise with product-specific CV (10–20%)
  - B2B / B2C split per product
  - Market price per kg (correlated inverse with quantity — demand elasticity)

When real marketplace orders accumulate, they will feed into this same table
and the model will be retrained, gradually replacing synthetic data with real data.
"""

import math
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import List, Dict, Tuple

# ─────────────────────────────────────────────────────────────────────────────
# Product catalogue
# ─────────────────────────────────────────────────────────────────────────────

PRODUCTS = [
    {
        "name": "Tomato",
        "category": "Vegetables",
        "base_demand_kg": 420.0,      # Daily baseline demand per location
        "base_price": 25.0,            # INR per kg
        "price_volatility": 0.35,
        "b2b_ratio": 0.40,             # 40% B2B, 60% B2C
        "noise_cv": 0.15,              # Coefficient of variation for noise
        "monthly_seasonal": [
            # Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
            1.25, 1.10, 0.90, 0.80, 0.75, 0.85, 1.00, 1.15, 1.20, 1.30, 1.45, 1.35
        ],
    },
    {
        "name": "Onion",
        "category": "Vegetables",
        "base_demand_kg": 350.0,
        "base_price": 30.0,
        "price_volatility": 0.40,
        "b2b_ratio": 0.50,
        "noise_cv": 0.18,
        "monthly_seasonal": [
            1.10, 1.00, 1.05, 1.15, 1.20, 0.85, 0.75, 0.80, 0.90, 1.00, 1.10, 1.15
        ],
    },
    {
        "name": "Potato",
        "category": "Vegetables",
        "base_demand_kg": 300.0,
        "base_price": 22.0,
        "price_volatility": 0.25,
        "b2b_ratio": 0.45,
        "noise_cv": 0.12,
        "monthly_seasonal": [
            1.20, 1.15, 1.00, 0.90, 0.85, 0.80, 0.85, 0.95, 1.00, 1.10, 1.15, 1.25
        ],
    },
    {
        "name": "Banana",
        "category": "Fruits",
        "base_demand_kg": 280.0,
        "base_price": 35.0,
        "price_volatility": 0.20,
        "b2b_ratio": 0.30,
        "noise_cv": 0.10,
        "monthly_seasonal": [
            1.05, 1.00, 1.05, 1.10, 1.15, 1.20, 1.20, 1.30, 1.35, 1.10, 1.05, 1.00
        ],
    },
    {
        "name": "Mango",
        "category": "Fruits",
        "base_demand_kg": 200.0,
        "base_price": 60.0,
        "price_volatility": 0.30,
        "b2b_ratio": 0.25,
        "noise_cv": 0.20,
        "monthly_seasonal": [
            0.10, 0.10, 0.30, 0.90, 1.80, 2.00, 1.60, 0.40, 0.15, 0.10, 0.10, 0.10
        ],
    },
    {
        "name": "Rice",
        "category": "Grains",
        "base_demand_kg": 600.0,
        "base_price": 45.0,
        "price_volatility": 0.10,
        "b2b_ratio": 0.70,
        "noise_cv": 0.08,
        "monthly_seasonal": [
            1.30, 1.15, 1.00, 0.95, 0.90, 0.85, 0.85, 0.90, 0.95, 1.05, 1.15, 1.30
        ],
    },
    {
        "name": "Brinjal",
        "category": "Vegetables",
        "base_demand_kg": 180.0,
        "base_price": 20.0,
        "price_volatility": 0.30,
        "b2b_ratio": 0.35,
        "noise_cv": 0.15,
        "monthly_seasonal": [
            0.95, 0.90, 0.85, 0.85, 0.90, 1.00, 1.10, 1.15, 1.20, 1.30, 1.45, 1.10
        ],
    },
    {
        "name": "Chilli",
        "category": "Spices",
        "base_demand_kg": 150.0,
        "base_price": 80.0,
        "price_volatility": 0.45,
        "b2b_ratio": 0.60,
        "noise_cv": 0.20,
        "monthly_seasonal": [
            1.00, 0.95, 0.90, 1.00, 1.10, 0.85, 0.80, 0.85, 0.90, 1.10, 1.20, 1.10
        ],
    },
    {
        "name": "Spinach",
        "category": "Leafy Greens",
        "base_demand_kg": 120.0,
        "base_price": 18.0,
        "price_volatility": 0.25,
        "b2b_ratio": 0.30,
        "noise_cv": 0.15,
        "monthly_seasonal": [
            1.00, 1.05, 1.00, 0.85, 0.70, 0.65, 0.70, 0.80, 0.95, 1.10, 1.35, 1.20
        ],
    },
    {
        "name": "Cucumber",
        "category": "Vegetables",
        "base_demand_kg": 160.0,
        "base_price": 15.0,
        "price_volatility": 0.25,
        "b2b_ratio": 0.35,
        "noise_cv": 0.12,
        "monthly_seasonal": [
            0.75, 0.80, 0.90, 1.05, 1.30, 1.50, 1.45, 1.30, 1.10, 0.90, 0.80, 0.75
        ],
    },
]

LOCATIONS = [
    "Krishna", "Guntur", "East Godavari", "West Godavari",
    "Visakhapatnam", "Kurnool", "Kadapa", "Eluru"
]

# Location size multiplier (Krishna/Guntur/Vizag are larger markets)
LOCATION_MULTIPLIERS = {
    "Krishna": 1.30,
    "Guntur": 1.25,
    "East Godavari": 1.10,
    "West Godavari": 1.10,
    "Visakhapatnam": 1.20,
    "Kurnool": 0.90,
    "Kadapa": 0.85,
    "Eluru": 0.95,
}

# ─────────────────────────────────────────────────────────────────────────────
# Festival / Cultural multipliers
# (date range → (affected_products_keywords, multiplier))
# ─────────────────────────────────────────────────────────────────────────────

def get_festival_multiplier(current_date: date, product_name: str) -> Tuple[float, str]:
    """Returns (demand_multiplier, festival_name) for a given date and product."""
    month = current_date.month
    day = current_date.day

    # Kartheeka Maasam (Oct 15 – Nov 15): major vegetarian surge
    if (month == 10 and day >= 15) or (month == 11 and day <= 15):
        if product_name in ["Tomato", "Brinjal", "Spinach", "Banana"]:
            return 1.55, "Kartheeka Maasam"
        if product_name in ["Onion", "Potato", "Cucumber"]:
            return 1.25, "Kartheeka Maasam"

    # Sankranti (Jan 10–17): harvest festival
    if month == 1 and 10 <= day <= 17:
        if product_name in ["Rice", "Banana"]:
            return 1.70, "Sankranti"
        if product_name in ["Tomato", "Onion", "Potato"]:
            return 1.35, "Sankranti"

    # Avakaya / Mango pickle season (Apr–June): massive mango spike
    if month in [4, 5, 6]:
        if product_name == "Mango":
            return 1.80, "Avakaya Pickle Season"

    # Ramadan / Iftar (approximately Apr–May, varies by year)
    if month == 4 and day >= 15:
        if product_name in ["Onion", "Tomato", "Cucumber"]:
            return 1.20, "Ramadan"

    # Vinayaka Chavithi (late Aug / early Sep)
    if (month == 8 and day >= 25) or (month == 9 and day <= 5):
        if product_name in ["Banana", "Cucumber", "Spinach"]:
            return 1.40, "Vinayaka Chavithi"

    # Navratri / Dussehra (Oct 1–12)
    if month == 10 and 1 <= day <= 12:
        if product_name in ["Banana", "Tomato", "Spinach"]:
            return 1.30, "Navratri & Dussehra"

    # Wedding season peaks (Dec 1 – Jan 31, Apr – Jun)
    if month in [12, 1] or (month in [4, 5]):
        if product_name in ["Onion", "Tomato", "Rice"]:
            return 1.15, "Wedding Season"

    # Summer hydration (May – Jun)
    if month in [5, 6]:
        if product_name == "Cucumber":
            return 1.50, "Summer Hydration"

    return 1.0, ""


# Day-of-week multipliers (0=Mon, 6=Sun)
DOW_MULTIPLIERS = {
    0: 0.90,  # Monday — quiet
    1: 0.88,  # Tuesday
    2: 0.92,  # Wednesday
    3: 0.95,  # Thursday
    4: 1.15,  # Friday — pre-weekend peak
    5: 1.25,  # Saturday — peak
    6: 1.05,  # Sunday — moderate
}


def generate_demand_record(
    record_date: date,
    product: Dict,
    location: str,
    rng: random.Random,
) -> Dict:
    """Generate a single daily demand record for a product × location."""

    year_idx = record_date.year - 2022  # 0, 1, 2, 3
    yoy_growth = (1.08 ** year_idx)     # 8% compound annual growth

    month_idx = record_date.month - 1
    monthly_mult = product["monthly_seasonal"][month_idx]

    dow = record_date.weekday()
    dow_mult = DOW_MULTIPLIERS[dow]

    festival_mult, festival_name = get_festival_multiplier(record_date, product["name"])
    is_festival = festival_mult > 1.0

    loc_mult = LOCATION_MULTIPLIERS[location]

    # Gaussian noise
    noise = rng.gauss(1.0, product["noise_cv"])
    noise = max(0.3, min(2.5, noise))  # clamp to realistic range

    base = product["base_demand_kg"]
    quantity_demanded = base * monthly_mult * dow_mult * festival_mult * yoy_growth * loc_mult * noise
    quantity_demanded = max(0.0, quantity_demanded)

    # Sold is slightly less than demanded (stockout / logistics)
    sell_ratio = rng.uniform(0.87, 0.98)
    quantity_sold = quantity_demanded * sell_ratio

    # Price: inversely correlated with quantity (simple demand-supply)
    price_noise = rng.gauss(1.0, 0.08)
    inv_demand = 1.0 / max(0.5, (quantity_demanded / (base * loc_mult)))
    price = product["base_price"] * inv_demand * price_noise * (1 + 0.05 * year_idx)
    price = max(5.0, min(price, product["base_price"] * 4.0))

    revenue = quantity_sold * price
    order_count = max(1, int(quantity_sold / rng.uniform(18, 35)))

    # B2B / B2C split
    b2b_r = product["b2b_ratio"]
    b2b_noise = rng.gauss(b2b_r, 0.05)
    b2b_noise = max(0.05, min(0.95, b2b_noise))
    b2c_noise = 1.0 - b2b_noise

    b2b_qty = quantity_sold * b2b_noise
    b2c_qty = quantity_sold * b2c_noise
    b2b_orders = max(1, int(order_count * b2b_noise))
    b2c_orders = max(0, order_count - b2b_orders)

    dt = datetime.combine(record_date, datetime.min.time()).replace(tzinfo=timezone.utc)

    return {
        "id": str(uuid.uuid4()),
        "date": dt,
        "product_name": product["name"],
        "location": location,
        "quantity_demanded": round(quantity_demanded, 2),
        "quantity_sold": round(quantity_sold, 2),
        "order_count": order_count,
        "revenue": round(revenue, 2),
        "average_price": round(price, 2),
        "b2b_quantity": round(b2b_qty, 2),
        "b2c_quantity": round(b2c_qty, 2),
        "b2b_order_count": b2b_orders,
        "b2c_order_count": b2c_orders,
        "year": record_date.year,
        "month": record_date.month,
        "week_of_year": record_date.isocalendar()[1],
        "day_of_week": dow,
        "market_price_per_kg": round(price, 2),
        "is_festival_day": is_festival,
        "festival_name": festival_name if is_festival else None,
        "data_source": "SYNTHETIC",
    }


def seed_demand_history(db) -> int:
    """
    Seed 3 years of demand history into the demand_history table.
    Returns the number of records inserted.
    Idempotent: skips if data already exists.
    """
    from app.models.models import DemandHistory

    # Check if already fully seeded
    existing_count = db.query(DemandHistory).count()
    if existing_count >= 50000:
        print(f"[DemandHistorySeeder] Demand history already fully seeded ({existing_count} rows). Skipping.", flush=True)
        return 0

    print(f"[DemandHistorySeeder] Generating 3-year demand history (2022-2025)...", flush=True)
    try:
        raw_conn = db.connection().connection
        cursor = raw_conn.cursor()
        cursor.execute("TRUNCATE TABLE demand_history;")
        raw_conn.commit()

        start_date = date(2022, 1, 1)
        end_date = date(2025, 9, 19)  # up to today
        delta = timedelta(days=1)

        rng = random.Random(42)  # fixed seed for reproducibility
        rows_tuples = []

        current = start_date
        while current <= end_date:
            for product in PRODUCTS:
                for location in LOCATIONS:
                    r = generate_demand_record(current, product, location, rng)
                    rows_tuples.append((
                        r["id"],
                        r["date"],
                        r["product_name"],
                        r["location"],
                        r["quantity_demanded"],
                        r["quantity_sold"],
                        r["order_count"],
                        r["revenue"],
                        r["average_price"],
                        r["b2b_quantity"],
                        r["b2c_quantity"],
                        r["b2b_order_count"],
                        r["b2c_order_count"],
                        r["year"],
                        r["month"],
                        r["week_of_year"],
                        r["day_of_week"],
                        r["market_price_per_kg"],
                        r["is_festival_day"],
                        r["festival_name"],
                        r["data_source"],
                    ))
            current += delta

        print(f"[DemandHistorySeeder] Streaming {len(rows_tuples)} records to database via execute_values...", flush=True)
        try:
            from psycopg2.extras import execute_values
            insert_sql = """
            INSERT INTO demand_history (
                id, date, product_name, location,
                quantity_demanded, quantity_sold, order_count, revenue, average_price,
                b2b_quantity, b2c_quantity, b2b_order_count, b2c_order_count,
                year, month, week_of_year, day_of_week,
                market_price_per_kg, is_festival_day, festival_name, data_source
            ) VALUES %s
            """
            execute_values(cursor, insert_sql, rows_tuples, page_size=10000)
            raw_conn.commit()
        except ImportError:
            # Fallback for non-psycopg2 environments
            from sqlalchemy import insert
            records = [dict(zip([
                "id", "date", "product_name", "location", "quantity_demanded",
                "quantity_sold", "order_count", "revenue", "average_price",
                "b2b_quantity", "b2c_quantity", "b2b_order_count", "b2c_order_count",
                "year", "month", "week_of_year", "day_of_week",
                "market_price_per_kg", "is_festival_day", "festival_name", "data_source"
            ], row)) for row in rows_tuples]
            for i in range(0, len(records), 5000):
                db.execute(insert(DemandHistory), records[i:i+5000])
                db.commit()
    except Exception as e:
        print(f"[DemandHistorySeeder] Error during bulk insert: {e}", flush=True)
        db.rollback()

    total = db.query(DemandHistory).count()
    print(f"[DemandHistorySeeder] Completed! Database has {total} demand history records.", flush=True)
    return total
