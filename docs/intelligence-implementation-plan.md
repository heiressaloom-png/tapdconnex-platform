TAPDconnex Intelligence — Implementation Plan (v2.1)
> Three deployable increments. Increment A (this) = docs + additive migration,
> no app-logic change. B and C are planned below and require explicit
> confirmation before coding. Approach: **Understand → Map → Plan → Confirm →
> Code**. Strictly additive, fail-open, backward-compatible.
Confirmed decisions
Sequencing A → B → C.
Analyzer = new standalone `api/_analyzer.js` (do NOT retrofit the browser
`tapd-intelligence-framework.js` this phase).
Legacy fields = parallel-now, consolidate-next; readers tolerate v1.5 and
v2.1 shapes for one release.
Commitment Ledger = create/store only. Outcome Ledger = column + shape
only, no automation.
Increment A — DONE (this delivery)
`docs/tapd-intelligence-architecture-v2.md`
`docs/tapd-intelligence-json-schema-v1.md`
`docs/behavioral-intelligence-v1.md`
`docs/intelligence-implementation-plan.md`
`supabase/intelligence-v2.sql` — additive, idempotent (`ADD COLUMN IF NOT EXISTS`): `behavioral_read, opportunity_readiness, relationship_priority, attention_labels, human_read_summary, commitment_ledger, outcome_ledger` (+ 2
filter indexes). No drops/renames. No app logic touched.
Increment B — Prompt restructure + deterministic analyzer
B1 — `api/_prompt.js` (modify). Extend the `intelligence` object to the v2.1
sections: behavioral signal families + `scores` + `behavioral_read`,
`commitment_ledger`, v2.1 `completeness_intelligence` (status ready/needs_context/
thin/blocked), v2.1 `profile_linkage_intelligence`, flat `human_reads`. Add the
rules from behavioral-intelligence-v1.md (evidence hierarchy, commitment
hierarchy, deflection patterns, "warmth low-weight / reads describe never
score"). LLM emits compact evidence + short verdicts, not verbose nested
prose (token discipline). Keep legacy fields emitted for one release.
B2 — `api/_analyzer.js` (NEW, deterministic, pure, no LLM/network).
Input: the LLM's structured output + profileFocus. Steps:
read signal families + commitment_ledger + context + linkage
apply §24 weights (follow-through 25 / specificity 20 / investment 20 /
ownership 15 / access 10 / reciprocity 5 / warmth 5)
apply anti-inflation gates (warmth can't lift commitment; interest can't
become momentum without state change; opportunity_readiness ≤ commitment;
confidence low when evidence is positive-language-only)
derive attention labels deterministically (label rules table)
evaluate completeness (overall_score + status + breakdown)
assemble mirrored Hub fields
Output: `{ scores, momentum_level, behavioral_read, opportunity_readiness, relationship_priority, attention_labels, completeness, safe_to_send, human_read_summary }`. Fail-open: on any error, return the LLM-provided
values (today's behaviour).
B3 — `api/process-job.js` (modify). After structuring, call the analyzer;
persist `intelligence_json` (full) + the mirrored columns. Analyzer values win
for anything that drives attention/priority.
B4 — `api/process-capture.js` (modify). Same analyzer call on the sync path
so review shows analyzer-gated values.
B5 — `api/captures.js` (modify). `toRow`/`toCapture` map the new mirror
columns + ledgers (read tolerant of both shapes).
Increment C — Review + Hub mapping + ledger surfacing
C1 — `capture-app.js` (modify). Review shows Human Read · Completeness
(score+status+why, prefer `completeness_intelligence.overall_score`) ·
Behavioral Read · Attention Labels · Missing Context · Best Next Move · Safe
Follow-up. Display via human language only.
C2 — `relationship-hub.html` (modify). Card shows attention-label chips,
linked focus/goal, behavioral read, status; readers tolerate v1.5+v2.1.
C3 — Commitment Ledger surfacing (read-only list on the record). Outcome
Ledger: column present, not surfaced.
SQL migration
Only `supabase/intelligence-v2.sql` (Increment A). Run in Supabase before
deploying B. No further migration unless a missing field is discovered.
Files: new / modified / unchanged
New: `api/_analyzer.js`, `docs/*` (4), `supabase/intelligence-v2.sql`.
Modified (B/C): `api/_prompt.js`, `api/process-job.js`,
`api/process-capture.js`, `api/captures.js`, `capture-app.js`,
`relationship-hub.html`.
Unchanged / protected: `capture.html`, `capture-style.css`,
`api/transcribe.js`, `api/enqueue-job.js`, `tapd-intelligence-framework.js`,
`vercel.json`, onboarding, queue/cron/recorder logic.
Test plan (acceptance gate — Increment B)
The 10 scenarios become the analyzer's test suite. Ships only if it does NOT
inflate polite/vague language:
Polite but vague → commitment/momentum low, read Polite Openness/Future Deferral
Reserved but committed → commitment/momentum high, Active Pursuit
Friendly but no movement → connection high, opportunity not overstated
Future deferral with real pathway → Deferred with Pathway, not dead
Broken micro-promise → contradiction, momentum down, Stalled
Warm but misaligned → linkage low, opportunity low, "good connection / weak
alignment"
Missing name → attention label "Needs name"
Missing contact path → "Needs contact path"
Strong memory anchor + weak opportunity → memory rich, opportunity low
Strong opportunity + low warmth → opportunity high regardless of warmth
Plus regression: capture double-tap idempotency, queue enqueue/worker, review
round-trip, completeness, linkage — all must stay green.
Deployment order
Run `supabase/intelligence-v2.sql` (Increment A).
Deploy Increment B (prompt + analyzer + persistence) together; verify a real
capture populates `intelligence_json` + mirrored columns and the 10 scenarios
read correctly.
Deploy Increment C (review + Hub display).
Risks & mitigations (carried from the plan)
Analyzer scoring wrong → the 10 scenarios are the gate.
Shape drift breaking readers → dual-shape tolerance.
Token blow-up → scoring in the analyzer, compact LLM emission.
LLM/engine divergence → analyzer wins for scored labels.
Scope creep (CRM/agents/LangFlow) → deferred to MVP2/3.
