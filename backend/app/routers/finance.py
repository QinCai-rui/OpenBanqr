"""
Financial simulation and management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

from ..database import get_db
from ..models import User, FinancialProfile, Career, Transaction, FinancialEvent
from ..schemas import (
    FinancialProfile as FinancialProfileSchema,
    FinancialProfileCreate,
    FinancialProfileUpdate,
    WeeklySimulation,
    Transaction as TransactionSchema,
    TransactionCreate
)
from ..auth import get_current_active_user

router = APIRouter()

def calculate_nz_tax(annual_income: float) -> float:
    """Calculate New Zealand PAYE tax (simplified)"""
    if annual_income <= 14000:
        return annual_income * 0.105  # 10.5%
    elif annual_income <= 48000:
        return 1470 + (annual_income - 14000) * 0.175  # 17.5%
    elif annual_income <= 70000:
        return 7420 + (annual_income - 48000) * 0.30   # 30%
    elif annual_income <= 180000:
        return 14020 + (annual_income - 70000) * 0.33  # 33%
    else:
        return 50320 + (annual_income - 180000) * 0.39 # 39%

def calculate_student_loan_payment(loan_balance: float, annual_income: float) -> float:
    """Calculate student loan repayment (simplified NZ system)"""
    if annual_income < 22828 or loan_balance <= 0:
        return 0
    return max(0, (annual_income - 22828) * 0.12)  # 12% of income over threshold

@router.get("/profile", response_model=FinancialProfileSchema)
async def get_financial_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's financial profile"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers don't have financial profiles"
        )
    
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        # Create default profile if it doesn't exist
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile

@router.put("/profile", response_model=FinancialProfileSchema)
async def update_financial_profile(
    profile_update: FinancialProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's financial profile"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers don't have financial profiles"
        )
    
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial profile not found"
        )
    
    # Update fields
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    
    # Recalculate income if career changed
    if profile_update.career_id is not None:
        career = db.query(Career).filter(Career.id == profile_update.career_id).first()
        if career:
            # Use middle of salary range
            profile.current_salary = (career.base_salary_min + career.base_salary_max) / 2
            profile.weekly_income = profile.current_salary / 52
            
            # Calculate tax and net income
            annual_tax = calculate_nz_tax(profile.current_salary)
            weekly_tax = annual_tax / 52
            profile.net_weekly_income = profile.weekly_income - weekly_tax
            
            # Set up student loan if required
            if career.requires_student_loan:
                profile.student_loan_balance = career.student_loan_amount
    
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/simulate-week", response_model=WeeklySimulation)
async def simulate_week(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Simulate one week of financial activity"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot simulate financial weeks"
        )
    
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial profile not found"
        )
    
    # Calculate weekly amounts
    gross_income = profile.weekly_income
    annual_tax = calculate_nz_tax(profile.current_salary)
    tax_amount = annual_tax / 52
    
    # Student loan payment
    annual_loan_payment = calculate_student_loan_payment(
        profile.student_loan_balance, 
        profile.current_salary
    )
    student_loan_payment = annual_loan_payment / 52
    
    # Net income after tax and student loan
    net_income = gross_income - tax_amount - student_loan_payment
    
    # Fixed expenses
    housing_cost = profile.housing_weekly_cost
    other_expenses = profile.weekly_expenses
    
    # Random financial events
    events = []
    active_events = db.query(FinancialEvent).filter(FinancialEvent.is_active == True).all()
    for event in active_events:
        if random.random() < event.probability:
            events.append(event)
    
    # Calculate event impact
    event_impact = 0
    for event in events:
        if event.event_type in ["bonus", "opportunity"]:
            amount = random.uniform(event.amount_min, event.amount_max)
            event_impact += amount
        else:  # fine, emergency
            amount = random.uniform(event.amount_min, event.amount_max)
            event_impact -= amount
    
    # Calculate remaining amount
    remaining_amount = net_income - housing_cost - other_expenses + event_impact
    
    # Update profile
    profile.weeks_played += 1
    profile.total_tax_paid += tax_amount
    profile.savings_balance += max(0, remaining_amount)  # Can't have negative savings
    profile.student_loan_balance = max(0, profile.student_loan_balance - student_loan_payment)
    
    db.commit()
    
    # Create transaction records
    transactions = [
        Transaction(
            user_id=current_user.id,
            transaction_type="salary",
            amount=gross_income,
            description="Weekly salary",
            category="income"
        ),
        Transaction(
            user_id=current_user.id,
            transaction_type="tax",
            amount=-tax_amount,
            description="PAYE tax",
            category="tax"
        ),
        Transaction(
            user_id=current_user.id,
            transaction_type="housing",
            amount=-housing_cost,
            description="Housing cost",
            category="housing"
        ),
        Transaction(
            user_id=current_user.id,
            transaction_type="expense",
            amount=-other_expenses,
            description="Other expenses",
            category="expense"
        )
    ]
    
    if student_loan_payment > 0:
        transactions.append(Transaction(
            user_id=current_user.id,
            transaction_type="student_loan",
            amount=-student_loan_payment,
            description="Student loan payment",
            category="debt"
        ))
    
    for transaction in transactions:
        db.add(transaction)
    
    db.commit()
    
    return WeeklySimulation(
        gross_income=gross_income,
        tax_amount=tax_amount,
        net_income=net_income,
        student_loan_payment=student_loan_payment,
        housing_cost=housing_cost,
        other_expenses=other_expenses,
        remaining_amount=remaining_amount,
        events=events,
        new_savings_balance=profile.savings_balance,
        new_student_loan_balance=profile.student_loan_balance
    )

@router.get("/transactions", response_model=List[TransactionSchema])
async def get_transactions(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history"""
    return db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).limit(limit).all()

@router.post("/transactions", response_model=TransactionSchema)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a manual transaction"""
    transaction = Transaction(
        user_id=current_user.id,
        **transaction_data.dict()
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction