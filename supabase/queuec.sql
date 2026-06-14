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

-- ============================================================
-- GUT FEEL + RELATIONSHIP INTELLIGENCE SCAFFOLDING
-- Additive and idempotent. Safe to re-run.
-- ============================================================

alter table public.captures add column if not exists initial_gut_feel text;
alter table public.captures add column if not exists initial_gut_feel_created_at timestamptz;
alter table public.captures add column if not exists initial_gut_feel_updated_at timestamptz;
alter table public.captures add column if not exists gut_feel_label text;
alter table public.captures add column if not exists gut_momentum_hint text;

alter table public.captures add column if not exists outcome_status text;
alter table public.captures add column if not exists outcome_updated_at timestamptz;

alter table public.captures add column if not exists ai_momentum text;
alter table public.captures add column if not exists ai_confidence int;
alter table public.captures add column if not exists ai_primary_signals jsonb;

alter table public.captures add column if not exists current_relationship_sense text;
alter table public.captures add column if not exists relationship_movement text;
alter table public.captures add column if not exists movement_reason text;
alter table public.captures add column if not exists relationship_sense_updated_at timestamptz;

alter table public.captures add column if not exists relationship_sense_result text;

alter table public.captures add column if not exists relationship_read text;
alter table public.captures add column if not exists commitment_level text;
alter table public.captures add column if not exists reciprocity_read text;
alter table public.captures add column if not exists moving_toward_signals jsonb;
alter table public.captures add column if not exists moving_away_signals jsonb;
alter table public.captures add column if not exists relationship_read_summary text;
alter table public.captures add column if not exists safe_to_send boolean;
alter table public.captures add column if not exists safe_to_send_reason text;
alter table public.captures add column if not exists needs_you_reasons jsonb;
alter table public.captures add column if not exists memory_anchors jsonb;
alter table public.captures add column if not exists why_follow_up text;

-- ============================================================
-- HUMAN READS v2.0 — extraction + display only (never scoring).
-- ============================================================
alter table public.captures add column if not exists human_reads jsonb;
alter table public.captures add column if not exists anchor_read jsonb;
alter table public.captures add column if not exists imprint_read jsonb;
alter table public.captures add column if not exists opening_read jsonb;
alter table public.captures add column if not exists intelligence_read jsonb;

-- ============================================================
-- INTELLIGENCE ARCHITECTURE v1 — parent-child taxonomy.
-- Full structured intelligence lives in one JSONB column; only a couple
-- of fields are promoted to columns for Hub filtering (spec section 17).
-- ============================================================
alter table public.captures add column if not exists intelligence_json jsonb;
alter table public.captures add column if not exists momentum_level text;
