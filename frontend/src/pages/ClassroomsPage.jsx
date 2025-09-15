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
  Chip,
  Alert,
} from '@mui/material'
import { Add, People } from '@mui/icons-material'
import { classroomService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const ClassroomsPage = () => {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [openCreate, setOpenCreate] = useState(false)
  const [openJoin, setOpenJoin] = useState(false)
  const [newClassroom, setNewClassroom] = useState({ name: '', description: '' })
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassrooms = async () => {
    try {
      const data = await classroomService.getClassrooms()
      setClassrooms(data)
    } catch (error) {
      setError('Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClassroom = async () => {
    try {
      await classroomService.createClassroom(newClassroom)
      setOpenCreate(false)
      setNewClassroom({ name: '', description: '' })
      await loadClassrooms()
    } catch (error) {
      setError('Failed to create classroom')
    }
  }

  const handleJoinClassroom = async () => {
    try {
      await classroomService.joinClassroom(inviteCode)
      setOpenJoin(false)
      setInviteCode('')
      await loadClassrooms()
    } catch (error) {
      setError('Failed to join classroom')
    }
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {user?.is_teacher ? 'My Classrooms' : 'Joined Classrooms'}
        </Typography>
        <Box>
          {user?.is_teacher ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreate(true)}
            >
              Create Classroom
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => setOpenJoin(true)}
            >
              Join Classroom
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {classrooms.map((classroom) => (
          <Grid item xs={12} md={6} lg={4} key={classroom.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {classroom.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {classroom.description || 'No description'}
                </Typography>
                
                {user?.is_teacher && (
                  <Box mb={2}>
                    <Chip 
                      label={`Invite Code: ${classroom.invite_code}`} 
                      size="small" 
                      color="primary"
                    />
                  </Box>
                )}

                <Typography variant="caption" color="textSecondary">
                  Created: {new Date(classroom.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Classroom Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Classroom</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Classroom Name"
            fullWidth
            variant="outlined"
            value={newClassroom.name}
            onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newClassroom.description}
            onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateClassroom} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Classroom Dialog */}
      <Dialog open={openJoin} onClose={() => setOpenJoin(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Classroom</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Invite Code"
            fullWidth
            variant="outlined"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter 8-character invite code"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
          <Button onClick={handleJoinClassroom} variant="contained">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ClassroomsPage