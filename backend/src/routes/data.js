const express = require('express');
const router = express.Router();
const { db, handleError } = require('../config/database');

const COLUMNS = ['description', 'amount', 'category', 'expenseDate', 'notes', 'currency'];

// Wrap in quotes and double any embedded quote, per RFC 4180.
const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const toCsv = (rows) => {
    const header = COLUMNS.join(',');
    const body = rows.map((row) => COLUMNS.map((col) => escapeCell(row[col])).join(','));
    return [header, ...body].join('\n');
};

// Export the user's expenses as a downloadable CSV file
router.get('/export/csv', (req, res) => {
    db.all(
        'SELECT * FROM expenses WHERE userId = ? ORDER BY expenseDate DESC',
        [req.user.id],
        (err, rows) => {
            if (err) return handleError(res, err, 'Could not export expenses');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
            res.send(toCsv(rows));
        }
    );
});

module.exports = router;
