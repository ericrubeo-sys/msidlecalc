# Decisions and open questions

## Confirmed

| Decision | Current choice | Reason / boundary |
| --- | --- | --- |
| Product scope | Compare two equipment items for likely damage impact | Keep the first release focused and reviewable |
| Screenshot processing | Local deterministic browser OCR is preferred | Avoid per-image paid AI/API use and unnecessary screenshot transfer |
| Correction | User can correct extracted item names and stats | OCR must not silently determine the final calculation |
| Data storage | No database or account system for the initial version | Inputs/calculation remain in the browser unless requirements change |
| Result language | Verdict plus High / Medium / Low confidence and reasons | Communicate uncertainty honestly |
| Activity context | Start with Boss and Chapter Breakthrough | Check whether their damage conditions differ |
| Visual identity | Two original selectable skins inspired by BasilMarket (light) and Hidden Street (dark), with a small designer-curated set of MapleStory sprites considered for each mode | Sprite selection should be sparse and serve the mode's mood; do not copy either fan site's branding or distinctive layout. MapleStory.io is the preferred technical prototype source, not a rights grant; production use remains subject to rights and service review. Dark mode uses deep charcoal/navy surfaces with a restrained MapleStory-orange accent and Hidden Street-inspired blue grouping. |
| Theme behavior | One page/app with both theme token sets available from initial load; theme can switch at any point without refresh; default to the operating-system color preference | Light/dark are skins only, not separate pages/routes. Select active tokens before first paint, then switch by changing the active theme selector. Preserve current inputs, step, focus, scroll position, and results. |
| Repository | Public `ericrubeo-sys/msidlecalc` is intended | Inspect remote contents before reconciling; no license chosen |
| Hosting | Separate Vercel project; start on Hobby | Preserve the existing Eric's Trade Binder deployment |

## Open

- What exact formulas and stat effects are verified for the current game version?
- Which target / enemy details are needed to model accuracy and hit reliability?
- How do skill-level lines affect the character's equipped skills and expected damage?
- What minimal character inputs provide a useful comparison without becoming a planner?
- Which local OCR engine best balances accuracy, bundle size, browser compatibility, and license terms?
- What are the current terms for Vercel Hobby if any monetization is later considered? Verify at that time.
- Which small set of MapleStory sprites should the Designer select for the light and dark modes, and what production permissions/hosting approach will cover them?

## Decision log format

For new choices, record the date, decision, alternatives considered, evidence, and any conditions that would change the choice.

## 2026-10-22 — Repository reconciliation

Inspected the existing `main` branch and initial commit. Preserve that history and `.gitignore`, expand the initial README with the local guide, and add the planning documents. The user authorized transferring these materials to `ericrubeo-sys/msidlecalc`; deployment and access to other projects are outside this authorization.
