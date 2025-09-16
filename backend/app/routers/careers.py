"""
Career management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database import get_db
from ..models import User, Career, CareerApplication
from ..schemas import Career as CareerSchema, CareerCreate, CareerApplication as CareerApplicationSchema, CareerApplicationCreate
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

@router.post("/apply", response_model=CareerApplicationSchema)
async def apply_to_career(
    application: CareerApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Apply to a career (students)"""
    # Prevent duplicate applications
    existing = db.query(CareerApplication).filter_by(user_id=current_user.id, career_id=application.career_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this career.")
    app = CareerApplication(
        user_id=current_user.id,
        career_id=application.career_id,
        cover_letter=application.cover_letter
    )
    db.add(app)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid application.")
    db.refresh(app)
    return app

@router.get("/applications/me", response_model=List[CareerApplicationSchema])
async def get_my_applications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List current user's career applications"""
    return db.query(CareerApplication).filter_by(user_id=current_user.id).all()