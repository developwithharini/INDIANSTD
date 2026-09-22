import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import procurements, standards, regulations, watchlists, admin, health

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("manak.main")

# Initialize DB tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Standards Intelligence & Procurement Workspace API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(procurements.router, prefix=f"{settings.API_V1_STR}/procurements", tags=["Procurements"])
app.include_router(standards.router, prefix=f"{settings.API_V1_STR}/standards", tags=["Standards"])
app.include_router(regulations.router, prefix=f"{settings.API_V1_STR}/regulations", tags=["Regulations"])
app.include_router(watchlists.router, prefix=f"{settings.API_V1_STR}/watchlists", tags=["Watchlists"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])

@app.get("/")
def root():
    return {
        "message": "Welcome to MANAK / ISCOPE Standards Intelligence API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
