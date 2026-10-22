# Damage model independent QA

2026-10-22. Feature-branch review after the verified visual release `b827d72`. QA Breaker ownership: this report and `tests/damage-invariants.test.mjs` only. The audit/phase transition lessons, data contract, existing model QA, mechanics/source register and recovered planning were read before review. Production and OCR are outside this work.

## Evidence boundary

The official [English guide](https://maplestoryidle.nexon.com/en/guide) was fetched independently, but the available web extraction exposes only the landing shell. This reviewer could not open a browser surface. The Damage Mathematician supplied an ignored technical handoff from the rendered guide, which this reviewer read alongside the existing mechanics audit and full new model specification. That handoff is identified specialist evidence, not this reviewer's independent rendered-tab inspection. The previous mechanics audit explicitly describes rendered sections and date scope; that is existing research, not absent research. Source publication, implementation agreement and controlled live-game validation remain separate.

All numerical examples below are synthetic algebra fixtures. No player measurements, game validation or screenshots are reproduced.

## Independent acceptance criteria

- Raw item differences cannot be applied universally to displayed totals. Source replacement must retain flat/ordinary/skill stages, independently multiplied Final Damage sources and remaining-cap semantics. Saturated or rounded cap totals cannot justify an inverse reconstruction.
- No inferred Main Stat conversion, generic boss identity profile, arbitrary unknown-effect/skill/cadence weight or defensive CP contribution can resolve an equipment recommendation.
- Every changed offensive consequence must be accounted for. A partial attack factor can be useful while a full recommendation remains unavailable. Per-attack impact, relative sustained DPS, absolute DPS and clear probability need distinct scopes.
- Critical Rate plus an assertion of adequate Accuracy is not generally sufficient. For a trade of a 10% Attack factor against Critical Rate increasing from 20% to 30%, a full critical multiplier of 1.2 gives a factor `1.06/1.04`, below 1.1; multiplier 4 gives `1.9/1.6`, above 1.1. The critical multiplier changes the ranking. Unchanged critical factors may cancel only with supported algebra/context.
- Nonlinear modes must transform explicit outcomes before averaging, and apply skill coefficients in the documented stage. Unknown range distributions cannot become a uniform distribution by default.
- The minimum useful recovery input must match the missing dependency. A player cannot be required to equip an unavailable candidate; source decomposition/reaggregation is an alternate route where supported.
- Equal/swapped states, invalid and nonfinite arithmetic, unsupported contexts, unknown/repeated/unequal item lines, unit mismatches and missing confidence provenance require executable checks.
- Under explicit hit/survival/resource adequacy assumptions, HP, Defense, Evasion and surplus Accuracy receive no hidden outgoing damage weight. Exceptions require a sourced skill/context/resource mechanism.

## Concrete defects found and resolved

The following were reproducible arithmetic/metadata failures in the new feature modules, reported to the owning specialist and corrected before final verification. They are not observed game-mechanics failures.

| Finding | Reproduction / impact | Resolution and independent regression |
| --- | --- | --- |
| Positive ratio underflow appeared as a complete loss | Ordinary-stage Attack `1e308` versus `1e-300`, other factors 1, yielded ratio 0 and -100% despite positive candidate amount | Math now rejects positive ratio underflow. Independent test requires unsupported, without factors or equipment verdict. |
| Positive attribute product became zero | Flat `1e-200`, ordinary factor `1e-200`, skill factor 1 returned zero | Data added checked multiplication. Independent test requires rejection. |
| Tiny-cap exact inverse lost its entire result | Exact total/old source 0, new source and cap `1e-200` returned 0 | Data uses stable cap aggregation/normalization; independent exact test now returns `1e-200`. The tiny cap is a numerical fixture, not a published game cap. |
| Exact-total FD wrapper silently erased subprecision bonus | Exact multiplier 1, old bonus 0, new bonus `1e-20` returned multiplier 1 while the source-list API rejected that precision | Data applies consistent bonus precision guards. Independent test requires rejection. |
| Blanket implementation metadata overstated unsupported contexts | The initial claim register marked every claim synthetic-fixtures-only, including named profiles absent from code | Context now says named profiles not implemented; effective critical chance and trigger implementation have distinct limits. Independent assertions check these statuses. |
| Damage results lacked independently versioned data/revision metadata | Initial result included only model version/claim IDs | Math added formula/data versions and input revision passthrough. Independent test verifies both versions and revision 7. |

Math also added explicit weighting-underflow checks, and Data replaced cancellation-prone remaining-cap arithmetic with stable `log1p`/`expm1` computation. The independent tiny-source fixture preserves `1e-20` rather than zero. No game rounding was invented.

One QA assertion initially required every claim URL to be the guide; the subsequently added trigger claim correctly links the official Q&A. The assertion was corrected to allow both primary URLs and require per-claim sections. This was a test assumption error, not a source-data defect.

## Final verification and permitted scope

Latest `node --test tests/*.test.mjs`: **57 passed, 0 failed**, including **22 independent QA invariant tests** in `tests/damage-invariants.test.mjs`. These exercise ordered replacement, source identity/stage rejection, multiplicative FD, nonunit caps, saturated/rounded/impossible inverses, explicit full factors and outcome distributions, zero-defense mitigation, nonlinear expectation/coefficient ordering, equal/swapped states, zero baselines, unsupported effects/contexts, missing candidate state, provenance/version metadata, numerical failure handling and the isolated PvP defender-level stage reviewed below.

No unresolved blocking defect found in the reviewed new pure modules after the corrections. The isolated ordinary pre-content stage and source-reaggregation results remain partial explanations. Named Chapter, Boss, Guild and Arena contexts never gain numerical recommendations; complete-effects confirmation cannot override that scope. Missing Main Stat conversion, skill/cadence/trigger effects and unknown consequences do not receive arbitrary weights. Player HP/Defense/Evasion/CP are not accepted offensive factor IDs; `defense` specifically means the outgoing target-mitigation factor.

The new UI integration was inspected statically: its numerical path isolates explicitly confirmed independent Final Damage source bonuses, retains other item lines as unsupported, names its ordinary pre-content scope, reports Low confidence, links the source/version trace and shows separate unavailable battle-context cards. It does not require equipping the candidate or pretend this factor is a DPS/equipment result. Runtime UI/privacy checks and reviewable preview/deployment verification remain the integration owner's work.

Remaining product blockers are substantive rather than test failures: no complete validated named profile, unresolved attribute conversion/source decomposition, ordinary critical/range/hit semantics, skill/passive/cadence/trigger/resource dependencies, and no controlled game evidence. The complete requested equipment-recommendation product has not been achieved by these 57 synthetic tests. OCR evaluation belongs to the orchestrator and is outside this review.

## Follow-up: isolated PvP defender-level factor

Reviewed `pvpDefenderLevelRatio` in model v3 and its `MSI-G15-PVP-LEVEL` claim in dataset claims-3 against the attributed rendered-source findings and restored complete specification. This reviewer still does not claim independent rendered-tab/source transcription verification. The function returns only a relative receiver-level multiplier. It does not encode the defender prebattle-stat adjustment, attacker damage, skill coefficient, critical-resistance semantics or complete Arena equation.

Four independent test groups passed:

- Within-band products and transitions crossing the unambiguous 60/61 and 70/71 bands; multiplicative composition across intermediate levels; different above-100 Colosseum/Arena factors.
- Equal-level identity and reverse-path reciprocity. Decreases in defender level raise the relative received-damage factor; they are not a negative percentage-point subtraction.
- All paths crossing the ambiguous 99→100 transition reject in either direction. Same-level 100→100 and 100→101 do not consume that ambiguous transition. No provisional preferred interpretation remains in code or the current claim/spec.
- Unsupported modes, nonnumeric/fractional/unsafe/below-30 levels and extreme valid-integer spans causing underflow reject. Source ID resolves to guide §4.2; the three PvP modes still return unsupported from the complete-state comparison API.

No additional numerical or scope blocker was found for this isolated helper. Its evidence remains a published-rule interpretation tested with synthetic arithmetic, not live-game validation. The full Arena/World Arena/Colosseum recommendation remains unavailable.

## Interruption recovery verification

During the resumed review, `mechanics-data.js` and `DAMAGE_MODEL_SPEC.md` were observed at zero bytes after an interrupted edit. Their owners independently detected and restored them before testing. This was an interruption-recovery incident, not a persisting model regression. Final pre-test byte checks confirmed `damage-model.js` 9,278 bytes, `mechanics-data.js` 7,826 bytes, `reaggregation.js` 7,370 bytes and the complete specification 21,095 bytes. The restored registry exports resolve, the complete specification was read, and the full suite passed afterward. A successful write call alone should not substitute for post-write size/content/import checks and a checkpoint after interruption recovery.
