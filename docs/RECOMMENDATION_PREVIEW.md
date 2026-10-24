# First actual equipment recommendation preview

2026-10-24. Feature branch only. Production remains the compact-confirmation release, build4cca063d3252; do not merge this numerical engine to main without user approval.

## What works

`equipment-recommendation.js` evaluates the complete **admitted ordinary-landed-hit** comparison. It can return Current equip, New equip or No reliable preference. It chooses only coordinatewise dominance across every applicable supported changed contribution, with at least one favorable direction and no opposing or unmodeled effect. It does not multiply a partial score while ignoring an unsupported effect. There is no raw-difference weight, CP proxy, guessed critical law or displayed-total-plus-item-delta reconstruction.

Supported families are a single observable flat main-option Attack on each item, same-type Damage and Damage Amplification, the applicable Normal/Boss Monster Damage bucket, the selected Basic/Skill Damage bucket, and a single independent item Final Damage source. Every offensive family initially permits at most one occurrence per item. Repeated Attack/main/sub sources are not summed or occurrence-matched. Attack source identity is required even when its entered values are equal; percentage Attack is unsupported. The main-Attack ordering proof is a bounded inference under the reviewed same-slot/source scenario, not a universal live-validated attachment law.

The UI keeps the confirmed cards collapsed, then requests only consumed factual/scenario conditions. Observable main/base Attack position is conditional on its use; Basic versus Skill attack type appears only when a changed attack-specific bonus needs it. No opaque source-stage or exact-total certification, numerical character baselines or unused crit/accuracy fields are requested. If a mechanics blocker makes both ordinary contexts unavailable, no useless condition questionnaire is required just to see that blocker.

Normal- and boss-monster **ordinary hits before mode rules** are distinct evaluations. They are not complete Chapter Hunt, Raid, Guild, Arena or Colosseum profiles. The normal list shows two ordinary rows and an unavailable named-battle/PvP row; one Why & limits disclosure contains dependencies, common/outside-objective effects, conditions and source/model metadata.

## Eligibility classes and remaining dependencies

| Class | Examples | Handling |
|---|---|---|
| Missing review/player information | Item confirmation, complete visible lines, same-slot On-Equip source, observable main-option position, Basic/Skill applicability | Fill only the consumed review/question; unconfirmed is never accepted automatically |
| Unresolved mechanics/source identity | Repeated/% Attack, critical changes, attribute conversion, skill levels, range/status, penetration, timing; additional set/passive/trigger consequences | Abstain, even if a supported Attack contribution is arbitrarily favorable |
| Missing affected-stage baseline | More Attack but less Damage/FD; other opposing directions | Abstain with `tradeoffRequiresBaseline`; current displayed final Attack cannot replace pre-multiplier decomposition |
| Common effects | Equal single literal known effects within the same source/scenario contract | Cancel; unknown labels never cancel merely because text matches |
| Outside this objective | Player HP/MP/Defense/Evasion/Accuracy/resistance; opposite monster/selected attack bucket | Retain and explain; no hidden weight. Ordinary damage-dealing hits explicitly exclude survival, misses, resource exhaustion, cadence and exceptional HP/MP-based/companion/bypass attacks |

The decomposition needed for general Attack tradeoffs remains `A=(F*M)*S+K`; `F` is not final displayed Attack. Critical trades need effective chance/eligibility and full multiplier/joint-event semantics. The specialist handoff records exact algebra and the official evidence gaps. Asking familiar character totals alone does not implement these laws. Full named-mode and sustained-DPS recommendations remain unfinished.

## Numerical and evidence scope

Inputs use the existing typed field grammar: nonnegative whole points/levels or decimal displayed percentages, strict English grouping, absolute magnitude≤Number.MAX_SAFE_INTEGER and up to18 fractional places. Exact decimal direction comparisons use BigInt; they do not disappear into Number rounding and do not estimate a damage percentage. Source bounds can be supplied explicitly to the pure API; they must enclose the entered source value, and every possible value must establish separated order. Overlap/touching/uncertain equality abstains. No display-rounding direction or ±0.5 enclosure is fabricated. Default results are conditional on the entered source values, with rounding/hidden-effect uncertainty disclosed.

Confidence is Low. Published rules, bounded source inference, software tests and empirical prediction are separate. Source review: `RECOMMENDATION_MECHANICS_2026-10-24.md`; UX: `RECOMMENDATION_INPUT_UX.md`; independent QA: `RECOMMENDATION_QA.md`. No controlled live-game validation is claimed.

## Verification

- Build/resource closure and contrast checks pass. Full suite278 passed, including16 independently authored recommendation groups.
- Pure cases cover reversals/equality/permutations, null/malformed input, missing and unknown effects, all scope gates, supported added/lost effects, repeated/%/missing-sided Attack, contradictory changes, target and attack applicability, exact18-place ordering, bounds overlap/touching/invalid enclosures, and immutable input.
- An actual local browser form using **invented**100/110 main-Attack values produced New equip for both ordinary contexts. Changing new Attack to90 reversed both to Current equip. Adding changed Critical Rate blocked both despite favorable Attack. Unsupported comparisons hid unused questions. No warning/error logs were captured.
- Actual390×844 preview proof `.review/recommendation-feature-synthetic.png` is a synthetic software demonstration, not a player measurement. Existing public example is authorized as a separate OCR fixture; no new private player screenshots are published. Physical-phone interaction and held-out prediction accuracy remain open.

## Minimal controlled observation

An optional user collection task was sent while independent work continued: use two already-owned same-slot items with one upper/main Attack line each, identical offensive percentages/Main Stat/skill-level effects, stable preset/slot upgrades/buffs. Report item Attack A/B and detailed character Attack in A→B→A, twice per state; note changed buffs. If no suitable pair exists, do not manufacture one or obtain a candidate. This can falsify an attachment assumption but does not establish every decomposition/rounding law. It is a validation experiment, not a requirement that future users equip an unavailable candidate.

## Review access and deployment

Feature implementation commit `6db73b3f29865f95f1d2db15909f6c28a8599653` passed GitHub CI and Vercel deployment. Review URL: https://msidlecalc-git-feature-source-linked-d30e05-erics-trade-binder.vercel.app/ . Vercel authentication protects this preview; the unauthenticated browser reached its login gate, so hosted application behavior is not claimed as tested. Local application behavior was exercised at http://127.0.0.1:4181/ .

CI evidence: https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40101530598/job/120894521079 . Production remained at `4256b0e4f37ade8534e64d53f5bbb1e8f92a37fa`, public build `4cca063d3252`, after feature publication. No production push was made. Production release requires explicit later approval.

The user acknowledged the controlled observation task with “Yep”; no readings have been supplied or incorporated. A final UI clarification labels attack-specific results as basic hits or skill hits when that consumed choice applies.
