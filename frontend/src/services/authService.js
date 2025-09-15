import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(username, password) {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/users/me')
    return response.data
  }
}

export const classroomService = {
  async getClassrooms() {
    const response = await api.get('/classrooms/')
    return response.data
  },

  async createClassroom(classroomData) {
    const response = await api.post('/classrooms/', classroomData)
    return response.data
  },

  async joinClassroom(inviteCode) {
    const response = await api.post(`/classrooms/join/${inviteCode}`)
    return response.data
  },

  async getClassroom(id) {
    const response = await api.get(`/classrooms/${id}`)
    return response.data
  }
}

export const careerService = {
  async getCareers() {
    const response = await api.get('/careers/')
    return response.data
  },

  async getCareer(id) {
    const response = await api.get(`/careers/${id}`)
    return response.data
  }
}

export const financeService = {
  async getFinancialProfile() {
    const response = await api.get('/finance/profile')
    return response.data
  },

  async updateFinancialProfile(profileData) {
    const response = await api.put('/finance/profile', profileData)
    return response.data
  },

  async simulateWeek() {
    const response = await api.post('/finance/simulate-week')
    return response.data
  },

  async getTransactions(limit = 50) {
    const response = await api.get(`/finance/transactions?limit=${limit}`)
    return response.data
  }
}

export const stockService = {
  async getStocks() {
    const response = await api.get('/stocks/')
    return response.data
  },

  async getPortfolio() {
    const response = await api.get('/stocks/portfolio/me')
    return response.data
  },

  async buyStock(stockData) {
    const response = await api.post('/stocks/buy', stockData)
    return response.data
  },

  async sellStock(stockData) {
    const response = await api.post('/stocks/sell', stockData)
    return response.data
  },

  async updatePrices() {
    const response = await api.post('/stocks/update-prices')
    return response.data
  }
}

export default api