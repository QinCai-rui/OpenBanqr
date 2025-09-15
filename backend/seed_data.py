"""
Seed database with initial data
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, create_db_and_tables
from app.models import Career, Stock, FinancialEvent
from app.auth import get_password_hash

def seed_careers(db: Session):
    """Seed initial career data"""
    careers = [
        {
            "title": "Software Engineer",
            "description": "Develop and maintain software applications",
            "education_required": "Bachelor's Degree",
            "requires_student_loan": True,
            "student_loan_amount": 35000.0,
            "base_salary_min": 65000.0,
            "base_salary_max": 95000.0,
            "industry": "Technology"
        },
        {
            "title": "Electrician",
            "description": "Install and maintain electrical systems",
            "education_required": "Trade Certificate",
            "requires_student_loan": False,
            "student_loan_amount": 0.0,
            "base_salary_min": 45000.0,
            "base_salary_max": 75000.0,
            "industry": "Trades"
        },
        {
            "title": "Registered Nurse",
            "description": "Provide healthcare services and patient care",
            "education_required": "Bachelor's Degree",
            "requires_student_loan": True,
            "student_loan_amount": 30000.0,
            "base_salary_min": 55000.0,
            "base_salary_max": 75000.0,
            "industry": "Healthcare"
        },
        {
            "title": "Teacher",
            "description": "Educate students in various subjects",
            "education_required": "Bachelor's Degree + Teaching Qualification",
            "requires_student_loan": True,
            "student_loan_amount": 32000.0,
            "base_salary_min": 48000.0,
            "base_salary_max": 78000.0,
            "industry": "Education"
        },
        {
            "title": "Retail Assistant",
            "description": "Customer service and sales in retail environment",
            "education_required": "High School",
            "requires_student_loan": False,
            "student_loan_amount": 0.0,
            "base_salary_min": 35000.0,
            "base_salary_max": 45000.0,
            "industry": "Retail"
        },
        {
            "title": "Accountant",
            "description": "Manage financial records and tax compliance",
            "education_required": "Bachelor's Degree",
            "requires_student_loan": True,
            "student_loan_amount": 28000.0,
            "base_salary_min": 50000.0,
            "base_salary_max": 80000.0,
            "industry": "Finance"
        }
    ]
    
    for career_data in careers:
        existing = db.query(Career).filter(Career.title == career_data["title"]).first()
        if not existing:
            career = Career(**career_data)
            db.add(career)
    
    db.commit()

def seed_stocks(db: Session):
    """Seed initial stock data"""
    stocks = [
        {
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "current_price": 175.50,
            "market_cap": 2800000000000,
            "dividend_yield": 0.52
        },
        {
            "symbol": "MSFT",
            "company_name": "Microsoft Corporation",
            "current_price": 335.20,
            "market_cap": 2500000000000,
            "dividend_yield": 0.73
        },
        {
            "symbol": "GOOGL",
            "company_name": "Alphabet Inc.",
            "current_price": 125.30,
            "market_cap": 1600000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "AMZN",
            "company_name": "Amazon.com Inc.",
            "current_price": 142.80,
            "market_cap": 1500000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "TSLA",
            "company_name": "Tesla Inc.",
            "current_price": 238.50,
            "market_cap": 800000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "NVDA",
            "company_name": "NVIDIA Corporation",
            "current_price": 445.20,
            "market_cap": 1100000000000,
            "dividend_yield": 0.13
        }
    ]
    
    for stock_data in stocks:
        existing = db.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
        if not existing:
            stock = Stock(**stock_data)
            db.add(stock)
    
    db.commit()

def seed_financial_events(db: Session):
    """Seed financial events"""
    events = [
        {
            "title": "Performance Bonus",
            "description": "Great work this quarter! Here's a bonus.",
            "event_type": "bonus",
            "amount_min": 200.0,
            "amount_max": 1000.0,
            "probability": 0.05
        },
        {
            "title": "Car Repair",
            "description": "Your car needs unexpected repairs.",
            "event_type": "emergency",
            "amount_min": 300.0,
            "amount_max": 1500.0,
            "probability": 0.03
        },
        {
            "title": "Medical Bill",
            "description": "Unexpected medical expense.",
            "event_type": "emergency",
            "amount_min": 150.0,
            "amount_max": 800.0,
            "probability": 0.02
        },
        {
            "title": "Tax Refund",
            "description": "You received a tax refund!",
            "event_type": "bonus",
            "amount_min": 400.0,
            "amount_max": 1200.0,
            "probability": 0.15
        },
        {
            "title": "Freelance Work",
            "description": "Extra income from side projects.",
            "event_type": "opportunity",
            "amount_min": 100.0,
            "amount_max": 600.0,
            "probability": 0.08
        },
        {
            "title": "Parking Fine",
            "description": "You got a parking ticket.",
            "event_type": "fine",
            "amount_min": 50.0,
            "amount_max": 200.0,
            "probability": 0.04
        }
    ]
    
    for event_data in events:
        existing = db.query(FinancialEvent).filter(FinancialEvent.title == event_data["title"]).first()
        if not existing:
            event = FinancialEvent(**event_data)
            db.add(event)
    
    db.commit()

def main():
    """Run all seed functions"""
    create_db_and_tables()
    db = SessionLocal()
    
    print("Seeding careers...")
    seed_careers(db)
    
    print("Seeding stocks...")
    seed_stocks(db)
    
    print("Seeding financial events...")
    seed_financial_events(db)
    
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    main()