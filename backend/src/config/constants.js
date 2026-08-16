require('dotenv').config();

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production. See .env.example.');
}

module.exports = {
    PORT: process.env.PORT || 8080,
    // Dev-only fallback. Production is guarded above.
    JWT_SECRET: process.env.JWT_SECRET || 'dev-only-insecure-secret',
    LOCKOUT_THRESHOLD: 5,
    LOCKOUT_MINUTES: 30
};
