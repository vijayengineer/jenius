# Build Week implementation log

This log is factual and should be updated only after a capability is working and checked.

## Imported baseline

- Preserved the Lovable mobile feed, navigation, typography, design tokens, sheets, media slot,
  Saved/Create/Me views, and `/dev` state catalogue.
- Confirmed `main` tracks canonical `origin/main`; `design` remains a reference remote.
- Smoke-tested `/`, `/saved`, `/create`, `/me`, and `/dev` with HTTP 200 responses.
- Baseline TypeScript and production build passed.
- Baseline lint failed with 212 issues, overwhelmingly formatting drift. No test runner existed.
- Baseline data, saves, progress, Create generation, and connectivity were mocks/in-memory. No
  service worker or persistence existed.

## Implementation checklist

- [x] Audit repository, remotes, routes, components, styles, data, and baseline checks.
- [x] Record architecture, design constraints, content rules, and Build Week scope.
- [x] Add strict content schemas and validate all ten bundled concepts.
- [x] Add content validation/report scripts and tests.
- [x] Add deterministic learning reducer and end-to-end domain flow.
- [x] Add versioned IndexedDB repository and application provider.
- [x] Connect Feed, Saved, Create, and Me to real local state.
- [x] Add manifest, icons, service worker, and offline fallback.
- [x] Pass validation, report, tests, typecheck, lint, and build.
- [x] Review the live application for obvious mobile and accessibility regressions.

### Session 2A — secure optional AI backend

- [x] Re-audit instructions, architecture, content, learning state, IndexedDB, Create, PWA, branch,
      remotes, and baseline quality gates.
- [x] Scaffold the standalone Fastify TypeScript service and safe health endpoint.
- [x] Add server-only Firestore repositories, request fingerprints, and usage limits.
- [x] Add structured alternative-explanation generation and reusable caching.
- [x] Add structured personal-concept generation with one repair attempt.
- [x] Connect one typed, timeout-aware frontend API layer.
- [x] Preserve deterministic lessons when explaining fails or the browser is offline.
- [x] Persist validated generated concepts and pending retries in IndexedDB.
- [x] Add backend, frontend, and offline integration coverage.
- [x] Document Firebase, Ubuntu, Nginx, HTTPS, Vercel, mobile testing, and rollback.
- [x] Run the complete verification and credential audit, commit logical phases, and leave the
      branch clean without pushing.

## Implemented

- Zod validates the ten-concept catalogue and rejects duplicate IDs, malformed questions, missing
  misconception references/retries/facts/text, and remote media URLs.
- Content reporting confirms 10 concepts, 20 questions, 30 misconception branches, 100%
  wrong-answer coverage, and the five requested animation-ready concepts.
- A pure reducer covers viewing, answering, teacher feedback, misconception, retry, retry
  feedback, Mind Blown, and completion states. Completion XP is idempotent.
- IndexedDB persists completion, saves, attempts, misconception/retry history, XP, 0–5
  understanding, recent activity, review scheduling, and local topic requests behind one
  repository.
- Saved supports both existing collections. Create records a validated local request without
  claiming remote generation. Me derives XP, completion, understanding, subject distribution,
  activity, and retry/misconception statistics from learner state.
- The manifest, same-origin service worker, app icon, cached shell/static assets, and navigation
  fallback make bundled lessons available after an initial load.
- The complete quality gate passed with 19 tests across four files. Lint has no errors; 11
  pre-existing Fast Refresh advisory warnings remain for mixed-export component modules.
- Post-build development smoke tests returned HTTP 200 for all five routes and every PWA asset.
  Source review confirmed retained safe-area layout, keyboard/radio semantics, visible focus
  treatment, reduced-motion rules, optional media collapse, and explicit non-swipe controls.
- Final repository audit removed dormant prototype fallbacks and stale mock naming, verified that
  production Feed/Saved/Create/Me paths use real local state, scanned the current tree and Git
  history for common secret signatures, and confirmed that bundled lessons require no application
  environment variables.

## Session 2A implemented

- Added an optional standalone Fastify service that binds to loopback and exposes only health,
  explanation, and generation routes. It includes an exact CORS allowlist, security headers,
  body/request limits, request IDs, redacted minimal logs, safe errors, proxy configuration, and
  clean shutdown.
- The official OpenAI Node SDK requests strict JSON-schema output from a configurable model.
  Versioned server-owned prompts keep verified catalogue copy authoritative for alternative
  explanations. Model output never replaces the deterministic lesson.
- Personal generation validates the complete lesson, including one four-option primary question,
  three misconception feedback paths, one retry question, and one Mind Blown fact. A malformed
  response gets one repair attempt and is otherwise rejected without partial success.
- Firebase Admin is server-only. Firestore uses exactly `explanation_cache`, `generated_concepts`,
  and `usage_limits`. Explanation cache keys include content/style/context, prompt version, and
  model. Daily counters use salted one-way request fingerprints and transactions.
- One browser API abstraction validates both directions, times out with `AbortController`, detects
  offline/configuration failures, and categorises safe errors. No API credential enters frontend
  code.
- Explain another way adds a mobile style selector and non-blocking coach card. Failure leaves the
  verified card and all learning controls unchanged.
- Create queues requests before making a network call. Validated lessons persist in IndexedDB,
  appear under Personal lessons, carry the `AI-generated` label, and open through the existing
  challenge preview adapter. Failed requests remain stored for retry; no fake success is shown.
- Nitro now emits Vercel Build Output API artifacts, while Ubuntu/systemd/Nginx deployment
  examples keep the backend on `127.0.0.1:301`.
- Automated non-live coverage now has 26 frontend/domain tests and 20 backend tests. OpenAI and
  Firestore are mocked through injected interfaces; no live credential test was run.

## Demo outline

1. Open the mixed-subject feed and show that media-free lessons remain complete.
2. Pick a plausible wrong answer and highlight diagnosis of the specific misconception.
3. Retry with a reframed question, reveal the Mind Blown fact, and complete the lesson.
4. Refresh/offline: show retained completion, XP, saved content, and bundled lessons.
5. Open Saved and Me to show statistics derived from local activity.
6. Request a new explanation style and show the original verified lesson remains visible.
7. Generate a personal topic, show its AI-generated label and primary challenge, then reload to
   show local persistence.
8. Stop the backend or go offline and repeat a bundled lesson to demonstrate graceful fallback.

## Honest limitations

There is no authentication, cross-device sync, identity-grade rate limiting, automated
educational verification of generated drafts, production media, or personalised recommendation
system. AI-generated concepts remain separate from verified XP progression. This repository has
not been deployed and no live OpenAI or Firestore credential test has been performed.
