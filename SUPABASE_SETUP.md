# Supabase Setup Instructions

## Step-by-Step Guide to Set Up Supabase for Points & Booth Tracking App

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign in
2. Click **"New project"**
3. Choose your organization
4. Enter a project name (e.g., "points-booth-tracking")
5. Set a database password (save it somewhere safe)
6. Select a region closest to your users
7. Click **"Create new project"** and wait for it to provision

### Step 2: Create the Database Table
1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open `supabase/schema.sql` from this repository, copy its full contents, and paste it into the editor
4. Click **"Run"**
5. Verify: go to **"Table Editor"** — you should see a `users` table with columns `id`, `role`, `points_count`, `booth_1`, `booth_2`, `booth_3`

### Step 3: Get Your API Credentials
In the project dashboard, click the **gear icon (⚙️) > "API"** (or "Project Settings" > "API") and copy:
- **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
- **service_role** key (under "Project API keys") — ⚠️ **this one is a real secret**, never commit it or put it in frontend code

The app does NOT use the anon key: the browser talks only to our own server (`server/index.js`), and the server uses the service-role key.

### Step 4: Configure Credentials
- **Local development:** copy `.env.example` to `.env` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Render:** set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the service's Environment settings (see [DEPLOYMENT.md](DEPLOYMENT.md))

### Step 5: Lock Down the Table (recommended)
Once everything works, remove the public access policies — the server bypasses Row Level Security, so nothing legitimate uses them:

```sql
drop policy "public read users" on public.users;
drop policy "public insert users" on public.users;
drop policy "public update users" on public.users;
```

After this, the database is unreachable with the anon key alone; all access flows through the server's validated API endpoints.

### Step 6: Test the App Locally
1. Install dependencies: `npm install`
2. Terminal 1 — backend: `npm run server` (loads `.env`)
3. Terminal 2 — frontend: `npm run dev` (proxies `/api` to the backend)
4. Open the URL Vite prints (usually http://localhost:5173)
5. Test signup with a new 8-digit ID, login, and admin IDs:
   - "59322370" (Super Admin)
   - "88880001" (Booth 1 Admin)
   - "88880002" (Booth 2 Admin)
   - "88880003" (Booth 3 Admin)
   - "88889999" (Super Admin)

### Admin ID Reference
- **59322370**: Super Admin (all booths + purchases)
- **88880001**: Booth 1 Admin (can only toggle Booth 1)
- **88880002**: Booth 2 Admin (can only toggle Booth 2)
- **88880003**: Booth 3 Admin (can only toggle Booth 3)
- **88889999**: Super Admin (can toggle all booths + process purchases)

Admin IDs are defined server-side in `server/index.js` — they no longer appear in the public JavaScript bundle.

### Remaining Security Notes
- There are no passwords: an 8-digit ID is the only credential. Anyone who knows an ID can use that account. For real production use, add proper authentication (e.g., Supabase Auth with email) and per-request authorization on the server.
- The booth/purchase endpoints validate input server-side but don't verify the caller is an admin (there's no session system). Locking this down requires the auth work above.

### Troubleshooting
- If the server logs "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", check your `.env` locally or the Render environment settings
- If API calls return 500, check the Render logs — usually a wrong service-role key
- If signup/login returns 404/409 unexpectedly, check the `users` table in Table Editor
