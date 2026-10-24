# Essential inputs and recommendation status

## New feature checkpoint — 2026-10-24

The feature now has a genuine **conditional ordinary-landed-hit dominance** recommendation, before named content rules. It accounts for the complete admitted comparison and chooses only when all supported applicable changed factors favor one item. Same-slot On-Equip source/crop completeness and no nonlisted effect changes are required. Single flat main-option Attack admission needs observable main-position review and remains a bounded source inference; repeated/percentage Attack is blocked. Applicable damage buckets and a single independent item FD source can be ordered without aggregate totals. Basic/Skill Damage changes ask only the consumed attack-type question. Source uncertainty bounds, if explicitly supplied, must establish separated order; none is invented from display syntax.

No numeric character totals are requested for this first directional scope because they cannot affect a coordinatewise ordering. This is **not** the Attack-versus-Crit tradeoff model: changed critical/attribute/skill/range/penetration/timing effects and contradictory factors abstain. The exact source-decomposition and effective-critical dependencies below remain open. See RECOMMENDATION_MECHANICS_2026-10-24.md, RECOMMENDATION_INPUT_UX.md and RECOMMENDATION_QA.md. Production is unchanged; numerical feature release requires user approval. The following audit describes the prior baseline.

2026-10-24. Damage Mathematician read-only reconciliation of the current calculation code, not new mechanics research. Reviewed full `AGENTS.md`, `LESSONS.md`, `DAMAGE_MODEL_SPEC.md`, `DAMAGE_MODEL_QA.md`, `research/ENCODED_RULES.md`, recovered damage-model planning, current `mechanics-data.js`, `damage-model.js`, `reaggregation.js`, `app.js` and `index.html`. Historical raw-total-plus-item-delta and single-primary-context guidance remain superseded. No tests were run for this documentation-only review; previous fixture counts are historical evidence, not a fresh validation claim.

## Direct answer

The essential questions were not removed because they proved unnecessary. The OCR workflow advanced ahead of the supported calculation workflow. The application currently obtains item lines but does not reconstruct the affected character totals or implement a complete named battle profile. Those are implementation/evidence gaps; asking the player more questions alone cannot fill them.

The existing hidden Calculate action computes only an isolated Final Damage factor under an explicitly confirmed independent-source contract. It is not the intended equipment-recommendation button. No currently enabled code path produces a complete equipment winner, even when every field is filled.

## What the implementation actually consumes

| Operation | Inputs consumed now | Output and hard boundary |
| --- | --- | --- |
| `compareItemLines` | Ordered item records, corrected labels/values/units, review state, complete-visible-list confirmation | Raw same-label occurrence differences and gained/lost visible lines; no damage weight or equipment winner. Completeness of the visible list does not prove complete mechanical consequences. |
| UI `#calculate` | Confirmed Final Damage percentage lines on both items and independent-source confirmation | Source-only FD factor ratio. Other lines are retained as unsupported. Requires no Critical Rate, Accuracy, character FD total, job or target because this isolated ratio holds all other factors equal. Absence of an FD line is not automatically zero in this path. |
| `compareSupportedFactors` | Explicit effective current/new factors for supported IDs; unsupported-effects list | Conditional partial ratios only. Not connected to general item-to-character reconstruction. Always null equipment winner. |
| `compareOrdinaryStates` | Complete explicit character/target factors and joint outcome distributions; literal `ordinary-before-content` context | Pre-content expected arithmetic, deliberately partial. Always null equipment winner; no named content, sustained DPS or clear probability. |
| Attribute / cap / FD replacement helpers | Verified source identity, stage, units and decomposition; exact totals only where an inverse admits them | Reaggregated affected quantities. No job-stat conversion, inferred attachment/transfer rule or complete recommendation. Rounded displayed totals cannot be asserted exact merely by checking a box. |
| `pvpDefenderLevelRatio` | Named PvP mode and two receiver levels | Isolated relative damage-taken level factor. Does not enable Arena equipment ranking. |

Formula model is `ordinary-stage-2026-10-22-v4`; data is `msi-guide-2026-10-15-claims-4`. Named Chapter Breakthrough, boss, Guild and Arena recommendation profiles remain unavailable. The current dataset explicitly labels named profiles unimplemented. Existing independent QA supports those restricted contracts with synthetic arithmetic; no controlled live-game prediction validation is established.

## Minimum inputs depend on what changed

The original suggestion of static Critical Rate plus adequate Accuracy remains a hypothesis, not the universal light form. Required inputs should be generated by supported dependency rules, not displayed speculatively.

| Proposed field | Actual consumer and necessity | Can derive or cancel? | Missing data / screenshot boundary |
| --- | --- | --- | --- |
| All item lines and units, including repeated/unknown effects | Replacement and recommendation eligibility; essential | No candidate-to-current label copying or colored-delta substitution | OCR supplies editable evidence, not stage/source proof. Missing lines remain unknown until reviewed completeness establishes visible absence. |
| Stable current Attack plus affected source stage/factors | Changed Attack contribution; conditional essential | Source decomposition may reconstruct the new total without equipping the candidate | Flat item delta cannot universally be added to aggregate Attack. Equipment screenshot lacks current character aggregate/stages. |
| Current relevant Damage / Amplification / Boss / Normal bucket | Changed bucket contribution; conditional essential | Proven unchanged or inapplicable buckets can cancel | A raw percentage-point item change alone does not establish relative damage impact. Item screenshot usually lacks character bucket totals. |
| Effective Critical Rate and full Critical Damage | Changed critical-event expectation; jointly conditional | May cancel when the entire event law is unchanged and supported context algebra permits | Added crit chance cannot be valued from crit chance alone. Effective chance, resistance and eligibility remain unsupported normalization dependencies. Character screenshots may show displayed totals but do not prove event law. |
| Accuracy adequacy | Hit eligibility assumption; conditional | Explicit attacks-land assumption can restrict a supported calculation without a numeric hit curve | No universal adequate numeric threshold is encoded. A checkbox cannot establish an unimplemented target/hit model; changed Accuracy is not a default DPS bonus. |
| Job / Main Stat / Stat Prop. Damage | Changed attribute conversion, passives or skill effects; conditional | Job is unnecessary for a purely isolated confirmed FD factor | Numerical Main Stat conversion and complete job source semantics are missing. Asking job does not make that formula exist. |
| Target identity, Defense, penetration | Context eligibility and changed mitigation/conditional bucket | Unchanged mitigation may cancel in a supported ordinary ratio | Named target profiles and changed penetration need sourced parameters. Generic Boss selection is insufficient. |
| Skill levels / coefficients / passives | A changed skill line or altered attack mixture; conditional | Already reflected passive totals count once; unchanged common coefficients may cancel in a proven slice | Published skill snapshots exist, but current level curves/balance/eligible attacks are not encoded as a complete catalog. Item skill-level deltas alone cannot be scored. |
| Cadence, attack speed, cooldown, triggers, resource availability and material uptime | Sustained DPS only; conditional essential | Timing cancels only when it is established unchanged | Current code has no schedule/uptime model. No hidden skill-level, speed, MP or artifact tie-breaker. |
| HP / player Defense / Evasion | No default outgoing-damage consumer under survival/landing assumptions | No need to ask for totals for that restricted objective | Preserve effects; supported resource/skill/receiver exceptions require separate modeling. They are not globally useless. |

For the successful shoulder example, changing flat Attack, Critical Rate and Boss Monster Damage cannot be ranked completely using only the item screenshot. At minimum, the affected Attack replacement stages and aggregate, effective crit behavior and full Critical Damage, relevant monster bucket and context eligibility must be established. The already visible HP/Evasion/MP changes do not receive default outgoing-damage weights; any resource/skill exceptions must be evaluated explicitly. There is no FD-only route for an item with no FD sources.

## Implementation decisions for the present UI

- Put corrected item values in one canonical state next to each crop; a separate draft-import step adds no mathematical value.
- Put the intended action at the bottom of that flow. If called Calculate recommendation, it must evaluate eligibility and report an honest unavailable/dependency result while no complete profile exists. It must never silently substitute raw subtraction or the isolated FD ratio for a recommendation.
- Do not add universal crit/accuracy/job/target inputs that the current action cannot consume. Explicitly tell the user that character/context integration is unfinished rather than implying their data is unnecessary.
- Keep isolated FD calculation visibly scoped and optional; its independent-source confirmation is the only currently consumed extra calculation input. A confirmation expresses the source contract but is not empirical validation.

## Smallest useful model work next

1. Implement a pure dependency/eligibility result from the two confirmed full item lists. It should identify changed families and distinguish unsupported rule, missing player input, conditional cancellation and irrelevant-to-scope effect. Connect Calculate to that result now; ordinary incomplete cases get concrete reasons, never an invented winner.
2. Implement one source-linked replacement slice end to end: verified flat Attack stage plus an additive applicable damage bucket with baseline/source decomposition and display-precision bounds. Until source semantics are established, hold it unavailable rather than universally applying raw deltas. Reuse existing pure source helpers and independent invariants.
3. Resolve effective critical semantics and current critical multiplier normalization, then implement outcome-first expectation and the field dependencies that consume those values. This unlocks the actual Attack-versus-Crit comparison instead of asking an unused Critical Rate question.
4. Enable a named context only after its constants, exceptions and item consequences close; skill/cadence effects must either be demonstrably common or explicitly modeled. First output may be a qualified modeled per-attack comparison, not automatically sustained DPS. Controlled observations and held-out comparisons remain a separate verification gate.

This sequence is actionable implementation scope, not evidence that the complete product is finished. The user does not need to repeat prior source material or provide an unavailable candidate's post-equip totals.
