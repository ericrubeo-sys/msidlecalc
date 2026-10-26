# Complete ring comparison: mechanics and minimum-input decision

Date: 2026-10-25. Feature preview only. Mechanics/mathematics specialist report; independent QA and integration are separate responsibilities. No new numerical recommendation formula is justified by this investigation. No live-game measurement was performed.

## Decision and acceptance case

The complete Squashy Ring comparison is presently **No reliable preference** for every activity. This is an evidence/implementation blocker, not a request for a larger character stat sheet. Main Stat conversion, changed tier-skill behavior and the changed damage-range law must be evaluated together; implementing only one does not unlock this pair. Neither item dominates all changed offensive effects.

The original private ring image supplied for this acceptance case was visually inspected, not reconstructed from previous OCR output. Its image bytes, attachment identity and local path remain outside source control. The following are the manually verified, anonymized item-example values specified in the task, not character totals or an OCR transcript.

| Source | Current equip, left | New equip, right |
| --- | ---: | ---: |
| Upper Attack, points | 6,624 | 6,042 |
| Max HP, points | 32,562 | 30,327 |
| Upper Main Stat, points | 486 | 444 |
| 2nd Job Skill Lv., levels | 16 | absent from complete panel |
| Critical Rate, % | 9.6 | absent from complete panel |
| 3rd Job Skill Lv., levels | 17 | 16 |
| Normal Monster Damage, % | absent from complete panel | 9.5 |
| Max Damage Multiplier, % | absent from complete panel | 14.5 |
| Filled header stars | 12 | 12 |

An absent line in a corrected, confirmed complete panel means that item supplies no such source; it does not mean the character has zero in that family. Colored comparison deltas are not independent item sources or controlled measurements. In particular, the right `16 -1` is a base value followed by a delta, not level161. No job, current character total, skill build, range distribution or target resistance is established by this image.

## Reconciliation: research already present versus code

Read with `ESSENTIAL_INPUT_STATUS.md`, `DAMAGE_MODEL_SPEC.md`, `DAMAGE_MODEL_QA.md`, `SHOULDER_MODEL_RESEARCH.md`, `CHARACTER_RECOMMENDATION_QA.md`, the October24 workflow audit, approved loading release, `research/SOURCES.md`, `research/ENCODED_RULES.md`, and the replacement/recommendation modules.

- `reaggregation.js` already implements staged attribute source replacement. For complete verified stage aggregates it computes `(sum(flat) * ordinaryFactor) * skillFactor + sum(skillFlat)`. This is an attribute aggregation primitive, not a Main Stat-to-Attack conversion. Its existence must not be reported as absent attribute research.
- `damage-model.js` already evaluates explicit outcomes through the relevant content transform before expectation. It accepts supplied outcome probabilities; it does not derive a PvE distribution from two displayed endpoints.
- `character-recommendation.js` already estimates Attack, selected damage buckets and critical effects under explicit model assumptions, tests coherent source-display alternatives, and uses exact rational linear arithmetic. This does not make Main Stat, skills or range changes supported. The `g >= 1` Attack-response restriction, critical chance normalization and simplified root contexts remain assumptions, not empirical calibration.
- Existing January29 Paladin/Bishop and April30 Buccaneer/Corsair official skill tables are concrete dataset leads. The gap is complete, current, level-dependent behavior and integration, not a total absence of skill research.
- Unchanged HP/Evasion are outside a landed-hit offensive objective only under that objective's survival/resource assumptions. A skill tied to HP/Defense/MP can make these relevant; no universal zero-weight declaration is justified.

## Primary evidence checked

The official guide's JavaScript-rendered tabs were inspected on October25. They display **October15,2026** as the update date; an indexed search excerpt with an older date is not the current rendered page. Region/build applicability remains unspecified. Browser rendering was needed because a direct text fetch supplied a shell.

| Source | Documented fact used here | What it does not establish |
| --- | --- | --- |
| [Official guide](https://maplestoryidle.nexon.com/en/guide), Battle §§1.1,1.3; Dictionary; Content→Character | Attribute stages are ordered. Main/sub attributes contribute to Attack and Stat Prop. Damage. Min/max determines hit range. Tier skill bonuses raise corresponding skills. Passives remain active without a skill slot. Mastery modifies a particular skill. Content adjustment precedes skill coefficient. | Numeric attribute conversion; full level curves; PvE range probabilities/joint law; all rounding stages; a complete activity simulator. |
| Same guide, Battle §§2.1,4.2 | Named content includes square/cube-root descriptions. PvP defender normalization averages min/max and caps its critical weighting. | Permission to use that defender midpoint as a PvE hit distribution, or to root an already averaged damage value. |
| [January29 patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3360937), Paladin/Bishop tables | Job skills include attribute/Attack passives, critical effects, resource thresholds, basic-attack triggers and time-limited buffs. | A universal damage bonus per tier level, full current progression, or unchanged rotation. |
| [April30 patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3435578), Buccaneer/Corsair tables | Different jobs have different passives, triggers and offensive buckets; the post contains concrete historical coefficients. | Current complete curves and all mastery interactions. |
| [August13 patch](https://forum.nexon.com/maplestoryidle/board_view?thread=3522342), Job Balance and Ring of Cycles, freshly rendered | Skill power was redistributed across level ranges; some effects stopped scaling with skill level. The artifact can branch from Critical Rate into Basic Attack/Skill Damage effects. | A complete level-function catalog or a universal critical-overflow formula. |
| [October15 patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3563772), existing source register | Pink Bean phases and temporary boosters are already recorded limitations. | A generic all-boss objective with fixed conditions. |

No secondary calculator, community midpoint formula, other MapleStory game's formula, CP model or visual guess of the character's job was adopted. The bounded official search found no additional verified numeric Main Stat conversion or ordinary range law. That is a scoped finding, not a claim that the information cannot exist anywhere.

## Complete calculation contract, not a new engine

The following are mathematical requirements, not newly documented game formulas.

1. Replace item sources at their actual stages; construct candidate attributes and all changed passives once. Current displayed Attack already contains some attribute/passive effects. Adding the full candidate Main Stat contribution to that total would double count the old contribution.
2. Compute both `Attack(job, attributes, sources, passives)` and `StatProp(job, attributes, sources, passives)` with the same underlying replacement. Main Stat cannot be handled by an isolated Attack ratio while ignoring Stat Prop. Damage.
3. Resolve changed 2nd/3rd tier levels to each affected active/passive skill at the current build and mastery state. Account for affected critical/range/damage buckets, coefficients, thresholds and triggers. Do not assume tier2 affects only tier2 active attacks or that an unequipped active means its passives cancel.
4. For each eligible outcome `z`, evaluate pre-content damage `X_i(z)`, then context transform `T_c`, then the applicable skill coefficient `K_i(z)`. The relevant expectation is `sum_z P_i(z) * K_i(z) * T_c(X_i(z))`. Changed skills may alter `P`, `K`, target count and cadence; this expression alone is not sustained DPS.
5. Prove one equipment wins over every unresolved admissible parameter state, or return No reliable preference. If families/attacks disagree, a generic attack-mixture weight cannot resolve them.

For a positive scaling and a **proved common** outcome law, a pure root allows `T(q*x)=q^r*T(x)`, so some common factors cancel. Here the maximum range and tier skills change; a common outcome law is not established. In general `E[sqrt(X)] != sqrt(E[X])`, including when critical outcomes differ. Independence of critical/range outcomes is also a claim requiring evidence or an explicit restricted assumption.

Even knowing both range endpoints does not identify an expectation without a distribution or a valid dominance bound. Increasing the upper endpoint is not, by itself, a proof of first-order stochastic dominance. Do not assume uniform, equally spaced, independent, or equally likely samples. A mathematical sensitivity analysis may later use *evidence-backed* intervals/distributions; it may not invent them.

The ring has losses in Attack, Main Stat, tier2, tier3 and Critical Rate against gains in normal-monster bonus and max range. The missing mechanisms have no verified bound proving they cannot reverse a result. Thus neither current-gear-only observation nor an assumed monotonic passive argument yields a complete preference. No valid narrower complete-ring proof was identified in this pass.

## Machine-readable dependency handoff

These stable proposed keys distinguish published-but-unimplemented operations from unresolved relationships. The integration owner may map them to engine issue objects; this document does not add unused player fields. All three must be evaluated before publishing a complete ring preference.

```json
[
  {
    "code": "mainStatConversion",
    "effectFamilies": ["Main Stat"],
    "category": "unresolvedMechanic",
    "blockingDependency": "Verified job-specific Main/Sub attribute conversion into both Attack and Stat Prop. Damage, including source amplification, passive stages and rounding",
    "canPlayerDataResolve": false,
    "playerFields": [],
    "source": "https://maplestoryidle.nexon.com/en/guide",
    "sourceSection": "Battle 1.1/1.3; Stat Dictionary: Main Stat and Stat Prop. Damage",
    "knownImplementation": "Ordered attribute source aggregation exists in reaggregation.js; conversion does not",
    "details": "Main Stat changes both Attack and damage scaling. More character totals alone cannot establish the missing replacement law."
  },
  {
    "code": "jobSkillLevelEffects",
    "effectFamilies": ["1st Job Skill Lv.", "2nd Job Skill Lv.", "3rd Job Skill Lv.", "4th Job Skill Lv.", "All Skill Levels"],
    "category": "unimplementedMechanic",
    "blockingDependency": "Complete current job/skill level functions and mastery/trigger dependencies at both predicted tier levels; then source replacement and affected attack-family integration",
    "canPlayerDataResolve": false,
    "playerFields": [],
    "source": "https://maplestoryidle.nexon.com/en/guide",
    "sourceSection": "Content Guide: Character/Skill; Dictionary: tier levels; official January29/April30/August13 skill tables",
    "knownImplementation": "Historical official skill snapshots exist; complete current progression and replacement are not implemented",
    "details": "Job levels can change passive stats and skill behavior. Asking the job alone cannot supply the absent current level functions."
  },
  {
    "code": "damageRangeDistribution",
    "effectFamilies": ["Min Damage Multiplier", "Max Damage Multiplier"],
    "category": "unresolvedMechanic",
    "blockingDependency": "Verified range-source aggregation and endpoint semantics, ordinary hit probability law and critical dependence, with context transform before expectation",
    "canPlayerDataResolve": false,
    "playerFields": [],
    "source": "https://maplestoryidle.nexon.com/en/guide",
    "sourceSection": "Stat Dictionary: Min/Max Damage Multiplier; Battle 1.3, 2.1 and scoped PvP defender 4.2",
    "knownImplementation": "Explicit supplied joint-outcome arithmetic exists; no inferred PvE range law",
    "details": "A displayed minimum and maximum do not establish expected hit damage. The PvP defender midpoint cannot fill that gap."
  }
]
```

`canPlayerDataResolve:false` means **ordinary manually entered current character stats cannot resolve this implementation/evidence gap now**. It does not mean empirical research can never identify the relationship. A future verified distribution-free dominance proof may avoid a dependency for a specific comparison; that proof must check every changed effect and its preconditions. Unchanged effects cancel only after identity, stage and cross-family independence are established. Unknown effects must not disappear because another family is supported.

## Minimum Basic inputs and optional Advanced inputs

There are no universally necessary extra player values for every pair: an identical confirmed pair or a complete proved cancellation can require none. Conversely, there is no finite generic current-stat form guaranteed to identify arbitrary gear changes when formulas are unknown.

**For this blocked ring: ask no new job, level, Main Stat, range endpoint or skill-build questions.** They have no complete implemented consumer yet. Keep corrected item values, star count and previously entered player values. Show a concise blocker behind the single optional details action. Do not ask a question, then discover that its answer cannot possibly unlock a result.

The existing supported experimental model keeps its conditional consumers; it is the same underlying model in Basic and Advanced:

| Field | Exact implemented consumer | Basic condition | Cancellation/bounds and missing consequence |
| --- | --- | --- | --- |
| Current character Attack, points | Bounds positive source response in `A=B+g*Q`, with nonnegative background and provisional `g>=1` | Changed supported Attack tradeoff unresolved by the zero-question certificate | Same Attack sources cancel. Bounds can resolve direction without exact response; unknown/current inconsistent total abstains. This does not solve Main Stat or tier passives. |
| Current Critical Rate and full Critical Damage, % | Existing explicit `p=clamp((R-resistance)/100,0,1)` expectation, with the critical multiplier inside the content root | A supported critical source changes | Both generally needed when chance changes, unless a valid bound proves direction. Model formula remains an assumption; unsupported artifact/passive feedback blocks it. |
| Current applicable changed damage bucket, % | Existing additive-bucket marginal factor under coherent source scenarios | That bucket changes and remains relevant to at least one automatic context | Irrelevant normal/boss bucket cancels for the other target type; unchanged bucket cancels if no cross-effect. Missing total blocks a tradeoff unless the bounded certificate resolves it. |
| Shared slot stars | Existing 12–30 lookup supplies Main/Sub amplification alternatives | Needed source scaling and no complete Advanced pair supplied | Both image headers show12; reuse a confirmed detected value. No invented curve outside table. |

| Advanced field presently implemented | What it unlocks | What it cannot unlock |
| --- | --- | --- |
| Known Main and Sub amplification percentages, % | Same underlying scaling calculation for a known slot stage, including supported out-of-table stages | Whether the displayed item source already includes amplification; both coherent scenarios still need agreement |
| Opponent Critical Resistance, % | Narrows the current model's bounded critical-event scenarios | Unknown activity profile, artifact feedback, range law or full PvP |
| Explicit Attack and percentage uncertainty margins, points / percentage points | Requires direction to survive user-supplied uncertainty intervals | Unknown game rounding law; do not prefill fabricated margins |

Future Main Stat questions are conditional on an implemented conversion dataset: only affected current aggregate/source stage and, where conversion selects it, job. Future skill questions require an implemented level function: job, current affected tier levels/mastery and equipped/auto-use state only where consumed. Character level is conditional on a level-dependent implemented passive or activity rule. Future range endpoints help only after the law/source replacement is implemented, or a distribution-free dominance proof consumes them. These are **deferred design requirements**, not new visible fields in this release. Advanced must not present speculative skill weights or an unexplained effective multiplier as game accuracy.

## Activity eligibility

All automatic results for this complete ring abstain. The table distinguishes that pair's blockers from existing experimental profiles, not a claim that all contexts are equally researched.

| Automatic context | Existing restricted objective / transform | Ring dependencies | Other scope limits |
| --- | --- | --- | --- |
| Ordinary normal monsters | Landed-hit offense; no named encounter; identity transform | Main conversion, tier skills, range law, critical interactions, normal bucket | No survival, target count or sustained clear-rate prediction |
| Ordinary boss monsters | Same restricted per-hit objective | Same; normal-only bucket outside this target objective | Boss immunity/resistance and conditional effects remain scoped |
| Chapter Hunt / mobbing | Experimental ordinary damage | All ring blockers | Spawn/target-count/cadence/one-shot thresholds not modeled |
| Chapter Challenge / Boss | Experimental ordinary damage, both relevant target branches checked | All ring blockers | No generic completion probability; temporary boosters/passives can change state |
| Boss Raid Zakum / Horntail | Experimental pure square-root per outcome | All ring blockers, range/critical law before root | Complete encounter profile and party/phase effects not established |
| Guild Raid Zakum / Horntail | Experimental pure square-root per outcome | Same | Do not generalize to Pink Bean, Guild War or all bosses |
| Guild Training Ground | Experimental pure cube-root per outcome | All ring blockers | Mean-of-root required; resources/cadence remain outside restricted objective |
| Party Quest | Experimental pure square-root, relevant normal/boss branches | All ring blockers | Mixed targets, party effects and clear rate not established |
| Arena / World Arena / Colosseum | Unsupported full PvP objective | Ring blockers plus PvP normalization/level/defender rules | Must abstain; PvP defender midpoint is not a general range model |
| Other activities, Pink Bean, Guild War and unlisted special targets | No complete registered profile | Unimplemented/unresolved profile plus changed effects | Must abstain rather than borrow a neighboring activity's profile |

## Practical evidence collection

Do not repeat a matched-pair request or ask to leave a slot empty; the user confirmed replacement is required. An ordinary owned replacement changes multiple sources, and a before/after Attack difference identifies only their combined response. Without the attribute and passive functions, it cannot isolate upper Attack amplification, Main Stat conversion and tier changes simultaneously. Repeating A→B→A checks stability but does not remove this identifiability problem. CP or the game's item deltas do not isolate the missing mechanisms either.

No new measurement is requested for this release because no established one-step reversible task resolves all three blockers. The next feasible evidence project is to verify whether the in-game **read-only** skill UI exposes arbitrary level previews for the current job, then collect only affected second/third-tier skill functions and mastery conditions. Do not assume that preview exists or ask the user to spend skill points to reveal it. A current tooltip snapshot alone may identify a current coefficient; it cannot establish the candidate's lower level. Official current complete level data is preferable. Range-law evidence needs an identified attack/target/state and enough correctly classified observations to distinguish hypotheses; one or two damage numbers cannot prove a distribution.

Any later Attack experiment should first provide its identifiable equation and allowed confounders. Minimum recording fields would be item/preset identity; all changed source values and stages; stable current Attack readings; affected Main Stat/skill/passive state; temporary buffs; and display precision. Collect only if the known model leaves a single identifiable response. No purchases, upgrades, consumables, candidate ownership or irreversible action is needed or authorized by this document.

## Verification, gaps and next implementation

This report verifies primary publication content and the source screenshot. It adds no numerical engine, no invented parameters, and no live-game validation claim. Existing synthetic tests validate selected arithmetic and software invariants; they do not validate hidden game source attachment, current balance or predictions.

The next integrated preview should replace the generic unsupported-effect message with the three family-specific dependencies above, suppress useless player questions for blocked pairs, retain corrections and stars, and exercise this exact complete ring through confirmation and every automatic result. A shoulder pair without these changed families must retain its existing conditional path. Swapping/unchanged/repeated sources, missing values, rounded totals, tiny critical probabilities and mixed source-display scenarios remain independent QA cases.

Numerical unlock requires all of: verified source response/rounding or safe bounds; Main Stat conversion; complete current affected-skill level behavior; range law or a proved alternative bound; and complete effect/context eligibility. Evidence-backed narrower cancellations may reduce questions, but cannot erase unresolved changed effects. Release wording should say exactly what remains blocked rather than describe OCR success as calculator completion.
