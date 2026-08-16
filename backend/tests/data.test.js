const { app, request, ready, cleanup, registerUser, sampleExpense } = require('./helpers');

let token;

beforeAll(async () => {
    await ready();
    ({ token } = await registerUser());
});

afterAll(() => cleanup());

const auth = (req) => req.set('Authorization', `Bearer ${token}`);

describe('GET /api/data/export/csv', () => {
    it('returns a downloadable CSV with a header row', async () => {
        await auth(request(app).post('/api/expenses')).send(
            sampleExpense({ description: 'Lunch', amount: 12.5 })
        );

        const res = await auth(request(app).get('/api/data/export/csv'));

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/csv/);
        expect(res.headers['content-disposition']).toMatch(/attachment; filename="expenses.csv"/);

        const [header, ...rows] = res.text.split('\n');
        expect(header).toBe('description,amount,category,expenseDate,notes,currency');
        expect(rows.some((r) => r.includes('"Lunch"'))).toBe(true);
    });

    it('escapes quotes and commas so the CSV stays valid', async () => {
        await auth(request(app).post('/api/expenses')).send(
            sampleExpense({ description: 'Dinner, with "friends"' })
        );

        const res = await auth(request(app).get('/api/data/export/csv'));

        expect(res.text).toContain('"Dinner, with ""friends"""');
    });

    it('requires a token', async () => {
        const res = await request(app).get('/api/data/export/csv');
        expect(res.status).toBe(401);
    });
});

describe('GET /api/analytics/category-breakdown', () => {
    it('totals spending per category', async () => {
        const fresh = await registerUser();
        const freshAuth = (req) => req.set('Authorization', `Bearer ${fresh.token}`);

        await freshAuth(request(app).post('/api/expenses')).send(
            sampleExpense({ amount: 10, category: 'Food & Dining' })
        );
        await freshAuth(request(app).post('/api/expenses')).send(
            sampleExpense({ amount: 15, category: 'Food & Dining' })
        );
        await freshAuth(request(app).post('/api/expenses')).send(
            sampleExpense({ amount: 20, category: 'Travel' })
        );

        const res = await freshAuth(request(app).get('/api/analytics/category-breakdown'));

        expect(res.status).toBe(200);
        const byCategory = Object.fromEntries(res.body.data.map((r) => [r.category, r.total]));
        expect(byCategory['Food & Dining']).toBe(25);
        expect(byCategory.Travel).toBe(20);
    });
});

describe('GET /api/health', () => {
    it('reports ok without a token', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});
