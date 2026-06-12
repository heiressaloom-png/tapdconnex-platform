-- ============================================================
-- STEP C addendum — columns the async worker needs.
--
-- Run AFTER queue.sql. Additive and idempotent (safe to re-run).
-- These three columns let the worker replay a capture's context, and
-- let the 3 next steps + gut feel persist server-side so the Hub reads
-- them back via /api/captures (not just from localStorage).
-- ============================================================

-- The full structuring context, captured at enqueue time (Step D writes it):
-- { template:{id,name,signals,canonical}, ownerStyle, userIntent,
--   eventContext, gutFeel }. The worker reads this to build the prompt,
-- exactly mirroring what the synchronous pipeline sends to /api/process-capture.
alter table public.captures add column if not exists job_payload jsonb;

-- The three senior next steps (voice fix #1). Stored as an array so cross-device
-- sync carries all three, not just the first (which still lives in `action`).
alter table public.captures add column if not exists next_steps jsonb;

-- The user's one-tap read (Gut Feel #3): 'strong' | 'warm' | 'light' | null.
alter table public.captures add column if not exists gut_feel text;
