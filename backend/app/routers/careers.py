"""
Career management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Career
from ..schemas import Career as CareerSchema, CareerCreate
from ..auth import get_current_active_user, get_current_teacher

router = APIRouter()

@router.get("/", response_model=List[CareerSchema])
async def list_careers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all available careers"""
    return db.query(Career).all()

@router.get("/{career_id}", response_model=CareerSchema)
async def get_career(
    career_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get career details"""
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )
    return career

@router.post("/", response_model=CareerSchema)
async def create_career(
    career_data: CareerCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create a new career option (teacher only)"""
    career = Career(**career_data.dict())
    db.add(career)
    db.commit()
    db.refresh(career)
    return career