"""
Database models for OpenBanqr
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Association table for classroom membership
classroom_members = Table(
    'classroom_members',
    Base.metadata,
    Column('classroom_id', Integer, ForeignKey('classrooms.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_teacher = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owned_classrooms = relationship("Classroom", back_populates="teacher")
    classrooms = relationship("Classroom", secondary=classroom_members, back_populates="students")
    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False)
    portfolios = relationship("Portfolio", back_populates="user")

class Classroom(Base):
    __tablename__ = "classrooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    invite_code = Column(String, unique=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    teacher = relationship("User", back_populates="owned_classrooms")
    students = relationship("User", secondary=classroom_members, back_populates="classrooms")

class Career(Base):
    __tablename__ = "careers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    education_required = Column(String)  # High School, Diploma, Bachelor's, etc.
    requires_student_loan = Column(Boolean, default=False)
    student_loan_amount = Column(Float, default=0.0)
    base_salary_min = Column(Float, nullable=False)
    base_salary_max = Column(Float, nullable=False)
    industry = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    financial_profiles = relationship("FinancialProfile", back_populates="career")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    career_id = Column(Integer, ForeignKey("careers.id"))
    
    # Current financial status
    current_salary = Column(Float, default=0.0)
    weekly_income = Column(Float, default=0.0)
    net_weekly_income = Column(Float, default=0.0)
    
    # Loans and debts
    student_loan_balance = Column(Float, default=0.0)
    student_loan_weekly_payment = Column(Float, default=0.0)
    
    # Savings and assets
    savings_balance = Column(Float, default=0.0)
    emergency_fund = Column(Float, default=0.0)
    
    # Housing
    housing_type = Column(String, default="renting")  # renting, mortgage, owned
    housing_weekly_cost = Column(Float, default=0.0)
    property_value = Column(Float, default=0.0)
    
    # Budgeting
    weekly_expenses = Column(Float, default=0.0)
    
    # Tracking
    weeks_played = Column(Integer, default=0)
    total_tax_paid = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="financial_profile")
    career = relationship("Career", back_populates="financial_profiles")

class Stock(Base):
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    current_price = Column(Float, nullable=False)
    daily_change = Column(Float, default=0.0)
    daily_change_percent = Column(Float, default=0.0)
    market_cap = Column(Float)
    dividend_yield = Column(Float, default=0.0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    holdings = relationship("StockHolding", back_populates="stock")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, default="My Portfolio")
    total_value = Column(Float, default=0.0)
    total_invested = Column(Float, default=0.0)
    cash_balance = Column(Float, default=1000.0)  # Starting cash
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="portfolios")
    holdings = relationship("StockHolding", back_populates="portfolio")

class StockHolding(Base):
    __tablename__ = "stock_holdings"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    
    shares = Column(Float, nullable=False)
    average_price = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")
    stock = relationship("Stock", back_populates="holdings")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    
    transaction_type = Column(String, nullable=False)  # buy, sell, dividend, salary, expense, etc.
    amount = Column(Float, nullable=False)
    description = Column(String)
    category = Column(String)  # salary, tax, housing, food, entertainment, investment, etc.
    
    # For stock transactions
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    shares = Column(Float)
    price_per_share = Column(Float)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FinancialEvent(Base):
    __tablename__ = "financial_events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_type = Column(String, nullable=False)  # bonus, fine, emergency, opportunity
    amount_min = Column(Float, default=0.0)
    amount_max = Column(Float, default=0.0)
    probability = Column(Float, default=0.1)  # Chance of happening each week
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())