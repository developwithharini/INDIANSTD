import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MANAK"
    SUBTITLE: str = "Indian Standards Recommendation Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Absolute Database & Directory paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    INDEX_DIR: str = os.path.join(DATA_DIR, "index")
    RAW_DATA_DIR: str = os.path.join(DATA_DIR, "raw")

    # SQLite Database URL (absolute path to single source of truth)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(DATA_DIR, 'manak.db')}")

    # Gemini API Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # Diagnostic Trace Settings
    DEBUG_RETRIEVAL_TRACE: bool = os.getenv("DEBUG_RETRIEVAL_TRACE", "false").lower() in ("true", "1", "yes")

    # Retrieval Models
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-v2-m3")

    # Corpus metadata
    DATASET_VERSION: str = os.getenv("DATASET_VERSION", "2026-09-27-PGD")
    SCORE_VERSION: str = "applicability_v1"

    # Directory paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    INDEX_DIR: str = os.path.join(DATA_DIR, "index")
    RAW_DATA_DIR: str = os.path.join(DATA_DIR, "raw")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
