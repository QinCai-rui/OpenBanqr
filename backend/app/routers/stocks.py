"""
Stock market routes with real-time data
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict
import yfinance as yf
from datetime import datetime
import logging

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
logger = logging.getLogger(__name__)

# Popular stocks for the simulation
STOCK_SYMBOLS = [
    "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "BRK-B", 
    "V", "UNH", "JNJ", "WMT", "JPM", "PG", "MA", "HD"
]

async def fetch_real_stock_data(symbol: str) -> Dict:
    """Fetch real-time stock data from Yahoo Finance"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="2d")
        
        if hist.empty:
            return None
            
        current_price = hist['Close'].iloc[-1]
        previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
        
        daily_change = current_price - previous_close
        daily_change_percent = (daily_change / previous_close) * 100 if previous_close != 0 else 0
        
        return {
            "symbol": symbol,
            "company_name": info.get("longName", f"{symbol} Corp"),
            "current_price": round(float(current_price), 2),
            "daily_change": round(float(daily_change), 2),
            "daily_change_percent": round(float(daily_change_percent), 2),
            "market_cap": info.get("marketCap"),
            "dividend_yield": info.get("dividendYield", 0) * 100 if info.get("dividendYield") else 0
        }
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {e}")
        return None

@router.post("/initialize")
async def initialize_stocks(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Initialize stock database with real stock data (admin/teacher only)"""
    if not current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Only teachers can initialize stocks")
    
    # Clear existing stocks if requested
    existing_count = db.query(Stock).count()
    if existing_count == 0:
        for symbol in STOCK_SYMBOLS:
            stock_data = await fetch_real_stock_data(symbol)
            if stock_data:
                stock = Stock(
                    symbol=stock_data["symbol"],
                    company_name=stock_data["company_name"],
                    current_price=stock_data["current_price"],
                    daily_change=stock_data["daily_change"],
                    daily_change_percent=stock_data["daily_change_percent"],
                    market_cap=stock_data["market_cap"],
                    dividend_yield=stock_data["dividend_yield"]
                )
                db.add(stock)
        
        db.commit()
        return {"message": f"Initialized {len(STOCK_SYMBOLS)} stocks with real data"}
    else:
        background_tasks.add_task(update_all_stock_prices_background, db)
        return {"message": f"Updated {existing_count} existing stocks"}

async def update_all_stock_prices_background(db: Session):
    """Background task to update all stock prices"""
    stocks = db.query(Stock).all()
    for stock in stocks:
        stock_data = await fetch_real_stock_data(stock.symbol)
        if stock_data:
            stock.current_price = stock_data["current_price"]
            stock.daily_change = stock_data["daily_change"]
            stock.daily_change_percent = stock_data["daily_change_percent"]
            stock.last_updated = datetime.utcnow()
    
    # Update holdings and portfolios
    holdings = db.query(StockHolding).all()
    for holding in holdings:
        holding.current_value = holding.shares * holding.stock.current_price
    
    portfolios = db.query(Portfolio).all()
    for portfolio in portfolios:
        total_stock_value = sum(holding.current_value for holding in portfolio.holdings)
        portfolio.total_value = portfolio.cash_balance + total_stock_value
    
    db.commit()

@router.get("/", response_model=List[StockSchema])
async def list_stocks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all available stocks with real-time data"""
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
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update stock prices with real-time data"""
    background_tasks.add_task(update_all_stock_prices_background, db)
    stocks_count = db.query(Stock).count()
    return {"message": f"Updating {stocks_count} stock prices in background"}

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