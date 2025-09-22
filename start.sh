#!/bin/bash

# Expense Tracker Startup Script
echo "🚀 Starting Expense Tracker Application..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if ports are available
if ! check_port 8080; then
    echo "❌ Backend port 8080 is already in use. Please stop the existing process."
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Frontend port 3000 is already in use. Please stop the existing process."
    exit 1
fi

# Start backend
echo "📡 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend application..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Expense Tracker is starting up!"
echo "📡 Backend: http://localhost:8080"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
