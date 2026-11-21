from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from app.database import SessionLocal
from app.services.job_sync_service import sync_daily_jobs
from app.services.career_catalog import seed_career_catalog
from app.routes import auth, dashboard, skills, jobs, analysis, roadmap, simulation, resume, profile, admin

app = FastAPI(
    title="CareerIQ — AI Career Intelligence API",
    description="Backend API connecting MySQL (careeriq_db) with React Frontend for MCA AI Career Intelligence Prototype",
    version="1.0.0"
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enable CORS for frontend development and local servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(skills.router)
app.include_router(jobs.router)
app.include_router(analysis.router)
app.include_router(roadmap.router)
app.include_router(simulation.router)
app.include_router(resume.router)
app.include_router(profile.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "CareerIQ AI API",
        "database": "MySQL (careeriq_db)",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

async def daily_job_sync_scheduler():
    """
    Automated background worker that runs immediately on startup and repeats
    every 24 hours to automatically refresh jobs, available dates, and deadlines.
    """
    while True:
        try:
            db = SessionLocal()
            try:
                res = sync_daily_jobs(db)
                print(f"[CareerIQ Scheduler] Automated daily sync: {res['message']}")
            finally:
                db.close()
        except Exception as err:
            print(f"[CareerIQ Scheduler] Daily job sync error: {err}")
        # Run automatically every 24 hours (86,400 seconds)
        await asyncio.sleep(86400)

def run_catalog_seed():
    """Adds any missing career roles, skills, jobs and learning links (safe to run every start)."""
    db = SessionLocal()
    try:
        added = seed_career_catalog(db)
        if any(added.values()):
            print(f"[CareerIQ] Career catalog updated: {added}")
    except Exception as err:
        db.rollback()
        print(f"[CareerIQ] Career catalog seed error: {err}")
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    await asyncio.to_thread(run_catalog_seed)
    asyncio.create_task(daily_job_sync_scheduler())
