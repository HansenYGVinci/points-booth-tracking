# Deployment Guide

This app is a fully static site (HTML/CSS/JS, no build step) backed by Supabase. The frontend can be hosted on **Vercel** and **Render** at the same time — both deployments talk to the same Supabase database.

**Before deploying:** complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and push the updated `app.js` (with your real Supabase URL and anon key) to GitHub.

---

## Vercel

The repo includes `vercel.json` (no build step, static output from the repo root).

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..." > "Project"**
3. Import `HansenYGVinci/points-booth-tracking`
4. Leave all settings at their defaults (Framework Preset: "Other", no build command, output directory blank)
5. Click **"Deploy"**
6. Your app is live at `https://<project-name>.vercel.app`

Every push to `master` triggers an automatic redeploy.

## Render

The repo includes `render.yaml` (Render Blueprint for a static site).

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New" > "Blueprint"**
3. Connect/select the `HansenYGVinci/points-booth-tracking` repository
4. Render detects `render.yaml` and shows the `points-booth-tracking` static site — click **"Apply"**
5. Your app is live at `https://points-booth-tracking.onrender.com`

(Alternative: **"New" > "Static Site"**, pick the repo, leave Build Command empty and set Publish Directory to `.`)

Every push to `master` triggers an automatic redeploy.

## Supabase (Backend)

Supabase hosts the Postgres database and realtime API — nothing to "deploy" beyond the one-time setup in [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Both frontend hosts connect to it directly from the browser.

## Notes

- Both Vercel and Render deployments serve identical files and share one database, so data stays in sync between them.
- If you ever rotate your Supabase keys, update `app.js` and push — both hosts redeploy automatically.
