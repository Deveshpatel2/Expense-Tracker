const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, handleError } = require('../config/database');
const { validateAmount, validateDate, validateCategory, validateCurrency } = require('../utils/validation');

const validateExpense = ({ description, amount, category, expenseDate, currency }) => {
    if (!description || description.trim() === '') return 'Description is required';
    if (!validateAmount(amount)) return 'Amount must be a number between 0 and 999999.99';
    if (!validateCategory(category)) return 'Invalid category';
    if (!validateDate(expenseDate)) return 'Invalid date';
    if (currency && !validateCurrency(currency)) return 'Invalid currency';
    return null;
};

// List all expenses for the signed-in user
router.get('/', (req, res) => {
    db.all(
        'SELECT * FROM expenses WHERE userId = ? ORDER BY expenseDate DESC',
        [req.user.id],
        (err, rows) => {
            if (err) return handleError(res, err, 'Could not load expenses');
            res.json({ success: true, data: rows });
        }
    );
});

// Get one expense
router.get('/:id', (req, res) => {
    db.get(
        'SELECT * FROM expenses WHERE id = ? AND userId = ?',
        [req.params.id, req.user.id],
        (err, row) => {
            if (err) return handleError(res, err, 'Could not load expense');
            if (!row) return res.status(404).json({ success: false, message: 'Expense not found' });
            res.json({ success: true, data: row });
        }
    );
});

// Create expense
router.post('/', (req, res) => {
    const { description, amount, category, expenseDate, notes, currency } = req.body;

    const error = validateExpense(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const expenseId = uuidv4();
    db.run(
        `INSERT INTO expenses (id, userId, description, amount, category, expenseDate, notes, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [expenseId, req.user.id, description.trim(), parseFloat(amount), category, expenseDate, notes || '', currency || 'USD'],
        (err) => {
            if (err) return handleError(res, err, 'Could not create expense');
            res.status(201).json({
                success: true,
                data: {
                    id: expenseId,
                    description: description.trim(),
                    amount: parseFloat(amount),
                    category,
                    expenseDate,
                    notes: notes || '',
                    currency: currency || 'USD'
                }
            });
        }
    );
});

// Update expense
router.put('/:id', (req, res) => {
    const { description, amount, category, expenseDate, notes, currency } = req.body;

    const error = validateExpense(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    db.run(
        `UPDATE expenses
         SET description = ?, amount = ?, category = ?, expenseDate = ?, notes = ?, currency = ?,
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ? AND userId = ?`,
        [
            description.trim(), parseFloat(amount), category, expenseDate,
            notes || '', currency || 'USD', req.params.id, req.user.id
        ],
        function (err) {
            if (err) return handleError(res, err, 'Could not update expense');
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Expense not found' });
            }
            res.json({ success: true, data: { id: req.params.id } });
        }
    );
});

// Delete expense
router.delete('/:id', (req, res) => {
    db.run(
        'DELETE FROM expenses WHERE id = ? AND userId = ?',
        [req.params.id, req.user.id],
        function (err) {
            if (err) return handleError(res, err, 'Could not delete expense');
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Expense not found' });
            }
            res.json({ success: true, message: 'Expense deleted' });
        }
    );
});

module.exports = router;
