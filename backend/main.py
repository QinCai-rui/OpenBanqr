"""
OpenBanqr Backend - Financial Literacy Platform
FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import create_db_and_tables
from app.routers import auth, users, classrooms, careers, finance, stocks, properties, banking

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    create_db_and_tables()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="OpenBanqr API",
    description="Free and open-source financial literacy platform for schools",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(classrooms.router, prefix="/api/classrooms", tags=["classrooms"])
app.include_router(careers.router, prefix="/api/careers", tags=["careers"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(properties.router, prefix="/api/properties", tags=["properties"])
app.include_router(banking.router, prefix="/api/banking", tags=["banking"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "OpenBanqr API is running"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "OpenBanqr API",
        "version": "0.1.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
