const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3004'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('uploads'));

// Database setup
const db = new sqlite3.Database('expense_tracker.db');

// Initialize database tables
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

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
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
    res.json({ success: true, message: 'Server is running' });
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

app.post('/api/auth/guest', (req, res) => {
    try {
        const userId = uuidv4();
        const guestEmail = `guest-${Date.now()}@expensetracker.com`;

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password, isGoogleUser, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, 'Guest', 'User', guestEmail, 'guest-password', false, true],
            function (err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Guest user creation failed' });
                }

                const token = jwt.sign({ id: userId, email: guestEmail }, JWT_SECRET, { expiresIn: '24h' });

                res.json({
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
                            isGuest: true
                        }
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: 'Guest user creation failed' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { email, firstName, lastName, profilePicture } = req.body;

        // Check if user exists
        let user = await getUserByEmail(email);

        if (!user) {
            // Create new user
            const userId = uuidv4();
            user = {
                id: userId,
                firstName,
                lastName,
                email,
                profilePicture,
                isGoogleUser: true,
                isGuest: false
            };

            db.run(
                'INSERT INTO users (id, firstName, lastName, email, password, profilePicture, isGoogleUser, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, firstName, lastName, email, 'google-password', profilePicture, true, false],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Google sign-in failed' });
                    }
                }
            );
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'Google sign-in successful',
            data: {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    isGoogleUser: user.isGoogleUser,
                    isGuest: user.isGuest
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Google sign-in failed' });
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
    const { description, amount, category, expenseDate, notes, currency } = req.body;
    const expenseId = uuidv4();

    db.run(
        'INSERT INTO expenses (id, description, amount, category, expenseDate, notes, currency, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [expenseId, description, amount, category, expenseDate, notes, currency, req.user.id],
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
                    userId: req.user.id
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
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
