const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// DB_PATH lets the test suite point at a throwaway database.
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../expense_tracker.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Connected to SQLite database');
    }
});

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                firstName TEXT,
                lastName TEXT,
                email TEXT UNIQUE,
                password TEXT,
                isGuest BOOLEAN DEFAULT 0,
                failedLoginAttempts INTEGER DEFAULT 0,
                accountLockedUntil TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                expenseDate TEXT NOT NULL,
                notes TEXT,
                currency TEXT DEFAULT 'USD',
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`, (err) => (err ? reject(err) : resolve()));
        });
    });
};

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Log the real error server-side; never leak SQL details to the client.
const handleError = (res, err, customMessage = 'Something went wrong') => {
    console.error(`❌ ${customMessage}:`, err);
    res.status(500).json({ success: false, message: customMessage });
};

module.exports = {
    db,
    initDatabase,
    getUserByEmail,
    handleError
};
