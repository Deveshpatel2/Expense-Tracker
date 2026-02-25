const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

router.post('/receipt', upload.single('receipt'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, message: 'Receipt uploaded', data: { url: `/uploads/${req.file.filename}` } });
});

module.exports = router;
