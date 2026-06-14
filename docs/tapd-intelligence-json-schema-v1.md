TAPDconnex Intelligence JSON Schema v1 (for v2.1 architecture)
> The full object is stored in `captures.intelligence_json`. A few fields are
> mirrored to columns for Hub filtering. Backward compatibility with v1/v1.5 is
> preserved: readers must tolerate **both** shapes for one release.
1. Top-level shape (target)
```json
{
  "capture_intelligence": {},
  "profile_linkage_intelligence": {},
  "relationship_intelligence": {},
  "behavioral_intelligence": {},
  "opportunity_intelligence": {},
  "context_intelligence": {},
  "follow_up_intelligence": {},
  "memory_intelligence": {},
  "completeness_intelligence": {},
  "human_reads": {},
  "relationship_hub_record": {},
  "commitment_ledger": [],
  "outcome_ledger": []
}
```
(`profile_intelligence` is the user's onboarding context fed in as prompt
input; it is not re-emitted per capture.)
2. Section field reference (key fields)
capture_intelligence — `transcript, where_met, event, area, person{name,company,role,name_confidence}, what_was_discussed, raw_next_step_language, exact_quotes[], facts_named[]`. Evidence only; no big
conclusions.
profile_linkage_intelligence (v2.1) — `linked_networking_goal, linked_current_focus, linked_problem_solved, linked_way_to_work_together, alignment_strength (high|medium|low|unknown), alignment_reason, alignment_gap`.
relationship_intelligence — `relationship_type, relationship_value, relationship_readiness (ready|forming|possibility|weak|stalled), warmth_level, relationship_direction (moving_toward|stable|unclear|moving_away), priority, risk`. Warmth must not auto-create opportunity readiness.
behavioral_intelligence — signal families `connection, curiosity, interest, intention, commitment, momentum, specificity, vagueness, hesitation, avoidance, deflection, reciprocity, ownership, access, investment, contradiction`, plus
`scores{connection,curiosity,interest,intention,commitment,momentum,deflection, confidence}` and `behavioral_read`. Scores are advisory from the LLM; the
analyzer recomputes the authoritative gated scores.
opportunity_intelligence — `opportunity_type, opportunity_strength, opportunity_readiness (active|forming|future|weak|none), buying_intent, hiring_intent, partnership_potential, referral_potential, funding_or_sponsorship_potential, audience_access, distribution_potential, community_access, blockers[], why_not_higher`. Constrained by commitment.
context_intelligence — `decision_maker, next_step_owner, timeline, budget_or_resource_context, need_or_problem, success_criteria, preferred_channel, missing_context[]`.
follow_up_intelligence — `recommended_next_step, follow_up_timing, channel, message_to_contact, self_follow_up, follow_through_status, tone_guidance, overstatement_warning`. Must match signal strength; never overstate.
memory_intelligence — `exact_quotes[], specifics_named[], personal_hooks[], distinctive_details[], what_they_cared_about, what_user_offered[], open_threads[], what_stayed_with_me`. Never invent; empty is acceptable.
completeness_intelligence (v2.1) — `overall_score (0-100), status (ready|needs_context|thin|blocked), score_breakdown{capture,relationship, behavioral,opportunity,context,follow_up,memory}, what_is_complete[], what_is_missing[], why_score_is_not_higher, recommended_next_capture_question`.
human_reads (v2.1 flat) — `what_mattered, what_stayed_with_me, how_open_they_were, what_you_might_miss, needs_you, best_next_move, why_follow_up, safe_to_send`.
relationship_hub_record — see architecture §9.
commitment_ledger[] — `commitment_id, commitment_text, owner (user|contact|both|unknown), owned_by_name, due_date_or_timing, recipient_or_destination, purpose, evidence_required_for_completion, commitment_strength (high|medium|low), status (pending|completed|broken|unclear)`.
outcome_ledger[] (shape only, MVP2) — `outcome_id, linked_commitment_id, event_type, event_date, evidence, impact_on_momentum (upgrade|downgrade|neutral), notes`.
3. Required vs optional (MVP1)
Required to populate: capture_intelligence, completeness_intelligence,
human_reads, behavioral_intelligence (families + behavioral_read),
relationship_intelligence, follow_up_intelligence, memory_intelligence,
profile_linkage_intelligence, relationship_hub_record.
Required but may be empty arrays: commitment_ledger (often `[]`).
Optional / prepared: outcome_ledger (`[]` in MVP1).
Empty/null is valid everywhere — an honest gap is a finding, not a failure.
4. Backward-compatibility mapping (read tolerantly: v2.1 → else legacy)
Concept	v2.1 path	Legacy fallback (v1/v1.5)
Completeness score	`completeness_intelligence.overall_score`	`completeness` (column), `ai.completeness.score`
Completeness status	`completeness_intelligence.status` (ready/needs_context/thin/blocked)	derived from score band (low/partial/usable/strong)
Profile linkage focus	`profile_linkage_intelligence.linked_current_focus`	`profile_linkage_intelligence.linked_focus_area`
Linkage strength	`alignment_strength`	`linkage_type` (direct/indirect/weak/none)
Hub chip	`relationship_hub_record` / derived label	`recommended_hub_label`, `linkage_label`
Human read summary	`human_reads.what_mattered` (+ best_next_move)	`humanReads.intelligenceRead`, `relationshipRead.summary`
Memory anchors	`memory_intelligence.specifics_named/personal_hooks`	`memoryAnchors[]`
Safe to send	`human_reads.safe_to_send`	`safeToSend.status`
Readers MUST check the v2.1 path first, then fall back. New writers populate the
v2.1 paths; legacy fields remain populated for one release (parallel-now,
consolidate-next).
5. Column mirroring (set by the analyzer in Increment B/C)
Column	Source
`intelligence_json` (jsonb)	the whole object
`completeness` (int)	`completeness_intelligence.overall_score`
`momentum_level` (text)	analyzer momentum / `relationship_hub_record.momentum_level`
`behavioral_read` (text)	`behavioral_intelligence.behavioral_read`
`opportunity_readiness` (text)	`opportunity_intelligence.opportunity_readiness`
`relationship_priority` (text)	`relationship_intelligence.priority`
`attention_labels` (jsonb)	deterministic labels
`safe_to_send` (bool)	analyzer-gated `human_reads.safe_to_send`
`human_read_summary` (text)	`human_reads.what_mattered`
`commitment_ledger` (jsonb)	`commitment_ledger`
`outcome_ledger` (jsonb)	`outcome_ledger` (empty in MVP1)
next step	existing `action` / `next_steps`
6. UI field mapping
Review screen: Human Read · Completeness (score+status+why) · Behavioral
Read · Attention Labels · Missing Context · Best Next Move · Safe Follow-up.
Relationship Hub card: name/company/role · behavioral read · attention
label chips · linked focus/goal · completeness · momentum · status · reason.
