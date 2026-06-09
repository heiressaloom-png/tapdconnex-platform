TAPDconnex GitHub Package v1.4
This package contains the current root-level intelligence files for GitHub.
Where to place files
Place these files in the repository root:
```text
tapd-intelligence-framework.js
completeness.js
capture-window.js
summarise-prompt-structure-v14.js
tapd-intelligence-framework.md
mvp2-agent-layer.md
```
Do not place these browser files in `/api`.
`/api` is reserved for future server-side functions such as Whisper transcription and OpenAI summarisation.
Current runtime vs future architecture
Current runtime:
```text
v1.3-compatible browser intelligence
+ Completeness Engine
+ Complete Capture
+ Relationship Hub state helpers
+ Gold-star feedback calibration helpers
```
Master architecture:
```text
v1.4
+ Layer 15 Relationship Progress
+ MVP2 Closure/Digest/Prep agents
+ future LLM detector adapter
+ future scheduled decay/feedback loops
```
Script loading order
Recommended order in HTML pages that need intelligence helpers:
```html
<script src="tapd-intelligence-framework.js"></script>
<script src="completeness.js"></script>
<script src="capture-window.js"></script>
```
`summarise-prompt-structure-v14.js` is a future prompt scaffold and does not need to be loaded into public HTML unless you are testing locally.
Locked product decisions included
```text
LOW PRIORITY is user-facing.
DEPRIORITISE should not appear in the UI.
One swipe creates a learning signal; it does not rewrite intelligence.
Done off-platform removes a card from the main priority view; it does not mean Opportunity.
PROBE is Pro-only and should pull its question from Missing Context / Completeness.
Feedback is optional.
Gold star = intelligence calibration.
Question = “Did we get this right for you?”
```
Template question tagging
The template questions are now encoded with metadata:
```text
discriminating = strong template routing signal
shared = useful context, weak routing signal
blendHinge = deliberate bridge between templates
```
This prevents shared questions like “What would success look like?” from falsely routing or blending templates.
