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

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, nullable=False)
    property_type = Column(String, nullable=False)  # house, apartment, condo, land
    bedrooms = Column(Integer)
    bathrooms = Column(Float)
    square_feet = Column(Integer)
    lot_size = Column(Float)
    year_built = Column(Integer)
    
    # Financial details
    purchase_price = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    annual_appreciation_rate = Column(Float, default=0.03)  # 3% default
    
    # Property costs
    property_tax_rate = Column(Float, default=0.012)  # 1.2% annual
    insurance_annual = Column(Float, default=1200.0)
    hoa_monthly = Column(Float, default=0.0)
    maintenance_annual_percent = Column(Float, default=0.01)  # 1% of value
    
    # Rental details (if investment property)
    is_rental = Column(Boolean, default=False)
    monthly_rent = Column(Float, default=0.0)
    vacancy_rate = Column(Float, default=0.05)  # 5% vacancy
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    mortgages = relationship("Mortgage", back_populates="property")
    user_properties = relationship("UserProperty", back_populates="property")

class UserProperty(Base):
    __tablename__ = "user_properties"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    ownership_type = Column(String, nullable=False)  # primary_residence, investment, vacation
    ownership_percentage = Column(Float, default=100.0)
    purchase_date = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    user = relationship("User")
    property = relationship("Property", back_populates="user_properties")
    mortgages = relationship("Mortgage", back_populates="user_property")

class Mortgage(Base):
    __tablename__ = "mortgages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_property_id = Column(Integer, ForeignKey("user_properties.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    
    # Loan details
    loan_amount = Column(Float, nullable=False)
    down_payment = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    loan_term_years = Column(Integer, nullable=False)
    loan_type = Column(String, nullable=False)  # conventional, fha, va, usda
    
    # Current status
    remaining_balance = Column(Float, nullable=False)
    monthly_payment = Column(Float, nullable=False)
    payments_made = Column(Integer, default=0)
    
    # PMI
    pmi_monthly = Column(Float, default=0.0)
    pmi_removal_threshold = Column(Float, default=0.8)  # Remove at 80% LTV
    
    start_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_property = relationship("UserProperty", back_populates="mortgages")
    property = relationship("Property", back_populates="mortgages")
    payments = relationship("MortgagePayment", back_populates="mortgage")

class MortgagePayment(Base):
    __tablename__ = "mortgage_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    mortgage_id = Column(Integer, ForeignKey("mortgages.id"), nullable=False)
    
    payment_date = Column(DateTime(timezone=True), nullable=False)
    payment_amount = Column(Float, nullable=False)
    principal_amount = Column(Float, nullable=False)
    interest_amount = Column(Float, nullable=False)
    escrow_amount = Column(Float, default=0.0)
    pmi_amount = Column(Float, default=0.0)
    
    remaining_balance_after = Column(Float, nullable=False)
    
    # Relationships
    mortgage = relationship("Mortgage", back_populates="payments")

class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    loan_type = Column(String, nullable=False)  # personal, auto, student, credit_card
    lender_name = Column(String, nullable=False)
    
    # Loan terms
    original_amount = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    term_months = Column(Integer)  # null for credit cards
    minimum_payment = Column(Float, nullable=False)
    
    # Credit card specific
    credit_limit = Column(Float)  # for credit cards
    available_credit = Column(Float)  # for credit cards
    
    # Status
    status = Column(String, default="active")  # active, paid_off, defaulted
    payment_due_date = Column(Integer)  # day of month
    
    # Tracking
    payments_made = Column(Integer, default=0)
    total_interest_paid = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    payments = relationship("LoanPayment", back_populates="loan")

class LoanPayment(Base):
    __tablename__ = "loan_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    
    payment_date = Column(DateTime(timezone=True), nullable=False)
    payment_amount = Column(Float, nullable=False)
    principal_amount = Column(Float, nullable=False)
    interest_amount = Column(Float, nullable=False)
    fees = Column(Float, default=0.0)
    
    remaining_balance_after = Column(Float, nullable=False)
    
    # Relationships
    loan = relationship("Loan", back_populates="payments")

class CreditScore(Base):
    __tablename__ = "credit_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    score = Column(Integer, nullable=False)
    score_range = Column(String, default="FICO")  # FICO, VantageScore
    
    # Factors affecting score
    payment_history_score = Column(Integer)  # 35% of score
    credit_utilization = Column(Float)  # 30% of score
    length_of_history_months = Column(Integer)  # 15% of score
    credit_mix_score = Column(Integer)  # 10% of score
    new_credit_score = Column(Integer)  # 10% of score
    
    # Additional details
    total_accounts = Column(Integer, default=0)
    open_accounts = Column(Integer, default=0)
    derogatory_marks = Column(Integer, default=0)
    hard_inquiries = Column(Integer, default=0)
    
    score_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    account_type = Column(String, nullable=False)  # checking, savings, money_market, cd
    account_name = Column(String, nullable=False)
    bank_name = Column(String, nullable=False)
    
    # Account details
    current_balance = Column(Float, default=0.0)
    available_balance = Column(Float, default=0.0)
    interest_rate = Column(Float, default=0.0)
    minimum_balance = Column(Float, default=0.0)
    
    # Fees
    monthly_fee = Column(Float, default=0.0)
    overdraft_fee = Column(Float, default=35.0)
    atm_fee = Column(Float, default=3.0)
    
    # Status
    is_primary = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    transactions = relationship("BankTransaction", back_populates="account")

class BankTransaction(Base):
    __tablename__ = "bank_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False)
    
    transaction_type = Column(String, nullable=False)  # deposit, withdrawal, transfer, fee, interest
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String)  # salary, bills, groceries, entertainment, etc.
    
    # Transaction details
    merchant = Column(String)
    location = Column(String)
    reference_number = Column(String)
    
    # Status
    status = Column(String, default="posted")  # pending, posted, failed
    balance_after = Column(Float, nullable=False)
    
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    account = relationship("BankAccount", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    name = Column(String, nullable=False)
    description = Column(Text)
    
    # Budget period
    budget_type = Column(String, default="monthly")  # weekly, monthly, annual
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    
    # Totals
    total_income = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    total_savings = Column(Float, default=0.0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    categories = relationship("BudgetCategory", back_populates="budget")

class BudgetCategory(Base):
    __tablename__ = "budget_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    
    category_name = Column(String, nullable=False)
    category_type = Column(String, nullable=False)  # income, expense, savings
    budgeted_amount = Column(Float, nullable=False)
    actual_amount = Column(Float, default=0.0)
    
    # Optional limits
    warning_threshold = Column(Float)  # Alert when spending reaches this
    
    # Relationships
    budget = relationship("Budget", back_populates="categories")