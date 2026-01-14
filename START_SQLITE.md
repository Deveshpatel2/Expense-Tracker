# ✅ SQLite Setup - Login Fix

## Status
✅ **SQLite is configured and ready**
✅ **All PostgreSQL code removed**
✅ **Guest login endpoint fixed**

## How to Start

### Step 1: Kill any stuck processes
```bash
lsof -ti:8080 | xargs kill -9
```

### Step 2: Start Backend (SQLite)
```bash
cd backend
npm start
```

You should see:
```
📊 Using SQLite database
✅ Connected to SQLite database
Server is running on port 8080
API available at http://localhost:8080/api
```

### Step 3: Start Frontend (in a new terminal)
```bash
cd frontend
npm start
```

### Step 4: Test Login
1. Open browser: `http://localhost:3000`
2. Click "Continue as Guest"
3. Should work! ✅

## Verify Backend is Running

Test the health endpoint:
```bash
curl http://localhost:8080/api/health
```

Should return: `{"status":"ok"}`

Test guest endpoint:
```bash
curl -X POST http://localhost:8080/api/auth/guest \
  -H "Content-Type: application/json"
```

Should return: `{"success":true,"data":{"token":"...","user":{...}}}`

## What Changed

1. ✅ Removed all PostgreSQL code
2. ✅ Using SQLite only
3. ✅ Fixed guest login endpoint
4. ✅ Added better error logging
5. ✅ Enhanced CORS configuration

## Database Location

SQLite database: `backend/expense_tracker.db`

View database:
```bash
cd backend
sqlite3 expense_tracker.db "SELECT * FROM users LIMIT 5;"
```

## Troubleshooting

**Backend won't start:**
- Make sure port 8080 is free: `lsof -ti:8080 | xargs kill -9`
- Check dependencies: `cd backend && npm install`

**Guest login timeout:**
- Make sure backend is running: `curl http://localhost:8080/api/health`
- Check backend console for errors

**Database errors:**
- Database file exists: `ls backend/expense_tracker.db`
- Check permissions: `chmod 644 backend/expense_tracker.db`

## Success Indicators

✅ Backend console shows: "✅ Connected to SQLite database"
✅ `curl http://localhost:8080/api/health` returns OK
✅ Guest login works without timeout
✅ Browser redirects to dashboard after guest login



