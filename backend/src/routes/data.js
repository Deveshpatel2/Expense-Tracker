const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// CSV Export
router.get('/export/csv', (req, res) => {
    db.all('SELECT * FROM expenses WHERE userId = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, message: 'CSV export would happen here', data: rows });
    });
});

module.exports = router;
