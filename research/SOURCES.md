# Game mechanics research register

This register now links recovered prior planning and the 2026-10-22 primary-source audit. Published mechanics are not the same as an implemented or empirically validated numerical model. No numerical damage result should be described as definitive without its inputs, supported scope, and verification.

## Evidence standards

- Prefer primary game documentation, official announcements, directly observable in-game behavior, and reproducible tests.
- Record date, game version/region if known, exact claim supported, source type, and any limitations.
- Separate confirmed evidence, community reports, and our own inference.
- Note conflicts rather than silently choosing one account.
- When a mechanic remains unknown, preserve the gap and limit or abstain from dependent output. Lower confidence does not license an invented estimate or formula.

## Source register

2026-10-24 bounded UI taxonomy recheck: rendered [official guide](https://maplestoryidle.nexon.com/en/guide), Battle §2.1 and Stat Dictionary (reported update2026-10-15). Confirmed separate Arena/World Arena, Colosseum, Party Quest, Zakum/Horntail Boss/Guild Raid and Guild Training Ground rows; dictionary confirms flat/percent families, skill-level terminology and cooldown seconds versus percentage. Used for context labels and entry syntax only. No new executable battle profile, coefficient, empirical validation or equipment winner is established by this recheck.

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
| Pink Bean phases and Chapter boosters | [October15 patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3563772) | Rendered by integration owner2026-10-22; published2026-10-15; build unspecified | Timed statue buffs, HP-dependent Pink Bean received damage, temporary AFK Chapter offensive boosters; CP changes remain distinct from damage | Official published patch, rendered | No numeric phase formula or guaranteed buff-clearing procedure encoded |
| Guild War target stage correction | [October15 live patch](https://forum.nexon.com/maplestoryidle/board_view?board=6653&thread=3564301) | Rendered by integration owner2026-10-22; publishedOct15 04:25; livepatch12:15UTC allservers | Corrects Guild War boss stats not increasing by stage; point/rank reset, restart required | Official published correction, rendered | Post-guide scope evidence; stage coefficients and controlled empirical confirmation absent |

## Formula ledger

Phase2 implementation now has a versioned [encoded-rule and input dependency record](ENCODED_RULES.md), with canonical claim IDs in `public/domain/mechanics-data.js`. The fresh rendered-guide verification was performed by Damage Mathematician; Data & Tooling reconciled the complete technical handoff, existing audit and QA. These records separate official publication, synthetic implementation checks and absent live-game validation. Source replacement is implemented in `public/domain/reaggregation.js`; it can reconstruct candidate values from verified source decomposition without requiring the candidate equipped. Named encounter profiles, ordinary hit/range distributions and sustained DPS remain separate unresolved gates.

Canonical IDs: **MSI-G15-UNITS**, **MSI-G15-ATTRIBUTE-ORDER**, **MSI-G15-FINAL-DAMAGE**, **MSI-G15-REMAINING-CAP**, **MSI-G15-DEFENSE**, **MSI-G15-DAMAGE-ORDER**, **MSI-G15-CRITICAL**, **MSI-G15-CONTEXT**, **MSI-G15-PVP-LEVEL**, **MSI-Q22-TRIGGERS**. Each machine record names variables, units, stacking, caps, order, rounding gaps, contexts and exceptions. Percentage-stage grouping is not generalized from source labels; new replacement APIs require already-aggregated factors where grouping is unresolved. Modelv4 resolves the isolated PvP level100 boundary using the same-date Korean guide's inclusive100/after100 wording. This is a published-text interpretation, not regional parity or a full Arena result; see [dependency follow-up](DEPENDENCY_RESEARCH_2026-10-22.md).

Additional bounded official-source follow-up and exact forum links are recorded in [ENCODED_RULES.md](ENCODED_RULES.md#bounded-primary-source-follow-up): historical job-skill coefficient/passive tables are available for further dataset work, but full level progression/current balance was not established; numerical Main Stat conversion remains unresolved. October15 Pink Bean phases and temporary Chapter boosters limit generic profiles, while the identified October16 update is a login fix. Slot-level enhancement/Potential language supports architecture without proving every same-slot transfer invariant. No community or other-game formula was adopted. Claim-reference closure is executable in `tests/reaggregation.test.mjs`.

Subsequent rendered notice verification found the October15 Guild War stage-scaling correction above. The integration owner inspected the latest English notice board6653, showing October16 app update then October15 live patch and older entries. This is scoped English-list verification, not exhaustive global coverage or empirical game validation.

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
