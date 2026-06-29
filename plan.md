# PLAN.md

# Drops— AI-Powered Personal Learning Companion

**Owner:** You
**Status:** v2 (Implementation Ready)
**Target:** Generate with Codex, manually refine UI

---

# 1. Vision

Build a personal learning system that sends curated daily lessons through browser push notifications.

Instead of simply generating random topics, the system continuously models the user's knowledge, understands prerequisites, tracks concepts already learned, and chooses the next lesson intelligently.

The product should feel like a personal learning journal rather than another productivity dashboard.

---

# 2. Goals

* Daily browser push notifications (1–N lessons/day)
* AI-generated lessons tailored to current knowledge
* Google-grounded sources whenever available
* Automatic knowledge tracking
* Adaptive learning progression
* Interest queue
* Personal learning history
* Zero-cost (or near-zero) personal deployment
* Single-user only

---

# 3. Non-goals

* No mobile application
* No email
* No WhatsApp/Telegram
* No flashcards
* No quizzes
* No social features
* No SaaS-style analytics dashboard

---

# 4. Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* shadcn/ui

## Backend

* Next.js API Routes

## Database

* Turso (SQLite)

## Scheduler

* GitHub Actions Cron

## Notifications

* Web Push
* VAPID Keys

## AI

Primary:

* Gemini Flash

Fallback:

* Gemini Pro

Generation uses:

* Google Search Grounding

The application should abstract the LLM provider behind a single interface.

```ts
generateLesson(context)
```

No business logic should depend directly on Gemini APIs.

---

# 5. High-Level Architecture

```
GitHub Actions

        │

        ▼

Learning Engine

        │

 ┌───────────────┐
 │ Load Profile  │
 ├───────────────┤
 │ Knowledge Map │
 ├───────────────┤
 │ Interests     │
 ├───────────────┤
 │ Lesson History│
 └───────────────┘

        │

Choose Next Topic

        │

Gemini Flash

        │
(auto fallback)

Gemini Pro

        │

Google Search Grounding

        │

Store Lesson

Update Concepts

Update Knowledge

        │

Push Notification
```

---

# 6. Core Learning Engine

The application—not Gemini—decides **what** should be learned.

Gemini decides **how to teach it.**

Recommendation score combines:

* Interest weight
* Knowledge gaps
* Missing prerequisites
* Difficulty progression
* Recently learned topics
* Unfinished lessons
* Small randomness (avoid repetitive paths)

The highest scoring topic is sent to Gemini.

---

# 7. Knowledge Model

Instead of tracking only lessons, maintain a lightweight knowledge graph.

Every lesson teaches one or more concepts.

Example

```
Rust

├── Ownership
├── Lifetimes
├── Traits
├── Async
│      ├── Tokio
│      └── Futures
└── Unsafe
```

Each concept stores

* Knowledge Score (0–100)
* Confidence Score (0–100)
* Last Updated
* Prerequisites

Knowledge increases when lessons are completed.

Confidence increases more slowly based on continued engagement.

---

# 8. Automatic Skill Tracking

The user can manually edit knowledge if desired.

Otherwise Gemini updates scores automatically.

Example

```
Knowledge

Rust

82

↓

Finish Async lesson

↓

87
```

No more beginner/intermediate/advanced categories.

Continuous scoring allows smoother progression.

---

# 9. Prerequisite System

Before recommending a lesson, verify prerequisites.

Example

```
Raft

requires

Consensus

requires

Distributed Systems Basics
```

If prerequisites are missing, recommend those first.

---

# 10. Interests

Users may add interests with optional weights.

Example

```
Rust

100%

Distributed Systems

80%

Compilers

40%

Graphics

20%
```

Interests gradually decay once exhausted unless pinned.

---

# 11. Lesson Generation

Gemini receives:

* Current knowledge
* Active interests
* Existing concepts
* Lesson history
* Desired difficulty
* Missing prerequisites

Gemini returns:

```text
Title

Why this matters

5–8 minute explanation

Key Concepts

Suggested Next Concepts

Sources
```

Lessons should stay concise to minimize token usage.

Avoid overly long essays.

---

# 12. Source Collection

Google Search Grounding should retrieve multiple high-quality references.

Preferred order

1. Official documentation
2. Specifications / RFCs
3. Research papers
4. Engineering blogs
5. High-quality technical blogs
6. Hacker News discussions
7. GitHub repositories
8. Videos (optional)

Display them similarly to Hacker News—a compact list rather than large cards.

Never force a source if grounding cannot find a good one.

---

# 13. Notification

Example

```
Today's Lesson

Understanding io_uring

5 minute read
```

Opening notification loads the lesson page.

---

# 14. Why This Lesson?

Each lesson begins with one sentence.

Example

> You recently completed Async Rust. Today's lesson builds on that by introducing Tokio's runtime architecture.

This improves transparency and trust.

---

# 15. Weekly Reflection

Once per week generate a lightweight summary.

Example

```
This Week

✓ 7 lessons completed

Top topics

Rust
Networking
Operating Systems

New Concepts

18

Suggested next focus

Compilers
```

No gamification.

No achievements.

No badges.

---

# 16. Database

Core tables

```
profile
concepts
concept_relationships
lessons
lesson_concepts
interests
push_subscriptions
settings
```

Additional relationship table

```
Concept A

depends_on

Concept B
```

This powers prerequisite checking.

---

# 17. API

```
POST /api/send-daily

GET /api/lessons

PATCH /api/lessons/:id

GET/PUT /api/profile

GET/POST/DELETE /api/interests

GET/PUT /api/settings

POST /api/push/subscribe

GET /api/knowledge

GET /api/concepts
```

---

# 18. UI Philosophy

The interface should resemble a personal learning ledger.

Not a dashboard.

Not Notion.

Not Linear.

Not Duolingo.

Reading is the primary activity.

Lessons are displayed as dated journal entries.

Typography and whitespace take priority over widgets.

---

# 19. Main Screen

```
Daily Learning

──────────────

✓ ✓ ✓ · ✓ ✓

──────────────

2026-06-29

Understanding io_uring

Why this matters...

5 minute lesson

Sources

• kernel docs

• LWN

• HN discussion

□ Done
```

---

# 20. Secondary Pages

## Knowledge

Interactive graph showing learned concepts and future branches.

---

## Interests

Manage learning priorities.

---

## Settings

* Notification time
* Lessons/day
* Enable Push
* Theme

---

## History

All previous lessons.

Searchable.

Filterable.

---

# 21. Milestones

## Phase 1

* Project scaffold
* Turso
* Push notifications

---

## Phase 2

* Gemini integration
* Google Search Grounding
* Lesson generation

---

## Phase 3

* Knowledge graph
* Recommendation engine
* Automatic skill updates

---

## Phase 4

* Beautiful ledger UI
* Weekly reflection
* History
* Knowledge visualization

---

# 22. Future Ideas (Post-v1)

* Interactive knowledge map
* Export learning history
* AI-generated learning paths
* "Surprise Me" mode
* Offline lesson caching
* Import bookmarks or reading lists
* Optional spaced review of skipped lessons

---

# 23. Design Principles

* Reading-first experience
* Minimal interactions
* Quiet interface
* No unnecessary animations
* No productivity theater
* AI should feel like a thoughtful mentor, not a chatbot
* Every recommendation should have a clear reason
* Keep prompts compact and deterministic to reduce token usage and improve consistency
* Favor structured outputs over free-form text wherever possible

---

# 24. Success Criteria

The project is successful when:

* Daily lessons consistently build upon previous knowledge.
* Recommendations feel intentional rather than random.
* The user rarely needs to manually manage their profile.
* Lessons remain concise but valuable.
* Sources are trustworthy and easy to scan.
* The interface encourages daily reading without feeling gamified.
* The entire application can be generated and iterated on effectively using Codex with minimal manual coding beyond UI refinement.
