from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1 import health, analyze, standards, search, trace
from seed import seed_baseline_data

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Indian Standards Recommendation Engine — Automated Standards Mapping & Applicability Engine",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(health.router, tags=["Health Metrics"])
app.include_router(analyze.router, prefix=settings.API_V1_STR, tags=["Analyze"])
app.include_router(standards.router, prefix=settings.API_V1_STR, tags=["Standards"])
app.include_router(search.router, prefix=settings.API_V1_STR, tags=["Search"])
app.include_router(trace.router, prefix=settings.API_V1_STR, tags=["Diagnostics"])

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_baseline_data(db)
    finally:
        db.close()
