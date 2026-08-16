const { app, request, ready, cleanup, registerUser, sampleExpense } = require('./helpers');

let token;
let auth;

beforeAll(async () => {
    await ready();
    ({ token } = await registerUser());
    auth = (req) => req.set('Authorization', `Bearer ${token}`);
});

afterAll(() => cleanup());

const createExpense = (overrides) =>
    auth(request(app).post('/api/expenses')).send(sampleExpense(overrides));

describe('expense CRUD', () => {
    it('creates an expense and returns it', async () => {
        const res = await createExpense({ description: 'Groceries', amount: 42.75 });

        expect(res.status).toBe(201);
        expect(res.body.data.description).toBe('Groceries');
        expect(res.body.data.amount).toBe(42.75);
        expect(res.body.data.id).toBeTruthy();
    });

    it('lists created expenses', async () => {
        await createExpense({ description: 'Bus fare', category: 'Transportation' });

        const res = await auth(request(app).get('/api/expenses'));

        expect(res.status).toBe(200);
        expect(res.body.data.some((e) => e.description === 'Bus fare')).toBe(true);
    });

    it('fetches a single expense by id', async () => {
        const created = await createExpense({ description: 'Book' });
        const res = await auth(request(app).get(`/api/expenses/${created.body.data.id}`));

        expect(res.status).toBe(200);
        expect(res.body.data.description).toBe('Book');
    });

    it('updates an expense', async () => {
        const created = await createExpense({ description: 'Old name', amount: 10 });

        const update = await auth(request(app).put(`/api/expenses/${created.body.data.id}`))
            .send(sampleExpense({ description: 'New name', amount: 99.99 }));

        expect(update.status).toBe(200);

        const after = await auth(request(app).get(`/api/expenses/${created.body.data.id}`));
        expect(after.body.data.description).toBe('New name');
        expect(after.body.data.amount).toBe(99.99);
    });

    it('deletes an expense', async () => {
        const created = await createExpense({ description: 'Temporary' });

        const del = await auth(request(app).delete(`/api/expenses/${created.body.data.id}`));
        expect(del.status).toBe(200);

        const after = await auth(request(app).get(`/api/expenses/${created.body.data.id}`));
        expect(after.status).toBe(404);
    });

    it('returns 404 updating or deleting an expense that does not exist', async () => {
        const update = await auth(request(app).put('/api/expenses/does-not-exist')).send(sampleExpense());
        const del = await auth(request(app).delete('/api/expenses/does-not-exist'));

        expect(update.status).toBe(404);
        expect(del.status).toBe(404);
    });
});

describe('expense validation', () => {
    it.each([
        ['missing description', { description: '' }],
        ['zero amount', { amount: 0 }],
        ['negative amount', { amount: -5 }],
        ['non-numeric amount', { amount: 'abc' }],
        ['unknown category', { category: 'Not A Category' }],
        ['invalid date', { expenseDate: 'not-a-date' }],
        ['unsupported currency', { currency: 'XYZ' }]
    ])('rejects %s', async (_label, override) => {
        const res = await createExpense(override);
        expect(res.status).toBe(400);
    });
});

describe('user isolation', () => {
    it('does not expose another user\'s expenses', async () => {
        const created = await createExpense({ description: 'Private note' });

        const other = await registerUser();
        const list = await request(app)
            .get('/api/expenses')
            .set('Authorization', `Bearer ${other.token}`);

        expect(list.body.data).toEqual([]);

        const fetched = await request(app)
            .get(`/api/expenses/${created.body.data.id}`)
            .set('Authorization', `Bearer ${other.token}`);

        expect(fetched.status).toBe(404);
    });

    it('does not let another user update or delete an expense', async () => {
        const created = await createExpense({ description: 'Mine' });
        const other = await registerUser();

        const update = await request(app)
            .put(`/api/expenses/${created.body.data.id}`)
            .set('Authorization', `Bearer ${other.token}`)
            .send(sampleExpense({ description: 'Hijacked' }));

        const del = await request(app)
            .delete(`/api/expenses/${created.body.data.id}`)
            .set('Authorization', `Bearer ${other.token}`);

        expect(update.status).toBe(404);
        expect(del.status).toBe(404);

        const after = await auth(request(app).get(`/api/expenses/${created.body.data.id}`));
        expect(after.body.data.description).toBe('Mine');
    });
});

describe('authentication is required', () => {
    it.each([
        ['get', '/api/expenses'],
        ['post', '/api/expenses'],
        ['put', '/api/expenses/abc'],
        ['delete', '/api/expenses/abc']
    ])('%s %s returns 401 without a token', async (method, path) => {
        const res = await request(app)[method](path).send(sampleExpense());
        expect(res.status).toBe(401);
    });
});
