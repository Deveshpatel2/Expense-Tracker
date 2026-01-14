#!/bin/bash

echo "🔄 Restarting Expense Tracker Servers..."
echo ""

# Kill existing processes
echo "🔍 Checking for existing processes..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Killing process on port 3000 (Frontend)..."
    kill -9 $(lsof -ti:3000) 2>/dev/null
    sleep 1
fi

if lsof -ti:8080 > /dev/null 2>&1; then
    echo "⚠️  Killing process on port 8080 (Backend)..."
    kill -9 $(lsof -ti:8080) 2>/dev/null
    sleep 1
fi

echo ""
echo "🚀 Starting Backend Server..."
cd backend
node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
sleep 2

echo ""
echo "🚀 Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "✅ Servers are starting..."
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait

