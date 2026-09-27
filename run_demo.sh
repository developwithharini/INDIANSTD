#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 STARTING MANAK RECOMMENDATION ENGINE"
echo "=========================================="

# Check Python environment
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Ensure data directories exist
mkdir -p data/index data/raw data/adapter

# Start Backend Server
echo "📦 Starting FastAPI Backend Server on http://localhost:8000..."
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Trap SIGINT to stop backend process on exit
trap "kill $BACKEND_PID" EXIT

# Start Frontend Dev Server
echo "💻 Starting React Vite Frontend on http://localhost:5173..."
cd frontend
npm run dev

echo "=========================================="
echo "✅ MANAK Workspace operational at http://localhost:5173"
echo "=========================================="
