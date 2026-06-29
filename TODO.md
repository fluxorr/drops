# Drops implementation checklist

Every checked item is completed in its own focused Git commit. Work proceeds top-to-bottom; later phases stay deliberately unblocked from optional future features.

## Phase 0 — Project foundation

- [x] Add the phased implementation checklist
- [x] Capture the product and visual design system
- [x] Add repository safeguards and environment documentation
- [x] Scaffold the Bun, Next.js, TypeScript, Tailwind, and test toolchain

## Phase 1 — Identity and personal profile

- [ ] Add Clerk authentication and protected application routes
- [ ] Build the first-run learning profile flow
- [ ] Add profile editing with configurable India-time defaults

## Phase 2 — Remote data foundation

- [ ] Define the Turso/Drizzle schema and migrations
- [ ] Add the remote database client and typed repositories
- [ ] Implement profile, interests, settings, lessons, and concepts APIs

## Phase 3 — Learning engine

- [ ] Add the provider-neutral lesson generation contract
- [ ] Add Gemini 3.5 Flash with Gemini 2.5 Pro fallback and Google Search grounding
- [ ] Implement prerequisite-aware topic scoring and deterministic selection
- [ ] Implement fixed-rule knowledge and confidence progression
- [ ] Store immutable Markdown lessons and source citations

## Phase 4 — Delivery

- [ ] Add VAPID configuration and browser push subscription management
- [ ] Add notification permission and subscription UI for Chrome/Arc desktop and Android
- [ ] Add the authenticated daily-generation endpoint
- [ ] Add the configurable IST scheduler and GitHub Actions workflow

## Phase 5 — Reading-first product UI

- [ ] Build the responsive ledger shell and navigation
- [ ] Build the daily lesson journal and immutable lesson reader
- [ ] Build searchable and filterable lesson history
- [ ] Build interests management
- [ ] Build settings and notification controls
- [ ] Build the Sunday weekly reflection
- [ ] Add system light/dark themes, responsive states, and accessibility polish

## Phase 6 — Verification and launch

- [ ] Add basic unit tests for scoring, progression, validation, and provider fallback
- [ ] Run formatting, linting, type checks, tests, and production build
- [ ] Add Vercel, Clerk, Turso, Gemini, VAPID, and GitHub deployment documentation
- [ ] Perform browser QA of the primary desktop and mobile flows

## Deferred to the next version

- Interactive knowledge graph visualization
- Offline lesson caching
- Exports, imports, surprise mode, and spaced review
