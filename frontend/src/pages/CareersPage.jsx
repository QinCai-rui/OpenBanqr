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
  Chip,
  Box,
} from '@mui/material'
import { careerService, financeService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const CareersPage = () => {
  const { user } = useAuth()
  const [careers, setCareers] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [financialProfile, setFinancialProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const careersData = await careerService.getCareers()
      setCareers(careersData)
      
      if (!user?.is_teacher) {
        const profileData = await financeService.getFinancialProfile()
        setFinancialProfile(profileData)
      }
    } catch (error) {
      console.error('Failed to load careers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCareer = async (career) => {
    if (user?.is_teacher) return
    
    try {
      await financeService.updateFinancialProfile({ career_id: career.id })
      setSelectedCareer(career)
      await loadData() // Refresh profile
    } catch (error) {
      console.error('Failed to select career:', error)
    }
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Career Options
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Choose your career path to start your financial simulation. Each career has different education requirements, salary ranges, and loan obligations.
      </Typography>

      {financialProfile?.career_id && (
        <Box mb={3}>
          <Chip 
            label={`Current Career: ${careers.find(c => c.id === financialProfile.career_id)?.title || 'Unknown'}`}
            color="primary" 
            size="large"
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {careers.map((career) => (
          <Grid item xs={12} md={6} lg={4} key={career.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: financialProfile?.career_id === career.id ? 2 : 0,
                borderColor: 'primary.main'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {career.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {career.description}
                </Typography>
                
                <Box mb={2}>
                  <Chip label={career.industry} size="small" sx={{ mr: 1 }} />
                  <Chip 
                    label={career.education_required} 
                    size="small" 
                    color={career.requires_student_loan ? 'warning' : 'success'}
                  />
                </Box>

                <Typography variant="body2" gutterBottom>
                  <strong>Salary Range:</strong> ${career.base_salary_min.toLocaleString()} - ${career.base_salary_max.toLocaleString()}
                </Typography>

                {career.requires_student_loan && (
                  <Typography variant="body2" color="warning.main" gutterBottom>
                    <strong>Student Loan:</strong> ${career.student_loan_amount.toLocaleString()}
                  </Typography>
                )}

                {!user?.is_teacher && (
                  <Button
                    variant={financialProfile?.career_id === career.id ? "outlined" : "contained"}
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleSelectCareer(career)}
                    disabled={financialProfile?.career_id === career.id}
                  >
                    {financialProfile?.career_id === career.id ? 'Selected' : 'Choose Career'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default CareersPage