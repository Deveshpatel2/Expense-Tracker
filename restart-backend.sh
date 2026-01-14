#!/bin/bash

echo "🔄 Restarting Backend Server..."
echo ""

# Kill any process on port 8080
echo "🔍 Checking port 8080..."
PID=$(lsof -ti:8080 2>/dev/null)

if [ ! -z "$PID" ]; then
    echo "⚠️  Found process(es) on port 8080: $PID"
    echo "🛑 Killing process(es)..."
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "✅ Port 8080 is now free"
else
    echo "✅ Port 8080 is free"
fi

echo ""
echo "🚀 Starting backend server..."
echo ""

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start server
echo "✅ Starting server on port 8080..."
npm start



