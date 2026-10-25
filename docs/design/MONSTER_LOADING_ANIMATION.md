# Monster photo-reading scene

**Design:** 2026-10-24. Local preview; publication remains a separate step.

The photo reader gets one small, decorative MapleWorld scene. Slime, Orange Mushroom and Ribbon Pig are the proposed cast: recognizable early-game monsters with different silhouettes and movement. The root integration supplies only verified MapleStory.io sprite descriptors; the component does not infer monster IDs or mix a catalog lookup into screenshot processing. Their final provider identities and fixed endpoints are recorded with the integration's source research.

The trio patrols together across a small grassy ledge, pauses at each edge and turns around. Slime has a soft hop, Mushroom a tiny waddle and Pig a quicker trot. The scene uses actual static sprite artwork with original CSS movement. It does not claim to reproduce the game's native walk frames. There are no new labels, progress percentages, instructional paragraphs or rotating tips. The existing one-line reading status stays outside the scene and remains the accessible status.

## Visual treatment

- One contained scene, at most 360 × 140 CSS pixels, shrinking to the mobile container; no full-screen takeover.
- A pale, warm morning sky for the light skin and a quiet blue-green twilight for the dark skin. The cast, geometry and timing stay the same.
- Two faint hills, two simple pixel clouds and a narrow grass platform frame the sprites. These are original CSS decorations, not copied game map assets.
- Pixel edges remain crisp with `image-rendering: pixelated`. A stable sprite box prevents page movement while external images arrive.
- An eight-second patrol includes generous endpoint pauses. Independent gait layers keep facing, movement and natural character bounce separate.
- The whole scene is decorative (`aria-hidden=true`) and has no interactive controls or text. The normal reading status and cancellation remain operable outside it.

## Component contract

`mountMonsterLoader(root, {sprites})` returns `start()`, `stop()` and `destroy()`.

Each caller-owned sprite descriptor has a fixed `url`, optional `gait` (`hop`, `waddle` or `trot`), and optional native `faces` (`left` or `right`). Optional `width` and `height` are display-box measurements, clamped to 16–72 CSS pixels. At most three images are used.

`start()` shows the host immediately and starts external image loading on first use. It never waits before allowing OCR to run. `stop()` hides the scene and pauses all CSS motion. `destroy()` removes image handlers, the visibility listener, observer and owned DOM. The caller must stop the scene in the same error/finally path as the rest of its reading screen.

Images are fetched using ordinary image requests with `referrerPolicy=no-referrer`. The component passes no user image, extracted stats or other calculation values to MapleStory.io. Only the caller's fixed provider URLs are requested. No sprite binary is added to public source control by this component.

## Motion and failure states

- `prefers-reduced-motion: reduce` disables every animation and transition; the three characters remain centered in a static scene.
- `document.hidden` and off-screen intersection pause CSS animation. Scene motion is also paused while inactive.
- Native broken-image icons are never shown: images stay invisible until a successful load with nonzero natural dimensions.
- A failed sprite disappears. Other successful members continue without changing the scene's dimensions.
- After 3.5 seconds, still-pending sprites allow the fallback scene to appear. A late successful image is accepted rather than permanently discarded. If every sprite fails or remains pending, the landscape retains a quiet pixel glint; the existing text status still communicates reading. An image timeout does not cancel or delay OCR.
- A new reading can reuse already-loaded images. There is no timer that artificially prolongs the user's wait and no estimated percentage based on decorative motion.

## Review boundaries

Source availability, service conditions and rights are distinct questions. The earlier [asset research](../../research/MAPLESTORY_ASSET_RESEARCH.md) records the unresolved rights and external-dependency context. The user's current request authorizes this reversible MapleStory.io prototype; it does not establish a new license or justify copying binary sprites into the public repository. Keep the existing fan-site attribution and final source register accurate.

Implementation inspection is separate from browser verification. The integrating agent records the actual local mobile/light/dark, reduced-motion and image-failure checks; this design document does not claim those checks were performed by the Designer.

## Local preview and verified cast — 2026-10-25

`public/monster-sprites.js` supplies fixed GMS83 icons for Slime210100, Orange Mushroom1210102 and Ribbon Pig1210101. The provider's `/name` responses and actual PNGs were checked; private image review files remain ignored. See [asset source record](../../research/MAPLESTORY_ASSET_RESEARCH.md). Local viewing is available at `/loading-preview.html`, with Pause/Play and the normal theme selector; it continuously demonstrates the scene without processing a photo or prolonging real OCR.

Integration-owner browser checks: all three remote images loaded, the scene was active/visible, CSS patrol motion was running, Pause switched it to paused and Play resumed it. Light and dark skins were visually inspected. Build syntax/module/asset closure passed. Real-device/reduced-motion and provider-failure emulation are not claimed as completed browser checks. No hosting deployment or public sprite binary redistribution occurred.

The actual calculator upload flow was also exercised using its public example image: picture selection set the scene active while the reading screen was visible; Cancel set it inactive and hid its host, preserving the normal cancellation message. No browser error logs were captured for that check.
