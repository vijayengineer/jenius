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
6. Record a “Teach me anything” topic locally in Create; remote generation is not implemented.

## Architecture

TanStack Start and React render the existing Lovable interface. Zod validates bundled content
at module and script boundaries. A pure reducer owns the learning flow. A small versioned
IndexedDB repository owns progress, saves, attempts, topic requests, and review scheduling;
React components access it through one application provider. The bundled catalogue and app
shell are available offline through a narrowly scoped service worker.

See [docs/architecture.md](docs/architecture.md) and
[docs/content-model.md](docs/content-model.md) for the detailed contracts.

## Local development

Requirements: Node.js 22.12+ and npm. `package-lock.json` is the canonical dependency lockfile.

```bash
npm install
npm run dev
```

No environment variables are required. The application intentionally has no authentication,
remote backend, Firestore client, or model-provider call.

## Quality scripts

```bash
npm run validate-content
npm run report-content
npm run typecheck
npm run lint
npm run test
npm run build
```

## Offline-first approach

Verified lessons ship in the client bundle. The service worker caches the shell and same-origin
static assets while IndexedDB stores learner-owned state behind a repository abstraction. Future
personalised API responses must define explicit cache policy and must not be added to the general
runtime cache.

## Misconception-aware learning

Every plausible wrong primary answer references a named misconception with a respectful
acknowledgement, an explanation of why the choice feels reasonable, a correction, and a memory
hook. The application does not shame, rank, or punish learners.

## Deployment

`npm run build` produces the TanStack Start/Nitro output in `.output`. Deploy that output to the
configured Cloudflare-compatible host over HTTPS so service workers and installation metadata are
available. No secrets are required for the current local-only release.

## Build Week and Codex

Codex, powered by GPT-5.6, was used as the engineering collaborator to audit the imported Lovable
prototype, preserve its component quality, design typed content and learning-state boundaries,
implement local persistence and offline support, add tests, and maintain factual project
documentation. Educational copy remains deterministic and locally validated; the product does
not claim that a live model generated or verified content at runtime.

## Current limitations and next steps

- The initial release is local-only and has no accounts or cross-device sync.
- Media entries are metadata/placeholders; no production clips are bundled.
- Create records requests but does not fabricate remote generation.
- Explain More uses a small bundled cache rather than a model endpoint.
- A future backend should implement the existing API/repository boundary, content review,
  authenticated sync, rate-limited generation, and privacy-aware analytics.

The factual implementation log and demo notes live in
[docs/build-week.md](docs/build-week.md).
