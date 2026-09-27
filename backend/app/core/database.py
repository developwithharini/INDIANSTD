import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Ensure data directory exists
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.INDEX_DIR, exist_ok=True)
os.makedirs(settings.RAW_DATA_DIR, exist_ok=True)

# SQLite engine setup
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
