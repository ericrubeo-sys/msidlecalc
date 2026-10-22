# Project brief

## Product

Build **msIdleCalc.com**, a fan-made, mobile-friendly tool that answers: **Which equipment item should I equip for more damage?** The first version compares the two items in an in-game comparison screenshot and gives a practical verdict, a High / Medium / Low confidence rating, and a short explanation.

## Intended first-use flow

1. The player selects or uploads an equipment comparison screenshot.
2. Local browser OCR and deterministic parsing read the visible item names and stat lines.
3. The player confirms or corrects the extracted information.
4. The player supplies only useful comparison context, such as class, level, Critical Rate, whether attacks reliably hit the target, and activity type (initially Boss or Chapter Breakthrough).
5. An optional advanced section can collect further raw stats if supported by research.
6. The tool presents a verdict and explains the factors and uncertainty.

Build and review manual item entry before adding OCR. Do not treat Combat Power (CP) as an equivalent to DPS.

## Mechanics to investigate

- Critical Rate may only help until the relevant cap; verify the cap and the effect of excess rate.
- Accuracy may only help when it changes hit reliability; verify activity and target dependencies.
- Max HP and Max MP may affect CP without directly increasing damage; confirm before modeling.
- Main stat, Attack, Critical Damage, and skill-level lines need sourced descriptions of their damage impact.
- Boss and Chapter Breakthrough may differ in relevant modifiers or target conditions.

The example comparison in the planning brief used two Aquatic Letter eye accessories. The equipped item showed Attack, Max HP, Main Stat, another Max HP line, and Critical Rate. The candidate showed Attack, Max HP, Main Stat, Critical Damage, and 1st Job Skill Lv. A CP change was visible but is not itself the damage verdict.

## Constraints and choices already established

- No paid AI usage for screenshot processing; prefer local deterministic OCR and parsing.
- Keep calculations and user-entered data in the browser for the initial version; no database is currently needed.
- Make uncertainty and assumptions visible. Do not present undocumented mechanics as facts.
- Treat the product as fan content and avoid implying official affiliation.
- Offer two selectable visual skins in one page/application: BasilMarket-inspired light mode and Hidden Street-inspired dark mode. Include both theme token sets in the app from initial load and choose the active skin before first paint. Do not create separate pages, routes, or app flows. The dark skin uses genuinely dark body/content surfaces, Hidden Street-inspired blue grouping, and a restrained MapleStory-orange accent. Both modes must use the same page organization, controls, geometry, and interaction flow; switching at any step applies immediately without refresh or loss of entered/recognized data, progress, results, focus, or scroll position. Follow the operating-system theme preference by default, with an in-app override. The Designer will eventually select a small, deliberate set of MapleStory equipment/character/monster sprites that fit each mode; avoid a comprehensive asset dump or letting art overpower the calculator. MapleStory.io is the preferred source for technical prototyping and item-ID discovery, with production use gated on rights and service review. Maintain readable mobile layouts.
- Intended GitHub repository: public `ericrubeo-sys/msidlecalc`. No license has been selected, so do not add one automatically.
- Intended hosting: a separate Vercel project. Preserve the existing Eric's Trade Binder project and its Vercel connection.
- Domain: `msidlecalc.com`, registered through Namecheap. Configure DNS only when a deployment is ready.
- Start with Vercel Hobby; reassess terms and paid hosting only if needs or monetization change. No donation link is part of the initial build.

## Out of scope for the first release

- A full character planner or exhaustive simulation of every game mechanic.
- User accounts, saved builds, shared user data, or server-side services without a concrete need.
- Per-image AI/API processing, analytics, or user-data collection without prior discussion.
- Publishing, scheduling, deploying, or changing DNS without user review and approval.
