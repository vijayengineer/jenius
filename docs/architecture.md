# Architecture

## Baseline audit (2026-07-20)

The repository was imported from `jenius-design-language`. `main` tracks `origin/main`; the
`design` remote is a read-only historical reference. The imported app uses TanStack Start 1.x,
React 19, Vite 8, Tailwind CSS 4, Radix/shadcn primitives, and strict TypeScript. Routes are `/`,
`/saved`, `/create`, `/me`, and the no-index `/dev` component catalogue.

The Lovable baseline already includes ten concept cards, optional media presentation, a complete
challenge/feedback/retry/Mind Blown visual flow, saved/create/profile screens, offline/error/empty
states, and design tokens. Before application work, all five routes returned HTTP 200,
`tsc --noEmit` passed, and the production build passed. Baseline lint reported 212 errors, mostly
Prettier drift plus two substantive rules; no tests or test script existed.

## Design constraints

- Preserve `src/styles.css`, its semantic subject/pedagogy tokens, typography, gradients, glass
  treatments, safe-area helpers, focus treatment, and reduced-motion behavior.
- Preserve file-based routes and the public component surface in
  `src/components/jenius/index.ts`.
- Presenters remain data-driven. Correctness, persistence, and connectivity do not belong in
  visual primitives.
- Keep at least 44px touch targets, semantic controls, keyboard answer navigation, `aria-live`
  feedback, and non-swipe navigation.
- Media is optional, same-origin only, muted by default, and never required to finish a lesson.
- Tone is curious, specific, calm, and non-punitive.

## Target layers

1. **Verified content** — Zod schemas, bundled raw catalogue, cross-record validation, reporting.
2. **Learning domain** — a pure deterministic reducer and selectors; no browser or React imports.
3. **Local data** — one versioned repository interface with IndexedDB and safe in-memory fallback.
4. **Application state** — one React provider coordinates hydration and repository writes.
5. **Lovable UI** — existing feed, sheets, and secondary screens consume resolved state and data.
6. **Offline shell** — manifest and service worker cache only bundled, same-origin application
   assets and navigation fallback.

## Backend boundary

Future services must implement small interfaces such as `LearningRepository` and
`TopicGenerationService`. UI components must not import Firestore, an SDK client, or provider
credentials. Server-generated learning packs must pass the same content validation before use.
Personalised/sensitive responses require an explicit cache policy and are excluded from the
general service-worker runtime cache.

## Implemented application flow

The Feed now consumes `VERIFIED_CONCEPTS` through adapters that preserve the Lovable presenter
contracts. `learningReducer` owns deterministic domain transitions and the feed mirrors those
events while retaining the existing sheet states and motion. Closing a sheet hides it without
discarding the learner's selection or feedback stage.

`LearningProvider` is the only React-level persistence coordinator. It hydrates a versioned
learner document from `LearningRepository`, applies pure updates, and writes the resulting
document back. Saved, Create, and Me consume selectors over that same state. The current
`LocalTopicGenerationService` stores a validated request and explicitly does not return a
fabricated pack.

The production-only service-worker registration caches same-origin shell/static requests and
navigation fallbacks. `/api/` and cross-origin requests are deliberately excluded.

## Persistence decisions

Learner state is a single serializable versioned document to make migrations atomic and testable.
IndexedDB is accessed only by the repository module. Server rendering and browsers without
IndexedDB use a non-throwing memory implementation. Completion IDs make XP awards idempotent.

## Assumptions

- One anonymous local learner exists in the initial release.
- Bundled verified content is authoritative and does not require network validation.
- “Understanding” is a lightweight local signal, not a psychometric score.
- Remote generation, authentication, sync, analytics, and real media are deliberately out of
  scope.
