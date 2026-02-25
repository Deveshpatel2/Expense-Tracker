const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiters');
const authenticateToken = require('./middleware/auth');

// Route imports
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const groupRoutes = require('./routes/groups');
const analyticsRoutes = require('./routes/analytics');
const dataRoutes = require('./routes/data');
const uploadRoutes = require('./routes/upload');
const recurringRoutes = require('./routes/recurring');

const app = express();

// Initialize Database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply general rate limiter
app.use('/api/', generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Spendora API is running', status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);
app.use('/api/budgets', authenticateToken, budgetRoutes);
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/data', authenticateToken, dataRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/recurring-expenses', authenticateToken, recurringRoutes);

module.exports = app;
