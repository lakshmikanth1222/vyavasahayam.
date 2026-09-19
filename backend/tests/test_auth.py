import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.database import Base, engine, SessionLocal
from app.seed.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_farmer_login():
    response = client.post("/api/v1/auth/login", json={
        "email_or_phone": "farmer@vyavasahayam.org",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "FARMER"

def test_b2b_buyer_login():
    response = client.post("/api/v1/auth/login", json={
        "email_or_phone": "buyer@vyavasahayam.org",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "BUYER_B2B"

def test_consumer_login():
    response = client.post("/api/v1/auth/login", json={
        "email_or_phone": "consumer@vyavasahayam.org",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "CONSUMER_B2C"

def test_invalid_login():
    response = client.post("/api/v1/auth/login", json={
        "email_or_phone": "nonexistent@vyavasahayam.org",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
