> Historical msIdleCalc planning recovered on 2026-10-22. Not implementation-validated. Read alongside research/MECHANICS_AUDIT_2026-10-22.md and current decisions; historical translations and universal raw-delta replacement guidance require correction.

# msIdleCalc — Resume Notes (2026-10-21)

## Decisions captured

- **Clarified north-star outcome:** recommend the item with the best **DPS** for the player's chosen content (Chapter Breakthrough, boss, Guild Boss, Arena, etc.). The user values damage output over an encounter, not damage per hit or a general CP score. Job-specific skills/buffs create uncertainty, so combine the relevant data and state assumptions.
- **Default scoring policy:** assume the player already has enough Accuracy to land hits and is not at risk of dying. Max HP, Defense, Evasion, and surplus Accuracy do not improve DPS under those assumptions, so exclude them from the DPS score even if they contribute to CP. If Accuracy changes hit rate for a target, treat it as a hit-adequacy threshold/penalty. Keep defensive/CP-only deltas visible separately if useful; do not let them silently affect the DPS winner. A separate survival analysis can be opt-in later.
- **Recommendation maturity:** MVP reports modeled offensive damage impact for one selected scenario after OCR confirmation. Add sustained DPS once skill cadence/rotation is represented. Repeated controlled outcomes can validate ranking and magnitude. Clear/fail and survival data may be secondary validation signals, but the default result is not a clear-probability or survivability score.
- **Scenario interaction:** ask what the player is trying to clear after screenshot review, not before upload. Keep one primary context per recommendation; allow separate context cards if the player asks for multiple. Avoid one blended universal score.
- **Separate offense and survival:** default result ranks offensive DPS only; list survival/CP stats separately. Do not hide them in an opaque score.
- **Validation evidence:** hold content/stage, gear except the compared item, skill preset, buffs, and other conditions constant. Repeat runs and record damage/progress over time; clear/fail, elapsed or remaining time, HP, deaths, and potion use are secondary evidence. CP before/after is not evidence that the DPS ranking is correct.

- Main flow: upload a normal equipment-comparison screenshot; read the current and candidate items; present all detected item stat lines for review/correction; then calculate.
- The review step can be information-dense. Users should not retype correct OCR values; uncertain readings should be emphasized, but all recognized values remain editable.
- Compare the item delta against a confirmed character baseline, not in isolation. Static/passive stats already reflected in character totals must not be counted again.
- Where rules support it, show separate outcomes for multiple combat contexts. The winning item may differ by context. Let users choose a priority context for one headline result if desired; don't require context selection before upload.
- Use an unbuffed/stable character-stat snapshot by default. Temporary buffs and active skill-buff uptime are out of MVP scope. Show Attack Speed deltas separately; don't use them as a hidden tie-breaker without a validated skill-cadence model.
- Passive artifact stats are already included if they appear in the character totals. Do not ask for artifact inventory in the basic flow. A future opt-in mode may model only documented and validated artifact effects/uptime.
- When comparing the same slot and slot-bound Scroll Enhancement is unchanged, do not ask for Scroll Enhancement. Do not assume Star Force or Potential Options are slot-bound until transfer behavior is verified.
- Combat Power must not be described as DPS.

## Screenshot stat data

The current screenshot transcriptions and OCR caveats are in [character-stat-inventory.md](character-stat-inventory.md). A key source observation is that temporary buffs explain Attack Speed varying between 64.4% and 54.9%. The profile included many combat, defensive, sustain, utility, and skill-level stats. The character screenshot's stat inventory is useful evidence, not yet a verified exhaustive roster.

## Official knowledge reviewed

Nexon's official Additional Information guide gives a standard damage formula, stacking/cap rules, a Combat Power formula, and several combat-mode adjustments. It states that 1,000 represents 100% internally; additive and capped-fill stats behave differently; Final Damage sources multiply. It includes target defense after penetration, critical damage when a critical hit occurs, minimum/maximum damage range, conditional status damage, content-specific adjustments, and a skill coefficient. It notes some attacks skip generic steps and some encounters use special rules.

The official guide describes hit/evasion behavior: if enemy evasion exceeds accuracy by 100, the evasion chance is 70%, and larger differences do not increase it further. This is not enough by itself to promise a universal “can hit” answer without target/context information.

Sources: [Nexon detailed localized guide](https://maplestoryidle.nexon.com/tw/guide), indexed as updated 2026-09-22; [Nexon English guide](https://maplestoryidle.nexon.com/en/guide); [Nexon developer Q&A](https://maplestoryidle.nexon.com/en/qna). The English landing page exposes a Stat Dictionary, but its full content wasn't extractable in this research pass.

## Full stat relevance audit — 2026-10-22

Reviewed every stat visible in the player's screenshots plus the official formula terms in `character-stat-inventory.md`. The default score is scenario-specific outgoing DPS; “zero DPS value” means zero marginal benefit under the selected assumptions, not useless in every game mode. Separate direct damage multipliers, conditional stats (crit, hit rate, target type, status, skill/range), cadence and uptime (Attack Speed, cooldowns, skills, buffs, summons), multi-target throughput, resource sustain, survival/defense, and progression/economy stats. CP contribution is tracked separately and never used as a substitute for DPS.

Important evidence limits: standard PvE Critical Rate behavior above 100% is not established by the official source reviewed; its 100% cap is for a specific PvP correction weighting. No universal Accuracy cap was established. Do not guess either. “Stat Prop. Damage” and the screenshot's “Damage Taken” label remain unmapped. Attack Speed varies due to temporary buffs, which are outside the default model. Full roster, rules, and implementation predicates are in `character-stat-inventory.md`.

## Open decisions for next session

1. Implement MVP as scenario-specific modeled stat impact, not DPS/clear likelihood; define supported mode rules and visible assumptions.
2. Determine minimum baseline fields for that promise. Critical Rate alone is insufficient for a damage estimate: Critical Damage matters too. Accuracy/hit assessment is target- and context-sensitive. Other existing totals affect marginal values through additive buckets and caps.
3. Decide whether to request a separate character-stat screenshot after item screenshot; prefer scan-and-confirm over long manual entry.
4. Do not finalize Advanced Calculation fields until each maps to a documented formula term and promised output (eventually sustained throughput or survival estimate).
5. Confirm each context's formula and encounter inputs; mark special/unsupported encounters clearly.
6. Verify Star Force and Potential Option binding/transfer behavior before modeling those screens.
7. Define screenshot retention before writing public privacy claims.
8. Build a repeatable controlled validation set before claiming calibrated clear likelihood; gather same-context outcomes across repeated gear comparisons.

## Current local artifacts

- [damage-recommendation-model-plan.md](damage-recommendation-model-plan.md): draft architecture, supported-context notes, enhancement and artifact scope.
- [character-stat-inventory.md](character-stat-inventory.md): visible player stat labels, values, provenance and caveats.
- [methodology-draft.md](methodology-draft.md): proposed public-facing methodology copy, with internal notes to remove before publication.

The Methodology link in the mockup now opens [methodology-draft.html](methodology-draft.html). Its copy is still a draft; internal cautions and unresolved decisions are kept in [methodology-draft.md](methodology-draft.md).
