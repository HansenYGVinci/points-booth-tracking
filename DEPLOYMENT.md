# Deployment Guide

This app is a [Vite](https://vite.dev) static build backed by Supabase. The frontend can be hosted on **Vercel** and **Render** at the same time — both deployments talk to the same Supabase database.

**Before deploying:** complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md) so you have your Supabase URL and anon key ready.

## Environment variables (required on every host)

The build needs these two variables at **build time**:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

Without them the deployed app shows a "Supabase is not configured" error.

---

## Vercel

The repo includes `vercel.json` (framework: Vite, build: `npm run build`, output: `dist`).

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..." > "Project"** and import `HansenYGVinci/points-booth-tracking`
3. Vercel auto-detects Vite — the default build settings work as-is
4. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Click **"Deploy"** — your app is live at `https://<project-name>.vercel.app`

Every push to `master` triggers an automatic redeploy.

## Render

The repo includes `render.yaml` (Render Blueprint for a static site).

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New" > "Blueprint"** and connect the `HansenYGVinci/points-booth-tracking` repository
3. Render detects `render.yaml` and shows the `points-booth-tracking` static site — click **"Apply"**
4. Render prompts you for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (declared in `render.yaml`) — paste your values
5. The site builds (`npm install && npm run build`) and goes live at `https://points-booth-tracking.onrender.com`

(Alternative: **"New" > "Static Site"**, pick the repo, set Build Command to `npm install && npm run build`, Publish Directory to `dist`, and add the two env vars manually.)

Every push to `master` triggers an automatic redeploy.

## Supabase (Backend)

Supabase hosts the Postgres database and realtime API — nothing to "deploy" beyond the one-time setup in [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Both frontend hosts connect to it directly from the browser.

## Notes

- Both Vercel and Render deployments build the same code and share one database, so data stays in sync between them.
- If you ever rotate your Supabase keys, update the env vars in both dashboards and trigger a redeploy.
- Local development: `npm install`, copy `.env.example` to `.env` with your keys, then `npm run dev`.
