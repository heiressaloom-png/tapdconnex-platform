-- ============================================================
-- STEP B — Async capture queue + audio storage.
--
-- Moves capture processing off the browser. The capture ROW IS THE JOB:
-- the client inserts a row immediately (split-moment flow) with
-- ai_status = 'queued' and a pointer to the uploaded audio, then a worker
-- (/api/process-job) drains the queue and updates the same row in place
-- as it transcribes -> structures -> finishes. The Hub reads ai_status
-- per card to show live progress.
--
-- DESIGN NOTES
--  * ADDITIVE ONLY. Safe to run against a live `captures` table — every
--    statement is `if not exists` / `add column if not exists` / `on
--    conflict do nothing`. It will not drop, rename, or rewrite anything.
--  * The `captures` table is created here only as a guard for fresh
--    environments. If it already exists, the create is a no-op and the
--    alters below add just the new queue columns.
--  * `captures.id` is TEXT (ids look like `cap_lxyz_abc123`), consistent
--    with feedback.engagement_id.
--  * RLS is intentionally NOT toggled here. The current API uses the
--    service-role client (which bypasses RLS), and the existing table may
--    already carry its own RLS config — we don't want to disturb it.
--    Wire Supabase Auth first, then add per-user policies in a later step.
-- ============================================================

create extension if not exists pgcrypto;

-- ---- captures table (guard for fresh envs; no-op if it already exists) ----
create table if not exists public.captures (
  id                       text primary key,
  user_id                  uuid references auth.users(id),
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
  captured_at              timestamptz default now(),
  event                    text,
  event_key                text,
  outcome                  text default 'active',
  template                 text,
  template_name            text,
  needs_name_confirmation  boolean default false,
  name_confidence          text,
  completeness             int,
  channel_preference       text,
  transcript_confidence    text,
  updated_at               timestamptz default now()
);

-- ============================================================
-- QUEUE COLUMNS (the part that matters even on an existing table)
-- ============================================================

-- Processing lifecycle the Hub reads per card. Defaults to 'ready' so that
-- existing, already-processed captures are never shown as "in progress".
-- The enqueue path sets 'queued' explicitly for new audio captures.
--   queued       -> waiting for the worker
--   transcribing -> audio -> text in flight
--   structuring  -> transcript -> relationship draft in flight
--   ready        -> done, draft available
--   failed       -> a step errored; eligible for retry while attempts < 3
--   manual       -> no audio / user is filling the form by hand
alter table public.captures add column if not exists ai_status text default 'ready';

-- Pointer to the uploaded audio in the `capture-audio` storage bucket
-- (object path, e.g. `<user_id>/<capture_id>.webm`). The worker reads this.
alter table public.captures add column if not exists audio_path text;
alter table public.captures add column if not exists audio_mime text;

-- Raw transcript, persisted once so structuring can be retried without
-- re-transcribing (and so the draft can stay honest about a thin transcript).
alter table public.captures add column if not exists transcript text;

-- Honest carry-through of Step A's backgrounding flag: true when some audio
-- may be missing, so the draft can flag low confidence rather than paper over it.
alter table public.captures add column if not exists audio_incomplete boolean default false;

-- Retry bookkeeping. ONE sweep handles both stragglers and retries:
-- the cron picks up `queued` rows the kick missed AND `failed` rows where
-- attempts < 3. attempts is incremented each time the worker claims the row.
alter table public.captures add column if not exists attempts int default 0;
alter table public.captures add column if not exists last_error text;

-- Timing, for observability and to detect stuck-in-flight rows.
alter table public.captures add column if not exists enqueued_at timestamptz;
alter table public.captures add column if not exists processing_started_at timestamptz;
alter table public.captures add column if not exists processed_at timestamptz;

-- ============================================================
-- INDEXES
-- ============================================================

-- Per-user Hub list ordering (matches captures.js GET).
create index if not exists captures_user_idx
  on public.captures (user_id, captured_at desc);

-- The sweep index: the cron and the kick both scan exactly these rows —
-- anything still in flight or eligible for retry. Partial index keeps it tiny.
create index if not exists captures_queue_idx
  on public.captures (ai_status, enqueued_at)
  where ai_status in ('queued', 'transcribing', 'structuring', 'failed');

-- ============================================================
-- STORAGE — private bucket for the raw audio blobs.
-- ============================================================

-- Private bucket. Uploads/downloads go through the service-role client in the
-- API (which bypasses storage RLS), so no bucket policies are required yet.
-- When Supabase Auth is wired, add per-user read/write policies on
-- storage.objects scoped to (bucket_id = 'capture-audio' and owner = auth.uid()).
insert into storage.buckets (id, name, public)
values ('capture-audio', 'capture-audio', false)
on conflict (id) do nothing;
