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

`critical` is reserved for the short Curiosity Spark and receives an early preload hint. The feed
prefetches only the active concept and its immediate neighbours. Other clips load metadata when a
real reducer transition requests them. Only the active feed card owns a video element; hidden feed
cards use posters, and outgoing transient players are removed after their crossfade.

## Engine and timeline

`MotionProvider` owns the controller, preload hints, reduced-motion preference, page-visibility
state, and transient crossfade surface. Consumers use the semantic API:

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

## Playback behavior

Concept cinematics autoplay muted and inline only for the visible active card. They seek to their
manifest start, crossfade at the configured loop end, and return to the configured loop start.
Opening a lesson or overlay pauses the feed cinematic without resetting it. Changing cards
disposes the previous video element instead of retaining a pool of decoded players.

Transient clips are decorative, `aria-hidden`, excluded from the tab order, and rendered in a
pointer-events-free layer. Reading, screen-reader navigation, keyboard navigation, answers, and
actions remain available throughout playback. The controller pauses an active clip when the
document becomes hidden and resumes it at the same point when visible again.

With `prefers-reduced-motion: reduce`, transient videos resolve as skipped and concept cinematics
render their still poster. Existing UI fades remain governed by the global reduced-motion CSS.

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
