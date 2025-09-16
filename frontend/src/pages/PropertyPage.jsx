import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Paper,
  Chip,
  InputAdornment,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Home,
  TrendingUp,
  Calculate,
  Search,
  LocationOn,
  AttachMoney,
  Assessment,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const PropertyPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [mortgageCalc, setMortgageCalc] = useState({
    homePrice: 350000,
    downPayment: 70000,
    interestRate: 6.5,
    termYears: 30,
    propertyTaxRate: 1.2,
    insuranceAnnual: 1200,
    hoaMonthly: 0
  })
  const [mortgageResult, setMortgageResult] = useState(null)
  const [affordability, setAffordability] = useState({
    annualIncome: 75000,
    monthlyDebtPayments: 500,
    downPayment: 50000,
    interestRate: 6.5
  })
  const [affordabilityResult, setAffordabilityResult] = useState(null)
  const [marketData, setMarketData] = useState(null)
  const [houseListings, setHouseListings] = useState([])
  const [userProperties, setUserProperties] = useState([])
  const [searchFilters, setSearchFilters] = useState({
    priceMin: 200000,
    priceMax: 800000,
    bedrooms: '',
    bathrooms: '',
    location: 'All Areas'
  })

  useEffect(() => {
    if (!user?.is_teacher) {
      loadMarketData()
      calculateMortgage()
      calculateAffordability()
    }
  }, [user])

  const loadMarketData = async () => {
    try {
      const response = await fetch('/api/properties/market-data?location=National&property_type=single_family', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        setMarketData(await response.json())
      }
    } catch (error) {
      console.error('Failed to load housing market data:', error)
      // Mock data for demo - Real estate market
      setMarketData({
        location: "National",
        property_type: "single_family",
        median_home_price: 385000,
        price_per_sqft: 192,
        year_over_year_change: 8.2,
        month_over_month_change: 1.1,
        median_days_on_market: 28,
        inventory_months: 2.8,
        average_interest_rate: 6.75,
        market_temperature: "Seller's Market"
      })
      
      // Load sample house listings
      setHouseListings([
        {
          id: 1,
          address: "123 Maple Street, Suburbia",
          price: 425000,
          bedrooms: 3,
          bathrooms: 2.5,
          sqft: 2100,
          type: "Single Family",
          yearBuilt: 2018,
          lotSize: "0.25 acres",
          status: "For Sale",
          daysOnMarket: 12,
          description: "Beautiful modern home with open floor plan, updated kitchen, and spacious backyard."
        },
        {
          id: 2,
          address: "456 Oak Avenue, Downtown",
          price: 650000,
          bedrooms: 4,
          bathrooms: 3,
          sqft: 2800,
          type: "Single Family",
          yearBuilt: 2015,
          lotSize: "0.18 acres",
          status: "For Sale",
          daysOnMarket: 5,
          description: "Luxury home in prime location with high-end finishes and smart home features."
        },
        {
          id: 3,
          address: "789 Pine Road, Riverside",
          price: 298000,
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1650,
          type: "Townhouse",
          yearBuilt: 2020,
          lotSize: "N/A",
          status: "For Sale",
          daysOnMarket: 22,
          description: "New construction townhouse with modern amenities and low maintenance living."
        },
        {
          id: 4,
          address: "321 Birch Lane, Hillside",
          price: 750000,
          bedrooms: 5,
          bathrooms: 4,
          sqft: 3500,
          type: "Single Family",
          yearBuilt: 2012,
          lotSize: "0.45 acres",
          status: "For Sale",
          daysOnMarket: 35,
          description: "Spacious family home with pool, finished basement, and three-car garage."
        }
      ])
    }
  }

  const calculateMortgage = async () => {
    try {
      const params = new URLSearchParams({
        home_price: mortgageCalc.homePrice,
        down_payment: mortgageCalc.downPayment,
        interest_rate: mortgageCalc.interestRate / 100,
        term_years: mortgageCalc.termYears,
        property_tax_rate: mortgageCalc.propertyTaxRate / 100,
        insurance_annual: mortgageCalc.insuranceAnnual,
        hoa_monthly: mortgageCalc.hoaMonthly
      })
      
      const response = await fetch(`/api/properties/mortgage-calculator?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      if (response.ok) {
        setMortgageResult(await response.json())
      }
    } catch (error) {
      console.error('Failed to calculate mortgage:', error)
      // Mock calculation for demo
      const loanAmount = mortgageCalc.homePrice - mortgageCalc.downPayment
      const monthlyRate = (mortgageCalc.interestRate / 100) / 12
      const numPayments = mortgageCalc.termYears * 12
      const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      const monthlyTax = (mortgageCalc.homePrice * (mortgageCalc.propertyTaxRate / 100)) / 12
      const monthlyInsurance = mortgageCalc.insuranceAnnual / 12
      
      setMortgageResult({
        loan_amount: loanAmount,
        monthly_principal_interest: monthlyPI,
        monthly_property_tax: monthlyTax,
        monthly_insurance: monthlyInsurance,
        monthly_pmi: loanAmount > (mortgageCalc.homePrice * 0.8) ? (loanAmount * 0.005) / 12 : 0,
        monthly_hoa: mortgageCalc.hoaMonthly,
        total_monthly_payment: monthlyPI + monthlyTax + monthlyInsurance + mortgageCalc.hoaMonthly,
        total_interest: (monthlyPI * numPayments) - loanAmount,
        down_payment_percentage: (mortgageCalc.downPayment / mortgageCalc.homePrice) * 100
      })
    }
  }

  const calculateAffordability = async () => {
    try {
      const params = new URLSearchParams({
        annual_income: affordability.annualIncome,
        monthly_debt_payments: affordability.monthlyDebtPayments,
        down_payment: affordability.downPayment,
        interest_rate: affordability.interestRate / 100
      })
      
      const response = await fetch(`/api/properties/affordability?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      if (response.ok) {
        setAffordabilityResult(await response.json())
      }
    } catch (error) {
      console.error('Failed to calculate affordability:', error)
      // Mock calculation for demo
      const monthlyIncome = affordability.annualIncome / 12
      const maxHousingPayment = monthlyIncome * 0.28
      const maxTotalDebt = monthlyIncome * 0.36
      const maxAdditionalDebt = maxTotalDebt - affordability.monthlyDebtPayments
      const maxPayment = Math.min(maxHousingPayment, maxAdditionalDebt)
      
      setAffordabilityResult({
        max_home_price: (maxPayment * 0.85 * 360) + affordability.downPayment,
        max_monthly_payment: maxPayment,
        recommended_down_payment: 60000,
        monthly_income: monthlyIncome
      })
    }
  }

  const searchProperties = async () => {
    try {
      const response = await fetch('/api/properties/listings?min_price=200000&max_price=500000', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        setPropertyListings(await response.json())
      }
    } catch (error) {
      console.error('Failed to search properties:', error)
      // Mock listings for demo
      setPropertyListings([
        {
          id: "listing_1",
          address: "123 Oak Street",
          city: "Springfield",
          state: "CA",
          property_type: "house",
          price: 425000,
          bedrooms: 3,
          bathrooms: 2.5,
          square_feet: 2100,
          price_per_sqft: 202,
          estimated_payment: 2650,
          days_on_market: 15
        },
        {
          id: "listing_2",
          address: "456 Pine Avenue",
          city: "Riverside",
          state: "CA",
          property_type: "condo",
          price: 320000,
          bedrooms: 2,
          bathrooms: 2,
          square_feet: 1450,
          price_per_sqft: 221,
          estimated_payment: 2100,
          days_on_market: 8
        }
      ])
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleMortgageChange = (field, value) => {
    setMortgageCalc(prev => ({ ...prev, [field]: value }))
  }

  const handleAffordabilityChange = (field, value) => {
    setAffordability(prev => ({ ...prev, [field]: value }))
  }

  if (user?.is_teacher) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          🏠 Housing features are available for students to practice real estate investment, mortgage calculations, and home buying decisions. 
          Students can explore house listings, calculate affordability, and learn about the home buying process.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          🏠 Houses & Real Estate
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find your dream home, calculate affordability, and explore mortgage options
        </Typography>
      </Box>

      {/* Market Overview */}
      {marketData && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Market Overview - {marketData.location}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${marketData.median_home_price?.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Median Home Price
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: marketData.year_over_year_change > 0 ? '#4caf50' : '#f44336' }}>
                  {marketData.year_over_year_change > 0 ? '+' : ''}{marketData.year_over_year_change}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Year-over-Year
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {marketData.median_days_on_market}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Days on Market
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  <Chip 
                    label={marketData.market_temperature} 
                    color={marketData.market_temperature === 'Hot' ? 'error' : 'warning'}
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  />
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Market Temperature
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="house tabs">
            <Tab label="House Affordability" icon={<Calculate />} />
            <Tab label="Mortgage Calculator" icon={<AttachMoney />} />
            <Tab label="House Listings" icon={<Search />} />
            <Tab label="Market Analysis" icon={<Assessment />} />
          </Tabs>
        </Box>

        {/* Affordability Calculator Tab */}
        {activeTab === 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How Much House Can You Afford?
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Your Financial Information
                    </Typography>
                    <TextField
                      fullWidth
                      label="Annual Income"
                      type="number"
                      value={affordability.annualIncome}
                      onChange={(e) => handleAffordabilityChange('annualIncome', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Monthly Debt Payments"
                      type="number"
                      value={affordability.monthlyDebtPayments}
                      onChange={(e) => handleAffordabilityChange('monthlyDebtPayments', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Available Down Payment"
                      type="number"
                      value={affordability.downPayment}
                      onChange={(e) => handleAffordabilityChange('downPayment', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 2 }}>
                      <Typography gutterBottom>Interest Rate: {affordability.interestRate}%</Typography>
                      <Slider
                        value={affordability.interestRate}
                        onChange={(e, value) => handleAffordabilityChange('interestRate', value)}
                        min={3}
                        max={10}
                        step={0.1}
                        marks={[
                          { value: 3, label: '3%' },
                          { value: 6.5, label: '6.5%' },
                          { value: 10, label: '10%' }
                        ]}
                      />
                    </Box>
                    <Button variant="contained" onClick={calculateAffordability} fullWidth>
                      Calculate Affordability
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {affordabilityResult && (
                  <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Affordability Results
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          ${Math.round(affordabilityResult.max_home_price)?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Maximum Home Price
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5">
                          ${Math.round(affordabilityResult.max_monthly_payment)?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Maximum Monthly Payment
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">
                          <strong>Monthly Income:</strong> ${affordabilityResult.monthly_income?.toLocaleString()}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Recommended Down Payment:</strong> ${affordabilityResult.recommended_down_payment?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Based on the 28/36 rule: housing costs shouldn't exceed 28% of gross income, and total debt shouldn't exceed 36%.
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Mortgage Calculator Tab */}
        {activeTab === 1 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mortgage Payment Calculator
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Loan Details
                    </Typography>
                    <TextField
                      fullWidth
                      label="Home Price"
                      type="number"
                      value={mortgageCalc.homePrice}
                      onChange={(e) => handleMortgageChange('homePrice', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Down Payment"
                      type="number"
                      value={mortgageCalc.downPayment}
                      onChange={(e) => handleMortgageChange('downPayment', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Interest Rate"
                          type="number"
                          value={mortgageCalc.interestRate}
                          onChange={(e) => handleMortgageChange('interestRate', parseFloat(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Loan Term"
                          type="number"
                          value={mortgageCalc.termYears}
                          onChange={(e) => handleMortgageChange('termYears', parseInt(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">years</InputAdornment>,
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Property Tax Rate"
                      type="number"
                      value={mortgageCalc.propertyTaxRate}
                      onChange={(e) => handleMortgageChange('propertyTaxRate', parseFloat(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Annual Insurance"
                      type="number"
                      value={mortgageCalc.insuranceAnnual}
                      onChange={(e) => handleMortgageChange('insuranceAnnual', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" onClick={calculateMortgage} fullWidth>
                      Calculate Payment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {mortgageResult && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Monthly Payment Breakdown
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${Math.round(mortgageResult.total_monthly_payment)?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Monthly Payment
                        </Typography>
                      </Box>
                      
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Principal & Interest</TableCell>
                            <TableCell align="right">${Math.round(mortgageResult.monthly_principal_interest)?.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Property Tax</TableCell>
                            <TableCell align="right">${Math.round(mortgageResult.monthly_property_tax)?.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Insurance</TableCell>
                            <TableCell align="right">${Math.round(mortgageResult.monthly_insurance)?.toLocaleString()}</TableCell>
                          </TableRow>
                          {mortgageResult.monthly_pmi > 0 && (
                            <TableRow>
                              <TableCell>PMI</TableCell>
                              <TableCell align="right">${Math.round(mortgageResult.monthly_pmi)?.toLocaleString()}</TableCell>
                            </TableRow>
                          )}
                          {mortgageResult.monthly_hoa > 0 && (
                            <TableRow>
                              <TableCell>HOA</TableCell>
                              <TableCell align="right">${Math.round(mortgageResult.monthly_hoa)?.toLocaleString()}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Loan Amount:</strong> ${mortgageResult.loan_amount?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Down Payment:</strong> {mortgageResult.down_payment_percentage?.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Interest:</strong> ${Math.round(mortgageResult.total_interest)?.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* House Listings Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏠 Available Houses
            </Typography>
            
            {/* Search Filters */}
            <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle1" gutterBottom>Search Filters</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Min Price"
                    type="number"
                    value={searchFilters.priceMin}
                    onChange={(e) => setSearchFilters({...searchFilters, priceMin: parseInt(e.target.value)})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Max Price"
                    type="number"
                    value={searchFilters.priceMax}
                    onChange={(e) => setSearchFilters({...searchFilters, priceMax: parseInt(e.target.value)})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Bedrooms</InputLabel>
                    <Select
                      value={searchFilters.bedrooms}
                      label="Bedrooms"
                      onChange={(e) => setSearchFilters({...searchFilters, bedrooms: e.target.value})}
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="1">1+</MenuItem>
                      <MenuItem value="2">2+</MenuItem>
                      <MenuItem value="3">3+</MenuItem>
                      <MenuItem value="4">4+</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Bathrooms</InputLabel>
                    <Select
                      value={searchFilters.bathrooms}
                      label="Bathrooms"
                      onChange={(e) => setSearchFilters({...searchFilters, bathrooms: e.target.value})}
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="1">1+</MenuItem>
                      <MenuItem value="2">2+</MenuItem>
                      <MenuItem value="3">3+</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<Search />}
                    sx={{ height: '56px' }}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Card>
            
            {/* House Listings */}
            <Grid container spacing={3}>
              {houseListings.map((house) => (
                <Grid item xs={12} md={6} key={house.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${house.price.toLocaleString()}
                        </Typography>
                        <Chip 
                          label={`${house.daysOnMarket} days on market`} 
                          size="small" 
                          color={house.daysOnMarket < 15 ? "success" : house.daysOnMarket < 30 ? "warning" : "default"}
                        />
                      </Box>
                      
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                        📍 {house.address}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{house.bedrooms}</Typography>
                          <Typography variant="body2" color="text.secondary">bed</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{house.bathrooms}</Typography>
                          <Typography variant="body2" color="text.secondary">bath</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{house.sqft.toLocaleString()}</Typography>
                          <Typography variant="body2" color="text.secondary">sqft</Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {house.type} • Built {house.yearBuilt} • {house.lotSize}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {house.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          ${Math.round(house.price / house.sqft)}/sqft
                        </Typography>
                        <Button variant="contained" size="small">
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        )}

        {/* Market Analysis Tab */}
        {activeTab === 3 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Market Analysis & Trends
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Market data is updated daily and includes trends from major real estate sources.
            </Alert>
            
            {marketData && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Price Trends
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Median Price per Sq Ft
                        </Typography>
                        <Typography variant="h5">
                          ${marketData.price_per_sqft}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Month-over-Month Change
                        </Typography>
                        <Typography variant="h6" color={marketData.month_over_month_change > 0 ? 'success.main' : 'error.main'}>
                          {marketData.month_over_month_change > 0 ? '+' : ''}{marketData.month_over_month_change}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Market Activity
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Inventory (Months of Supply)
                        </Typography>
                        <Typography variant="h5">
                          {marketData.inventory_months}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Average Interest Rate
                        </Typography>
                        <Typography variant="h6">
                          {marketData.average_interest_rate}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </CardContent>
        )}
      </Card>
    </Container>
  )
}

export default PropertyPage