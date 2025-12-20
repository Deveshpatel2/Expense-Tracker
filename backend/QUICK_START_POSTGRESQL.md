# Quick Start: PostgreSQL Migration

## 🎯 Goal
Migrate from SQLite to PostgreSQL so you can use pgAdmin to view and manage your database.

## ⚡ Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This installs `pg` (PostgreSQL client) and `dotenv` (environment variables).

### Step 2: Run Setup Script
```bash
./setup-postgresql.sh
```

This script will:
- Check if PostgreSQL is installed and running
- Create a `.env` file with database credentials
- Create the `expense_tracker` database
- Create all necessary tables

**Note:** If PostgreSQL isn't installed:
- macOS: `brew install postgresql@14`
- Then start it: `brew services start postgresql@14`

### Step 3: Migrate Your Data
```bash
node migrations/migrate_data.js
```

This copies all data from your SQLite database (`expense_tracker.db`) to PostgreSQL.

## 🎉 Done!

Now start your server:
```bash
npm start
```

The server will automatically use PostgreSQL instead of SQLite.

## 📊 Access in pgAdmin

1. **Open pgAdmin** (download from https://www.pgadmin.org/download/)

2. **Add Server:**
   - Right-click "Servers" → Register → Server
   - **General Tab:** Name = `Expense Tracker`
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `5432`
     - Database: `expense_tracker`
     - Username: `postgres` (or your username)
     - Password: (your PostgreSQL password)
   - Click "Save"

3. **Browse Data:**
   - Expand: Servers → Expense Tracker → Databases → expense_tracker → Schemas → public → Tables
   - Right-click any table → View/Edit Data → All Rows

4. **Run Queries:**
   - Right-click `expense_tracker` → Query Tool
   - Write SQL and press F5 to execute

## 🔄 Switching Back to SQLite

If you want to use SQLite again:
1. Delete or rename the `.env` file
2. Restart the server
3. It will automatically use SQLite

## ❓ Troubleshooting

**"PostgreSQL is not running"**
```bash
brew services start postgresql@14
```

**"Database connection failed"**
- Check your `.env` file credentials
- Make sure PostgreSQL is running: `pg_isready`

**"Tables don't exist"**
- Run: `psql -U postgres -d expense_tracker -f migrations/create_tables.sql`

**"Migration failed"**
- Make sure PostgreSQL tables are created first
- Check that SQLite file exists: `ls expense_tracker.db`

## 📝 Manual Setup (Alternative)

If the script doesn't work, you can set up manually:

1. **Create database:**
```bash
createdb expense_tracker
```

2. **Create .env file:**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. **Create tables:**
```bash
psql -U postgres -d expense_tracker -f migrations/create_tables.sql
```

4. **Migrate data:**
```bash
node migrations/migrate_data.js
```

---

**Need help?** Check `README_POSTGRESQL.md` for detailed documentation.



