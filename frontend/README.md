# SentinelX Frontend

React + Vite + TypeScript + Tailwind CSS v4 dashboard for the SentinelX
cybersecurity assessment platform.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. API calls to `/api/v1/*` are proxied
to `http://localhost:8000` in dev (see `vite.config.ts`) — start the
backend first (see `../backend/README.md`).

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Pages

| Route | Page |
|---|---|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/dashboard` | Overview stats + recent activity |
| `/assessments/website` | Run a live passive website security scan |
| `/assessments/network` | Placeholder — not built yet |
| `/reports` | List + download generated PDF reports |

## Deploying to Vercel

Framework Preset: **Vite**. Root Directory: `frontend` (if deploying
from the monorepo). Build Command `npm run build`, Output Directory
`dist` — both are Vercel's defaults for a Vite project. Point
`src/lib/api.ts`'s `baseURL` at your deployed backend URL before
building for production.
