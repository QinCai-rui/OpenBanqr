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
import { financeService, stockService } from '../services/authService'

const DashboardPage = () => {
  const { user } = useAuth()
  const [financialProfile, setFinancialProfile] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [lastSimulation, setLastSimulation] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (user?.is_teacher) {
      setLoading(false)
      return
    }

    try {
      const [profileData, portfolioData] = await Promise.all([
        financeService.getFinancialProfile(),
        stockService.getPortfolio(),
      ])
      setFinancialProfile(profileData)
      setPortfolio(portfolioData)
    } catch (err) {
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

  // Mock data for enhanced dashboard
  const [dashboardData, setDashboardData] = useState({
    totalCash: 17500.75,
    totalDebt: 5200.00,
    creditScore: 742,
    monthlyIncome: 4500.00,
    monthlyExpenses: 3200.00,
    savingsGoal: 25000,
    currentSavings: 15000,
    recentTransactions: [
      { id: 1, description: "Salary Deposit", amount: 4500.00, type: "income", date: "2025-01-15" },
      { id: 2, description: "Rent Payment", amount: -1200.00, type: "expense", date: "2025-01-14" },
      { id: 3, description: "Grocery Store", amount: -156.32, type: "expense", date: "2025-01-13" },
      { id: 4, description: "Investment Purchase", amount: -500.00, type: "investment", date: "2025-01-12" },
    ],
    notifications: [
    ]
  })

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
                ${dashboardData.totalCash.toLocaleString()}
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
                ${(dashboardData.totalCash - dashboardData.totalDebt).toLocaleString()}
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
                {dashboardData.creditScore}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Very Good
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
                ${dashboardData.monthlyIncome.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                After tax
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
                {dashboardData.recentTransactions.map((transaction, index) => (
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
                        primary={transaction.description}
                        secondary={transaction.date}
                      />
                      <Typography 
                        variant="h6" 
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </Typography>
                    </ListItem>
                    {index < dashboardData.recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Button variant="text" fullWidth sx={{ mt: 1 }}>
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Savings Goal Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Savings Goal</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Emergency Fund</Typography>
                  <Typography variant="body2">
                    ${dashboardData.currentSavings.toLocaleString()} / ${dashboardData.savingsGoal.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(dashboardData.currentSavings / dashboardData.savingsGoal) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {((dashboardData.currentSavings / dashboardData.savingsGoal) * 100).toFixed(0)}% complete
              </Typography>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                Notifications
              </Typography>
              <List dense>
                {dashboardData.notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24,
                        bgcolor: notification.type === 'success' ? 'success.main' : 
                                notification.type === 'warning' ? 'warning.main' : 'info.main'
                      }}>
                        {notification.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={notification.message}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Financial Health Score */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Financial Health</Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  B+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Above Average
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Debt-to-Income Ratio</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={25}
                  color="success"
                  sx={{ height: 4, borderRadius: 2 }}
                />
                <Typography variant="caption" color="text.secondary">25% (Excellent)</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Emergency Fund</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={60}
                  color="warning"
                  sx={{ height: 4, borderRadius: 2 }}
                />
                <Typography variant="caption" color="text.secondary">3.2 months (Good)</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DashboardPage