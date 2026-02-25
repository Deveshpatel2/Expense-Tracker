const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, getUserByEmail, handleError } = require('../config/database');
const { JWT_SECRET } = require('../config/constants');
const { authLimiter } = require('../middleware/rateLimiters');

// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        db.run(
            'INSERT INTO users (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)',
            [userId, firstName, lastName, email, hashedPassword],
            (err) => {
                if (err) return handleError(res, err, 'Registration failed');
                res.json({ success: true, message: 'User registered successfully' });
            }
        );
    } catch (error) {
        handleError(res, error, 'Server error during registration');
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

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
