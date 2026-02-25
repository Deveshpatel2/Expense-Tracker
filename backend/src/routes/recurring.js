const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// List recurring expenses
router.get('/', (req, res) => {
    db.all('SELECT * FROM recurring_expenses WHERE userId = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, data: rows });
    });
});

module.exports = router;
