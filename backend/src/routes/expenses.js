const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, handleError } = require('../config/database');

// Get all expenses
router.get('/', (req, res) => {
    db.all('SELECT * FROM expenses WHERE userId = ? ORDER BY expenseDate DESC', [req.user.id], (err, rows) => {
        if (err) return handleError(res, err);
        res.json({ success: true, data: rows });
    });
});

// Create expense
router.post('/', (req, res) => {
    const { description, amount, category, expenseDate, notes, currency, groupId } = req.body;
    const expenseId = uuidv4();

    db.run(
        'INSERT INTO expenses (id, userId, description, amount, category, expenseDate, notes, currency, groupId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [expenseId, req.user.id, description, amount, category, expenseDate, notes, currency, groupId || null],
        (err) => {
            if (err) return handleError(res, err);
            res.json({ success: true, message: 'Expense created successfully', data: { id: expenseId } });
        }
    );
});

module.exports = router;
