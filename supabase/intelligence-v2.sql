-- ============================================================
-- TAPDconnex Intelligence Architecture v2.1 — Increment A
-- ADDITIVE, IDEMPOTENT storage prep. Safe to re-run.
--
-- This migration ONLY adds columns. It does not drop, rename, or
-- consolidate anything. The full structured intelligence always lives in
-- captures.intelligence_json; the columns below mirror a few fields for
-- Relationship Hub filtering/sorting. No app logic depends on these yet
-- (they are written/read in Increments B and C).
--
-- Already present (from queue.sql / queue-c.sql) — NOT re-defined here:
--   intelligence_json jsonb, momentum_level text, safe_to_send boolean,
--   completeness int  (used as the completeness score), action text,
--   next_steps jsonb  (used as next step)
-- ============================================================

-- Mirrored UI/Hub fields (string/jsonb) — derived by the analyzer later.
alter table public.captures add column if not exists behavioral_read        text;
alter table public.captures add column if not exists opportunity_readiness   text;
alter table public.captures add column if not exists relationship_priority   text;
alter table public.captures add column if not exists attention_labels        jsonb;
alter table public.captures add column if not exists human_read_summary      text;

-- Ledgers. MVP1: commitment_ledger is created/stored (no automation).
--         outcome_ledger is column + shape only (prepared for MVP2).
alter table public.captures add column if not exists commitment_ledger       jsonb;
alter table public.captures add column if not exists outcome_ledger          jsonb;

-- Helpful indexes for Hub filtering (cheap, optional).
create index if not exists captures_relationship_priority_idx
  on public.captures (relationship_priority);
create index if not exists captures_opportunity_readiness_idx
  on public.captures (opportunity_readiness);
