from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.models import User, FarmerProfile, BuyerProfile, ConsumerProfile
from app.schemas.schemas import UserLogin, FarmerRegister, BuyerRegister, ConsumerRegister, TokenResponse, UserOut
from app.api.v1.deps import get_current_user, require_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/farmer", response_model=TokenResponse)
def register_farmer(data: FarmerRegister, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == data.email) | (User.phone == data.phone)).first():
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")
    
    user = User(
        email=data.email,
        phone=data.phone,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        role="FARMER",
        preferred_language=data.preferred_language or "en"
    )
    db.add(user)
    db.flush()

    farmer_prof = FarmerProfile(
        user_id=user.id,
        village=data.village,
        district=data.district,
        state=data.state,
        latitude=data.latitude or 16.5062,
        longitude=data.longitude or 80.6480,
        farm_size_acres=data.farm_size_acres or 2.5,
        crops_grown=data.crops_grown or "Tomato, Chilli",
        expected_harvest=data.expected_harvest or "Fresh Tomatoes",
        fpo_name=data.fpo_name or "Kisan Seva FPO"
    )
    db.add(farmer_prof)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register/buyer", response_model=TokenResponse)
def register_buyer(data: BuyerRegister, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == data.email) | (User.phone == data.phone)).first():
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")

    user = User(
        email=data.email,
        phone=data.phone,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        role="BUYER_B2B"
    )
    db.add(user)
    db.flush()

    buyer_prof = BuyerProfile(
        user_id=user.id,
        organization_name=data.organization_name,
        contact_person=data.contact_person,
        organization_type=data.organization_type,
        delivery_address=data.delivery_address,
        district=data.district,
        state=data.state,
        required_products=data.required_products or "Tomato, Onion",
        max_budget_price=data.max_budget_price or 30.0,
        urgency=data.urgency or "HIGH"
    )
    db.add(buyer_prof)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register/consumer", response_model=TokenResponse)
def register_consumer(data: ConsumerRegister, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == data.email) | (User.phone == data.phone)).first():
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")

    user = User(
        email=data.email,
        phone=data.phone,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        role="CONSUMER_B2C",
        preferred_language=data.preferred_language or "en"
    )
    db.add(user)
    db.flush()

    consumer_prof = ConsumerProfile(
        user_id=user.id,
        default_address=data.default_address,
        district=data.district,
        state=data.state
    )
    db.add(consumer_prof)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    identifier = data.email_or_phone.strip()
    user = db.query(User).filter((User.email == identifier) | (User.phone == identifier)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is deactivated")

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me")
def get_current_user_profile(user: User = Depends(require_auth)):
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "preferred_language": user.preferred_language,
        "farmer_profile": user.farmer_profile,
        "buyer_profile": user.buyer_profile,
        "consumer_profile": user.consumer_profile
    }

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns sample pre-seeded demo accounts for quick role-switching in frontend"""
    return [
        {
            "role": "FARMER",
            "name": "Apparao Naidu (Farmer & FPO Lead)",
            "email": "farmer@vyavasahayam.org",
            "phone": "+91 98480 12345",
            "password": "password123",
            "village": "Gannavaram, Krishna Dist",
            "crops": "Tomatoes, Chillies, Brinjal"
        },
        {
            "role": "BUYER_B2B",
            "name": "Kiran Varma (Mega Mart Procurement)",
            "email": "buyer@vyavasahayam.org",
            "phone": "+91 98480 22334",
            "password": "password123",
            "organization": "Mega Mart Supermarkets Ltd.",
            "type": "Retail Chain (1000kg/day requirement)"
        },
        {
            "role": "CONSUMER_B2C",
            "name": "Sunitha Reddy (Household Consumer)",
            "email": "consumer@vyavasahayam.org",
            "phone": "+91 98480 33445",
            "password": "password123",
            "address": "Flat 402, Benz Circle, Vijayawada"
        },
        {
            "role": "ADMIN",
            "name": "Dr. Lakshmi Prasad (System Administrator)",
            "email": "admin@vyavasahayam.org",
            "phone": "+91 98480 44556",
            "password": "password123"
        },
        {
            "role": "COLLECTION_CENTER",
            "name": "Ramesh Varma (Rythu Bazar Hub Manager)",
            "email": "rythubazar@vyavasahayam.org",
            "phone": "+91 98480 55667",
            "password": "password123",
            "hub": "Rythu Bazar Gannavaram Local Hub"
        },
        {
            "role": "DELIVERY_PARTNER",
            "name": "Srinivas Express (Delivery Fleet)",
            "email": "delivery@vyavasahayam.org",
            "phone": "+91 98480 66778",
            "password": "password123"
        }
    ]
