#!/bin/bash

echo "🚀 Starting Backend Server..."
echo ""

cd "$(dirname "$0")/backend"

# Kill any existing process on port 8080
echo "🔍 Checking port 8080..."
PID=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "⚠️  Killing existing process on port 8080 (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check syntax
echo "🔍 Checking server.js syntax..."
node -c server.js
if [ $? -ne 0 ]; then
    echo "❌ Syntax error in server.js!"
    exit 1
fi

# Start server
echo ""
echo "✅ Starting server on port 8080..."
echo "   Press Ctrl+C to stop"
echo ""

node server.js



