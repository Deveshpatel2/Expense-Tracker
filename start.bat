@echo off
echo 🚀 Starting Expense Tracker Application...

REM Start backend
echo 📡 Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend application...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Expense Tracker is starting up!
echo 📡 Backend: http://localhost:8080
echo 🎨 Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close the windows to stop the servers.
echo.
pause
