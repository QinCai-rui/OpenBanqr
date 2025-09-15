#!/bin/bash

# OpenBanqr Development Setup Script

echo "🚀 Setting up OpenBanqr development environment..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
echo "✅ Backend dependencies installed"

# Seed database
echo "🌱 Seeding database..."
python seed_data.py
echo "✅ Database seeded with initial data"

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && source venv/bin/activate && python main.py"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"