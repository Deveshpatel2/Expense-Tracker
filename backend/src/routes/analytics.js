const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// Category breakdown
router.get('/category-breakdown', (req, res) => {
    const userId = req.user.id;
    db.all('SELECT category, SUM(amount) as total FROM expenses WHERE userId = ? GROUP BY category', [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, data: rows });
    });
});

module.exports = router;
