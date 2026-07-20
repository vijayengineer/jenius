# Jenius

Jenius is an offline-first, mobile-first learning app described as “TikTok for
understanding.” A mixed-subject vertical feed turns curiosity into a compact learning loop:
hook, explanation, four-option challenge, misconception-aware feedback, retry, a memorable
Mind Blown fact, and progression to the next idea.

The application preserves the original Lovable design system: a calm dark palette, Space
Grotesk and Manrope typography, blue-to-violet gradients, glass surfaces, large radii,
mobile-safe spacing, and accessible bottom-sheet interactions.

## Initial content

The bundled release contains exactly ten locally verified concepts across Geography, Earth
Science, Physics, and Biology. Seasons, volcanoes, planes, falling objects, and DNA are marked
animation-ready; media remains optional and no remote media is loaded.

## User flow

1. Browse a mixed-subject feed by swiping, scrolling, keyboard, or explicit controls.
2. Open a concept challenge and select one of four answers.
3. Receive a concise explanation or feedback matched to the selected misconception.
4. Try a different question, reveal the Mind Blown fact, and complete the concept.
5. Save useful ideas and review real on-device progress in Saved and Me.
6. Optionally ask the server-side coach for another explanation without replacing the verified
   lesson.
7. Generate a personal lesson in Create, validate it, save it on-device, and keep failed requests
   available for retry.

## Architecture

TanStack Start and React render the existing Lovable interface. Zod validates bundled content and
all optional API responses. A pure reducer owns the verified learning flow. A small versioned
IndexedDB repository owns progress, saves, attempts, topic requests, generated concepts, and
review scheduling; React components access it through one application provider. The bundled
catalogue and app shell are available offline through a narrowly scoped service worker.

The standalone Fastify service under `server/` owns OpenAI and the official
`@google-cloud/firestore` Node client. It exposes only
`GET /health`, `POST /api/explain`, and `POST /api/generate`. Firestore caches validated
explanations, stores validated generated concepts, and applies lightweight salted daily usage
limits. No Firestore or OpenAI SDK is shipped to the browser.

See [docs/architecture.md](docs/architecture.md) and
[docs/content-model.md](docs/content-model.md) for the detailed contracts.

## Local development

Requirements: Node.js 22.12+ and npm. The root and `server/` each have a canonical lockfile.

```bash
npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` is optional. If it is missing or unreachable, all ten bundled lessons and
previously persisted progress remain usable.

Run the optional backend in a second terminal:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

In development and test, the backend can start without usable model credentials so `/health` can
report degraded readiness and AI routes can fail closed. Production startup rejects missing
`FRONTEND_ORIGINS`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `GOOGLE_CLOUD_PROJECT`, or
`USAGE_HASH_SALT`; the usage salt must be at least 32 characters. Never commit the copied
environment files.

## Quality scripts

```bash
npm run validate-content
npm run report-content
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
npm run server:test
npm run server:typecheck
npm run server:build
npm run verify
```

## Offline-first approach

Verified lessons ship in the client bundle. The service worker caches the shell and same-origin
static assets while IndexedDB stores learner-owned state behind a repository abstraction.
Personalised API responses are validated and persisted deliberately; they are excluded from the
general service-worker runtime cache.

## Misconception-aware learning

Every plausible wrong primary answer references a named misconception with a respectful
acknowledgement, an explanation of why the choice feels reasonable, a correction, and a memory
hook. The application does not shame, rank, or punish learners.

## Deployment

The frontend is pinned to Nitro's Vercel preset; `npm run build` produces Vercel Build Output API
artifacts in `.vercel/output`. Configure `VITE_API_BASE_URL` at build time. The backend compiles to
`server/dist/server/src/index.js`, binds to `127.0.0.1:301`, and is intended to sit behind Nginx
and HTTPS on Ubuntu.

See [docs/backend.md](docs/backend.md), [docs/deployment.md](docs/deployment.md), and
[docs/mobile-testing.md](docs/mobile-testing.md).

## Build Week and Codex

Codex, powered by GPT-5.6, was used as the engineering collaborator. At runtime, a configurable
OpenAI model can provide optional alternative explanations and personal AI-generated lessons.
Strict structured output, Zod validation, server-owned prompts, one repair attempt, and Firestore
storage sit between model output and the browser. Bundled educational copy remains deterministic,
verified, and independent of the model.

## Current limitations and next steps

- There are no accounts or cross-device sync.
- Media entries are metadata/placeholders; no production clips are bundled.
- AI-generated lessons are drafts, not verified content, and do not enter verified XP progression.
- Salted request fingerprints are lightweight abuse protection, not identity-grade enforcement.
- Model and Firestore behavior has automated mock coverage; no live credential test or production
  deployment is claimed by this repository.

The factual implementation log and demo notes live in
[docs/build-week.md](docs/build-week.md).
