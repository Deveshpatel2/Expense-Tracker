const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

// Point the app at a throwaway database. Must run before src/app is required.
const dbFile = path.join(os.tmpdir(), `spendora-test-${crypto.randomUUID()}.db`);
process.env.DB_PATH = dbFile;
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

const ready = () => app.locals.dbReady;

const cleanup = () => {
    for (const suffix of ['', '-journal', '-wal', '-shm']) {
        try {
            fs.unlinkSync(dbFile + suffix);
        } catch {
            // File may not exist; nothing to clean up.
        }
    }
};

let counter = 0;
const validPassword = 'ValidPass1!';

// Registers a fresh user and returns { token, userId, email }.
const registerUser = async () => {
    counter += 1;
    const email = `user${counter}-${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test',
        lastName: 'User',
        email,
        password: validPassword
    });
    return { token: res.body.token, userId: res.body.user.id, email };
};

const sampleExpense = (overrides = {}) => ({
    description: 'Coffee',
    amount: 4.5,
    category: 'Food & Dining',
    expenseDate: '2026-01-15',
    notes: 'Morning latte',
    currency: 'USD',
    ...overrides
});

module.exports = { app, request, ready, cleanup, registerUser, validPassword, sampleExpense };
