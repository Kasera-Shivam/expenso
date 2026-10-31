# Expenso

Expense tracker with secure authentication. Track expenses by category, filter and search them, and view monthly summaries.

> **Status:** In progress. Auth and categories are complete; expenses are being built.

## Features

**Done**

- Signup and login with email + password (bcrypt hashed)
- Access token (15 min) + refresh token (7 days, httpOnly cookie)
- Refresh token rotation with reuse detection per token family
- Refresh tokens stored hashed (SHA-256) in the database
- Session restore on page reload, silent refresh on 401
- Default categories created for every new user (transactional)
- Categories CRUD (per-user, case-insensitive unique names, random color by default)

**Planned**

- Expense CRUD with filters, sort, search and pagination
- Monthly budget and category-wise summary chart
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
