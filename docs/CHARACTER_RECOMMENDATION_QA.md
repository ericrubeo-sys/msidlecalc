# Character recommendation independent QA

2026-10-24. Independent QA for the dynamic character-input recommendation extension. This record separates software arithmetic verification from game validation. No player measurements have been supplied for calibration.

## Acceptance boundaries

- Complete corrected item records, source identities and confirmations must precede a recommendation. Main and Sub Attack are not paired by occurrence order.
- Every material changed offensive effect must be consumed or block the full comparison. Favorable Attack cannot suppress an unsupported line.
- Character fields are conditional consumers, not a universal sheet. Current final Attack alone does not identify Main/Sub source response.
- Unknown source amplification, rounding or character totals must be enclosed, not replaced with typical values. An uncertainty set that includes opposing preferences must abstain.
- Critical Damage uses a full critical-hit multiplier. Critical chance, resistance, overflow and threshold side effects require explicit scope; Low confidence cannot repair an unsupported event law.
- Named nonlinear adjustments must transform critical/noncritical outcomes before expectation. A monotone transform of the ordinary mean is insufficient when critical probability changes.
- Scope is damage for the same landed attacks unless a complete throughput/activity model establishes a stronger claim. No raw item difference or isolated favorable factor is a whole equipment verdict.

## Required independent fixture families

1. Both orientations of the supplied shoulder structure: main Attack9306 + Sub Attack3490 + Critical Rate7.3% + Normal7.5%, versus main Attack10251 + Boss7.5% + Normal7.5%. Other HP/Evasion/MP values remain outside the explicitly landed-hit objective.
2. Source identity ambiguity, Main/Sub amplification alternatives and safe Attack reconstruction boundaries.
3. Missing and malformed conditional character totals, no unused fields for cancellation, invalid units and numerical limits.
4. Swap/equality/permutation invariants; completeness and null-container guards; no input mutation.
5. Critical chance extremes, full multiplier semantics, uncertainty crossing a winner, unchanged effects and unsupported threshold effects.
6. Basic/Skill and Normal/Boss applicability; named contexts unsupported unless separately admitted.
7. Root transformation counterexample: current base1 with2% chance of full multiplier100 has ordinary expectation2.98; candidate constant2 wins after square-root per-outcome transformation because1.18<sqrt(2). Transforming the mean yields the wrong choice.

## Verification performed

Final `node --test tests/character-recommendation-independent.test.mjs`: **21 groups passed**. Initial19-group verification was followed by a numerical-limit blocker, an exact-linear-arithmetic repair and two regression groups. The suite was authored independently of the implementation and does not import its internal arithmetic helpers.

- The supplied shoulder structure, with invented internally consistent character totals and explicit neutral amplification/resistance, favored Current in the50000 Attack case. Reversing the item orientation with replacement-consistent totals favored New. These are synthetic scenarios, not the player's measured stats.
- At1000000 synthetic Attack, the shoulder Boss result correctly abstained: permissible source-response endpoints favor different items. It did not select the favorable main Attack row alone.
- Main/Sub roles, complete-list confirmation, malformed/null values, unsupported changed effects, fractional item points, invalid amplification/table stages and optional uncertainty guards passed. Row permutation and no-mutation checks passed.
- Critical Damage100% correctly produced no rate-only benefit; chance saturation produced no invented gain. An unknown-resistance case correctly abstained when resistance0% and80% favor New but the interior20% clipping point favors Current.
- The critical-branch nonlinear counterexample gave Current for ordinary damage and New for the explicitly assumed square-root raid model. The root of the ordinary mean was not substituted.
- The Attack uncertainty case intersecting a reconstructed source boundary retained a valid tie; it did not discard that boundary and invent a winner.
- Sixty independently generated complete comparisons checked every reported ordinary winner against direct full-product evaluation across both coherent display-stage scenarios, three admitted Attack responses and five resistance values. Sampling is supplemental falsification coverage, not a proof over every continuous state.
- Exact residual-rate regressions cover both parsed decimals near the magnitude limit and fractional amplified intermediates arising from integer inputs. A separate near100% chance/tiny full-multiplier case preserves the complementary noncritical probability; ordinary and root-transformed choices correctly differ.

Code audit found the Attack interval endpoints mathematically consistent when its lower total uncertainty lies below the reconstructed source but its upper total remains feasible. Current final Attack is useful only under the separately disclosed response-at-least-one model assumption. The experimental event law, nonnegative source stages and pure-root named-context models remain assumptions, not verified live-game facts.

## Release and evidence limits

**Numerical blocker found and repaired:** entered Critical Rate9007199254740990.9% with an old item contribution9007199254740990% was converted to Number before replacement. The exact residual is0.9%, but floating conversion produced1%. With Attack1000→1982, full Critical Damage200% and zero resistance, the engine chose New at ratio1.00091; exact decimal arithmetic gives0.999919, favoring Current. The alternative old-source9007199254740990.1%/total9007199254740991% has the same residual. Both values fall inside the advertised per-input magnitude/decimal grammar. A1e-10 final comparison guard could not cure cancellation before the ratio. Another fixture reproduced fractional intermediate loss after multiplying an exact integer Sub source by1.25.

The integration owner repaired linear source replacement, amplification, total differences, chance/resistance clipping and clipping breakpoints with BigInt rational arithmetic before converting positive factors for powers. Complementary probabilities are converted separately so1−Number(p) cannot erase a real noncritical branch. All three cancellation fixtures and the near100% complement regression passed. The arithmetic audit and final21-group run found **no remaining blocker within the declared experimental contract**. Fractional powers and final products still use guarded floating arithmetic; this is not a bit-exact game-rounding implementation.

Browser integration, real-device usability, OCR source-role fidelity, preservation of Advanced entries and hosted deployment are integration-owner checks. This report does not claim those were independently exercised here. Production publication remains the integration owner's authorized release step.

No controlled game measurements or calibration were performed. Low confidence reflects the experimental model; it does not certify actual battle outcomes, clear time, DPS, survival, artifact/passive thresholds or target rules. PvP remains without a preference. Optional uncertainty margins are user-supplied scenario enclosures, not a discovered display-rounding law. An entered point value is a point-model assumption until game precision is established.
