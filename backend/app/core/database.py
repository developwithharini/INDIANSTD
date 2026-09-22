import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("manak.database")

def get_engine():
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info("Connected to PostgreSQL database.")
        return engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
        return create_engine(
            "sqlite:///./manak.db",
            connect_args={"check_same_thread": False},
            echo=False
        )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

