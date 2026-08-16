# Spendora — Expense Tracker

A small full-stack expense tracker. React frontend, Express + SQLite API, JWT auth.

Everything described below is implemented and covered by tests. Run `npm test` to verify.

---

## Features

**Accounts**
- Register with email and password (min 8 chars, upper + lower + number + special)
- Log in / log out; sessions are JWT-based and expire after 24 hours
- Guest sign-in — creates a throwaway account so the app can be tried without registering
- Passwords hashed with bcrypt (10 rounds)
- Account locks for 30 minutes after 5 consecutive failed logins

**Expenses**
- Create, view, edit, and delete expenses
- Each expense has a description, amount, category, date, optional notes, and currency
- 10 fixed categories: Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Housing, Education, Travel, Other
- 10 supported currency codes: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL
- Expenses are scoped per user — you can only read or modify your own

**Dashboard**
- Totals for today, the last 7 days, and the current month
- Category breakdown showing each category's share of spending
- 7-day spending trend chart
- Recent transactions list
- Expense list with text search, category filter, and month-by-month navigation

**Export**
- Download all your expenses as a CSV file (RFC 4180 quoting)

**Interface**
- Responsive layout; on narrow screens the sidebar opens from a menu button

---

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Setup

```bash
git clone https://github.com/Deveshpatel2/Expense-Tracker.git
cd Expense-Tracker
npm run install:all
```

Configure the backend:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set `JWT_SECRET` to a long random string:

```bash
openssl rand -hex 32
```

`JWT_SECRET` is optional in development (an insecure fallback is used) and **required in production** — the server refuses to start without it when `NODE_ENV=production`.

## Running

```bash
npm start
```

Starts both servers together:

- Frontend — http://localhost:3000
- API — http://localhost:8080

Run them separately with `npm run start:backend` and `npm run start:frontend`.

The SQLite database is created automatically at `backend/expense_tracker.db` on first run. It is gitignored; delete the file to reset all data.

To point the frontend at a different API host, set `REACT_APP_API_URL` (default `http://localhost:8080/api`).

## Testing and linting

```bash
npm test     # 54 tests — 38 backend (Jest + Supertest), 16 frontend (Jest + React Testing Library)
npm run lint # ESLint across backend and frontend
npm run build # production frontend build
```

Backend tests run against a temporary SQLite file and never touch your development database.

---

## API

All routes are prefixed with `/api`. Every endpoint except `/health` and the three auth routes requires an `Authorization: Bearer <token>` header.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check; no auth |
| POST | `/auth/register` | Create an account, returns a token |
| POST | `/auth/login` | Sign in, returns a token |
| POST | `/auth/guest` | Create a guest account, returns a token |
| GET | `/expenses` | List your expenses, newest first |
| GET | `/expenses/:id` | Fetch one expense |
| POST | `/expenses` | Create an expense |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |
| GET | `/analytics/category-breakdown` | Totals grouped by category |
| GET | `/data/export/csv` | Download expenses as CSV |

Responses are JSON shaped as `{ success, ... }`. Auth routes return `token` and `user` at the top level.

Rate limits: 100 requests per 15 minutes across `/api`, and 10 login attempts per 15 minutes.

## Project structure

```
backend/
  server.js              entry point
  src/
    app.js               express app and route mounting
    config/              database, constants
    middleware/          JWT auth, rate limiters
    routes/              auth, expenses, analytics, data
    utils/               validation, lockout helpers
  tests/                 Jest + Supertest suites
frontend/
  src/
    api.js               API client
    App.js               routes
    components/          UI
    context/             auth, currency
```

## Tech stack

React 19, React Router 7, Tailwind CSS, lucide-react, Create React App. Express 4, SQLite3, jsonwebtoken, bcryptjs, express-rate-limit. Jest, Supertest, React Testing Library, ESLint.

## Limitations

- SQLite and in-memory rate limiting suit a single instance; a multi-instance deployment would need Postgres and a shared rate-limit store.
- Tokens are kept in `localStorage`, so the app is vulnerable to XSS-based token theft.
- There is no password reset or email verification flow.
- Currency codes are stored per expense but amounts are never converted between currencies.

## License

MIT
