require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 8080,
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-123',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '600242847712-liumaiomcajui3jrc6do2ivk7dpq2vfk.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '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',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
};
