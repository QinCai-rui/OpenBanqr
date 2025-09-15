import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ClassroomsPage from './pages/ClassroomsPage'
import CareersPage from './pages/CareersPage'
import PortfolioPage from './pages/PortfolioPage'
import BankingDashboard from './pages/BankingDashboard'
import PropertyPage from './pages/PropertyPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="banking" element={<BankingDashboard />} />
            <Route path="property" element={<PropertyPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route path="careers" element={<CareersPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App