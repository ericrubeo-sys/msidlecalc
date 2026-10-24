# Character-driven offensive recommendation release

2026-10-24. User explicitly requests the implemented screenshot→confirm→minimum character questions→automatic context result flow to be published live for testing. This supersedes the earlier feature-only publication restriction for this reviewed experimental release. Work stays in msidlecalc and on the existing feature branch; production is updated only after checks. No paid APIs, new accounts, database, analytics or hosting/domain changes.

## Resulting behavior

Both crops and typed stat fields remain editable; confirming each item collapses it. Every flat Attack row now requires an explicit Upper Main / Lower extra source identity. Repeated unclassified sources are never blindly summed or aligned by order. For eligible item changes, a dynamic basic form requests only totals consumed by the implemented model. One Advanced disclosure exposes all supported totals, source amplification overrides, known target resistance and uncertainty margins. Entered values remain in this page session through item re-review and recalculation; they are not uploaded or persisted.

For the earlier shoulder structure (9306 Main+3490 extra Attack,7.3% Crit Rate versus10251 Main and7.5% Boss Damage), the basic questions are current character Attack, Critical Rate, full Critical Damage, Boss Monster Damage and slot Star Force. Unchanged Normal Damage, HP/Evasion/MP, job and level are not requested. No candidate-equipped stats, all-stat screenshot or controlled experiment is required. The user reports empty-slot testing is impossible; that experiment remains retired.

The basic source-domain proof still avoids numeric questions when it already settles both target/attack branches. Unsupported changed Main Stat, skill-level, percentage Attack, penetration, timing, trigger and unidentified repeated effects remain explicit blockers; requesting job or level would not implement their missing formulas.

## Official evidence versus model assumptions

Fresh official source reconciliation is in SHOULDER_MODEL_RESEARCH.md and SOURCES. Documented facts include full Critical Damage multiplier wording, Attack stage order, separate Main/Sub Star Force amplification and root-related named-content adjustments. The following are **explicit provisional simple-model assumptions**, not newly verified universal game rules:

- Critical chance is clamp((Rate−resistance)/100,0,1); unchanged range/status is independent of critical events.
- Flat Main/Sub gear sources share a common response g≥1, unchanged Attack background is nonnegative, and there are no reductions or extra changed effects. Coherent already-amplified and raw-amplification display scenarios are both evaluated; internally inconsistent scenarios are rejected against current totals.
- Chapter estimates use ordinary outgoing damage; specified raids/Party Quest use a pure square-root adjustment and Guild Training a pure cube root. These are offensive per-hit models, not complete executable encounters, DPS, survival or win probability.
- Point entries are treated as entered model values. User uncertainty margins can broaden them; no hidden game rounding law is fabricated.

These conditions are visible before calculation and expanded in Why & limits. Confidence is Low throughout. Unknown opponent resistance remains unknown: the model evaluates its full relevant nonnegative interval, including internal clipping breakpoints. An Advanced known-resistance value is applied to all estimated targets as an explicit scenario. It must not be entered as0 merely to force a winner.

## Arithmetic and replacement

For each coherent Main/Sub stage, `Q=main*M+sub*S`, character Attack `A=B+g*Q`, `B≥0,g≥1`. Current A therefore constrains g to[1,A/Q]. Candidate Attack ratio endpoints are `1+(Qnew−Qold)/A` and `Qnew/Qold`; A with a user margin is intersected with the source-consistency boundary. No opaque decomposition or post-equip candidate total is requested.

Changed additive bucket totals replace the effective old source exactly once: candidate factor is `(100+T−old+new)/(100+T)`. Independent FD replacement keeps the ratio of source factors. Critical totals replace the source before chance clipping; Critical Damage is the entered full multiplier, not1+that value. For context exponent r, critical expectation is `(1−p)+p*C^r`; ordinary expectation is never rooted after averaging.

BigInt rational arithmetic preserves source scaling, total/source differences, rate/resistance clipping, complements and breakpoint construction. Positive factors and fractional powers then use guarded floating arithmetic. A1e-10 final abstention guard addresses numerical sign noise, not game precision. A possible tie or reversal over admitted source stages, Attack responses, unknown resistance, target/attack classes or supplied uncertainty returns No reliable preference. Results display only the side and confidence, not raw changes or damage percentages.

## Automatic activity coverage

| Row | Current model |
|---|---|
| Ordinary normal / boss | Expected landed offensive damage, Basic and Skill branches both checked |
| Chapter Hunt / mobbing | Ordinary normal-target estimate |
| Chapter Challenge / Boss | Ordinary estimate; both target classes checked conservatively |
| Boss Raid / Guild Raid · Zakum / Horntail | Pure square-root offensive estimate against boss class |
| Guild Training Ground | Pure cube-root estimate; both target classes checked |
| Party Quest | Pure square-root estimate; both target classes checked |
| Arena / World Arena / Colosseum | No reliable preference; full PvP normalization and survival remain unimplemented |

Unknown attack mixture or target classification is not guessed. All applicable branches must favor the same side. These rows are not a claim that every battle context now has a validated model; phase mechanics, target rules and future encounters can invalidate the simple profile.

## Inputs and numerical limits

- Item syntax remains typed: nonnegative whole points/levels or displayed percentages, supported source roles, strict grouping,≤18 decimal places and exact per-input magnitude≤Number.MAX_SAFE_INTEGER. Unknown/unreadable lines remain blockers.
- Supported Star Force table is12–30 from the official September3 patch. Values0–11 are not guessed. For other stages, Advanced consumes both displayed amplification percentages; explicit0/0 is a user-supplied neutral scenario, not a sourced level0 rule.
- Nonpoint item-source bounds abstain in this model; older source-domain proof APIs remain separate. Character Attack uncertainty is in points, percentage uncertainty in percentage points. Nonpositive reconstructed current factors, inconsistent totals, invalid fields and nonfinite arithmetic cannot produce a winner.
- Full Critical Damage must be positive. No invented game cap on Rate or Damage is added; entered Rate above100 is retained before candidate replacement and modeled probability clipping. Excess-crit artifact/threshold effects must be absent or the comparison is outside scope.

## Verification

- Full software suite324 passed, including21 new independently authored groups. Build/resource closure and contrast checks are required before publication.
- Independent QA found a genuine wrong-winner bug at large valid decimal inputs; exact linear arithmetic repaired it. Regression groups include scaled-source cancellation, near100% complementary probability, nonlinear-root reversal, unknown-resistance internal extrema, source-role permutation, swapped shoulder orientation, uncertainty reversal and60 sampled complete-product cases. See CHARACTER_RECOMMENDATION_QA.md.
- Actual local public screenshot upload reached editable crop review; unreadable values and wrong punctuation required correction. Explicit Attack sources and card confirmations worked; changed Main Stat/skill effects correctly withheld a winner. This is not a new claim of universal OCR accuracy.
- Actual browser synthetic shoulder structure generated exactly five conditional fields. CurrentAttack50000,Rate50%,fullCD200%,Boss0%,StarForce12 gave Current for normal/Chapter Hunt and abstention for some boss/root rows with unknown resistance. Entering a synthetic known resistance0% in Advanced resolved all modeled PvE rows to Current; PvP stayed undecided. Source roles and entered totals survived item re-review; optional disclosure closure preserved values. These are invented character values, not player measurements.
- Actual390×844 responsive check had no horizontal overflow; character inputs used16px fonts. No browser error/warning logs were captured. `.review/character-estimate-synthetic.png` is private synthetic proof. Physical iPhone and controlled game predictions remain unverified.

Release commit/CI/public build and hosted smoke evidence are recorded after publication. This is an experimental offensive recommendation tool available for live testing, not a completed or game-validated calculator.
