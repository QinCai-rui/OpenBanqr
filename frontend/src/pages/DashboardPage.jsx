import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material'
import {
  TrendingUp,
  AccountBalance,
  WorkOutline,
  PlayArrow,
  Home,
  CreditCard,
  Assessment,
  Notifications,
  TrendingDown,
  AttachMoney,
  CheckCircle,
  Warning,
  Info,
  School,
  Group,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { financeService, stockService, bankingService } from '../services/authService'

const DashboardPage = () => {
  const { user } = useAuth()
  const [financialProfile, setFinancialProfile] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [lastSimulation, setLastSimulation] = useState(null)
  const [error, setError] = useState('')
  
  // Real financial data from API
  const [bankingData, setBankingData] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [creditScore, setCreditScore] = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (user?.is_teacher) {
      setLoading(false)
      return
    }

    try {
      // Load all financial data in parallel
      const [
        profileData, 
        portfolioData, 
        accounts, 
        creditScoreData, 
        summary,
        transactions
      ] = await Promise.all([
        financeService.getFinancialProfile(),
        stockService.getPortfolio(),
        bankingService.getAccounts(),
        bankingService.getCreditScore(),
        bankingService.getFinancialSummary(),
        financeService.getTransactions(10) // Get last 10 transactions
      ])
      
      setFinancialProfile(profileData)
      setPortfolio(portfolioData)
      setBankingData(accounts)
      setCreditScore(creditScoreData)
      setFinancialSummary(summary)
      setRecentTransactions(transactions)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateWeek = async () => {
    setSimulationLoading(true)
    setError('')

    try {
      const result = await financeService.simulateWeek()
      setLastSimulation(result)
      await loadData() // Refresh data
    } catch (err) {
      setError('Failed to simulate week')
    } finally {
      setSimulationLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      </Container>
    )
  }

  if (user?.is_teacher) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Teacher Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your classes and track student progress in financial literacy
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Quick Stats for Teachers */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <School sx={{ mr: 1 }} />
                  <Typography variant="h6">Active Classes</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>3</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Total classrooms</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Group sx={{ mr: 1 }} />
                  <Typography variant="h6">Students</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>87</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Enrolled students</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment sx={{ mr: 1 }} />
                  <Typography variant="h6">Avg Progress</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>78%</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Class completion</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">This Week</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>+12</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>New simulations</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions for Teachers */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ p: 2, height: '80px' }} startIcon={<School />}>
                      <Box>
                        <Typography variant="subtitle2">Manage Classes</Typography>
                        <Typography variant="caption" color="text.secondary">Create & organize</Typography>
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ p: 2, height: '80px' }} startIcon={<Assessment />}>
                      <Box>
                        <Typography variant="subtitle2">View Analytics</Typography>
                        <Typography variant="caption" color="text.secondary">Student progress</Typography>
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ p: 2, height: '80px' }} startIcon={<WorkOutline />}>
                      <Box>
                        <Typography variant="subtitle2">Career Library</Typography>
                        <Typography variant="caption" color="text.secondary">Manage careers</Typography>
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ p: 2, height: '80px' }} startIcon={<Group />}>
                      <Box>
                        <Typography variant="subtitle2">Student Reports</Typography>
                        <Typography variant="caption" color="text.secondary">Individual progress</Typography>
                      </Box>
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Financial Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back! Here's your financial overview and recent activity.
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Financial Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="h6">Total Cash</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                ${financialSummary?.total_cash?.toLocaleString() || '0.00'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Across all accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Net Worth</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                ${financialSummary?.net_worth?.toLocaleString() || '0.00'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Assets - Liabilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment sx={{ mr: 1 }} />
                <Typography variant="h6">Credit Score</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {creditScore?.score || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {creditScore?.rating || 'No rating'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1 }} />
                <Typography variant="h6">Monthly Income</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                ${financialProfile?.monthly_income?.toLocaleString() || '0.00'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Current profile
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ p: 2, height: '80px' }}
                    startIcon={<AccountBalance />}
                  >
                    <Box>
                      <Typography variant="subtitle2">Banking</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accounts & transfers
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ p: 2, height: '80px' }}
                    startIcon={<Home />}
                  >
                    <Box>
                      <Typography variant="subtitle2">Property</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Real estate tools
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ p: 2, height: '80px' }}
                    startIcon={<TrendingUp />}
                  >
                    <Box>
                      <Typography variant="subtitle2">Invest</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Portfolio management
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ p: 2, height: '80px' }}
                    startIcon={<Assessment />}
                  >
                    <Box>
                      <Typography variant="subtitle2">Reports</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Financial analysis
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
              <List>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar sx={{ 
                            bgcolor: transaction.amount > 0 ? 'success.main' : 'error.main',
                            width: 32, 
                            height: 32 
                          }}>
                            {transaction.amount > 0 ? <TrendingUp /> : <TrendingDown />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description || transaction.transaction_type}
                          secondary={new Date(transaction.created_at || transaction.date).toLocaleDateString()}
                        />
                        <Typography 
                          variant="h6" 
                          color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 'bold' }}
                        >
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </Typography>
                      </ListItem>
                      {index < recentTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent transactions"
                      secondary="Start making transactions to see them here"
                    />
                  </ListItem>
                )}
              </List>
              <Button variant="text" fullWidth sx={{ mt: 1 }}>
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Savings Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Savings</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Savings</Typography>
                  <Typography variant="body2">
                    ${financialProfile?.savings_balance?.toLocaleString() || '0.00'}
                  </Typography>
                </Box>
                {financialProfile?.savings_balance > 0 && (
                  <>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (financialProfile.savings_balance / 10000) * 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Emergency fund progress
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                Financial Insights
              </Typography>
              <List dense>
                {/* Generate notifications based on real data */}
                {creditScore && creditScore.score > 700 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: 'success.main'
                      }}>
                        <CheckCircle />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Great credit score: ${creditScore.score}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
                
                {financialProfile && financialProfile.savings_balance > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: 'info.main'
                      }}>
                        <TrendingUp />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={`You have $${financialProfile.savings_balance.toLocaleString()} in savings`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
                
                {portfolio && portfolio.total_value > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: 'info.main'
                      }}>
                        <Assessment />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Portfolio value: $${portfolio.total_value.toLocaleString()}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
                
                {(!creditScore || !financialProfile || !portfolio) && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: 'warning.main'
                      }}>
                        <Info />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Complete your financial profile to get personalized insights"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Financial Health Score */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Financial Health</Typography>
              {creditScore ? (
                <>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {creditScore.rating || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Credit Score: {creditScore.score}
                    </Typography>
                  </Box>
                  {financialSummary && (
                    <>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">Cash Position</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, (financialSummary.total_cash / 10000) * 100)}
                          color="success"
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ${financialSummary.total_cash?.toLocaleString() || '0'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">Net Worth</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, Math.max(0, (financialSummary.net_worth / 50000) * 100))}
                          color={financialSummary.net_worth > 0 ? "success" : "error"}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ${financialSummary.net_worth?.toLocaleString() || '0'}
                        </Typography>
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    --
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Build your credit history
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DashboardPage