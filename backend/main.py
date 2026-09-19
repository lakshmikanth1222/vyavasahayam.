import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.core.config import settings
from app.core.database import Base, engine
from app.seed.seed_data import seed_database

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.farmers import router as farmers_router
from app.api.v1.buyers import router as buyers_router
from app.api.v1.consumers import router as consumers_router
from app.api.v1.quality import router as quality_router
from app.api.v1.rescue import router as rescue_router
from app.api.v1.solar_drying import router as solar_drying_router
from app.api.v1.escrow import router as escrow_router
from app.api.v1.payments import router as payments_router
from app.api.v1.market_prices import router as market_prices_router
from app.api.v1.voice import router as voice_router
from app.api.v1.ai import router as ai_router
from app.api.v1.admin import router as admin_router
from app.api.v1.forecasting import router as forecasting_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.demands import router as demands_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.preorders import router as preorders_router
from app.seed.demand_history_seeder import seed_demand_history
from app.seed.infrastructure_seeder import seed_government_infrastructure
from app.core.database import SessionLocal

# Initialize database schema & seed
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"Seed info: {e}")

try:
    db_init = SessionLocal()
    seed_demand_history(db_init)
    seed_government_infrastructure(db_init)
    db_init.close()
except Exception as e:
    print(f"Database initialization info: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Fresh Farm-to-Customer Agricultural Marketplace connecting farmers directly with B2B buyers and B2C consumers while reducing intermediaries, post-harvest losses, and spoilage through AI Freshness screening, Rythu Bazar local fulfillment, Escrow settlement, and a multi-tier Rescue Engine with Solar Drying value addition.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — Allow all origins (frontend is on same Vercel domain via rewrites)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under API V1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(farmers_router, prefix=settings.API_V1_STR)
app.include_router(buyers_router, prefix=settings.API_V1_STR)
app.include_router(consumers_router, prefix=settings.API_V1_STR)
app.include_router(quality_router, prefix=settings.API_V1_STR)
app.include_router(rescue_router, prefix=settings.API_V1_STR)
app.include_router(solar_drying_router, prefix=settings.API_V1_STR)
app.include_router(escrow_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(market_prices_router, prefix=settings.API_V1_STR)
app.include_router(forecasting_router, prefix=settings.API_V1_STR)
app.include_router(forecast_router, prefix=settings.API_V1_STR)
app.include_router(demands_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(preorders_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)



@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "VyavaSahayam API",
        "version": "1.0.0",
        "mock_modes": {
            "ai": settings.MOCK_AI,
            "payment": settings.MOCK_PAYMENT,
            "maps": settings.MOCK_MAPS,
            "voice": settings.MOCK_VOICE,
            "dhenu": settings.MOCK_DHENU
        }
    }

# Check for compiled frontend dist directory in multiple possible paths
static_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist')),
    os.path.abspath(os.path.join(os.path.dirname(__file__), 'dist')),
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
]

dist_dir = None
for d in static_dist_dirs:
    if os.path.isdir(d):
        dist_dir = d
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"detail": "Frontend index.html not found"}
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to VyavaSahayam API",
            "documentation": "/docs",
            "health": "/health"
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
