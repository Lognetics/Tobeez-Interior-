-- Per-user data store. Everything a signed-in user creates (projects, estimates,
-- orders, bookings, invoices, conversations, saved designs, notifications) is
-- synced here as a single JSONB blob, protected by Row Level Security so each
-- user can only read and write their own row.

create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "own data - select" on public.user_data;
create policy "own data - select" on public.user_data
  for select using (auth.uid() = user_id);

drop policy if exists "own data - insert" on public.user_data;
create policy "own data - insert" on public.user_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "own data - update" on public.user_data;
create policy "own data - update" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
