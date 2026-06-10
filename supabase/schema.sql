-- ============================================================
-- ROUND 8 — feedback table (Human Feedback Loop / Layer 13)
-- Stores learning SIGNALS only. Calibration happens elsewhere, later.
--
-- Important for current TAPDconnex build:
-- engagement_id is TEXT because current capture ids are strings like:
--   cap_lxyz_abc123
-- not UUIDs.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.feedback (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id),
  engagement_id   text,
  type            text default 'interpretation',
  feedback_option text not null,
  learning_signal text,
  note            text,
  created_at      timestamptz default now()
);

create index if not exists feedback_user_idx
  on public.feedback (user_id, created_at desc);

create index if not exists feedback_engagement_idx
  on public.feedback (engagement_id);

alter table public.feedback enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'feedback'
      and policyname = 'insert own feedback'
  ) then
    create policy "insert own feedback"
      on public.feedback
      for insert
      with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'feedback'
      and policyname = 'read own feedback'
  ) then
    create policy "read own feedback"
      on public.feedback
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;

-- No update/delete policy:
-- feedback is append-only, a historical learning signal, not editable state.
