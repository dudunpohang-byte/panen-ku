# Panenku server

Simple Node + Express API for the Panenku app using `pg`.

Requirements
- Node.js (18+ recommended)
- PostgreSQL database (see `../db/schema.sql`)

Quick start

```bash
cd server
npm install
export DATABASE_URL="postgresql://user:pass@localhost:5432/panenku_dev"
npm run dev
```

Endpoints
- `GET /api/health` — health check
- `GET /api/products` — list products
- `GET /api/products/:id` — product detail
- `GET /api/users/:id` — user info
- `POST /api/orders` — create order (see `server/src/routes/orders.ts` for payload)

Notes about Drizzle
- This server uses plain `pg` queries for simplicity and reliability.
- To use Drizzle ORM, install `drizzle-orm` and `drizzle-orm/node-postgres` and initialize with the `pool` exported from `server/src/db.ts`.
