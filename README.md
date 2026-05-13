# Internal learning platform (courses)

Monorepo: **NestJS** REST API (`apps/api`), **Vite + React 19** SPA (`apps/web`), **PostgreSQL** + **Prisma**, run via **Docker Compose**.

## Requirements

- **Node.js** 22 LTS (for local development without Docker)
- **pnpm** 9+ (`corepack enable pnpm`)
- **Docker** and **Docker Compose** v2 (for the full stack with one command)

## Quick start (Docker)

From the repository root:

```bash
docker compose up --build
```

After startup:

- API: `http://localhost:3000/api`
- SPA (nginx): `http://localhost:8080`

Inside the API container, `prisma migrate deploy` and `prisma db seed` run automatically before Nest starts.

## Local development (API without Docker)

1. Start PostgreSQL (for example only the DB from Compose):

   ```bash
   docker compose up db
   ```

2. Copy environment variables:

   ```bash
   cp .env.example apps/api/.env
   ```

   Adjust `DATABASE_URL` if the DB port is not `5432`.

3. Dependencies and Prisma:

   ```bash
   pnpm install
   cd apps/api && pnpm exec prisma migrate deploy && pnpm exec prisma db seed
   ```

4. In two terminals from the repo root:

   ```bash
   pnpm dev:api
   pnpm dev:web
   ```

   Frontend: `http://localhost:5173` (Vite proxies `/api` to `http://localhost:3000`).

Make sure `apps/api/.env` sets `FRONTEND_ORIGIN` to include `http://localhost:5173` (see `.env.example`).

## Migrations and seed

| Command (from `apps/api`) | Purpose |
|---------------------------|---------|
| `pnpm exec prisma migrate dev` | Create a new migration in development (needs a running DB) |
| `pnpm exec prisma migrate deploy` | Apply migrations (CI / Docker / prod) |
| `pnpm exec prisma db seed` | Seed courses and the test user |

The seed is idempotent (upserts courses and the user by email).

## Test account after seed

| Field | Value |
|-------|-------|
| Email | `trainer@bank.ua` |
| Password | `Test123!` |

## Testing

| Command | When |
|---------|------|
| `pnpm test` | Unit tests (API, Jest; no database). |
| `pnpm test:integration` | HTTP integration tests against PostgreSQL. Set `DATABASE_URL` and apply migrations (`pnpm --filter api exec prisma migrate deploy`). |
| `pnpm dev:stack` | API + Vite together (DB must be running). |
| `pnpm test:e2e` | Playwright (Chromium): registers / logs in and checks the catalog. With `dev:stack` the config starts servers automatically; against Docker use `PLAYWRIGHT_SKIP_WEBSERVER=1` and `PLAYWRIGHT_BASE_URL=http://localhost:8080`. |

Install browsers once: `pnpm --filter web exec playwright install chromium`.

## `curl` examples

Register:

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Olena Koval","email":"o.koval@bank.ua","password":"secret123"}'
```

Login:

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@bank.ua","password":"Test123!"}'
```

Save `token` from the response, then:

```bash
TOKEN="<paste_jwt_here>"

curl -s http://localhost:3000/api/courses -H "Authorization: Bearer $TOKEN"

curl -s -X POST "http://localhost:3000/api/courses/10000000-0000-4000-8000-000000000001/enroll" \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:3000/api/users/me/courses -H "Authorization: Bearer $TOKEN"
```

## REST endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/courses` (Bearer JWT)
- `POST /api/courses/:id/enroll` (Bearer JWT)
- `GET /api/users/me/courses` (Bearer JWT)

## Project layout

- `apps/api` — NestJS, Prisma, JWT, DTO validation (`class-validator`)
- `apps/web` — React Router, TanStack Query, routes `/login`, `/register`, `/courses`, `/my-courses`, `/admin`
- `docker-compose.yml` — `db`, `api`, `web`

## Environment variables (API)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `PORT` | HTTP port (default `3000`) |
| `FRONTEND_ORIGIN` | CORS: one origin or several, comma-separated |
| `ADMIN_API_KEY` | Optional. When set, enables `GET /api/admin/stats`; the browser must send the same value in the `X-Admin-Key` header (see `/admin` in the web app). Docker Compose sets `docker-admin-demo-key` for local demos. |

## Admin panel (optional)

Minimal stats UI at `/admin` (header `X-Admin-Key` must match `ADMIN_API_KEY`). The API route is `GET /api/admin/stats`.

## Real-time (Socket.IO)

The API process also hosts Socket.IO. Connect to namespace `/realtime` on the same host and port as HTTP (default `3000`). Emitting the `ping` event returns `{ ts, message: 'pong' }`.

## Build without Docker

```bash
pnpm install
pnpm build
```

## Unit tests (API)

```bash
pnpm --filter api test
```
