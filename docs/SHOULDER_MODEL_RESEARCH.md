# Shoulder comparison: practical quantitative model

2026-10-24 mechanics/mathematics specialist. This supersedes the proposal to request a specially matched equipment pair. User says an empty slot is impossible. No experiment or game observations were performed. This is a source reconciliation and mathematical implementation handoff, not a claim of game-validated predictions.

## Fresh primary-source verification

Rendered [official English guide](https://maplestoryidle.nexon.com/en/guide), Battle System, Stat Dictionary and Content → Equipment. Page reports update October15,2026. Search-index text still displayed September22 formulas in places; use the rendered page. It confirms ordered flat/ordinary-percent/Skill-percent/Skill-flat Attack calculation, separate ordinary damage factors, full Critical Damage multiplier on a critical outcome, critical chance semantics, and target Critical Resistance reducing attacker rate. It does **not** publish an ordinary effective-chance cap/subtraction formula. The explicit100% weighting sentence belongs to the PvP **defender adjustment** and must not be promoted to every ordinary attack.

Rendered [September3 official patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3537355), equipment details and StarForce sections. Pocket main/sub options are distinct; flat Attack can occur in either. StarForce main/sub amplification differs. The published table is:

| Slot stars | Main amplification % | Sub amplification % |
|---|---:|---:|
|12|200|25|
|13|225|25|
|14|250|25|
|15|300|50|
|16|350|60|
|17|400|70|
|18|450|80|
|19|500|90|
|20|600|100|
|21|700|110|
|22|900|130|
|23|1050|145|
|24|1200|160|
|25|1350|180|
|26|1500|200|
|27|1750|225|
|28|2000|250|
|29|2250|275|
|30|2500|300|

The guide confirms slot-based Scroll/Potential/StarForce ownership. Neither source proves whether the comparison's shown numbers have already incorporated amplification, or the exact display rounding rule. Do not treat displayed rows as raw unamplified values silently. Stages below12 are absent from this patch's numeric table and must not be fabricated by interpolation. Slot FD from20stars onward is a common factor for a fixed slot, not another changed equipment FD source.

The earlier rendered [August13 patch](https://forum.nexon.com/maplestoryidle/board_view?thread=3522342) supplies Ring of Cycles cross-family critical thresholds. An ordinary crit-only calculation requires a condition excluding changed critical-triggered/threshold effects; it cannot assume every passive/artifact is inert.

## No opaque Attack decomposition question

For a reviewed same-slot flat main Attack `m` and flat sub Attack `s`, let their source-stage contributions be `Q = M*m + S*s`. Under unchanged common amplification and nonnegative unchanged Attack sources:

```text
Acurrent = B + g*Qcurrent
Anew     = B + g*Qnew
B >= 0, g > 0
Anew/Acurrent = 1 + w*(Qnew/Qcurrent - 1)
0 < w <= 1
```

This is algebra, not another published game rule. It assumes both Attack sources share the later positive percentage stages, and a common nonnegative background includes the remaining flat/Skill-flat contributions. Attribute/skill/percentage-Attack changes or stat-reducing effects invalidate this contract. The ratio lies between1 and`Qnew/Qcurrent`; if unequal,1 is only a limit and cannot be attained for finite positive g. For a conservative closed interval implementation include1 and abstain on ties at that endpoint, unless an exact strictness proof tracks it.

**Current final character Attack alone does not tighten this ratio.** The unknown g is constrained by `g <= Acurrent/Qcurrent`; substituting this bound cancels Acurrent. Asking for final Attack without an independently measured or sourced marginal response gains nothing. No matched pair or unavailable candidate is necessary for this all-response bound.

An explicit stronger **simple-model assumption** can make final Attack useful: each shared ordinary/Skill multiplier is at least1, no Attack-reducing or fractional scaling effect applies, and both sources enter the presumed flat stage. Then g≥1, so `1 <= g <= Acurrent/Qcurrent`. Require Acurrent≥Qcurrent. Ratio endpoints become `1+(Qnew-Qcurrent)/Acurrent` and `Qnew/Qcurrent`; take their min/max. This does not establish the actual g or source stage, but supplies a defensible bound **within that declared model**. It must not silently replace the broader published-evidence bound. A scenario that fails nonnegative background consistency can be rejected under exact entered values/no reductions; rounding unknowns remain a limitation.

Source roles must be explicit or retained by verified extraction: never infer main versus sub from repeated-label occurrence order alone. An editor should let the user identify upper/main versus lower/sub Attack when needed; aggregate multiple explicitly identified same-stage flat rows only under a verified same-stage contract.

### Coherent display scenarios

At minimum consider both:

1. Shown values already effective: M=S=1 and percent sub scale h=1.
2. Shown values before slot amplification: M=1+mainAmp/100, S=1+subAmp/100 and h=S.

The second is a **simple-model interpretation**, not a verified comparison-display law. If amplification wording permits another interpretation, keep that uncertainty or gate that scenario; do not choose the convenient interpretation. Compare the complete item under each coherent scenario and require agreement across scenarios for a source-robust winner. Do not independently mix M/S from one scenario and crit/bucket h from another as if it were a coherent exact prediction. A larger independent envelope is conservative but can forfeit valid conclusions.

Example supplied shoulders: current main9306/sub3490; new main10251/no sub Attack. For effective shown rows, Q ratio=10251/12796≈0.8011. Under the preamplification interpretation at12stars, ratio=(3*10251)/(3*9306+1.25*3490)≈0.9525. At20stars the loss is tiny; at21stars the direction becomes an increase. A main-only comparison or raw row subtraction can therefore choose incorrectly. The screenshot stars alone do not resolve display stage.

## Minimum consumed character inputs

There is no universal mandatory number. Replan conditional questions after each answer; omit an input if unknown-domain analysis already proves all supported comparisons.

| Input | Exact consumer | When required / omission |
|---|---|---|
| Current Critical Rate % | Current critical event probability and replacing scaled old/new crit source | Changed crit chance or changed Critical Damage; may be skipped for a dominance proof or when both states provably share chance |
| Current Critical Damage % | **Full** critical multiplier C=shown/100, not1+shown/100 | Changed chance/damage; may cancel only under proof, especially when both states always crit |
| Current changed applicable Damage/Amplification/Boss/Normal/Basic/Skill total % | New full bucket factor divided by old: `(100+T+h*(n-c))/(100+T)` | Ask only a changed family that can reverse an unresolved comparison. Opposite monster bucket does not enter that row; unchanged totals cancel |
| Slot StarForce stage | Published Main/Sub source weights for repeated Attack and sub-percent scenario | Needed only if unknown-source/scenario union fails and that stage can narrow it. No invented sub12 table |
| Current final Attack | Only with independent marginal gain information | Do not request by default: not identifying on its own |
| Job, level, defensive totals | No consumer for scoped landed ordinary outgoing damage if unchanged attributes/skills | Do not ask; changed attributes/skill levels need another implemented model |

A total must actually contain the current item contribution and the reconstructed new total must remain nonnegative. Rounded shown totals are scenario values, not exact true totals. An advanced optional measurement enclosure or calibration can narrow bounds, but do not invent ±0.5 or require an opaque gain/decomposition value.

Retain uncapped displayed Critical Rate for replacement; only the simple model's **effective probability** is capped afterward. An entered rate at/above100% can still lose meaningful chance on replacement. Current totals can rule out a coherent source-display scenario if its current item contribution already exceeds the total under the exact-input/nonnegative-background assumption. Treat this as internal model consistency, not a measured display-law proof.

## Critical calculation and activity transforms

If choosing to ship a simple numerical crit model, explicitly label the assumptions: ordinary crit-eligible landed attacks; effective chance `p=clamp((R-targetResistance)/100,0,1)`; no crit-triggered/threshold side effect; no changed joint relation with range/status; stable buffs/preset; same skill coefficient/attack mix. These are assumptions needing empirical validation, not facts established by the guide. A zero-resistance PvE scenario is not verified for every target. A checkbox expresses intended scope; it cannot verify the unknown law. Missing mechanics and missing player values remain separate.

For a crit multiplier C and a pure monotone power context x→x^r, mathematical expectation is proportional to:

```text
common^r * Attack^r * product(changedBucketFactors^r)
 * independentFinalDamage^r * [1 + p*(C^r - 1)]
```

Use r=1 for untransformed ordinary hits. The guide describes square-root-based raid/PQ and cube-root-based training adjustments; adopting **exact pure powers with common constants** is a separately disclosed context-model assumption, not a complete target rule. Evaluate the noncritical and critical outcomes before expectation; `root(E[damage])` is wrong and can reverse choices. Common independent range distributions cancel as E[range^r] only when the distribution and critical joint behavior are actually unchanged. Do not substitute CP or average unrelated Basic/Skill branches. Require agreement over unknown attack mix or compute explicit advanced weights with a defensible consumer.

PvP outgoing hit, incoming damage normalization, target resistance, survival and relative level rules do not become complete by applying square root. Keep PvP at No reliable preference until the full objective is supported. Named raid prediction is also not a claim of clear time or survival. Compact labels must say modelled hit-damage recommendation where that is the actual scope.

If Advanced accepts a target-resistance interval, the critical-factor ratio can have extrema at probability-cap transitions. Evaluate interval endpoints plus any interior `Rcurrent`, `Rnew`, `Rcurrent-100` and `Rnew-100` resistance breakpoints. Between breakpoints numerator and denominator are affine in resistance, so their positive-denominator ratio is monotone or constant. Endpoint-only evaluation across the whole interval can miss a reversal.

## Numerical and evidence boundaries

Compare full admitted products and uncertainty ranges, not an isolated favorable factor. Validate totals, percentages, units, source completeness and nonnegative reconstructed contributions. Overlapping complete result intervals, a dependency gap or a scenario reversal means No reliable preference; Low confidence never licenses an arbitrary winner. Exponents need finite positive factors and guarded overflow/underflow. Existing exact rational machinery can preserve linear-factor signs, but power expectations may require well-conditioned numerical or interval handling.

No new controlled measurement is pending. A future opportunistic ordinary replacement with complete item roles, fixed slot/preset and stable A→B→A character Attack may falsify a source model even when the items differ in crit/monster damage, because those do not directly alter character Attack under the stated scenario. It would still be confounded by changed Main Stat, Attack%, skill/passive/threshold effects or buffs. The user need not find a specially matched pair or equip an unavailable candidate. Source-robust bounds remain useful without such measurements.
