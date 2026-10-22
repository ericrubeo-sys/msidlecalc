# Simple mobile web app UI research

**Prepared:** 2026-10-21  
**Audience:** msIdleCalc Designer, Builder, UX Specialist, and QA Breaker  
**Purpose:** Reusable mobile-first UI guidance for the BasilMarket-inspired light skin and, later, the Hidden Street-inspired dark skin. This is a product-specific design brief informed by platform guidance and accessibility standards; it is not a visual theme by itself.

## Executive design direction

Design msIdleCalc as a **single-purpose, mobile-first service**. On a phone, a player should be able to upload or choose a comparison screenshot, correct the recognized item information, answer only the context questions that matter, and understand the recommendation without learning a dashboard or scrolling through unrelated features.

Use a strong reading order, few competing controls, short sections, and progressive disclosure for optional details. Apple’s layout guidance recommends grouping related content, making essentials easy to find, aligning components, and revealing secondary detail progressively. The GOV.UK Design System similarly treats patterns as task-focused solutions and includes patterns for checking answers and recovering from errors. [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) · [GOV.UK Design System: Patterns](https://design-system.service.gov.uk/patterns/)

Keep **structure and interaction identical across themes**. Light and dark mode may change colors, surfaces, borders, and small decorative treatments; they must not change page organization, wording, controls, data, or task flow. The theme switch should update immediately without refresh and preserve the user’s position and all work in progress. Let the operating-system preference choose the initial appearance, provide an explicit in-app Light / System / Dark choice, and remember an explicit override. The web platform exposes system color preference through `prefers-color-scheme`; system-style controls can follow the chosen page color scheme. [MDN: `prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-color-scheme) · [MDN: `color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme)

## Proposed mobile foundation

These values are recommended starting tokens for msIdleCalc, not universal rules. Tune them against the real screens and test with users.

### Layout and spacing

- Design the narrow layout first and confirm it reflows at **320 CSS pixels** without two-dimensional scrolling for normal content. WCAG 2.2 Reflow uses 320 CSS pixels as the benchmark for vertically scrolling content. [WCAG 2.2: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- Start with a **4-pixel spacing base** and use a small consistent scale: `4, 8, 12, 16, 24, 32, 40, 48, 64px`. Use 12–16px for related control groups, 24–32px between major sections, and 32–48px around major page regions. GOV.UK also uses a responsive spacing scale that contracts some larger gaps on small screens. [GOV.UK: Spacing](https://design-system.service.gov.uk/styles/spacing/)
- Use 16px minimum page gutters on small phones; increase to 20–24px as width allows. Keep primary content in one column until there is comfortable room for side-by-side content.
- Use fluid container widths with a readable desktop maximum. Do not lock the mobile page to desktop widths or fixed heights.
- Breakpoints should be driven by content fit rather than named devices. A 640px tablet threshold can be a first experiment, not a hard design law; the layout should remain stable as the viewport changes.
- Avoid horizontal scrolling for the main comparison. Stack current and candidate item cards on narrow screens; switch to a side-by-side comparison when the layout has room.

### Type and legibility

- Use a familiar system sans-serif for interface text. Establish a compact, consistent type scale and prioritize reading comfort over decorative nostalgia.
- Start body and form text at **16px** on phones; helper labels should remain comfortably readable and not become tiny metadata. Keep long explanations to short paragraphs and bullets.
- Use sentence case for labels and actions. Give each screen one clear heading and a short explanation of the next action.
- Keep numeric stats aligned with tabular numerals. Pair labels with values so a number never relies on color or position alone.
- Support browser zoom and enlarged text. At 200% text resize, content must not be clipped or require horizontal scrolling for ordinary content. [WCAG 2.2: Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- Use WCAG AA text contrast as a minimum: 4.5:1 for normal text and 3:1 for large text. Verify each theme separately; a light palette passing does not imply the dark palette passes. [WCAG 2.2: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)

### Controls and touch behavior

- Make primary mobile buttons at least **44 × 44 CSS pixels** where practical, with visible spacing between adjacent actions. WCAG 2.2 AA sets a 24 × 24px minimum with exceptions; 44 × 44px is the stronger enhanced target and aligns with Apple’s iOS guidance. [WCAG 2.2: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) · [WCAG 2.2: Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) · [Apple HIG: Designing for Games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games/)
- Put frequent actions within easy thumb reach while respecting browser and device safe areas. Keep a clear focus indicator for keyboard users; do not remove outlines without a visible replacement.
- Use text labels for important actions such as **Choose screenshot**, **Continue**, **Correct item**, and **Compare items**. Icons can reinforce these labels but should not replace them when meaning is not universally obvious.
- Provide clear pressed, loading, disabled, success, and error states. Use words and iconography in addition to color.
- Avoid gesture-only interactions, drag-only corrections, hover-only tooltips, and controls that require precision tapping.

## Task architecture for msIdleCalc

The interface should make the product's core journey visible and keep each step focused:

1. **Start comparison** — Explain the tool in one sentence and offer screenshot selection plus a clear manual-entry alternative. State that screenshot processing happens locally if that remains the implementation.
2. **Review and correct** — Show the recognized current and candidate item as separate cards. Place small, curated item sprites beside item names when they help recognition. Expose editable stats and mark what was read versus confirmed.
3. **Add comparison context** — Ask only questions needed for this calculation. Put rare/advanced fields behind a clearly named optional section. Explain why a field matters at the point of use.
4. **See result** — Lead with a plain-language recommendation, confidence level, and a few factors. Keep assumptions, formula details, and sources available without overwhelming the primary answer.

Use a compact progress cue such as “Step 2 of 4 · Review items” with clear back/continue actions. Do not make users lose entered data when they go backward, switch themes, or correct an earlier answer. Save transient state in the active page session; avoid adding accounts or server-side storage solely to support this flow.

### Screenshot intake and form usability

- Use the native file chooser, and make its action obvious. Explain acceptable image types and what happens after selection.
- Show an immediate preview and a clear way to replace/remove the file. Provide an example screenshot or manual entry path if the upload fails.
- Never treat OCR as authoritative. Visually distinguish recognized values from user-confirmed/corrected values, and focus the first uncertain field without trapping the user.
- Associate every input with a persistent label; do not rely on placeholder text as the label. Provide inline error text adjacent to the field and a concise summary when several fields need attention.
- Preserve the user’s corrections if validation fails. Errors should say what to fix and how, not merely “invalid.”
- On mobile, use suitable input types, autocomplete/input modes when relevant, and keep the focused field visible when the on-screen keyboard appears.

### Comparison and result design

- Use the modern BasilMarket screenshot’s friendly card organization with compact, aligned stat rows inspired by the older reference. Keep the calculator as the focal point, not the decorative art.
- On phones, stack the two item panels in a predictable order and label them **Currently equipped** and **Candidate**. Avoid tiny side-by-side columns. On wide screens, cards may sit side by side while the labels and reading order stay clear.
- Show small item sprites beside the item name, inside fixed-size image boxes with a text label and a fallback placeholder. Treat artwork as enhancement, never as the only way to identify an item.
- State the recommendation in words, then show confidence and the main reasons. Use green/blue/neutral treatments as reinforcement; never encode equip/replace/equal or confidence by color alone.
- Keep the core result visible before advanced formula detail. Provide disclosure for assumptions and evidence so interested players can inspect why the tool reached its conclusion.

## Theme system requirements

- Implement one semantic component system and one page/application document, not two independently laid out pages, duplicated page trees, or routes for themes.
- Ship both light and dark token sets with the app so either skin is available from the initial load. Select the active token set before first paint from the saved preference or system preference; after that, switching changes only the active theme selector/root attribute. Do not navigate, reload, fetch a second page, or rebuild the app to switch skins. Individual decorative image assets may still load only when needed to avoid unnecessary bandwidth.
- Define shared tokens for spacing, typography, borders, radii, elevation, and component dimensions; map theme-specific tokens for canvas, surface, text, border, primary, positive, warning, and focus colors.
- Switching themes must update CSS tokens in place: no route reload, no remount that loses form state, no scroll jump, and no re-run of OCR/calculation unless a separate user action requires it.
- The default mode follows `prefers-color-scheme`. Offer **System**, **Light**, and **Dark** choices; an explicit user selection takes precedence and should persist locally. If still set to System, respond live when the operating-system preference changes.
- Ensure each mode remains legible, including the system file picker/browser controls where supported. Declare supported color schemes so built-in controls can render appropriately. [MDN: `color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme)
- Respect `prefers-reduced-motion`. Use a restrained short transition for color changes if it feels helpful, and disable that transition for reduced-motion users. Never animate layout or shift content during a theme swap.
- Keep brand identity across modes through the same geometry, type roles, component structure, illustrations, sprite placements, and copy. Change the palette and surface styling only where possible.

## Visual system and brand restraint

- Keep the user's supplied BasilMarket guide as the source for the light skin’s warm background, crisp cards, blue hierarchy, green positive cue, and restrained playful accents.
- Later, map the user's Hidden Street screenshots to dark-mode tokens and decorative details without changing layout or behavior.
- Select a small, deliberate sprite set after the user/designer reviews it. Avoid large galleries, copied logos/mascots, decorative clutter, and sprite-led navigation.
- If a sprite fails to load, the layout and meaning must remain intact. Use a neutral placeholder or no image.
- Reserve strong color for actions and states. Keep the main canvas calm, ensure focus and error states remain conspicuous in both skins, and validate contrast after color adjustments.

## Designer scrutiny checklist

The Designer should use this report to challenge the existing BasilMarket light guide and resolve or document:

- Is the top-of-page brand moment compact enough that the first meaningful comparison action appears quickly on a phone?
- Does the card/row mixture let a first-time player compare stats without dense tiny text or excessive scrolling?
- Are upload, replace, correction, and manual-entry alternatives immediately understandable?
- Are the sprite count and exact placement helping recognition without competing with names, stats, or the verdict?
- Are progress, back/continue, and current step clear, without making the calculator feel like a long form?
- Does the theme control remain available throughout the flow, and can every state be skin-switched without any content/state/scroll changes?
- Are the suggested spacing and typography tokens consistent and responsive at 320px, 375px, tablet widths, and desktop?
- Can every primary action be comfortably tapped and operated with keyboard and assistive technology?
- Are confidence, equality, uncertainty, errors, and loading states understandable without color alone?
- Does each design pass 200% text resize, WCAG AA contrast, reduced-motion preference, and full keyboard operation?

## Validation plan for implementation

When a coded prototype exists, inspect the complete user flow at 320px and 375px phone widths, one tablet width, and desktop; both portrait and landscape; 200% zoom; keyboard-only navigation; and both themes. Check upload/OCR success, failure, correction, back/forward, theme toggling at every step, and image-loading failure. This is a design QA plan, not a claim that the future implementation already passes.

## Designer review of the existing BasilMarket light guide

The Designer compared this report with `BASILMARKET_LIGHT_STYLE_GUIDE.md`. The plan already aligns on the modern-card / compact-stat-row balance, restrained sprites, responsive layout, and shared theme structure. The review identified these additions for the component-ready design pass:

- Set **44 × 44 CSS pixels as the project target for primary touch controls**; treat WCAG 2.2's 24 × 24px target as a conformance floor with exceptions, not our preferred control size.
- Specify a persistent, visibly labeled **System / Light / Dark** control reachable throughout the flow, including on mobile, without covering fields or results. Preserve its saved choice independently of a comparison reset.
- Define a theme-swap acceptance check at each step, including while an input is focused, the mobile keyboard is open, OCR is working, and details are expanded. The swap must preserve the current route/step, data, selected file, computation, focus, scroll, and component geometry; only theme paint changes.
- Check actual foreground/background/state color pairs for WCAG AA contrast before approving tokens. Screenshot-derived hex colors are estimates and should yield when they fail readability.
- Keep small eyebrow and metadata type decorative only. Any actionable or decision-relevant helper, OCR confidence, source/version caveat, or error should be at least 14px and preferably 16px on mobile.
- Treat the four-step journey as a planning model, not a forced wizard: optional context can be skipped or collapsed, and step labels may adapt. Back/forward navigation must retain work.
- Prefer a compact mobile menu over horizontally scrollable primary navigation; keep the theme control visible and reachable.
- Specify fixed sprite box dimensions/aspect treatment so image loading never moves content. Item text remains the canonical identity; MapleStory.io is for candidate discovery/prototyping pending service and rights review.
- Still to sketch for the BasilMarket handoff: mobile header, progress cue, stacked item cards, stat rows, result block, and theme-control placement. This report is the common mobile foundation; the later Hidden Street pass should retain the same component geometry and interaction contract.

## Source references

- [Apple Human Interface Guidelines: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) — hierarchy, grouping, progressive disclosure, adaptability, and reading order.
- [Apple Human Interface Guidelines: Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios) — focus on primary tasks and adapt to appearance changes.
- [Apple Human Interface Guidelines: Designing for Games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games/) — readable text and platform touch sizing.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility success criteria.
- [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), and [Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced).
- [GOV.UK Design System: Spacing](https://design-system.service.gov.uk/styles/spacing/) — responsive spacing scale and compact small-screen rhythm.
- [GOV.UK Design System: Type scale](https://design-system.service.gov.uk/styles/type-scale/) — tested responsive type sizes, line-height rhythm, relative units, and tabular numerals.
- [GOV.UK Design System: Patterns](https://design-system.service.gov.uk/patterns/) — user-task patterns including review answers and error recovery.
- [MDN: `prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-color-scheme) and [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme) — system preference and browser-provided UI support.
