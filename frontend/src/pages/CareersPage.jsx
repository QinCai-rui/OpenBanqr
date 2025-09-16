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
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { careerService, financeService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const CareersPage = () => {
  const { user } = useAuth()
  const [careers, setCareers] = useState([])
  const [applications, setApplications] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [financialProfile, setFinancialProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [currentCareer, setCurrentCareer] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
        
        // Load applications
        const applicationsData = await careerService.getMyApplications()
        setApplications(applicationsData)
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

  const handleApplyToCareer = (career) => {
    setCurrentCareer(career)
    setCoverLetter('')
    setApplyDialogOpen(true)
  }

  const submitApplication = async () => {
    try {
      await careerService.applyToCareer({
        career_id: currentCareer.id,
        cover_letter: coverLetter
      })
      setApplyDialogOpen(false)
      setSuccessMessage(`Successfully applied to ${currentCareer.title}!`)
      await loadData() // Refresh applications
    } catch (error) {
      console.error('Failed to apply:', error)
    }
  }

  const hasAppliedToCareer = (careerId) => {
    return applications.some(app => app.career_id === careerId)
  }

  const CareerCard = ({ career }) => (
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
          <Box sx={{ mt: 2 }}>
            <Button
              variant={financialProfile?.career_id === career.id ? "outlined" : "contained"}
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => handleSelectCareer(career)}
              disabled={financialProfile?.career_id === career.id}
            >
              {financialProfile?.career_id === career.id ? 'Selected' : 'Choose Career'}
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleApplyToCareer(career)}
              disabled={hasAppliedToCareer(career.id)}
              color="secondary"
            >
              {hasAppliedToCareer(career.id) ? 'Applied' : 'Apply Now'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Career Center
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {!user?.is_teacher && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Browse Careers" />
            <Tab label="My Applications" />
          </Tabs>
        </Box>
      )}

      {tabValue === 0 && (
        <>
          <Typography variant="body1" color="textSecondary" paragraph>
            Explore career opportunities and apply to positions that interest you.
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
                <CareerCard career={career} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tabValue === 1 && !user?.is_teacher && (
        <>
          <Typography variant="h6" gutterBottom>
            My Career Applications
          </Typography>
          {applications.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              You haven't applied to any careers yet.
            </Typography>
          ) : (
            <List>
              {applications.map((app) => {
                const career = careers.find(c => c.id === app.career_id)
                return (
                  <ListItem key={app.id} divider>
                    <ListItemText
                      primary={career?.title || 'Unknown Career'}
                      secondary={
                        <>
                          <Typography variant="body2">
                            Status: <Chip label={app.status} size="small" color={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'error'} />
                          </Typography>
                          <Typography variant="body2">
                            Applied: {new Date(app.created_at).toLocaleDateString()}
                          </Typography>
                          {app.cover_letter && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Cover Letter: {app.cover_letter}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                )
              })}
            </List>
          )}
        </>
      )}

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Apply to {currentCareer?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Tell us why you're interested in this position.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cover Letter (Optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Explain your interest and qualifications for this role..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitApplication} variant="contained">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CareersPage