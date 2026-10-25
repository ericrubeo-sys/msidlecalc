# Automatic equipment metadata and simpler recommendations

2026-10-24 follow-up on feature/source-linked-damage-model. The user authorized the live-test workflow; this release removes redundant questions without changing the combat equations.

## Behavior

- Flat Attack uses the corrected panel order: upper/first is Main, lower/second is extra. Both remain inputs to replacement. Spatial OCR evidence precedes retained row ordinals; manual rows use entered order. An optional Advanced item correction retains explicit overrides. More than two unidentified Attack sources stay blocked.
- Read yellow filled stars from the original image above both stat crops. Adopt only two distinct, aligned, credible matching header counts. Gray, missing, clipped, malformed, conflicting and insufficiently distinctive evidence stays unknown. Manual Star Force corrections override subsequent reads. A new image clears automatic evidence, preserving manually entered player values.
- Remove three mandatory model-condition checkboxes. The plain scope notice and optional Why & limits describe the modeled scenario; internal scenario flags are not presented as user attestations. Item confirmations remain required.
- Show one row per activity with Current equip (left), New equip (right), or No reliable preference, plus confidence. Remove the duplicate ordinary-normal/boss diagnostic rows from the visible results. Do not show a score or numerical change.
- Give unsupported changed effects and inconsistent character totals a concrete reason. PvP remains explicitly unmodeled. Do not weaken eligibility or invent a winner to clean up the screen.

## Verification

- 345 software tests passed, including 21 independent metadata groups. The independent specialist identified four raster-reader defects and two integration UX defects; repaired and rerun. See AUTOMATIC_METADATA_QA.md.
- Original private ring screenshot locally imported in a fresh browser session: automatic Attack roles, both card confirmations, no essential checkboxes, shared12-star adoption and an explicit Main Stat/skill blocker verified. The image was not committed or sent to an OCR service.
- Synthetic shoulder pair with total Attack50000, Rate50%, full Critical Damage200%, Boss Damage0%, Star Force12 and deliberately known resistance0%: all six modeled PvE activities favor Current, PvP abstains. These are invented software inputs, not player measurements. Attack5000 produced an inconsistency explanation rather than a winner.
- Browser adoption and synthetic arithmetic do not establish live-game predictive validity, universal OCR reliability or physical-phone usability.

## Limits unchanged

Star Force amplification data covers12–30. Below12, require displayed Main/Sub amplification values through Advanced; no missing curve is invented. Very short yellow prefixes may stay unknown. Changed Main Stat, job/skill/timing effects, full PvP and encounter mechanics remain incomplete. The simple offensive estimate remains experimental and Low confidence; unknown resistance/source stages can reverse or erase a preference.

Publication identity and live smoke results are recorded after deployment verification.
