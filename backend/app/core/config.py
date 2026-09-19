from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VyavaSahayam – Fresh Farm-to-Customer Agricultural Marketplace"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "vyavasahayam-super-secret-production-jwt-key-change-in-env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    VERCEL_URL: str = ""  # Auto-set by Vercel at runtime
    ALGORITHM: str = "HS256"
    
    # Database URL: default to SQLite for instant local zero-config out-of-the-box run, can be switched to PostgreSQL / Neon via .env
    DATABASE_URL: str = "sqlite:///./vyavasahayam.db"
    
    @validator("DATABASE_URL", pre=True)
    def fix_postgres_protocol(cls, v):
        if isinstance(v, str):
            clean_v = v.strip().strip("'\"")
            if clean_v.startswith("postgres://"):
                return clean_v.replace("postgres://", "postgresql://", 1)
            return clean_v
        return v
    
    # CORS — allow all origins in production (Vercel domains vary per deployment)
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Cashfree Payment Gateway Settings
    CASHFREE_ENVIRONMENT: str = "sandbox"  # "sandbox" or "production"
    CASHFREE_CLIENT_ID: str = "TEST10000000000000000000000000000001"
    CASHFREE_CLIENT_SECRET: str = "cfsk_ma_test_00000000000000000000000000000000_00000000"
    CASHFREE_API_VERSION: str = "2023-08-01"
    CASHFREE_RETURN_URL: str = "http://localhost:5173/payment/callback?order_id={order_id}"
    CASHFREE_NOTIFY_URL: str = "http://localhost:8000/api/v1/payments/cashfree/webhook"
    
    # Government Agriculture Market Data APIs (Data.gov.in / Agmarknet)
    DATA_GOV_IN_API_KEY: str = ""  # Enter your free API key from https://data.gov.in
    # Dataset 1: Current Daily Price of Various Commodities from Various Markets (Mandi)
    AGMARKNET_DAILY_MANDI_RESOURCE_ID: str = "9ef84268-d588-465a-a308-a864a43d0070"
    # Dataset 2: Variety-wise Daily Market Prices Data of Commodity
    AGMARKNET_VARIETY_RESOURCE_ID: str = "35985678-0d79-46b4-9ed6-6f13308a1d24"

    
    # Feature Flags & Mock Modes (MVP runs zero-cost fully functioning local simulations)
    MOCK_AI: bool = True
    MOCK_PAYMENT: bool = False  # When True, utilizes resilient mock simulation fallback if Cashfree credentials are unset

    MOCK_MAPS: bool = True
    MOCK_SMS: bool = True
    MOCK_VOICE: bool = True
    MOCK_DHENU: bool = True
    MOCK_NOTIFICATIONS: bool = True
    
    # Business Rules Configurations
    FREE_DELIVERY_MIN_ORDER: float = 500.0  # Free delivery threshold in INR
    DEFAULT_DELIVERY_FEE: float = 40.0
    FARMER_INSURANCE_ENABLED: bool = True  # Configurable 3% insurance policy proposal
    FARMER_INSURANCE_PERCENTAGE: float = 3.0
    PLATFORM_COMMISSION_PERCENTAGE: float = 2.0
    
    # Discount Rules Configurations
    DISCOUNT_WINDOW_TIER1_PERCENT: float = 10.0  # 25-50% shelf-life remaining
    DISCOUNT_WINDOW_TIER2_PERCENT: float = 25.0  # <25% shelf-life remaining
    
    # COD Restrictions
    COD_MIN_TRUST_SCORE: int = 50
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

