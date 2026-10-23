# Mobile area correction and reading states

UX handoff, 2026-10-23. This is a design specification, not a claim of implementation or physical-device validation. Scope: touch correction and simpler screenshot stages; existing branding, skins and footer stay intact. Reviewed the complete lessons, screenshot UX and release check, current application files and the user's two attached images. The latest user correction supersedes the old suggestion to retain a Show example disclosure after upload.

## Evidence and priority

**Observed:** the user's real-phone screenshot shows automatic detection failing on the supplied comparison; the user reports finger selection was almost impossible. The entire 1280×590 game screen is reduced to roughly the phone's content width. Its individual item columns occupy only a fraction of that width, while instructions and multiple competing controls dominate the view. Previous overflow and keyboard tests did not establish finger usability.

**Inference to verify:** enlarging the active item region and permitting all adjustment through taps should reduce finger occlusion and precision requirements. It has not yet been tested by the user. Do not describe desktop pointer simulation as a successful physical-phone test.

The priority is a complete non-drag path. Larger corner handles alone would still require the user to judge and manipulate a small rectangle under a finger. Keep pointer shortcuts optional.

## Reading flow

| Stage | Visible primary content | Secondary action / retained state |
| --- | --- | --- |
| No image | Existing example and Choose screenshot | One compact availability sentence; existing manual disclosure |
| Decoding / reading | Small activity indicator, **Reading your photo…**, **On this device**, Cancel | Hide example, legend, Show example action, repeated availability paragraphs, region controls and previous results. Keep prior entries and their state in memory. No fabricated percentage or countdown. |
| Two proposals | **Check the item areas**, full selected image with outlines, resulting proposal cards | **Adjust areas** as a compact secondary action; attribution and line review remain explicit. Technical transcript stays closed. |
| Missing areas | **Choose the item areas**, one sentence: “We couldn't find both items.” | Primary **Set item areas**; secondary **Enter items manually**. Avoid a second failure explanation under a second review heading. |
| Reader failure | **Couldn't read this photo**, concise reason when reliable | Retry, Set item areas, manual continuation. Retain image and all accepted entries. |
| Canceled | Selected image and **Reading canceled** | Read again; existing corrections stay available. Do not auto restart. |

Hide the example as soon as a valid file is selected, rather than waiting for image decoding. Show it again only after removing the image; a selected image must never coexist with a Show example control. Do not hide essential unsupported-recommendation status indefinitely: one small line on the resulting review is sufficient, with full explanation in Methodology. Loading must not announce every OCR stage or transcript.

Stage changes may hide previous forms while retaining them; they must never erase values, confirmations, open disclosures, or focus state. Do not move focus automatically when OCR finishes. A short polite announcement is sufficient. Focus moves only after an explicit user action; opening the crop dialog focuses its heading or adjustment target, and closing returns to its launcher.

## Dedicated area editor

Open a dedicated dialog labeled **Item area 1 of 2**. Work on one area at a time and label it neutrally until attribution is explicitly checked. A geometric left-side seed is not evidence of equipped identity.

Use three compact visual parts:

1. A full-image locator, around 60–90 CSS pixels high on a portrait phone, with active-area outline and visible number. It provides context, not precise selection. An optional tap can roughly reposition the active rectangle, clamped to image bounds; all essential work remains possible through buttons.
2. An enlarged active-area view with some surrounding image, approximately 180–260 pixels high where space allows. Shade outside the rectangle without obscuring its stat text. Boundary lines and active edge remain distinguishable in both skins and do not rely only on color. Include the full stat labels, base values and comparison values in the selection; do not require players to understand OCR column segmentation.
3. The adjustment controls and explicit navigation described below.

Do not fit the enlarged view to a newly changed rectangle on every tap: a stationary edge could appear to move while scale changes, making adjustment hard to judge. Keep scale and view origin stable during a run of nudges. Recenter only if the selected boundary would leave the view, retaining context. A reset or change of active panel can fit the view afresh. Do not stretch the image.

Keep the dialog scrollable at 320×568 and in phone landscape; do not create a fixed-height editor that clips the bottom controls. A compact two-column layout on landscape can put the image beside controls. Full-screen utility presentation is appropriate on small phones, but it should use existing colors/type and not introduce a new visual identity.

## Tap adjustment contract

- Use a labeled native **Adjust** select with **Move area**, **Left edge**, **Right edge**, **Top edge**, **Bottom edge**. This is quieter than five competing tabs. Retain a short visible selected-target label.
- Provide four direction buttons with at least 48×48 CSS pixel targets, spacing and explicit accessible labels such as “Move left” or “Move left edge left.” Disable irrelevant axes for an edge: left/right only for vertical edges, up/down only for horizontal edges. Never invert movement into ambiguous Expand/Shrink wording.
- Use ordinary large steps by default, approximately 1% of original image width/height on the corresponding axis; **Fine adjustment** uses one original pixel. Button taps are sufficient. Do not require press-and-hold, pinch, or simultaneous fingers. A visible short instruction can be “Move the box around all stat lines.”
- Start from a supported detector proposal when available, otherwise an explicitly unconfirmed broad deterministic seed. Permit **Reset this area** to restore the step's initial draft. Do not seed the missing area by duplicating a known region and imply it was detected.
- Keep all canonical geometry in original integer image pixels. Moving preserves width/height. Edge adjustment preserves its opposite edge. Clamp without crossing edges or exceeding the image; maintain a usable minimum region. CSS scaling, DPR and zoom change display mapping only.
- Keep keyboard arrow movement, an explicit fine modifier and Escape cancellation. Native selects/buttons provide the main accessible path; keyboard instructions can live in a closed Help disclosure rather than a paragraph above the image.

Actions: **Next area** on step 1; **Back** and **Read these areas** on step 2. A concise progress label shows 1 of 2 / 2 of 2. **Cancel** is available throughout. Avoid also showing the old Mark area 1/2, Read marked areas and Clear markings controls behind the dialog.

Both rectangles are a transactional draft. Cancel—including Escape—restores both prior committed areas and leaves edited lines unchanged, even after completing step 1. Read these areas explicitly commits valid bounds and starts reading; it still does not confirm item roles or values. If regions coincide or substantially overlap, request adjustment rather than silently reading the same item twice. Never infer separate panels from mere region count.

## Acceptance checklist

- At 320×568,375×812 and phone landscape, both areas can be positioned, resized and submitted using taps on buttons alone. No pixel-precision touch or typed coordinates is needed. No hidden bottom action or horizontal page overflow in either skin.
- All four edges visibly move in the labeled image-axis direction; minimum size, each image edge, rapid repeated taps, coarse/fine steps and CSS scaling preserve original-pixel bounds.
- The active enlarged view is useful for reading stat labels/numbers; it does not oscillate scale on every nudge. Locator remains a context aid, not a mandatory precise target.
- Cancel on step 2 restores both prior areas. Back preserves step 1's draft. Reset affects only the active area. Theme change preserves step, draft rectangles, focus and scroll without reprocessing.
- A new image cancels an old reader and crop session; late results cannot alter current areas. Read failure or cancellation preserves edited item lines. No new automatic confirmation is introduced.
- After upload, neither example nor Show example action is visible. Loading contains only its concise activity content and cancel control, then exactly one relevant resulting/failure state appears.
- Validate the supplied new screenshot as development evidence. Report actual area coverage separately from OCR text accuracy and disclose reused fixtures. A final physical-phone usability check remains the user's meaningful follow-up; local viewport checks can establish layout and interaction logic only.

No additional user preference is needed before implementing this bounded fallback. More complex gestures, freehand handles, rotation and a general image-editing toolbar are unnecessary for this increment.
