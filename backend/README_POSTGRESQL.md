# PostgreSQL Migration Guide

This guide will help you migrate from SQLite to PostgreSQL and set up pgAdmin access.

## Prerequisites

1. **Install PostgreSQL**
   - macOS: `brew install postgresql@14` or download from https://www.postgresql.org/download/
   - Start PostgreSQL: `brew services start postgresql@14` (or use pgAdmin to start it)

2. **Install pgAdmin**
   - Download from: https://www.pgadmin.org/download/
   - Install and launch pgAdmin

## Step 1: Create PostgreSQL Database

1. Open pgAdmin
2. Connect to your PostgreSQL server (default: localhost, port 5432)
3. Right-click on "Databases" → Create → Database
4. Name: `expense_tracker`
5. Owner: `postgres` (or your PostgreSQL user)
6. Click "Save"

Alternatively, use command line:
```bash
createdb expense_tracker
```

## Step 2: Install Node.js Dependencies

```bash
cd backend
npm install
```

This will install `pg` and `dotenv` packages.

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update PostgreSQL credentials if needed:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

## Step 4: Run Migration

1. **Create PostgreSQL tables:**
```bash
psql -U postgres -d expense_tracker -f migrations/create_tables.sql
```

Or manually run the SQL file in pgAdmin:
- Right-click on `expense_tracker` database → Query Tool
- Open `migrations/create_tables.sql`
- Execute (F5)

2. **Migrate data from SQLite to PostgreSQL:**
```bash
node migrations/migrate_data.js
```

This will:
- Read all data from `expense_tracker.db` (SQLite)
- Insert it into PostgreSQL
- Show a summary of migrated rows

## Step 5: Update Server Configuration

The server.js has been updated to use PostgreSQL. Make sure your `.env` file is configured correctly.

## Step 6: Start the Server

```bash
npm start
```

The server will now use PostgreSQL instead of SQLite.

## Accessing Database in pgAdmin

1. **Connect to Server:**
   - Open pgAdmin
   - Right-click "Servers" → Register → Server
   - General tab:
     - Name: `Expense Tracker Local`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Maintenance database: `postgres`
     - Username: `postgres`
     - Password: (your PostgreSQL password)
   - Click "Save"

2. **Browse Database:**
   - Expand: Servers → Expense Tracker Local → Databases → expense_tracker → Schemas → public → Tables
   - Right-click any table → View/Edit Data → All Rows

3. **Run Queries:**
   - Right-click `expense_tracker` database → Query Tool
   - Write SQL queries and execute (F5)

## Useful SQL Queries

```sql
-- View all users
SELECT * FROM users;

-- View all expenses
SELECT * FROM expenses;

-- View expenses with user names
SELECT e.*, u."firstName", u."lastName" 
FROM expenses e 
JOIN users u ON e."userId" = u.id;

-- Count expenses by category
SELECT category, COUNT(*) as count, SUM(amount) as total
FROM expenses
GROUP BY category
ORDER BY total DESC;
```

## Troubleshooting

1. **Connection refused:**
   - Make sure PostgreSQL is running: `brew services list`
   - Check if PostgreSQL is listening on port 5432

2. **Authentication failed:**
   - Verify username and password in `.env`
   - Check PostgreSQL authentication settings in `pg_hba.conf`

3. **Database doesn't exist:**
   - Create it using pgAdmin or `createdb expense_tracker`

4. **Migration errors:**
   - Make sure PostgreSQL tables are created first
   - Check that SQLite database file exists: `backend/expense_tracker.db`

## Reverting to SQLite

If you need to switch back to SQLite:
1. Comment out PostgreSQL imports in `server.js`
2. Uncomment SQLite code
3. Restart the server

The SQLite database file (`expense_tracker.db`) is still available in the backend directory.



