const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, '../../expense_tracker.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

const initDatabase = () => {
    // Re-using the same initialization logic from the original server.js
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            email TEXT UNIQUE,
            password TEXT,
            profilePicture TEXT,
            isGoogleUser BOOLEAN DEFAULT 0,
            isGuest BOOLEAN DEFAULT 0,
            isEmailVerified BOOLEAN DEFAULT 0,
            failedLoginAttempts INTEGER DEFAULT 0,
            lockUntil TEXT,
            timezone TEXT DEFAULT 'UTC',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            userId TEXT,
            description TEXT,
            amount REAL,
            category TEXT,
            expenseDate TEXT,
            notes TEXT,
            currency TEXT,
            groupId TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS budgets (
            id TEXT PRIMARY KEY,
            userId TEXT,
            category TEXT,
            amount REAL,
            currency TEXT,
            budgetMonth TEXT,
            notes TEXT,
            alertThreshold INTEGER DEFAULT 80,
            isTemplate BOOLEAN DEFAULT 0,
            templateName TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            createdBy TEXT,
            type TEXT,
            includeInBudget BOOLEAN DEFAULT 1,
            startDate TEXT,
            endDate TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(createdBy) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS group_members (
            id TEXT PRIMARY KEY,
            groupId TEXT,
            userId TEXT,
            role TEXT,
            joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(groupId) REFERENCES groups(id),
            FOREIGN KEY(userId) REFERENCES users(id),
            UNIQUE(groupId, userId)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS group_expenses (
            id TEXT PRIMARY KEY,
            groupId TEXT,
            payerId TEXT,
            amount REAL,
            description TEXT,
            expenseDate TEXT,
            category TEXT,
            notes TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(groupId) REFERENCES groups(id),
            FOREIGN KEY(payerId) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS expense_splits (
            id TEXT PRIMARY KEY,
            expenseId TEXT,
            userId TEXT,
            amount REAL,
            isSettled BOOLEAN DEFAULT 0,
            FOREIGN KEY(expenseId) REFERENCES group_expenses(id),
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS recurring_expenses (
            id TEXT PRIMARY KEY,
            userId TEXT,
            description TEXT,
            amount REAL,
            category TEXT,
            pattern TEXT,
            startDate TEXT,
            endDate TEXT,
            notes TEXT,
            currency TEXT,
            isActive BOOLEAN DEFAULT 1,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);
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

const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const handleError = (res, err, customMessage = 'Database error') => {
    console.error(`❌ ${customMessage}:`, err);
    res.status(500).json({ success: false, message: customMessage, error: err.message });
};

module.exports = {
    db,
    initDatabase,
    getUserByEmail,
    getUserById,
    handleError
};
