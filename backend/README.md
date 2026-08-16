# SentinelX Backend

FastAPI backend for the SentinelX cybersecurity assessment platform.

## What's implemented (Phase 1)

- JWT authentication — register, login, refresh, `/me`
- Real, passive website security assessment:
  - SSL/TLS certificate validity + expiry
  - Security headers (HSTS, CSP, X-Frame-Options, etc.)
  - Cookie flags (Secure / HttpOnly / SameSite)
  - robots.txt / sitemap.xml presence
  - Basic tech fingerprinting from response headers
  - Weighted risk score (0–100) + recommendations
- PDF report generation (reportlab) + download endpoint
- Rate limiting on auth endpoints, security response headers, CORS
- SQLite by default (zero setup) — swappable to PostgreSQL via `DATABASE_URL`

**Not yet built** (next phases, matching the original module order):
Network Assessment, Threat Intelligence, CVE Intelligence, Knowledge Base,
Notifications, Settings/API keys. These are intentionally left out rather
than faked — ask and they'll be added module by module.

## Run locally (SQLite, no Docker)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # defaults already work out of the box

uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Run with Docker (PostgreSQL)

From the project root (not the `backend/` folder):

```bash
docker compose up --build
```

This starts Postgres + the API on port 8000, using the `DATABASE_URL` set
in `docker-compose.yml`.

## Key environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite by default; set to a Postgres URL for production |
| `SECRET_KEY` | JWT signing secret — **change this before deploying** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `REPORTS_DIR` | Where generated PDF reports are written |

## API overview

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me

POST   /api/v1/assessments/website        # run a new scan
GET    /api/v1/assessments/website        # list your assessments
GET    /api/v1/assessments/website/{id}   # get one assessment

POST   /api/v1/reports                    # generate a PDF for an assessment
GET    /api/v1/reports                    # list your reports
GET    /api/v1/reports/{id}/download      # download the PDF

GET    /api/v1/health
```

## Security notes

- All website-assessment checks are passive/read-only: they only read
  publicly served headers, TLS metadata, and well-known files
  (robots.txt/sitemap.xml). Nothing here performs scanning, brute-forcing,
  or exploitation.
- Passwords are hashed with bcrypt; JWTs are signed with `SECRET_KEY`.
- Rotate `SECRET_KEY` and never commit a real `.env` file.
