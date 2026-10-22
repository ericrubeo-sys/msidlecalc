# BasilMarket-inspired light skin

**Status:** First-pass design direction for msIdleCalc. Treat this as a translation of visual principles from the two user-provided screenshots, not a reproduction of BasilMarket.

**Theme contract:** This is one skin of a single shared page/application, not a separate light-mode page. Both light and dark token sets are available from initial app load; only the active root theme changes. A matching dark skin will come from the user's Hidden Street references. Switching skins must be immediate, require no refresh or route change, and preserve the user's current step, entered/corrected/calculated data, selected items, focus, and scroll position. Default to the operating-system color preference; let users override it in the app and remember that choice.

## The essence to preserve

The strongest thread between the two screenshots is **a friendly fan community wrapped around a useful game utility**. It feels unmistakably game-adjacent through a playful illustrated masthead and small item imagery, while the core information remains easy to scan in familiar web structures: navigation, colored section bars, cards, tabs, and compact rows.

The newer screenshot modernizes that idea with a sky-colored logo area, charcoal navigation, a saturated blue search/hero panel, crisp white cards, and fresh green actions. The Wayback screenshot has the older fan-site character: centered narrow page, pixel-world masthead, dense bulletin tables, bright blue section bars, green sidebar headers, pale yellow notices, and small game-item grids.

For msIdleCalc, keep the **warmth, blue-and-green identity, game-world touch, and clear utility hierarchy**. Update the density and type sizes for mobile comfort. The user's equipment comparison should be the star, not a copied marketplace layout.

## Visual principles

1. **One playful brand moment, then useful clarity.** Use an original, small Maple-adventure-inspired illustration or motif in the header. Keep calculator controls and results calm and clean.
2. **Blue names the information; green marks a positive action or outcome.** Use blue for section hierarchy and the main interaction. Reserve green for an affirmative action, verified/beneficial state, or “equip” recommendation, with a text label and icon as well.
3. **Warm neutral canvas, white working surfaces.** A soft off-white page background should make white cards feel like a readable work surface, without looking clinical.
4. **Use friendly cards with compact comparison rows.** Follow the newer screenshot's approachable card organization, then use the older screenshot's compact rows for item stats where scanability matters. Keep stats readable, not cramped, and preserve generous touch targets.
5. **Use a few carefully chosen game sprites as accents.** The Designer will eventually select a small set of MapleStory equipment, character, or monster sprites that feel at home in this BasilMarket-inspired light mode. Show an equipment thumbnail beside the item name during scan review and comparison when it helps confirm recognition. Use an occasional sprite in a section accent or empty state. Keep artwork out of controls, dense stat rows, and critical status indicators; use text and shape for meaning. Provide a consistent thumbnail box and graceful placeholder so images cannot shift layout or block the flow. Do not use BasilMarket's logo, mascot, or art. Sprite use and source must pass the project's rights review before production.

## Typography

### What the screenshots suggest

- The newer page uses a friendly, sturdy sans-serif: heavy white headline, small uppercase eyebrow, compact bold navigation, and readable card headings.
- The older page has a much denser early-web feel with tiny labels and mixed-looking text. At the supplied screenshot scale, the exact font families cannot be identified reliably.
- Font identification here is an expert visual estimate only; do not describe any family as BasilMarket's confirmed font without inspecting its source files.

### msIdleCalc recommendation

- **Primary UI:** `system-ui, "Segoe UI", Arial, sans-serif` for dependable rendering and readable controls.
- **Optional display accent:** use a rounded, friendly display face only if it is locally bundled/licensed and remains readable; otherwise use the primary UI face at heavier weight.
- **Pixel type:** decorative only, for a tiny eyebrow or badge at most. Never use pixel type for stats, explanations, navigation, or buttons.
- **Numbers:** use tabular numerals for stat values and deltas (`font-variant-numeric: tabular-nums`) so columns align.

### Type scale and modifiers

| Role | Starting size | Weight / treatment | Use |
| --- | ---: | --- | --- |
| Eyebrow | 0.7rem / 11–12px | 700, uppercase, 0.12em tracking | Activity or item category above a title; brief like the “MAPLESTORY CLASSIC” label |
| Page title | clamp(1.65rem, 4vw, 2.25rem) | 750–800, tight line-height | One clear task title |
| Section title | 1.05–1.2rem | 700–750 | Blue section bar or card heading |
| Item name | 1rem | 700 | Equipment names; allow wrapping |
| Body / helper | 0.9–1rem | 400–500, line-height 1.45–1.6 | Instructions and reasons |
| Stat label | 0.85–0.95rem | 500–600 | Stat names, labels, context fields |
| Stat value | 0.95–1rem | 650–700, tabular numerals | Numbers, deltas, formula factors |
| Metadata | 0.75–0.8125rem | 400–500 | Version, source, timestamp, quiet status |

Keep all essential text at least 14px on narrow screens. Use color and weight to create hierarchy; avoid underlining or all-caps for long copy.

## Color system

The hex values below are **recommended starting tokens derived by eye from the screenshots**, not exact sampled values. Validate them against actual UI text and contrast before implementation.

| Token | Starting value | Purpose |
| --- | --- | --- |
| `--bm-sky` | `#A9CDEB` | Header atmosphere / subtle top gradient |
| `--bm-blue` | `#17699F` | Brand blue and primary section titles |
| `--bm-blue-strong` | `#2377BE` | Primary button, active tabs, prominent bar |
| `--bm-blue-deep` | `#174F75` | Hover/pressed blue, selected dark accent |
| `--bm-blue-pale` | `#E7F1F8` | Information callout and light selected state |
| `--bm-green` | `#82AE3D` | Positive accent, success/action cue |
| `--bm-green-pale` | `#EAF2DE` | Positive background or understated badge |
| `--bm-charcoal` | `#303234` | Navigation and dark framing |
| `--bm-page` | `#F3F2ED` | Warm light page background |
| `--bm-surface` | `#FFFFFF` | Cards, forms, comparison panels |
| `--bm-ink` | `#20252A` | Primary text |
| `--bm-muted` | `#68727B` | Supporting text and metadata |
| `--bm-border` | `#D8DCD9` | Card and control outlines |
| `--bm-notice` | `#FFF7BE` | Quiet announcement or caution strip |

Use blue for navigation hierarchy and actions, green for positive meaning, and pale yellow only for small announcements or non-blocking notices. Never rely on blue/green alone to encode the verdict. Include a visible label such as “Equip the new item” and retain a readable explanation.

## Header and navigation

- Use a low-height sky header with an original, small illustrated motif and a plain-text msIdleCalc wordmark. Avoid the BasilMarket logo composition, character art, or copied masthead.
- Place primary navigation in a charcoal band beneath the brand. Use 3–5 short destinations at most; the calculator remains the main destination.
- On mobile, avoid squeezing desktop navigation. Use a compact menu or a short, scrollable set of clearly labeled links with adequate touch targets.
- Keep the theme control available throughout the comparison flow, not only on the landing screen or settings page.
- A subtle utility strip can carry a version/status or one brief note, echoing the old site's announcement stripe. It must not push the task below the fold.

## Page structure and components

- Center the work in a responsive container: start around `max-width: 70rem` on desktop, then use near-full width with consistent side padding on mobile.
- Use a single main column for the comparison flow. Desktop can show current and candidate item cards side by side; mobile stacks them in the order the player sees in-game.
- Give section titles a blue bar or blue heading treatment. Keep green as a secondary accent so the whole page does not become a marketplace clone. Favor the modern card organization of the newer screenshot; use compact rows inside the comparison where they help users scan stats.
- Use white cards with a thin warm-gray border, small radius (8–12px), and a very light shadow only when separation needs help.
- Preserve the old screenshot's easy-to-scan rows for extracted stats: aligned labels and tabular values, one stat per row, clear positive/negative/equal treatment.
- Use a pale yellow strip for temporary notices only. Use pale blue for neutral instructions and source/method notes.
- Item thumbnails should be small enough to support identification, not dominate comparison. Put them beside item names in scan review and result panels, with occasional small decorative use elsewhere. Keep item names, stat lists, corrections, and verdicts available as accessible text. Use a fixed thumbnail container and placeholder. The Designer chooses the limited sprite set for this light mode; candidates may be researched/prototyped through MapleStory.io by game version and item ID.

## Verdict and interaction states

- Make the recommendation the strongest element after the page title: an explicit sentence, confidence label, then 2–4 supporting factors.
- Use green for a positive recommendation only when the result supports it; use a neutral blue/gray for close or low-confidence results. Pair every state with words and an optional icon.
- Show confidence as **High / Medium / Low** with a brief reason. Do not use a percentage unless it is calibrated and supported by evidence.
- Keep edit/correct actions adjacent to OCR-extracted item data. Clearly distinguish recognized text from user-confirmed values.
- Use visible focus rings, readable inline validation, and clear disabled/loading states.

## Footer

Neither supplied screenshot shows enough of the page footer to infer BasilMarket's footer design. Do not invent a claim about it. For msIdleCalc, use a quiet, compact footer separated by a thin border with links to **About**, **Sources & assumptions**, and **Privacy**, plus a concise fan-made / unofficial notice. Keep it below the calculator and out of the primary action path.

## Do / avoid

### Do

- Keep the color family, generous blue headers, cheerful green highlights, subtle sky-world cue, and community-tool directness.
- Use clear, repeatable cards and rows so item stats can be compared quickly.
- Use original illustration and restrained, designer-curated MapleStory sprite accents once their use is cleared.
- Keep text and controls mobile-readable and accessible.

### Avoid

- Copying the BasilMarket logo, mascot, page geometry, marketplace cards, or distinctive visual assets.
- Copying MapleStory/Nexon game sprites or branding into the site without rights review.
- Reproducing the legacy screenshot's tiny type, cramped columns, broken-image boxes, or fixed narrow desktop width.
- Turning the calculator into a sale/listing marketplace; the goal is one equipment decision.
- Treating green as an unconditional “good” color when confidence is low or outcomes are close.

## Designer handoff checklist

- [ ] The top of the page feels playful and fan-made while the calculator remains the focus.
- [ ] The main type, stats, correction controls, confidence, and footer links remain readable at 320px width.
- [ ] Desktop item cards can be compared side by side; mobile cards stack in a sensible reading order.
- [ ] Contrast and focus states work; color is not the only signal for verdict or errors.
- [ ] Any MapleStory sprites are a small, intentionally selected set, fit this skin, and have passed rights/source review; all other illustration and icons are original or properly licensed.
- [ ] The style feels inspired by BasilMarket without looking like a clone.
