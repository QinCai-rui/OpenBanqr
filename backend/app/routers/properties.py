"""
Property management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import math
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Property, UserProperty, Mortgage, MortgagePayment
from ..auth import get_current_active_user

router = APIRouter()

def calculate_mortgage_payment(loan_amount: float, annual_rate: float, years: int) -> float:
    """Calculate monthly mortgage payment using standard formula"""
    if annual_rate == 0:
        return loan_amount / (years * 12)
    
    monthly_rate = annual_rate / 12
    num_payments = years * 12
    
    payment = loan_amount * (monthly_rate * (1 + monthly_rate) ** num_payments) / \
              ((1 + monthly_rate) ** num_payments - 1)
    
    return round(payment, 2)

def calculate_affordability(income: float, debt_payments: float, down_payment: float, 
                          interest_rate: float, term_years: int = 30) -> dict:
    """Calculate home affordability based on debt-to-income ratios"""
    
    # Standard affordability ratios
    front_end_ratio = 0.28  # Housing payment shouldn't exceed 28% of gross income
    back_end_ratio = 0.36   # Total debt payments shouldn't exceed 36% of gross income
    
    monthly_income = income / 12
    max_housing_payment = monthly_income * front_end_ratio
    max_total_debt = monthly_income * back_end_ratio
    max_additional_debt = max_total_debt - debt_payments
    
    # Use the lower of the two ratios
    max_payment = min(max_housing_payment, max_additional_debt)
    
    # Estimate property taxes and insurance (typically 1.5% of home value annually)
    taxes_insurance_rate = 0.015 / 12
    
    # Reverse calculate maximum loan amount
    # payment = loan * (rate * (1+rate)^n) / ((1+rate)^n - 1) + taxes_insurance
    if interest_rate == 0:
        # Special case for 0% interest
        max_loan = max_payment * term_years * 12
    else:
        monthly_rate = interest_rate / 12
        num_payments = term_years * 12
        
        # Approximate taxes and insurance as percentage of payment
        adjusted_payment = max_payment * 0.85  # Assume 15% for taxes/insurance
        
        max_loan = adjusted_payment * ((1 + monthly_rate) ** num_payments - 1) / \
                   (monthly_rate * (1 + monthly_rate) ** num_payments)
    
    max_home_price = max_loan + down_payment
    
    return {
        "max_home_price": round(max_home_price, 2),
        "max_loan_amount": round(max_loan, 2),
        "max_monthly_payment": round(max_payment, 2),
        "recommended_down_payment": round(max_home_price * 0.2, 2),
        "front_end_ratio_used": front_end_ratio,
        "back_end_ratio_used": back_end_ratio,
        "monthly_income": round(monthly_income, 2)
    }

@router.get("/affordability")
async def get_affordability(
    annual_income: float,
    monthly_debt_payments: float = 0,
    down_payment: float = 0,
    interest_rate: float = 0.065,
    term_years: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate home affordability"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access property features"
        )
    
    affordability = calculate_affordability(
        annual_income, monthly_debt_payments, down_payment, interest_rate, term_years
    )
    
    return affordability

@router.get("/mortgage-calculator")
async def mortgage_calculator(
    home_price: float,
    down_payment: float,
    interest_rate: float,
    term_years: int = 30,
    property_tax_rate: float = 0.012,
    insurance_annual: float = 1200,
    hoa_monthly: float = 0,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate mortgage payment breakdown"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access property features"
        )
    
    loan_amount = home_price - down_payment
    monthly_payment = calculate_mortgage_payment(loan_amount, interest_rate, term_years)
    
    # Calculate additional costs
    monthly_property_tax = (home_price * property_tax_rate) / 12
    monthly_insurance = insurance_annual / 12
    
    # PMI calculation (if down payment < 20%)
    pmi_monthly = 0
    if down_payment < (home_price * 0.2):
        pmi_rate = 0.005  # 0.5% annually for PMI
        pmi_monthly = (loan_amount * pmi_rate) / 12
    
    total_monthly = monthly_payment + monthly_property_tax + monthly_insurance + hoa_monthly + pmi_monthly
    
    # Calculate total interest over life of loan
    total_payments = monthly_payment * term_years * 12
    total_interest = total_payments - loan_amount
    
    return {
        "loan_amount": round(loan_amount, 2),
        "monthly_principal_interest": round(monthly_payment, 2),
        "monthly_property_tax": round(monthly_property_tax, 2),
        "monthly_insurance": round(monthly_insurance, 2),
        "monthly_pmi": round(pmi_monthly, 2),
        "monthly_hoa": round(hoa_monthly, 2),
        "total_monthly_payment": round(total_monthly, 2),
        "total_interest": round(total_interest, 2),
        "total_paid": round(total_payments, 2),
        "down_payment_percentage": round((down_payment / home_price) * 100, 2),
        "loan_to_value": round((loan_amount / home_price) * 100, 2)
    }

@router.get("/market-data")
async def get_market_data(
    location: str = "National",
    property_type: str = "single_family",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get real estate market data (simulated)"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access property features"
        )
    
    # Simulated market data - in a real app this would come from MLS or real estate APIs
    import random
    
    base_price = {
        "single_family": 350000,
        "condo": 250000,
        "townhouse": 300000,
        "multi_family": 450000
    }.get(property_type, 350000)
    
    # Add location modifier
    location_multiplier = {
        "National": 1.0,
        "California": 1.8,
        "New York": 1.6,
        "Texas": 0.9,
        "Florida": 1.1,
        "Arizona": 1.0,
        "Colorado": 1.3
    }.get(location, 1.0)
    
    median_price = int(base_price * location_multiplier)
    
    # Market trends (simulated)
    year_over_year = random.uniform(-5, 15)  # -5% to +15% annual change
    month_over_month = random.uniform(-2, 3)  # -2% to +3% monthly change
    
    return {
        "location": location,
        "property_type": property_type,
        "median_home_price": median_price,
        "price_per_sqft": round(median_price / 2000, 2),
        "year_over_year_change": round(year_over_year, 2),
        "month_over_month_change": round(month_over_month, 2),
        "median_days_on_market": random.randint(15, 45),
        "inventory_months": round(random.uniform(1.5, 6.0), 1),
        "average_interest_rate": round(random.uniform(6.0, 7.5), 3),
        "market_temperature": "Hot" if year_over_year > 8 else "Warm" if year_over_year > 3 else "Cool"
    }

@router.get("/listings")
async def get_property_listings(
    min_price: float = 0,
    max_price: float = 1000000,
    bedrooms: int = None,
    property_type: str = None,
    location: str = "National",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get property listings (simulated)"""
    
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot access property features"
        )
    
    # Simulated property listings
    import random
    
    property_types = ["house", "condo", "townhouse"] if not property_type else [property_type]
    
    listings = []
    for i in range(random.randint(10, 25)):
        prop_type = random.choice(property_types)
        price = random.randint(int(min_price), int(max_price)) if max_price > min_price else random.randint(200000, 600000)
        beds = bedrooms if bedrooms else random.randint(2, 5)
        baths = random.choice([1.0, 1.5, 2.0, 2.5, 3.0, 3.5])
        sqft = random.randint(1200, 3500)
        
        listings.append({
            "id": f"listing_{i+1}",
            "address": f"{random.randint(100, 9999)} {random.choice(['Oak', 'Pine', 'Maple', 'Elm', 'Cedar'])} {random.choice(['St', 'Ave', 'Dr', 'Ln', 'Ct'])}",
            "city": random.choice(["Springfield", "Riverside", "Madison", "Georgetown", "Franklin"]),
            "state": random.choice(["CA", "TX", "FL", "NY", "CO"]),
            "zip_code": f"{random.randint(10000, 99999)}",
            "property_type": prop_type,
            "price": price,
            "bedrooms": beds,
            "bathrooms": baths,
            "square_feet": sqft,
            "lot_size": round(random.uniform(0.15, 0.5), 2),
            "year_built": random.randint(1950, 2023),
            "days_on_market": random.randint(1, 120),
            "price_per_sqft": round(price / sqft, 2),
            "estimated_payment": round(calculate_mortgage_payment(price * 0.8, 0.065, 30), 2),
            "description": f"Beautiful {beds} bedroom, {baths} bathroom {prop_type} in {location}. Features include updated kitchen, hardwood floors, and spacious backyard."
        })
    
    return sorted(listings, key=lambda x: x["price"])