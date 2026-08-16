const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiters');
const authenticateToken = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');
const dataRoutes = require('./routes/data');

const app = express();

// Callers (server.js, tests) await this before handling traffic.
app.locals.dbReady = initDatabase();

app.use(cors());
app.use(express.json());
app.use('/api/', generalLimiter);

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Spendora API is running', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/data', authenticateToken, dataRoutes);

module.exports = app;
