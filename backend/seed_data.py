"""
Seed database with initial data
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, create_db_and_tables
from app.models import Career, Stock, FinancialEvent, Property, BankAccount, Loan
from app.auth import get_password_hash
from datetime import datetime

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
        },
        {
            "title": "Data Scientist",
            "description": "Analyze complex data to drive business decisions",
            "education_required": "Master's Degree",
            "requires_student_loan": True,
            "student_loan_amount": 45000.0,
            "base_salary_min": 85000.0,
            "base_salary_max": 120000.0,
            "industry": "Technology"
        },
        {
            "title": "Marketing Manager",
            "description": "Plan and execute marketing campaigns",
            "education_required": "Bachelor's Degree",
            "requires_student_loan": True,
            "student_loan_amount": 30000.0,
            "base_salary_min": 55000.0,
            "base_salary_max": 85000.0,
            "industry": "Marketing"
        },
        {
            "title": "Plumber",
            "description": "Install and repair plumbing systems",
            "education_required": "Trade Certificate",
            "requires_student_loan": False,
            "student_loan_amount": 0.0,
            "base_salary_min": 40000.0,
            "base_salary_max": 70000.0,
            "industry": "Trades"
        },
        {
            "title": "Financial Advisor",
            "description": "Provide financial planning and investment advice",
            "education_required": "Bachelor's Degree + Certification",
            "requires_student_loan": True,
            "student_loan_amount": 35000.0,
            "base_salary_min": 50000.0,
            "base_salary_max": 100000.0,
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
            "current_price": 142.30,
            "market_cap": 1800000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "AMZN",
            "company_name": "Amazon.com Inc.",
            "current_price": 152.75,
            "market_cap": 1600000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "TSLA",
            "company_name": "Tesla Inc.",
            "current_price": 248.50,
            "market_cap": 780000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "NVDA",
            "company_name": "NVIDIA Corporation",
            "current_price": 875.30,
            "market_cap": 2200000000000,
            "dividend_yield": 0.09
        },
        {
            "symbol": "META",
            "company_name": "Meta Platforms Inc.",
            "current_price": 485.20,
            "market_cap": 1200000000000,
            "dividend_yield": 0.37
        },
        {
            "symbol": "BRK.B",
            "company_name": "Berkshire Hathaway Inc.",
            "current_price": 432.15,
            "market_cap": 940000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "JPM",
            "company_name": "JPMorgan Chase & Co.",
            "current_price": 198.75,
            "market_cap": 580000000000,
            "dividend_yield": 2.15
        },
        {
            "symbol": "V",
            "company_name": "Visa Inc.",
            "current_price": 285.40,
            "market_cap": 600000000000,
            "dividend_yield": 0.69
        },
        {
            "symbol": "JNJ",
            "company_name": "Johnson & Johnson",
            "current_price": 155.80,
            "market_cap": 410000000000,
            "dividend_yield": 3.02
        },
        {
            "symbol": "WMT",
            "company_name": "Walmart Inc.",
            "current_price": 168.25,
            "market_cap": 460000000000,
            "dividend_yield": 1.02
        },
        {
            "symbol": "PG",
            "company_name": "Procter & Gamble Co.",
            "current_price": 162.30,
            "market_cap": 385000000000,
            "dividend_yield": 2.35
        },
        {
            "symbol": "UNH",
            "company_name": "UnitedHealth Group Inc.",
            "current_price": 542.80,
            "market_cap": 510000000000,
            "dividend_yield": 1.25
        },
        {
            "symbol": "HD",
            "company_name": "Home Depot Inc.",
            "current_price": 385.60,
            "market_cap": 390000000000,
            "dividend_yield": 2.38
        },
        {
            "symbol": "MA",
            "company_name": "Mastercard Inc.",
            "current_price": 462.15,
            "market_cap": 440000000000,
            "dividend_yield": 0.52
        },
        {
            "symbol": "DIS",
            "company_name": "Walt Disney Co.",
            "current_price": 95.25,
            "market_cap": 175000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "NFLX",
            "company_name": "Netflix Inc.",
            "current_price": 485.75,
            "market_cap": 210000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "CRM",
            "company_name": "Salesforce Inc.",
            "current_price": 275.40,
            "market_cap": 270000000000,
            "dividend_yield": 0.0
        },
        {
            "symbol": "ADBE",
            "company_name": "Adobe Inc.",
            "current_price": 548.20,
            "market_cap": 250000000000,
            "dividend_yield": 0.0
        }
    ]
    
    for stock_data in stocks:
        existing = db.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
        if not existing:
            stock = Stock(**stock_data)
            db.add(stock)
    
    db.commit()

def seed_properties(db: Session):
    """Seed sample property data"""
    properties = [
        {
            "address": "123 Elm Street",
            "property_type": "house",
            "bedrooms": 3,
            "bathrooms": 2.0,
            "square_feet": 1850,
            "lot_size": 0.25,
            "year_built": 2015,
            "purchase_price": 425000.0,
            "current_value": 465000.0,
            "annual_appreciation_rate": 0.04,
            "property_tax_rate": 0.012,
            "insurance_annual": 1500.0,
            "hoa_monthly": 0.0,
            "maintenance_annual_percent": 0.01,
            "is_rental": False
        },
        {
            "address": "456 Oak Avenue",
            "property_type": "condo",
            "bedrooms": 2,
            "bathrooms": 2.0,
            "square_feet": 1200,
            "lot_size": 0.0,
            "year_built": 2018,
            "purchase_price": 295000.0,
            "current_value": 320000.0,
            "annual_appreciation_rate": 0.035,
            "property_tax_rate": 0.015,
            "insurance_annual": 800.0,
            "hoa_monthly": 250.0,
            "maintenance_annual_percent": 0.005,
            "is_rental": False
        },
        {
            "address": "789 Pine Road",
            "property_type": "house",
            "bedrooms": 4,
            "bathrooms": 3.5,
            "square_feet": 2800,
            "lot_size": 0.5,
            "year_built": 2010,
            "purchase_price": 650000.0,
            "current_value": 725000.0,
            "annual_appreciation_rate": 0.03,
            "property_tax_rate": 0.018,
            "insurance_annual": 2200.0,
            "hoa_monthly": 0.0,
            "maintenance_annual_percent": 0.015,
            "is_rental": True,
            "monthly_rent": 3500.0,
            "vacancy_rate": 0.05
        },
        {
            "address": "321 Maple Drive",
            "property_type": "townhouse",
            "bedrooms": 3,
            "bathrooms": 2.5,
            "square_feet": 1650,
            "lot_size": 0.1,
            "year_built": 2020,
            "purchase_price": 385000.0,
            "current_value": 395000.0,
            "annual_appreciation_rate": 0.025,
            "property_tax_rate": 0.014,
            "insurance_annual": 1100.0,
            "hoa_monthly": 180.0,
            "maintenance_annual_percent": 0.008,
            "is_rental": False
        },
        {
            "address": "654 Cedar Lane",
            "property_type": "house",
            "bedrooms": 5,
            "bathrooms": 4.0,
            "square_feet": 3500,
            "lot_size": 0.75,
            "year_built": 2005,
            "purchase_price": 850000.0,
            "current_value": 950000.0,
            "annual_appreciation_rate": 0.04,
            "property_tax_rate": 0.02,
            "insurance_annual": 3000.0,
            "hoa_monthly": 0.0,
            "maintenance_annual_percent": 0.02,
            "is_rental": False
        }
    ]
    
    for property_data in properties:
        existing = db.query(Property).filter(Property.address == property_data["address"]).first()
        if not existing:
            property_obj = Property(**property_data)
            db.add(property_obj)
    
    db.commit()

def seed_financial_events(db: Session):
    """Seed financial events for simulation"""
    events = [
        {
            "title": "Performance Bonus",
            "description": "Quarterly performance bonus from employer",
            "event_type": "bonus",
            "amount_min": 500.0,
            "amount_max": 2000.0,
            "probability": 0.15
        },
        {
            "title": "Car Repair",
            "description": "Unexpected car maintenance or repair costs",
            "event_type": "emergency",
            "amount_min": 200.0,
            "amount_max": 1500.0,
            "probability": 0.08
        },
        {
            "title": "Medical Bill",
            "description": "Unexpected medical or dental expenses",
            "event_type": "emergency", 
            "amount_min": 150.0,
            "amount_max": 800.0,
            "probability": 0.05
        },
        {
            "title": "Tax Refund",
            "description": "Annual tax refund",
            "event_type": "bonus",
            "amount_min": 800.0,
            "amount_max": 3000.0,
            "probability": 0.02
        },
        {
            "title": "Freelance Income",
            "description": "Additional income from side work",
            "event_type": "opportunity",
            "amount_min": 200.0,
            "amount_max": 1000.0,
            "probability": 0.12
        },
        {
            "title": "Home Repair",
            "description": "Unexpected home maintenance costs",
            "event_type": "emergency",
            "amount_min": 300.0,
            "amount_max": 2500.0,
            "probability": 0.06
        },
        {
            "title": "Investment Dividend",
            "description": "Quarterly dividend payment",
            "event_type": "bonus",
            "amount_min": 50.0,
            "amount_max": 500.0,
            "probability": 0.25
        },
        {
            "title": "Traffic Ticket",
            "description": "Traffic violation fine",
            "event_type": "fine",
            "amount_min": 75.0,
            "amount_max": 300.0,
            "probability": 0.03
        },
        {
            "title": "Professional Development",
            "description": "Training or certification course",
            "event_type": "opportunity",
            "amount_min": 200.0,
            "amount_max": 1200.0,
            "probability": 0.07
        },
        {
            "title": "Gift or Inheritance",
            "description": "Unexpected monetary gift",
            "event_type": "bonus",
            "amount_min": 500.0,
            "amount_max": 5000.0,
            "probability": 0.02
        }
    ]
    
    for event_data in events:
        existing = db.query(FinancialEvent).filter(FinancialEvent.title == event_data["title"]).first()
        if not existing:
            event = FinancialEvent(**event_data)
            db.add(event)
    
    db.commit()

def main():
    """Main seeding function"""
    create_db_and_tables()
    
    db = SessionLocal()
    try:
        print("Seeding careers...")
        seed_careers(db)
        print("✓ Careers seeded")
        
        print("Seeding stocks...")
        seed_stocks(db)
        print("✓ Stocks seeded")
        
        print("Seeding properties...")
        seed_properties(db)
        print("✓ Properties seeded")
        
        print("Seeding financial events...")
        seed_financial_events(db)
        print("✓ Financial events seeded")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
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