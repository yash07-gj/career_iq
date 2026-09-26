from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, dashboard, skills, jobs, analysis, roadmap, simulation

app = FastAPI(
    title="CareerIQ — AI Career Intelligence API",
    description="Backend API connecting MySQL (careeriq_db) with React Frontend for MCA AI Career Intelligence Prototype",
    version="1.0.0"
)

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
