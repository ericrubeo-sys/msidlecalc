# Independent minimum-input QA

2026-10-24. Independent QA owns this report and `tests/minimum-input-independent.test.mjs`. Application and numerical-engine implementation are owned by the integration engineer. Production changes are outside this task.

## Acceptance principles

The question is whether a complete admitted equipment comparison establishes a strict preference for every permitted value of its unknowns. It is not whether one favorable item stat has increased. Missing data, an unimplemented law and an effect outside the stated objective must have distinct outcomes. Software agreement with an encoded formula does not establish the formula's applicability in the live game.

No character value is universally necessary for a coordinatewise comparison whose every relevant effect is non-worsening. Conversely, a mixed-sign comparison does not automatically require every character total. A fixed independent Final Damage ratio can outweigh even the worst permitted loss from another factor. Questions should be generated only after that conservative proof fails, and only for changed, applicable factors that the implementation consumes.

For an additive bonus family with unchanged nonnegative background `u`, old item bonus `c` and new bonus `n`, the factor ratio is `(1+u+n)/(1+u+c)`. Its conservative enclosure over `u>=0` is bounded by 1 and `(1+n)/(1+c)`. This enclosure can prove a choice but must not be presented as a predicted damage change. Unknown background is not automatically zero. Different additive families must keep separate backgrounds.

For one admitted positive flat main Attack source, common source amplification and other unchanged nonnegative contributions can preserve direction while diluting magnitude. Displayed final character Attack alone does not establish the source decomposition of `A=F*M*S+K`. No test should authorize adding a raw main-option delta to that final total.

## Required adversarial coverage

- Candidate/current swap reverses a strict preference; equal items, ties, possible reversals and touching uncertainty bounds never force a winner.
- Independent Final Damage factors multiply. Additive Damage, Amplification, Monster and Attack-type buckets remain separate; neither percentages nor duplicate source rows are indiscriminately summed.
- A mixed comparison can be decided with no character data only if the entire admitted ratio enclosure establishes one side. A valid baseline can narrow uncertainty; an invalid, irrelevant or missing baseline cannot silently become zero.
- Automatic Basic/Skill and Normal/Boss evaluations must not invent an attack mix, target identity or intended activity. Opposite preferences across attack classes cannot become a universal winner.
- Every named activity must be represented honestly; the presence of an activity row cannot enable unfinished mode rules.
- Unknown, repeated, changed critical/attribute/skill and other unresolved offense cannot vanish behind a large supported benefit or a stale OCR-noise flag.
- Missing item values, malformed containers, duplicate line identities, negative/nonfinite/out-of-policy values, numerical overflow/underflow and inadequate precision must abstain safely.
- Essential questions exclude unchanged, cancelled and inapplicable factors. Optional advanced precision cannot authorize an unresolved source law, guessed critical cap or nonexistent skill model.
- Permuting item lines and automatic result order does not change arithmetic; inputs remain unmodified. Retaining a value across edits must not retain obsolete eligibility or a prior result.

## Evidence boundary

Fixtures authored in this pass are synthetic arithmetic examples. They do not measure OCR recognition, physical-phone interaction or game damage. Primary mechanics findings are attributed to the separate research specialist. A reversible Attack experiment can falsify a proposed attachment law only when other material causes are isolated; repeated stable numbers alone do not identify hidden source stages.

## Integrated arithmetic review

Initial integrated run: `node --test tests/minimum-input-independent.test.mjs` **17 passed, 0 failed**. This is an arithmetic/contract checkpoint, not approval of percentage-source attachment or live-game predictions. Independent inspection checked exact BigInt rational interval arithmetic, additive-current-total replacement at all interval corners, strict preference against 1, unbounded Attack response handling, normal/boss applicability, automatic basic/skill agreement and named-mode abstention.

The fixed-FD/additive fixtures explicitly require effective percentage-source values: FD20→40 with Damage20→10 gives a conservative ratio interval `[77/72,7/6]`; FD20→30 with the same Damage loss has exact ratio143/144 at current Damage20%, but favors the other item at a sufficiently larger current total. A boundary whose lower ratio is exactly1 abstains. An18-place percentage fixture exercises a mixed-factor preference that would disappear in ordinary floating-point `1+bonus` arithmetic.

An additional deterministic120-case invariant checks every chosen side against16 independently evaluated admissible Attack/background combinations and verifies swap reversal. These samples support the implementation's algebra; they do not exhaust an infinite uncertainty domain or establish game laws.

The first audit found that an explicitly supplied null bucket enclosure silently became absent data. The implementation owner corrected malformed bound-container handling; the regression now passes with a fixture that would otherwise establish a winner, so it cannot pass merely because the underlying comparison was already uncertain.

The independent reviewer also flagged a UI integration risk: reusing only unresolved precision opportunities as the entire Advanced field catalog could remove a consumed editor immediately after entry. The calculation planner may remove an unnecessary question after a winner is established, but the UI must retain entered refinements and an editable Advanced control. Browser/value-retention verification belongs to integration QA.

## Source-stage guard and new shared-source proof

The mechanics specialist subsequently identified an important source-stage question: the Equipment guide says Star Force amplifies Main/Sub Options, while the typed percentage row alone may not establish whether its shown value is already the effective amplified contribution. Therefore `(100+n)/(100+c)` and exact independent FD replacement require a verified effective-source contract. A current aggregate total does not identify an unknown raw-source amplification by itself.

The exact numerical extension is therefore gated by the technical API contract `sourceContract:'effective-bonus-sources'`. All tight numerical-enclosure fixtures explicitly use synthetic effective-source values. The public upload route must not acquire this contract from a checkbox. A sensitivity scenario using that contract is not the actual equipment result.

The mechanics specialist's fresh rendered [September3 official patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3537355) attributes Damage/Critical/Monster percentage rows and a fixed Final Damage row to Sub Options, with separate Main/Sub Star Force amplification tables. That inspection is attributed evidence, not independently rendered by QA. The new default proof can leave the common positive Sub amplification `h` unknown: it compares full damage-product polynomials for every `h>0` and every independent unchanged nonnegative background. Main Attack has its own independent response variable; it does not inherit Sub amplification.

Independent algebra confirms the useful example FD20→40 and Damage20→10: after positive denominator removal, the difference is `0.1h+0.2hU`, strictly positive for all allowed `h>0,U>=0`. In contrast FD20→40 and Damage40→20 produces only `0.2hU`; `U=0` remains a tie, so the implementation must abstain. With independently scaled FD and Damage, the first example can reverse, so observable same-slot lower-Sub-section review is a consumed source premise. Display rounding and the claimed common source mapping remain conditional, not empirically validated.

The coefficient criterion is sufficient, not necessary: all coefficients must have the chosen sign, with at least one strictly signed monomial depending only on positive `h` or the constant term. A positive coefficient requiring an unknown strictly positive background cannot establish universal strictness. Any mixed coefficient signs abstain rather than sampling a convenient state.

## Final focused verification

Executed `node --test tests/minimum-input-independent.test.mjs`: **25 passed,0 failed**. This includes17 effective-source arithmetic/eligibility groups and8 shared-source default-route groups. The latter verify source/nonnegative premises, zero-background ties, independent Main amplification, no invented ratio magnitude, automatic Basic/Skill agreement and unavailable named modes. A second deterministic120-case invariant checks shared-polynomial choices across12 independently evaluated amplification/background combinations each and swap reversal. Inputs remain synthetic; no held-out game observation, OCR test or physical-phone test was performed by this reviewer.

No unresolved arithmetic blocker was found in the inspected pure module. The source inference, entered-value retention and browser integration require their own attributed evidence, and complete named activities, critical tradeoffs and actual predictive accuracy remain unfinished. Production is not approved by this QA checkpoint.
