# Recovered-design checkpoint — awaiting user approval

The user's earlier **Build equipment damage comparison** chat approved a cozy screenshot-first direction in `msidlecalc-phone-sizes.html`, then refined its compact header, exact disclaimer, hyperlink-style Methodology/Report a Bug/Contact Us links, footer support, and actual MapleStory.io leaf. The generic production diamond/hero scaffold is not the reference.

## Local review

Generate the checkpoint with:

```powershell
node scripts/create-design-checkpoint.mjs 'C:\Users\ericr\.codex\visualizations\2026\10\22\01a161a8-71d1-7041-a83a-70eb1db6e6b0\msidlecalc-phone-sizes.html'
node scripts/serve-review.mjs
```

Open `http://127.0.0.1:4174`. It shows 320px, 375px, and 1024px compositions in both themes. `.review/` is ignored and not served by Vercel. The original screenshot remains local. Generator scripts contain no embedded screenshot or asset copies.

## Preserved from the recovered composition

- Compact MapleStory Idle / Equipment Comparison header and the exact leaf endpoint `https://maplestory.io/api/GMS/83/item/4001126/icon`.
- Warm blue/cream/green light skin; layered navy/blue dark skin with orange highlights; existing textured background and modest beveled controls from the mockup, not a new hero illustration.
- Full uncropped supplied screenshot, existing Current/New panel outlines and legend, and prominent screenshot action.
- Exact single-style disclaimer: “This site is a free hobby project for the MapleStory Idle community. MapleStory and its assets belong to Nexon; this project is not affiliated with Nexon.”
- Matching simple footer links and subtle support control.

## Explicit proposals shown for approval

- Essential legend/disclaimer/footer text at 14px and controls at least 44px, rather than copying the mockup's 8–11px small-print sizing.
- A labeled System / Light / Dark selector instead of an unlabeled sun/moon-only control. The narrow header wraps to fit rather than hiding its label.
- A manual-entry alternative, required by the product brief and UX recovery, beneath the screenshot action.
- A centered responsive desktop extension with the same component order, capped at the shared guide's 70rem width, and a restrained screenshot width. No new desktop sidebar, navigation, or marketing sections.
- Disabled “Buy me a coffee — coming soon” wording per current instruction. A real destination will be one configuration value, default null, during implementation.

This is a visual intake checkpoint, not OCR, a working upload flow, or a damage calculation. Contact/report links point to the local review explanation; no fake send confirmation exists. Mockup placeholder +2.4% DPS and fabricated item-result states were deliberately excluded. Post-upload layouts will use the recovered flow and be reviewed against model-supported field requirements rather than treating the mockup's Attack/Main Stat-only form as complete.

## Initial checkpoint verification

Browser inspection confirmed the selected MapleStory.io leaf loads as 28×30 and the local source screenshot as 1280×590. Both loaded in the composition. Theme switching preserved the intake DOM and measured 375px-viewport site geometry. Measured page width equaled scroll width at requested 320px, 375px, 768px and 1024px viewport settings (content width excludes the browser scrollbar); no horizontal overflow was detected in these checks. Captured both skins at phone and desktop sizes in ignored `.review/`.

This does not certify the future application's correction/OCR states, keyboard behavior, text zoom, or rendered contrast. On short phones the readable footer may require scrolling; approval should weigh that against the old mockup's 8–11px footer text. The desktop screenshot treatment is an explicitly proposed extension, not a claim of prior desktop approval.

## Asset boundary

Use the actual selected asset; do not replace it with a custom drawing. Runtime access and correct identity are separate from third-party usage rights. Preserve provenance and unresolved service/production-use limitations from the asset research. No MapleStory sprite or supplied screenshot is added to production output by this checkpoint.
