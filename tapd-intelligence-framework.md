Relationship Intelligence Framework — `intelligence-framework.html`
Version: 1.4 (reference engine `1.4.0-ref`)
What it is: a single, self-contained HTML page that runs the TAPDconnex relationship intelligence engine in your browser — so you can see the anti-inflation guarantees fire, run any conversation through the full pipeline, and verify your committed engine against a known-good reference.
This is not a slideshow of the framework. It is the framework, executable.
---
1. What this page is for
It does three jobs, in this order:
Self-test — every guarantee in the framework asserted live (31 checks). Green means the secret sauce holds; red names exactly which rule broke. This is the console-test kit from the cluster build, made into a panel you re-run after any change instead of typing one-liners.
Playground — pick a template, paste a conversation, toggle Starter/Pro, and watch the whole chain: signals with verbatim quotes → three independent scores → momentum → completeness gaps (fill-now vs ask-next-time) → the owner-voiced draft as it would land in the Hub.
Reference — the three axes, the anti-inflation rules, the card-state 2×2, the ten templates, and the non-negotiables, rendered as a clean source-of-truth doc beneath the working tools.
The hero is deliberately the Gate firing in real time: a warm-but-empty chat held under 49 next to the same warmth plus a real next step lifting above it. It is the single most persuasive thing in the framework, so it leads.
---
2. The honest boundary — read this
The page carries its own faithful reference engine. It does not load your repo's `tapd-intelligence-framework.js`.
This is a deliberate choice, not a shortcut:
The reference engine is built on the committed data contract — the real enum strings (`'Pilot / Beta Opportunity'`, `'Advisory / Mentor'`, etc.), `bandFor`, `resolveCardState`, `CARD_THRESHOLDS`, `SIGNAL_FIELD_REQUIREMENTS`, `FIELD_FILLABILITY` — copied verbatim from the base file.
Its scoring is built on the exact constants from the cluster kit — the 49 gate, the 70 floor, `CATEGORY_BASE_SCORE`, the provenance guard, the keyword cues.
It runs standalone, so the page works today, before the clusters are fully assembled and wired into your repo file.
Use it as your verification oracle. Once your `tapd-intelligence-framework.js` has the scoring/detection/completeness clusters assembled, run the same inputs through both. Where they disagree, that disagreement is the bug — surfaced, not hidden.
The page states this boundary in its own copy so no one mistakes it for the live wiring.
---
3. What's proven (and how)
The engine was verified in Node before any UI was wrapped around it, then the page's inline copy was verified to match the Node engine exactly. Both suites pass clean:
```
The Gate
  ✓ warmth-only stays at 10            (below the 49 cap)
  ✓ gate lifts with Action Intent + Resource → 70
  ✓ pain-only capped at 49             (lots of pain still can't read "hot")

The Floor
  ✓ single indirect quote ≤ 70
  ✓ two contradictions subtract 40

Provenance
  ✓ user-supplied claim about the contact adds zero

Hallucination guard
  ✓ every signal carries a verbatim quote present in transcript
  ✓ draft never leaks the internal score

Pipeline (analyze())
  ✓ returns strength, momentum, completeness %, card state, draft

Enum-drift
  ✓ computeCompleteness runs clean on all 10 templates
    (catches the 'Pilot / Beta Opportunity' string-match risk mechanically)

Card states
  ✓ Starter high strength → ACT
  ✓ Pro high strength / low confidence → PROBE
  ✓ Pro low strength / high confidence → LOG
  ✓ hard blocker → BLOCKED (end to end)
```
The self-test panel re-runs all of these in the browser every time you load or click Run again.
---
4. The value chain it demonstrates
This is the spine you asked to see working end to end:
```
template selected  →  recording  →  (Pro: +5-min window)  →  engine  →  draft in the Hub  →  human reviews & sends
```
Stage	On the page	Layers
Template selected	the Template dropdown	config
Recording → transcript	the transcript box (stands in for record→transcribe)	Gaps 1–2
Engine detects	signals + "signs it's not ready", each with a verbatim quote	L1–L5
Engine scores	three independent axes: strength · confidence · completeness	L6–L7 + completeness
Pro +5-min window	gaps split into FILL NOW vs ASK NEXT TIME, key field ★ first	completeness on L8–L9
Pro +5-min window	a live, eligibility-gated capture flow that re-scores	resurface + capture machine
Momentum	Dormant → … → Opportunity / Blocked	L10
Draft to Hub	owner-voiced draft, score never leaks, human-in-the-loop	draft + L15
The +5-minute window is now fully working on the page, not just described. It runs the real resurface builder and the real capture state machine (`offered → capturing → complete`), with these behaviours verified (16/16 in Node):
Eligible only if you can fill something now. If every remaining gap is contact-side, no window is offered — those carry forward instead.
Key-first ordering. The ★ clock-setting field leads both lists.
The score jump is real. Ticking prompts merges honest answers into the transcript and re-runs the actual engine — completeness climbs because the engine genuinely now detects that context, not because a number was faked.
Fail-safes. Empty capture skips without wasting a re-analysis; a pipeline error preserves the prior score; the 300s timer is a hard cap that merges what was captured rather than discarding it.
Starter is locked out with honest copy explaining gaps carry forward silently.
---
5. What it deliberately does not do
No persistence. It analyses one conversation in memory. L13-summarise, L14 (decay), and L15 (task lifecycle) are storage-dependent and correctly absent — they build with the database, not before it.
No real recording or transcription. You supply the transcript so the engine can be felt on any conversation. The keyword detector is the swappable stub; the real LLM detector slots in behind the same output contract.
No network calls. Fully offline, single file. Safe to open from disk or serve anywhere.
---
6. How to use it
Open `intelligence-framework.html` in any modern browser (or serve it from the repo / Vercel).
The self-test runs on load — confirm it reads all assertions pass.
In the playground, click a preset (Hot opportunity, Warm but empty, Blocked, Contradiction, Partnership) or paste your own transcript.
Toggle Starter ↔ Pro to watch the intelligence widen and narrow.
Read the draft at the bottom — that's what lands in the Relationship Hub for review.
Verifying your committed engine against it
When the clusters are assembled in `tapd-intelligence-framework.js`, run the canonical call in both and compare:
```js
TAPD_INTELLIGENCE.analyze(
  "We keep losing leads, follow-up is manual. We have budget. Send pricing this week.",
  TAPD_INTELLIGENCE.TEMPLATE.OPPORTUNITY,
  { tier: 'pro' }
);
// reference engine returns: score 80 · momentum Opportunity · completeness 57% · card PROBE
```
If your wired engine disagrees, that's the first bug to chase.
---
7. Why the canonical call returns PROBE, not ACT
It's worth understanding, because it's the framework being honest. Strength is 80 (high), but the keyword stub marks the evidence direct-but-not-uniformly-specific, so Pro confidence lands below the 70 line — high interest, not yet high certainty → PROBE (clarify), not ACT (do it). That's the gate-and-floor doing their job: the engine won't tell you to charge in on evidence it isn't sure of. The real LLM detector (Gap 3) sharpens specificity detection and will push genuinely strong, well-evidenced conversations to ACT.
---
8. Design notes
Matches the repo system: Fraunces (display), Manrope (body), JetBrains Mono (data/labels) on the teal-petrol `#1E4F5C` palette with a restrained gold accent.
Responsive to mobile, keyboard-focus visible, reduced-motion respected.
One signature moment — the live gate in the hero — everything else kept quiet around it.
---
9. Where it fits next
The engine is verified. The natural next moves are the body (the eight product gaps), highest-leverage first: recording → transcription (so the engine gets real input), then storage (which unlocks L14/L15 and the Hub). This page is the proof you can build that body on a brain that works.
