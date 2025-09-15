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
} from '@mui/material'
import {
  TrendingUp,
  AccountBalance,
  WorkOutline,
  PlayArrow,
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

  if (user?.is_teacher) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Teacher Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome, {user.full_name || user.username}! Use the navigation to manage your classrooms and monitor student progress.
        </Typography>
      </Container>
    )
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {lastSimulation && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Week simulated! Net income: ${lastSimulation.net_income.toFixed(2)}, 
          Remaining: ${lastSimulation.remaining_amount.toFixed(2)}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Financial Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Financial Status</Typography>
              </Box>
              {financialProfile ? (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Weekly Income: ${financialProfile.weekly_income?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Net Income: ${financialProfile.net_weekly_income?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Savings: ${financialProfile.savings_balance?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Student Loan: ${financialProfile.student_loan_balance?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Weeks Played: {financialProfile.weeks_played || 0}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No financial profile found. Please select a career first.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Investment Portfolio</Typography>
              </Box>
              {portfolio ? (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Total Value: ${portfolio.total_value?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cash Balance: ${portfolio.cash_balance?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Invested: ${portfolio.total_invested?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Holdings: {portfolio.holdings?.length || 0} stocks
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No portfolio data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Career Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkOutline color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Career Status</Typography>
              </Box>
              {financialProfile?.career ? (
                <>
                  <Chip 
                    label={financialProfile.career.title} 
                    color="primary" 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Industry: {financialProfile.career.industry}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Education: {financialProfile.career.education_required}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Salary: ${financialProfile.current_salary?.toFixed(0) || '0'}/year
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No career selected. Visit the Careers page to choose your path.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Simulation Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Weekly Simulation</Typography>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleSimulateWeek}
                  disabled={simulationLoading || !financialProfile?.career_id}
                >
                  {simulationLoading ? 'Simulating...' : 'Simulate Next Week'}
                </Button>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Run a week of financial simulation to see how your income, expenses, and investments change.
                {!financialProfile?.career_id && ' Select a career first to enable simulation.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DashboardPage