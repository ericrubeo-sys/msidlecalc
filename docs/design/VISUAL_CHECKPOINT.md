# Recovered-design checkpoint — awaiting user approval

The user's earlier **Build equipment damage comparison** chat approved a cozy screenshot-first direction in `msidlecalc-phone-sizes.html`, then refined its compact header, exact disclaimer, hyperlink-style Methodology/Report a Bug/Contact Us links, footer support, and actual MapleStory.io leaf. The generic production diamond/hero scaffold is not the reference.

## Local review

Generate the checkpoint with:

```powershell
node scripts/create-design-checkpoint.mjs 'C:\Users\ericr\.codex\visualizations\2026\10\22\01a161a8-71d1-7041-a83a-70eb1db6e6b0\msidlecalc-phone-sizes.html'
node scripts/serve-review.mjs
```

Open `http://127.0.0.1:4174`. Frames use actual width/height pairs: 320×568, 360×800, 375×812, 390×844, 430×932, 844×390 landscape, 768×1024 tablet, and 1440×900 desktop, in both themes. They are not all stretched to 880px. `.review/` is ignored and not served by Vercel. The original screenshot remains local. Generator scripts contain no embedded screenshot or asset copies.

## Preserved from the recovered composition

- Compact MapleStory Idle / Equipment Comparison header and the exact leaf endpoint `https://maplestory.io/api/GMS/83/item/4001126/icon`.
- Warm blue/cream/green light skin; layered navy/blue dark skin with orange highlights; existing textured background and modest beveled controls from the mockup, not a new hero illustration.
- Full uncropped supplied screenshot, existing Current/New panel outlines and legend, and prominent screenshot action.
- Exact single-style disclaimer: “This site is a free hobby project for the MapleStory Idle community. MapleStory and its assets belong to Nexon; this project is not affiliated with Nexon.”
- Matching simple footer links and subtle support control.

## Revised composition after user rejection of checkpoint overrides

- Restore the original quiet disclaimer role: 9–10px with compact line height and padding, one continuous paragraph in one style. User explicitly rejected the 14px disclaimer and enlarged footer. This does not reduce primary controls, stat fields, errors, or calculation explanations.
- Restore the compact one-row header. A small visibly labeled System / Light / Dark selector fits beside the original leaf/title rather than forcing its own full-width row.
- Keep intake as the original screenshot, legend and upload group; remove the added separate manual button from this faithful intake checkpoint. Manual input remains required in the application flow and must not be omitted from implementation.
- Scale the screenshot and upload action together on desktop (up to 960px within the guide's 70rem page), retaining full uncropped proportions. No new desktop sidebar, navigation, or marketing sections.
- User clarified that the eventual provider embed is yellow and already visually prominent. Restore a compact yellow disabled “Support the project” placeholder with small “Coming soon” status; do not invent a neutral provider appearance. The actual provider embed will be integrated when the user's destination exists, using one configuration value.
- Let short landscape viewports scroll naturally instead of shrinking/cropping the screenshot or hiding the footer. Do not force landscape orientation.

This is a visual intake checkpoint, not OCR, a working upload flow, or a damage calculation. Contact/report links point to the local review explanation; no fake send confirmation exists. Mockup placeholder +2.4% DPS and fabricated item-result states were deliberately excluded. Post-upload layouts will use the recovered flow and be reviewed against model-supported field requirements rather than treating the mockup's Attack/Main Stat-only form as complete.

## Initial checkpoint verification

Browser inspection confirmed the selected MapleStory.io leaf loads as 28×30 and the local source screenshot as 1280×590. Both loaded in the composition. Theme switching preserved the intake DOM and measured 375px-viewport site geometry. Measured page width equaled scroll width at requested 320px, 375px, 768px and 1024px viewport settings (content width excludes the browser scrollbar); no horizontal overflow was detected in these checks. Captured both skins at phone and desktop sizes in ignored `.review/`.

This does not certify the future application's correction/OCR states, keyboard behavior, text zoom, or rendered contrast. The desktop screenshot treatment is an explicitly proposed extension, not a claim of prior desktop approval.

## Revised viewport checks

Rechecked all eight viewport sizes in both themes after the compact-header/footer revision: 16 viewport/theme cases, no document horizontal overflow, both reference images loaded. The light/dark measurements matched at each size. At 375×812 the header is 78px and the footer approximately 98.5px; at 320×568 footer links wrap and the footer is approximately 120.4px. At tablet/desktop sizes the footer is 88px. Portrait footer bottoms remain within their respective viewport heights. At 844×390 landscape the page is taller than the viewport and scrolls normally. These are browser viewport simulations, not physical-device tests or complete application QA.

The screenshot guide is a full 1280×590 image. Its embedded item text is inherently small at narrow phone widths; do not describe that as the future editable form's text size. Review screenshots should be shown individually at useful size, not squeezed into a side-by-side chat table.

## Asset boundary

Use the actual selected asset; do not replace it with a custom drawing. Runtime access and correct identity are separate from third-party usage rights. Preserve provenance and unresolved service/production-use limitations from the asset research. No MapleStory sprite or supplied screenshot is added to production output by this checkpoint.
