# Finlytics API

Finance **records**, **role-based access control**, and **dashboard analytics** — REST API for a finance dashboard (assignment scope: backend design, validation, persistence, RBAC).

**Stack:** Node.js 22+, **Express 5**, **TypeScript**, **SQLite** (`better-sqlite3`), **JWT** auth, **Zod** validation, **OpenAPI 3** + **Swagger UI** at `/api-docs`.

---

## Prerequisites

- Node.js 18+ (22 LTS recommended)
- `npm` 9+
- For `better-sqlite3`: a C++ build toolchain on the machine (e.g. `build-essential` on Debian/Ubuntu, or `gcc-c++ make` on Amazon Linux) if prebuilt binaries are not available for your platform.

---

## Quick start

```bash
git clone https://github.com/sajdeen-dev/finlytics-api.git
cd finlytics-api
cp .env.example .env
# Edit .env — set JWT_SECRET (required)
npm install
npm run build
npm start
```

- API default: `http://localhost:3000` (override with `PORT` in `.env`).
- **Interactive API docs:** `http://localhost:3000/api-docs`
- **Raw OpenAPI YAML:** `http://localhost:3000/openapi.yaml`

Development with hot reload:

```bash
npm run dev
```

On first run, `finlytics.db` is created in the **current working directory** (same folder you start the process from).

---

## Environment variables

| Variable       | Required | Description |
|----------------|----------|-------------|
| `JWT_SECRET`   | **Yes**  | Secret for signing JWTs (use a long random string). |
| `PORT`         | No       | HTTP port (default `3000`). |
| `CORS_ORIGIN`  | No       | Comma-separated allowed origins, or `*` for any origin (demo only). Default: `http://localhost:5173`. |

Copy from `.env.example` and adjust.

---

## Authentication

1. `POST /api/auth/register` — create user (optional `role`: `viewer` \| `analyst` \| `admin`; default `viewer`).
2. `POST /api/auth/login` — returns `{ token }` (JWT).

Send on protected routes:

```http
Authorization: Bearer <token>
```

Inactive users cannot log in.

---

## Role-based access

| Capability | Viewer | Analyst | Admin |
|------------|:------:|:-------:|:-----:|
| `GET /api/records` (+ filters) | Yes | Yes | Yes |
| `POST/PATCH/DELETE /api/records` | No | No | Yes |
| `GET /api/dashboard/*` | No | Yes | Yes |
| `GET/PATCH /api/users` | No | No | Yes |

**Note:** The sample brief sometimes describes “viewer” as dashboard-only; this implementation gives **viewers read-only access to records** and **no dashboard summary routes**; **analyst** and **admin** get dashboard aggregates. This is intentional and documented for reviewers.

---

## Main endpoints (summary)

| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/api/auth/register` | — | — |
| POST | `/api/auth/login` | — | — |
| GET | `/api/records` | JWT | any active user |
| POST | `/api/records` | JWT | admin |
| PATCH | `/api/records/:id` | JWT | admin |
| DELETE | `/api/records/:id` | JWT | admin (soft delete) |
| GET | `/api/dashboard/summary` | JWT | analyst, admin |
| GET | `/api/dashboard/by-category` | JWT | analyst, admin |
| GET | `/api/dashboard/trends` | JWT | analyst, admin |
| GET | `/api/dashboard/recent` | JWT | analyst, admin |
| GET | `/api/users` | JWT | admin |
| PATCH | `/api/users/:id/role` | JWT | admin |
| PATCH | `/api/users/:id/status` | JWT | admin |

**Record filters (query):** `type`, `category`, `from`, `to` (dates `YYYY-MM-DD`).

Full schemas and examples: **`/api-docs`** or `docs/openapi.yaml`.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run `src/app.ts` with `nodemon` + `ts-node` |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run `node dist/app.js` |

Production deploy: set `NODE_ENV=production`, run `npm run build`, then `npm start` (install **devDependencies** on the build machine so `typescript` is available for `npm run build`).

---

## Project layout

```
src/
  app.ts                 # Express app, CORS, Swagger UI, routes
  config/db.ts           # SQLite schema bootstrap
  middleware/            # JWT auth, role checks
  modules/auth/          # register, login
  modules/records/       # CRUD + filters
  modules/dashboard/     # summaries, trends, recent
  modules/users/         # list users, role/status updates
  utils/errors.ts        # AppError + HTTP helpers
docs/
  openapi.yaml           # OpenAPI 3 spec (source for /api-docs)
```

---

## Optional: view spec without running the server

After pushing to GitHub, you can open the spec in **Swagger Editor**:

`https://editor.swagger.io/?url=https://raw.githubusercontent.com/sajdeen-dev/finlytics-api/main/docs/openapi.yaml`

(Replace owner/repo/branch if your fork differs.)

---

## License / use

Built for evaluation / portfolio use. Not production-hardened (no rate limiting, no pagination on list endpoints, etc.).
