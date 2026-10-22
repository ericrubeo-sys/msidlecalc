# Model QA audit — 2026-10-22

Independent QA Breaker review. Scope: existing comparison code, the mechanics audit/source ledger, and the recovered `damage-recommendation-model-plan.md`. Recovered planning is a draft, not evidence of live-game correctness. This review changes documentation only; no app/public files or regression fixtures were changed.

## Finding

The current code correctly abstains from a damage verdict. It is a raw six-field comparison, not a damage engine. Its four existing tests pass. Those tests establish the present parsing/difference/abstention contract; they do not validate any game formula, cap, equipment replacement, or DPS claim.

The most dangerous proposed step is the recovered plan's generic instruction to add item deltas to current totals. Replace that instruction before implementation. It is valid only for a verified additive family at the same aggregation stage. For other families, obtain confirmed post-equip totals for both states, or reconstruct and replace the relevant source before reaggregation. Neither item screenshots nor an aggregate baseline establish this by themselves.

## Evidence checked independently

Read the rendered [official English guide](https://maplestoryidle.nexon.com/en/guide), Battle System Guide and Stat Dictionary, on 2026-10-22. The page displays an October 15, 2026 update date. Sections 1.1–1.3 specify permille units, remaining-cap aggregation, multiplicative Final Damage, ordered flat/percentage/skill aggregation, defense mitigation, and damage ordering. Section 2.1 names nonlinear mode adjustments; skill coefficients follow them. The dictionary identifies main/sub attributes as contributors to Attack and Stat Prop. Damage, and critical damage as a multiplier. Section 4.2's critical-rate limit concerns the PvP adjustment. These are published rules, not measured confirmation of the live game. No game build number or empirical sample was established here.

The page does not establish the missing conversion coefficients, ordinary critical overflow behavior, range distribution, full accuracy curve, or a complete skill/rotation/target dataset. Do not turn a dictionary description into numerical coefficients, or a named mode table into support for every boss.

## Required acceptance cases

All numerical examples below are synthetic algebra fixtures, not player data or observed game results. They check an implementation of an explicitly selected rule. They cannot establish that the game's inputs and hidden behavior match that rule.

| ID | Setup / trigger | Required result or gate |
| --- | --- | --- |
| R1 — additive delta | A family is proven additive, baseline includes the old item once, and no later multiplier changes. | Candidate total equals baseline minus old contribution plus new contribution. Reject use of this shortcut for another family merely because the UI calls both values percentages. |
| R2 — flat before multipliers | Synthetic flat sources: other=100, old=10, new=20; ordinary multiplier=1.5, skill multiplier=1.2, final skill flat=5. | Old total=203, new total=221. Adding the raw +10 to 203 incorrectly gives 213. Stage and source identity must survive normalization. |
| R3 — remaining-cap replacement | Cap=100%, unchanged sources aggregate to 50%; old source=20%, new=40%. | Current aggregate=60%, candidate=70%. Aggregate +20 percentage points incorrectly gives 80%. |
| R4 — cap inverse ambiguity | Current total=100%, old source=100%; unchanged sources unknown. | Refuse inverse reconstruction. Many different unchanged aggregates produce the same current total, and replacing the old source can expose different totals. A total at cap does not prove the replacement has no impact. |
| R5 — cap inverse validity | For independent cap-fill sources, exact uncapped aggregate T, cap C, old source x. | Inversion `(T-x)/(1-x/C)` is permitted only with verified source semantics, x≠C, sufficient precision, and valid bounds. Rounded/clamped display totals need uncertainty handling; near-cap inversion can amplify rounding greatly. Prefer confirmed A/B totals. |
| R6 — Final Damage replacement | Aggregate bonus=56%, old source bonus=20%, new source bonus=40%; unchanged independent source=30%. | Candidate multiplier=`1.56/1.20*1.40=1.82`, i.e. bonus=82%. Adding +20 points incorrectly gives 76%. Never confuse a bonus percentage with the full multiplier. |
| R7 — units | Same input represented as display 30% and internal 300 permille. | Both normalize once to multiplier 1.3 for a `(1+bonus)` bucket. Critical multiplier, flat units, skill coefficient, and cap use explicit types; do not apply `(1+bonus)` to a full multiplier. Ambiguous OCR units require confirmation. |
| R8 — defense | Ordinary eligible attack, target Defense=0, then penetration reaches its verified cap. | The published defense factor at zero post-penetration Defense is `5000/6000`, not 1. Do not remove mitigation simply because penetration is 100%. Defense changes have no penetration benefit when target Defense is already zero. |
| E1 — expectation order | Synthetic eligible pre-transform outcomes B: 100 and 400, each probability 0.5. A: deterministic 230. Compare a pure square-root context with equal final coefficient. | True transformed expectations: B=15; A≈15.16575, so A wins. `sqrt(E[B])≈15.81139` incorrectly makes B win. This is a ranking error, not just rounding. The same conceptual test is required for cube roots. |
| E2 — coefficient order | Synthetic pre-transform damage=100, coefficient=4, square-root transform. | Result=`sqrt(100)*4=40`; `sqrt(100*4)=20` is wrong. Do not put skill coefficients under the context root. |
| E3 — critical boundaries | Effective critical probability 0 and 1, then a supported intermediate probability. | Endpoints equal noncritical/critical branch results; intermediate expectation averages final branch outcomes. Above-100% displayed rate, resistance, and ineligible attacks require explicit supported semantics, not a universal clamp borrowed from PvP. |
| E4 — min/max | Equal range endpoints, then distinct endpoints with no known distribution. | Equal endpoints are deterministic. Distinct endpoints do not justify assuming a uniform distribution or using their mean before a nonlinear transform. If min exceeds max, do not borrow the PvP-adjustment convention for ordinary hits without evidence. |
| M1 — Main Stat | Item main stat changes; job mapping or attribute conversion is absent. | No numerical overall winner. Request confirmed A/B Attack and Stat Prop. Damage, or verified job-specific conversions/source decomposition. Never assign the raw main-stat delta an invented weight. |
| M2 — totals and passives | Confirmed A/B totals already contain a skill passive or passive artifact contribution. | Do not add that contribution again. A changed skill-level line also requires verification of affected skills, coefficients/passives, and any cadence effects. Tier level is not a damage multiplier. |
| C1 — unsupported changes | Supported Attack change plus unknown offensive option, skill level, conditional trigger, or unmodeled cadence change. | May explain the supported partial effect, but cannot present it as a complete equipment winner. Preserve the unknown line and state the missing dependency. Low confidence alone does not make an incomplete ranking valid. |
| C2 — activity switch | Same A/B values; switch exact target, stage/difficulty, or attack classification. | Re-evaluate profile eligibility and relevant buckets. Broad `boss`/`chapter` labels do not select a verified transform. Exceptional attacks must explicitly bypass applicable stages. |
| C3 — irrelevant deltas | Adequate survival/hit assumption; only HP/Defense/Evasion or proven surplus Accuracy changes. | These add no hidden offensive weight. This conditional objective does not prove the stats useless in all encounters. No guessed hit-rate interpolation. |
| D1 — per-hit versus DPS | A deals 200 once per 2 seconds; B deals 150 once per second, same stable conditions. | A wins per-hit; B wins throughput (100 versus 150 damage/second). Per-hit evidence alone cannot establish sustained DPS. Real schedules additionally need skill counts, delays, resources, triggers, uptime, and attack mixture. |
| D2 — relative DPS exception | Every affected attack has the same supported relative damage factor, and unchanged hit counts/timing/uptime over the stated horizon are demonstrated. | A relative throughput statement can follow conditionally. Record the invariance assumption. Equal average per-hit damage across different mixtures is insufficient. |
| G1 — invariants | Equal complete gear states; swapped complete gear states; zero baseline damage; invalid/nonfinite intermediate arithmetic. | Equal states tie. Positive A/B ratios are reciprocals when swapped; percentage changes are generally not negatives. Zero baseline must not display an infinite percent. Nonfinite/invalid intermediate results abstain. |

For expectation cases, the implementation should evaluate `sum(probability(outcome) * finalDamage(outcome))`, with the mode transform and final skill coefficient in their sourced positions. Distribution independence, event probabilities, rounding, and exceptions must be established for the supported case. The synthetic two-point example supplies its own distribution; it does not assert the game's ordinary min/max law.

For unchanged factors, require an algebraic cancellation argument before asking the visitor for more data. An unknown target Defense can cancel from a relative comparison when the same defense/penetration factor applies to both states and all relevant mode rules preserve that cancellation. It cannot cancel when penetration changes or the attack/mode uses different stages. Avoid both unsupported shortcuts and unnecessary mandatory inputs.

## Blocking data gaps for a first numerical result

1. A selected exact target/mode/attack profile with an executable, source-linked transform, including constants, exceptions, level/context rules, and valid version scope. “Square-root-based” prose alone is not a complete implementation for every listed mode.
2. Confirmed stable A/B character totals or a verified replacement procedure for each changed source family. Rounded totals need a precision policy. Same-slot enhancement transfer behavior must be established before assuming cancellation.
3. Every changed offensive consequence represented: correct job attribute mapping and conversions if totals are unavailable; affected skill effects; unknown options; eligible damage buckets and conditional effects. A six-field whitelist cannot support an unrestricted ranking.
4. Effective critical semantics and range law if either changes or fails to cancel under a proven comparison. Full hit behavior/target Evasion if accuracy matters. Defaults must be labeled assumptions and cannot manufacture missing empirical mechanics.
5. A supported cadence/rotation/uptime/resource model before a general sustained-DPS claim. The per-attack slice is useful but does not fulfill the complete sustained-DPS objective by itself.
6. Controlled in-game validation before raising model confidence: same context, stable stats, preset and buffs; repeated A/B runs; raw damage/hit/timing observations where available; predicted versus observed ranking and magnitude; held-out comparisons. CP agreement cannot validate DPS. Predeclare tolerances from measurement precision and observed variability rather than inventing a universal error threshold.

## Verification performed

- `node --test tests/comparison.test.mjs`: 4 passed, 0 failed (2026-10-22). No files changed by the test command.
- Read-only inline Node assertions passed for R2/R3/R6/E1/E2 arithmetic. These checks only verify the synthetic arithmetic above; they do not exercise a damage implementation, because none exists yet.
- No screenshots/player data collected; no in-game experiments, numerical-engine implementation, browser app QA, publication, deployment, or commit performed.

Recommendation: retain the current unavailable verdict until a narrow profile clears the applicable gates. Add the acceptance cases to executable regression fixtures when implementing that profile, after the pending visual checkpoint. Passing those fixtures establishes code consistency with the selected rules; empirical validation remains a separate gate.

## Isolated-primitives implementation review — 2026-10-22

Reviewed the subsequently added `public/domain/mechanics.js` and `tests/mechanics.test.mjs` independently. The primitives remain separate from the UI and the existing unavailable equipment verdict. Their explicit outcome distribution, replacement from known cap-fill sources, multiplicative Final Damage replacement, and coefficient-after-transform arithmetic follow the intended limited contract. Evidence metadata clearly separates published rules from absent empirical validation; the transform helper does not claim a complete mode profile. None of this establishes a validated game model.

`node --test tests/mechanics.test.mjs tests/comparison.test.mjs`: 10 passed, 0 failed. Additional read-only boundary probes confirmed rejection of zero/negative/nonfinite caps, invalid cap sources and probabilities; empty cap/final-source identities; zero damage/coefficient behavior; zero-baseline abstention; and a zero candidate's -100% change.

One concrete arithmetic defect should be fixed before integration:

- **Nonfinite percentage escapes the result guard.** `relativeImpact(1, Number.MAX_VALUE)` accepts the finite ratio but returns `percentChange: Infinity` with `reason: null`. JSON serialization turns that Infinity into null, making downstream interpretation worse. Validate the computed percentage with the existing finite guard and add a regression for a finite ratio whose percentage multiplication overflows. Overflow should reject/abstain consistently with other invalid arithmetic.

Two small contract issues should be cleaned up with the same bounded change:

- **Non-unit-cap comment is misleading.** The cap aggregator expects a source's absolute fractional rate in the same units as the cap, not a fraction of the cap. With cap=1.5 (150%) and source=.3 (30%), it returns .3; two such sources return .54. Clarify the comment and test a non-unit cap so a later caller does not normalize twice.
- **Tolerance permits a multiplier below the supported floor.** `replaceFinalDamageSource(1, 5e-13, 0)` returns `.9999999999995`, despite the contract requiring nonnegative bonus sources and a total multiplier at least 1. The current `1e-12` tolerance admits that impossible reconstructed source. Either reject inconsistent exact totals or explicitly clamp accepted floating-point roundoff to 1; preserve the rejection test for a materially excessive old source.

No app, public, or test files were edited by this review. These are guardrail/contract fixes, not a request to broaden the model or add visitor inputs.

### Resolution by integration owner

Fixed all three findings before commit: finite-check the computed percentage, document/test absolute source-rate units against a 150% cap, and strictly reject a reconstructed unchanged Final Damage multiplier below 1. Added regressions for percentage overflow and the tiny inconsistent-total case. Re-ran both test files after the fixes: 10 passed, 0 failed. These checks validate only isolated arithmetic and the existing raw-comparison safeguards; no game-model calibration or complete damage verdict is claimed.
