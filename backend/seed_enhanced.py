"""
Seed database with enhanced realistic data
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, create_db_and_tables
from app.models import Career, Stock, FinancialEvent, Property
from datetime import datetime

def seed_enhanced_data(db: Session):
    """Seed enhanced realistic data"""
    
    # Enhanced career data
    enhanced_careers = [
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
    
    for career_data in enhanced_careers:
        existing = db.query(Career).filter(Career.title == career_data["title"]).first()
        if not existing:
            career = Career(**career_data)
            db.add(career)
    
    # Enhanced stock data
    enhanced_stocks = [
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
            "symbol": "DIS",
            "company_name": "Walt Disney Co.",
            "current_price": 95.25,
            "market_cap": 175000000000,
            "dividend_yield": 0.0
        }
    ]
    
    for stock_data in enhanced_stocks:
        existing = db.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
        if not existing:
            stock = Stock(**stock_data)
            db.add(stock)
    
    # Sample properties
    sample_properties = [
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
        }
    ]
    
    for property_data in sample_properties:
        existing = db.query(Property).filter(Property.address == property_data["address"]).first()
        if not existing:
            property_obj = Property(**property_data)
            db.add(property_obj)
    
    # Enhanced financial events
    enhanced_events = [
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
            "title": "Investment Dividend",
            "description": "Quarterly dividend payment",
            "event_type": "bonus",
            "amount_min": 50.0,
            "amount_max": 500.0,
            "probability": 0.25
        }
    ]
    
    for event_data in enhanced_events:
        existing = db.query(FinancialEvent).filter(FinancialEvent.title == event_data["title"]).first()
        if not existing:
            event = FinancialEvent(**event_data)
            db.add(event)
    
    db.commit()
    print("✓ Enhanced data seeded successfully")

def main():
    """Run enhanced seeding"""
    create_db_and_tables()
    
    db = SessionLocal()
    try:
        print("Seeding enhanced realistic data...")
        seed_enhanced_data(db)
        print("Enhanced seeding completed!")
        
    except Exception as e:
        print(f"Error during enhanced seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()