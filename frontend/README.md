# Expenso frontend

React + Vite + TypeScript + Tailwind v4 + shadcn/ui + TanStack Query + Bun.

## Run

```bash
bun install
bun run dev
```

Open http://localhost:5173.

`.env` holds the backend address (no `/api` at the end, the app adds it):

```
VITE_API_URL="http://localhost:5000"
```

The backend `.env` needs `FRONTEND_URL=http://localhost:5173`, otherwise CORS and the password reset link will not work.

## Routes

| Path                       | Page                                   |
| -------------------------- | -------------------------------------- |
| `/account/login`           | Log in                                 |
| `/account/create`          | Sign up                                |
| `/account/password/forgot` | Ask for a reset link                   |
| `/reset-password?token=…`  | Set a new password (opened from email) |
| `/`                        | Expenses, search, filters, CSV export  |
| `/chart`                   | Bar and pie charts (7D, 1M, 3M)        |
| `/categories`              | Add, edit, delete categories           |
| `/budget`                  | Monthly budget and progress            |

Update account (name and photo), Categories and Budget are in the profile menu (top right).
