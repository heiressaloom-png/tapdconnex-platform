TAPDconnex — Human Reads v2.0 (architecture + dependency map)
> Documentation only. This file describes how Human Reads relate to the
> deterministic engine. It is NOT code and changes no scoring.
Golden rule
```
The Engine scores.   (tapd-intelligence-framework.js — deterministic, test-guarded)
The Reads describe.  (_prompt.js extraction → process-job.js → captures.js)
The Hub displays.    (capture-app.js review card, relationship-hub.html cards)
```
One-way flow, no exceptions:
```
Transcript + gutFeel
      ↓
Engine Scores (signalScore, confidence, momentum, gate, floor)
      ↓
Human Reads (anchor / imprint / opening / intelligence)  ← consume, never compute
      ↓
Relationship Hub (human language only — never raw scores)
```
Human Reads never write back into scoring. If a change would require
editing `tapd-intelligence-framework.js`, stop — it does not belong here.
Engine → Read dependency map
Which engine output each Read translates. The Read phrases the engine's
result; it does not re-derive it.
Engine output (source of truth)	Human Read that phrases it
Commitment Detection (Layer 2)	Intelligence Read → "Interest vs commitment"
Contradiction Detection	Intelligence Read → "What you might miss"
Missing Context / notReadySignals	"Needs you" / "Worth clarifying"
Momentum (Layer 3)	"Worth your energy" / protectEnergy
Prioritisation (score + gate + floor)	"Who to focus on first"
gutFeel Hint (Layer 4)	Display hint + priority fallback only
Two guards (also enforced in `_prompt.js` rules)
READ 4 (Intelligence Read) phrases, it does not re-detect. It must stay
consistent with the `signal`, `relationshipRead.commitmentLevel`, and
`positioning` already produced — translate that judgment into human
language. It must NOT independently re-decide commitment or contradiction,
or it can diverge from the deterministic engine and show the user a
contradiction the engine never sanctioned. The engine decides; the Read
translates.
READ 3 (Opening Read) vulnerability guard. `vulnerabilitySignals` fire
only on explicit, quoted language the person actually said (e.g.
"we're struggling", "we're under pressure"). Never infer an emotional
state. Frame gently as a named challenge ("they named an internal
challenge"), never clinically ("they were vulnerable" / "they trust you").
Current wiring note (important)
Today the deterministic engine is loaded in the browser (`window.TAPD_REF_ENGINE`)
and is not yet fed into the server-side structuring (`process-job.js` /
`process-capture.js`). So at present the LLM produces both the structured
`signal` and the Human Reads, and the guards above are enforced by instructing
the LLM to keep the Reads consistent with the fields it already produced.
The mapping above becomes truly deterministic once `analyze()` is wired into
the server-side pipeline (engine step "1c"): the engine's commitment,
contradiction, momentum, and readiness become the inputs the Intelligence Read
phrases, instead of the LLM re-judging them. Until then: consume-don't-re-detect
is a prompt discipline; after 1c it is an architectural guarantee.
Non-negotiable truth rule
If it wasn't said, it wasn't said. Never invent quotes, personal details,
budgets, timelines, intentions, or emotions. Empty / null is valid and often
the insight itself (no timeline, no owner, no next step = a real finding).
