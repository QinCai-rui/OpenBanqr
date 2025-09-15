"""
Banking and financial services routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import math
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, BankAccount, BankTransaction, Loan, LoanPayment, CreditScore, Budget, BudgetCategory
from ..auth import get_current_active_user

router = APIRouter()

def calculate_credit_score(user_id: int, db: Session) -> int:
    """Calculate credit score based on user's financial profile"""
    
    # Get user's loans and payment history
    loans = db.query(Loan).filter(Loan.user_id == user_id).all()
    
    if not loans:
        # New credit user
        return 650
    
    # Payment history (35% of score)
    total_payments = 0
    on_time_payments = 0
    
    for loan in loans:
        payments = db.query(LoanPayment).filter(LoanPayment.loan_id == loan.id).all()
        total_payments += len(payments)
        # Assume all payments in our system are on time for simplicity
        on_time_payments += len(payments)
    
    payment_history_score = (on_time_payments / max(total_payments, 1)) * 35
    
    # Credit utilization (30% of score)
    total_credit_limit = sum(loan.credit_limit or 0 for loan in loans if loan.loan_type == "credit_card")
    total_credit_used = sum(loan.current_balance for loan in loans if loan.loan_type == "credit_card")
    
    if total_credit_limit > 0:
        utilization = total_credit_used / total_credit_limit
        utilization_score = max(0, (1 - utilization) * 30)
    else:
        utilization_score = 25  # No credit cards
    
    # Length of credit history (15% of score)
    if loans:
        oldest_account = min(loan.created_at for loan in loans)
        months_history = (datetime.now() - oldest_account).days / 30
        history_score = min(15, (months_history / 120) * 15)  # Max score at 10 years
    else:
        history_score = 0
    
    # Credit mix (10% of score) - having different types of credit
    credit_types = set(loan.loan_type for loan in loans)
    mix_score = min(10, len(credit_types) * 2.5)
    
    # New credit (10% of score) - penalize recent credit inquiries
    recent_loans = [loan for loan in loans if (datetime.now() - loan.created_at).days < 90]
    new_credit_score = max(0, 10 - len(recent_loans) * 2)
    
    total_score = payment_history_score + utilization_score + history_score + mix_score + new_credit_score
    
    # Convert to FICO range (300-850)
    final_score = int(300 + (total_score / 100) * 550)
    
    return max(300, min(850, final_score))

def calculate_loan_payment(principal: float, annual_rate: float, term_months: int) -> float:
    """Calculate monthly loan payment"""
    if annual_rate == 0:
        return principal / term_months
    
    monthly_rate = annual_rate / 12
    payment = principal * (monthly_rate * (1 + monthly_rate) ** term_months) / \
              ((1 + monthly_rate) ** term_months - 1)
    
    return round(payment, 2)

@router.get("/accounts")
async def get_bank_accounts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's bank accounts"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access banking features"
        )
    
    accounts = db.query(BankAccount).filter(BankAccount.user_id == current_user.id).all()
    
    # Create default accounts if none exist
    if not accounts:
        checking = BankAccount(
            user_id=current_user.id,
            account_type="checking",
            account_name="Primary Checking",
            bank_name="OpenBanqr Bank",
            current_balance=1000.0,
            available_balance=1000.0,
            interest_rate=0.001,
            is_primary=True
        )
        
        savings = BankAccount(
            user_id=current_user.id,
            account_type="savings",
            account_name="Primary Savings",
            bank_name="OpenBanqr Bank",
            current_balance=500.0,
            available_balance=500.0,
            interest_rate=0.015,
            minimum_balance=100.0
        )
        
        db.add(checking)
        db.add(savings)
        db.commit()
        db.refresh(checking)
        db.refresh(savings)
        
        accounts = [checking, savings]
    
    return accounts

@router.get("/accounts/{account_id}/transactions")
async def get_account_transactions(
    account_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get account transaction history"""
    
    # Verify account belongs to user
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    transactions = db.query(BankTransaction)\
        .filter(BankTransaction.account_id == account_id)\
        .order_by(BankTransaction.transaction_date.desc())\
        .limit(limit)\
        .all()
    
    return transactions

@router.post("/transfer")
async def transfer_funds(
    from_account_id: int,
    to_account_id: int,
    amount: float,
    description: str = "Transfer between accounts",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Transfer funds between accounts"""
    
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be positive"
        )
    
    # Verify both accounts belong to user
    from_account = db.query(BankAccount).filter(
        BankAccount.id == from_account_id,
        BankAccount.user_id == current_user.id
    ).first()
    
    to_account = db.query(BankAccount).filter(
        BankAccount.id == to_account_id,
        BankAccount.user_id == current_user.id
    ).first()
    
    if not from_account or not to_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both accounts not found"
        )
    
    if from_account.available_balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    # Perform transfer
    from_account.current_balance -= amount
    from_account.available_balance -= amount
    
    to_account.current_balance += amount
    to_account.available_balance += amount
    
    # Create transaction records
    from_transaction = BankTransaction(
        account_id=from_account_id,
        transaction_type="transfer",
        amount=-amount,
        description=f"Transfer to {to_account.account_name}",
        category="transfer",
        status="posted",
        balance_after=from_account.current_balance,
        transaction_date=datetime.now()
    )
    
    to_transaction = BankTransaction(
        account_id=to_account_id,
        transaction_type="transfer",
        amount=amount,
        description=f"Transfer from {from_account.account_name}",
        category="transfer",
        status="posted",
        balance_after=to_account.current_balance,
        transaction_date=datetime.now()
    )
    
    db.add(from_transaction)
    db.add(to_transaction)
    db.commit()
    
    return {"message": "Transfer completed successfully"}

@router.get("/credit-score")
async def get_credit_score(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's credit score"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access credit features"
        )
    
    # Get latest credit score
    latest_score = db.query(CreditScore)\
        .filter(CreditScore.user_id == current_user.id)\
        .order_by(CreditScore.score_date.desc())\
        .first()
    
    # Calculate new score if none exists or if it's old
    if not latest_score or (datetime.now() - latest_score.score_date).days > 30:
        new_score = calculate_credit_score(current_user.id, db)
        
        # Get user's financial details for score factors
        loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
        
        credit_cards = [loan for loan in loans if loan.loan_type == "credit_card"]
        total_credit_limit = sum(card.credit_limit or 0 for card in credit_cards)
        total_credit_used = sum(card.current_balance for card in credit_cards)
        utilization = (total_credit_used / total_credit_limit * 100) if total_credit_limit > 0 else 0
        
        credit_score_record = CreditScore(
            user_id=current_user.id,
            score=new_score,
            score_range="FICO",
            credit_utilization=utilization,
            total_accounts=len(loans),
            open_accounts=len([loan for loan in loans if loan.status == "active"]),
            score_date=datetime.now()
        )
        
        db.add(credit_score_record)
        db.commit()
        db.refresh(credit_score_record)
        
        latest_score = credit_score_record
    
    # Determine score range category
    score = latest_score.score
    if score >= 800:
        category = "Exceptional"
    elif score >= 740:
        category = "Very Good"
    elif score >= 670:
        category = "Good"
    elif score >= 580:
        category = "Fair"
    else:
        category = "Poor"
    
    return {
        "score": score,
        "category": category,
        "score_date": latest_score.score_date,
        "credit_utilization": latest_score.credit_utilization,
        "total_accounts": latest_score.total_accounts,
        "open_accounts": latest_score.open_accounts,
        "score_factors": {
            "payment_history": "Good" if score > 650 else "Needs Improvement",
            "credit_utilization": "Good" if latest_score.credit_utilization < 30 else "High",
            "credit_history_length": "Good" if latest_score.total_accounts > 2 else "Short",
            "credit_mix": "Good" if latest_score.total_accounts > 3 else "Limited",
            "new_credit": "Good"
        }
    }

@router.get("/loans")
async def get_loans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's loans"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access loan features"
        )
    
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    
    return loans

@router.post("/loans/calculator")
async def loan_calculator(
    loan_amount: float,
    annual_rate: float,
    term_months: int,
    loan_type: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate loan payment and details"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access loan features"
        )
    
    monthly_payment = calculate_loan_payment(loan_amount, annual_rate, term_months)
    total_paid = monthly_payment * term_months
    total_interest = total_paid - loan_amount
    
    return {
        "loan_amount": loan_amount,
        "annual_rate": annual_rate,
        "term_months": term_months,
        "monthly_payment": monthly_payment,
        "total_paid": round(total_paid, 2),
        "total_interest": round(total_interest, 2),
        "loan_type": loan_type
    }

@router.get("/financial-summary")
async def get_financial_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive financial summary"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access financial summary"
        )
    
    # Get accounts
    accounts = db.query(BankAccount).filter(BankAccount.user_id == current_user.id).all()
    total_cash = sum(account.current_balance for account in accounts)
    
    # Get loans
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    total_debt = sum(loan.current_balance for loan in loans)
    monthly_debt_payments = sum(loan.minimum_payment for loan in loans)
    
    # Get credit score
    latest_score = db.query(CreditScore)\
        .filter(CreditScore.user_id == current_user.id)\
        .order_by(CreditScore.score_date.desc())\
        .first()
    
    credit_score = latest_score.score if latest_score else None
    
    # Calculate net worth
    net_worth = total_cash - total_debt
    
    return {
        "total_cash": round(total_cash, 2),
        "total_debt": round(total_debt, 2),
        "net_worth": round(net_worth, 2),
        "monthly_debt_payments": round(monthly_debt_payments, 2),
        "credit_score": credit_score,
        "number_of_accounts": len(accounts),
        "number_of_loans": len(loans),
        "debt_to_income_ratio": None  # Would need income data
    }