# Deployment Guide

Architecture: the browser loads the static frontend and calls our **own API** (`/api/*`), served by an Express server on Render. The server is the only thing that talks to Supabase, using the service-role key — no database keys exist in the browser bundle.

```
Browser ──► Render (Express: serves dist/ + /api/*) ──► Supabase
```

**Before deploying:** complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md) so you have your Supabase URL and service-role key ready.

## Environment variables (Render, required)

| Variable | Value | Where |
|---|---|---|
| `SUPABASE_URL` | Your Supabase Project URL | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key | Same place — keep it secret |

The frontend needs **no** environment variables.

---

## Render (API + frontend)

The repo includes `render.yaml` (Node web service).

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New" > "Blueprint"** and connect the `HansenYGVinci/points-booth-tracking` repository
3. Render detects `render.yaml` → click **"Apply"**
4. When prompted, paste `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
5. The service builds (`npm install && npm run build`), starts (`node server/index.js`), and goes live at `https://points-booth-tracking.onrender.com`

(Alternative: **"New" > "Web Service"**, pick the repo, Runtime **Node**, Build Command `npm install && npm run build`, Start Command `npm run start`, add the two env vars manually.)

Every push to `master` triggers an automatic redeploy.

> Free-tier web services spin down after ~15 minutes of inactivity — the first request after that takes up to a minute (cold start).

## Vercel (optional frontend mirror)

Vercel can also host the frontend; `vercel.json` proxies `/api/*` to the Render service, so both deployments share the same backend and database.

1. Go to [vercel.com](https://vercel.com) → **"Add New..." > "Project"** → import the repo
2. Vercel auto-detects Vite — defaults work, **no env vars needed**
3. Deploy

Note: API calls from the Vercel deployment are proxied to Render, so they're subject to Render's cold-start delay.

## Supabase (Database)

One-time setup only — see [SUPABASE_SETUP.md](SUPABASE_SETUP.md). After deployment works, run the policy-lockdown SQL in Step 5 there.

## Local development

1. `npm install`
2. Copy `.env.example` → `.env`, fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Terminal 1: `npm run server` (API on :3000)
4. Terminal 2: `npm run dev` (frontend on :5173, proxies `/api` to :3000)
