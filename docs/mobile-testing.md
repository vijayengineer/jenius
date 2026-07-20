# Mobile and offline testing

Use the deployed HTTPS frontend on at least one current iPhone Safari device and one current
Android Chrome device. Browser installation is optional; the URL must work directly.

## Core pass

1. Open the public URL in a normal browser tab and navigate all four bottom tabs.
2. Complete a bundled lesson with a wrong answer, misconception feedback, retry, Mind Blown, and
   continuation.
3. Confirm the bottom navigation and sheets remain above the home indicator and every primary
   control has a comfortable touch target.
4. Rotate portrait to landscape and back. Confirm the active card, challenge sheet, and form do
   not become unreachable.
5. In Create, focus the topic input, use the on-screen keyboard, change selects, and submit. The
   focused field and Generate control must remain reachable without horizontal scrolling.
6. Open Explain another way, change styles, and close/retry it. The verified explanation behind
   the optional coach card must remain unchanged.
7. Use Share. Verify the platform share sheet; on browsers without Web Share, verify clipboard
   fallback where supported.
8. Enable reduced motion at OS level and confirm transitions no longer depend on motion.
9. Pinch zoom. The app must not globally disable browser zoom.

The implementation uses `100dvh`, `viewport-fit=cover`, safe-area inset padding, sheet bottom
padding, minimum 44px navigation controls, scroll snapping with explicit navigation, and global
reduced-motion overrides.

## Offline pass

1. Load the app once online and complete/save at least one bundled concept.
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
   generated lesson appears.
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
