# First recommendation scope: mechanics handoff

2026-10-24. Mechanics/mathematics specialist; feature preview only. Read the full project instructions and lessons, essential-input status, source register, encoded rules, prior mechanics audit, damage specification and source-reaggregation/stat-field implementation. Code is read-only in this handoff. No software tests or controlled game observations were performed by this specialist.

## New primary-source inspection

Freshly rendered [official English guide](https://maplestoryidle.nexon.com/en/guide), Battle System, Stat Dictionary and Content Guide → Equipment, on 2026-10-24. The page still reports update 2026-10-15. Build/server applicability remains unidentified; this is not an exhaustive patch audit.

- Battle §1.1 explicitly says same-type flat/percentage values add. Attack flat values precede ordinary percentage multipliers, Skill percentage multipliers, then Skill flat additions. Independent Final Damage effects multiply.
- Battle §1.3 places ordinary Attack, defense, applicable damage buckets, critical/range/status/FD before content adjustment and Skill coefficient. Some attacks skip stages.
- Dictionary defines Critical Rate as critical-hit chance; Critical Resistance lowers the attacker's rate; Critical Damage is the full critical-hit multiplier. No newly verified ordinary effective-rate/overflow law follows from those definitions.
- Equipment says Scrolls imbue equipment **slots**, Potential and Bonus Potential belong to **slots**, and Star Force enhances **slots** while amplifying equipment Main and Sub Options. This strengthens slot-persistence evidence. It does not specify whether the comparison's On-Equip numbers already contain every amplification, nor prove all repeated Attack lines occupy the same source stage.

These are publication observations. Formula derivations below are mathematical inferences from them, not additional statements published by Nexon. No live-game predictive validation is established.

## Smallest defensible useful result

A restricted **ordinary outgoing attack-damage** recommendation can be genuine without a magnitude estimate when every affected offensive contribution is non-worsening for the same item and at least one applicable contribution strictly improves. This is coordinatewise dominance across the **whole admitted comparison**, not ranking an isolated FD ratio while ignoring other changed effects.

It must explicitly exclude sustained DPS, survival, resource exhaustion, changed attack mix/cadence, exceptional HP-based/fixed/bypass attacks, and named encounter/PvP adjustments. Named guide rows do not establish complete executable profiles; root-based wording alone must not silently enable all named contexts. A scoped ordinary result must not be described as a complete Boss/Arena recommendation.

No baseline numerical character input is needed for this dominance result. A genuine tradeoff, such as more Attack but less Critical Rate, remains unavailable until its dependencies close. Unavailable is a valid first result for the user's shoulder comparison; adding unused character fields would not resolve it.

### Conservative admission contract

1. Both complete visible item lists are explicitly reviewed, including unknown observations and lost/gained/repeated lines. Missing is never zero before completeness is established.
2. Compare the same slot and same job/preset/ordinary attack/target scenario. Slot-enhancement persistence is supported as above; any changed additional mechanics not represented in the item lists must block eligibility rather than disappear.
3. Supported same-type damage percentage families: Damage, Damage Amplification, applicable Boss **or** Normal Monster Damage, applicable Basic Attack **or** Skill Damage. The opposite target/attack bucket is outside the specified objective, not globally useless. Same-family accumulation is additive; different families remain separate.
4. Independently identified Final Damage source effects may be reaggregated by product. Unknown grouping/attachment blocks this family; never add independent FD percentages.
5. Changed Attack is not automatically admitted from a label. General source ordering is known, but arbitrary row-stage/amplification attribution is not fully identified. Repeated main/sub Attack contributions cannot be summed or aligned by ordinal as a mechanics proof. A useful narrower admission is exactly **one flat Attack main-option occurrence per item**, identified at the same main-option position in the reviewed same-slot crop, no Attack-percent/extra Attack/changed attribute/skill/passive effects. Gear-sourced flat Attack is distinguished from Skill-granted flat Attack by source; this is a bounded inference from Battle §1.1 and Equipment, not a published row-schema statement. The unknown positive same-slot amplification preserves the order of that one contribution, whether the shown number is before or after the common amplification. If source identity cannot be retained, reject rather than assume ordinal matching proves it. A generic checkbox cannot establish arbitrary attachment mechanics.
6. Initially block changed Critical Rate, Critical Damage, Main Stat/STR/DEX/INT/LUK, skill levels/mastery, range, penetration, attack speed, cooldown, target count, debuff/trigger/buff/companion effects and every unknown offensive family. Their favorable-looking signs do not supply missing laws. Unchanged critical/range/skill behavior can be a common scenario condition, not a newly modeled event law.
7. HP/MP/Defense/Evasion may be outside this objective only while survival, resource availability and landing behavior truly remain adequate/unchanged. Changed Accuracy cannot be called an offensive improvement from the guide's one boundary point; require invariant landing scope or abstain. Resource/HP-dependent attack exceptions block the ordinary scope.

A scenario checkbox can express the player's intended conditions. It cannot verify unknown source attachment, stage or game mechanics. Missing player data and unresolved mechanics must remain distinct eligibility reasons.

## Dominance algebra

For a same-type additive bucket with common unchanged contribution `U`, current item contribution `c` and new contribution `n`, the factors are `1+U+c` and `1+U+n`. For valid nonnegative contributions, the sign is determined by `n−c`, independently of `U`. Do not infer the magnitude of their ratio without `U`.

For independent FD effects, compare the complete item-source products `product(1+c_i)` and `product(1+n_i)`. Unchanged independent effects cancel only at the same source stage and applicability. Finite positivity, subprecision and overflow handling still apply.

For the single matched flat Attack main-option scope above, the difference is `positiveCommonFactor*(newMain−oldMain)`. The common multiplier's unknown magnitude cannot reverse the sign. Other flat/Skill-flat contributions are common. This admits directional dominance, not a relative percentage estimate or a mixed-sign tradeoff. Exactly one occurrence and reviewed source position are deliberate scope guards, not a claim that repeated Attack is inherently invalid in the game.

If every admitted factor is at least as large on one side, all other effective factors are demonstrably common, and an applicable positive factor strictly increases, ordinary damage cannot decrease. With mixed signs, return no reliable preference. Equality is not a forced left/right preference. Finite bounds that overlap equality cannot establish strict superiority.

Source publication confidence is High. A conditional, synthetically verified dominance implementation should remain at most Medium prediction confidence until controlled observations corroborate the admitted source contract. High is not earned merely by passing tests.

## Attack tradeoff contract for subsequent implementation

Given verified source decomposition, let `F` be the current **pre-percentage flat Attack sum**, `M` the complete ordinary multiplier, `S` the complete Skill multiplier and `K` the Skill-flat sum:

```text
A_current = F*M*S + K
A_new = (F − oldFlat + newFlat)*M*S + K
B_new = B_current − oldSameTypeBonus + newSameTypeBonus
R = (A_new/A_current) * (1+B_new)/(1+B_current)
```

The current displayed final Attack is not `F`. Existing `replaceAttributeSources` already implements the ordered operation from explicit source decomposition. Do not add raw item Attack to displayed final Attack. Multiple percentage/source types need verified aggregation, not an invented universal additive stage. Passive effects already represented in a total count once.

If source/display values are rounded, use verified enclosure intervals rather than exact-total assertions. Propagate all possible values; recommend only when the full positive ratio interval is strictly on one side of 1. An interval crossing 1 abstains. Unknown rounding direction/precision cannot be repaired with an arbitrary tolerance. Nonfinite, zero-baseline, underflow and numerically unresolvable conditions abstain.

This decomposition is not currently observable from an ordinary character Attack screenshot alone. Do not burden the user with opaque `F/M/S/K` fields unless a precise, reproducible collection method supplies them.

## Critical dependencies

No ordinary formula `effective chance = min(displayed Rate,100%)`, no universal resistance subtraction, and no uniform min/max law has been established by this pass. The PvP adjustment's explicit averaging/100% weighting limit is scoped to that adjustment.

If a future eligible attack contract establishes effective critical probability `p` and full multiplier `C`, an ordinary pre-content expectation under common independent remaining factors is `1+p*(C−1)`. That is probability algebra; using it requires proving the attack's eligibility/effective-event mapping and common joint range/status behavior. For nonlinear content, transform each outcome before weighting. Do not feed expected pre-content damage into a square root as a substitute.

## Minimal controlled collection task

Do not require the unavailable potential item to be equipped. To investigate Attack-stage attachment, use **two already owned same-slot items** that differ in flat Attack but have identical offensive percentage/attribute/skill effects if available. Keep job/preset/slot enhancements fixed and temporary effects stable. Collect each item's complete comparison and the character Attack total before/after swapping, with two stable readings per state. This can falsify the naive final-total-plus-raw-delta hypothesis; it does not alone prove the exact internal decomposition or validate all source stages. If no such pair exists, do not make the player manufacture one.

For the initial admitted damage-bucket/FD dominance scope, a separate controlled same-target ordinary-hit comparison can corroborate sign while holding crit/range/skills/timing fixed or recording their branches. Held-out observations and live build identity remain necessary before a predictive-accuracy claim. CP agreement is irrelevant.

## Integration boundary

Implement eligibility with separate categories: missing player information; unresolved mechanics/source stage; demonstrably common/cancelled effects; effects outside the restricted objective. Do not ship a numerical engine to production in this task. A useful feature preview may produce a real restricted dominance recommendation and precise abstentions for tradeoffs; it must not claim full product completion.
