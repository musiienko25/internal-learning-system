# Внутрішня платформа навчання (курси)

Monorepo: **NestJS** REST API (`apps/api`), **Vite + React 19** SPA (`apps/web`), **PostgreSQL** + **Prisma**, запуск через **Docker Compose**.

## Вимоги

- **Node.js** 22 LTS (для локальної розробки без Docker)
- **pnpm** 9+ (`corepack enable pnpm`)
- **Docker** та **Docker Compose** v2 (для повного стеку однією командою)

## Швидкий старт (Docker)

З кореня репозиторію:

```bash
docker compose up --build
```

Після старту:

- API: `http://localhost:3000/api`
- SPA (nginx): `http://localhost:8080`

У контейнері API автоматично виконуються `prisma migrate deploy` та `prisma db seed` перед запуском Nest.

## Локальна розробка (без Docker для API)

1. Підніміть PostgreSQL (наприклад лише БД з compose):

   ```bash
   docker compose up db
   ```

2. Скопіюйте змінні середовища:

   ```bash
   cp .env.example apps/api/.env
   ```

   За потреби змініть `DATABASE_URL` (якщо порт БД не `5432`).

3. Залежності та Prisma:

   ```bash
   pnpm install
   cd apps/api && pnpm exec prisma migrate deploy && pnpm exec prisma db seed
   ```

4. У двох терміналах з кореня:

   ```bash
   pnpm dev:api
   pnpm dev:web
   ```

   Фронт: `http://localhost:5173` (Vite проксує `/api` на `http://localhost:3000`).

Переконайтесь, що в `apps/api/.env` задано `FRONTEND_ORIGIN` з `http://localhost:5173` (див. `.env.example`).

## Міграції та seed

| Команда (з `apps/api`) | Призначення |
|------------------------|-------------|
| `pnpm exec prisma migrate dev` | Нова міграція в розробці (потрібна жива БД) |
| `pnpm exec prisma migrate deploy` | Накат міграцій (CI / Docker / прод) |
| `pnpm exec prisma db seed` | Seed курсів і тестового користувача |

Seed ідемпотентний (upsert курсів і користувача за email).

## Тестовий акаунт після seed

| Поле | Значення |
|------|----------|
| Email | `trainer@bank.ua` |
| Пароль | `Test123!` |

## Приклади `curl`

Реєстрація:

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Olena Koval","email":"o.koval@bank.ua","password":"secret123"}'
```

Логін:

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@bank.ua","password":"Test123!"}'
```

Збережіть `token` з відповіді, далі:

```bash
TOKEN="<вставте_jwt>"

curl -s http://localhost:3000/api/courses -H "Authorization: Bearer $TOKEN"

curl -s -X POST "http://localhost:3000/api/courses/10000000-0000-4000-8000-000000000001/enroll" \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:3000/api/users/me/courses -H "Authorization: Bearer $TOKEN"
```

## REST ендпоінти

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/courses` (Bearer JWT)
- `POST /api/courses/:id/enroll` (Bearer JWT)
- `GET /api/users/me/courses` (Bearer JWT)

## Структура

- `apps/api` — NestJS, Prisma, JWT, валідація DTO (`class-validator`)
- `apps/web` — React Router, TanStack Query, сторінки `/login`, `/register`, `/courses`, `/my-courses`
- `docker-compose.yml` — `db`, `api`, `web`

## Змінні середовища (API)

| Змінна | Опис |
|--------|------|
| `DATABASE_URL` | Рядок підключення PostgreSQL |
| `JWT_SECRET` | Секрет підпису JWT |
| `PORT` | Порт HTTP (за замовчуванням `3000`) |
| `FRONTEND_ORIGIN` | CORS: один origin або кілька через кому |

## Збірка без Docker

```bash
pnpm install
pnpm build
```
