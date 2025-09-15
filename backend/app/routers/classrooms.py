"""
Classroom management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
import string

from ..database import get_db
from ..models import User, Classroom
from ..schemas import (
    Classroom as ClassroomSchema, 
    ClassroomCreate, 
    ClassroomUpdate,
    ClassroomWithMembers,
    User as UserSchema
)
from ..auth import get_current_active_user, get_current_teacher

router = APIRouter()

def generate_invite_code() -> str:
    """Generate a random invite code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

@router.post("/", response_model=ClassroomSchema)
async def create_classroom(
    classroom_data: ClassroomCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create a new classroom (teacher only)"""
    # Generate unique invite code
    invite_code = generate_invite_code()
    while db.query(Classroom).filter(Classroom.invite_code == invite_code).first():
        invite_code = generate_invite_code()
    
    classroom = Classroom(
        name=classroom_data.name,
        description=classroom_data.description,
        teacher_id=current_user.id,
        invite_code=invite_code
    )
    
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return classroom

@router.get("/", response_model=List[ClassroomSchema])
async def list_classrooms(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List user's classrooms"""
    if current_user.is_teacher:
        # Teachers see their owned classrooms
        return db.query(Classroom).filter(Classroom.teacher_id == current_user.id).all()
    else:
        # Students see classrooms they're enrolled in
        return current_user.classrooms

@router.get("/{classroom_id}", response_model=ClassroomWithMembers)
async def get_classroom(
    classroom_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get classroom details"""
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found"
        )
    
    # Check access permissions
    if (current_user.is_teacher and classroom.teacher_id != current_user.id) or \
       (not current_user.is_teacher and current_user not in classroom.students):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return classroom

@router.post("/join/{invite_code}", response_model=ClassroomSchema)
async def join_classroom(
    invite_code: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Join a classroom using invite code (students only)"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot join classrooms"
        )
    
    classroom = db.query(Classroom).filter(
        Classroom.invite_code == invite_code,
        Classroom.is_active == True
    ).first()
    
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code"
        )
    
    # Check if already enrolled
    if current_user in classroom.students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this classroom"
        )
    
    classroom.students.append(current_user)
    db.commit()
    return classroom

@router.put("/{classroom_id}", response_model=ClassroomSchema)
async def update_classroom(
    classroom_id: int,
    classroom_update: ClassroomUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update classroom (teacher only)"""
    classroom = db.query(Classroom).filter(
        Classroom.id == classroom_id,
        Classroom.teacher_id == current_user.id
    ).first()
    
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found or access denied"
        )
    
    # Update fields
    for field, value in classroom_update.dict(exclude_unset=True).items():
        setattr(classroom, field, value)
    
    db.commit()
    db.refresh(classroom)
    return classroom

@router.delete("/{classroom_id}")
async def delete_classroom(
    classroom_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Delete classroom (teacher only)"""
    classroom = db.query(Classroom).filter(
        Classroom.id == classroom_id,
        Classroom.teacher_id == current_user.id
    ).first()
    
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found or access denied"
        )
    
    db.delete(classroom)
    db.commit()
    return {"message": "Classroom deleted successfully"}