TAPDconnex Intelligence Architecture v2.1
> Status: **architecture reference** (Increment A — docs only). No app logic
> changes are described as "done" here; this is the target the code moves toward
> across Increments B and C.
1. What TAPDconnex is (and is not)
Is: a real-time relationship memory + intelligence layer for in-person
interactions — an evidence-to-action system.
Is not: a CRM, a note-taking tool, a meeting assistant, a tone analyser, an
intent detector, or a generic networking scorecard.
The product loop stays: Tap → Connect → Capture → Structure → Follow-up, and
the working loop stays: Capture → Review → Save → Relationship Hub.
2. Governing principle
> People overread words and underread movement.
The system never asks only "did this sound positive?" It asks "what
behavioural evidence exists that something meaningful moved forward?" It
distinguishes: what was felt / said / implied / committed / actually moved /
later happened.
3. The four tiers (parent-child taxonomy)
```
TAPDconnex Intelligence
├── Foundation Intelligence        (evidence — stays close to the transcript)
│   ├── Profile Intelligence
│   ├── Capture Intelligence
│   ├── Context Intelligence
│   ├── Profile Linkage Intelligence
│   └── Completeness Intelligence
├── Derived Intelligence           (interpretation — must trace to evidence)
│   ├── Relationship Intelligence
│   ├── Behavioral Intelligence
│   ├── Opportunity Intelligence
│   ├── Follow-up Intelligence
│   └── Memory Intelligence
├── Executive Intelligence         (plain language — describes, never scores)
│   └── Human Reads
└── Relationship Hub Intelligence  (durable memory + later validation)
    ├── Relationship Hub Record
    ├── Attention Labels
    ├── Relationship Status
    ├── Commitment Ledger
    └── Outcome Ledger
```
4. The golden rule
```
The Engine (analyzer) scores.
The Reads describe.
The Labels guide attention.
The Hub stores relationship memory.
The Outcome Ledger validates later.
```
Hard constraints:
Human Reads must never change scores.
Attention Labels must be deterministic, never freely invented by the LLM.
Warmth must never inflate commitment.
Vague positive language must never become high opportunity readiness.
Never call this intent detection. Never label a person deceptive/fake/
manipulative/ungenuine. Model movement, not motive.
5. Division of labour (data flow)
```
Audio → Transcription → Structured Extraction (LLM emits EVIDENCE)
      → Server-side analyze()  (deterministic: scores + gate + labels + completeness)
      → Human Read generation  (LLM describes; cannot exceed analyzer scores)
      → Review Screen → Save → Relationship Hub
      → Commitment Ledger → Outcome Ledger (MVP2) → Calibration (MVP3)
```
The LLM extracts evidence. The deterministic analyzer scores and gates.
Human Reads describe. Attention Labels are derived deterministically.
6. Evidence hierarchy (highest → lowest reliability)
Follow-through events
Access granted
Named people
Specific dates / processes
Ownership language
Reciprocal effort
Problem relevance
Polite / hedged language
Enthusiasm
Warmth
Warmth and enthusiasm are useful but low-weighted. Specificity, ownership,
access, investment, and follow-through dominate.
7. Scoring model (explainable, weighted)
```
Follow-through 25% · Specificity 20% · Investment 20% · Ownership 15%
Access 10% · Reciprocity 5% · Warmth 5%
```
Scores produced by the analyzer: `relationship_readiness, commitment, momentum, deflection, opportunity_readiness, alignment, completeness, confidence`.
Confidence model: observed events / explicit transcript evidence /
structured commitment with owner+date = high. Contextual inference = medium.
Positive language only, tone only, vibe only = low (never high).
Anti-inflation gates: interest/warmth cannot raise momentum without a state
change; opportunity_readiness is capped by commitment; if commitment is
weak, opportunity readiness cannot be high.
8. Human Reads model
Human Reads turn analyzer output into human language. They consume scores,
never produce them; never contradict the engine; never upgrade weak commitment
into strong interest; never infer motive. User-facing text uses human language,
not raw numbers (see behavioral-intelligence-v1.md §language rules).
9. Relationship Hub model
The Hub stores interpreted relationship memory, not just a transcript:
contact, where met, summary, linked focus/goal, relationship type, behavioral
read, opportunity read, attention labels, missing context, next step, follow-up
message, memory anchors, momentum level, completeness score, status.
Statuses: Draft Ready · Follow-up Suggested · Waiting for Response · Momentum
Building · Future Deferral · Deferred with Pathway · Stalled · Low Priority ·
High Potential · Needs Context · Ready to Send.
10. Commitment Ledger (MVP1: create/store)
Stores promises / stated next steps / expected actions: what was promised, who
owns it, by when, for whom, what proves completion, strength, status
(pending|completed|broken|unclear). MVP1 creates pending commitments; MVP2
updates them from outcomes.
11. Outcome Ledger (MVP1: shape only, no automation)
Validates whether words became behaviour: event_type (message_sent, reply_
received, invite_sent, meeting_booked, introduction_made, no_response, promise_
broken, stalled, advanced, lost), linked_commitment_id, evidence, impact_on_
momentum (upgrade|downgrade|neutral). This is how TAPDconnex becomes more than
summarisation — congruence detection. MVP1 only prepares the data model.
12. MVP boundaries
MVP1: transcription, structured capture, parent-child intelligence JSON,
behavioral read, completeness evaluator, memory anchors, human reads,
deterministic attention labels, follow-up strength matching, Hub save, basic
profile linkage, commitment-ledger creation.
MVP1 excludes: LangFlow, multiple agents, dashboards, complex analytics,
CRM pipeline management, hidden-intent detection.
MVP2: outcome tracking, follow-through events, status changes,
cross-capture prioritisation, longitudinal memory, promise kept/broken.
MVP3: learning loop, calibration from outcomes, coaching, relationship
graph, pipeline intelligence.
13. The moat
Behavioural interpretation grounded in evidence, calibrated by outcomes,
and aligned to the user's goals — not a prettier summary, tone analyser,
CRM, or intent detector.
