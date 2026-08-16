# SentinelX

AI-Powered Cybersecurity Assessment Platform — a working full-stack
foundation with real (not mocked) passive website security scanning.

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4
- **Backend**: FastAPI + SQLAlchemy + JWT auth + SQLite (or PostgreSQL)

## What's implemented right now

| Area | Status |
|---|---|
| Landing page | ✅ Done |
| Login / Register | ✅ Done, real JWT auth |
| Dashboard | ✅ Done, live stats from your assessments |
| Website Assessment | ✅ Done — **real** passive scan (SSL, security headers, cookie flags, robots.txt/sitemap.xml, tech fingerprint, risk score) |
| Reports (PDF) | ✅ Done — auto-generated on every assessment, downloadable |
| Network Assessment | ✅ Done — TCP-connect port scan, service/banner detection, response time, best-effort OS guess, risk score |
| Threat Intelligence / CVE / Knowledge Base / Settings | 🚧 Not built yet |

The pieces marked 🚧 are next-phase work — ask and I'll build them the
same way (real functionality, not mocked data).

---

## Running it locally (no Docker)

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs at
`http://localhost:8000/docs`. A local `sentinelx.db` SQLite file is
created automatically on first run — no database setup needed.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/v1/*`
calls to the backend automatically (see `vite.config.ts`), so there's
no CORS setup needed in dev.

Open `http://localhost:5173`, register an account, and run a website
assessment against a site you own or are authorized to test.

---

## Running it with Docker

From the project root:

```bash
docker compose up --build
```

This starts three containers:
- `db` — PostgreSQL 16
- `backend` — FastAPI on port `8000`
- `frontend` — built React app served by nginx on port `8080`

Open `http://localhost:8080`.

To stop: `docker compose down` (add `-v` to also wipe the database volume).

---

## Deploying separately

**Backend** (Railway, Render, Fly.io, a VPS, etc.): deploy the `backend/`
folder as a Docker container or directly with `uvicorn`/`gunicorn`. Set
`DATABASE_URL` (Postgres in production), `SECRET_KEY`, and `CORS_ORIGINS`
as environment variables.

**Frontend on Vercel**:
1. Push this repo to GitHub.
2. Import the repo in Vercel, set the **Root Directory** to `frontend`.
3. Framework Preset: **Vite** (auto-detected from `vite.config.ts`).
4. Build Command: `npm run build`, Output Directory: `dist` (defaults).
5. Add an environment-based rewrite or update `src/lib/api.ts`'s
   `baseURL` to point at your deployed backend URL (the dev proxy only
   works locally).

---

## Project structure

```
sentinelx/
  backend/
    app/
      core/        — settings, JWT, password hashing, auth dependency
      database/    — SQLAlchemy engine/session
      models/      — User, WebsiteAssessment, Report
      schemas/     — Pydantic request/response models
      services/    — website_scanner.py (real scan logic), pdf_report.py
      routers/     — auth, assessments, reports
      middleware/  — security headers
      main.py
    requirements.txt
    Dockerfile
    .env.example
  frontend/
    src/
      pages/       — Landing, Login, Register, Dashboard, WebsiteAssessment, Reports, NetworkAssessment, NotFound
      components/  — Sidebar, Topbar, StatCard, RiskBadge, etc.
      layouts/      — AppLayout (sidebar shell for authenticated pages)
      context/     — AuthContext (JWT-based auth state)
      lib/api.ts   — typed API client
    Dockerfile
    nginx.conf
  docker-compose.yml
```

## Security notes

- The website scanner is **passive only** — it reads publicly-served
  headers, TLS certificate metadata, and robots.txt/sitemap.xml. It
  never attempts exploitation, brute-forcing, or active attacks.
- The network scanner does standard **TCP-connect checks** against a
  curated list of ~20 well-known ports (the same kind of connection
  any client makes) — no SYN/stealth scanning, no brute-forcing, no
  exploitation. The UI requires an explicit "I'm authorized to test
  this host" confirmation before every scan, and the backend rejects
  the request if that flag isn't set.
- Only assess domains/hosts you own or are explicitly authorized to test.
- Passwords are hashed with bcrypt; auth uses short-lived JWT access
  tokens plus longer-lived refresh tokens.
- Auth endpoints are rate-limited (register: 5/min, login: 10/min) to
  slow down brute-force attempts.
- Change `SECRET_KEY` before deploying anywhere real.
