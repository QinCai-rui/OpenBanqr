import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  Button,
  Tab,
  Tabs,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Alert,
} from '@mui/material'
import {
  AccountBalance,
  CreditCard,
  TrendingUp,
  Home,
  Assessment,
  MonetizationOn,
  Security,
  Timeline,
  AccountBalanceWallet,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const BankingDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [accounts, setAccounts] = useState([])
  const [creditScore, setCreditScore] = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.is_teacher) {
      loadFinancialData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadFinancialData = async () => {
    try {
      // These would be real API calls
      const [accountsRes, creditRes, summaryRes] = await Promise.all([
        fetch('/api/banking/accounts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/banking/credit-score', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/banking/financial-summary', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      if (accountsRes.ok) setAccounts(await accountsRes.json())
      if (creditRes.ok) setCreditScore(await creditRes.json())
      if (summaryRes.ok) setFinancialSummary(await summaryRes.json())
    } catch (error) {
      console.error('Failed to load financial data:', error)
      // Set mock data for demo
      setAccounts([
        {
          id: 1,
          account_name: "Primary Checking",
          account_type: "checking",
          current_balance: 2500.75,
          bank_name: "OpenBanqr Bank",
          is_primary: true
        },
        {
          id: 2,
          account_name: "High-Yield Savings",
          account_type: "savings",
          current_balance: 15000.00,
          bank_name: "OpenBanqr Bank",
          interest_rate: 0.045
        }
      ])
      setCreditScore({
        score: 742,
        category: "Very Good",
        credit_utilization: 23.5,
        total_accounts: 5
      })
      setFinancialSummary({
        total_cash: 17500.75,
        total_debt: 5200.00,
        net_worth: 12300.75,
        monthly_debt_payments: 245.00
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking': return <AccountBalance />
      case 'savings': return <AccountBalanceWallet />
      case 'credit_card': return <CreditCard />
      default: return <MonetizationOn />
    }
  }

  const getCreditScoreColor = (score) => {
    if (score >= 800) return '#4caf50'
    if (score >= 740) return '#8bc34a'
    if (score >= 670) return '#ffeb3b'
    if (score >= 580) return '#ff9800'
    return '#f44336'
  }

  if (user?.is_teacher) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Banking features are only available for students to practice financial management.
        </Alert>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Banking Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your finances and track your financial health
        </Typography>
      </Box>

      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Cash
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                ${financialSummary?.total_cash?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Across all accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CreditCard sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Debt
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                ${financialSummary?.total_debt?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Monthly payment: ${financialSummary?.monthly_debt_payments || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Net Worth
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                ${financialSummary?.net_worth?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Assets - Liabilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Credit Score
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {creditScore?.score || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {creditScore?.category || 'Not Available'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="banking dashboard tabs">
            <Tab label="Accounts" icon={<AccountBalance />} />
            <Tab label="Credit Score" icon={<Assessment />} />
            <Tab label="Property" icon={<Home />} />
            <Tab label="Investments" icon={<Timeline />} />
          </Tabs>
        </Box>

        {/* Accounts Tab */}
        {activeTab === 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bank Accounts
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getAccountIcon(account.account_type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {account.account_name}
                          </Typography>
                          {account.is_primary && (
                            <Chip label="Primary" size="small" color="primary" />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={account.account_type.replace('_', ' ').toUpperCase()} 
                        variant="outlined" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{account.bank_name}</TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        ${account.current_balance?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="Active" color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}

        {/* Credit Score Tab */}
        {activeTab === 1 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Credit Score Details
            </Typography>
            {creditScore && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: getCreditScoreColor(creditScore.score), fontWeight: 'bold', mb: 1 }}>
                        {creditScore.score}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {creditScore.category}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(creditScore.score - 300) / 5.5} 
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                        color="primary"
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption">300</Typography>
                        <Typography variant="caption">850</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Score Factors
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Credit Utilization: {creditScore.credit_utilization?.toFixed(1)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={creditScore.credit_utilization} 
                          sx={{ mt: 1 }}
                          color={creditScore.credit_utilization < 30 ? "success" : "warning"}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Accounts: {creditScore.total_accounts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Payment History: Excellent
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Account Age: Good
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </CardContent>
        )}

        {/* Property Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Property & Real Estate
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Explore home affordability calculators, mortgage tools, and property investment analysis.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ p: 2, height: '80px' }}
                  startIcon={<Home />}
                >
                  <Box>
                    <Typography variant="subtitle2">Home Affordability</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Calculate what you can afford
                    </Typography>
                  </Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ p: 2, height: '80px' }}
                  startIcon={<Assessment />}
                >
                  <Box>
                    <Typography variant="subtitle2">Mortgage Calculator</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estimate monthly payments
                    </Typography>
                  </Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ p: 2, height: '80px' }}
                  startIcon={<Timeline />}
                >
                  <Box>
                    <Typography variant="subtitle2">Market Data</Typography>
                    <Typography variant="caption" color="text.secondary">
                      View real estate trends
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Investments Tab */}
        {activeTab === 3 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment Portfolio
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your investment portfolio is managed in the Portfolio section. This tab will show integration with your banking accounts.
            </Alert>
            <Button variant="contained" color="primary">
              View Portfolio Details
            </Button>
          </CardContent>
        )}
      </Card>
    </Container>
  )
}

export default BankingDashboard