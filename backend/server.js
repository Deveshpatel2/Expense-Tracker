const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Database setup - SQLite only
const sqlite3 = require('sqlite3').verbose();
console.log('📊 Using SQLite database');
const db = new sqlite3.Database('expense_tracker.db', (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Rate limiting
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = 'mySecretKey123456789012345678901234567890';

// Email configuration (using Gmail for demo - in production use proper SMTP)
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Email templates
const emailTemplates = {
    verification: (name, token) => ({
        subject: 'Verify Your Email - Expense Tracker',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to Expense Tracker!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for registering with Expense Tracker. Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/verify-email?token=${token}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">http://localhost:3000/verify-email?token=${token}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
        `
    }),
    passwordReset: (name, token) => ({
        subject: 'Reset Your Password - Expense Tracker',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Password Reset Request</h2>
                <p>Hi ${name},</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/reset-password?token=${token}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">http://localhost:3000/reset-password?token=${token}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    })
};

// Middleware - CORS with better error handling
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3004', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());
app.use(express.static('uploads'));

// Rate limiting configuration
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per windowMs
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/upload/', uploadLimiter);

// Initialize database tables - SQLite
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profilePicture TEXT,
    isGoogleUser BOOLEAN DEFAULT 0,
    isGuest BOOLEAN DEFAULT 0,
    isEmailVerified BOOLEAN DEFAULT 0,
    emailVerificationToken TEXT,
    emailVerificationExpires DATETIME,
    failedLoginAttempts INTEGER DEFAULT 0,
    accountLockedUntil DATETIME,
    timezone TEXT DEFAULT 'UTC',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // Expenses table
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    expenseDate DATE NOT NULL,
    notes TEXT,
    currency TEXT NOT NULL,
    userId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

    // Budgets table
    db.run(`CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    budgetMonth DATE NOT NULL,
    notes TEXT,
    alertThreshold INTEGER DEFAULT 80,
    isTemplate BOOLEAN DEFAULT 0,
    templateName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

    // Recurring expenses table
    db.run(`CREATE TABLE IF NOT EXISTS recurring_expenses (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    pattern TEXT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE,
    notes TEXT,
    currency TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'tag',
    isDefault BOOLEAN DEFAULT 0,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id),
    UNIQUE(userId, name)
  )`);

    // User settings table
    db.run(`CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    settingType TEXT DEFAULT 'string',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id),
    UNIQUE(userId, settingKey)
  )`);

    // Split feature: Groups table
    db.run(`CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    createdBy TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users (id)
  )`);

    // Split feature: Group members table
    db.run(`CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY,
    groupId TEXT NOT NULL,
    userId TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (groupId) REFERENCES groups (id),
    FOREIGN KEY (userId) REFERENCES users (id),
    UNIQUE(groupId, userId)
  )`);

    // Split feature: Group expenses table
    db.run(`CREATE TABLE IF NOT EXISTS group_expenses (
    id TEXT PRIMARY KEY,
    groupId TEXT NOT NULL,
    payerId TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    expenseDate DATE NOT NULL,
    category TEXT NOT NULL,
    splitType TEXT DEFAULT 'even',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (groupId) REFERENCES groups (id),
    FOREIGN KEY (payerId) REFERENCES users (id)
  )`);

    // Split feature: Expense splits (who owes what)
    db.run(`CREATE TABLE IF NOT EXISTS expense_splits (
    id TEXT PRIMARY KEY,
    expenseId TEXT NOT NULL,
    userId TEXT NOT NULL,
    amount REAL NOT NULL,
    isSettled BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expenseId) REFERENCES group_expenses (id),
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

    // Insert default categories for all users
    const defaultCategories = [
        { name: 'Food & Dining', description: 'Restaurants, groceries, food delivery', color: '#EF4444', icon: 'utensils' },
        { name: 'Transportation', description: 'Gas, public transport, rideshare', color: '#3B82F6', icon: 'car' },
        { name: 'Shopping', description: 'Clothing, electronics, general shopping', color: '#8B5CF6', icon: 'shopping-bag' },
        { name: 'Entertainment', description: 'Movies, games, subscriptions', color: '#F59E0B', icon: 'film' },
        { name: 'Healthcare', description: 'Medical expenses, pharmacy, insurance', color: '#10B981', icon: 'heart' },
        { name: 'Utilities', description: 'Electricity, water, internet, phone', color: '#6B7280', icon: 'zap' },
        { name: 'Housing', description: 'Rent, mortgage, maintenance', color: '#DC2626', icon: 'home' },
        { name: 'Education', description: 'Courses, books, training', color: '#059669', icon: 'book' },
        { name: 'Travel', description: 'Vacation, business trips', color: '#0EA5E9', icon: 'plane' },
        { name: 'Other', description: 'Miscellaneous expenses', color: '#6B7280', icon: 'more-horizontal' }
    ];

    // Create default categories for existing users
    db.all('SELECT id FROM users', [], (err, users) => {
        if (!err && users) {
            users.forEach(user => {
                defaultCategories.forEach(category => {
                    db.run(
                        'INSERT OR IGNORE INTO categories (id, userId, name, description, color, icon, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [uuidv4(), user.id, category.name, category.description, category.color, category.icon, 1]
                    );
                });
            });
        }
    });

    // MIGRATION: Add new columns if they don't exist
    // Add groupId to expenses
    db.run("ALTER TABLE expenses ADD COLUMN groupId TEXT", (err) => {
        // Silently fail if column exists
    });
    // Add columns to groups
    db.run("ALTER TABLE groups ADD COLUMN includeInBudget BOOLEAN DEFAULT 1", (err) => { });
    db.run("ALTER TABLE groups ADD COLUMN startDate DATE", (err) => { });
    db.run("ALTER TABLE groups ADD COLUMN endDate DATE", (err) => { });
});

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    // Validate JWT format before verification
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.error('JWT format error: Invalid token structure');
        return res.status(403).json({ success: false, message: 'Invalid token format' });
    }

    // Additional validation - check if token is not just whitespace
    if (token.trim() === '') {
        console.error('JWT format error: Empty token');
        return res.status(403).json({ success: false, message: 'Invalid token format' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Handle expired token specifically - don't log as error, it's expected
            if (err.name === 'TokenExpiredError') {
                // Silently handle expired tokens - don't spam logs
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please log in again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            // Handle other JWT errors - only log unexpected errors
            if (err.name !== 'JsonWebTokenError') {
                console.error('JWT verification error:', err.name, err.message);
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please log in again.',
                code: 'INVALID_TOKEN'
            });
        }
        req.user = user;
        next();
    });
};

// Helper function to get user by email
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Password validation function
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Comprehensive input validation functions
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 999999.99;
};

const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

const validateCurrency = (currency) => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
    return validCurrencies.includes(currency);
};

const validateCategory = (category) => {
    const validCategories = [
        'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
        'Healthcare', 'Utilities', 'Housing', 'Education', 'Travel', 'Other'
    ];
    return validCategories.includes(category);
};

const validatePattern = (pattern) => {
    const validPatterns = ['weekly', 'monthly', 'yearly'];
    return validPatterns.includes(pattern);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

const validateExpenseInput = (data) => {
    const errors = [];

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string');
    } else if (data.description.length > 255) {
        errors.push('Description must be less than 255 characters');
    }

    if (!data.amount || !validateAmount(data.amount)) {
        errors.push('Amount is required and must be a positive number less than 1,000,000');
    }

    if (!data.category || !validateCategory(data.category)) {
        errors.push('Category is required and must be a valid category');
    }

    if (!data.expenseDate || !validateDate(data.expenseDate)) {
        errors.push('Expense date is required and must be a valid date');
    }

    if (data.currency && !validateCurrency(data.currency)) {
        errors.push('Currency must be a valid currency code');
    }

    if (data.notes && data.notes.length > 1000) {
        errors.push('Notes must be less than 1000 characters');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateBudgetInput = (data) => {
    const errors = [];

    if (!data.category || !validateCategory(data.category)) {
        errors.push('Category is required and must be a valid category');
    }

    if (!data.amount || !validateAmount(data.amount)) {
        errors.push('Amount is required and must be a positive number less than 1,000,000');
    }

    if (!data.currency || !validateCurrency(data.currency)) {
        errors.push('Currency is required and must be a valid currency code');
    }

    if (!data.budgetMonth || !validateDate(data.budgetMonth)) {
        errors.push('Budget month is required and must be a valid date');
    }

    if (data.alertThreshold && (data.alertThreshold < 1 || data.alertThreshold > 100)) {
        errors.push('Alert threshold must be between 1 and 100');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateRecurringExpenseInput = (data) => {
    const errors = [];

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string');
    } else if (data.description.length > 255) {
        errors.push('Description must be less than 255 characters');
    }

    if (!data.amount || !validateAmount(data.amount)) {
        errors.push('Amount is required and must be a positive number less than 1,000,000');
    }

    if (!data.category || !validateCategory(data.category)) {
        errors.push('Category is required and must be a valid category');
    }

    if (!data.pattern || !validatePattern(data.pattern)) {
        errors.push('Pattern is required and must be weekly, monthly, or yearly');
    }

    if (!data.startDate || !validateDate(data.startDate)) {
        errors.push('Start date is required and must be a valid date');
    }

    if (data.endDate && !validateDate(data.endDate)) {
        errors.push('End date must be a valid date');
    }

    if (data.currency && !validateCurrency(data.currency)) {
        errors.push('Currency must be a valid currency code');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Error handling middleware
const handleError = (res, error, message = 'An error occurred') => {
    console.error('API Error:', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({
            success: false,
            message: 'Database constraint violation',
            error: 'CONSTRAINT_ERROR'
        });
    }

    if (error.code === 'SQLITE_BUSY') {
        return res.status(503).json({
            success: false,
            message: 'Database is busy, please try again',
            error: 'DATABASE_BUSY'
        });
    }

    return res.status(500).json({
        success: false,
        message: message,
        error: error.message || 'INTERNAL_ERROR'
    });
};

// Account lockout check
const checkAccountLockout = (user) => {
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        return {
            isLocked: true,
            lockoutTime: user.accountLockedUntil
        };
    }
    return { isLocked: false };
};

// Increment failed login attempts
const incrementFailedAttempts = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT failedLoginAttempts FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                reject(err);
                return;
            }

            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            let lockoutUntil = null;

            // Lock account after 5 failed attempts for 30 minutes
            if (failedAttempts >= 5) {
                lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            }

            db.run(
                'UPDATE users SET failedLoginAttempts = ?, accountLockedUntil = ? WHERE id = ?',
                [failedAttempts, lockoutUntil, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve({ failedAttempts, isLocked: !!lockoutUntil });
                }
            );
        });
    });
};

// Reset failed login attempts on successful login
const resetFailedAttempts = (userId) => {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE users SET failedLoginAttempts = 0, accountLockedUntil = NULL WHERE id = ?',
            [userId],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

// Helper function to get user by ID
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        database: 'SQLite',
        status: 'ok'
    });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate password complexity
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = uuidv4();
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password, isGoogleUser, isGuest, isEmailVerified, emailVerificationToken, emailVerificationExpires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, firstName, lastName, email, hashedPassword, false, false, false, emailVerificationToken, emailVerificationExpires],
            function (err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Registration failed' });
                }

                // Send verification email
                const emailTemplate = emailTemplates.verification(firstName, emailVerificationToken);
                emailTransporter.sendMail({
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: email,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html
                }).catch(err => {
                    console.error('Email sending failed:', err);
                });

                // Generate JWT token
                const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });

                res.json({
                    success: true,
                    message: 'User registered successfully. Please check your email to verify your account.',
                    data: {
                        token,
                        user: {
                            id: userId,
                            firstName,
                            lastName,
                            email,
                            isGoogleUser: false,
                            isGuest: false,
                            isEmailVerified: false
                        }
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if account is locked
        const lockoutCheck = checkAccountLockout(user);
        if (lockoutCheck.isLocked) {
            const lockoutTime = new Date(lockoutCheck.lockoutTime);
            const remainingTime = Math.ceil((lockoutTime - new Date()) / (1000 * 60)); // minutes
            return res.status(423).json({
                success: false,
                message: `Account is locked due to too many failed login attempts. Try again in ${remainingTime} minutes.`
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            // Increment failed login attempts
            const result = await incrementFailedAttempts(user.id);
            if (result.isLocked) {
                return res.status(423).json({
                    success: false,
                    message: 'Account has been locked due to too many failed login attempts. Try again in 30 minutes.'
                });
            }
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Reset failed login attempts on successful login
        await resetFailedAttempts(user.id);

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    isGoogleUser: user.isGoogleUser,
                    isGuest: user.isGuest,
                    isEmailVerified: user.isEmailVerified
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.post('/api/auth/guest', async (req, res) => {
    console.log('🔵 Guest login request received');
    try {
        const userId = uuidv4();
        const guestEmail = `guest-${Date.now()}@expensetracker.com`;

        console.log('🔵 Creating guest user:', { userId, guestEmail });

        // Hash password for guest user
        const hashedPassword = await bcrypt.hash('guest-password', 10);
        console.log('🔵 Password hashed');

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password, isGoogleUser, isGuest, isEmailVerified, failedLoginAttempts, timezone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, 'Guest', 'User', guestEmail, hashedPassword, false, true, false, 0, 'UTC'],
            function (err) {
                if (err) {
                    console.error('❌ Guest user creation error:', err);
                    console.error('Error code:', err.code);
                    console.error('Error message:', err.message);
                    // Check for duplicate email error
                    if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
                        // If email already exists, try again with a new timestamp
                        console.log('⚠️ Duplicate email, retrying...');
                        return res.status(500).json({
                            success: false,
                            message: 'Guest user creation failed. Please try again.'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Guest user creation failed',
                        error: err.message
                    });
                }

                console.log('✅ Guest user inserted successfully');
                console.log('Last ID:', this.lastID);
                console.log('Changes:', this.changes);

                const token = jwt.sign({ id: userId, email: guestEmail }, JWT_SECRET, { expiresIn: '24h' });
                console.log('✅ Token generated');

                const response = {
                    success: true,
                    message: 'Guest user created successfully',
                    data: {
                        token,
                        user: {
                            id: userId,
                            firstName: 'Guest',
                            lastName: 'User',
                            email: guestEmail,
                            isGoogleUser: false,
                            isGuest: true,
                            isEmailVerified: false
                        }
                    }
                };

                console.log('✅ Sending response:', JSON.stringify(response, null, 2));
                res.json(response);
            }
        );
    } catch (error) {
        console.error('❌ Guest user creation exception:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Guest user creation failed',
            error: error.message
        });
    }
});

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '600242847712-liumaiomcajui3jrc6do2ivk7dpq2vfk.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'postmessage');

app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body; // 'token' here is the authorization code

        if (!token) {
            return res.status(400).json({ success: false, message: 'Google auth code is required' });
        }

        // Exchange authorization code for tokens
        const { tokens } = await client.getToken(token);
        const idToken = tokens.id_token;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Failed to retrieve ID token from Google' });
        }

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const { email, given_name, family_name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account does not have an email address' });
        }

        // Check if user exists
        let user = await getUserByEmail(email);

        if (!user) {
            // Create new user
            const userId = uuidv4();
            user = {
                id: userId,
                firstName: given_name || 'Google',
                lastName: family_name || 'User',
                email,
                profilePicture: picture,
                isGoogleUser: true,
                isGuest: false
            };

            // Wait for database insert to complete before sending response
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (id, firstName, lastName, email, password, profilePicture, isGoogleUser, isGuest, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, user.firstName, user.lastName, email, 'google-password', picture, true, false, true], // Auto-verify email for Google Users
                    function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        } else {
            // Update existing user's profile picture if it changed (optional)
            // strict check for existing account linking would be better, but for now we assume email matches = same user
            if (!user.isGoogleUser) {
                // You might want to ask user to link accounts, but for simplicity here we can allow or block. 
                // Let's allow and update flag? Or just log them in. 
                // Let's update `isGoogleUser` to true if they sign in with Google
                await new Promise((resolve) => {
                    db.run('UPDATE users SET isGoogleUser = 1 WHERE id = ?', [user.id], () => resolve());
                });
            }
        }

        const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'Google sign-in successful',
            data: {
                token: jwtToken,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    isGoogleUser: true,
                    isGuest: user.isGuest,
                    isEmailVerified: true
                }
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ success: false, message: 'Google sign-in failed', error: error.message });
    }
});

// Expense routes
app.get('/api/expenses', authenticateToken, (req, res) => {
    const { category, startDate, endDate, search } = req.query;
    let query = 'SELECT * FROM expenses WHERE userId = ?';
    const params = [req.user.id];

    if (search) {
        query += ' AND description LIKE ?';
        params.push(`%${search}%`);
    }

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (startDate) {
        query += ' AND expenseDate >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND expenseDate <= ?';
        params.push(endDate);
    }

    query += ' ORDER BY expenseDate DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
        }
        res.json({ success: true, message: 'Expenses retrieved successfully', data: rows });
    });
});

app.post('/api/expenses', authenticateToken, (req, res) => {
    const { description, amount, category, expenseDate, notes, currency, groupId } = req.body;
    const expenseId = uuidv4();

    db.run(
        'INSERT INTO expenses (id, description, amount, category, expenseDate, notes, currency, userId, groupId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [expenseId, description, amount, category, expenseDate, notes, currency, req.user.id, groupId || null],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to create expense' });
            }

            res.json({
                success: true,
                message: 'Expense created successfully',
                data: {
                    id: expenseId,
                    description,
                    amount,
                    category,
                    expenseDate,
                    notes,
                    currency,
                    currency,
                    userId: req.user.id,
                    groupId: groupId || null
                }
            });
        }
    );
});

app.get('/api/expenses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM expenses WHERE id = ? AND userId = ?', [id, req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch expense' });
        }

        if (!row) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        res.json({ success: true, message: 'Expense retrieved successfully', data: row });
    });
});

app.put('/api/expenses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { description, amount, category, expenseDate, notes, currency } = req.body;

    db.run(
        'UPDATE expenses SET description = ?, amount = ?, category = ?, expenseDate = ?, notes = ?, currency = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?',
        [description, amount, category, expenseDate, notes, currency, id, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to update expense' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Expense not found' });
            }

            res.json({ success: true, message: 'Expense updated successfully' });
        }
    );
});

app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM expenses WHERE id = ? AND userId = ?', [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete expense' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        res.json({ success: true, message: 'Expense deleted successfully' });
    });
});

// Statistics routes
app.get('/api/expenses/statistics/totals', authenticateToken, (req, res) => {
    db.all('SELECT currency, SUM(amount) as total FROM expenses WHERE userId = ? GROUP BY currency', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch totals' });
        }

        const totals = {};
        rows.forEach(row => {
            totals[row.currency] = row.total;
        });

        res.json({ success: true, message: 'Totals retrieved successfully', data: totals });
    });
});

app.get('/api/expenses/statistics/categories', authenticateToken, (req, res) => {
    db.all('SELECT category, SUM(amount) as total FROM expenses WHERE userId = ? GROUP BY category ORDER BY total DESC', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch category totals' });
        }

        const categoryTotals = {};
        rows.forEach(row => {
            categoryTotals[row.category] = row.total;
        });

        res.json({ success: true, message: 'Category totals retrieved successfully', data: categoryTotals });
    });
});

// File upload route for receipts
app.post('/api/upload/receipt', authenticateToken, upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Mock OCR processing - in a real app, you'd use actual OCR
    const mockOcrData = {
        description: 'Receipt from ' + req.file.originalname,
        amount: Math.random() * 100 + 10,
        category: 'General',
        currency: 'USD'
    };

    res.json({
        success: true,
        message: 'Receipt uploaded and processed successfully',
        data: {
            fileUrl: `/uploads/${req.file.filename}`,
            ocrData: mockOcrData
        }
    });
});

// Email verification endpoint
app.get('/api/auth/verify-email', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    db.get(
        'SELECT * FROM users WHERE emailVerificationToken = ? AND emailVerificationExpires > ?',
        [token, new Date()],
        (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
            }

            // Update user as verified
            db.run(
                'UPDATE users SET isEmailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?',
                [user.id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Verification failed' });
                    }

                    res.json({ success: true, message: 'Email verified successfully' });
                }
            );
        }
    );
});

// Resend verification email
app.post('/api/auth/resend-verification', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        // Generate new verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        db.run(
            'UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = ? WHERE id = ?',
            [emailVerificationToken, emailVerificationExpires, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to update verification token' });
                }

                // Send verification email
                const emailTemplate = emailTemplates.verification(user.firstName, emailVerificationToken);
                emailTransporter.sendMail({
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: user.email,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html
                }).catch(err => {
                    console.error('Email sending failed:', err);
                });

                res.json({ success: true, message: 'Verification email sent successfully' });
            }
        );
    });
});

// Password reset request
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
            // Don't reveal if email exists or not
            return res.json({ success: true, message: 'If the email exists, a password reset link has been sent' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        db.run(
            'UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = ? WHERE id = ?',
            [resetToken, resetExpires, user.id],
            (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to generate reset token' });
                }

                // Send reset email
                const emailTemplate = emailTemplates.passwordReset(user.firstName, resetToken);
                emailTransporter.sendMail({
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: user.email,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html
                }).catch(err => {
                    console.error('Email sending failed:', err);
                });

                res.json({ success: true, message: 'If the email exists, a password reset link has been sent' });
            }
        );
    });
});

// Reset password with token
app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    // Validate password complexity
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors
        });
    }

    db.get(
        'SELECT * FROM users WHERE emailVerificationToken = ? AND emailVerificationExpires > ?',
        [token, new Date()],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and clear reset token
            db.run(
                'UPDATE users SET password = ?, emailVerificationToken = NULL, emailVerificationExpires = NULL, failedLoginAttempts = 0 WHERE id = ?',
                [hashedPassword, user.id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Password reset failed' });
                    }

                    res.json({ success: true, message: 'Password reset successfully' });
                }
            );
        }
    );
});

// Change password (for authenticated users)
app.post('/api/user/change-password', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    // Validate password complexity
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors
        });
    }

    // Get user from database
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        db.run(
            'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Password update failed' });
                }

                res.json({ success: true, message: 'Password updated successfully' });
            }
        );
    });
});

// Delete user account
app.delete('/api/user/account', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required to delete account' });
    }

    // Get user from database
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify password (skip for guest users)
        if (!user.isGuest) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ success: false, message: 'Incorrect password' });
            }
        }

        // Delete user's expenses
        db.run('DELETE FROM expenses WHERE userId = ?', [userId], (err) => {
            if (err) {
                console.error('Error deleting expenses:', err);
            }
        });

        // Delete user's budgets
        db.run('DELETE FROM budgets WHERE userId = ?', [userId], (err) => {
            if (err) {
                console.error('Error deleting budgets:', err);
            }
        });

        // Delete user's recurring expenses
        db.run('DELETE FROM recurring_expenses WHERE userId = ?', [userId], (err) => {
            if (err) {
                console.error('Error deleting recurring expenses:', err);
            }
        });

        // Delete user's categories
        db.run('DELETE FROM categories WHERE userId = ?', [userId], (err) => {
            if (err) {
                console.error('Error deleting categories:', err);
            }
        });

        // Delete user's settings
        db.run('DELETE FROM user_settings WHERE userId = ?', [userId], (err) => {
            if (err) {
                console.error('Error deleting user settings:', err);
            }
        });

        // Delete user account
        db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to delete account' });
            }

            res.json({ success: true, message: 'Account deleted successfully' });
        });
    });
});

// Update user settings (timezone, etc.)
app.put('/api/user/settings', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { timezone } = req.body;

    const updates = [];
    const values = [];

    if (timezone) {
        updates.push('timezone = ?');
        values.push(timezone);
    }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid updates provided' });
    }

    values.push(userId);

    db.run(
        `UPDATE users SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to update settings' });
            }

            res.json({ success: true, message: 'Settings updated successfully' });
        }
    );
});

// Export user data
app.get('/api/user/export', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM expenses WHERE userId = ? ORDER BY expenseDate DESC',
        [userId],
        (err, expenses) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to export data' });
            }

            const exportData = {
                user: req.user,
                expenses: expenses,
                exportDate: new Date().toISOString(),
                totalExpenses: expenses.length
            };

            res.json({ success: true, data: exportData });
        }
    );
});

// ==================== BUDGET ENDPOINTS ====================

// Create budget
app.post('/api/budgets', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { category, amount, currency, budgetMonth, notes, alertThreshold, isTemplate, templateName } = req.body;

    console.log('Budget creation request:', {
        userId,
        category,
        amount,
        currency,
        budgetMonth
    });


    if (!category || !amount || !currency || !budgetMonth) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if budget already exists for this category and month
    db.get(
        'SELECT * FROM budgets WHERE userId = ? AND category = ? AND budgetMonth = ?',
        [userId, category, budgetMonth],
        (err, existingBudget) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (existingBudget) {
                return res.status(400).json({ success: false, message: 'Budget already exists for this category and month' });
            }

            const budgetId = uuidv4();
            const now = new Date().toISOString();

            db.run(
                `INSERT INTO budgets (id, userId, category, amount, currency, budgetMonth, notes, alertThreshold, isTemplate, templateName, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [budgetId, userId, category, amount, currency, budgetMonth, notes || '', alertThreshold || 80, isTemplate || false, templateName || '', now, now],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Failed to create budget' });
                    }

                    res.json({
                        success: true,
                        message: 'Budget created successfully',
                        data: {
                            id: budgetId,
                            category,
                            amount,
                            currency,
                            budgetMonth,
                            notes: notes || '',
                            alertThreshold: alertThreshold || 80,
                            isTemplate: isTemplate || false,
                            templateName: templateName || '',
                            createdAt: now,
                            updatedAt: now
                        }
                    });
                }
            );
        }
    );
});

// Get budgets
app.get('/api/budgets', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { month } = req.query;

    let query = 'SELECT * FROM budgets WHERE userId = ?';
    let params = [userId];

    if (month) {
        query += ' AND budgetMonth = ?';
        params.push(month);
    }

    query += ' ORDER BY budgetMonth DESC, category ASC';

    db.all(query, params, (err, budgets) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Calculate monitoring data for each budget
        const budgetsWithMonitoring = budgets.map(budget => {
            return new Promise((resolve) => {
                // Calculate actual spending for this category in the budget month
                const budgetMonthStr = budget.budgetMonth; // e.g., "2025-09-01"
                const [year, month] = budgetMonthStr.split('-').map(Number);
                const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
                const lastDay = new Date(year, month, 0).getDate(); // Last day of the month
                const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

                db.all(
                    'SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND category = ? AND expenseDate >= ? AND expenseDate <= ?',
                    [userId, budget.category, startDate, endDate],
                    (err, result) => {
                        if (err) {
                            resolve({
                                ...budget,
                                actualSpent: 0,
                                remainingAmount: budget.amount,
                                utilizationPercentage: 0,
                                status: 'on_track',
                                alertTriggered: false
                            });
                            return;
                        }

                        const actualSpent = result[0]?.total || 0;
                        const remaining = budget.amount - actualSpent;
                        const utilizationPercentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

                        let status = 'on_track';
                        let alertTriggered = false;

                        if (utilizationPercentage >= 100) {
                            status = 'exceeded';
                            alertTriggered = true;
                        } else if (utilizationPercentage >= budget.alertThreshold) {
                            status = 'warning';
                            alertTriggered = true;
                        }

                        resolve({
                            ...budget,
                            actualSpent,
                            remainingAmount: remaining,
                            utilizationPercentage,
                            status,
                            alertTriggered
                        });
                    }
                );
            });
        });

        Promise.all(budgetsWithMonitoring).then(budgetsWithData => {
            res.json({
                success: true,
                message: 'Budgets retrieved successfully',
                data: budgetsWithData
            });
        });
    });
});

// Get budget by ID
app.get('/api/budgets/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const budgetId = req.params.id;

    db.get(
        'SELECT * FROM budgets WHERE id = ? AND userId = ?',
        [budgetId, userId],
        (err, budget) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (!budget) {
                return res.status(404).json({ success: false, message: 'Budget not found' });
            }

            // Calculate monitoring data
            const budgetMonthStr = budget.budgetMonth;
            const [year, month] = budgetMonthStr.split('-').map(Number);
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            db.all(
                'SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND category = ? AND expenseDate >= ? AND expenseDate <= ?',
                [userId, budget.category, startDate, endDate],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }

                    const actualSpent = result[0]?.total || 0;
                    const remaining = budget.amount - actualSpent;
                    const utilizationPercentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

                    let status = 'on_track';
                    let alertTriggered = false;

                    if (utilizationPercentage >= 100) {
                        status = 'exceeded';
                        alertTriggered = true;
                    } else if (utilizationPercentage >= budget.alertThreshold) {
                        status = 'warning';
                        alertTriggered = true;
                    }

                    res.json({
                        success: true,
                        message: 'Budget retrieved successfully',
                        data: {
                            ...budget,
                            actualSpent,
                            remainingAmount: remaining,
                            utilizationPercentage,
                            status,
                            alertTriggered
                        }
                    });
                }
            );
        }
    );
});

// Update budget
app.put('/api/budgets/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { category, amount, currency, budgetMonth, notes, alertThreshold, isTemplate, templateName } = req.body;

    if (!category || !amount || !currency || !budgetMonth) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if budget exists and belongs to user
    db.get(
        'SELECT * FROM budgets WHERE id = ? AND userId = ?',
        [budgetId, userId],
        (err, existingBudget) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (!existingBudget) {
                return res.status(404).json({ success: false, message: 'Budget not found' });
            }

            // Check if updating to a different category/month combination that already exists
            if (existingBudget.category !== category || existingBudget.budgetMonth !== budgetMonth) {
                db.get(
                    'SELECT * FROM budgets WHERE userId = ? AND category = ? AND budgetMonth = ? AND id != ?',
                    [userId, category, budgetMonth, budgetId],
                    (err, conflictBudget) => {
                        if (err) {
                            return res.status(500).json({ success: false, message: 'Database error' });
                        }

                        if (conflictBudget) {
                            return res.status(400).json({ success: false, message: 'Budget already exists for this category and month' });
                        }

                        updateBudget();
                    }
                );
            } else {
                updateBudget();
            }

            function updateBudget() {
                const now = new Date().toISOString();

                db.run(
                    `UPDATE budgets SET category = ?, amount = ?, currency = ?, budgetMonth = ?, notes = ?, 
                     alertThreshold = ?, isTemplate = ?, templateName = ?, updatedAt = ? WHERE id = ? AND userId = ?`,
                    [category, amount, currency, budgetMonth, notes || '', alertThreshold || 80, isTemplate || false, templateName || '', now, budgetId, userId],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ success: false, message: 'Failed to update budget' });
                        }

                        res.json({
                            success: true,
                            message: 'Budget updated successfully',
                            data: {
                                id: budgetId,
                                category,
                                amount,
                                currency,
                                budgetMonth,
                                notes: notes || '',
                                alertThreshold: alertThreshold || 80,
                                isTemplate: isTemplate || false,
                                templateName: templateName || '',
                                updatedAt: now
                            }
                        });
                    }
                );
            }
        }
    );
});

// Delete budget
app.delete('/api/budgets/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const budgetId = req.params.id;

    db.run(
        'DELETE FROM budgets WHERE id = ? AND userId = ?',
        [budgetId, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Budget not found' });
            }

            res.json({ success: true, message: 'Budget deleted successfully' });
        }
    );
});

// Create budgets from template
app.post('/api/budgets/templates/:templateName/create', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const templateName = req.params.templateName;
    const { targetMonth } = req.query;

    if (!targetMonth) {
        return res.status(400).json({ success: false, message: 'Target month is required' });
    }

    // Get template budgets
    db.all(
        'SELECT * FROM budgets WHERE userId = ? AND isTemplate = 1 AND templateName = ?',
        [userId, templateName],
        (err, templates) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (templates.length === 0) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }

            const newBudgets = [];
            let completed = 0;

            templates.forEach(template => {
                // Check if budget already exists for this category and month
                db.get(
                    'SELECT * FROM budgets WHERE userId = ? AND category = ? AND budgetMonth = ?',
                    [userId, template.category, targetMonth],
                    (err, existingBudget) => {
                        if (err) {
                            completed++;
                            if (completed === templates.length) {
                                return res.status(500).json({ success: false, message: 'Database error' });
                            }
                            return;
                        }

                        if (!existingBudget) {
                            const budgetId = uuidv4();
                            const now = new Date().toISOString();

                            db.run(
                                `INSERT INTO budgets (id, userId, category, amount, currency, budgetMonth, notes, alertThreshold, isTemplate, templateName, createdAt, updatedAt)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [budgetId, userId, template.category, template.amount, template.currency, targetMonth, template.notes, template.alertThreshold, false, '', now, now],
                                function (err) {
                                    if (!err) {
                                        newBudgets.push({
                                            id: budgetId,
                                            category: template.category,
                                            amount: template.amount,
                                            currency: template.currency,
                                            budgetMonth: targetMonth,
                                            notes: template.notes,
                                            alertThreshold: template.alertThreshold,
                                            isTemplate: false,
                                            templateName: '',
                                            createdAt: now,
                                            updatedAt: now
                                        });
                                    }

                                    completed++;
                                    if (completed === templates.length) {
                                        res.json({
                                            success: true,
                                            message: 'Budgets created from template successfully',
                                            data: newBudgets
                                        });
                                    }
                                }
                            );
                        } else {
                            completed++;
                            if (completed === templates.length) {
                                res.json({
                                    success: true,
                                    message: 'Budgets created from template successfully',
                                    data: newBudgets
                                });
                            }
                        }
                    }
                );
            });
        }
    );
});

// Copy budgets to next month
app.post('/api/budgets/copy-to-next-month', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { sourceMonth } = req.query;

    if (!sourceMonth) {
        return res.status(400).json({ success: false, message: 'Source month is required' });
    }

    // Calculate next month
    const sourceDate = new Date(sourceMonth);
    const nextMonth = new Date(sourceDate.getFullYear(), sourceDate.getMonth() + 1, 1).toISOString().split('T')[0];

    // Get source budgets
    db.all(
        'SELECT * FROM budgets WHERE userId = ? AND budgetMonth = ?',
        [userId, sourceMonth],
        (err, sourceBudgets) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const newBudgets = [];
            let completed = 0;

            if (sourceBudgets.length === 0) {
                return res.json({
                    success: true,
                    message: 'No budgets to copy',
                    data: []
                });
            }

            sourceBudgets.forEach(sourceBudget => {
                // Check if budget already exists for next month
                db.get(
                    'SELECT * FROM budgets WHERE userId = ? AND category = ? AND budgetMonth = ?',
                    [userId, sourceBudget.category, nextMonth],
                    (err, existingBudget) => {
                        if (err) {
                            completed++;
                            if (completed === sourceBudgets.length) {
                                return res.status(500).json({ success: false, message: 'Database error' });
                            }
                            return;
                        }

                        if (!existingBudget) {
                            const budgetId = uuidv4();
                            const now = new Date().toISOString();

                            db.run(
                                `INSERT INTO budgets (id, userId, category, amount, currency, budgetMonth, notes, alertThreshold, isTemplate, templateName, createdAt, updatedAt)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [budgetId, userId, sourceBudget.category, sourceBudget.amount, sourceBudget.currency, nextMonth, sourceBudget.notes, sourceBudget.alertThreshold, false, '', now, now],
                                function (err) {
                                    if (!err) {
                                        newBudgets.push({
                                            id: budgetId,
                                            category: sourceBudget.category,
                                            amount: sourceBudget.amount,
                                            currency: sourceBudget.currency,
                                            budgetMonth: nextMonth,
                                            notes: sourceBudget.notes,
                                            alertThreshold: sourceBudget.alertThreshold,
                                            isTemplate: false,
                                            templateName: '',
                                            createdAt: now,
                                            updatedAt: now
                                        });
                                    }

                                    completed++;
                                    if (completed === sourceBudgets.length) {
                                        res.json({
                                            success: true,
                                            message: 'Budgets copied to next month successfully',
                                            data: newBudgets
                                        });
                                    }
                                }
                            );
                        } else {
                            completed++;
                            if (completed === sourceBudgets.length) {
                                res.json({
                                    success: true,
                                    message: 'Budgets copied to next month successfully',
                                    data: newBudgets
                                });
                            }
                        }
                    }
                );
            });
        }
    );
});

// Get budget templates
app.get('/api/budgets/templates', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM budgets WHERE userId = ? AND isTemplate = 1 ORDER BY templateName ASC, category ASC',
        [userId],
        (err, templates) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({
                success: true,
                message: 'Budget templates retrieved successfully',
                data: templates
            });
        }
    );
});

// Get budget summary
app.get('/api/budgets/summary', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { month } = req.query;

    console.log('Budget summary request:', { userId, month });
    console.log('Authenticated user:', req.user);

    if (!month) {
        return res.status(400).json({ success: false, message: 'Month is required' });
    }

    // Get budgets for the month
    db.all(
        'SELECT * FROM budgets WHERE userId = ? AND budgetMonth = ?',
        [userId, month],
        (err, budgets) => {
            if (err) {
                console.log('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            console.log('Found budgets:', budgets.length);
            console.log('Query params:', { userId, month });

            if (budgets.length === 0) {
                console.log('No budgets found for this month, returning empty summary');
                return res.json({
                    success: true,
                    data: {
                        totalBudget: 0,
                        totalSpent: 0,
                        remaining: 0,
                        utilizationPercentage: 0,
                        budgets: []
                    }
                });
            }

            const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

            // Calculate total spent for the month
            const [year, monthNum] = month.split('-').map(Number);
            const startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
            const lastDay = new Date(year, monthNum, 0).getDate();
            const endDate = `${year}-${monthNum.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            db.all(
                'SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND expenseDate >= ? AND expenseDate <= ?',
                [userId, startDate, endDate],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }

                    const totalSpent = result[0]?.total || 0;
                    const remaining = totalBudget - totalSpent;
                    const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

                    res.json({
                        success: true,
                        message: 'Budget summary retrieved successfully',
                        data: {
                            totalBudget,
                            totalSpent,
                            remaining,
                            utilizationPercentage,
                            budgetCount: budgets.length,
                            budgetMonth: month
                        }
                    });
                }
            );
        }
    );
});

// --- Split Feature Routes ---

// Search users for groups
app.get('/api/users/search', authenticateToken, (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${query}%`;
    db.all(
        'SELECT id, firstName, lastName, email, profilePicture FROM users WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?) AND id != ? LIMIT 10',
        [searchTerm, searchTerm, searchTerm, req.user.id],
        (err, rows) => {
            if (err) return handleError(res, err, 'User search failed');
            res.json({ success: true, data: rows });
        }
    );
});

// List groups
app.get('/api/groups', authenticateToken, (req, res) => {
    const query = `
        SELECT g.*, 
        (SELECT COUNT(*) FROM group_members WHERE groupId = g.id) as memberCount,
        (SELECT MAX(expenseDate) FROM group_expenses WHERE groupId = g.id) as lastExpenseDate,
        (SELECT description FROM group_expenses WHERE groupId = g.id ORDER BY expenseDate DESC, createdAt DESC LIMIT 1) as lastExpenseSummary
        FROM groups g
        JOIN group_members gm ON g.id = gm.groupId
        WHERE gm.userId = ?
        ORDER BY g.updatedAt DESC
    `;

    db.all(query, [req.user.id], (err, groups) => {
        if (err) return handleError(res, err, 'Failed to list groups');

        // For each group, calculate the user's balance
        const groupsWithBalance = [];
        const processGroup = (index) => {
            if (index >= groups.length) {
                return res.json({ success: true, data: groupsWithBalance });
            }

            const group = groups[index];
            const balanceQuery = `
                SELECT 
                    (SELECT IFNULL(SUM(amount), 0) FROM group_expenses WHERE groupId = ? AND payerId = ?) as totalPaid,
                    (SELECT IFNULL(SUM(amount), 0) FROM expense_splits es JOIN group_expenses ge ON es.expenseId = ge.id WHERE ge.groupId = ? AND es.userId = ?) as totalOwed
            `;
            db.get(balanceQuery, [group.id, req.user.id, group.id, req.user.id], (err, balance) => {
                const myBalance = (balance?.totalPaid || 0) - (balance?.totalOwed || 0);

                // Also get icons/avatars for members
                db.all('SELECT u.profilePicture, u.firstName FROM users u JOIN group_members gm ON u.id = gm.userId WHERE gm.groupId = ? LIMIT 3', [group.id], (err, members) => {
                    groupsWithBalance.push({
                        ...group,
                        myBalance,
                        members: members || []
                    });
                    processGroup(index + 1);
                });
            });
        };

        processGroup(0);
    });
});

// Create group
app.post('/api/groups', authenticateToken, (req, res) => {
    const { name, description, memberIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });

    const groupId = uuidv4();
    const createdBy = req.user.id;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO groups (id, name, description, createdBy, includeInBudget, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [groupId, name, description, createdBy, req.body.includeInBudget !== false ? 1 : 0, req.body.startDate || null, req.body.endDate || null]
        );

        // Add creator as admin
        db.run(
            'INSERT INTO group_members (id, groupId, userId, role) VALUES (?, ?, ?, ?)',
            [uuidv4(), groupId, createdBy, 'admin']
        );

        // Add other members
        if (memberIds && Array.isArray(memberIds)) {
            memberIds.forEach(userId => {
                if (userId !== createdBy) {
                    db.run(
                        'INSERT INTO group_members (id, groupId, userId, role) VALUES (?, ?, ?, ?)',
                        [uuidv4(), groupId, userId, 'member']
                    );
                }
            });
        }

        db.run('COMMIT', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return handleError(res, err, 'Failed to create group');
            }
            res.json({ success: true, data: { id: groupId, name, description } });
        });
    });
});

// Get group details
app.get('/api/groups/:id', authenticateToken, (req, res) => {
    const groupId = req.params.id;

    // Verify membership
    db.get('SELECT * FROM group_members WHERE groupId = ? AND userId = ?', [groupId, req.user.id], (err, membership) => {
        if (err || !membership) return res.status(403).json({ success: false, message: 'Access denied' });

        db.get('SELECT * FROM groups WHERE id = ?', [groupId], (err, group) => {
            if (err || !group) return res.status(404).json({ success: false, message: 'Group not found' });

            // Get members
            db.all(
                'SELECT u.id, u.firstName, u.lastName, u.email, u.profilePicture, gm.role FROM users u JOIN group_members gm ON u.id = gm.userId WHERE gm.groupId = ?',
                [groupId],
                (err, members) => {
                    // Get expenses
                    db.all(
                        'SELECT ge.*, u.firstName as payerName, u.profilePicture as payerAvatar FROM group_expenses ge JOIN users u ON ge.payerId = u.id WHERE ge.groupId = ? ORDER BY ge.expenseDate DESC, ge.createdAt DESC',
                        [groupId],
                        (err, expenses) => {
                            // Calculate balances
                            const balanceQuery = `
                                SELECT 
                                    (SELECT IFNULL(SUM(amount), 0) FROM group_expenses WHERE groupId = ? AND payerId = ?) as totalPaid,
                                    (SELECT IFNULL(SUM(amount), 0) FROM expense_splits es JOIN group_expenses ge ON es.expenseId = ge.id WHERE ge.groupId = ? AND es.userId = ?) as totalOwed
                            `;
                            db.get(balanceQuery, [groupId, req.user.id, groupId, req.user.id], (err, balance) => {
                                res.json({
                                    success: true,
                                    data: {
                                        ...group,
                                        members,
                                        expenses,
                                        myBalance: (balance?.totalPaid || 0) - (balance?.totalOwed || 0)
                                    }
                                });
                            });
                        }
                    );
                }
            );
        });
    });
});

// Delete group
app.delete('/api/groups/:id', authenticateToken, (req, res) => {
    const groupId = req.params.id;
    const userId = req.user.id;

    // Check if user is admin/creator of the group
    db.get('SELECT * FROM groups WHERE id = ?', [groupId], (err, group) => {
        if (err) return handleError(res, err, 'Database error');
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        if (group.createdBy !== userId) {
            return res.status(403).json({ success: false, message: 'Only the group creator can delete this group' });
        }

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Delete group members
            db.run('DELETE FROM group_members WHERE groupId = ?', [groupId]);

            // Delete group expenses and their splits
            db.all('SELECT id FROM group_expenses WHERE groupId = ?', [groupId], (err, expenses) => {
                if (!err && expenses && expenses.length > 0) {
                    const expenseIds = expenses.map(e => e.id);
                    const placeholders = expenseIds.map(() => '?').join(',');
                    db.run(`DELETE FROM expense_splits WHERE expenseId IN (${placeholders})`, expenseIds);
                }

                // Now delete group expenses
                db.run('DELETE FROM group_expenses WHERE groupId = ?', [groupId]);

                // Unlink regular expenses if any
                db.run('UPDATE expenses SET groupId = NULL WHERE groupId = ?', [groupId]);

                // Delete the group
                db.run('DELETE FROM groups WHERE id = ?', [groupId], function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return handleError(res, err, 'Failed to delete group');
                    }
                    db.run('COMMIT', (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return handleError(res, err, 'Failed to commit delete');
                        }
                        res.json({ success: true, message: 'Group deleted successfully' });
                    });
                });
            });
        });
    });
});

// Add shared expense
app.post('/api/groups/:id/expenses', authenticateToken, (req, res) => {
    const groupId = req.params.id;
    const { description, amount, category, expenseDate, payerId, splits, notes } = req.body;

    if (!description || !amount || !payerId || !splits) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const expenseId = uuidv4();

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO group_expenses (id, groupId, payerId, amount, description, expenseDate, category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [expenseId, groupId, payerId, amount, description, expenseDate, category, notes]
        );

        splits.forEach(split => {
            db.run(
                'INSERT INTO expense_splits (id, expenseId, userId, amount) VALUES (?, ?, ?, ?)',
                [uuidv4(), expenseId, split.userId, split.amount]
            );
        });

        // Update group timestamp
        db.run('UPDATE groups SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [groupId]);

        db.run('COMMIT', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return handleError(res, err, 'Failed to add shared expense');
            }
            res.json({ success: true, message: 'Expense added successfully' });
        });
    });
});

// Settle balance
app.post('/api/groups/:id/settle', authenticateToken, (req, res) => {
    const groupId = req.params.id;
    const { amount, toUserId } = req.body;

    if (!amount || !toUserId) return res.status(400).json({ success: false, message: 'Amount and target user required' });

    const expenseId = uuidv4();
    const description = 'Settlement';
    const date = new Date().toISOString().split('T')[0];

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO group_expenses (id, groupId, payerId, amount, description, expenseDate, category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [expenseId, groupId, req.user.id, amount, description, date, 'Other', 'Balance settlement']
        );

        db.run(
            'INSERT INTO expense_splits (id, expenseId, userId, amount, isSettled) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), expenseId, toUserId, amount, 1]
        );

        db.run('UPDATE groups SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [groupId]);

        db.run('COMMIT', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return handleError(res, err, 'Settlement failed');
            }
            res.json({ success: true, message: 'Settlement recorded' });
        });
    });
});

// --- Analytics API endpoints ---
app.get('/api/analytics/spending-overview', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { timeRange = 'month' } = req.query;

    let dateFilter = '';
    let params = [userId];

    switch (timeRange) {
        case 'today':
            dateFilter = 'AND DATE(date) = DATE("now")';
            break;
        case 'week':
            dateFilter = 'AND date >= datetime("now", "-7 days")';
            break;
        case 'month':
            dateFilter = 'AND date >= datetime("now", "start of month")';
            break;
        case 'year':
            dateFilter = 'AND date >= datetime("now", "start of year")';
            break;
        default:
            dateFilter = '';
    }

    const query = `
        SELECT 
            SUM(amount) as totalSpending,
            COUNT(*) as transactionCount,
            AVG(amount) as averageAmount,
            currency
        FROM expenses 
        WHERE userId = ? ${dateFilter}
        GROUP BY currency
    `;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error getting spending overview:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, data: rows });
    });
});

app.get('/api/analytics/category-breakdown', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { timeRange = 'month' } = req.query;

    let dateFilter = '';
    let params = [userId];

    switch (timeRange) {
        case 'today':
            dateFilter = 'AND DATE(date) = DATE("now")';
            break;
        case 'week':
            dateFilter = 'AND date >= datetime("now", "-7 days")';
            break;
        case 'month':
            dateFilter = 'AND date >= datetime("now", "start of month")';
            break;
        case 'year':
            dateFilter = 'AND date >= datetime("now", "start of year")';
            break;
        default:
            dateFilter = '';
    }

    const query = `
        SELECT 
            category,
            SUM(amount) as totalAmount,
            COUNT(*) as transactionCount,
            currency
        FROM expenses 
        WHERE userId = ? ${dateFilter}
        GROUP BY category, currency
        ORDER BY totalAmount DESC
    `;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error getting category breakdown:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, data: rows });
    });
});

app.get('/api/analytics/monthly-trend', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { months = 12 } = req.query;

    const query = `
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(amount) as totalAmount,
            currency
        FROM expenses 
        WHERE userId = ? 
        AND date >= datetime('now', '-${parseInt(months)} months')
        GROUP BY strftime('%Y-%m', date), currency
        ORDER BY month ASC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Database error getting monthly trend:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, data: rows });
    });
});

app.get('/api/analytics/top-expenses', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { limit = 10, timeRange = 'month' } = req.query;

    let dateFilter = '';
    let params = [userId];

    switch (timeRange) {
        case 'today':
            dateFilter = 'AND DATE(date) = DATE("now")';
            break;
        case 'week':
            dateFilter = 'AND date >= datetime("now", "-7 days")';
            break;
        case 'month':
            dateFilter = 'AND date >= datetime("now", "start of month")';
            break;
        case 'year':
            dateFilter = 'AND date >= datetime("now", "start of year")';
            break;
        default:
            dateFilter = '';
    }

    const query = `
        SELECT * FROM expenses 
        WHERE userId = ? ${dateFilter}
        ORDER BY amount DESC 
        LIMIT ?
    `;

    params.push(parseInt(limit));

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error getting top expenses:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, data: rows });
    });
});

app.get('/api/analytics/insights', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Get this month vs last month comparison
    const thisMonthQuery = `
        SELECT SUM(amount) as totalAmount, currency
        FROM expenses 
        WHERE userId = ? 
        AND date >= datetime('now', 'start of month')
        GROUP BY currency
    `;

    const lastMonthQuery = `
        SELECT SUM(amount) as totalAmount, currency
        FROM expenses 
        WHERE userId = ? 
        AND date >= datetime('now', 'start of month', '-1 month')
        AND date < datetime('now', 'start of month')
        GROUP BY currency
    `;

    const averageDailyQuery = `
        SELECT 
            SUM(amount) as totalAmount,
            COUNT(DISTINCT DATE(date)) as daysWithExpenses,
            currency
        FROM expenses 
        WHERE userId = ? 
        AND date >= datetime('now', 'start of month')
        GROUP BY currency
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            db.all(thisMonthQuery, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(lastMonthQuery, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(averageDailyQuery, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        })
    ]).then(([thisMonth, lastMonth, averageDaily]) => {
        res.json({
            success: true,
            data: {
                thisMonth,
                lastMonth,
                averageDaily
            }
        });
    }).catch(err => {
        console.error('Database error getting insights:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    });
});

// ==================== DATA MANAGEMENT ENDPOINTS ====================

// CSV Export - Export all user data to CSV
app.get('/api/data/export/csv', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Get all user data
    db.all(
        `SELECT 
            e.id, e.description, e.amount, e.category, e.expenseDate, e.notes, e.currency,
            b.amount as budget_amount, b.budgetMonth, b.alertThreshold
        FROM expenses e
        LEFT JOIN budgets b ON e.userId = b.userId AND e.category = b.category
        WHERE e.userId = ?
        ORDER BY e.expenseDate DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            // Convert to CSV
            const csvHeader = 'ID,Description,Amount,Category,Date,Notes,Currency,Budget Amount,Budget Month,Alert Threshold\n';
            const csvData = rows.map(row =>
                `"${row.id}","${row.description}","${row.amount}","${row.category}","${row.expenseDate}","${row.notes || ''}","${row.currency}","${row.budget_amount || ''}","${row.budgetMonth || ''}","${row.alertThreshold || ''}"`
            ).join('\n');

            const csv = csvHeader + csvData;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="expense-data-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        }
    );
});

// CSV Import - Import expenses from CSV
app.post('/api/data/import/csv', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { csvData } = req.body;

    if (!csvData) {
        return res.status(400).json({ success: false, message: 'CSV data is required' });
    }

    try {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

        const expenses = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());

                if (values.length >= 5) {
                    const expense = {
                        id: uuidv4(),
                        description: values[1] || 'Imported Expense',
                        amount: parseFloat(values[2]) || 0,
                        category: values[3] || 'Other',
                        expenseDate: values[4] || new Date().toISOString().split('T')[0],
                        notes: values[5] || '',
                        currency: values[6] || 'USD',
                        userId: userId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    expenses.push(expense);
                } else {
                    errors.push(`Row ${i + 1}: Insufficient data`);
                }
            }
        }

        // Insert expenses
        let completed = 0;
        const insertedExpenses = [];

        if (expenses.length === 0) {
            return res.json({
                success: true,
                message: 'No valid expenses to import',
                data: { imported: 0, errors: errors.length }
            });
        }

        expenses.forEach(expense => {
            db.run(
                `INSERT INTO expenses (id, description, amount, category, expenseDate, notes, currency, userId, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [expense.id, expense.description, expense.amount, expense.category, expense.expenseDate,
                expense.notes, expense.currency, expense.userId, expense.createdAt, expense.updatedAt],
                function (err) {
                    if (err) {
                        errors.push(`Failed to import: ${expense.description}`);
                    } else {
                        insertedExpenses.push(expense);
                    }

                    completed++;
                    if (completed === expenses.length) {
                        res.json({
                            success: true,
                            message: `Imported ${insertedExpenses.length} expenses successfully`,
                            data: {
                                imported: insertedExpenses.length,
                                errors: errors.length,
                                errorDetails: errors
                            }
                        });
                    }
                }
            );
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing CSV data' });
    }
});

// PDF Report Generation
app.get('/api/data/export/pdf', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    let query = 'SELECT * FROM expenses WHERE userId = ?';
    let params = [userId];

    if (startDate) {
        query += ' AND expenseDate >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND expenseDate <= ?';
        params.push(endDate);
    }

    if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
    }

    query += ' ORDER BY expenseDate DESC';

    db.all(query, params, (err, expenses) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Calculate summary data
        const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const categoryBreakdown = {};
        expenses.forEach(expense => {
            categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + parseFloat(expense.amount);
        });

        // Generate HTML report
        const htmlReport = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Expense Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
                .category { margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Expense Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                ${startDate && endDate ? `<p>Period: ${startDate} to ${endDate}</p>` : ''}
            </div>
            
            <div class="summary">
                <h3>Summary</h3>
                <p><strong>Total Expenses:</strong> ${expenses.length}</p>
                <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                
                <h4>Category Breakdown:</h4>
                ${Object.entries(categoryBreakdown).map(([cat, amount]) =>
            `<div class="category">${cat}: $${amount.toFixed(2)}</div>`
        ).join('')}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(expense => `
                        <tr>
                            <td>${expense.expenseDate}</td>
                            <td>${expense.description}</td>
                            <td>${expense.category}</td>
                            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                            <td>${expense.notes || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="expense-report-${new Date().toISOString().split('T')[0]}.html"`);
        res.send(htmlReport);
    });
});

// Data Backup - Export all user data as JSON
app.get('/api/data/backup', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Get all user data
    db.all('SELECT * FROM expenses WHERE userId = ?', [userId], (err, expenses) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        db.all('SELECT * FROM budgets WHERE userId = ?', [userId], (err, budgets) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const backupData = {
                exportDate: new Date().toISOString(),
                userId: userId,
                expenses: expenses,
                budgets: budgets,
                metadata: {
                    totalExpenses: expenses.length,
                    totalBudgets: budgets.length,
                    totalAmount: expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
                }
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="expense-backup-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(backupData);
        });
    });
});

// ==================== RECURRING EXPENSES ENDPOINTS ====================

// Create recurring expense
app.post('/api/recurring-expenses', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { description, amount, category, pattern, startDate, endDate, notes, currency } = req.body;

    if (!description || !amount || !category || !pattern || !startDate) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const recurringExpense = {
        id: uuidv4(),
        userId: userId,
        description: description,
        amount: parseFloat(amount),
        category: category,
        pattern: pattern, // 'weekly', 'monthly', 'yearly'
        startDate: startDate,
        endDate: endDate || null,
        notes: notes || '',
        currency: currency || 'USD',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.run(
        `INSERT INTO recurring_expenses (id, userId, description, amount, category, pattern, startDate, endDate, notes, currency, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [recurringExpense.id, recurringExpense.userId, recurringExpense.description, recurringExpense.amount,
        recurringExpense.category, recurringExpense.pattern, recurringExpense.startDate, recurringExpense.endDate,
        recurringExpense.notes, recurringExpense.currency, recurringExpense.isActive, recurringExpense.createdAt, recurringExpense.updatedAt],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error creating recurring expense' });
            }

            res.json({
                success: true,
                message: 'Recurring expense created successfully',
                data: { ...recurringExpense, rowId: this.lastID }
            });
        }
    );
});

// Get recurring expenses
app.get('/api/recurring-expenses', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM recurring_expenses WHERE userId = ? ORDER BY createdAt DESC',
        [userId],
        (err, recurringExpenses) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({
                success: true,
                message: 'Recurring expenses retrieved successfully',
                data: recurringExpenses
            });
        }
    );
});

// Update recurring expense
app.put('/api/recurring-expenses/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { description, amount, category, pattern, startDate, endDate, notes, currency, isActive } = req.body;

    db.run(
        `UPDATE recurring_expenses 
         SET description = ?, amount = ?, category = ?, pattern = ?, startDate = ?, endDate = ?, notes = ?, currency = ?, isActive = ?, updatedAt = ?
         WHERE id = ? AND userId = ?`,
        [description, amount, category, pattern, startDate, endDate, notes, currency, isActive, new Date().toISOString(), id, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error updating recurring expense' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Recurring expense not found' });
            }

            res.json({
                success: true,
                message: 'Recurring expense updated successfully'
            });
        }
    );
});

// Delete recurring expense
app.delete('/api/recurring-expenses/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    db.run(
        'DELETE FROM recurring_expenses WHERE id = ? AND userId = ?',
        [id, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error deleting recurring expense' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Recurring expense not found' });
            }

            res.json({
                success: true,
                message: 'Recurring expense deleted successfully'
            });
        }
    );
});

// Generate expenses from recurring patterns
app.post('/api/recurring-expenses/generate', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { upToDate } = req.body;

    const targetDate = upToDate || new Date().toISOString().split('T')[0];

    db.all(
        'SELECT * FROM recurring_expenses WHERE userId = ? AND isActive = 1',
        [userId],
        (err, recurringExpenses) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const generatedExpenses = [];
            let completed = 0;

            if (recurringExpenses.length === 0) {
                return res.json({
                    success: true,
                    message: 'No active recurring expenses found',
                    data: { generated: 0 }
                });
            }

            recurringExpenses.forEach(recurring => {
                const startDate = new Date(recurring.startDate);
                const endDate = recurring.endDate ? new Date(recurring.endDate) : new Date(targetDate);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    // Check if expense already exists for this date
                    const expenseDate = currentDate.toISOString().split('T')[0];

                    db.get(
                        'SELECT id FROM expenses WHERE userId = ? AND description = ? AND expenseDate = ?',
                        [userId, recurring.description, expenseDate],
                        (err, existing) => {
                            if (!err && !existing) {
                                const expense = {
                                    id: uuidv4(),
                                    description: recurring.description,
                                    amount: recurring.amount,
                                    category: recurring.category,
                                    expenseDate: expenseDate,
                                    notes: recurring.notes,
                                    currency: recurring.currency,
                                    userId: userId,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                };

                                db.run(
                                    `INSERT INTO expenses (id, description, amount, category, expenseDate, notes, currency, userId, createdAt, updatedAt)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [expense.id, expense.description, expense.amount, expense.category, expense.expenseDate,
                                    expense.notes, expense.currency, expense.userId, expense.createdAt, expense.updatedAt],
                                    function (err) {
                                        if (!err) {
                                            generatedExpenses.push(expense);
                                        }

                                        completed++;
                                        if (completed === recurringExpenses.length) {
                                            res.json({
                                                success: true,
                                                message: `Generated ${generatedExpenses.length} expenses from recurring patterns`,
                                                data: { generated: generatedExpenses.length, expenses: generatedExpenses }
                                            });
                                        }
                                    }
                                );
                            } else {
                                completed++;
                                if (completed === recurringExpenses.length) {
                                    res.json({
                                        success: true,
                                        message: `Generated ${generatedExpenses.length} expenses from recurring patterns`,
                                        data: { generated: generatedExpenses.length, expenses: generatedExpenses }
                                    });
                                }
                            }
                        }
                    );

                    // Move to next occurrence
                    switch (recurring.pattern) {
                        case 'weekly':
                            currentDate.setDate(currentDate.getDate() + 7);
                            break;
                        case 'monthly':
                            currentDate.setMonth(currentDate.getMonth() + 1);
                            break;
                        case 'yearly':
                            currentDate.setFullYear(currentDate.getFullYear() + 1);
                            break;
                    }
                }
            });
        }
    );
});

// Start server
app.listen(PORT, 'localhost', () => {
    console.log(`\n✅ Server is running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`👤 Guest login: http://localhost:${PORT}/api/auth/guest`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
