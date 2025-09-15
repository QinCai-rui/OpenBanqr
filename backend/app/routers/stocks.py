"""
Stock market simulation routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random
from datetime import datetime

from ..database import get_db
from ..models import User, Stock, Portfolio, StockHolding, Transaction
from ..schemas import (
    Stock as StockSchema,
    Portfolio as PortfolioSchema,
    PortfolioWithHoldings,
    StockTransactionCreate,
    Transaction as TransactionSchema
)
from ..auth import get_current_active_user

router = APIRouter()

def simulate_stock_price_change(current_price: float) -> tuple[float, float, float]:
    """Simulate daily stock price change"""
    # Random walk with slight upward bias (realistic market simulation)
    change_percent = random.gauss(0.001, 0.02)  # Mean 0.1% daily growth, 2% volatility
    change_percent = max(-0.15, min(0.15, change_percent))  # Cap at ±15%
    
    new_price = current_price * (1 + change_percent)
    change_amount = new_price - current_price
    
    return new_price, change_amount, change_percent * 100

@router.get("/", response_model=List[StockSchema])
async def list_stocks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all available stocks"""
    return db.query(Stock).all()

@router.get("/{stock_id}", response_model=StockSchema)
async def get_stock(
    stock_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get stock details"""
    stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    return stock

@router.post("/update-prices")
async def update_stock_prices(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Simulate daily stock price updates"""
    stocks = db.query(Stock).all()
    updated_stocks = []
    
    for stock in stocks:
        new_price, change_amount, change_percent = simulate_stock_price_change(stock.current_price)
        
        stock.current_price = round(new_price, 2)
        stock.daily_change = round(change_amount, 2)
        stock.daily_change_percent = round(change_percent, 2)
        stock.last_updated = datetime.utcnow()
        
        updated_stocks.append(stock)
    
    # Update all stock holdings values
    holdings = db.query(StockHolding).all()
    for holding in holdings:
        holding.current_value = holding.shares * holding.stock.current_price
    
    # Update portfolio totals
    portfolios = db.query(Portfolio).all()
    for portfolio in portfolios:
        total_stock_value = sum(holding.current_value for holding in portfolio.holdings)
        portfolio.total_value = portfolio.cash_balance + total_stock_value
    
    db.commit()
    return {"message": f"Updated {len(updated_stocks)} stock prices"}

@router.get("/portfolio/me", response_model=PortfolioWithHoldings)
async def get_my_portfolio(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's portfolio"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers don't have portfolios"
        )
    
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    
    if not portfolio:
        # Create default portfolio
        portfolio = Portfolio(
            user_id=current_user.id,
            name="My Portfolio",
            cash_balance=1000.0
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    
    return portfolio

@router.post("/buy", response_model=TransactionSchema)
async def buy_stock(
    transaction_data: StockTransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Buy stocks"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot trade stocks"
        )
    
    # Get user's portfolio
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # Get stock
    stock = db.query(Stock).filter(Stock.id == transaction_data.stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    # Calculate total cost
    total_cost = transaction_data.shares * transaction_data.price_per_share
    
    # Check if user has enough cash
    if portfolio.cash_balance < total_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    # Update portfolio cash
    portfolio.cash_balance -= total_cost
    portfolio.total_invested += total_cost
    
    # Find or create stock holding
    holding = db.query(StockHolding).filter(
        StockHolding.portfolio_id == portfolio.id,
        StockHolding.stock_id == stock.id
    ).first()
    
    if holding:
        # Update existing holding (average price calculation)
        total_shares = holding.shares + transaction_data.shares
        total_cost_basis = (holding.shares * holding.average_price) + total_cost
        holding.average_price = total_cost_basis / total_shares
        holding.shares = total_shares
    else:
        # Create new holding
        holding = StockHolding(
            portfolio_id=portfolio.id,
            stock_id=stock.id,
            shares=transaction_data.shares,
            average_price=transaction_data.price_per_share
        )
        db.add(holding)
    
    # Update holding current value
    holding.current_value = holding.shares * stock.current_price
    
    # Update portfolio total value
    total_stock_value = sum(h.current_value for h in portfolio.holdings) + holding.current_value
    portfolio.total_value = portfolio.cash_balance + total_stock_value
    
    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        transaction_type="buy",
        amount=-total_cost,
        shares=transaction_data.shares,
        price_per_share=transaction_data.price_per_share,
        description=f"Bought {transaction_data.shares} shares of {stock.symbol}",
        category="investment"
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.post("/sell", response_model=TransactionSchema)
async def sell_stock(
    transaction_data: StockTransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sell stocks"""
    if current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot trade stocks"
        )
    
    # Get user's portfolio
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # Get stock holding
    holding = db.query(StockHolding).filter(
        StockHolding.portfolio_id == portfolio.id,
        StockHolding.stock_id == transaction_data.stock_id
    ).first()
    
    if not holding or holding.shares < transaction_data.shares:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient shares to sell"
        )
    
    # Get stock
    stock = db.query(Stock).filter(Stock.id == transaction_data.stock_id).first()
    
    # Calculate total proceeds
    total_proceeds = transaction_data.shares * transaction_data.price_per_share
    
    # Update portfolio cash
    portfolio.cash_balance += total_proceeds
    
    # Update holding
    holding.shares -= transaction_data.shares
    if holding.shares == 0:
        db.delete(holding)
    else:
        holding.current_value = holding.shares * stock.current_price
    
    # Update portfolio total value
    total_stock_value = sum(h.current_value for h in portfolio.holdings if h != holding)
    if holding.shares > 0:
        total_stock_value += holding.current_value
    portfolio.total_value = portfolio.cash_balance + total_stock_value
    
    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        transaction_type="sell",
        amount=total_proceeds,
        shares=transaction_data.shares,
        price_per_share=transaction_data.price_per_share,
        description=f"Sold {transaction_data.shares} shares of {stock.symbol}",
        category="investment"
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction