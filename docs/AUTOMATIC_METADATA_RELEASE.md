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

## Release state

Feature implementation commit717d0b3 passed [GitHub verify CI](https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40147196115/job/121030956535). Local public-source build is7d826fb56529.

Vercel rejected the feature preview at2026-10-25T00:34:03Z with exactly “Deployment rate limited — retry in24 hours.” The integration status redirects to the hosting team's build-rate-limit notice. No successful preview or production release of this change is claimed. Do not retry repeatedly, upgrade billing or bypass the limit. Main remains at the preceding tested release91970b5; this change stays on the feature branch pending a successful preview and authorized publication retry. Local browser preview remains available at http://127.0.0.1:4181/ while its local server runs.

Additional browser retention check: changing Star Force to13 in Advanced and rereading the same real image preserved13 and removed the automatic-evidence notice after both cards were confirmed. This is a synthetic override test, not a claim that the screenshot has13 stars.
