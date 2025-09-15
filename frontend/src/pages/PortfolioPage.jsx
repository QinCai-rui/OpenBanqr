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
} from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
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

  useEffect(() => {
    if (!user?.is_teacher) {
      loadData()
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
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setLoading(false)
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

  if (user?.is_teacher) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Portfolio
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Teachers don't have investment portfolios. This section is for students to practice stock trading.
        </Typography>
      </Container>
    )
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Investment Portfolio
      </Typography>

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
                  ${portfolio.total_value?.toFixed(2) || '0.00'}
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
                  ${portfolio.cash_balance?.toFixed(2) || '0.00'}
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
                  ${portfolio.total_invested?.toFixed(2) || '0.00'}
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
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.holdings.map((holding) => (
                <TableRow key={holding.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1">
                        {holding.stock.symbol}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {holding.stock.company_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{holding.shares}</TableCell>
                  <TableCell align="right">${holding.average_price.toFixed(2)}</TableCell>
                  <TableCell align="right">${holding.stock.current_price.toFixed(2)}</TableCell>
                  <TableCell align="right">${holding.current_value.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => openTradeDialog(holding.stock, 'sell')}
                    >
                      Sell
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Available Stocks */}
      <Typography variant="h5" gutterBottom>
        Available Stocks
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Change</TableCell>
            <TableCell align="right">Dividend Yield</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell>
                <Box>
                  <Typography variant="subtitle1">
                    {stock.symbol}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stock.company_name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">${stock.current_price.toFixed(2)}</TableCell>
              <TableCell align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  {stock.daily_change >= 0 ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                  <Typography
                    color={stock.daily_change >= 0 ? 'success.main' : 'error.main'}
                    sx={{ ml: 1 }}
                  >
                    {stock.daily_change_percent.toFixed(2)}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">{stock.dividend_yield.toFixed(2)}%</TableCell>
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
          <TextField
            autoFocus
            margin="dense"
            label="Number of Shares"
            type="number"
            fullWidth
            variant="outlined"
            value={tradeForm.shares}
            onChange={(e) => setTradeForm({ ...tradeForm, shares: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Price per Share"
            type="number"
            fullWidth
            variant="outlined"
            value={tradeForm.price}
            onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
          />
          {tradeForm.shares && tradeForm.price && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                Total: ${(parseFloat(tradeForm.shares) * parseFloat(tradeForm.price)).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrade(false)}>Cancel</Button>
          <Button 
            onClick={handleTrade} 
            variant="contained"
            color={tradeType === 'buy' ? 'primary' : 'error'}
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PortfolioPage