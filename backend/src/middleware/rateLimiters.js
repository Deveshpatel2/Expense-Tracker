const rateLimit = require('express-rate-limit');

// Rate limiting is disabled under test so the suite can exercise auth repeatedly.
const passThrough = (req, res, next) => next();
const isTest = process.env.NODE_ENV === 'test';

const generalLimiter = isTest ? passThrough : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = isTest ? passThrough : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

module.exports = { generalLimiter, authLimiter };
