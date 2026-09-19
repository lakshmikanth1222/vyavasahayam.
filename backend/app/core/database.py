from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# For SQLite, check_same_thread needs to be False; for Postgres/Neon, enable pool_pre_ping and pool_recycle
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine_kwargs = {
    "echo": False,
    "connect_args": connect_args
}

if not is_sqlite:
    engine_kwargs.update({
        "pool_pre_ping": True,     # Auto-reconnect on serverless/Neon sleep
        "pool_recycle": 300,        # Recycle connections every 5 mins
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
