TAPDconnex MVP 2 Agent Layer
Principle: Agents make intelligence actionable. The human remains the actor.
MVP 2 agents read framework outputs and suggest what the user may want to do next. They do not contact anyone, force a state, or act autonomously on behalf of the user.
---
Recommended MVP 2 Agents
1. Closure Agent
Purpose: Close the outside-platform follow-up gap.
Reads:
Open tasks / next steps
Hub card state
Due dates
User actions
Does:
Prompts user when a next step reaches its date
Lets user mark Done off-platform, Snooze, Keep on radar, Move to Low Priority, or Let go
Feeds optional feedback into the learning layer
Does not:
Send emails
Message contacts
Change opportunity status without positive response evidence
MVP 2 starts with prompted closure only. Calendar/email/CRM detection is later Pro/future architecture.
---
2. Digest Agent
Purpose: Create a daily habit.
Reads:
ACT cards
PROBE cards
At Risk / slipped items
Low Priority filter
Done off-platform events
Produces:
```text
Today:
3 relationships to act on
2 to clarify
1 needs attention
```
Does not:
Change states by itself
Contact anyone
Force a task workflow
---
3. Prep Agent
Purpose: Prepare the user before a known follow-up or meeting.
Reads:
Previous capture summary
Last momentum
Missing context
Open tasks
Unanswered template questions
Relationship Hub state
Produces:
```text
Last time:
Pilot interest detected.
Budget owner missing.
Timeline unclear.
Ask: “What would success look like for your team?”
```
Does not:
Auto-join meetings
Auto-message contacts
Decide the outcome
---
Future Agents
Blend / Routing Agent
Suggests when a relationship appears to be moving into another template.
Example:
```text
This is starting to look like a Strategic Partnership. Switch template next time?
```
Suggestion only.
Adoption Coach Agent
Uses guided/unguided adoption metrics to encourage template prompt use once there is enough data.
Example:
```text
Guided conversations are helping you close more loops.
```
Staleness / Revive Agent
Surfaces relationships approaching long-term inactivity and suggests a light re-touch.
Learning Agent
Consumes feedback and outcomes over time to improve recommendations and calibration.
Requires enough data before activation.
---
Locked Agent Rule
```text
Every MVP 2 agent reads framework output and suggests to the user.
None of them write to a contact or force a relationship state.
```
The agents help the user act. The user remains in control.
