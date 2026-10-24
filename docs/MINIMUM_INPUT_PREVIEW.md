# Minimum-input recommendation preview

2026-10-24. Existing feature branch only; production remains `4256b0e`, build `4cca063d3252`. This checkpoint extends actual admitted ordinary-hit choices, not complete activity or DPS prediction. No player measurements were supplied.

## Minimum basic inputs

**There is no universally required numeric character stat.** Complete typed item panels and source/scenario review can establish some choices without character numbers. Both item confirmation buttons now supply the complete-visible-list review; no second completeness checkbox is presented. Missing/unknown typed lines still block. Same-slot, no-extra-effect and ordinary-hit conditions remain consumed. The Attack source-position condition appears only when Attack is used. New mixed-factor proofs also consume observable lower/sub-option source review and a no-stat-reducing-effects scenario condition. These conditions do not establish an unknown game rule or numerical rounding law.

No activity, attack-type, job or level selector is required. The engine evaluates normal and boss targets and both Basic and Skill branches automatically. An aggregate ordinary row chooses only if both hit branches establish the same strict side. Conflicting branches or a tie/unknown branch abstain. Every named activity is listed automatically, with No reliable preference until its full profile exists.

| Character value | Exact potential consumer | When it cancels / current basic handling | How to obtain; missing consequence |
|---|---|---|---|
| Current final Attack | `A=F*M*S+K`, marginal response `g*(new-old)` | No field: source-direction/shared-domain proof does not need it; final A alone cannot identify g | Detailed stats can show A, but copying it does not solve source response. No request until response is identifiable |
| Current Damage / Amplification / Normal / Boss / Basic / Skill total | Effective-source scenario `R=1+(n-c)/(100+T)` in displayed-percent units | Only the changed applicable family can matter. Unknowns retained symbolically for basic proof | Optional manual total enclosures in Advanced; do not ask for unchanged/inapplicable totals. Missing total leaves that variable unknown |
| Total Final Damage | Independent effective-source ratio `(100+n)/(100+c)` | Unchanged independent sources cancel; shared-sub symbolic proof handles unknown amplification | No total-FD question; it is not consumed |
| Critical Rate and Critical Damage | Future event expectation `1+p*(C-1)` after effective-event mapping | Unchanged complete event behavior can cancel; changed crit currently blocks | Character values alone do not establish resistance/overflow/eligibility, threshold side effects or normalization. No unused fields |
| Main Stat, job, level | Future attribute, skill and mode-specific formulas | Unchanged terms can cancel within admitted scenario; changed conversion/skill effects block | No implemented consumer in this scope, so no questions yet |
| HP, MP, Defense, Evasion, Accuracy | Survival/resources/hit probability or exceptional attacks | Outside successful ordinary-hit objective, not globally useless | No numerical field or hidden offensive weight. Stronger activity claims need separate models |

No player must supply opaque source stages or F/M/S/K decomposition. A missing mechanic is reported separately from missing information. A complete stat sheet would not fix it.

## Implemented mathematical extension

`public/domain/minimum-input.js` retains the old typed validation, source identity, repeated-source, unknown effect and exceptional-scenario guards. It adds an exact sparse-polynomial certificate over a shared positive sub-option multiplier `h`, independent nonnegative unchanged bonus totals `U_i`, and independent Main Attack background `t=B/g`. All material admitted factors are included. It never assigns Main and Sub the same amplification.

For a percentage bucket, numerator/denominator are `100+U_i+h*n` / `100+U_i+h*c`; an independent FD source has `100+h*n` / `100+h*c`; Attack has `t+n` / `t+c`. Products are compared symbolically. All coefficients must have a consistent sign, and a strictly signed term must depend only on h (or be constant), so setting all nonnegative backgrounds to zero cannot turn the result into a tie. Certificate failure is abstention, not evidence of the opposite side. Source-uncertainty intervals use lower-new/upper-old corners, then independently check the reverse. Exact BigInt rational coefficients preserve small signs without an invented numeric tolerance.

Synthetic example: FD20→40 and Damage20→10 yields a positive product difference proportional to `1000*h+20*h*U`, establishing New over every allowed shared h and U. FD20→40 and Damage40→20 yields only a positive h*U term; U=0 ties, so no strict winner. These are software examples, not actual player equipment or empirical predictions.

The September3 official Equipment Details identify fixed FD and lower Damage/monster/crit bonuses as Sub Options and publish one Sub Option Amplification per slot stage. Shared same-slot amplification is a bounded source-backed inference under observed sub-option review. It does not establish whether the displayed value is before or after amplification; the symbolic proof tolerates either common mapping. Display rounding and any different normalization/attachment remain evidence limits. See `MINIMUM_INPUT_MECHANICS.md` and SOURCES.

## Optional advanced calculation

One disclosure presents **only relevant changed supported bonus totals**, with current minimum/maximum percentages. Entries are preserved in memory across recalculation, closing/reopening the disclosure and item edits. They are not uploaded or stored persistently. No universal full-sheet questionnaire, job/level selector or final-Attack field is added.

These ranges are **sensitivity scenarios**, not a stronger validated recommendation tier. The separate technical contract `sourceContract:'effective-bonus-sources'` consumes effective source values and explicit total enclosures, using exact rational factor bounds. The actual uploaded-item recommendation path never sets that contract. The optional details clearly separate its hypothetical choice from the main result; it cannot override source-stage, critical or activity blockers. No rounding margin is guessed. Equal bounds are an exact scenario assumption, not proof that a displayed stat is exact.

In the technical effective-source model, `planMinimumInputs` offers at most one unresolved affected total at a time and replans after refinement; a proved choice removes remaining questions. This is not exposed as a mandatory basic question while actual source mapping/rounding remains unresolved. Advanced field editors remain available after entry and can be cleared. This avoids claiming every changed bucket is universally essential.

## Activity eligibility

| Automatically evaluated row | Current result scope | Remaining stronger-profile dependency |
|---|---|---|
| Normal monsters · ordinary hits | Conditional complete admitted hit preference, Basic and Skill must agree | Not Chapter clear time, survival or resource/cadence prediction |
| Boss monsters · ordinary hits | Same, with Boss rather than Normal bucket | Not a named raid/completion/DPS prediction |
| Chapter Hunt / mobbing | No reliable preference | Full activity, attack mixture, cadence/resources and exceptions |
| Chapter Challenge / Boss | No reliable preference | Complete target/content adjustment and objective |
| Boss Raid · Zakum / Horntail | No reliable preference | Outcome/content transformation, phases and exceptions |
| Guild Raid · Zakum / Horntail | No reliable preference | Same; named modes are not interchangeable |
| Guild Training Ground | No reliable preference | Full cube-root-related stage and outcome/profile rules |
| Party Quest | No reliable preference | Complete named-content rules and applicable objectives |
| Arena / World Arena | No reliable preference | Opponent, level, critical/content adjustments and survival/objective |
| Colosseum | No reliable preference | Same mode-specific dependency gate |

## Controlled Attack observation: smaller and optional

The matched-pair request is superseded. If the client permits it, one already-owned nonweapon item can provide a diagnostic: **equipped → empty slot → re-equipped**. Record its visible Attack-affecting options, slot upgrades/bonuses and two stable character Attack readings per state, keeping everything else fixed. Text suffices. Do not buy, upgrade or consume anything, and do not equip an unavailable candidate. If unequip is impossible, say so and stop this experiment.

Template:

```text
Item slot / visible Attack-affecting options:
Slot upgrades/bonuses; do any deactivate when empty?:
Equipped Attack: ___ / ___
Empty-slot Attack: ___ / ___
Re-equipped Attack: ___ / ___
Any buff, artifact, preset or other change?:
```

If slot bonuses disappear or the item changes Main Stat/skill/passive/threshold effects affecting Attack, the difference cannot isolate its main Attack. Return disagreement invalidates a clean calibration. Even stable repetition does not establish hidden rounding or universal source attachment. This test may diagnose or falsify a naive model; it is not promised to recover F/M/S/K. If confounded, pursue source evidence/narrower proof instead of requesting a matched pair again.

## Verification and release boundary

- Full suite:303 passed, including25 independently authored new groups. Build/resource closure and both skins' contrast checks passed.
- Independent tests cover reversal, unknown-baseline reversals, zero-background ties, malformed/explicit-null bounds, repeated/unimplemented effects, exact sub-IEEE signs, source uncertainty corners, Main/Sub independence, source-domain gates,120 effective-source sampled comparisons and120 shared-source sampled comparisons.
- Actual browser synthetic mixed-FD/Damage proof produced New for both ordinary rows, with all named rows abstaining and no activity/type selector. Entered100%/100% Damage bounds survived calculation and an item edit. Reducing FD40→30 kept actual rows at No reliable preference while the advanced details showed New only under an explicitly hypothetical effective-source scenario. No warning/error logs were captured. This is software UI evidence, not held-out OCR, real-device or game prediction validation.
- Inputs retain the typed grammar: nonnegative whole points/levels, strict percent decimals/grouping, per-value magnitude≤Number.MAX_SAFE_INTEGER and at most18 decimal places. There is at most one admitted offensive occurrence per family; unknown/repeated/% Attack and changed critical/attribute/skill/timing families remain blocked. Polynomial size is bounded by the admitted family count, not a fabricated game-stat cap.
- No production merge or push. No live-game data collected, paid APIs, account or hosting configuration changes.

## Published feature review

Implementation commit `7dec71f` passed [GitHub verification](https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40114054701/job/120931579721) and [Vercel deployment](https://vercel.com/erics-trade-binder/msidlecalc/9TZXm9bCHHFwdEUUoZD3iZ7aqK7Y). Review: https://msidlecalc-git-feature-source-linked-d30e05-erics-trade-binder.vercel.app/ . This existing preview requires Vercel sign-in; authenticated hosted application behavior was not tested. Actual application checks used http://127.0.0.1:4181/ . Synthetic result proof remains private at `.review/minimum-input-synthetic.png`.

After the feature push, remote main remained `4256b0e4f37ade8534e64d53f5bbb1e8f92a37fa` and public production release remained `4cca063d3252`. The optional user question asks only whether an owned nonweapon item can leave a slot empty; no measurement or change was requested yet. Full controlled evidence remains absent. The previously supplied Attack-versus-Critical-Rate comparison is still blocked; this checkpoint does not claim it has become calculable.
