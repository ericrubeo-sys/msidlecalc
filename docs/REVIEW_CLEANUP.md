# Reading review and crop controls — 2026-10-23

The user's latest private phone captures show the real six stat rows correctly in both items, two additional unresolved fragments, and arrows partly covered by the action strip. This is observed improvement in that test, not general OCR validation. The user requested the remaining fix and has standing authorization to publish ready screenshot-flow follow-ups.

Distinct read-only UX and QA specialists received the full lessons (including the new occlusion/noise lesson), source files and latest screenshots before reviewing. Orchestrator owns all implementation files. No private image or stat set was added to source control or public output.

## Source → requirement → implementation → verification

| Requirement / evidence | Implementation | Verification / limits |
| --- | --- | --- |
| Stray OCR fragments look like genuine stats | `ocr-review-groups.js` partitions display only; counted Other readings disclosure follows the stat proposals | Unknown labels with values stay prominent; known registry labels missing values also stay prominent. Other fragments may be unreadable genuine effects, not proven noise. No dictionary excludes unknown effects. |
| Never discard unsupported/missing observations | Assembly/import unchanged; raw reading and all ordered correction records remain | Five regression groups verify retention, repeat order, unknown labels, zero versus missing and all-unreadable input. All-unreadable display opens disclosure and says no values could be read. No auto-confirmation or calculation changes. |
| Sticky actions cover arrows | Crop dialog uses a scrollable image/help section and reserved normal-flow controls/actions | Measured zero arrow/action intersection and no horizontal overflow at320×568,375×667,393×852,812×375,390×601, both steps. Ordinary portrait arrows stayed inside dialog. Landscape uses whole-dialog scrolling so all controls remain reachable. |
| Taller second-step warning | Seed help remains in image section; overlap warning reserves space in control flow | At390×601, moved second area into invalid overlap: warning visible, Read disabled, arrows inside dialog, zero intersection; Reset restores valid area. |
| Preserve touch/keyboard and image state | Existing48px controls, scoped manipulation, hold cancellation and focus restoration untouched | Existing timer/editor regressions pass. Physical iPhone toolbar behavior and enlarged-text review are not certified by viewport simulation. |
| Automatic area detection still fails | No guessed detector change | Prior source/raster experiments are in `SECOND_PANEL_FIX.md`; no new original game image supplied in this follow-up. Replaying the existing original mobile observation yields two assigned areas, so it does not reproduce this latest upload failure. The compressed app captures cannot establish its original raster behavior. Localization remains open. |

Build/check/contrast and231 tests pass. Synthetic passing tests do not establish recognition accuracy. Local proof `.review/cleanup-crop-phone.png` uses the authorized public example; new player captures remain private. Production status is recorded after verification.

Local browser upload → fallback → reviewed OCR → grouped preview completed. The secondary disclosure opened normally, retained its open state and content through BasilMarket→Hidden Street, and import preserved its observation as an editable unconfirmed record. The same known label/punctuation recognition limits remain. Additional dark390×601 and812×375 control checks had zero intersection; clicking a landscape arrow scrolled it fully into the dialog viewport. No physical iPhone or enlarged-text certification follows.
