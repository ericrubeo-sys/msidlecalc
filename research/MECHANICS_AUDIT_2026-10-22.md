# Mechanics evidence audit — 2026-10-22

Scope: MapleStory : Idle RPG only. Initial evidence audit, not an implemented model, empirical validation, or exhaustive current mechanics catalog. No code, tests, or commits were changed/run by this audit. No player screenshots or raw player-stat values are reproduced here.

## Evidence and provenance

Primary source: [Nexon English Additional Information](https://maplestoryidle.nexon.com/en/guide), inspected through its rendered **Battle System Guide**, **Stat Dictionary**, and **Content Guide / Character** tabs on 2026-10-22. The rendered page says **last updated October 15, 2026**. Search/text extraction exposes only the landing page; open the tabs to verify the detailed content. No game build number was shown in the inspected guide. This is publication verification, not a controlled in-game test. Confidence: High that Nexon publishes the rules below; numerical implementation and live-game agreement remain unvalidated.

### Verified published rules

| Topic | Supported claim / guide section |
| --- | --- |
| Units / aggregation | 1,000 = 100%. Flat then percentage/skill ordering applies to Attack/Main Stat/HP/MP. Final Damage sources multiply. Defense Penetration and Attack Speed use remaining-cap accumulation. Battle §1.1. |
| Damage | Ordinary damage starts with Attack; defense factor = `5000/(post-penetration Defense+6000)`. Separate damage buckets, critical/range, contextual adjustment, then skill coefficient apply. Exceptions exist. Battle §1.3. |
| Main Stat | Job main/sub stats contribute to Attack and Stat Prop. Damage. Dictionary. |
| Critical | Rate controls critical chance; Critical Damage is its multiplier. Only PvP adjustment weighting explicitly limits Rate to 100%. Dictionary; Battle §4.2. |
| Accuracy | Evasion−Accuracy ≥100 gives 70% evasion, capped there. Battle §1.2. |
| Skills | Tier lines raise corresponding skills; passives remain active unequipped; mastery is skill-specific. Dictionary; Content / Character. |
| HP / MP | Both appear in CP; neither is an ordinary outgoing damage multiplier. Battle §1.3/3.1. |
| Modes | Listed Zakum/Horntail Boss/Guild Raids use square-root adjustment; Guild Training uses cube-root adjustment. Battle §2.1. |

Further primary context: [Nexon developer Q&A](https://maplestoryidle.nexon.com/en/qna), inspected 2026-10-22. It distinguishes skill-use trigger checks from per-hit checks and points to the disclosed CP formula. It supports keeping trigger cadence separate from per-hit damage; it does not supply a complete job rotation or skill-level progression database.

Historical lead, not a separately verified current translation in this pass: [Nexon Traditional Chinese guide](https://maplestoryidle.nexon.com/tw/guide), used in earlier planning. Prefer the newly accessible English definitions for canonical English labels. Community search results were discovery leads only; no numerical fact in this audit depends on a fan guide, original MapleStory, MapleStory M, or MapleStory N.

## What was already prepared and what is implemented

Read fully: repository `AGENTS.md`, `research/SOURCES.md`, `docs/PROJECT_BRIEF.md`, `docs/DETERMINISTIC_TOOLING_PLAN.md`, `docs/DECISIONS.md`, and `public/domain/comparison.js`.

Recovered prior planning was also read fully, from the separate local msIdleCalc visualization folder dated 2026-10-22: `damage-recommendation-model-plan.md`, `character-stat-inventory.md`, `resume-notes-2026-10-21.md`, and `methodology-draft.md`. They already contain a candidate formula pipeline, stat relevance audit, inputs, mode boundaries, validation approach, and the user's clarified offensive objective. Missing repository code is **not** evidence that the formula research had never happened.

`public/domain/comparison.js` currently:

- Defines six raw item-line fields: Attack, Main Stat, Critical Rate, Critical Damage, Accuracy, and 1st Job Skill Lv.
- Parses nonnegative finite numbers, with integer skill levels; distinguishes blank/missing values from zero.
- Returns candidate-minus-current raw differences and a count of comparable fields.
- Passes through only the activity context. It does not consume baseline character totals, job, level, target, preset, or cadence.
- Explicitly returns unavailable damage, Low confidence, and null winner/percentage. No caps, weights, DPS, expected critical/range, or damage formula are implemented.

The repository source ledger is still blank and the initial-page decision describes that blank ledger. Reconcile those records with recovered planning and this evidence before claiming either a validated calculator or an absence of prepared mathematics. The recovered materials remain drafts, not a tested calculation engine.

## Corrections and unresolved mechanics

1. **Stat Prop. Damage is identified.** The earlier inventory marks its meaning unresolved and another translated term reads “elemental proportion damage.” Do not create a second elemental stat from that translation. Its numeric conversion from attributes remains unresolved; do not invent a main-stat-to-Attack or main-stat-to-damage coefficient.
2. **Critical overflow remains unresolved for ordinary PvE.** Do not promote a PvP adjustment's weighting limit into a universal excess-rate rule. Also verify displayed Critical Damage semantics, eligible attack exceptions, effective target resistance, rounding, and any expected-value assumptions before calculating a general critical average.
3. **Accuracy has no verified universal cap or full curve here.** The boundary result above is insufficient to interpolate all lower gaps or derive a hit threshold for every encounter. Attack eligibility and target Evasion are needed if hit rate is modeled.
4. **Skill-level lines cannot use CP weights as damage weights.** Need the affected job's skills, before/after levels and exact coefficients/passive effects, plus usage and timing when claiming throughput. Passive changes may affect the entire character baseline.
5. **HP and MP policy is conditional.** The recovered user decision assumes survival and hit adequacy. Under that objective, give HP/Defense/Evasion/surplus Accuracy no hidden offensive weight. MP capacity/recovery can matter only when resources change casts; that requires a separate verified sustain model. Do not claim these stats are globally useless.
6. **Activity labels are too broad.** “Boss” does not establish one transform for all named bosses, guild content, future bosses, or special attacks. Chapter Breakthrough has no separately established complete profile in this audit. Verify target type, difficulty/stage, defense, effects, attack exceptions, and applicable transform before enabling it. Absence from a table is not proof of a universal identity transform.
7. **Other unresolved details:** ordinary damage-range distribution/ordering, internal rounding, exact stat aggregation within all families, skill/target exceptions, artifact triggers, active-buff uptime, and enhancement attachment/transfer semantics. Do not fill missing mechanics with defaults presented as facts.

## Proposed safe numerical scope (recommendation, not a product decision)

Preserve the unavailable verdict for unsupported comparisons. The first numerical slice should report **modeled offensive impact for a specified eligible attack/context**, not sustained DPS, clear probability, or a universal equipment winner. Use stable confirmed totals, preserve unknown labels, name assumptions, and block or qualify results when a changed line has unmodeled offensive consequences.

Safest baseline input is **confirmed post-equip totals for both gear states**. “Current total + raw item delta” is safe only after the source family's replacement operation has been established. Flat/%/skill ordering, multiplicative Final Damage, and cap-fill aggregation can make direct subtraction/addition of item lines wrong. An alternative is a verified source decomposition and replacement/reaggregation procedure. Never add passive artifact or unchanged slot enhancement stats again when already reflected in totals.

Minimum inputs should be conditional on changed terms, not one mandatory planner form:

- Item identities/slot, every changed line with units and exact meaning, and confirmed stable states A/B or sufficient source decomposition.
- One selected activity, named target/difficulty/stage, attack classification, and all context rules needed by the claimed output.
- A/B total Attack and relevant damage buckets; total Stat Prop. Damage rather than an invented attribute conversion; verified effective critical inputs and range treatment if those change.
- Target Defense and the player's Defense Penetration only when required by changed terms; status/received-damage effects only where relevant. Unchanged factors may cancel only after explicitly checking the algebra and mode rules.
- Job/affected skills and coefficients when skill levels or skill-type composition change. For sustained DPS, add actual preset, hit counts, cadence/cooldowns, MP behavior, triggers, and validated uptime.

Mathematical safeguard: calculate at the correct stage. For nonlinear context transforms, transforming an average damage value is generally different from averaging transformed hit outcomes. Skill coefficients lie outside the documented mode transform sequence. Do not apply a generic expected-crit/min–max shortcut before a square/cube root without demonstrating equivalence for the supported case.

Keep temporary buffs, artifact-specific uptime, and Attack Speed tie-breakers outside the MVP per recovered user decisions. Display unsupported deltas separately and explain when they prevent a complete ranking. Controlled, same-context repeated comparisons are needed before increasing implementation confidence; no such verification was performed in this audit.
