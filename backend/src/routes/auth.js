const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, getUserByEmail, handleError } = require('../config/database');
const { JWT_SECRET } = require('../config/constants');
const { authLimiter } = require('../middleware/rateLimiters');
const { validateEmail, validatePassword } = require('../utils/validation');
const { checkAccountLockout, incrementFailedAttempts, resetFailedAttempts } = require('../utils/authHelpers');

const signToken = (id, email) => jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '24h' });

// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'First and last name are required' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const passVal = validatePassword(password || '');
        if (!passVal.isValid) {
            return res.status(400).json({ success: false, message: 'Password too weak', errors: passVal.errors });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)',
            [userId, firstName, lastName, email, hashedPassword],
            (err) => {
                if (err) return handleError(res, err, 'Registration failed');
                res.status(201).json({
                    success: true,
                    token: signToken(userId, email),
                    user: { id: userId, email, firstName, lastName }
                });
            }
        );
    } catch (error) {
        handleError(res, error, 'Registration failed');
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email || '');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const lockout = checkAccountLockout(user);
        if (lockout.isLocked) {
            return res.status(423).json({
                success: false,
                message: `Account locked. Try again after ${lockout.lockoutTime}`
            });
        }

        const isMatch = await bcrypt.compare(password || '', user.password);
        if (!isMatch) {
            const result = await incrementFailedAttempts(user.id);
            return res.status(401).json({
                success: false,
                message: result.isLocked ? 'Account locked due to too many failed attempts' : 'Invalid credentials'
            });
        }

        await resetFailedAttempts(user.id);
        res.json({
            success: true,
            token: signToken(user.id, user.email),
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
        });
    } catch (error) {
        handleError(res, error, 'Login failed');
    }
});

// Guest login — creates a throwaway account so the app can be tried without signing up.
router.post('/guest', async (req, res) => {
    try {
        const userId = uuidv4();
        const guestEmail = `guest-${Date.now()}@spendora.local`;
        const hashedPassword = await bcrypt.hash(uuidv4(), 10);

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password, isGuest) VALUES (?, ?, ?, ?, ?, 1)',
            [userId, 'Guest', 'User', guestEmail, hashedPassword],
            (err) => {
                if (err) return handleError(res, err, 'Guest login failed');
                res.status(201).json({
                    success: true,
                    token: signToken(userId, guestEmail),
                    user: { id: userId, email: guestEmail, firstName: 'Guest', isGuest: true }
                });
            }
        );
    } catch (error) {
        handleError(res, error, 'Guest login failed');
    }
});

module.exports = router;
