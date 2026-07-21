# Motion engine

Jenius motion is an optional presentation layer over the existing learning reducer. It does not
decide correctness, advance lesson state, award XP, or block lesson controls. The UI requests a
semantic cue from one engine; components do not seek or control shared video elements directly.

## Asset pipeline

`assets/source/` contains the immutable production masters. Do not edit, rename, transcode, or
overwrite these files. `assets/runtime/` contains the same-origin files shipped by Vite, generated
poster frames, and the generated manifest.

The pipeline is configured by `assets/motion.config.json` and run with:

```sh
npm run motion:generate
npm run motion:verify
```

Generation validates MP4 duration metadata and every trim, loop, fade, filename, concept ID, and
preload priority. It copies each master to its runtime filename, records its size and SHA-256, and
verifies the source hash again after generation. Verification fails when a runtime video differs
from its source or when `assets/runtime/motion-manifest.json` is stale.

Committed posters let ordinary verification run without FFmpeg. To generate or replace a concept
poster intentionally, install FFmpeg or set `MOTION_FFMPEG_PATH` to an FFmpeg executable before
running `motion:generate`. Poster generation seeks to the configured loop start. FFmpeg is a build
tool only and is not an application dependency.

## MotionManifest

Each configured asset has one entry with:

- source and runtime filename
- start and end trim
- optional loop start and end
- crossfade duration
- preload priority: `critical`, `nearby`, or `lazy`
- a concept ID and poster filename for concept cinematics

The generated runtime manifest adds source duration, byte size, and SHA-256. Application code
loads it through `src/motion/manifest.ts`; playback timings are never repeated in presenters.

### Production transition windows

The source masters are 6.042 seconds each. The production windows below were selected from 100ms
frame sheets followed by individual-frame inspection at each boundary.

| Cue              | Previous window | Production window | Duration | Selected beat                        |
| ---------------- | --------------: | ----------------: | -------: | ------------------------------------ |
| Curiosity        |      0.15–0.95s |        0.35–0.95s |    0.60s | first legible purple spark expansion |
| Transition       |      0.15–2.65s |        2.85–3.45s |    0.60s | sphere resolves and begins to split  |
| Misunderstanding |      0.20–2.80s |        3.65–4.40s |    0.75s | clean thought/redirect arrow beat    |
| Success          |      0.60–1.45s |        1.30–2.00s |    0.70s | strongest cyan confirmation pulse    |
| Completion       |      0.20–5.80s |        2.75–3.85s |    1.10s | central point expands into a network |

The misunderstanding master contains `2 + 2 = 5` from its first decodable frame at 0.00s; there
is no usable pre-equation misunderstanding beat. The equation finishes fading at approximately
3.60s, so production deliberately starts at 3.65s in the clean post-equation section. The config
records 0.00–3.60s as an excluded range, and generation fails if a later timing edit overlaps it.
This is why the production clip cannot literally “end before” the equation: the immutable source
places the unwanted sequence first. The selected playback window nevertheless contains no
equation frame.

The success master carries a generated `Photosynthesis` label below its useful pulse throughout
the inspected range. Timing alone cannot remove it. The dedicated success stage therefore uses a
soft lower-frame mask while preserving the central pulse; no unrelated label is added to lesson
content or exposed to assistive technology.

Interface-transition duration targets are 0.45–0.75s for Curiosity, 0.40–0.65s for the generic
transition, 0.55–0.85s for Misunderstanding, 0.50–0.80s for Success, and 0.80–1.20s for Completion.
Concept cinematics keep their longer 3–5 second useful loops because they teach, rather than
punctuate, the concept.

`critical` is reserved for the short Curiosity Spark and receives an early preload hint. The feed
prefetches only the active concept and its immediate neighbours. Other clips load metadata when a
real reducer transition requests them. Only the active feed card owns a video element; hidden feed
cards use posters, and outgoing transient players are removed after their crossfade.

## Engine and timeline

`MotionProvider` owns the controller, preload hints, reduced-motion preference, page-visibility
state, and one top-level transition stage. The stage sits outside lesson scrolling, covers the
dynamic viewport while respecting both safe areas, softens the previous UI, and never accepts
pointer input. Consumers use the semantic API:

```ts
motion.playCuriosity();
motion.playTransition();
motion.playMisunderstanding();
motion.playSuccess();
motion.playCompletion();
motion.playConcept("dna");
```

Starting a cue interrupts the previous transient cue. Handles resolve as `completed`,
`interrupted`, or `skipped`, so sequences cannot accidentally continue after a rapid lesson or
card change. The learning timeline observes real `LearningState` transitions:

```text
Question opens -> Curiosity Spark
Correct answer -> Success Pulse -> Mind Blown transition -> Completion
Wrong answer -> Misunderstanding -> Concept cinematic -> explanation/retry
Correct retry -> Success Pulse -> Mind Blown transition -> Completion
Completion -> Curiosity Spark -> next feed item
```

Selecting an option, opening optional AI coaching, closing a sheet, or reopening the same state
does not create a correctness transition. The deterministic reducer remains authoritative.
Correctness is still resolved immediately, but dense success or misconception copy is held until
the principal Success or Misunderstanding clip reaches its configured endpoint. The copy may enter
during the final 140ms crossfade, after the strongest visual beat. Completion data is likewise
prepared immediately and revealed after the 1.10s Completion beat. Reduced motion resolves these
presentation gates immediately.

## Interface transitions and concept cinematics

Curiosity, Transition, Misunderstanding, Success, and Completion are brief interface punctuation.
They use the single full-viewport stage, have no card frame or controls, and are removed after the
fade. At most one layer is visually active; a replacement can retain only one fading-out player
for the crossfade cleanup interval.

Concept cinematics are educational media. They stay in the lesson canvas, use the manifest loop
bounds, and are allowed to run longer. Their presentation is full-bleed to the mobile card edges
with one restrained radius, no border, ring, shadow, gradient wrapper, or inner padding. Both video
and poster use `object-fit: contain`, so DNA, orbital paths, the full volcano cross-section, airflow,
and the falling-object chamber are not cropped. The canvas grows with available viewport height,
from 220px on short phones to 340px on larger phones; explanation copy remains below it.

## Playback behavior

Concept cinematics autoplay muted and inline only for the visible active card. They seek to their
manifest start, crossfade at the configured loop end, and return to the configured loop start.
Opening a lesson or overlay pauses the feed cinematic without resetting it. Changing cards
disposes the previous video element instead of retaining a pool of decoded players.

Transient clips are decorative, `aria-hidden`, excluded from the tab order, and rendered in a
pointer-events-free layer. Reading, screen-reader navigation, keyboard navigation, answers, and
actions remain available throughout playback. The controller pauses an active clip while the
document is hidden and discards it on foreground rather than resuming stale feedback. Feed concept
cinematics pause while hidden and resume in place because they remain relevant to the visible card.
`requestVideoFrameCallback`, where supported, stops clips one frame before the configured boundary;
`timeupdate` remains the fallback.

With `prefers-reduced-motion: reduce`, transient videos resolve as skipped and concept cinematics
render their still poster. Existing UI fades remain governed by the global reduced-motion CSS.

## Adjusting production timing

1. Leave `assets/source/` untouched and extract timestamped frame sheets from the relevant master.
2. Inspect individual frames around the proposed in/out points. Record unrelated content as an
   `excludedRanges` entry when it must never be shown.
3. Change only `assets/motion.config.json`; do not add numbers to React presenters or playback
   components.
4. Run `npm run motion:generate`, then `npm run motion:verify` to refresh and validate the derived
   runtime manifest.
5. Update duration/boundary tests and the timing table above.
6. Exercise rapid interruption, background/foreground, and reduced motion before device review.

## Production device checklist

Validate both correct and wrong paths at 375×667, 390×844, 393×852, and 430×932 in iPhone Safari,
Android Chrome, and installed PWA mode:

- no equation or unrelated lower-frame text appears in transition playback
- the selected answer remains legible while the previous lesson UI softens
- Success completes before success copy and its Continue action become prominent
- Misunderstanding completes before misconception copy appears
- videos avoid clipping, black flashes, seek flashes, layout jumps, and safe-area overlap
- the sheet retains its single scroll container and controls remain reachable
- rapid answers or navigation never create two visually active transition players
- backgrounding pauses playback and foregrounding removes stale transition motion
- reduced motion skips decorative clips, shows concept posters, and preserves state clarity

## Adding a concept cinematic

1. Add the immutable MP4 master to `assets/source/`.
2. Add one `kind: "concept"` entry to `assets/motion.config.json`, including a stable concept ID,
   runtime filename, poster filename, trims, loop bounds, fade, and preload priority.
3. Add that ID to `MotionConceptId` and its imported runtime URLs to `src/motion/manifest.ts`.
4. Map the lesson catalogue ID in `lessonConceptMotion`.
5. Run `MOTION_FFMPEG_PATH=/path/to/ffmpeg npm run motion:generate`.
6. Add or update manifest, loop, and timeline tests, then run `npm run verify`.

Keep the text lesson complete without motion. Do not add remote media URLs, backend dependencies,
or learning-reducer events for a visual asset.
