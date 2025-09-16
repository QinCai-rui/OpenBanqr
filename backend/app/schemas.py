"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Career Application schemas
class CareerApplicationBase(BaseModel):
    career_id: int
    cover_letter: Optional[str] = None

class CareerApplicationCreate(CareerApplicationBase):
    pass

class CareerApplication(CareerApplicationBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_teacher: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Classroom schemas
class ClassroomBase(BaseModel):
    name: str
    description: Optional[str] = None

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Classroom(ClassroomBase):
    id: int
    invite_code: str
    teacher_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClassroomWithMembers(Classroom):
    teacher: User
    students: List[User]

# Career schemas
class CareerBase(BaseModel):
    title: str
    description: Optional[str] = None
    education_required: Optional[str] = None
    requires_student_loan: bool = False
    student_loan_amount: float = 0.0
    base_salary_min: float
    base_salary_max: float
    industry: Optional[str] = None

class CareerCreate(CareerBase):
    pass

class Career(CareerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Financial Profile schemas
class FinancialProfileBase(BaseModel):
    career_id: Optional[int] = None
    current_salary: float = 0.0
    housing_type: str = "renting"
    housing_weekly_cost: float = 0.0

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileUpdate(BaseModel):
    career_id: Optional[int] = None
    current_salary: Optional[float] = None
    housing_type: Optional[str] = None
    housing_weekly_cost: Optional[float] = None
    weekly_expenses: Optional[float] = None

class FinancialProfile(FinancialProfileBase):
    id: int
    user_id: int
    weekly_income: float
    net_weekly_income: float
    student_loan_balance: float
    student_loan_weekly_payment: float
    savings_balance: float
    emergency_fund: float
    property_value: float
    weekly_expenses: float
    weeks_played: int
    total_tax_paid: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Stock schemas
class StockBase(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    market_cap: Optional[float] = None
    dividend_yield: float = 0.0

class Stock(StockBase):
    id: int
    daily_change: float
    daily_change_percent: float
    last_updated: datetime
    
    class Config:
        from_attributes = True

# Portfolio schemas
class PortfolioBase(BaseModel):
    name: str = "My Portfolio"

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    total_value: float
    total_invested: float
    cash_balance: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Stock Holding schemas
class StockHoldingBase(BaseModel):
    stock_id: int
    shares: float
    average_price: float

class StockHolding(StockHoldingBase):
    id: int
    portfolio_id: int
    current_value: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    stock: Stock
    
    class Config:
        from_attributes = True

class PortfolioWithHoldings(Portfolio):
    holdings: List[StockHolding]

# Transaction schemas
class TransactionBase(BaseModel):
    transaction_type: str
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None

class StockTransactionCreate(TransactionBase):
    stock_id: int
    shares: float
    price_per_share: float

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    portfolio_id: Optional[int] = None
    stock_id: Optional[int] = None
    shares: Optional[float] = None
    price_per_share: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Financial Event schemas
class FinancialEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str
    amount_min: float = 0.0
    amount_max: float = 0.0
    probability: float = 0.1

class FinancialEvent(FinancialEventBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Special response schemas
class WeeklySimulation(BaseModel):
    """Results of running one week of financial simulation"""
    gross_income: float
    tax_amount: float
    net_income: float
    student_loan_payment: float
    housing_cost: float
    other_expenses: float
    remaining_amount: float
    events: List[FinancialEvent]
    new_savings_balance: float
    new_student_loan_balance: float

class FinancialSummary(BaseModel):
    """Overall financial summary for dashboard"""
    user: User
    financial_profile: FinancialProfile
    portfolio: Optional[Portfolio] = None
    recent_transactions: List[Transaction]
    net_worth: float
    weekly_cash_flow: float