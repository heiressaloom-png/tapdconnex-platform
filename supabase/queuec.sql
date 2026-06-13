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

-- The user's two-tap in-room read: { momentum: building|steady|fading,
-- receptivity: open|mixed|closed } | null. Stored as jsonb.
alter table public.captures add column if not exists gut_feel jsonb;
-- If gut_feel already exists as text from an earlier run, convert it:
--   alter table public.captures alter column gut_feel type jsonb using
--     (case when gut_feel is null then null else to_jsonb(gut_feel) end);
