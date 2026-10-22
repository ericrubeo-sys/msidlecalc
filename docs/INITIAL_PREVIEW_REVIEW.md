# Initial preview — 2026-10-22

## Scope

The user requested an initial page pushed to GitHub for a Vercel go-live check, designed to grow into the planned comparison tool. This is a manual stat-difference workbench, not a validated damage calculator. No deployment or DNS changes were made by this implementation task.

## Implementation

- Buildless HTML/CSS/native JavaScript modules, with zero runtime dependencies, no account/database/analytics, and no remote fonts or art.
- Original geometric adventure illustration and favicon; no copied game or fan-site assets.
- Shared responsive layout with warm blue/green light skin and charcoal/navy dark skin with a restrained orange action. System preference by default; explicit appearance selection is persisted independently of item data.
- Six editable raw stat lines per item, optional item names, Boss/Chapter context, sample values explicitly marked as invented, blank-as-unknown handling, and client-side validation.
- Pure comparison logic returns raw deltas and an unavailable damage model with Low confidence, no winner, and no percentage damage change. Percentage lines use percentage points. Activity does not silently change the arithmetic.
- Screenshot selection is a local reference preview only (PNG/JPEG/WebP, up to 10 MB); automatic text recognition is explicitly unavailable. Object URLs are released on replacement/removal. No screenshot is sent to a processing service.
- Vercel serves only `public/`. Documentation, scripts, and tests remain outside the website output.

## Checks performed

- `node --test tests/comparison.test.mjs`: four tests passed, covering no inferred damage winner, missing versus zero values, swap/equality/activity invariants, and rejected invalid inputs.
- `node --check` passed for the UI, theme, and preview-server scripts.
- `node scripts/check-colors.mjs`: 22 foreground/background pairs per theme passed their text or non-text thresholds. Lowest checked ratio: light 3.43:1 (control boundary), dark 4.66:1. Focus rings have a 4px gap and were checked against surrounding surfaces. This is a token check, not a complete accessibility audit.
- Local HTTP requests returned 200 for the page, CSS, theme script, UI module, domain module, and favicon.
- In-app browser: inspected both themes; loaded sample values; confirmed the expected +15 Attack, -5 Main Stat, -4 percentage-point Critical Rate, +8 percentage-point Critical Damage, equal Accuracy, and +1 skill level. Damage recommendation remained unavailable.
- Browser theme changes preserved current inputs and the displayed result. Reset cleared entries and restored the empty result. Empty comparison and negative-stat validation produced visible messages and focused an input.

## Still to verify / implement

- Vercel production/preview deployment, custom domain, HTTPS, and hosting behavior are not yet confirmed.
- Dedicated 320px, 200% text zoom, device/browser matrix, full keyboard/screen-reader audit, screenshot error/file-picker cases, and rendered contrast beyond checked token pairs remain to be reviewed.
- Validated mechanics, character context, optional extra stat lines, OCR, and final sprite selection remain future work. No numerical DPS/equip claim should be made from this preview.
