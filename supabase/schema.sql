-- ============================================================
-- TAPDconnex — Supabase schema (MVP / pre-auth phase)
-- Run this in the Supabase SQL editor.
--
-- TWO-PHASE DESIGN:
--   Phase 1 (now): user_id is a plain uuid supplied by the client
--     (crypto.randomUUID stored as tapd_user_id). No FK to auth.users yet,
--     so the Hub can persist immediately while you test. The API uses the
--     service-role key, which bypasses RLS.
--   Phase 2 (go-live): wire Supabase Auth, switch the API to the user's JWT,
--     then run the "PHASE 2" migration at the bottom to add the auth.users FK.
-- ============================================================

create table if not exists public.profiles (
  user_id     uuid primary key,
  data        jsonb not null default '{}'::jsonb,
  plan        text  not null default 'starter',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.captures (
  id                       text primary key,
  user_id                  uuid not null,
  name                     text,
  company                  text,
  role                     text,
  signal                   text,
  signal_label             text,
  evidence                 text,
  secondary_thread         text,
  priority                 text,
  action                   text,
  draft_message            text,
  context                  text,
  captured_at              timestamptz not null default now(),
  event                    text,
  event_key                text,
  outcome                  text not null default 'active',
  template                 text,
  template_name            text,
  needs_name_confirmation  boolean not null default false,
  name_confidence          text,
  completeness             jsonb,
  channel_preference       text,
  transcript_confidence    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists captures_user_idx    on public.captures (user_id);
create index if not exists captures_outcome_idx on public.captures (user_id, outcome);

-- ----- Row Level Security (service-role bypasses; enforces once Auth is wired) -----
alter table public.profiles enable row level security;
alter table public.captures enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

create policy "captures_select_own" on public.captures for select using (auth.uid() = user_id);
create policy "captures_insert_own" on public.captures for insert with check (auth.uid() = user_id);
create policy "captures_update_own" on public.captures for update using (auth.uid() = user_id);
create policy "captures_delete_own" on public.captures for delete using (auth.uid() = user_id);

-- ============================================================
-- PHASE 2 MIGRATION (run only after Supabase Auth is wired)
-- ============================================================
-- alter table public.profiles
--   add constraint profiles_user_fk foreign key (user_id) references auth.users (id) on delete cascade;
-- alter table public.captures
--   add constraint captures_user_fk foreign key (user_id) references auth.users (id) on delete cascade;
