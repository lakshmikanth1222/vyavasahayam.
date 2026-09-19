from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --- Auth & User ---
class UserLogin(BaseModel):
    email_or_phone: str
    password: str

class FarmerRegister(BaseModel):
    email: str
    phone: str
    full_name: str
    password: str
    village: str
    district: str
    state: str = "Andhra Pradesh"
    latitude: Optional[float] = 16.5062
    longitude: Optional[float] = 80.6480
    farm_size_acres: Optional[float] = 2.5
    crops_grown: Optional[str] = "Tomato, Chilli, Brinjal"
    expected_harvest: Optional[str] = "Tomatoes (1500 kg next week)"
    fpo_name: Optional[str] = "Kisan Seva FPO"
    preferred_language: Optional[str] = "en"

class BuyerRegister(BaseModel):
    email: str
    phone: str
    full_name: str
    password: str
    organization_name: str
    contact_person: str
    organization_type: str = "Wholesale / Supermarket"
    delivery_address: str
    district: str = "Krishna"
    state: str = "Andhra Pradesh"
    required_products: Optional[str] = "Tomato, Onion"
    max_budget_price: Optional[float] = 30.0
    urgency: Optional[str] = "HIGH"

class ConsumerRegister(BaseModel):
    email: str
    phone: str
    full_name: str
    password: str
    default_address: str
    district: str = "Krishna"
    state: str = "Andhra Pradesh"
    preferred_language: Optional[str] = "en"

class UserOut(BaseModel):
    id: str
    email: str
    phone: str
    full_name: str
    role: str
    is_active: bool
    preferred_language: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Products & Listings ---
class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    standard_unit: str
    description: str
    drying_suitable: bool
    default_shelf_life_days: int
    image_url: str
    base_market_price_per_kg: float

    class Config:
        from_attributes = True

class ListingCreate(BaseModel):
    product_name: str
    title: str
    quantity: float
    unit: str = "kg"
    asking_price: float
    quality_grade: str = "GRADE_A"
    harvest_date: Optional[datetime] = None
    expected_shelf_life_days: int = 5
    location_address: str
    village: Optional[str] = "Gannavaram"
    district: Optional[str] = "Krishna"
    image_url: Optional[str] = None
    iot_temp: Optional[float] = 24.5
    iot_humidity: Optional[float] = 68.0
    notes: Optional[str] = None

class FreshnessScreeningResult(BaseModel):
    product: str
    quality_grade: str
    freshness_category: str
    freshness_score: float
    estimated_shelf_life_days: float
    spoilage_risk_pct: float
    visible_defects: str
    confidence: float
    drying_eligible: bool

class ListingOut(BaseModel):
    id: str
    farmer_id: str
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    title: str
    quantity: float
    available_quantity: float
    unit: str
    asking_price: float
    discount_price: Optional[float] = None
    quality_grade: str
    harvest_date: datetime
    expected_shelf_life_days: int
    remaining_shelf_life_days: float
    location_address: str
    village: str
    district: str
    image_url: Optional[str] = None
    ai_analyzed: bool
    ai_freshness_score: float
    ai_freshness_category: str
    ai_spoilage_risk_pct: float
    ai_visible_defects: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Quality & Batch Traceability ---
class QualityCheckCreate(BaseModel):
    batch_id: str
    stage: str # FARMER_PICKUP, COLLECTION_CENTRE, WAREHOUSE_RECEIVING, FINAL_PACKING
    grade: str # GRADE_A, GRADE_B, GRADE_C, REJECTED
    weight_kg: float
    freshness_score: float = 90.0
    inspector_name: str
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None

class ProduceBatchOut(BaseModel):
    id: str
    batch_code: str
    product_name: str
    farmer_name: str
    quantity_kg: float
    current_stage: str
    current_grade: str
    freshness_score: float
    freshness_category: str
    remaining_shelf_life_days: float
    spoilage_risk_pct: float
    current_location: str
    rescue_status: str
    created_at: datetime
    quality_checks: List[Any] = []

    class Config:
        from_attributes = True

# --- B2B Matching & Demand ---
class DemandRequestCreate(BaseModel):
    product_name: str
    required_quantity_kg: float
    max_budget_per_kg: float
    required_grade: str = "GRADE_A"
    delivery_district: str = "Krishna"
    urgency: str = "HIGH"

class DemandRequestOut(BaseModel):
    id: str
    buyer_id: str
    buyer_org_name: Optional[str] = None
    product_name: str
    required_quantity_kg: float
    max_budget_per_kg: float
    required_grade: str
    delivery_district: str
    urgency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MatchResultOut(BaseModel):
    id: str
    demand_request_id: str
    listing_id: str
    listing: Optional[Any] = None
    match_score_pct: float
    product_match: bool
    quantity_match_pct: float
    grade_match: bool
    price_match_pct: float
    distance_km: float
    shelf_life_sufficient: bool
    explanation: str

    class Config:
        from_attributes = True

# --- Orders & Escrow ---
class OrderItemCreate(BaseModel):
    listing_id: str
    quantity: float

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str
    delivery_slot: Optional[str] = "Today 5:00 PM - 8:00 PM"
    payment_method: str = "ONLINE_ESCROW" # ONLINE_ESCROW, COD
    buyer_notes: Optional[str] = None

class OrderOut(BaseModel):
    id: str
    order_number: str
    order_type: str
    buyer_id: str
    buyer_name: Optional[str] = None
    status: str
    subtotal: float
    delivery_fee: float
    discount_amount: float
    total_amount: float
    payment_method: str
    payment_status: str
    delivery_address: str
    delivery_slot: str
    delivery_partner_name: Optional[str] = None
    delivery_partner_phone: Optional[str] = None
    created_at: datetime
    items: List[Any] = []
    escrow: Optional[Any] = None

    class Config:
        from_attributes = True

# --- Rescue Engine & Solar Drying ---
class RescueTriggerRequest(BaseModel):
    order_id: Optional[str] = None
    batch_id: Optional[str] = None
    trigger_reason: str # BUYER_CANCELLATION, DELIVERY_DELAY, VEHICLE_BREAKDOWN, FRESHNESS_DROP
    notes: Optional[str] = None

class RescueActionExecute(BaseModel):
    rescue_event_id: str
    selected_option_id: str
    resolution_notes: Optional[str] = None

class SolarBatchCreate(BaseModel):
    source_batch_id: Optional[str] = None
    rescue_event_id: Optional[str] = None
    product_name: str
    input_quantity_kg: float
    input_quality_grade: str = "GRADE_B"
    drying_centre_id: str
    notes: Optional[str] = None

# --- Voice IVR & Dhenu AI ---
class VoiceIVRInput(BaseModel):
    farmer_phone: str
    language: str = "te" # te, hi, en, ta, kn
    selected_menu_option: int # 1: List produce, 2: Check status, 3: Earnings, 4: Rescue status, 5: Support
    speech_transcription: Optional[str] = None

class VoiceIVRResponse(BaseModel):
    audio_text_response: str
    detected_intent: str
    action_status: str
    next_menu_options: List[str]

class DhenuQueryInput(BaseModel):
    query: str
    language: str = "en"
    farmer_context: Optional[dict] = None

class DhenuQueryResponse(BaseModel):
    answer: str
    category: str # MARKET_PRICES, CROP_ADVISORY, SCHEMES, SHELF_LIFE
    confidence: float
    recommended_actions: List[str]
