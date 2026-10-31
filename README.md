# Expenso

Expense tracker with secure authentication. Track expenses by category, filter and search them, and view monthly summaries.

> **Status:** In progress. Backend (auth, categories, expenses, summary and charts API) is complete; frontend dashboard is being built.

## Features

**Done**

- Signup and login with email + password (bcrypt hashed)
- Access token (15 min) + refresh token (7 days, httpOnly cookie)
- Refresh token rotation with reuse detection per token family
- Refresh tokens stored hashed (SHA-256) in the database
- Session restore on page reload, silent refresh on 401
- Default categories created for every new user (transactional)
- Categories CRUD (per-user, case-insensitive unique names, random color by default)
- Expenses CRUD with filters (category, date range, amount, payment method), search, sort and offset pagination
- Summary, category breakdown and trend (daily/weekly) endpoints for dashboard cards and charts

**Planned**

- Dashboard UI (expenses table, add/edit form, filters, charts)
- Monthly budget
- CSV export

## Tech Stack

| Layer    | Tech                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router |
| Backend  | Node.js, Express, TypeScript, Zod                                              |
| Database | PostgreSQL, Drizzle ORM                                                        |

## Auth Design

1. Login returns a short-lived access token in the response body. The frontend keeps it in memory only, never in localStorage.
2. The refresh token is set as an httpOnly cookie, so JavaScript cannot read it. Only its SHA-256 hash is stored in the DB.
3. When the access token expires, the API returns 401. An axios interceptor calls `/account/refresh` once (concurrent requests share the same promise) and retries the original request.
4. Every refresh rotates the token: the old one is revoked and a new one is issued in the same family.
5. If a revoked token is used again, the whole family is revoked, which signs that session out.

**Known limitations:** no grace window for slow networks, no email verification or password reset yet, expired and revoked refresh tokens are not cleaned up yet.

No income tracking yet, and the `expenses.date` column stores a date only (no time of day).

## API

All routes are under `/api`. Signup, login, refresh and logout use the refresh-token cookie (no bearer token needed). Everything else requires `Authorization: Bearer <accessToken>`.

| Method | Path                   | Description                                                               |
| ------ | ---------------------- | ------------------------------------------------------------------------- |
| POST   | `/account/create`      | Sign up                                                                   |
| POST   | `/account/login`       | Log in                                                                    |
| POST   | `/account/refresh`     | Rotate refresh token, get a new access token                              |
| POST   | `/account/logout`      | Revoke refresh token                                                      |
| GET    | `/account/me`          | Current user                                                              |
| GET    | `/category/list`       | List categories (`?q=` search)                                            |
| POST   | `/category/create`     | Create category                                                           |
| PATCH  | `/category/:id/update` | Update category                                                           |
| DELETE | `/category/:id/delete` | Delete category                                                           |
| GET    | `/expense/list`        | List with filters, search, sort, pagination                               |
| GET    | `/expense/summary`     | Total, count, previous period total and top category for a date range     |
| GET    | `/expense/by-category` | Category-wise totals for a date range (pie chart)                         |
| GET    | `/expense/trend`       | Daily (up to 31 days) or weekly totals, optional `categoryId` (bar chart) |
| POST   | `/expense/create`      | Create expense                                                            |
| GET    | `/expense/:id/details` | Expense details                                                           |
| PATCH  | `/expense/:id/update`  | Update expense                                                            |
| DELETE | `/expense/:id/delete`  | Delete expense                                                            |

**Expenses list query params:** `page`, `limit` (max 50), `q`, `categoryId`, `paymentMethod`, `from`, `to`, `minAmount`, `maxAmount`, `sort` (`date_desc`, `date_asc`, `amount_desc`, `amount_asc`)
**Summary, by-category and trend query params:** `from` and `to` (`YYYY-MM-DD`, max 366 days apart). `trend` also accepts an optional `categoryId`.

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL

### Backend

```bash
cd backend
cp .env.example .env     # fill in the values
bun install
bun drizzle-kit push
bun run dev
```

Optional: load sample expenses for an existing account (about 50 expenses over the last 3 months):

```bash
bun run scripts/seed-expenses.ts you@example.com
```

### Frontend

```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```

### Environment variables

`backend/.env`

```
PORT=
NODE_ENV=
DATABASE_URL=
BACKEND_URL=
FRONTEND_URL=
ACCESS_TOKEN_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_SERVICE=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

`frontend/.env`

```
VITE_API_URL=
```

## Project Structure

```
expenso/
  backend/    # Express API, Drizzle schema, auth
  frontend/   # React app
```

## Screenshots

_Coming soon._
