# Jenius — Lovable → Codex Handoff (Historical Import Snapshot)

> [!NOTE]
> This is the historical import snapshot, retained to document the Lovable component contracts.
> It does not describe the current data, persistence, or offline implementation. Start with
> `README.md` and `docs/architecture.md` for the canonical application documentation.

> **Import-time prototype status.** This app was imported as a mobile-first Lovable prototype for
> _Jenius — Infinite Understanding_. It intentionally ships with no backend
> and no external service integrations. Everything below documents the
> shape Codex is expected to preserve when it wires the real system.

## 1. Framework and commands

- **Framework:** TanStack Start 1.x on Vite 7 (React 19).
- **Styling:** Tailwind v4 via `src/styles.css` + shadcn primitives.
- **Data layer at import:** local fixture modules only.

| Purpose     | Command              |
| ----------- | -------------------- |
| Dev preview | `bun dev`            |
| Type check  | `bunx tsgo --noEmit` |
| Prod build  | `bun run build`      |

There is no server function, edge function, or `.env` requirement.

## 2. Routes

| Path      | File                    | Description                                                                          |
| --------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `/`       | `src/routes/index.tsx`  | Discover feed.                                                                       |
| `/saved`  | `src/routes/saved.tsx`  | Saved collections screen.                                                            |
| `/create` | `src/routes/create.tsx` | AI-generated draft form (mock at import).                                            |
| `/me`     | `src/routes/me.tsx`     | Personal progress overview.                                                          |
| `/dev`    | `src/routes/dev.tsx`    | **Dev-only** state preview — every UI state on one screen. Marked `robots: noindex`. |

## 3. Component map

All Jenius components live under `src/components/jenius/` and are
re-exported from `src/components/jenius/index.ts`.

### Shell & navigation

- `AppShell`, `BottomNavigation`, `TabShell`, `FeedTopBar`, `DailyDiscoveryBadge`
- System: `OfflineBanner`, `LoadingState`, `EmptyState`, `ErrorState`
- Brand: `JeniusMark`

### Feed

- `DiscoverFeed` — snap-scrolling controller (**demo controller**, see §7).
- `ConceptCard`, `ConceptActions`, `FeedCard`, `FeedActions`, `FeedProgress`
- `MediaSlot` — production-ready media presenter.
- `SubjectChip`

### Challenge / feedback

- `ChallengeSheet` (state-machine presenter)
- `AnswerOption`, `TeacherMessage`, `MisconceptionCard`, `MemoryHook`
- `CorrectFeedback`, `IncorrectFeedback`, `CorrectiveExplanation`
- `RetryQuestion`, `MindBlownCard`
- `CompletionOverlay`

### Secondary screens

- `SavedScreen`, `SavedCard`
- `MeScreen`, `StatCard`, `WeeklyHeatmap`
- `CreateScreen`, `CreateForm`, `GenerationProgress`, `GeneratedDraftPreview`
- `ExplainMoreSheet`

### Primitives

- `PrimaryButton`, `SecondaryButton`
- `Sheet` (Radix Dialog wrapper)

## 4. Imported fixture locations

| Concern                                          | File                                       | Replace with                                    |
| ------------------------------------------------ | ------------------------------------------ | ----------------------------------------------- |
| Concepts (10)                                    | `src/lib/jenius/concepts.ts`               | Validated local catalogue.                      |
| Challenges + feedback (30 wrong-option branches) | `src/lib/jenius/challenges.ts`             | Server-resolved answer + misconception payload. |
| Explain-more packs + statuses                    | `src/lib/jenius/explainMore.ts`            | Live "explain" API + cache.                     |
| Saved collections                                | `src/lib/jenius/savedCollections.ts`       | Persistent user library.                        |
| Personal progress                                | `src/lib/jenius/progress.ts`               | Real learner stats.                             |
| Generated draft                                  | `src/lib/jenius/generatedPack.ts`          | Actual generation API.                          |
| Offline flag                                     | `src/lib/jenius/offline.ts` (`useOffline`) | `navigator.onLine` + heartbeat.                 |
| Shared types                                     | `src/lib/jenius/types.ts`                  | Keep as canonical shapes.                       |

## 5. Design tokens

Tokens live in `src/styles.css`:

- Colours: `--brand-blue`, `--brand-violet`, `--brand-amber` (Mind Blown),
  `--misconception`, `--subject-*` per subject.
- Fonts: Space Grotesk (display), Manrope (sans).
- Radii: 12/16/**24**/32/48 px (24 is the default).
- Motion: `--ease-swift`, `--ease-standard`; `transition-swift` utility.
- Utilities: `glass`, `glass-strong`, `safe-top`, `safe-bottom`, `no-scrollbar`.
- Reduced-motion overrides applied globally via `@media (prefers-reduced-motion: reduce)`.

## 6. MediaSlot contract

`MediaSlot` never fetches. Its props:

```ts
interface MediaSlotProps {
  media?: MediaSlotData | null;
  playbackState?: "poster" | "loading" | "playing" | "paused" | "failed";
  captionsOn?: boolean;
  muted?: boolean;
  reducedMotion?: boolean;
  failed?: boolean;
  onPlay?;
  onPause?;
  onReplay?;
  onToggleCaptions?;
  onToggleMuted?;
}
```

`MediaSlotData.mode` supports `video | svg | image | text | none | diagram`.
Video mode renders the poster + play/pause/replay + captions/mute UI. It
shows a text fallback whenever `failed` or `reducedMotion` is true (and
`textFallback` is set). It never plays remote files in Stage 1.

Five concepts pre-declare future paths (**files not required to exist**):

- `/media/seasons.webm`
- `/media/volcanoes.webm`
- `/media/planes.webm`
- `/media/free-fall.webm`
- `/media/dna.webm`

## 7. Demo controller at import

`DiscoverFeed` in `src/components/jenius/DiscoverFeed.tsx` is a **demo
controller**, not a production data layer. It owns:

- Challenge state machine (`question → feedback-* → retry → mind-blown`)
- Correctness resolution via `resolveChallenge` / `resolveFeedback`
- Explain-more status resolution (uses `useOffline` + cached `EXPLAIN_PACKS`)
- Save toggle (in-memory)
- Completion overlay lifecycle
- Tab navigation

Codex should split these into hooks/queries and keep the visual
components pure presenters.

## 8. Component prop contracts (stable)

### FeedCard / ConceptCard

```ts
{ concept, media?, saved?, onSave?, onGotIt?, onExplainMore?,
  explainDisabled?, explainHint?, playbackState?, reducedMotion?, muted? }
```

### ChallengeSheet

```ts
{ question, selectedOptionId, submissionState, resolvedOptionStates,
  onSelect, onSubmit, onClose, stage, correctFeedback?, incorrectFeedback?,
  retryChallenge?, retrySelectedOptionId?, retrySubmissionState?,
  retryResolvedOptionStates?, onRetrySelect?, onRetrySubmit?, onRetry?,
  onSkipRetry?, mindBlown?, saved?, onToggleSave?, onShare?, onContinue?,
  onErrorRetry? }
```

### FeedbackSequence (composed inside ChallengeSheet)

`CorrectFeedback`, `IncorrectFeedback` each accept:

```ts
{ resolution, onRetry?, onContinue?, onSaveMindBlown?,
  onlineCoachAvailable?, onExplainMore? }
```

(Data-only — no correctness lookup.)

### MediaSlot

See §6.

### CreateConceptForm (`CreateForm`)

```ts
{ values, validation?, generationStatus, online?, onChange, onSubmit }
```

## 9. State-preview route

Visit **`/dev`** in dev/preview to jump between every state in the
prototype (feed variants, challenge stages, all incorrect-feedback types,
retry, Mind Blown, saved empty/populated, Me new/active, Create idle/
generating/success, explain-more statuses, media states, offline, empty,
error). The left sidebar includes a **Simulate offline** toggle backed by
the same context as the real app.

## 10. Historical limitations at import

- No service worker; offline is a mocked toggle.
- No real videos — MediaSlot shows placeholder shapes + poster/play UI.
- Saved concepts, progress, and generated drafts are in-memory only.
- No auth, no persistence, no backend, no analytics.
- "Share" is a no-op placeholder.
- Explain more never calls a model.

## 11. What Codex should preserve

- Route structure and file-based routing conventions.
- Design tokens in `src/styles.css` and Tailwind utilities.
- Component boundaries — presenters stay pure, controllers own state.
- Prop contracts listed above (add fields, do not rename).
- Accessibility (radio-group answers, `aria-live` feedback, focus
  outlines, reduced-motion respect, ≥44px tap targets, icon+text
  meaning).
- Copy tone: curious, encouraging, calm, never patronising.
- Component library public API (`src/components/jenius/index.ts`).

## 12. Historical replacement checklist

| Temporary                                  | Real thing                                           |
| ------------------------------------------ | ---------------------------------------------------- |
| `MOCK_CONCEPTS`                            | Feed fetch (paginated, personalised).                |
| `resolveChallenge` / `CHALLENGE_FEEDBACK`  | Server-resolved answer key + misconception payloads. |
| `mockFreshExplainPack` / `EXPLAIN_PACKS`   | Real explain endpoint + on-device cache.             |
| `MOCK_PROGRESS_*`                          | Live learner stats from backend.                     |
| `MOCK_SAVED_ITEMS` + in-memory `saved` set | Persistent library (DB + sync).                      |
| `useOffline` (mock toggle)                 | Real connectivity hook.                              |
| `CreateScreen` `onGenerate` stub           | Real generation API (rate-limited, streamed).        |
| Completion overlay auto-dismiss timer      | Real completion telemetry.                           |
| Placeholder video paths                    | Actual `.webm` assets with captions.                 |

## 13. Restrictions at import (historical)

- No Supabase / Firebase / Firestore integration.
- No authentication or authorization.
- No OpenAI or model-provider calls.
- No server functions or edge functions.
- No secrets, no `.env` requirements.
- No remote video, image, or font hosting beyond Google Fonts.
- No copied third-party product assets.

## 14. Files Codex should read first

1. `src/components/jenius/index.ts` — public surface.
2. `src/lib/jenius/types.ts` — canonical shapes.
3. `src/lib/jenius/concepts.ts` + `src/content/catalog.ts` + `challenges.ts` +
   `explainMore.ts` — bundled content and presenter contracts.
4. `src/components/jenius/DiscoverFeed.tsx` — demo controller to split.
5. `src/components/jenius/MediaSlot.tsx` — media contract.
6. `src/routes/dev.tsx` — exhaustive UI catalogue.
7. `src/styles.css` — design tokens.
