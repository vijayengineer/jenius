# Mobile and offline testing

Use the deployed HTTPS frontend on at least one current iPhone Safari device and one current
Android Chrome device. Browser installation is optional; the URL must work directly.

## Learning-flow pass

1. Open the public URL in a normal browser tab and navigate all four bottom tabs.
2. Open a bundled lesson. Confirm the sheet shows lesson progress, subject, the complete question,
   answer options, and one `Check answer` action in that order. Close and reopen it after selecting
   an answer; the selection and stage must remain intact.
3. Complete one correct path. Confirm Retry is absent, `See the big idea` leads to Mind Blown,
   and `Finish concept` opens the completion card.
4. Complete one incorrect path. Confirm `Show me why` reveals the deterministic explanation,
   `Try again` opens the reframed question, and the optional `Explain another way` action remains
   visually below the primary flow.
5. On completion, confirm the card shows the concept title, newly awarded XP once, and the stored
   understanding level. `Next curiosity` must advance one feed card, including from the final
   concept to the end card. Close the card to return to the current Feed position.
6. Reopen that completed concept. Confirm it shows `Concept complete`, the stored understanding,
   no new XP award, and working Save, Share, Next curiosity, and Return to Feed actions.
7. Confirm the bottom navigation and sheet controls remain above the home indicator and every
   primary control has a comfortable touch target.
8. Rotate portrait to landscape and back. Confirm the active card, challenge sheet, and form do
   not become unreachable.
9. In Create, focus the topic input, use the on-screen keyboard, change selects, and submit. The
   focused field and Generate control must remain reachable without horizontal scrolling.
10. Open Explain another way from lesson feedback, change styles, and close/retry it. Closing the
    coach must restore the same lesson stage. The verified explanation behind
    the optional coach card must remain unchanged.
11. Use Share. Verify the platform share sheet; on browsers without Web Share, verify clipboard
    fallback where supported. Also exercise a non-cancelled share failure and confirm it falls back
    to clipboard without interrupting the lesson.
12. Enable reduced motion at OS level and confirm sheet/card transitions no longer depend on
    motion. No completion content may depend on animation to become available.
13. Pinch zoom. The app must not globally disable browser zoom.

## Sheet and viewport matrix

Run the lesson checks in portrait at approximately 667px, 740px, 812px, 844px, and 932px viewport
heights. At each height, use both a normal-length lesson and deliberately long answer or
misconception copy.

- The close control stays visible in the non-scrolling sheet chrome.
- Only the content below that chrome scrolls. A gesture started on the question, answer, feedback,
  or action continues in the same scroll container; there is no nested scrollbar.
- The full current question remains in the DOM and appears before its answers. Long content may
  scroll; it must not be clipped, ellipsised, horizontally scrolled, or shrunk to unreadability.
- The primary action can be scrolled above the home indicator, with bottom safe-area padding still
  visible below it.
- Dragging at either scroll boundary does not strand focus or make the close control unreachable.

The sheet is capped at `92dvh` and by `safe-area-inset-top`; its single internal scroll region owns
horizontal clipping, vertical touch panning, overscroll containment, and
`safe-area-inset-bottom` padding. Feed cards continue to use `100dvh`. The document includes
`viewport-fit=cover`, 44px controls, and a global `prefers-reduced-motion` override.
Programmatic Feed/Next curiosity movement also switches from smooth to immediate scrolling when
that preference is active.

Automated tests cover the five requested viewport heights at the CSS-geometry level, one-scroll
sheet structure, long copy remaining represented, reduced-motion rules, and all learning states.
They do not replace the physical-device pass below.

## Offline pass

1. Load the app once online and complete/save at least one bundled concept.
   Wait for `navigator.serviceWorker.ready` (or an activated worker in browser developer tools)
   before disabling the network; installation discovers and caches the first-load hashed bundle.
2. Disable the backend while leaving the network connected. Reload and confirm all ten bundled
   lessons, Saved, Me, and stored progress still work.
3. Disable Firestore or use invalid test credentials. Confirm `/health` degrades and model routes
   fail safely while the frontend starts normally.
4. Remove `VITE_API_BASE_URL`, rebuild, and confirm Explain/Create show friendly optional-service
   failures without blocking lessons.
5. Put the phone in airplane mode, reload the previously visited URL, and confirm the shell,
   bundled catalogue, saved progress, and generated lessons already stored in IndexedDB remain
   available.
6. Submit a Create request while offline. Confirm it is retained with a retry message and no fake
   generated lesson appears. Reconnect, use the visible Retry action, and confirm the retained
   request is reused rather than duplicated.
7. Confirm the message explains that the core lesson still works.

The service worker caches only same-origin navigation and static shell assets. It excludes `/api/`
and all cross-origin traffic, so personalised OpenAI responses are never added indiscriminately to
the runtime cache.

## Standalone PWA pass

Add the app to the iOS home screen and install it on Android Chrome. Launch standalone, repeat
navigation, orientation, safe-area, Create keyboard, offline reload, and update tests. Confirm the
manifest name, icon, theme colour, and start URL appear correctly.

Record device, OS/browser version, URL, build commit, and failures. A desktop responsive emulator
is useful during development but does not replace physical Safari and Chrome checks.

## Current verification status

Repository tests and production builds are non-live checks. Physical iPhone Safari, Android
Chrome, installed-PWA safe areas, and real software-keyboard behavior remain deployment-time
checks and must be recorded here or in the release ticket when performed.
