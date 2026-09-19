from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VyavaSahayam – Fresh Farm-to-Customer Agricultural Marketplace"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "vyavasahayam-super-secret-production-jwt-key-change-in-env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"
    
    # Database URL: default to SQLite for instant local zero-config out-of-the-box run, can be switched to PostgreSQL via .env
    DATABASE_URL: str = "sqlite:///./vyavasahayam.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Feature Flags & Mock Modes (MVP runs zero-cost fully functioning local simulations)
    MOCK_AI: bool = True
    MOCK_PAYMENT: bool = True
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
