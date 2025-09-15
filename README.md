# 💰 OpenBanqr

**A free and open-source financial literacy platform for schools**

OpenBanqr is a realistic, engaging platform where students learn personal finance through real-world data, career choices, and budgeting challenges. No paywalls, no fictional salaries—just real jobs, real taxes, and real consequences.

## 🎯 Purpose

Create an educational tool that makes financial literacy fun and interactive. Students can:
- Choose from realistic career paths with real salary data
- Experience weekly income, taxes, and expenses
- Manage investment portfolios with real stock tickers
- Learn about housing, loans, and long-term financial planning
- Compete and collaborate in classroom environments

## ✨ Features

### Core Features
- **Authentication System**: Student and teacher roles with secure JWT authentication
- **Classroom Management**: Teachers can create classrooms, students join with invite codes
- **Career Simulation**: Choose from 6 realistic careers with authentic salary data and education requirements
- **Financial Simulation**: Weekly income calculation with New Zealand PAYE tax system
- **Student Loan System**: Realistic loan amounts and repayment calculations based on career path
- **Budgeting Tools**: Track housing, expenses, savings, and emergency funds
- **Stock Market Simulation**: Trade real company stocks (AAPL, MSFT, GOOGL, etc.) with portfolio tracking
- **Random Events**: Bonuses, emergencies, and unexpected expenses to keep simulation realistic

### Teacher Features
- Create and manage multiple classrooms
- Monitor student progress across financial metrics
- Generate unique invite codes for easy student enrollment

### Student Features
- Choose career path and experience realistic financial progression
- Weekly financial simulation with income, tax, and expense calculations
- Investment portfolio with real stock prices and daily market changes
- Savings goals and emergency fund management
- Transaction history and financial progress tracking

## 🧪 Tech Stack

- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Frontend**: React with Material-UI components
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Containerization**: Docker and Docker Compose
- **API Documentation**: Auto-generated with FastAPI/OpenAPI

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/QinCai-rui/OpenBanqr.git
   cd OpenBanqr
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Seed the database**
   ```bash
   docker-compose exec backend python seed_data.py
   ```

4. **Open the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python seed_data.py
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📚 Usage Guide

### For Teachers

1. **Register an Account**: Create an account and select "I am a teacher"
2. **Create Classroom**: Use the Classrooms page to create a new classroom
3. **Share Invite Code**: Give students the 8-character invite code to join
4. **Monitor Progress**: View student financial progress and engagement

### For Students

1. **Register an Account**: Create a student account
2. **Join Classroom**: Use your teacher's invite code to join a classroom
3. **Choose Career**: Visit the Careers page and select your career path
4. **Start Simulation**: Use the dashboard to run weekly financial simulations
5. **Manage Portfolio**: Buy and sell stocks on the Portfolio page
6. **Track Progress**: Monitor your savings, investments, and net worth

## 💼 Career Options

The platform includes 6 realistic career paths:

| Career | Education Required | Starting Salary | Student Loan |
|--------|-------------------|-----------------|--------------|
| Software Engineer | Bachelor's Degree | $65,000-$95,000 | $35,000 |
| Electrician | Trade Certificate | $45,000-$75,000 | None |
| Registered Nurse | Bachelor's Degree | $55,000-$75,000 | $30,000 |
| Teacher | Bachelor's + Teaching Qual | $48,000-$78,000 | $32,000 |
| Retail Assistant | High School | $35,000-$45,000 | None |
| Accountant | Bachelor's Degree | $50,000-$80,000 | $28,000 |

## 📈 Financial Simulation

### Tax System
- Implements simplified New Zealand PAYE tax brackets
- Automatic tax calculation on weekly income
- Student loan repayment (12% of income over $22,828)

### Stock Market
- Real company tickers (Apple, Microsoft, Google, Amazon, Tesla, NVIDIA)
- Daily price simulation with realistic volatility
- Dividend yields and portfolio tracking
- Buy/sell transactions with portfolio value updates

### Random Events
- Performance bonuses and tax refunds
- Car repairs and medical emergencies
- Freelance opportunities
- Parking fines and other unexpected costs

## 🛠️ Development

### Project Structure
```
OpenBanqr/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # Authentication logic
│   │   └── routers/        # API endpoints
│   ├── main.py             # Application entry point
│   ├── seed_data.py        # Database seeding
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── context/        # React context providers
│   └── package.json        # Node.js dependencies
└── docker-compose.yml      # Container orchestration
```

### API Endpoints

- **Authentication**: `/api/auth/` - Login, register
- **Users**: `/api/users/` - User management
- **Classrooms**: `/api/classrooms/` - Classroom CRUD operations
- **Careers**: `/api/careers/` - Career data
- **Finance**: `/api/finance/` - Financial simulation, transactions
- **Stocks**: `/api/stocks/` - Stock trading, portfolio management

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests (if added)
cd frontend
npm test
```

## 🔒 Security Features

- Secure password hashing with bcrypt
- JWT token authentication
- Role-based access control (teacher/student)
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- CORS protection

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/QinCai-rui/OpenBanqr/issues).

## 🚀 Roadmap

- [ ] Retirement savings simulation (KiwiSaver-style)
- [ ] Insurance modules (medical, income, contents)
- [ ] Property market simulation with mortgages
- [ ] Classroom leaderboards and competitions
- [ ] Mobile app development
- [ ] Integration with real financial APIs
- [ ] Advanced analytics and reporting
- [ ] Multi-language support

---

**OpenBanqr** - Making financial literacy accessible, engaging, and free for everyone! 🎓💰
