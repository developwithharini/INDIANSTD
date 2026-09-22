import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MANAK / ISCOPE Procurement Workspace"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "manak_procurement_secret_key_change_in_prod_2026"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/manak_db"
    
    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "manak_password_2026"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Settings
    GEMINI_API_KEY: str = ""
    DEFAULT_AI_MODEL: str = "gemini-2.0-flash"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
