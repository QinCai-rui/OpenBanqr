import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material'
import { TrendingUp, TrendingDown, Refresh } from '@mui/icons-material'
import { stockService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const PortfolioPage = () => {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [stocks, setStocks] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [openTrade, setOpenTrade] = useState(false)
  const [tradeType, setTradeType] = useState('buy')
  const [tradeForm, setTradeForm] = useState({ shares: '', price: '' })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    if (!user?.is_teacher) {
      loadData()
      // Auto-refresh every 30 seconds
      const interval = setInterval(refreshPrices, 30000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      const [portfolioData, stocksData] = await Promise.all([
        stockService.getPortfolio(),
        stockService.getStocks(),
      ])
      setPortfolio(portfolioData)
      setStocks(stocksData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPrices = async () => {
    setUpdating(true)
    try {
      await stockService.updatePrices()
      await loadData()
    } catch (error) {
      console.error('Failed to update prices:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleTrade = async () => {
    if (!selectedStock) return

    const tradeData = {
      stock_id: selectedStock.id,
      shares: parseFloat(tradeForm.shares),
      price_per_share: parseFloat(tradeForm.price),
      transaction_type: tradeType,
      amount: parseFloat(tradeForm.shares) * parseFloat(tradeForm.price),
      description: `${tradeType} ${tradeForm.shares} shares of ${selectedStock.symbol}`,
      category: 'investment'
    }

    try {
      if (tradeType === 'buy') {
        await stockService.buyStock(tradeData)
      } else {
        await stockService.sellStock(tradeData)
      }
      
      setOpenTrade(false)
      setTradeForm({ shares: '', price: '' })
      await loadData()
    } catch (error) {
      console.error('Trade failed:', error)
    }
  }

  const openTradeDialog = (stock, type) => {
    setSelectedStock(stock)
    setTradeType(type)
    setTradeForm({ shares: '', price: stock.current_price.toString() })
    setOpenTrade(true)
  }

  const calculateTradeValue = () => {
    if (!tradeForm.shares || !tradeForm.price) return 0
    return parseFloat(tradeForm.shares) * parseFloat(tradeForm.price)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  if (user?.is_teacher) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Portfolio
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Teachers can view the stock market but cannot trade.
          Teachers don't have investment portfolios. This section is for students to practice stock trading.
        </Typography>
      </Container>
    )
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Investment Portfolio
        </Typography>
        <Box>
          {lastUpdated && (
            <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <IconButton onClick={refreshPrices} disabled={updating}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {updating && <LinearProgress sx={{ mb: 2 }} />}

      <Alert severity="info" sx={{ mb: 3 }}>
        📈 <strong>Real-time stock data!</strong> Stock prices are now fetched from live market data. 
        Prices update automatically every 30 seconds or click refresh.
      </Alert>

      {/* Portfolio Summary */}
      {portfolio && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Value
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(portfolio.total_value || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Cash Balance
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(portfolio.cash_balance || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Total Invested
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(portfolio.total_invested || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Holdings
                </Typography>
                <Typography variant="h4">
                  {portfolio.holdings?.length || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Stocks owned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Current Holdings */}
      {portfolio?.holdings && portfolio.holdings.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Current Holdings
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Avg Price</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Market Value</TableCell>
                <TableCell align="right">Gain/Loss</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.holdings.map((holding) => {
                const gainLoss = (holding.stock.current_price - holding.average_price) * holding.shares
                const gainLossPercent = ((holding.stock.current_price - holding.average_price) / holding.average_price) * 100
                
                return (
                  <TableRow key={holding.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {holding.stock.symbol}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {holding.stock.company_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{holding.shares}</TableCell>
                    <TableCell align="right">{formatCurrency(holding.average_price)}</TableCell>
                    <TableCell align="right">{formatCurrency(holding.stock.current_price)}</TableCell>
                    <TableCell align="right">{formatCurrency(holding.current_value)}</TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography 
                          color={gainLoss >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {formatCurrency(gainLoss)}
                        </Typography>
                        <Typography 
                          variant="body2"
                          color={gainLoss >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatPercentage(gainLossPercent)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => openTradeDialog(holding.stock, 'sell')}
                      >
                        Sell
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Available Stocks */}
      <Typography variant="h5" gutterBottom>
        Stock Market - Real-time Prices
      </Typography>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Daily Change</TableCell>
            <TableCell align="right">Dividend Yield</TableCell>
            <TableCell align="right">Market Cap</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {stock.symbol}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stock.company_name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">
                  {formatCurrency(stock.current_price)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  {stock.daily_change >= 0 ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                  <Box sx={{ ml: 1 }}>
                    <Typography
                      color={stock.daily_change >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatCurrency(stock.daily_change)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={stock.daily_change >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatPercentage(stock.daily_change_percent)}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">{stock.dividend_yield.toFixed(2)}%</TableCell>
              <TableCell align="right">
                {stock.market_cap ? `$${(stock.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => openTradeDialog(stock, 'buy')}
                >
                  Buy
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Trade Dialog */}
      <Dialog open={openTrade} onClose={() => setOpenTrade(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedStock?.symbol}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Current Price: {selectedStock && formatCurrency(selectedStock.current_price)}
            </Typography>
            {portfolio && tradeType === 'buy' && (
              <Typography variant="body2" color="textSecondary">
                Available Cash: {formatCurrency(portfolio.cash_balance)}
              </Typography>
            )}
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Number of Shares"
            type="number"
            fullWidth
            variant="outlined"
            value={tradeForm.shares}
            onChange={(e) => setTradeForm({ ...tradeForm, shares: e.target.value })}
            inputProps={{ min: "0.01", step: "0.01" }}
          />
          <TextField
            margin="dense"
            label="Price per Share"
            type="number"
            fullWidth
            variant="outlined"
            value={tradeForm.price}
            onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
            inputProps={{ min: "0.01", step: "0.01" }}
          />
          
          {tradeForm.shares && tradeForm.price && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6">
                Total Transaction: {formatCurrency(calculateTradeValue())}
              </Typography>
              {tradeType === 'buy' && portfolio && calculateTradeValue() > portfolio.cash_balance && (
                <Typography variant="body2" color="error">
                  Insufficient funds!
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrade(false)}>Cancel</Button>
          <Button 
            onClick={handleTrade} 
            variant="contained"
            color={tradeType === 'buy' ? 'primary' : 'error'}
            disabled={
              !tradeForm.shares || 
              !tradeForm.price || 
              (tradeType === 'buy' && portfolio && calculateTradeValue() > portfolio.cash_balance)
            }
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'} Shares
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PortfolioPage