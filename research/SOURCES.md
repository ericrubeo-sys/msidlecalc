# Game mechanics research register

This register now links recovered prior planning and the 2026-10-22 primary-source audit. Published mechanics are not the same as an implemented or empirically validated numerical model. No numerical damage result should be described as definitive without its inputs, supported scope, and verification.

## Evidence standards

- Prefer primary game documentation, official announcements, directly observable in-game behavior, and reproducible tests.
- Record date, game version/region if known, exact claim supported, source type, and any limitations.
- Separate confirmed evidence, community reports, and our own inference.
- Note conflicts rather than silently choosing one account.
- When a mechanic remains unknown, use a conservative estimate, expose the assumption, or lower confidence.

## Source register

| Topic | Source / link | Date and game version | What it supports | Evidence type | Confidence / limitations |
| --- | --- | --- | --- | --- | --- |
| Attack and Main Stat scaling | [Nexon guide, Battle §1.1 and Dictionary](https://maplestoryidle.nexon.com/en/guide) | Inspected 2026-10-22; page reports 2026-10-15 update; build unspecified | Aggregate ordering; attributes contribute to Attack and Stat Prop. Damage | Official published definitions | Numeric attribute conversion not established; do not invent it |
| Critical Rate cap and excess rate | [Nexon guide, Dictionary and Battle §4.2](https://maplestoryidle.nexon.com/en/guide) | Same scope | Rate is critical chance; specified PvP correction limits its weighting | Official published definitions | Does not verify a universal ordinary-PvE overflow rule |
| Critical Damage effect | [Nexon guide, Battle §1.3 and Dictionary](https://maplestoryidle.nexon.com/en/guide) | Same scope | Conditional critical-hit multiplier | Official combat formula | Expected-value semantics, attack eligibility and rounding still need scoped verification |
| Accuracy, evasion, and hit reliability | [Nexon guide, Battle §1.2](https://maplestoryidle.nexon.com/en/guide) | Same scope | Published difference boundary and maximum evasion case | Official combat rule | Full curve and universal target thresholds not established |
| Max HP / Max MP and CP vs damage | [Nexon guide, Battle §1.3/3.1](https://maplestoryidle.nexon.com/en/guide); [Q&A](https://maplestoryidle.nexon.com/en/qna) | Inspected 2026-10-22 | CP and combat damage are different; ordinary outgoing formula does not treat HP/MP as general multipliers | Official formula plus user objective | Under adequate survival/hit assumption, no hidden defensive score; sustain/exception mechanics require separate evidence |
| Skill-level equipment lines | [Nexon guide, Dictionary and Content / Character](https://maplestoryidle.nexon.com/en/guide) | Same scope | Tier lines affect corresponding skills; mastery/passives are skill-specific | Official definitions | No complete coefficient/cadence catalog yet; CP weights are not DPS weights |
| Boss activity modifiers | [Nexon guide, Battle §2.1](https://maplestoryidle.nexon.com/en/guide) | Same scope | Lists specific named Boss/Guild Raid transforms and exceptions | Official combat formula | Do not generalize one Boss profile to all encounters |
| Chapter Breakthrough modifiers | [Nexon guide](https://maplestoryidle.nexon.com/en/guide) | Inspected 2026-10-22 | Current audit does not establish a complete profile | Unresolved | A missing table entry does not establish the identity transform |
| Current damage formula | [Nexon guide, Battle §1.3](https://maplestoryidle.nexon.com/en/guide) | Same scope | Core sequence includes defense mitigation and separate damage, critical/range, mode and skill stages | Official published formula | Exceptions, distribution, rounding and required inputs prevent an unrestricted DPS claim |
| Trigger timing | [Nexon Q&A](https://maplestoryidle.nexon.com/en/qna) | Inspected 2026-10-22 | Skill-use trigger checks differ from per-hit checks | Official developer explanation | Does not provide a full rotation/uptime model |

## Formula ledger

Prior formula research has been recovered under `docs/recovered/`. Current published-rule verification and replacement/expectation caveats are in `MECHANICS_AUDIT_2026-10-22.md`; independent acceptance cases are in `docs/MODEL_QA_AUDIT.md`. No full executable damage model or controlled in-game validation is complete. For every implemented formula, add:

- Formula and each variable definition.
- Source(s) and the exact parts they support.
- Version/activity scope.
- Missing mechanics and assumptions.
- Tests or in-game comparisons that could falsify the formula.
- User-facing confidence guidance.

## Claims and verification boundaries

- **G-2026-10-15**: English Additional Information guide, Battle System / Stat Dictionary / Content tabs; current source for published mechanics. Read rendered tabs, not just the search landing-page text. Confidence in publication is separate from confidence in implementation/live-game agreement.
- **Q-2026-10-22**: Developer Q&A inspected on this date; supports trigger distinctions and CP limitations, not a complete numerical model.
- **H-2026-10-22**: Recovered model/stat/methodology drafts, retained for project continuity. They are historical planning and must not override current source verification. Correct the old ambiguous “elemental proportion damage” translation using the official Stat Prop. Damage definition.
- Player screenshot values are private fixture inputs, not universal game-mechanics evidence. Keep any future permitted fixture files in ignored `.private-fixtures/` outside `public/`; do not publish player imagery or raw transcripts by default.
