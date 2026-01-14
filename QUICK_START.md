# 🚀 Quick Start - SQLite Only

## ✅ What's Fixed
- ✅ Removed all PostgreSQL code
- ✅ Using SQLite only
- ✅ Guest login endpoint fixed
- ✅ Better error handling

## 🎯 Start the Application

### Step 1: Kill stuck processes
```bash
lsof -ti:8080 | xargs kill -9
```

### Step 2: Start Backend
```bash
cd backend
npm start
```

**Expected output:**
```
📊 Using SQLite database
✅ Connected to SQLite database
✅ Server is running on port 8080
📡 API available at http://localhost:8080/api
👤 Guest login: http://localhost:8080/api/auth/guest
🏥 Health check: http://localhost:8080/api/health
```

### Step 3: Start Frontend (NEW terminal)
```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
webpack compiled
```

### Step 4: Test Login
1. Open: `http://localhost:3000`
2. Click: **"Continue as Guest"**
3. Should redirect to dashboard ✅

## 🔍 Verify It's Working

### Test Backend Health
```bash
curl http://localhost:8080/api/health
```
Should return: `{"status":"ok","database":"connected"}`

### Test Guest Login
```bash
curl -X POST http://localhost:8080/api/auth/guest \
  -H "Content-Type: application/json"
```
Should return JSON with `success: true` and token

## 🐛 Troubleshooting

### Backend won't start
```bash
# Kill port 8080
lsof -ti:8080 | xargs kill -9

# Install dependencies
cd backend
npm install

# Start again
npm start
```

### Guest login timeout
1. Check backend is running: `curl http://localhost:8080/api/health`
2. Check backend console for errors
3. Make sure both servers are running

### Database issues
```bash
# Check database exists
ls backend/expense_tracker.db

# View users
cd backend
sqlite3 expense_tracker.db "SELECT email FROM users LIMIT 5;"
```

## ✅ Success Checklist

- [ ] Backend shows "✅ Connected to SQLite database"
- [ ] `curl http://localhost:8080/api/health` returns OK
- [ ] Frontend loads at `http://localhost:3000`
- [ ] "Continue as Guest" button works
- [ ] Redirects to dashboard after guest login

## 📝 Notes

- **Database:** `backend/expense_tracker.db` (SQLite)
- **Backend:** `http://localhost:8080`
- **Frontend:** `http://localhost:3000`
- **No PostgreSQL** - Everything uses SQLite



