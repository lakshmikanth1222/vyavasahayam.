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
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    gateway = Column(String, default="cashfree", nullable=False)
    gateway_order_id = Column(String, nullable=True, index=True)  # Cashfree order ID
    gateway_payment_id = Column(String, nullable=True, index=True)  # Cashfree cf_payment_id
    payment_session_id = Column(String, nullable=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    status = Column(String, default="PAYMENT_PENDING", nullable=False)  # PAYMENT_PENDING, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_USER_DROPPED, PAYMENT_VERIFICATION_PENDING, REFUND_PENDING, REFUNDED
    payment_method = Column(String, nullable=True)  # UPI, CARD, NETBANKING, APP, WALLET
    bank_reference = Column(String, nullable=True)  # UTR / Bank Reference Number
    auth_id = Column(String, nullable=True)
    error_code = Column(String, nullable=True)
    error_description = Column(String, nullable=True)
    refund_id = Column(String, nullable=True)
    refund_amount = Column(Float, default=0.0)
    refund_status = Column(String, nullable=True)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    order = relationship("Order", back_populates="payments")
    user = relationship("User")


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    gateway = Column(String, default="cashfree", nullable=False)
    gateway_event_id = Column(String, nullable=True, index=True)
    order_id = Column(String, nullable=True, index=True)
    event_type = Column(String, nullable=False)  # e.g., PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK
    payload_hash = Column(String, unique=True, index=True, nullable=False)
    raw_payload = Column(JSON, nullable=True)
    received_at = Column(DateTime, default=get_utc_now)
    processed_at = Column(DateTime, nullable=True)
    status = Column(String, default="PROCESSED")  # PROCESSED, FAILED, DUPLICATE_IGNORED


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
    farmer_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    product_name = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    trigger_reason = Column(String, nullable=False) # TRANSPORT_BREAKDOWN, BUYER_CANCELLATION, SHELF_LIFE_CRITICAL, PRICE_CRASH, COLD_CHAIN_FAILURE
    original_route = Column(String, default="Rythu Bazar Hub -> Vijayawada Retail")
    latitude = Column(Float, default=16.5062)
    longitude = Column(Float, default=80.6480)
    location_name = Column(String, default="Krishna District Highway Hub")
    
    remaining_shelf_life_hours = Column(Float, default=24.0)
    freshness_score = Column(Float, default=70.0)
    quality_grade = Column(String, default="GRADE_B")
    is_safe_for_consumption = Column(Boolean, default=True)
    contamination_flag = Column(Boolean, default=False)
    
    selected_route = Column(String, nullable=True) # BUYER_SWITCHING, SOLAR_DRYING, COLD_STORAGE, ALTERNATIVE_PROCESSING, SAFE_CATTLE_FEED, WASTE_TO_VALUE_DISPOSAL
    selected_facility_id = Column(String, nullable=True)
    selected_facility_name = Column(String, nullable=True)
    status = Column(String, default="INITIATED") # INITIATED, IN_PROGRESS, RESOLVED, FAILED
    resolution_notes = Column(Text, nullable=True)
    resolved_by_user_id = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    options = relationship("RescueOption", back_populates="rescue_event", cascade="all, delete-orphan")


class RescueOption(Base):
    __tablename__ = "rescue_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    rescue_event_id = Column(String, ForeignKey("rescue_events.id"), nullable=False)
    tier = Column(Integer, default=1)               # 1=Buyer, 2=Processor, 3=Cold Storage, 4=Solar Drying, 5=Compost
    channel_type = Column(String, nullable=False)   # BUYER_SWITCHING, ALTERNATIVE_PROCESSING, COLD_STORAGE, SOLAR_DRYING, SAFE_CATTLE_FEED, WASTE_TO_VALUE_DISPOSAL
    
    target_entity_name = Column(String, nullable=False)
    target_location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String, nullable=True)
    
    facility_id = Column(String, nullable=True)
    ownership_type = Column(String, nullable=True)  # GOVERNMENT_ASSISTED, GOVERNMENT, PRIVATE, FPO_COOPERATIVE
    assistance_badge = Column(String, nullable=True) # e.g. "NHB Assisted", "AP Govt", "Private Processor"
    
    distance_km = Column(Float, default=5.0)
    estimated_transit_minutes = Column(Float, default=30.0)
    estimated_recovery_value = Column(Float, default=0.0) # In INR
    recovery_rate_per_kg = Column(Float, default=20.0)       # ₹/kg
    viability_score = Column(Float, default=85.0)          # 0 to 100
    
    availability_status = Column(String, default="CONFIRMED") # CONFIRMED, REQUIRES_CONFIRMATION, UNAVAILABLE
    is_safe = Column(Boolean, default=True)
    safety_verification_notes = Column(Text, default="Meets hygiene and safety parameters.")
    why_recommended = Column(JSON, nullable=True)            # List of explainable reason strings
    
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    rescue_event = relationship("RescueEvent", back_populates="options")


class SolarDryingCentre(Base):
    __tablename__ = "solar_drying_centres"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False) # e.g. "Gannavaram Agro Solar-Drying Facility"
    location = Column(String, nullable=False)
    district = Column(String, default="Krishna")
    state = Column(String, default="Andhra Pradesh")
    latitude = Column(Float, default=16.5380)
    longitude = Column(Float, default=80.7950)
    phone = Column(String, default="+91 94401 23456")
    capacity_per_day_kg = Column(Float, default=1500.0)
    current_utilization_kg = Column(Float, default=450.0)
    supported_products = Column(String, default="Tomato, Chilli, Mango, Onion, Garlic")
    operating_status = Column(String, default="ACTIVE") # ACTIVE, MAINTENANCE, INACTIVE
    operator_name = Column(String, default="Siva Prasad (FPO In-Charge)")
    created_at = Column(DateTime, default=get_utc_now)

    batches = relationship("SolarDryingBatch", back_populates="centre")


class SolarDryingBatch(Base):
    __tablename__ = "solar_drying_batches"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_code = Column(String, unique=True, nullable=False) # SDB-2026-TOM-014
    source_batch_id = Column(String, ForeignKey("produce_batches.id"), nullable=True)
    rescue_event_id = Column(String, ForeignKey("rescue_events.id"), nullable=True)
    drying_centre_id = Column(String, ForeignKey("solar_drying_centres.id"), nullable=False)
    product_name = Column(String, nullable=False)
    input_quantity_kg = Column(Float, nullable=False)
    input_quality_grade = Column(String, default="GRADE_B")
    input_freshness_score = Column(Float, default=74.0)
    expected_output_kg = Column(Float, default=50.0)
    actual_output_kg = Column(Float, nullable=True)
    start_time = Column(DateTime, default=get_utc_now)
    expected_completion_time = Column(DateTime, nullable=True)
    actual_completion_time = Column(DateTime, nullable=True)
    status = Column(String, default="PREPARING") # CREATED, APPROVED, PREPARING, DRYING, QUALITY_CHECK, COMPLETED, REJECTED
    moisture_level_pct = Column(Float, default=12.0)
    dried_product_sku = Column(String, nullable=True) # SUN-DRIED-TOM-100G
    notes = Column(Text, default="Pre-washed, sliced, and loaded on stainless food-grade solar drying racks.")
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    centre = relationship("SolarDryingCentre", back_populates="batches")
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
    status = Column(String, default="AVAILABLE_FOR_SALE") # AVAILABLE_FOR_SALE, IN_INVENTORY, SOLD, EXPIRED
    created_at = Column(DateTime, default=get_utc_now)

    solar_batch = relationship("SolarDryingBatch", back_populates="dried_products")


class DemandRequest(Base):
    """
    Core B2B Procurement Demand posted by buyers.
    Lifecycle: OPEN -> MATCHING -> OFFERS_RECEIVED -> PARTIALLY_FILLED -> FULLY_FILLED -> ORDER_CREATED -> FULFILLED -> EXPIRED / CANCELLED
    """
    __tablename__ = "demand_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    product_name = Column(String, nullable=False, index=True)
    required_quantity_kg = Column(Float, nullable=False) # Total kg needed
    unit = Column(String, default="kg")
    max_budget_per_kg = Column(Float, nullable=False)    # Max INR/kg buyer will pay
    required_grade = Column(String, default="GRADE_A")   # GRADE_A, GRADE_B, GRADE_C
    delivery_district = Column(String, default="Krishna", index=True)
    delivery_address = Column(String, nullable=True)
    required_by_date = Column(DateTime, nullable=True)
    recurring_demand = Column(Boolean, default=False)
    recurrence_frequency = Column(String, nullable=True) # DAILY, WEEKLY, BIWEEKLY, MONTHLY
    urgency = Column(String, default="HIGH")             # IMMEDIATE, WITHIN_24H, WITHIN_3DAYS, NORMAL
    notes = Column(Text, nullable=True)
    
    # State tracking
    status = Column(String, default="OPEN", index=True)  # OPEN, MATCHING, OFFERS_RECEIVED, PARTIALLY_FILLED, FULLY_FILLED, ORDER_CREATED, FULFILLED, EXPIRED, CANCELLED
    filled_quantity_kg = Column(Float, default=0.0)      # Sum of accepted offer quantities
    
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    buyer = relationship("User", foreign_keys=[buyer_id])
    offers = relationship("DemandOffer", back_populates="demand", cascade="all, delete-orphan")
    opportunities = relationship("DemandOpportunity", back_populates="demand", cascade="all, delete-orphan")
    events = relationship("DemandEvent", back_populates="demand", cascade="all, delete-orphan")


# Alias Demand to DemandRequest
Demand = DemandRequest


class DemandOpportunity(Base):
    """
    Calculated match between a Demand and an eligible Farmer/FPO.
    Contains transparent multi-factor match score and explainable reasons.
    """
    __tablename__ = "demand_opportunities"

    id = Column(String, primary_key=True, default=generate_uuid)
    demand_id = Column(String, ForeignKey("demand_requests.id"), nullable=False, index=True)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    match_score = Column(Float, nullable=False)          # 0.0 to 100.0
    matched_quantity_kg = Column(Float, default=0.0)     # Capacity farmer can supply
    estimated_distance_km = Column(Float, default=0.0)
    estimated_delivery_time = Column(String, default="Within 24 Hours")
    score_breakdown_json = Column(JSON, nullable=True)   # { product_score, qty_score, grade_score, price_score, dist_score, freshness_score }
    explanation_json = Column(JSON, nullable=True)       # List of structured bullet reasons
    status = Column(String, default="NEW", index=True)   # NEW, VIEWED, INTERESTED, OFFERED, ACCEPTED, REJECTED, EXPIRED
    created_at = Column(DateTime, default=get_utc_now)

    demand = relationship("DemandRequest", back_populates="opportunities")
    farmer = relationship("User", foreign_keys=[farmer_id])


class DemandOffer(Base):
    """
    Supply commitment submitted by a Farmer or FPO against a specific Demand.
    Can be single-farmer or part of multi-farmer FPO aggregation.
    """
    __tablename__ = "demand_offers"

    id = Column(String, primary_key=True, default=generate_uuid)
    demand_id = Column(String, ForeignKey("demand_requests.id"), nullable=False, index=True)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    offered_quantity_kg = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    expected_price_per_kg = Column(Float, nullable=False)
    available_date = Column(DateTime, nullable=True)
    quality_grade = Column(String, default="GRADE_A")
    listing_id = Column(String, ForeignKey("product_listings.id"), nullable=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="PENDING", index=True) # PENDING, ACCEPTED, REJECTED, WITHDRAWN, CONVERTED_TO_ORDER
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    demand = relationship("DemandRequest", back_populates="offers")
    farmer = relationship("User", foreign_keys=[farmer_id])
    listing = relationship("ProductListing")
    order = relationship("Order")


class PreOrder(Base):
    """
    Consumer pre-order for future harvest batches.
    Aggregated across consumers into local demand signals.
    """
    __tablename__ = "pre_orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    consumer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    product_name = Column(String, nullable=False, index=True)
    quantity_kg = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    requested_date = Column(DateTime, nullable=True)
    location = Column(String, nullable=False, index=True)
    max_price_per_kg = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="PENDING", index=True) # PENDING, MATCHING, CONFIRMED, FULFILLED, CANCELLED
    created_at = Column(DateTime, default=get_utc_now)

    consumer = relationship("User", foreign_keys=[consumer_id])


class DemandEvent(Base):
    """
    Domain events log capturing every state transition in the demand-to-supply lifecycle.
    """
    __tablename__ = "demand_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    demand_id = Column(String, ForeignKey("demand_requests.id"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True) # DEMAND_CREATED, FARMER_NOTIFIED, SUPPLY_OFFER_CREATED, SUPPLY_OFFER_ACCEPTED, DEMAND_PARTIALLY_FILLED, DEMAND_FULLY_FILLED, ORDER_CREATED, FULFILLED
    payload_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    demand = relationship("DemandRequest", back_populates="events")


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
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="INFO") # NEW_DEMAND, MATCH_FOUND, OFFER_RECEIVED, OFFER_ACCEPTED, ORDER_CREATED, DELIVERY_UPDATE, PAYMENT_UPDATE, QUALITY_ALERT, FORECAST_OPPORTUNITY
    channel = Column(String, default="IN_APP")          # IN_APP, SMS, PUSH, VOICE
    reference_id = Column(String, nullable=True, index=True) # e.g. demand_id, order_id, offer_id
    action_url = Column(String, nullable=True)          # Deep link e.g. /demand-opportunities
    data_json = Column(JSON, nullable=True)             # Additional structured metadata
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=get_utc_now, index=True)

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


# ─────────────────────────────────────────────────────────────────────────────
# ML DEMAND FORECASTING TABLES
# ─────────────────────────────────────────────────────────────────────────────

class DemandHistory(Base):
    """
    Daily demand time-series per product × location.
    Populated by:
      1. The synthetic seeder (2022-2025) for initial ML training.
      2. Real marketplace orders aggregated nightly via the data pipeline.
    """
    __tablename__ = "demand_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False, index=True)
    product_name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False, index=True)  # District name

    # Core demand metrics
    quantity_demanded = Column(Float, default=0.0)   # kg
    quantity_sold = Column(Float, default=0.0)       # kg
    order_count = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)             # INR
    average_price = Column(Float, default=0.0)       # INR per kg

    # B2B / B2C split
    b2b_quantity = Column(Float, default=0.0)        # kg
    b2c_quantity = Column(Float, default=0.0)        # kg
    b2b_order_count = Column(Integer, default=0)
    b2c_order_count = Column(Integer, default=0)

    # Time features (precomputed for faster ML feature engineering)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)       # 1–12
    week_of_year = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday

    # Market context
    market_price_per_kg = Column(Float, nullable=True)  # Mandi / MSP price that day
    is_festival_day = Column(Boolean, default=False)
    festival_name = Column(String, nullable=True)

    data_source = Column(String, default="SYNTHETIC")  # SYNTHETIC, MARKETPLACE, MANUAL

    created_at = Column(DateTime, default=get_utc_now)


class ForecastResult(Base):
    """
    Cached ML forecast results keyed by product × location × horizon × segment.
    Each cache entry is valid for 24 hours.
    """
    __tablename__ = "forecast_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    product_name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    horizon_days = Column(Integer, nullable=False)
    segment = Column(String, default="ALL")  # ALL, B2B, B2C
    model_name = Column(String, default="LightGBM")

    # Summary prediction
    predicted_demand_total = Column(Float, nullable=False)
    forecast_lower = Column(Float, nullable=False)
    forecast_upper = Column(Float, nullable=False)
    trend = Column(String, default="stable")         # increasing, decreasing, stable
    seasonal_effect = Column(String, default="medium") # low, medium, high

    # B2B/B2C breakdown
    b2b_demand = Column(Float, nullable=True)
    b2c_demand = Column(Float, nullable=True)

    # Daily forecast series (JSON list of {date, predicted_quantity})
    daily_forecast_json = Column(JSON, nullable=True)
    historical_json = Column(JSON, nullable=True)

    # Feature importance (JSON dict)
    feature_importance_json = Column(JSON, nullable=True)

    # Seasonal insights (JSON list of strings)
    seasonal_insights_json = Column(JSON, nullable=True)

    # Supply gap
    current_supply_kg = Column(Float, nullable=True)
    demand_gap_kg = Column(Float, nullable=True)

    generated_at = Column(DateTime, default=get_utc_now)
    expires_at = Column(DateTime, nullable=True)


class ModelMetric(Base):
    """
    Stores ML model evaluation metrics from the validation set.
    One row per product × location × training_date.
    """
    __tablename__ = "model_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    product_name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    model_name = Column(String, default="LightGBM")

    # Evaluation metrics (from validation set — never training set)
    mae = Column(Float, nullable=True)    # Mean Absolute Error (kg)
    rmse = Column(Float, nullable=True)   # Root Mean Square Error (kg)
    mape = Column(Float, nullable=True)   # Mean Absolute Percentage Error (%)
    smape = Column(Float, nullable=True)  # Symmetric MAPE (%)
    r_squared = Column(Float, nullable=True)

    # Training info
    train_start_date = Column(String, nullable=True)
    train_end_date = Column(String, nullable=True)
    val_start_date = Column(String, nullable=True)
    val_end_date = Column(String, nullable=True)
    n_training_samples = Column(Integer, nullable=True)
    n_features = Column(Integer, nullable=True)
    data_sufficient = Column(Boolean, default=True)

    model_path = Column(String, nullable=True)  # path to .pkl file
    trained_at = Column(DateTime, default=get_utc_now)


# ─────────────────────────────────────────────────────────────────────────────
# GOVERNMENT INFRASTRUCTURE & POST-HARVEST RESCUE TABLES
# ─────────────────────────────────────────────────────────────────────────────

class GovernmentInfrastructure(Base):
    """
    Government-owned, government-assisted, and registered post-harvest facilities.
    Sources: National Horticulture Board (NHB), Open Govt Data (data.gov.in),
             AP Horticulture Department, MoFPI, and WDRA.
    """
    __tablename__ = "government_infrastructure"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    facility_type = Column(String, nullable=False, index=True)  # COLD_STORAGE, CONTROLLED_ATMOSPHERE, FOOD_PROCESSOR, PULPING_UNIT, DEHYDRATION_UNIT, SOLAR_DRYING, DRY_WAREHOUSE, RURAL_GODOWN, PACK_HOUSE, RIPENING_CHAMBER, BIO_COMPOSTING, CATTLE_FEED_CLUSTER
    
    # Ownership vs Assistance distinctions (Critical accuracy requirement)
    ownership_type = Column(String, nullable=False, default="GOVERNMENT_ASSISTED")  # GOVERNMENT, GOVERNMENT_ASSISTED, GOVERNMENT_SUBSIDIZED, FPO_COOPERATIVE, PRIVATE
    assistance_type = Column(String, default="NHB_ASSISTED")  # NHB_ASSISTED, AP_HORTICULTURE_SCHEME, MOFPI_ASSISTED, NABARD_RIDF, WDRA_REGISTERED, MIDH_SCHEME, NONE
    government_scheme = Column(String, nullable=True)         # e.g. "MIDH - Cold Chain Development", "PM Kisan SAMPADA Yojana", "RKVY Infrastructure"
    ministry = Column(String, default="Ministry of Agriculture & Farmers Welfare")

    # Geographical Location
    state = Column(String, nullable=False, default="Andhra Pradesh")
    district = Column(String, nullable=False, index=True)
    mandal = Column(String, nullable=True)
    village = Column(String, nullable=True)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Contact Details
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)

    # Capacity & Specifications
    capacity_mt = Column(Float, default=1000.0)             # Total capacity in Metric Tons
    available_capacity_mt = Column(Float, default=250.0)   # Estimated available capacity
    commodities_supported = Column(JSON, nullable=True)    # e.g. ["Tomato", "Chilli", "Mango", "Onion", "Vegetables"]
    temperature_range = Column(String, default="0°C to 4°C (85-90% RH)")
    humidity_control = Column(Boolean, default=True)

    # Status & Live Verification
    operating_status = Column(String, default="ACTIVE")    # ACTIVE, SEASONAL, MAINTENANCE
    availability_status = Column(String, default="CONFIRMED")  # CONFIRMED (Live Verified), REQUIRES_CONFIRMATION (Verify upon dispatch), UNAVAILABLE
    
    # Registry & Provenance Tracking
    source = Column(String, default="National Horticulture Board (NHB) - Cold Storage Registry")
    source_url = Column(String, default="https://nhb.gov.in/ColdStorageRegistry/csrProjectStatusNew.aspx")
    data_confidence = Column(String, default="HIGH_GOVT_VERIFIED") # HIGH_GOVT_VERIFIED, MEDIUM_PUBLIC_REGISTRY
    last_verified_at = Column(DateTime, default=get_utc_now)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)


class InfrastructureSource(Base):
    """
    Authoritative government datasets and registry sources feeding the infrastructure layer.
    """
    __tablename__ = "infrastructure_sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_name = Column(String, nullable=False)
    agency = Column(String, nullable=False)
    source_type = Column(String, default="WEB_REGISTRY_API")  # WEB_REGISTRY_API, OGD_PORTAL, STATE_HORTICULTURE_PORTAL, CENTRAL_MINISTRY
    api_url = Column(String, nullable=True)
    source_url = Column(String, nullable=False)
    update_frequency = Column(String, default="Weekly")       # Daily, Weekly, Monthly
    records_count = Column(Integer, default=0)
    last_sync = Column(DateTime, default=get_utc_now)
    next_sync = Column(DateTime, default=get_utc_now)
    status = Column(String, default="ACTIVE")                 # ACTIVE, DEGRADED, PENDING_SYNC
    created_at = Column(DateTime, default=get_utc_now)


