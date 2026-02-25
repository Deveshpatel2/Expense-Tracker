const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, handleError } = require('../config/database');

// List groups
router.get('/', (req, res) => {
    db.all('SELECT * FROM groups', (err, rows) => {
        if (err) return handleError(res, err);
        res.json({ success: true, data: rows });
    });
});

module.exports = router;
