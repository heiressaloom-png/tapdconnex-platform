# TAPDconnex MVP1

## What Is TAPDconnex?

TAPDconnex is a relationship intelligence and networking productivity platform.

The goal is to help professionals capture valuable conversations, preserve relationship context, and generate meaningful follow-up actions before the opportunity is forgotten.

The product focuses on:

* Conversation capture
* Relationship context
* AI-assisted follow-up
* Relationship intelligence
* Networking productivity

The product is NOT:

* A CRM
* A sales pipeline
* A task manager
* A reminder system
* An analytics dashboard

---

# Core User Journey

The user should be able to:

1. Complete onboarding.
2. Configure Owner Style.
3. Select a networking template.
4. Capture a conversation.
5. Generate an AI-structured draft.
6. Review and edit the draft.
7. Send through WhatsApp.
8. View the relationship in the Relationship Hub.
9. Mark the relationship as Moved Forward or Let Go.

---

# Product Philosophy

The product is built around four questions:

1. What value emerged from this interaction?
2. What relationship deserves my attention?
3. What should happen next?
4. What should not be forgotten?

The goal is not to collect contacts.

The goal is to preserve relationship value.

---

# Current Source Of Truth

The current source of truth is:

* Sections 2 & 3 Capture Pipeline
* Section 5 Relationship Hub
* tapd-master-ai-prompt.md
* Current HTML files
* MVP1 Build Package

If older documents conflict with newer specifications:

THE NEWER SPECIFICATION WINS.

The following documents are considered historical context only:

* V1 PRD (Builder Locked)
* Investor PRD

---

# Current MVP1 File Structure

```text
index.html
landing.html
onboarding.html
templates.html
capture.html
relationship-hub.html
tapd-master-ai-prompt.md
README.md
```

---

# File Responsibilities

## landing.html

Public TAPDconnex profile.

Purpose:

* Identity
* Positioning
* Trust
* Contact pathways

---

## onboarding.html

Collects:

* User profile
* Owner Style
* Networking intent
* Preferred communication channels
* Plan selection

---

## templates.html

Template management.

Starter:

* Edit 1 template

Pro:

* Edit all templates

Templates contain:

* Questions to ask
* Signals to listen for
* What to offer
* Outcome categories

---

## capture.html

Conversation capture experience.

Flow:

Template
↓
Record
↓
Transcribe
↓
AI Structure
↓
Draft
↓
Save

---

## relationship-hub.html

Relationship Intelligence layer.

Purpose:

* Surface relationship value
* Show meaningful opportunities
* Present next best actions
* Preserve relationship context

The Hub must never become a CRM or task board.

---

## tapd-master-ai-prompt.md

Relationship Intelligence engine.

Responsible for:

* Signal detection
* Draft generation
* Missing information detection
* Relationship classification
* Owner Style application

---

# Relationship Hub Principles

The Hub answers:

* What value emerged?
* What relationship deserves my energy?
* What should happen next?
* What should not be forgotten?

The Hub does NOT answer:

* How many contacts do I have?
* What stage is this lead in?
* What tasks are overdue?

---

# Current MVP Scope

Included:

* Owner Style
* Templates
* Capture
* AI Structuring
* Draft Review
* WhatsApp Follow-Up
* Relationship Hub
* Moved Forward
* Let Go

Excluded:

* CRM
* Pipeline Management
* Task Management
* Analytics
* Dashboards
* Calendar Integration
* Reminder Systems
* Relationship Scoring UI
* Advanced NFC Relationship Graphs

---

# Build Order

1. templates.html
2. onboarding.html
3. capture.html
4. relationship-hub.html
5. tapd-master-ai-prompt.md
6. index.html cleanup
7. OpenAI integration
8. Supabase integration
9. Payment and Pro gating

---

# MVP Completion Criteria

The MVP is complete when a user can:

1. Complete onboarding.
2. Configure Owner Style.
3. Select a template.
4. Capture a real conversation.
5. Receive an AI-generated draft.
6. Edit the draft.
7. Send through WhatsApp.
8. View the relationship in the Hub.
9. Return later and see saved data.
10. Mark the relationship as Moved Forward or Let Go.

No CRM is required.

No dashboards are required.

No analytics are required.

The product succeeds when a user leaves a conversation and the follow-up is already handled.
