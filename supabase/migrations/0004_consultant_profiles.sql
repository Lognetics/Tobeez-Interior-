-- TOBEEZ INTERIORS — normalized consultant profiles.
--
-- Migration 0003 used the frontend keys d1/d2 directly in relational columns.
-- This migration preserves those keys only as legacy application references and
-- moves bookings, availability, and account assignment to consultant UUIDs.

create table if not exists public.consultant_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  legacy_id text not null unique,
  name text not null,
  user_id uuid unique references auth.users(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.consultant_profiles (id, slug, legacy_id, name)
values
  ('f335807b-f035-479a-96e0-f8181d0d5bbe', 'victory', 'd1', 'Victory Asaboro'),
  ('d1bcccf3-011d-4f04-8324-0352498870ef', 'joy', 'd2', 'Joy')
on conflict (id) do update
set slug = excluded.slug,
    legacy_id = excluded.legacy_id,
    name = excluded.name,
    updated_at = now();

-- Preserve any account links already entered in consultant_users.
do $$
begin
  if to_regclass('public.consultant_users') is not null then
    execute $copy$
      update public.consultant_profiles c
      set user_id = cu.user_id,
          updated_at = now()
      from public.consultant_users cu
      where c.legacy_id = cu.consultant_id
        and c.user_id is distinct from cu.user_id
    $copy$;
  end if;
end;
$$;

-- Remove database objects that depend on the original text columns.
drop function if exists public.create_consultation_booking(text, text, text, text, text, date, text, integer, text, text);
drop function if exists public.transition_consultation_booking(uuid, text);
drop function if exists public.get_consultant_availability(text, date, date);

drop policy if exists "consultants read addressed bookings" on public.bookings;
drop policy if exists "consultants update addressed bookings" on public.bookings;
drop policy if exists "consultants manage own availability" on public.consultant_availability;
do $$
begin
  if to_regclass('public.consultant_users') is not null then
    execute 'drop policy if exists "consultants read own mapping" on public.consultant_users';
  end if;
end;
$$;

drop index if exists public.bookings_active_slot_unique;
drop index if exists public.bookings_consultant_schedule_idx;
drop index if exists public.consultant_availability_date_unique;
drop index if exists public.consultant_availability_weekday_unique;

-- Replace bookings.consultant_id text with its consultant UUID foreign key.
do $$
declare
  consultant_id_type text;
  unmatched_rows bigint;
begin
  select data_type into consultant_id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'bookings' and column_name = 'consultant_id';

  if consultant_id_type = 'text' then
    alter table public.bookings add column consultant_uuid uuid;
    update public.bookings b
    set consultant_uuid = c.id
    from public.consultant_profiles c
    where c.legacy_id = b.consultant_id;

    select count(*) into unmatched_rows
    from public.bookings
    where consultant_uuid is null;
    if unmatched_rows > 0 then
      raise exception 'Cannot migrate % booking rows with unknown consultant IDs', unmatched_rows;
    end if;

    alter table public.bookings alter column consultant_uuid set not null;
    alter table public.bookings drop column consultant_id;
    alter table public.bookings rename column consultant_uuid to consultant_id;
    alter table public.bookings
      add constraint bookings_consultant_id_fkey
      foreign key (consultant_id) references public.consultant_profiles(id);
  end if;
end;
$$;

-- Replace availability.consultant_id text with the same UUID relationship.
do $$
declare
  consultant_id_type text;
  unmatched_rows bigint;
begin
  select data_type into consultant_id_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'consultant_availability'
    and column_name = 'consultant_id';

  if consultant_id_type = 'text' then
    alter table public.consultant_availability add column consultant_uuid uuid;
    update public.consultant_availability ca
    set consultant_uuid = c.id
    from public.consultant_profiles c
    where c.legacy_id = ca.consultant_id;

    select count(*) into unmatched_rows
    from public.consultant_availability
    where consultant_uuid is null;
    if unmatched_rows > 0 then
      raise exception 'Cannot migrate % availability rows with unknown consultant IDs', unmatched_rows;
    end if;

    alter table public.consultant_availability alter column consultant_uuid set not null;
    alter table public.consultant_availability drop column consultant_id;
    alter table public.consultant_availability rename column consultant_uuid to consultant_id;
    alter table public.consultant_availability
      add constraint consultant_availability_consultant_id_fkey
      foreign key (consultant_id) references public.consultant_profiles(id);
  end if;
end;
$$;

drop table if exists public.consultant_users;

create unique index if not exists bookings_active_slot_unique
  on public.bookings (consultant_id, date_iso, time)
  where status in ('pending', 'confirmed');
create index if not exists bookings_consultant_schedule_idx
  on public.bookings (consultant_id, date_iso, time);
create unique index if not exists consultant_availability_date_unique
  on public.consultant_availability (consultant_id, date_iso)
  where date_iso is not null;
create unique index if not exists consultant_availability_weekday_unique
  on public.consultant_availability (consultant_id, weekday)
  where weekday is not null;

alter table public.consultant_profiles enable row level security;

drop policy if exists "consultants read own profile" on public.consultant_profiles;
create policy "consultants read own profile" on public.consultant_profiles
  for select using (user_id = auth.uid());

drop policy if exists "consultants read addressed bookings" on public.bookings;
create policy "consultants read addressed bookings" on public.bookings
  for select using (
    exists (
      select 1 from public.consultant_profiles c
      where c.user_id = auth.uid() and c.id = bookings.consultant_id
    )
  );

drop policy if exists "consultants update addressed bookings" on public.bookings;
create policy "consultants update addressed bookings" on public.bookings
  for update using (
    exists (
      select 1 from public.consultant_profiles c
      where c.user_id = auth.uid() and c.id = bookings.consultant_id
    )
  ) with check (
    exists (
      select 1 from public.consultant_profiles c
      where c.user_id = auth.uid() and c.id = bookings.consultant_id
    )
  );

drop policy if exists "consultants manage own availability" on public.consultant_availability;
create policy "consultants manage own availability" on public.consultant_availability
  for all using (
    exists (
      select 1 from public.consultant_profiles c
      where c.user_id = auth.uid() and c.id = consultant_availability.consultant_id
    )
  ) with check (
    exists (
      select 1 from public.consultant_profiles c
      where c.user_id = auth.uid() and c.id = consultant_availability.consultant_id
    )
  );

revoke all on public.consultant_profiles from anon, authenticated;
grant select on public.consultant_profiles to authenticated;

create or replace function public.create_consultation_booking(
  p_consultant_id text,
  p_client_name text,
  p_client_email text,
  p_type text,
  p_mode text,
  p_date_iso date,
  p_time text,
  p_amount integer,
  p_paystack_ref text,
  p_notes text default ''
)
returns setof public.bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  expected_amount integer;
  resolved_consultant_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select id into resolved_consultant_id
  from public.consultant_profiles
  where legacy_id = p_consultant_id and active;
  if resolved_consultant_id is null then
    raise exception 'Unknown consultant' using errcode = '22023';
  end if;

  expected_amount := case p_mode
    when 'virtual' then 100000
    when 'phone' then 100000
    when 'physical' then 150000
    else null
  end;
  if expected_amount is null or p_amount <> expected_amount then
    raise exception 'Invalid consultation amount' using errcode = '22023';
  end if;

  return query
  insert into public.bookings (
    client_user_id, consultant_id, client_name, client_email, type, mode,
    date_iso, time, amount, paystack_ref, status, notes
  ) values (
    auth.uid(), resolved_consultant_id, trim(p_client_name), lower(trim(p_client_email)),
    trim(p_type), p_mode, p_date_iso, p_time, p_amount, trim(p_paystack_ref),
    'pending', coalesce(trim(p_notes), '')
  )
  returning *;
end;
$$;

revoke all on function public.create_consultation_booking(text, text, text, text, text, date, text, integer, text, text) from public, anon;
grant execute on function public.create_consultation_booking(text, text, text, text, text, date, text, integer, text, text) to authenticated;

create or replace function public.transition_consultation_booking(
  p_booking_id uuid,
  p_action text
)
returns setof public.bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  booking_row public.bookings%rowtype;
  mapped_consultant uuid;
  next_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into booking_row from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  select id into mapped_consultant
  from public.consultant_profiles where user_id = auth.uid();

  if p_action in ('accept', 'decline', 'complete') then
    if mapped_consultant is distinct from booking_row.consultant_id then
      raise exception 'Consultant access required' using errcode = '42501';
    end if;
    if p_action in ('accept', 'decline') and booking_row.status <> 'pending' then
      raise exception 'Booking is no longer pending' using errcode = '55000';
    end if;
    if p_action = 'complete' and booking_row.status <> 'confirmed' then
      raise exception 'Only confirmed bookings can be completed' using errcode = '55000';
    end if;
    next_status := case p_action
      when 'accept' then 'confirmed'
      when 'decline' then 'declined'
      else 'completed'
    end;
  elsif p_action = 'cancel' then
    if booking_row.client_user_id <> auth.uid() then
      raise exception 'Client access required' using errcode = '42501';
    end if;
    if booking_row.status not in ('pending', 'confirmed') then
      raise exception 'Booking cannot be cancelled' using errcode = '55000';
    end if;
    next_status := 'cancelled';
  else
    raise exception 'Invalid booking action' using errcode = '22023';
  end if;

  return query
  update public.bookings set status = next_status where id = p_booking_id
  returning *;
end;
$$;

revoke all on function public.transition_consultation_booking(uuid, text) from public, anon;
grant execute on function public.transition_consultation_booking(uuid, text) to authenticated;

create or replace function public.get_consultant_availability(
  p_consultant_id text,
  p_from date,
  p_to date
)
returns table (date_iso date, slots jsonb)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  resolved_consultant_id uuid;
begin
  select id into resolved_consultant_id
  from public.consultant_profiles
  where legacy_id = p_consultant_id and active;
  if resolved_consultant_id is null then
    return;
  end if;

  return query
  with calendar as (
    select day::date as date_iso
    from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') day
    where p_to >= p_from and p_to - p_from <= 62
  ), configured as (
    select
      calendar.date_iso,
      coalesce(specific.slots, weekly.slots) as configured_slots
    from calendar
    left join lateral (
      select ca.slots
      from public.consultant_availability ca
      where ca.consultant_id = resolved_consultant_id and ca.date_iso = calendar.date_iso
      limit 1
    ) specific on true
    left join lateral (
      select ca.slots
      from public.consultant_availability ca
      where ca.consultant_id = resolved_consultant_id
        and ca.weekday = extract(dow from calendar.date_iso)::smallint
      limit 1
    ) weekly on true
  )
  select
    configured.date_iso,
    coalesce(
      jsonb_agg(to_jsonb(slot.value) order by slot.value)
        filter (where slot.value is not null and not exists (
          select 1 from public.bookings b
          where b.consultant_id = resolved_consultant_id
            and b.date_iso = configured.date_iso
            and b.time = slot.value
            and b.status in ('pending', 'confirmed')
        )),
      '[]'::jsonb
    ) as slots
  from configured
  left join lateral jsonb_array_elements_text(configured.configured_slots) slot(value) on true
  where configured.configured_slots is not null
  group by configured.date_iso
  order by configured.date_iso;
end;
$$;

revoke all on function public.get_consultant_availability(text, date, date) from public;
grant execute on function public.get_consultant_availability(text, date, date) to anon, authenticated;

-- SQL-editor-only helper. It is deliberately unavailable through the API.
create or replace function public.assign_consultant_account(
  p_consultant_slug text,
  p_user_email text
)
returns table (consultant_name text, consultant_id uuid, account_user_id uuid, account_email text)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_user_id uuid;
begin
  select u.id into target_user_id
  from auth.users u
  where lower(u.email) = lower(trim(p_user_email));
  if target_user_id is null then
    raise exception 'No Supabase Auth user exists for %', p_user_email using errcode = 'P0002';
  end if;

  update public.consultant_profiles c
  set user_id = target_user_id,
      updated_at = now()
  where c.slug = lower(trim(p_consultant_slug));
  if not found then
    raise exception 'Unknown consultant profile: %', p_consultant_slug using errcode = 'P0002';
  end if;

  return query
  select c.name, c.id, c.user_id, u.email::text
  from public.consultant_profiles c
  join auth.users u on u.id = c.user_id
  where c.slug = lower(trim(p_consultant_slug));
end;
$$;

revoke all on function public.assign_consultant_account(text, text) from public, anon, authenticated;

comment on table public.consultant_profiles is
  'Consultant profiles and their optional Supabase Auth account assignment. Use assign_consultant_account from the SQL editor to link an account by email.';
comment on column public.consultant_profiles.legacy_id is
  'Existing frontend profile key retained for backwards compatibility; relational tables use consultant_profiles.id UUID.';
comment on table public.bookings is
  'Authoritative Paystack-verified consultation bookings linked to consultants by UUID.';
