const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { db, getUserByEmail, handleError } = require('../config/database');
const { JWT_SECRET } = require('../config/constants');
const { authLimiter } = require('../middleware/rateLimiters');
const { validateEmail, validatePassword } = require('../utils/validation');
const { checkAccountLockout, incrementFailedAttempts, resetFailedAttempts } = require('../utils/authHelpers');
const { sendEmail } = require('../services/emailService');

// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!validateEmail(email)) return res.status(400).json({ success: false, message: 'Invalid email format' });

        const passVal = validatePassword(password);
        if (!passVal.isValid) return res.status(400).json({ success: false, message: 'Password weak', errors: passVal.errors });

        const existingUser = await getUserByEmail(email);
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password, isEmailVerified, lockUntil) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, firstName, lastName, email, hashedPassword, 0, null],
            async (err) => {
                if (err) return handleError(res, err, 'Registration failed');

                await sendEmail(email, 'verification', { name: firstName, token: verificationToken });

                const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ success: true, message: 'Registered. Check email for verification.', token, user: { id: userId, email, firstName } });
            }
        );
    } catch (error) {
        handleError(res, error, 'Registration server error');
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);

        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const lockout = checkAccountLockout(user);
        if (lockout.isLocked) return res.status(423).json({ success: false, message: `Account locked. Try again after ${lockout.lockoutTime}` });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const result = await incrementFailedAttempts(user.id);
            return res.status(401).json({ success: false, message: result.isLocked ? 'Account locked due to attempts' : 'Invalid credentials' });
        }

        await resetFailedAttempts(user.id);
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName } });
    } catch (error) {
        handleError(res, error, 'Login failed');
    }
});

// Guest Login
router.post('/guest', async (req, res) => {
    try {
        const userId = uuidv4();
        const guestEmail = `guest-${Date.now()}@spendora.com`;
        const hashedPassword = await bcrypt.hash('guest-password', 10);

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password, isGuest) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, 'Guest', 'User', guestEmail, hashedPassword, 1],
            (err) => {
                if (err) return handleError(res, err, 'Guest login failed');
                const token = jwt.sign({ id: userId, email: guestEmail }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ success: true, token, user: { id: userId, email: guestEmail, isGuest: true } });
            }
        );
    } catch (error) {
        handleError(res, error, 'Guest login failed');
    }
});

module.exports = router;
