# Screenshot intake and confirmation UX

2026-10-22. Distinct UX Specialist handoff from `2ffa4c5`. Read-only review of the complete lesson record, data contract, fixed extraction benchmark, independent extraction QA, low-resolution evaluation, recovered visual checkpoint and current application HTML, JavaScript and CSS. This document is the only file owned by this reviewer. It proposes integration behavior; it does not claim that the application already implements it or that OCR is accurate.

## Decision and evidence

Build screenshot reading as a reviewable first draft inside the existing application. The current development result of8/22 exact value strings makes automatic numerical acceptance inappropriate. Do not describe the workflow as a finished screenshot-to-recommendation calculator. No new user information is required to implement a conservative review flow.

Keep the current header, chosen leaf, named appearance control, full example screenshot, quiet disclaimer, links and support placeholder. After selection, use the uploaded image as the primary reference in the existing intake area rather than adding a second competing hero. Keep the approved example available through a small disclosure when useful. The existing two-item editor is the correction surface; do not create a separate technical evaluator, giant character form or crop-coordinate form for players.

## Compact flow

1. **Choose screenshot.** Decode locally and start reading automatically. Keep the selected image visible in full, with reversible proposed region outlines and their text labels. Status: “Reading screenshot on this device…” with a real Cancel control. Do not invent a percentage progress bar if the stages cannot support one. File/decode/resource failures retain the image when decodable, existing entries and a usable manual path.
2. **Verify item attribution.** Show the two proposed regions with “Currently equipped” and “Candidate” labels. Before either becomes confirmed, ask the user to check the markings and explicitly confirm which item is equipped. Left/right position, green text, CP arrows and identical names do not establish identity. An accessible Swap items action changes the complete panel associations, including provenance and rows. Missing or ambiguous detection remains visibly missing rather than duplicating the recognized item.
3. **Review extracted lines.** Open the existing editor and use a concise “Review extracted items” summary. Every proposed name, label, value and unit is editable. Rows remain ordered and unequal between items; duplicate and unknown labels remain separate. Show a small Needs review / Confirmed status and a “Review line” action per occurrence. A screenshot detail or row highlight should help inspect the source without hiding the original full image. Editing commits on input and invalidates confirmation; a separate explicit action confirms the edited line. Keep raw OCR evidence in a subordinate “Read from image” disclosure, rendered as text.
4. **Confirm visible items.** After attribution and line review, expose “Confirm reviewed items”. It records that the visible information was checked, not that all equipment effects or game formulas are known. State remaining missing/unreadable lines plainly. Blank values stay unknown and may be retained; explicit confirmation cannot turn unknown into zero. A compact count, such as “4 lines need review”, should count occurrences rather than stat labels. Given present recognition errors, do not add a one-click “accept all OCR” shortcut for the initial preview.
5. **Continue only within supported scope.** Preserve the existing raw comparison and limited calculation boundaries. A screenshot-ready preview may show confirmed items while recommendation remains unavailable. Do not imply that confirmation unlocks unsupported battle profiles, source independence or a full damage verdict.

## Region correction fallback

Automatic detection failure should first explain: “We could not identify both item panels. Mark the panels or enter missing details.” A region adjustment mode may let the user select the equipped and candidate rectangles visually. It must retain the full image, label the active role, support keyboard-accessible resize/move controls or an equally usable non-pointer alternative, provide Reset region and Cancel, and avoid requiring typed pixel coordinates. A detector proposal must be labeled a proposal even when geometry looks plausible.

If that accessible region tool is not implemented in this increment, offer honest manual continuation and retry rather than presenting the developer's fixed-region controls as a finished fallback. Do not count reviewed regions as automatic full-image detection in verification.

## Session and correction rules

| Event | Required visible and data behavior |
| --- | --- |
| Theme change | Change root appearance only. Preserve active image, editable values, confirmation, focus, scroll, disclosure state and results. No OCR rerun. |
| Read again, same image | Stage new proposals separately. Retain edits and existing line IDs. Never replace an active input while typing. A material crop/preprocessing/segmentation change marks affected observations for renewed review even if text is identical. |
| Apply a staged proposal | Explicit per-line action replaces that line's draft and resets its confirmation; original text and prior correction provenance stay available in memory. Do not reassociate corrections by closest label. |
| New image | Cancel/terminate old work and reject stale completions. Keep existing entries to avoid data loss, but mark them “From previous screenshot” and invalidate screenshot association/confirmation. Apply new proposals through an explicit replacement action if populated entries exist; do not silently pair old corrections with new rows. |
| Remove screenshot | Revoke local image resources and cancel work. Keep manually edited entries, remove their current-image association and explain that they remain available as manual input. |
| Cancel/failure | Keep accepted edits and last accepted observations. Report that no new reading was applied. Offer Read again and manual correction. |
| Changed item field | Mark raw/model results stale immediately and invalidate confirmation for the affected occurrence. A name or role change also invalidates relevant attribution. |
| Reset all | Clear image, observations, drafts, confirmations and results through an explicit reset action. Keep appearance preference. |

Automatic detection/OCR must not move keyboard focus while a user is editing. At initial completed reading, announce the result through a short polite status and expose a Review items action; focus changes only when the user activates it. Do not announce the entire OCR transcript in a live region. Keep 16px editable text, 40–44px primary tap targets and natural landscape scrolling. On narrow phones stack current and candidate cards with persistent text headings, rather than relying on outline color or shrinking two full forms side by side.

## Required integration checks

- Whole-image selection without known fixture coordinates produces either visible region proposals or an honest detection failure; names/roles are not auto-confirmed.
- Existing private development images exercise the actual upload → read → review flow. The prior last-two baseline images are reused validation if inspected again, not fresh held-out evidence. No screenshot or OCR content is included in public evidence.
- Unknown value, explicit zero, wrong unit, repeated labels, extra/missing rows, swapped roles and only-one-panel cases remain correctable and distinct.
- Edits survive unblurred input, repeated reading, cancellation, failed resource load, theme changes, image replacement and stale worker completion. Changed observation identity requires renewed review.
- Reprocessing never overwrites edited rows, appends duplicate rows automatically or treats an old accepted result as a fresh success.
- Phone portrait/landscape, tablet and desktop checks cover progress, errors, review rows, region outlines and footer in both skins at actual labeled dimensions. Keyboard/focus and screen-reader status require their own checks.
- Confirmed item extraction is reported separately from source-linked numerical eligibility, game validation and production release. Current production remains unchanged until the later release is approved.

No blocker to building this conservative confirmation workflow was found in the UX review. The Data & Tooling Engineer and QA Breaker must establish the reader contract, privacy/lifecycle behavior and detection failure handling; current recognition quality does not support bypassing review or claiming a complete calculator.
