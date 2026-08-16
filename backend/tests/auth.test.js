const { app, request, ready, cleanup, registerUser, validPassword } = require('./helpers');

beforeAll(() => ready());
afterAll(() => cleanup());

const newEmail = () => `auth-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

describe('POST /api/auth/register', () => {
    it('creates an account and returns a token', async () => {
        const res = await request(app).post('/api/auth/register').send({
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: newEmail(),
            password: validPassword
        });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.token).toBe('string');
        expect(res.body.user.firstName).toBe('Ada');
    });

    it('never returns the password hash', async () => {
        const res = await request(app).post('/api/auth/register').send({
            firstName: 'Ada', lastName: 'L', email: newEmail(), password: validPassword
        });
        expect(JSON.stringify(res.body)).not.toContain('$2a$');
    });

    it('rejects a weak password with the specific rules broken', async () => {
        const res = await request(app).post('/api/auth/register').send({
            firstName: 'Ada', lastName: 'L', email: newEmail(), password: 'short'
        });

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('rejects an invalid email', async () => {
        const res = await request(app).post('/api/auth/register').send({
            firstName: 'Ada', lastName: 'L', email: 'not-an-email', password: validPassword
        });
        expect(res.status).toBe(400);
    });

    it('rejects a duplicate email', async () => {
        const email = newEmail();
        const body = { firstName: 'Ada', lastName: 'L', email, password: validPassword };

        await request(app).post('/api/auth/register').send(body);
        const res = await request(app).post('/api/auth/register').send(body);

        expect(res.status).toBe(409);
    });
});

describe('POST /api/auth/login', () => {
    it('signs in with the correct password', async () => {
        const email = newEmail();
        await request(app).post('/api/auth/register').send({
            firstName: 'Grace', lastName: 'Hopper', email, password: validPassword
        });

        const res = await request(app).post('/api/auth/login').send({ email, password: validPassword });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.token).toBe('string');
    });

    it('rejects a wrong password', async () => {
        const email = newEmail();
        await request(app).post('/api/auth/register').send({
            firstName: 'Grace', lastName: 'H', email, password: validPassword
        });

        const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1!' });

        expect(res.status).toBe(401);
        expect(res.body.token).toBeUndefined();
    });

    it('rejects an unknown account without revealing that it does not exist', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'nobody@example.com', password: validPassword
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('locks the account after 5 failed attempts and keeps it locked for a correct password', async () => {
        const email = newEmail();
        await request(app).post('/api/auth/register').send({
            firstName: 'Locked', lastName: 'Out', email, password: validPassword
        });

        for (let i = 0; i < 5; i += 1) {
            await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1!' });
        }

        const res = await request(app).post('/api/auth/login').send({ email, password: validPassword });

        expect(res.status).toBe(423);
        expect(res.body.message).toMatch(/locked/i);
    });

    it('resets the failed counter after a successful sign-in', async () => {
        const email = newEmail();
        await request(app).post('/api/auth/register').send({
            firstName: 'Reset', lastName: 'Me', email, password: validPassword
        });

        await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1!' });
        await request(app).post('/api/auth/login').send({ email, password: validPassword });

        // Four more failures would trip the lock only if the counter had not reset.
        for (let i = 0; i < 4; i += 1) {
            await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1!' });
        }

        const res = await request(app).post('/api/auth/login').send({ email, password: validPassword });
        expect(res.status).toBe(200);
    });
});

describe('POST /api/auth/guest', () => {
    it('issues a working token without registration', async () => {
        const res = await request(app).post('/api/auth/guest').send({});

        expect(res.status).toBe(201);
        expect(res.body.user.isGuest).toBe(true);

        const expenses = await request(app)
            .get('/api/expenses')
            .set('Authorization', `Bearer ${res.body.token}`);

        expect(expenses.status).toBe(200);
    });
});

describe('token handling', () => {
    it('rejects a request with no token', async () => {
        const res = await request(app).get('/api/expenses');
        expect(res.status).toBe(401);
    });

    it('rejects a forged token', async () => {
        const res = await request(app)
            .get('/api/expenses')
            .set('Authorization', 'Bearer not.a.real.token');
        expect(res.status).toBe(403);
    });

    it('accepts a token issued at registration', async () => {
        const { token } = await registerUser();
        const res = await request(app).get('/api/expenses').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});
