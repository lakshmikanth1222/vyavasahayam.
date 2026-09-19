import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="CONSUMER_B2C")  # FARMER, BUYER_B2B, CONSUMER_B2C, ADMIN, COLLECTION_CENTER, WAREHOUSE_STAFF, DELIVERY_PARTNER
    is_active = Column(Boolean, default=True)
    preferred_language = Column(String, default="en") # en, te, hi, ta, kn
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consumer_profile = relationship("ConsumerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    listings = relationship("ProductListing", back_populates="farmer")
    orders = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id")
    notifications = relationship("Notification", back_populates="user")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    village = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False, default="Andhra Pradesh")
    latitude = Column(Float, default=16.5062)
    longitude = Column(Float, default=80.6480)
    farm_size_acres = Column(Float, default=2.5)
    crops_grown = Column(String, default="Tomato, Chilli, Brinjal, Onion")
    expected_harvest = Column(String, default="Tomatoes (2000 kg by next week)")
    fpo_name = Column(String, default="Kisan Seva FPO")
    fpo_id = Column(String, default="FPO-AP-8921")
    bank_account_name = Column(String, default="Kisan Savings")
    bank_account_no = Column(String, default="XXXXXX4589")
    bank_ifsc = Column(String, default="SBIN0001234")
    insurance_opt_in = Column(Boolean, default=True)

    user = relationship("User", back_populates="farmer_profile")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    organization_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    organization_type = Column(String, default="Supermarket / Wholesale") # Supermarket, Restaurant Chain, Food Processing Unit, Exporter
    delivery_address = Column(String, nullable=False)
    district = Column(String, default="Vijayawada")
    state = Column(String, default="Andhra Pradesh")
    latitude = Column(Float, default=16.5150)
    longitude = Column(Float, default=80.6320)
    required_products = Column(String, default="Tomato, Onion, Potato")
    max_budget_price = Column(Float, default=30.0)
    urgency = Column(String, default="HIGH")

    user = relationship("User", back_populates="buyer_profile")


class ConsumerProfile(Base):
    __tablename__ = "consumer_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    default_address = Column(String, default="Flat 402, Green Meadows, Benz Circle, Vijayawada")
    district = Column(String, default="Vijayawada")
    state = Column(String, default="Andhra Pradesh")
    cod_trust_score = Column(Integer, default=85) # 0 to 100
    cod_eligible = Column(Boolean, default=True)
    cancellation_count = Column(Integer, default=0)
    failed_delivery_count = Column(Integer, default=0)
    cod_restriction_reason = Column(String, nullable=True)
    cod_restriction_expiry = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="consumer_profile")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, default="Fresh Vegetables") # Fresh Vegetables, Leafy Greens, Fruits, Tubers
    standard_unit = Column(String, default="kg")
    description = Column(Text, default="Freshly harvested produce from local farms.")
    drying_suitable = Column(Boolean, default=False)  # True for tomatoes, chillies, mangoes, onions, garlic, etc.
    default_shelf_life_days = Column(Integer, default=5)
    image_url = Column(String, default="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80")
    base_market_price_per_kg = Column(Float, default=25.0)


class ProductListing(Base):
    __tablename__ = "product_listings"

    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    title = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    available_quantity = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    asking_price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    quality_grade = Column(String, default="GRADE_A") # GRADE_A, GRADE_B, GRADE_C, REJECTED
    harvest_date = Column(DateTime, default=get_utc_now)
    expected_shelf_life_days = Column(Integer, default=5)
    remaining_shelf_life_days = Column(Float, default=5.0)
    available_from = Column(DateTime, default=get_utc_now)
    location_address = Column(String, nullable=False)
    village = Column(String, default="Gannavaram")
    district = Column(String, default="Krishna")
    state = Column(String, default="Andhra Pradesh")
    latitude = Column(Float, default=16.5410)
    longitude = Column(Float, default=80.8035)
    image_url = Column(String, nullable=True)
    
    # AI Screening results
    ai_analyzed = Column(Boolean, default=False)
    ai_freshness_score = Column(Float, default=92.0) # 0 to 100
    ai_freshness_category = Column(String, default="FRESH") # FRESH, MEDIUM_FRESH, USE_SOON, AT_RISK, NOT_FOR_SALE
    ai_spoilage_risk_pct = Column(Float, default=8.0)
    ai_visible_defects = Column(String, default="None detected; uniform pigmentation and firm texture.")
    ai_confidence = Column(Float, default=0.96)
    
    # IoT metrics
    iot_temp = Column(Float, default=24.5)
    iot_humidity = Column(Float, default=68.0)
    
    status = Column(String, default="ACTIVE") # ACTIVE, SOLD, PARTIALLY_SOLD, EXPIRED, RESCUED, REJECTED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    farmer = relationship("User", back_populates="listings")
    product = relationship("Product")
    batches = relationship("ProduceBatch", back_populates="listing")


class CollectionCentre(Base):
    __tablename__ = "collection_centres"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False) # e.g. "Rythu Bazar Gannavaram Local Hub"
    code = Column(String, unique=True, nullable=False) # RB-GV-01
    centre_type = Column(String, default="RYTHU_BAZAR") # RYTHU_BAZAR, DISTRICT_HUB, COLD_HUB
    address = Column(String, nullable=False)
    district = Column(String, default="Krishna")
    state = Column(String, default="Andhra Pradesh")
    latitude = Column(Float, default=16.5380)
    longitude = Column(Float, default=80.7950)
    capacity_kg = Column(Float, default=10000.0)
    operator_name = Column(String, default="Ramesh Varma (Centre In-Charge)")
    operator_phone = Column(String, default="+91 98480 11223")
    is_active = Column(Boolean, default=True)


class ProduceBatch(Base):
    __tablename__ = "produce_batches"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_code = Column(String, unique=True, nullable=False) # BATCH-2026-TOM-001
    listing_id = Column(String, ForeignKey("product_listings.id"), nullable=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    collection_centre_id = Column(String, ForeignKey("collection_centres.id"), nullable=True)
    quantity_kg = Column(Float, nullable=False)
    current_stage = Column(String, default="HARVESTED") # HARVESTED, RECEIVED_CC, GRADED, PACKED, IN_TRANSIT, DELIVERED, RESCUED, DISPOSED
    current_grade = Column(String, default="GRADE_A") # GRADE_A, GRADE_B, GRADE_C, REJECTED
    freshness_score = Column(Float, default=92.0)
    freshness_category = Column(String, default="FRESH") # FRESH, MEDIUM_FRESH, USE_SOON, AT_RISK, NOT_FOR_SALE
    remaining_shelf_life_days = Column(Float, default=5.0)
    spoilage_risk_pct = Column(Float, default=8.0)
    iot_temp = Column(Float, default=24.0)
    iot_humidity = Column(Float, default=65.0)
    current_location = Column(String, default="Farmer Gate / Farm Packhouse")
    rescue_status = Column(String, default="NORMAL") # NORMAL, RESCUE_PENDING, RESCUED, DISPOSED
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    listing = relationship("ProductListing", back_populates="batches")
    product = relationship("Product")
    farmer = relationship("User")
    collection_centre = relationship("CollectionCentre")
    quality_checks = relationship("QualityCheck", back_populates="batch", cascade="all, delete-orphan")
    digital_twin = relationship("FreshnessDigitalTwin", back_populates="batch", uselist=False, cascade="all, delete-orphan")


class QualityCheck(Base):
    __tablename__ = "quality_checks"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_id = Column(String, ForeignKey("produce_batches.id"), nullable=False)
    stage = Column(String, nullable=False) # FARMER_PICKUP, COLLECTION_CENTRE, WAREHOUSE_RECEIVING, FINAL_PACKING
    grade = Column(String, nullable=False) # GRADE_A, GRADE_B, GRADE_C, REJECTED
    inspector_name = Column(String, default="Staff Quality Auditor")
    inspector_id = Column(String, nullable=True)
    weight_kg = Column(Float, nullable=False)
    freshness_score = Column(Float, default=90.0)
    rejection_reason = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    ai_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

    batch = relationship("ProduceBatch", back_populates="quality_checks")


class FreshnessDigitalTwin(Base):
    __tablename__ = "freshness_digital_twins"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_id = Column(String, ForeignKey("produce_batches.id"), unique=True, nullable=False)
    initial_shelf_life_days = Column(Float, default=5.0)
    current_shelf_life_days = Column(Float, default=5.0)
    decay_rate_per_hour = Column(Float, default=0.02)
    freshness_score = Column(Float, default=92.0)
    current_state = Column(String, default="FRESH") # FRESH, MEDIUM_FRESH, USE_SOON, AT_RISK, NOT_FOR_SALE
    suggested_discount_pct = Column(Float, default=0.0)
    last_temp = Column(Float, default=24.0)
    last_humidity = Column(Float, default=65.0)
    last_state_update = Column(DateTime, default=get_utc_now)
    created_at = Column(DateTime, default=get_utc_now)

    batch = relationship("ProduceBatch", back_populates="digital_twin")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_number = Column(String, unique=True, nullable=False) # ORD-2026-89123
    order_type = Column(String, default="B2C") # B2C, B2B
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    collection_centre_id = Column(String, ForeignKey("collection_centres.id"), nullable=True)
    status = Column(String, default="PLACED") # PLACED, CONFIRMED, PICKING, PACKED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, DISPUTED
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String, default="ONLINE_ESCROW") # ONLINE_ESCROW, COD
    payment_status = Column(String, default="PENDING") # PENDING, AUTHORIZED, HELD, DELIVERED, BUYER_CONFIRMED, RELEASED, DISPUTED, REFUNDED
    delivery_address = Column(String, nullable=False)
    delivery_slot = Column(String, default="Today 5:00 PM - 8:00 PM")
    delivery_partner_id = Column(String, ForeignKey("users.id"), nullable=True)
    delivery_partner_name = Column(String, default="Srinivas Express")
    delivery_partner_phone = Column(String, default="+91 94401 55667")
    proof_of_delivery_url = Column(String, nullable=True)
    buyer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    buyer = relationship("User", back_populates="orders", foreign_keys=[buyer_id])
    delivery_partner = relationship("User", foreign_keys=[delivery_partner_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    escrow = relationship("EscrowTransaction", back_populates="order", uselist=False)
    collection_centre = relationship("CollectionCentre")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    listing_id = Column(String, ForeignKey("product_listings.id"), nullable=True)
    batch_id = Column(String, ForeignKey("produce_batches.id"), nullable=True)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    grade = Column(String, default="GRADE_A")

    order = relationship("Order", back_populates="items")


class EscrowTransaction(Base):
    __tablename__ = "escrow_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    farmer_gross_amount = Column(Float, nullable=False)
    transport_charge = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    insurance_deduction = Column(Float, default=0.0)
    farmer_net_payout = Column(Float, nullable=False)
    status = Column(String, default="HELD") # HELD, BUYER_CONFIRMED, RELEASED, DISPUTED, REFUNDED
    release_date = Column(DateTime, nullable=True)
    dispute_reason = Column(String, nullable=True)
    admin_resolution = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    order = relationship("Order", back_populates="escrow")
    farmer = relationship("User")


class RescueEvent(Base):
    __tablename__ = "rescue_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_id = Column(String, ForeignKey("produce_batches.id"), nullable=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    product_name = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    trigger_reason = Column(String, nullable=False) # BUYER_CANCELLATION, DELIVERY_DELAY, VEHICLE_BREAKDOWN, ROUTE_DISRUPTION, FRESHNESS_DROP, QUALITY_DROP, SHELF_LIFE_EXPIRED
    original_route = Column(String, default="Rythu Bazar Hub -> Vijayawada Retail")
    remaining_shelf_life_hours = Column(Float, default=24.0)
    freshness_score = Column(Float, default=70.0)
    quality_grade = Column(String, default="GRADE_B")
    is_safe_for_consumption = Column(Boolean, default=True)
    contamination_flag = Column(Boolean, default=False)
    selected_route = Column(String, nullable=True) # BUYER_SWITCHING, SOLAR_DRYING, COLD_STORAGE, ALTERNATIVE_PROCESSING, SAFE_CATTLE_FEED, WASTE_TO_VALUE_DISPOSAL
    status = Column(String, default="INITIATED") # INITIATED, IN_PROGRESS, RESOLVED, FAILED
    resolution_notes = Column(Text, nullable=True)
    resolved_by_user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    options = relationship("RescueOption", back_populates="rescue_event", cascade="all, delete-orphan")


class RescueOption(Base):
    __tablename__ = "rescue_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    rescue_event_id = Column(String, ForeignKey("rescue_events.id"), nullable=False)
    channel_type = Column(String, nullable=False) # BUYER_SWITCHING, SOLAR_DRYING, COLD_STORAGE, ALTERNATIVE_PROCESSING, SAFE_CATTLE_FEED, WASTE_TO_VALUE_DISPOSAL
    target_entity_name = Column(String, nullable=False)
    target_location = Column(String, nullable=False)
    distance_km = Column(Float, default=5.0)
    estimated_recovery_value = Column(Float, default=0.0) # In INR
    viability_score = Column(Float, default=85.0) # 0 to 100
    is_safe = Column(Boolean, default=True)
    safety_verification_notes = Column(Text, default="Meets hygiene and safety parameters.")
    is_selected = Column(Boolean, default=False)

    rescue_event = relationship("RescueEvent", back_populates="options")


class SolarDryingCentre(Base):
    __tablename__ = "solar_drying_centres"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False) # e.g. "Gannavaram Agro Solar-Drying Facility"
    location = Column(String, nullable=False)
    district = Column(String, default="Krishna")
    state = Column(String, default="Andhra Pradesh")
    capacity_per_day_kg = Column(Float, default=1500.0)
    current_utilization_kg = Column(Float, default=450.0)
    supported_products = Column(String, default="Tomato, Chilli, Mango, Onion, Garlic")
    operating_status = Column(String, default="ACTIVE") # ACTIVE, MAINTENANCE, INACTIVE


class SolarDryingBatch(Base):
    __tablename__ = "solar_drying_batches"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_code = Column(String, unique=True, nullable=False) # SDB-2026-TOM-014
    source_batch_id = Column(String, ForeignKey("produce_batches.id"), nullable=True)
    rescue_event_id = Column(String, ForeignKey("rescue_events.id"), nullable=True)
    product_name = Column(String, nullable=False)
    input_quantity_kg = Column(Float, nullable=False)
    input_quality_grade = Column(String, default="GRADE_B")
    input_freshness_score = Column(Float, default=74.0)
    drying_centre_id = Column(String, ForeignKey("solar_drying_centres.id"), nullable=False)
    start_time = Column(DateTime, default=get_utc_now)
    expected_completion_time = Column(DateTime, nullable=True)
    actual_completion_time = Column(DateTime, nullable=True)
    estimated_yield_kg = Column(Float, default=50.0) # Approx 10:1 ratio for tomatoes
    final_output_quantity_kg = Column(Float, nullable=True)
    status = Column(String, default="PREPARING") # CREATED, APPROVED, PREPARING, DRYING, QUALITY_CHECK, COMPLETED, REJECTED
    moisture_level_pct = Column(Float, default=12.0)
    dried_product_sku = Column(String, nullable=True) # SUN-DRIED-TOM-100G
    notes = Column(Text, default="Pre-washed, sliced, and loaded on stainless food-grade solar drying racks.")
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    drying_centre = relationship("SolarDryingCentre")
    dried_products = relationship("DriedProduct", back_populates="solar_batch")


class DriedProduct(Base):
    __tablename__ = "dried_products"

    id = Column(String, primary_key=True, default=generate_uuid)
    solar_batch_id = Column(String, ForeignKey("solar_drying_batches.id"), nullable=False)
    product_name = Column(String, nullable=False) # "Sun-Dried Tomato Flakes (Vacuum Packed)"
    packaging_type = Column(String, default="250g Nitrogen Flush Sealed Pouch")
    quantity_kg = Column(Float, nullable=False)
    unit_cost = Column(Float, default=180.0)
    sale_price = Column(Float, default=320.0) # High value-add margin
    shelf_life_months = Column(Integer, default=12)
    status = Column(String, default="IN_INVENTORY") # IN_INVENTORY, SOLD, EXPIRED
    created_at = Column(DateTime, default=get_utc_now)

    solar_batch = relationship("SolarDryingBatch", back_populates="dried_products")


class DemandRequest(Base):
    __tablename__ = "demand_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    product_name = Column(String, nullable=False)
    required_quantity_kg = Column(Float, nullable=False)
    max_budget_per_kg = Column(Float, nullable=False)
    required_grade = Column(String, default="GRADE_A")
    delivery_district = Column(String, default="Krishna")
    urgency = Column(String, default="HIGH") # IMMEDIATE, WITHIN_24H, WITHIN_3DAYS
    status = Column(String, default="OPEN") # OPEN, MATCHED, FULFILLED, EXPIRED
    created_at = Column(DateTime, default=get_utc_now)

    buyer = relationship("User")


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    demand_request_id = Column(String, ForeignKey("demand_requests.id"), nullable=False)
    listing_id = Column(String, ForeignKey("product_listings.id"), nullable=False)
    match_score_pct = Column(Float, nullable=False)
    product_match = Column(Boolean, default=True)
    quantity_match_pct = Column(Float, default=100.0)
    grade_match = Column(Boolean, default=True)
    price_match_pct = Column(Float, default=100.0)
    distance_km = Column(Float, default=12.5)
    shelf_life_sufficient = Column(Boolean, default=True)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    demand_request = relationship("DemandRequest")
    listing = relationship("ProductListing")


class CustomerFeedback(Base):
    __tablename__ = "customer_feedbacks"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    freshness_rating = Column(Integer, default=5) # 1 to 5
    quality_rating = Column(Integer, default=5)
    delivery_rating = Column(Integer, default=5)
    overall_rating = Column(Integer, default=5)
    comments = Column(Text, default="Extremely crisp and fresh directly from local farmer.")
    created_at = Column(DateTime, default=get_utc_now)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="INFO") # INFO, WARNING, SUCCESS, URGENT
    channel = Column(String, default="IN_APP") # IN_APP, SMS, PUSH, VOICE
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="notifications")


class SystemAuditLog(Base):
    __tablename__ = "system_audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False) # e.g. "OVERRIDE_QUALITY_GRADE", "RELEASE_ESCROW", "TRIGGER_RESCUE"
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    created_at = Column(DateTime, default=get_utc_now)
