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
1. In the project dashboard, click the **gear icon (⚙️) > "API"** (or "Project Settings" > "API")
2. Copy two values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Update app.js with Your Config
1. Open `app.js` in your code editor
2. Replace the placeholders at the top:
```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```
3. Save the file (and commit/push it so Vercel and Render get the update)

> The anon key is safe to expose in frontend code — it's protected by Row Level Security policies, just like a Firebase client config.

### Step 5: Test the App Locally
1. Open `index.html` in your web browser
2. Test with a regular user ID (e.g., "12345678")
3. Test with admin IDs:
   - "88880001" (Booth 1 Admin)
   - "88880002" (Booth 2 Admin)
   - "88880003" (Booth 3 Admin)
   - "88889999" (Super Admin)
4. Open a user dashboard in one tab and an admin dashboard in another — toggling a booth as admin should update the user view in real time

### Important Security Notes
⚠️ **The RLS policies in `schema.sql` allow anyone to read/write data** (equivalent to Firebase "test mode"). For production:
- Enable Supabase Auth and require authentication
- Restrict write access to admin users only
- Move admin-role checks server-side (anyone can read the hardcoded admin IDs in `app.js`)

### Admin ID Reference
- **88880001**: Booth 1 Admin (can only toggle Booth 1)
- **88880002**: Booth 2 Admin (can only toggle Booth 2)
- **88880003**: Booth 3 Admin (can only toggle Booth 3)
- **88889999**: Super Admin (can toggle all booths + process purchases)

### Troubleshooting
- If you see "permission denied" or `42501` errors, re-run `supabase/schema.sql` — the RLS policies may not have been created
- If real-time updates don't work, confirm the `alter publication supabase_realtime ...` statement ran successfully
- If login fails, double-check the URL and anon key in `app.js`, and check the browser console for errors
