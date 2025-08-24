#!/bin/bash

# Start PlayFab Analytics Development Environment
echo "Starting PlayFab Analytics Development Environment..."
echo "=============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists dotnet; then
    echo "❌ .NET SDK not found. Please install .NET 8.0 SDK"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start backend in background
echo "🚀 Starting .NET Backend on http://localhost:5000..."
cd PlayFabAnalytics
dotnet run --urls "http://localhost:5000" &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait a moment for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🚀 Starting React Frontend on http://localhost:3000..."
cd playfab-analytics-frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "🎉 Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "Swagger UI: http://localhost:5000/swagger"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID