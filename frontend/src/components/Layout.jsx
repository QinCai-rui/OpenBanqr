import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
  Avatar,
} from '@mui/material'
import {
  Dashboard,
  School,
  Work,
  TrendingUp,
  ExitToApp,
  AccountBalance,
  Home,
  Assessment,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const drawerWidth = 260

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const studentMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', description: 'Overview of your finances' },
    { text: 'Banking', icon: <AccountBalance />, path: '/banking', description: 'Accounts & credit score' },
    { text: 'Houses', icon: <Home />, path: '/property', description: 'Real estate & mortgages' },
    { text: 'Investments', icon: <TrendingUp />, path: '/portfolio', description: 'Portfolio management' },
    { text: 'Careers', icon: <Work />, path: '/careers', description: 'Career opportunities' },
  ]

  const teacherMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', description: 'Teaching overview' },
    { text: 'Classrooms', icon: <School />, path: '/classrooms', description: 'Manage your classes' },
    { text: 'Careers', icon: <Work />, path: '/careers', description: 'Career information' },
    { text: 'Analytics', icon: <Assessment />, path: '/analytics', description: 'Student progress' },
  ]

  const menuItems = user?.is_teacher ? teacherMenuItems : studentMenuItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome back, {user?.full_name || user?.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>🏦</Avatar>
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                OpenBanqr
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {user?.is_teacher ? 'Teacher Portal' : 'Banking Platform'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            p: 2,
            color: 'white',
            mb: 2
          }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              {user?.is_teacher ? 'Teaching Mode' : 'Learning Mode'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {user?.is_teacher ? 'Manage Classes' : 'Build Your Future'}
            </Typography>
          </Box>
        </Box>
        
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive(item.path) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                  ...(isActive(item.path) && {
                    borderLeft: '4px solid #667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  })
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) ? '#667eea' : 'inherit',
                  minWidth: 40 
                }}>
                  {item.icon}
                </ListItemIcon>
                <Box>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 400,
                      color: isActive(item.path) ? '#667eea' : 'inherit'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
                    {item.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              OpenBanqr v2.0
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Real Banking Education
            </Typography>
          </Box>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f5f7fa', 
          minHeight: '100vh',
          p: 0
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout