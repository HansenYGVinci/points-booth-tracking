-- Points & Booth Tracking — Supabase schema
-- Run this in your Supabase project: SQL Editor > New query > paste > Run

-- Users table: one row per 8-digit ID
create table if not exists public.users (
    id text primary key,
    role text not null default 'user',
    points_count integer not null default 0,
    booth_1 boolean not null default false,
    booth_2 boolean not null default false,
    booth_3 boolean not null default false
);

-- Row Level Security
alter table public.users enable row level security;

-- DEV-ONLY policies: anyone can read/insert/update.
-- This mirrors Firebase "test mode" and is NOT safe for production.
-- Before going live, replace these with authenticated, role-based policies.
create policy "public read users"
    on public.users for select
    using (true);

create policy "public insert users"
    on public.users for insert
    with check (true);

create policy "public update users"
    on public.users for update
    using (true);

-- Enable realtime updates on the users table (powers the live user dashboard)
alter publication supabase_realtime add table public.users;
