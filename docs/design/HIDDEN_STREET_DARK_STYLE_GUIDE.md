# Hidden Street-inspired dark skin

**Status:** Complete visual direction and token proposal; measured contrast verification and final component compositions remain design/QA work.  
**Companion:** `BASILMARKET_LIGHT_STYLE_GUIDE.md` defines the light skin. Both are skins of one shared interface, not separate products.  
**Reference material:** The user-provided Wayback Machine screenshot of Hidden Street and screenshot of [Henesys.gg/maps](https://henesys.gg/maps), reviewed 2026-10-21.

## Design intent

Build a dark, game-database feel that remembers Hidden Street's era and information architecture without recreating its fixed narrow layout, unreadably small type, broken image spaces, exact artwork, or branding. Use Henesys.gg as a modern reference for a charcoal/navy canvas, clear tool navigation, compact searchable data, and a warm MapleStory-orange accent.

The user specifically wants this mode to remain genuinely dark. The archive screenshot's white content column is not a requirement. Use dark body and content surfaces throughout, differentiated by subtle blue/gray elevation. Orange should appear as an unmistakable, restrained MapleStory cue in selected key locations, never as a page wash.

The visual character should be **nostalgic, focused, and legible**: familiar database hierarchy, quiet deep-blue structure, warm orange wayfinding, and the same straightforward comparison task as light mode.

## Reference reading

### Hidden Street archive screenshot

- A narrow centered website sits on a black outer canvas, with blue diagonal texture at the sides.
- A broad sky-and-grass header, cherry tree, and MapleWorld scene provide a playful illustrated identity moment.
- A dark navy horizontal strip separates the header from the page navigation.
- The left column groups many links under blue section headers, giving the site a browsable encyclopedia/database structure.
- The main column is arranged as dated updates/news boxes with blue title strips and simple borders.
- White article surfaces and tiny text in the captured page appear to reflect the original-era site. For our dark skin, keep the information hierarchy but replace white reading surfaces with layered dark surfaces and use current readable type sizes.
- Some large blank areas appear to be missing advertising/media. Do not reproduce them.

### Henesys.gg/maps reference

- The current page uses a very dark charcoal/navy canvas with darker and lighter panels, fine borders, and clear separation between persistent navigation and the central work area.
- A compact branded rail groups search, guides, tools, community, and other destinations.
- The main content uses a breadcrumb, a strong page title, brief supporting text, a wide search field, filter controls, and a compact but readable result list.
- Warm orange appears in the brand and selected action/tab details against the dark neutral surface. The supplied screenshot demonstrates orange as a focused accent rather than the main surface color.
- Pixel icons and game imagery support recognition but remain subordinate to labels and data.

This is a screenshot-derived visual interpretation, not a claim about Henesys.gg's exact CSS tokens, font files, or design system. The current [Henesys.gg map database](https://henesys.gg/maps) confirms the information roles visible in the screenshot: map search, area and map-type filters, a map list, and columns for area, monsters, and levels.

For msIdleCalc, borrow Henesys.gg's dark surfaces, compact data hierarchy, and restrained warm accent only. Do not add its map-table content structure, persistent desktop rail, or unrelated navigation categories to our calculator.

## Shared interface contract

This skin must not change the product's structure or behavior. The light and dark experiences share:

- One page/application document with both light and dark theme token sets available from initial load; there are no separate theme pages or theme routes.
- Identical page organization, text, controls, content, and calculator steps.
- Identical responsive breakpoints, geometry, spacing, typography roles, card dimensions, and component order.
- The same item names, stat labels, verdict language, confidence, warnings, and accessibility names.
- The same theme control, available at every workflow step.
- Immediate in-place skin changes with no refresh, route change, OCR rerun, recalculation, focus loss, state loss, or scroll jump.
- System preference as the initial appearance; an explicit Light/Dark selection overrides and is remembered. A System choice tracks later operating-system preference changes.

Only paint-level styling (colors, surface treatments, border colors, shadows that do not affect dimensions, and low-impact decoration) should change between skins. Keep the same DOM/component order, layout geometry, spacing, typography sizes/line heights, content, and interaction. Use shared semantic components and theme tokens. Both token sets are present when the app loads; switching simply changes the active theme selector/root attribute. Images that are not currently visible may load on demand for performance, but theme choice must not fetch or navigate to a separate page.

For shared measurements, use the [light style guide](BASILMARKET_LIGHT_STYLE_GUIDE.md) as the current source of truth: system sans font family and type roles, 4px spacing base, 8–12px card radii, 70rem starting desktop max-width, and the same 16px small-screen page gutters and responsive component sizes. The [mobile UI research](SIMPLE_MOBILE_WEB_APP_UI_RESEARCH.md) supplies the shared 16px mobile body-text target, responsive spacing scale, 320px reflow requirement, and theme-swap acceptance plan. Where those documents still call values “starting” or “proposed,” retain that status and settle the shared measurement once for both skins; do not fork geometry or type sizes by theme.

Remember the explicit System/Light/Dark choice as a local user preference that survives page reload and calculator reset. System follows operating-system changes until the user chooses Light or Dark. Applying a theme change is an in-place paint update: no refresh, route change, component remount, OCR rerun, recalculation, focus/scroll change, or loss of form state. See the mobile UI research for the full acceptance test.

## Color system

These are **initial design tokens**, not sampled values from either reference. Validate all foreground/background pairs against WCAG AA in the actual UI. Adjust a color if needed for contrast; fidelity to a screenshot never takes priority over readable text.

| Token | Starting value | Purpose |
| --- | --- | --- |
| `--hs-canvas` | `#0D1117` | Deep charcoal/navy page body; avoid featureless pure black |
| `--hs-surface-1` | `#151C25` | Main cards, item panels, and controls |
| `--hs-surface-2` | `#1D2733` | Nested sections, grouped rows, selected neutral surfaces |
| `--hs-surface-3` | `#263545` | Hover, active neutral, and elevated surfaces |
| `--hs-nav` | `#111A25` | Header and persistent navigation background |
| `--hs-nav-group` | `#1B4D76` | Muted Hidden Street-inspired blue group header |
| `--hs-nav-link` | `#142536` | Sidebar or compact menu group surface |
| `--hs-orange` | `#F28C28` | Iconic MapleStory-inspired highlight, selected accent, or key action |
| `--hs-orange-hover` | `#FF9E3D` | Hover/focus fill where contrast is maintained |
| `--hs-orange-pale` | `#3A2818` | Quiet orange-tinted selected or callout surface |
| `--hs-blue` | `#54A6D8` | Links, information, focus-adjacent structure, secondary action |
| `--hs-blue-pale` | `#172A39` | Informational callout background |
| `--hs-green` | `#79C65A` | Positive damage/equip result only when supported by the model |
| `--hs-yellow` | `#E5C35B` | Caution and uncertain state |
| `--hs-red` | `#F07878` | Errors and negative state |
| `--hs-text` | `#F1F4F7` | Primary text |
| `--hs-text-secondary` | `#B8C2CE` | Secondary descriptions and labels |
| `--hs-text-muted` | `#929EAB` | Nonessential metadata only; verify contrast before use |
| `--hs-border` | `#344252` | Card and input outlines |
| `--hs-focus` | `#FFD08A` | High-visibility keyboard focus outline |

### Contrast verification matrix (required before finalizing tokens)

The color values above are proposals; no ratio has been measured yet. The Designer/QA must calculate and record each pair below against the actual rendered colors. Normal text must reach WCAG AA 4.5:1, large text 3:1, and meaningful UI boundaries/focus graphics 3:1 where applicable. If a pair fails, adjust that token before approving the theme.

| Foreground / indicator | Test against |
| --- | --- |
| Primary text `--hs-text` | Canvas, every card surface, nav, input, orange-pale callout |
| Secondary text `--hs-text-secondary` | Every card surface, nav, input, blue-pale callout |
| Muted metadata `--hs-text-muted` | Every surface where it appears; omit the token from any surface where it fails |
| Blue link `--hs-blue` | Canvas, card surfaces, nav, blue-pale callout |
| Orange label/text `--hs-orange` | Canvas, all card surfaces, nav, orange-pale surface |
| Dark label on orange fill | Default, hover, pressed, and disabled orange action fills |
| Green/yellow/red state labels | Each state surface and card/canvas background |
| Border and focus indicator | Adjacent canvas/card/input surfaces, including orange selected controls |

### Orange use rules

- Treat orange as the **brand/action accent**, not as the entire palette. Use two or three fixed roles: (1) a tiny original brand glyph/accent, (2) the current-step or selected-navigation marker, and (3) the single primary CTA when the screen has one. They do not all need to be visually prominent in the same viewport.
- Keep orange to small, intentional areas. Never spread orange across page backgrounds, large panels, whole navigation bars, or long copy.
- Use orange for selection and navigation. Preserve green for a supported positive damage recommendation, yellow for caution, and red for errors. Do not use orange to mean “better gear” by itself.
- Use orange text on dark surfaces only when contrast passes; otherwise use orange as a fill with a dark, high-contrast label, or use it on a neutral badge with readable text.
- Avoid orange body text, large orange cards, full-width orange header bands, and orange backgrounds under long text.
- Do not use or recreate the MapleStory wordmark, leaf logo, Mushroom icon, or other official brand graphics as a shortcut for the accent. Use a plain msIdleCalc wordmark and original abstract treatment.

## Typography and hierarchy

Use the same type families, sizes, weights, and line heights as the light skin. The dark skin must not become denser or smaller. Recommended starting family remains `system-ui, "Segoe UI", Arial, sans-serif`.

- **Display/page heading:** bright near-white, sturdy weight; one clear task heading.
- **Section headings:** near-white with blue or orange marker/edge, not entire text blocks in saturated accent colors.
- **Body and form labels:** light gray/near-white with comfortable line height; target 16px on phones for normal text.
- **Stat values:** near-white, semibold, tabular numerals; align values by column/row.
- **Links:** accessible blue or orange treatment plus underline or another non-color cue where needed.
- **Metadata:** secondary gray only for genuinely nonessential data. Never place confidence, errors, formula limitations, or required context in low-contrast tiny text.
- **Pixel/novelty lettering:** optional decorative micro-accent only; never for UI labels, stats, buttons, navigation, or explanations.

Keep recognizable MapleStory nostalgia in color and a restrained illustration or sprite accent, not in novelty fonts or low-contrast retro text.

## Layout, spacing, and surfaces

- Reuse the shared 4px spacing base and responsive scale: `4, 8, 12, 16, 24, 32, 40, 48, 64px`.
- Reuse the same max-width, mobile gutters, responsive breakpoints, item panel geometry, radii, and component sizing as light mode.
- Use a deep navy-charcoal canvas with slightly raised card surfaces. Make cards distinct through subtle changes in surface tone, thin borders, and restrained shadows; do not use large bright borders or heavy bevels.
- Keep desktop content comfortably wide and use the same responsive main content column as light mode. On mobile, stack the panels in the same order and spacing as light mode.
- Maintain the same readable density recommendation: friendly cards for task blocks, compact stat rows where comparison benefits from them. Do not recreate Hidden Street's fixed narrow page or tiny dense columns.
- Use subtle blue separators or group headers to echo Hidden Street's category navigation. Apply them to logical groups only, not every individual row.
- Avoid pure black as the card and page color at once; multiple near-black levels improve separation and content tracking.

## Shared component treatments in dark mode

| Component | Dark-skin treatment |
| --- | --- |
| **Top brand header** | Same height and position as light mode; dark navy surface, plain-text msIdleCalc identity, and a tiny original orange mark/accent. No copied Hidden Street masthead/tree art or Nexon/MapleStory logo. |
| **Primary navigation** | Same destinations and order as light mode. Use dark surfaces and clear labels; selected location gets a slim orange marker. Avoid an old dense fixed sidebar on mobile. |
| **Theme control** | Same always-reachable position and dimensions. Clearly labeled System / Light / Dark selection; dark component styling and visible focus. It remains available at every step and while scrolling without obscuring fields/results. |
| **Progress cue** | Same step count, wording, location, and geometry. Use orange for the current-step marker, blue/gray for completed/upcoming states, with labels and shape as well as color. |
| **Upload panel** | Dark card with subtle border; same controls as light mode, clear file chooser and manual-entry option. Orange/blue affordance can highlight selection, not replace text. |
| **Item cards** | Dark raised surface with unchanged geometry. Small curated sprite in a fixed box beside item name; name and all item data remain text. Keep current/candidate labels explicit. |
| **Stat comparison rows** | Raised or inset surface with thin dividers, bright values, secondary labels, and aligned tabular numbers. Positive/negative/equal requires text/icon semantics as well as color. |
| **Primary action** | One main CTA may use an orange fill with a verified high-contrast label; use the same action placement and size as light mode. Secondary actions stay neutral/blue. Avoid orange on every button. |
| **Result/verdict panel** | Highest visual hierarchy after page title. Keep surface dark; supported positive verdict may use green, close/uncertain neutral blue-gray, errors red. Orange may identify the active result section but not encode outcome. |
| **Callouts** | Dark blue for information, dark gold/orange for neutral announcement, yellow for caution, red for blocking errors. Pair color with a heading/icon and plain-language message. |
| **Footer** | Same structure and placement as light mode; muted surface, readable links, fan-made/unofficial notice. It should not compete with the calculator. |

## State, accessibility, and mobile behavior

- Set 44 × 44px as the project target for primary touch controls, especially sequential actions and the theme control. Provide spacing and visible focus indicators for adjacent controls.
- Check dark-skin contrast pair by pair: text/surface, muted labels/surface, links, orange buttons, green verdict, errors, borders, and focus indicators. Do not infer contrast from hue or perceived brightness.
- Do not rely on orange/green/blue alone to communicate selected, positive, uncertain, or invalid states. Use labels/icons/patterns.
- Maintain visible focus rings in every surface state. Do not let orange focus indication merge into the selected orange control; use the dedicated focus token and an outline that contrasts with both.
- Preserve keyboard access, screen-reader names, zoom/reflow, and responsive behavior exactly as in light mode.
- Respect `prefers-reduced-motion`. A brief color transition is optional; content geometry must not move during the skin change.
- Keep the OS/browser's own input rendering legible by setting the page color-scheme correctly and checking native selects, file inputs, and scrollbars.
- If a sprite or background illustration fails, the same text hierarchy and controls remain visible with no layout shift.

### Component state mapping

| State | Treatment |
| --- | --- |
| Default control | Surface 1 with primary text and a visible border where needed |
| Hover | Surface 2/3 lift; do not rely on hover for information or affordance |
| Pressed | Surface 3 or a darker/stronger same-hue treatment, with a perceptible state change |
| Keyboard focus | Dedicated focus outline that contrasts against both the component and its surroundings; preserve component geometry |
| Disabled | Muted surface and label plus disabled semantics; ensure the reason is available in text when not obvious |
| Selected/current | Slim orange marker plus text/shape/state semantics; do not color the whole page or confuse it with a positive verdict |
| Input error | Red border/icon and adjacent explanatory text; focus the first invalid field after submission without losing values |
| Input success/confirmed OCR | Neutral confirmation mark and explicit “Confirmed” text when useful; do not assume green means damage improvement |
| OCR uncertainty | Plain-language uncertainty label and correction action; keep confidence readable and close to the field |
| Loading | Stable skeleton/progress message within fixed dimensions; no layout shift and announce status accessibly |
| Empty/no result | Helpful explanation and next action on the same shared surface geometry; optional small sprite only as decoration |
| Equal/close comparison | Neutral blue-gray treatment and explicit “About equal” / “Too close to call” language |
| Positive recommendation | Green is reserved for a supported damage/equip recommendation, paired with text and reasons |
| Caution/warning | Yellow/gold marker, clear heading, and action needed if any |
| Blocking error | Red marker plus concise error and recovery path |

## Designer composition pass still required

This guide completes the visual direction and token proposal; it is not a finished wireframe or a measured contrast certification. Before handoff to implementation, sketch or specify these shared components once in the light guide, then annotate their dark paint treatments here:

1. Responsive top header with always-reachable theme control.
2. Progress cue and Back/Continue action placement.
3. Screenshot upload/manual-entry start panel.
4. Stacked mobile current/candidate item cards and fixed sprite box.
5. Compact aligned stat rows and correction controls.
6. Result/verdict panel with confidence and progressive disclosure for factors/sources.
7. Footer and notice hierarchy.

The same composition must carry across themes. Do not create a dark-only rail, map table, or different page hierarchy to imitate Henesys.gg.

## Do / avoid

### Do

- Use near-black charcoal/navy canvas and layered dark cards to meet the user's request for actual dark mode.
- Carry Hidden Street's blue category hierarchy into small, organized group cues.
- Use orange sparingly in recognizable, high-value design positions.
- Keep component sizes, order, typography roles, spacing, flow, and state identical to light mode.
- Let the calculator and its data remain more prominent than its decorative art.
- Apply contrast and accessibility checks separately to every theme token combination.

### Avoid

- White or pale-gray main content cards as the dominant body surface in dark mode.
- Treating a black background alone as a complete dark theme.
- Covering the screen in orange or using orange as the damage-positive color.
- Copying Hidden Street's exact logo, header art, cherry tree, page layout, or site branding.
- Reproducing the archive's tiny text, ad-shaped empty gaps, narrow fixed page, or crowded sidebar.
- Making a separate dark-mode page or resetting user progress when the skin changes.

## Designer handoff and acceptance checklist

- [ ] The mode reads as genuinely dark across page body, content panels, form fields, cards, and footer.
- [ ] It recalls Hidden Street through blue grouping and game-database structure without cloning the old website.
- [ ] Orange is present in a few deliberate locations, feels MapleStory-adjacent, and does not overwhelm the UI.
- [ ] All components have the same size, placement, copy, spacing, and behavior as light mode.
- [ ] The theme control is always reachable, labeled, and usable with keyboard and screen reader.
- [ ] Switching at every flow step changes paint only and preserves DOM/component order, geometry, file, OCR state, corrected data, current step, focus, expanded details, computed result, and scroll position.
- [ ] Every important color pairing meets WCAG AA; screenshot-derived token estimates are changed if they fail.
- [ ] Primary touch targets meet 44 × 44px where practical, especially sequential actions and the theme control.
- [ ] Sprites have fixed containers and text names; broken/missing images do not shift layout or remove meaning.
- [ ] 320px reflow, 200% text resize, keyboard, reduced motion, and all error/loading/result states are reviewed in this skin.

## Reference sources

- User-provided Hidden Street Wayback screenshot — archival visual reference. The screenshot itself is provided in conversation and is not copied into the repository as an asset.
- [Henesys.gg Maps](https://henesys.gg/maps) — modern MapleStory database reference. Reviewed live page roles: title, searchable maps/monsters/NPCs, filters, and compact result list; visual impression also informed by user's screenshot.
- [Mobile web app UI research](SIMPLE_MOBILE_WEB_APP_UI_RESEARCH.md) — shared layout, sizing, accessibility, state preservation, and theme behavior.
- [BasilMarket-inspired light style guide](BASILMARKET_LIGHT_STYLE_GUIDE.md) — companion light mode and shared UI components.
- [Nexon brand site](https://brand.nexon.com/) — confirms Nexon maintains MapleStory brand assets; used only to reinforce not copying official logo assets into the skin.
