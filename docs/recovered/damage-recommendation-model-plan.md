> Historical msIdleCalc planning recovered on 2026-10-22. Not implementation-validated. Read alongside research/MECHANICS_AUDIT_2026-10-22.md and current decisions; historical translations and universal raw-delta replacement guidance require correction.

# MapleStory Idle Equipment Recommendation Model — Draft Plan

Status: planning draft based on Nexon public documentation available 2026-10-21. Recheck formulas against current game notices before implementation.

## Product goal — clarified 2026-10-21

Help a player choose the equipment that maximizes **damage per second (DPS)** for a *specific* kind of content: for example Chapter Breakthrough, a named boss, Guild Boss, or Arena. The user cares about clearing content, but the calculator's default objective is sustained offensive output, not the size of one hit and not a blended score of every stat that contributes to Combat Power (CP).

Treat Accuracy as a hit-adequacy constraint: assume it is sufficient by default and do not reward extra Accuracy in a DPS ranking once attacks are already landing. If a target's evasion means some attacks miss, model that only when target/context data shows Accuracy changes hit rate. Treat Max HP, Defense, and Evasion as survivability/CP stats, not DPS, under the default assumption that the player is not in danger of dying. They can be shown separately or considered in a clearly labeled optional survival analysis, but must not silently influence the default DPS recommendation. The product should expose why CP can mislead here: CP awards value to stats that may not improve damage output for this player's scenario.

Keep claims staged. The official formula supports per-attack damage impact; a sustained-DPS estimate additionally needs skill cadence/rotation, target/context, and relevant uptime. Actual clear probability is out of scope for the default recommendation; it would require encounter survival mechanics, randomness, and calibration against repeated outcomes. Never present CP as DPS or as a guarantee of clearing.

## Recommended user flow

1. Upload one ordinary equipment comparison screenshot.
2. Detect the two item panels, slot, and visible values; show OCR confidence and retain the raw extracted text for correction.
3. Ask the user to confirm/correct the items and stat values.
4. Ask what they are trying to clear, then return a separate recommendation for that scenario. The player can request more contexts afterward; do not blend unrelated modes into one score.
5. Ask for more character, skill, or encounter inputs only when they materially improve the selected scenario estimate.

Do not ask for context before upload. The app can first establish that the screenshot is readable and show concrete detected values; then ask what the player wants to clear. One primary context per result keeps the objective clear. A later multi-context view can show distinct cards, never a single universal winner.

## Model pipeline

- **Extract:** OCR returns candidate item identity, equipment slot, tier/level, stat label/value pairs, source image regions, and confidence.
- **Confirm:** user can correct any extracted field. Never silently discard an unrecognized line.
- **Normalize:** map labels/localized aliases to stable stat IDs; store raw label, canonical value, unit, item side, and OCR provenance.
- **Apply replacement:** add candidate-minus-current item deltas to confirmed character totals. Do not calculate from item lines alone: caps, existing additive buckets, crit, and other interactions depend on the current totals.
- **Calculate:** run a pure, versioned function for aggregation, defense penetration/mitigation, damage buckets, crit/range/status effects, then the selected content modifiers and skill coefficients. Until cadence/rotation is modeled, call this modeled stat impact rather than DPS.
- **Explain:** return the offensive recommendation for the selected content, modeled DPS change when supported, assumptions, omitted effects, evidence/confidence level, and formula/data version. Keep excluded CP/survival stats out of the DPS score and optionally list their separate stat changes. Do not return clear likelihood as part of the default result.

Same confirmed inputs plus the same model version must always produce the same output.

## Officially documented stat families

Nexon’s official Additional Information guide documents these damage/CP-relevant families:

- Attack, Defense, Max HP, Max MP, Main Stat
- Damage, Damage Amplification, Final Damage
- Boss Monster Damage, Normal Monster Damage
- Basic Attack Damage, Skill Damage, elemental proportional damage
- Defense Penetration
- Critical Rate, Critical Damage, minimum and maximum damage multipliers
- Status Effect Damage, target received-damage increase/reduction
- Attack Speed, Accuracy, Evasion
- Skill levels, skill mastery, skill cooldown reduction (percent/fixed), basic attack target count
- Buff duration and companion summon duration
- Mastery acquisition indicators used in Combat Power

This is the documented formula/stat set, not yet a verified exhaustive inventory of every stat, item option, or effect in the live game. Nexon’s English page exposes a Stat Dictionary section, but its embedded contents were not fully extractable in this research pass. Maintain a registry that can grow without changing the calculator core.

The user-requested stat-by-stat DPS audit is recorded in [character-stat-inventory.md](character-stat-inventory.md) under **Full DPS relevance audit**. It covers every stat transcribed from the user's screenshots plus formula-derived official terms. Treat the categories there as relevance predicates, not claims that a stat is globally useless. Keep **CP contribution** separate from **DPS contribution** in the registry.

## Rules to encode from the official guide

- Internal percentage arithmetic uses per-thousand values (1,000 = 100%).
- Some families add together; Attack/Defense/HP/MP/Main Stat combine flat values, then percent modifiers, then skill modifiers and skill flat additions.
- Damage taken reduction, Defense Penetration, percent cooldown reduction, and Attack Speed use diminishing “fill remaining cap” accumulation.
- Published caps include damage taken reduction 95%, Defense Penetration 100%, Attack Speed 150%, and percent cooldown reduction 100%.
- Final Damage sources multiply with each other.
- Core defense mitigation is `5,000 / (target defense after penetration + 6,000)`.
- The damage sequence includes applicable target received-damage modifiers; Damage and Damage Amplification; Boss or Normal Monster Damage; Basic Attack or Skill Damage; elemental proportion damage; mastery and skill-specific modifiers; critical damage when critical; min/max damage range; applicable status effect damage; Final Damage; content adjustments; and skill coefficient.
- Some attacks bypass portions of the generic sequence. Boss/raid encounters can include fixed, HP-proportional, defense-ignoring, or other special damage rules.

## Context support and limits

Nexon documents separate adjustments for Arena, World Arena, Colosseum, Party Exploration, Boss/Guild Raids, and Guild Training. The published guide specifies square-root adjustments for several modes and cube-root adjustment for Guild Training, with additional level/PvP rules in applicable modes. PvP uses its own defensive adjustment inputs. These must be implemented as separate, cited context modules, not approximated as one generic “DPS” formula.

For the first release, support only contexts whose formulas and required inputs are explicitly represented. Treat Chapter Breakthrough, bosses, Guild Boss, Arena, and other modes as separate profiles; never assume their mechanics are interchangeable. Mark exceptional encounter mechanics as unsupported until documented. Where attack cadence, skill rotation, hit counts, proc chance/uptime, target defense, or in-combat buffs are missing, return a qualified per-attack/modelled damage impact rather than falsely precise sustained DPS. Do not substitute CP for missing DPS inputs.

### DPS objective and non-DPS stats

The default recommendation ranks gear by expected offensive damage output for the selected scenario. It does not optimize overall CP. Defense, Max HP, and Evasion do not increase DPS under the product's normal assumption that the player survives and their attacks connect; exclude them from the DPS score. Accuracy is also excluded once hit adequacy is met. If accuracy is below the scenario's hit requirement, account for missed attacks as an explicit hit-rate penalty/threshold, not as a general CP bonus. Offer a survival-focused evaluation only as a separate future mode, never as an implicit part of the DPS recommendation.

Apply the same scrutiny to every other stat: direct offensive formula terms score only when the selected target/attack uses them; crit, range, status, defense penetration, and target debuffs depend on effective rates/caps/encounter state; Attack Speed, cooldowns, skill levels, buffs, and summons require a verified rotation/uptime; multi-target count applies to multi-target content; MP/resource stats matter only when they gate casts; EXP/Meso are separate utility outcomes. Unmapped labels are retained raw but not scored. See the inventory audit for the full roster and caveats.

### Scenario inputs and output ladder

Minimum scenario inputs for an eventual sustained-performance estimate:

1. Confirmed equipped/candidate items and slot.
2. Stable character totals, class/job, and level. Temporary buffs should be absent or explicitly flagged.
3. Selected content and difficulty/stage (for example, Chapter Breakthrough stage, boss and difficulty, Guild Boss, or Arena context). Use exact enemy/encounter parameters where documented; otherwise show the fallback range/assumption.
4. For sustained DPS: the active skill preset/levels, autocast behavior, relevant cooldowns, attack speed, and buff durations/uptime.
5. For validation: observed sustained damage or encounter progress in this same content under controlled conditions. Clear/fail, elapsed/remaining time, HP, deaths, and potion use can be recorded as secondary outcome evidence, but survival is not part of the default DPS score.

Output maturity:

- **MVP — modeled offensive impact:** deterministic relative damage impact from documented formulas and confirmed stats, excluding CP-only survivability stats and surplus Accuracy. Do not label this sustained DPS until cadence/rotation is represented.
- **Next — sustained DPS estimate:** add a deterministic expected-value or fixed-seed simulation for verified skill rotations over a relevant scenario horizon. Report assumptions, evidence quality, and any missing skill/buff mechanics.
- **Validation:** compare predicted DPS ranking and magnitude against repeated controlled in-game damage/progress results. Clear/fail outcomes can validate usefulness as a secondary measure, but should not become an uncalibrated probability claim.

Useful outputs are expected damage over a defined encounter window and projected time to defeat where target HP and mechanics are known. Clearly label survival/CP stat changes separately; the default DPS winner should not change because an item adds HP, Defense, or Evasion if survival is already adequate.

### Empirical validation plan

For one content profile at a time, compare two gear states while holding stage/opponent, skill preset, buffs, and other conditions constant. Record measured damage/progress over time, clear/fail, elapsed or remaining time, HP, deaths, and potion use; repeat runs to account for variation. A CP before/after check validates only CP implementation, not the DPS recommendation. Track held-out comparisons and whether predicted damage ranking and magnitude match observed outcomes.

## Screenshots/data useful from the player

The existing equipment-comparison screenshot is useful for item-level deltas, but does not supply full character totals. For model planning, request:

1. Character detailed-stats screen, including every tab and scrolled section, plus character level and job.
2. Skill page(s) showing the active skills/skill levels used in the desired context.
3. Encounter/target details only for a later encounter-level estimate.

Use one clear screenshot per panel; no need to screenshot every equipped item initially. Mask or crop character names if desired. Screenshots help validate real labels and identify which character-level totals the app should ask for. They are not a substitute for verifying the official formula or all possible stat options.

## Initial recommendation

After OCR confirmation, ask “What are you trying to clear?” and calculate offensive damage for that selected context. A user can ask for more context cards later, but one scenario should drive each recommendation. Optional Advanced Calculation should request only missing character/skill/target inputs that materially improve DPS. Surface CP-only defensive stats separately rather than letting them affect the winner.

## Sources

- [Nexon official Additional Information guide (Taiwan Traditional Chinese; indexed update 2026-09-22)](https://maplestoryidle.nexon.com/tw/guide)
- [Nexon official Additional Information guide (English landing page)](https://maplestoryidle.nexon.com/en/guide)
- [Nexon official developer Q&A](https://maplestoryidle.nexon.com/en/qna) — says the CP formula is publicly documented and notes PvE CP can diverge from PvP relevance.

## Screenshot findings and enhancement scope (2026-10-21)

The user's stat screenshots now provide a substantial visible roster; see [character-stat-inventory.md](character-stat-inventory.md) for transcribed labels, values, OCR caveats, and formula-derived terms not yet observed. The character totals are the baseline snapshot; the item comparison panels supply replacement deltas.

For MVP, do not ask users to re-enter slot-bound Scroll Enhancement when comparing two items in the same slot and the enhancement stays unchanged. It is already reflected in current character totals and cancels between candidates. Do not assume Star Force or Potential Options transfer the same way; keep them out of required inputs until their attachment/transfer behavior and exact stat contribution are verified. An advanced enhancement view can be added later for theoretical upgrades or comparisons where these values actually change.

Keep EXP Gain and Meso Drop visible as separate utility outcomes rather than mixing them into a DPS ranking. MP Recovery, Debuff Tolerance, accuracy, target count, and cooldowns only affect recommendations in contexts where their mechanic is modeled. Screenshot discrepancies (Attack Speed 64.4% vs 54.9%; Accuracy 221 vs 23 on an upgrade tile) remain unresolved; preserve source scope and request a clear recheck before using conflicting values.

## Temporary buffs and tie-breakers

The user clarified that Attack Speed readings vary because temporary character buffs can affect it. The data modeler recommends using an unbuffed, stable character snapshot by default and excluding temporary buffs, individual artifact effects, and active skill-buff uptime from the MVP. If a submitted screenshot visibly includes a temporary buff, ask the user to retake it or confirm the affected values; do not infer the buff contribution. Show Attack Speed item deltas separately, but do not give them a hidden ranking weight or use them as an arbitrary tie-breaker. Attack Speed can affect skill cadence, but its impact depends on skill, job, context, caps, and timing. Add Attack Speed to a DPS ranking only after implementing a skill-cadence model and validating it against in-game measurements.
## Artifact effects: MVP decision and later path

**Recommendation: worth exploring as a later opt-in enhancement, but not required for the MVP.** A complete stable character-stat snapshot already includes passive artifact stats that appear in those totals; those stats influence the candidate item's marginal value through additive buckets and caps without asking users to inventory their artifacts. Do not double-count artifact stats on top of those totals.

Artifact-specific conditional effects, triggers, and mode behavior could change which item wins in a scenario, but the official guide material accessible in this research pass does not provide a complete artifact catalog, all trigger rules, or reliable per-context uptime. Do not use unknown artifact effects as a tie-breaker or imply they are modeled.

A later opt-in artifact-effects mode should include only verified effects with exact values, trigger conditions, supported contexts, and an explicit uptime rule or user-entered range. Show unsupported effects as not modeled and validate implemented effects against repeatable in-game measurements when available. Avoid requiring artifact screenshots for ordinary equipment comparisons; full artifact-build optimization would impose substantial ongoing input and maintenance burden.
