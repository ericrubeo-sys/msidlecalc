# Minimum-input mechanics and measurement specification

2026-10-24. Mechanics/mathematics specialist, feature preview only. This reconciles ESSENTIAL_INPUT_STATUS, DAMAGE_MODEL_SPEC, ENCODED_RULES, SOURCES, the recommendation scope, `equipment-recommendation.js`, `reaggregation.js`, `damage-model.js`, typed fields and existing lessons. It supersedes the earlier specially matched-pair request as a prerequisite. No player measurements, live-game validation or numerical production release occurred in this work.

## Evidence inspected now

Fresh rendered [official English guide](https://maplestoryidle.nexon.com/en/guide), Battle 1.1–1.3/2.1, Stat Dictionary and Content Guide → Equipment, still reports October15,2026. Build/server is unidentified. Same-type bonuses add; Attack applies flat sources, ordinary multipliers, Skill multipliers and Skill-flat sources in that order; independent Final Damage effects multiply. Main/Sub Options are amplified by equipment-slot Star Force; Scroll/Potential/Bonus Potential are slot systems. The dictionary defines crit chance, a full critical-hit multiplier, resistance lowering the attacker's rate and job attributes contributing to Attack/Stat Prop. Damage. It does not publish a complete ordinary resistance/overflow/event mapping or attribute conversion in the inspected material.

The [August13 official patch](https://forum.nexon.com/maplestoryidle/board_view?thread=3522342) was freshly found and then independently rendered. Its Ring of Cycles effect changes periodically according to current Critical Rate: below100% grants Critical Rate; at/above100% grants Skill Damage; excess-rate bands grant Basic Attack Damage. This confirms a concrete cross-family threshold confound, **not** an ordinary critical-overflow damage rule. Current artifact ownership/effect balance and build must be checked before any artifact implementation. Search results from other MapleStory games/fan sites were not used as formula evidence.

Freshly rendered [September3 official patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3537355) adds important source taxonomy: Pocket **main** options are Attack/Max HP/Accuracy; its **sub** options include Attack, Crit Rate/Damage, Boss/Normal Monster Damage and Damage. Chaos Black Bean Mark has fixed **sub** option Final Damage3.5%. The same patch publishes one Main Option Amplification and one Sub Option Amplification value per Star Force stage: examples12★ 200%/25%,15★ 300%/50%,20★ 600%/100%; stages20+ also add a **separate slot FD effect**. Thus lower percentage item rows must not be declared unamplified merely because they appear beneath the main-option divider. The Star Force table provides a bounded shared-sub-stage inference below. It does not explicitly say whether comparison On-Equip values are displayed before or after amplification. The [official probability reference](https://now.nexon.com/service/maplestoryidle?page=2f87399c-b39f-4a71-b9d1-7bdad173a17a), reached through guide navigation and rendered, supplies enhancement probabilities but did not settle display-stage semantics.

## Direct answer: no universally essential character number

Given complete, corrected item panels and an admitted source/scenario contract, no character total is universally required. Some whole-item comparisons can be proved from source directions or conservative bounds. Other comparisons are mathematically underdetermined from the panels: the same pair can reverse with a different unchanged baseline. A missing mechanic is a separate issue from a missing number. Asking for every familiar stat does not solve it.

The existing engine already performs whole-comparison coordinatewise dominance. Its next defensible extension is a complete-factor symbolic/interval proof, including opposing directions when a guaranteed gain exceeds every possible admitted loss. A shared-sub-amplification polynomial proof can avoid assuming whether visible sub-option values are pre- or post-amplification. This is a mathematical deduction from the published rules and explicit source contract, not a new empirically measured game law. Preserve source attribution, completeness, same-slot/common effects and exceptional-attack guards.

## Exact algebra and safe unknown domains

Use fractional bonuses below; displayed percentages must be divided by100 exactly once. All bounds concern effective admitted source values. OCR/display strings do not by themselves establish internal rounding bounds **or whether a source is already amplified**. Main/Sub Star Force amplification is a critical admission dependency, not an automatically solved fact because the label is On-Equip Effect. The preceding dominance engine could preserve direction under unknown common positive amplification; finite magnitude bounds need more.

### Additive damage buckets

For old item contribution `c`, new `n` and common contribution `U>=0`:

```text
R_bucket(U) = (1+U+n)/(1+U+c)
R_bucket in [min(1,(1+n)/(1+c)), max(1,(1+n)/(1+c))]
```

This enclosure needs **no player total**. It is conservative: endpoint1 may be a limit at unbounded U rather than attainable. Closed bounds must abstain at equality; do not turn a limiting equality into a strict win without a proved open-endpoint argument.

If `c,n` are instead pre-amplification visible values with unknown common `h>0`, the effective ratio is `(1+U+h*n)/(1+U+h*c)`. Then `(1+n)/(1+c)` is not a universal endpoint. For `c>0`, a safe broader enclosure lies between1 and `n/c`; for `c=0,n>0`, the upper side is unbounded. Do not assume identical amplification rates across different stat families from the guide's word “amplified.” Using the tighter first enclosure requires independently established effective-source semantics or an explicit conditional scenario, not an opaque checkbox that purports to verify game mechanics.

Only when that interval could reverse the whole result can an affected bucket's current total `T=U+c` help:

```text
R_bucket(T) = (1+T-c+n)/(1+T) = 1+(n-c)/(1+T)
T>=c
```

For an explicit reliable enclosure `T in [L,H]`, evaluate the monotone ratio at both ends; intersect with `T>=c`. No candidate-equipped value is required. A displayed current total alone is not certified exact. Do not invent ±0.5, ±0.05 or truncation intervals from formatting. If entered totals are used as scenarios, label the result conditional on those entered scenario values/bounds. A player assurance that a rounded number was copied correctly does not establish its hidden precision.

Applicable families are Damage, Damage Amplification, Normal/Boss Monster Damage and Basic/Skill Damage. A missing reviewed source is zero only under the complete-list/source contract. Changed target-inapplicable bonuses are excluded only from that target branch. Unknown negative/conditional contributions invalidate `U>=0`; do not extrapolate these bounds to an arbitrary debuffed baseline.

### Attack: directional and bounded magnitude without final totals

For the existing admitted single same-slot main-option flat Attack source, published order and common positive amplification give:

```text
A_current = B + g*c
A_new     = B + g*n
B>=0, g>0
R_attack  = (B+g*n)/(B+g*c)
```

`B` includes the common nonnegative other flat/Skill-flat contributions; `g` includes shared source amplification and multiplier stages. For `c>0`, `R_attack` lies between1 and `n/c`. If `c=0,n>0`, the conservative upper bound is unbounded and the lower is1, provided current Attack is positive. For `c>0,n=0`, enclosure is[0,1]; zero denominators/current Attack and invalid quantities abstain. Both source values0 offer no strict Attack gain. Do not represent infinity as an arbitrary large game cap.

This extends the **existing bounded main-source inference**, not general row-stage reconstruction. Extra/repeated Attack, Attack%, changed Main Stat/skill/passive effects and unidentified main/sub amplification remain excluded. A source ratio is only one factor of the admitted comparison; it cannot override an unsupported changed effect.

Current final Attack alone does not fix the magnitude. In `A=F*M*S+K`, a new gear flat source changes `A` by `g*(n-c)`, while the screenshot total reveals neither `g` nor the shared stage decomposition. Even exact `A` plus both item numbers cannot identify `g` when `K`/other stages are unknown. A current-total field would therefore be unused or misleading in this scope.

### Independent Final Damage

For a single verified independent old/new source:

```text
R_FD = (1+n)/(1+c)
```

Unchanged independent sources cancel; character total FD is not required. Multiple sources require identified independent products, not a sum or ordinal pairing. FD's fixed ratio can overcome an opposing bucket or Attack bound, producing a useful no-extra-input tradeoff recommendation.

The fixed ratio also requires **effective** independent old/new source bonuses. If an unknown shared source amplification maps visible `c,n` to `h*c,h*n`, the source ratio is `(1+h*n)/(1+h*c)`, not necessarily `(1+n)/(1+c)`. It receives the broad unknown-`h` enclosure instead. Do not introduce a universal mixed-tradeoff winner from pre-amplification values. Discovering/validating what the comparison UI displays can unlock this scope without collecting more player character totals.

### Whole comparison and sensitivity

Multiply conservative positive factor enclosures. An interval entirely above1 establishes New equip; entirely below1 establishes Current equip. Include **every** material changed admitted offensive family. An interval containing1 means No reliable preference; unsupported changed effects block regardless of the ratio. Exact rational arithmetic avoids silently reversing a close sign through floating cancellation. Cap computational representation separately from game-stat caps.

Synthetic **effective-source** example, not player evidence: removing10% effective Damage gives a bucket ratio in[1/1.1,1]. Gaining20% effective independent FD gives1.2. Their product is at least1.2/1.1>1, so the entire admitted item wins without a Damage total. This is more useful than rejecting every mixed direction **once those source semantics are established**; unknown amplification is not resolved by this example.

Counterexample proving conditional information is sometimes necessary: old main Attack100, new110 with an independent FD ratio0.95. If `B=0`, ratio is1.045; for sufficiently large `B/g`, ratio approaches0.95. Identical item panels can favor either item. No arbitrary default Attack or player weight can settle it.

When several unknown buckets remain, evaluate which missing enclosure can change eligibility; request/tighten only those. A midpoint/sample-grid winner is not a proof over a continuous/unbounded domain. Optional values must share the same model and source rules with the basic calculation; they may shrink uncertainty, not bypass a mechanics blocker.

### Stronger useful zero-input proof with unknown shared sub amplification

The September3 table gives a single Sub Option Amplification at each slot stage, including fixed and random sub-option examples. The bounded inference is that admitted percentage **sub** sources in the same slot share one positive multiplier `g`, while the slot/preset is unchanged. If values already include amplification, `g=1`; if not, `g` represents that common amplification. This does not mix main-option Attack into `g`, establish a universal row schema or establish rounding. Require observable same sub-section/source review; a generic claim of “effective exact values” is not a substitute.

For additive bucket `j`, old sub contribution `c_j`, new `n_j`, and unchanged nonnegative contribution `U_j`:

```text
R_j = (1+U_j+g*n_j)/(1+U_j+g*c_j)
R_FD = (1+g*n_FD)/(1+g*c_FD)
```

Form the complete product `N/D` and expand `P=N-D` as a polynomial in `g` and the unknown `U_j`. All denominators are positive on `g>0,U_j>=0`. If every coefficient of P is nonnegative and at least one strictly positive coefficient multiplies a pure power of g (no possibly-zero U), P is strictly positive across the full domain. The negative counterpart proves the current item. Identically zero means no strict preference. Mixed coefficients do **not** mean a winner; they mean this sufficient certificate failed. Do not sample the domain or assign a typical g/U.

Concrete synthetic whole-comparison example with no character total and no assumed amplification number: FD20%→40%, Damage20%→10%:

```text
N = (1+.4g)*(1+U+.1g)
D = (1+.2g)*(1+U+.2g)
P = .1g+.2gU > 0 for every g>0,U>=0
```

This establishes New equip under the complete admitted source/scenario contract despite opposing factors. The source magnitude uncertainty is carried through the proof. Merely separate interval multiplication can miss this proof by discarding shared-g dependence.

The nonnegative-U domain is an additional scenario restriction. The guide does not prove all possible debuffed baselines are nonnegative. Make the no-stat-reducing-effects restriction visible for this stronger mixed-proof scope; do not silently reuse “same buffs” as if it excludes negative effects. If negatives, unmodeled threshold side effects, main/sub mixing, unknown source groups or nonpoint source uncertainty cannot be enclosed by the certificate, abstain. Positive-coefficient proof over entered source values remains conditional on those source values and the shared-amplification inference, not a live-game accuracy claim.

## Critical Rate / Critical Damage

If an eligible ordinary branch establishes effective critical probability `p` and full multiplier `C`, and other outcome factors have the required common distribution/independence:

```text
E_ordinary = common * A * applicableBuckets * [1+p*(C-1)]
```

This expectation is probability algebra. Entering displayed Critical Rate is not evidence for a universal `p=min(rate,1)` rule, resistance subtraction, eligibility, or artifact/passive independence. Changed crit remains a mechanics blocker until the effective mapping and side effects close. A minimum-input path must not create a misleading universal two-field crit form now.

Once that mapping exists, crit rate tradeoffs generally consume both effective rate and full Critical Damage, but a field can sometimes cancel: with only multiplier changed and an unchanged positive crit probability, sign is determined by the multiplier; a zero eligible probability creates equality. When other factors trade off, rate and multiplier can both affect magnitude. Unknown event domains may sometimes prove a side cannot lose, but unknown cross-family threshold effects such as Ring of Cycles prevent treating every crit source as an isolated monotone factor.

For nonlinear content transformations, transform each critical/noncritical outcome before weighting. Expected pre-content damage followed by a square root/cube root is not generally the expectation of transformed hits. Missing range/status correlations or attack mixture can block that stronger claim even with all displayed player totals.

## Minimum and advanced input specification

| Input | Consumer | Basic necessity / omission behavior | Acquisition and advanced boundary |
| --- | --- | --- | --- |
| Complete typed item sources and units | Every replacement and eligibility rule | Always required, already in crop review | Correct beside crop; source duplicates/unknowns stay explicit |
| Current character Attack | No consumer in universal Attack bound | **Do not ask** | Useful only with identified marginal gain/stages; alone cannot unlock tradeoffs |
| Affected additive bucket total/enclosure | `1+(n-c)/(1+T)` only at effective source stage; shared-g variant otherwise | Conditional only after basic proof fails and mechanics admit the entire comparison | Manually copy only that named detailed stat; display rounding and source stage unresolved. Optional advanced bounds/scenario must state conditional semantics; no screenshot/full sheet |
| Total Final Damage | Cancels in independent-source ratio | **Do not ask** | Not needed for identified independent source replacement |
| Critical Rate + Critical Damage | Effective critical branch expectation | Not collectable-as-a-fix while effective mapping is unresolved | Later conditional pair; total full Critical Damage units must be clear; target resistance/side effects cannot be guessed |
| Job / level | Attribute/skill conversion or specific mode rule | **Do not ask in implemented ordinary scope** | Only add with actual sourced conversion/profile consumer; job does not identify every passive or skill preset |
| Accuracy / HP / MP / defenses | Landing, survival, resource/cadence objectives | No numerical question under explicit landed-hit objective | Complete activity performance needs additional models, not hidden defensive weights |
| Target/activity selection | Profile applicability | **Never required as a user question** | Evaluate every supported profile and attack branch; if winners differ across an unknown mixture, abstain rather than selecting a user activity |
| Source/display uncertainty bounds | Conservative factor enclosure | Omit = no invented bound | Explicit optional intervals can tighten a scenario only if they enclose values; invalid, overlapping or reversing bounds abstain. An unknown amplification stage is separate from value rounding |

Universal numeric character questionnaire: **empty**. Initial basic admitted comparisons can use no numeric totals. An advanced disclosure can show only implemented changed-family enclosures (or a clearly labeled sensitivity scenario), preserving all values across re-renders. It must not request a full sheet or imply unsupported crit/attribute profiles become supported by completion. For tradeoffs whose mechanics remain unresolved, explain that blocker before asking unused totals.

## Activity eligibility and automatic branches

| Result row / activity | Sufficient current scope | Missing dependency for stronger claim |
| --- | --- | --- |
| Ordinary normal-monster hits | Complete admitted source factors; evaluate Basic and Skill branches | All applicable branches must establish same strict side, otherwise no aggregate preference; excludes DPS, survival and named mode completion |
| Ordinary boss-monster hits | Same, Boss bucket instead of Normal | Same branch/exception limitations; ordinary boss class is not a complete named raid |
| Chapter Hunt / Challenge | No full activity profile established by this pass | Actual eligible attack mix, resource/cadence/survival, exceptional content rules; absence of a named guide row does not prove identity transform |
| Zakum/Horntail Boss/Guild Raid, Party Quest | Published square-root-related stage is a lead | Complete transformation/exception/rounding and outcomes; scalar magnitude tradeoffs must not substitute expectation before transform |
| Guild Training Ground | Published cube-root-related stage is a lead | Same complete outcome/profile gate |
| Pink Bean / other later raids | Not interchangeable with earlier raid series | State/phase buffs, received damage as HP changes and current encounter rules |
| Arena / World Arena / Colosseum | Unsupported full equipment preference | Defender prebattle offense and defense, level/content transforms, critical adjustment and survival/objective; offensive winner alone insufficient |

Do not ask the player to choose Basic versus Skill as a substitute for automatic results. Evaluate both; agree => eligible aggregate ordinary preference, differ/no strict gain in one branch => explicit limited/no reliable aggregate preference. Unknown nonnegative mixture weights cannot justify selecting the better branch.

## One-owned-item reversible Attack experiment

The purpose is **diagnosing the mapping from visible gear Attack to character Attack**, not requiring an unavailable candidate or validating damage/DPS. A second specially matched item is not required for this diagnostic.

First verify in the actual client that an already owned item can be unequipped and re-equipped without automatic replacement. Use a naturally existing nonweapon item if possible; do not buy, reroll, upgrade, consume items, change job or manufacture a clean slot. Record its complete visible effects. Prefer a single flat Attack main option and no Main Stat/Attack%/skill-level effect. Damage/crit/HP lines do not automatically confound the Attack stat, but any threshold/passive that changes Attack does.

Smallest measurement, only if unequip is available:

1. Keep preset, job, level, equipment elsewhere and slot enhancements fixed. Avoid combat/timed effects; do not assume entering a town clears every buff. Wait for two stable character Attack readings and record exact displayed text/units.
2. Unequip **that one owned item**, record two stable Attack readings, and note whether slot effects/potentials/scrolls deactivate or their displayed values change. Record any buff/artifact/preset change.
3. Re-equip the original item and record two stable readings. Return-to-original disagreement means the trial is not a clean calibration.

```text
Client date/build (if visible):
Item slot and complete Attack-affecting options:
Star Force / slot options (unchanged? visible inactive when empty?):
Equipped A: Attack [reading 1] / [reading 2]
Empty slot: Attack [reading 1] / [reading 2]
Re-equipped A: Attack [reading 1] / [reading 2]
Buff / artifact / preset changes or uncertain observations:
```

This is one precise optional task, not an app prerequisite. Text values suffice; no all-stat screenshot is requested. If unequip is unavailable, return “cannot unequip”; do not ask the user to find a matched pair again.

### What it identifies and what it cannot

If the only changed Attack source is known flat `c`, exact stable observations give `g=(A_on-A_off)/c`. It falsifies raw-total-plus-item-delta if the measured difference is incompatible with `c` after justified display intervals. It estimates a **local effective marginal response**, not every component `F,M,S,K`.

If emptying a slot also changes unknown enhancement/potential effects `H`, then `A_on-A_off=g*c+H`. One observation cannot separate `g` from `H`; even perfect readings are nonidentifying. Changed Main Stat, Skill levels, set thresholds, artifacts and buffs similarly confound the response. Slot attachment publication alone does not prove slot effects stay active with no item equipped. Rounded displays add a second unresolved source of uncertainty; repeated stability detects drift, not hidden rounding error.

Therefore a clean result may be **diagnostic evidence only**. Do not use it to predict candidate totals until slot-empty behavior and source/display precision are identified, and do not claim game-wide source law from one character. A naturally unenhanced slot with no Attack-affecting extra options would improve identifiability if already available, but must not become a burden. If no isolatable reversible action exists, preserve the precise evidence blocker and continue interval/dominance recommendations independently. The app should never demand this experiment from every visitor.

## Verification boundary

The equations above are derivations under explicit domains. Software QA should independently challenge endpoint limits, zero denominators, product cancellation, source uncertainty, swap symmetry, unknown-effect blockers, Basic/Skill agreement and counterexamples where a baseline reverses the result. No tests were run by this documentation specialist; independent QA owns execution. Published formulas, successful arithmetic tests and game prediction validation remain separate evidence levels.
