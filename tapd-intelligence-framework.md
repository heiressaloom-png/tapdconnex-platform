TAPDconnex Relationship Intelligence Framework
Version: v1.4 architecture / v1.3 runtime-compatible package  
Product principle: TAPDconnex observes and informs. It does not force outcomes.
---
1. Product Positioning
TAPDconnex is not a CRM, digital business card, task manager, or generic meeting assistant.
TAPDconnex is a Real-Time Relationship Memory Layer that captures what was actually said, structures the relationship context, and helps the user decide what deserves attention next.
The product evolves in three stages:
```text
MVP1: Relationship Memory + Intelligence + Completeness
MVP2: Closure Agent + Digest Agent + Prep Agent
MVP3: Learning Agent + automatic closure detection + performance layer
```
---
2. Core Trust Rules
```text
No quote = no signal.
Missing information is not negative evidence.
Questions sharpen intelligence but do not inflate score.
Profile awareness re-ranks; it does not re-score.
Done off-platform does not equal Opportunity.
One swipe creates a learning signal; it does not rewrite intelligence.
TAPDconnex observes and informs; the human still acts.
```
These rules protect the framework from overconfident automation.
---
3. Framework Layers
Layer 1 — Universal Signal Detection
Detects universal relationship signals across the whole transcript:
Pain
Urgency
Authority
Resource
Action Intent
Relationship Warmth
Every signal must carry verbatim evidence.
Layer 2 — Template-Specific Detection
Detects signals aligned to the selected template.
Template questions are optional. They improve attribution and confidence but are never required.
Layer 2.5 — Template Blend Detection
Detects when a conversation starts moving into another template.
The primary template is never auto-switched. A secondary template is advisory only.
Layer 3 — Negative Signals
Detects explicit negatives only:
No Priority
No Budget
No Authority
No Need
Timing Not Now
Polite Interest Only
Absence of a positive signal is not a negative signal.
Layer 4 — Contradiction Detection
Contradictions surface tension between positive and negative evidence.
Contradictions lower confidence. They do not cancel signals and do not automatically lower signal strength.
Layer 5 — Signal Status
Statuses:
Detected
Weak
Blocked
Contradicted
No Signal
Refinement: a soft contradiction should usually create PROBE rather than BLOCKED. Hard blockers create BLOCKED.
Layer 6 — Signal Strength
Signal strength answers:
```text
How strong is the evidence for this signal?
```
The Gating Rule prevents inflation. Without a qualifying signal, score is capped at 49.
Layer 7 — Confidence
Confidence answers:
```text
How sure are we that the interpretation is correct?
```
Strength and confidence are independent. They are never averaged.
Layer 8 — Missing Context
Detects what is missing but needed to act:
Decision maker
Budget owner
Timeline
Success criteria
Preferred channel
Implementation owner
Layer 8 suggests recovery questions. It never forces the user to ask them.
Layer 9 — Missing Next Steps
Validates the four components of an actionable next step:
Owner
Action
Date
Channel
Missing components remain missing. TAPDconnex asks; it does not assume.
Layer 10 — Momentum Detection
Momentum answers:
```text
Is this relationship moving?
```
Momentum uses signal score, action intent, next-step completeness, task lifecycle, hard blockers, and positive response evidence.
Layer 11 — Signal Attribution
Attribution is best-fit, never proof of origin.
Signals may appear anywhere in a transcript and should not be forced into a template home.
Layer 12 — Profile Awareness
Profile awareness can add priority and framing.
It must never alter:
Signal Score
Confidence
Momentum
Evidence
Contradictions
Task State
Layer 13 — Human Feedback Loop
Captures optional user feedback and outcomes over time.
Feedback is a learning signal, not a score override.
Layer 14 — Score Decay / Staleness
Future scheduled pass.
Decay should pause while a relationship has an open task within its date window. A relationship awaiting a committed action is not stale.
Layer 15 — Relationship Progress / Task Lifecycle
Future architecture for tracking whether agreed follow-ups were handled.
States:
Open
Done
Slipped / At Risk
Abandoned
Done does not mean Opportunity. Opportunity needs positive response evidence or later progress.
---
4. Strength × Confidence Matrix
```text
Signal Strength = How strong is the evidence?       (the what)
Confidence      = How sure is the interpretation?   (the how sure)
```
	Low Confidence	High Confidence
High Strength	PROBE	ACT
Low Strength	LOW PRIORITY	LOG
User-facing card states:
ACT
PROBE
LOG
LOW PRIORITY
BLOCKED
AT RISK
Internal word `DEPRIORITISE` should not be used in the UI. Use LOW PRIORITY.
---
5. Hub Decisions
Confirmed Hub behaviour:
```text
Swipe left = Move to Low Priority
Archive / Let go = secondary option
Keep on radar default = 14 days
Done off-platform = remove from main priority view
Low Priority = hidden behind filter
Feedback hook = matte-gold star + “Did we get this right for you?”
```
Done off-platform means the user removed it from their plate. It does not mean the relationship became an Opportunity.
If a high-signal item slips, show:
```text
Is this still a priority for you?

[Keep on radar]
[Snooze]
[Mark done off-platform]
[Move to Low Priority]
[Let go]
```
---
6. Gold-Star Feedback Calibration
Feedback is optional.
```text
Gold star = intelligence calibration
Question = “Did we get this right for you?”
Purpose = help TAPDconnex learn what matters to this user
Never block the user
Never make it feel like a rating survey
```
If the user taps Not quite, show:
```text
What felt off?

[Wrong priority]
[Missing context]
[Not an opportunity]
[Already handled]
[Wrong next step]
[Other]
```
Learning rules:
```text
One swipe should not rewrite the intelligence.
One swipe creates a learning signal.
Repeated patterns shape future recommendations.
Transcript evidence remains untouched.
```
---
7. Loading Intelligence Messages
Use these while analysis is running:
```text
Finding what was actually said...
Checking what needs your attention...
Separating strong signals from polite interest...
Looking for missing next-step details...
Preparing your relationship memory...
```
These make wait time feel intentional and reinforce trust.
---
8. Guided vs Unguided Mode
The cheat sheet is an accelerant, not a prerequisite.
Guided conversations may improve:
Template attribution
Confidence interpretation
Recovery wording
They must never directly increase:
Raw signal score
Momentum
Opportunity status
Unguided conversations must not be punished.
---
9. Template Question Metadata
Each question is tagged as:
`discriminating` — strong signal for this template
`shared` — useful context but weak for routing
`blendHinge` — shared question that intentionally bridges templates
Shared questions help completeness and context. They should not strongly route a template.
Blend-hinge example:
```text
Would you be open to testing something new?
Product Discovery → Pilot/Beta
```
---
10. Current Implementation Files
Current root-compatible files:
```text
tapd-intelligence-framework.js
completeness.js
capture-window.js
summarise-prompt-structure-v14.js
mvp2-agent-layer.md
```
Future HTML updates:
```text
relationship-hub.html
capture.html
templates.html
```
---
11. Public-Facing Guidance
Do not expose scoring weights, thresholds, contradiction penalties, detector prompts, or full internal agent mechanics.
Use benefit-led language:
```text
TAPDconnex helps you remember who matters, what was discussed, what is missing, and what to do next.
```
