# Recommendation input and result UX contract

2026-10-24. UX specialist review for the recommendation feature preview. This document is an implementation contract, not evidence that a numerical engine or live-game prediction is validated. Production numerical release remains subject to user approval.

## Evidence reconciled

Read the complete project `AGENTS.md` and `docs/LESSONS.md`, `docs/ESSENTIAL_INPUT_STATUS.md`, `docs/COMPACT_CONFIRMATION_RELEASE.md`, current `public/index.html`, `public/app.js` through the confirmation/calculation handlers, the complete `public/domain/stat-fields.js`, the source-replacement module, and the relevant model/data-contract dependency sections. The user's latest correction supersedes older repeated forms: keep the editable crop and values together, collapse each item after confirmation, and show only concise context recommendations after calculation. No new mechanics claim is established by this review.

The production result path currently generates eight unconditional abstentions. Its typed item catalog defines entry syntax only. Neither a selected stat type nor confirmation of visible lines proves a mechanical source stage. The separate hidden Final Damage experiment is an isolated factor and must not become a complete recommendation by changing its heading.

## Normal sequence

1. Upload and read the screenshot locally.
2. Show each crop immediately above its editable typed stat rows. Incomplete reads still reach this screen. Highlight missing stat selections or values; never replace blanks with zero.
3. Confirm current equip and new equip separately. Collapse each crop/editor, retain an Edit item action, and preserve the other item's confirmation when one is edited.
4. Evaluate dependencies on these confirmed lists. Show only additional inputs that an implemented calculation can consume. Both item cards remain collapsed above this section.
5. Calculate paints the existing simple checking state, then shows concise context results.
6. Back to items preserves values. Changes to a consumed field invalidate the result; editing one item also invalidates that item's confirmation.

No required full-image review, duplicate line editor, raw numerical change list, OCR transcript, source-stage form, or universal character questionnaire belongs in this sequence.

## First scope must determine the questions

The mechanics specialist chooses the supported mathematical scope. The UI must not widen it. There are two materially different cases:

- A fully closed directional comparison may establish one item is preferable throughout its supported bounds without numeric character totals. In that case, do not collect unused Attack, Critical Rate, Accuracy, job or target fields. State the restricted objective in one short sentence; necessary factual scope choices remain explicit. Lack of a numeric question does not mean general trade-offs have been solved.
- A quantitative trade-off needs each affected factor's supported current baseline and replacement path. Ask only those baselines the implemented engine can correctly use. A visible total alone is not enough if source reconstruction remains unresolved. Missing mechanics must produce an honest unavailable result rather than a field the player cannot meaningfully answer.

These are alternative eligibility paths, not permission to guess a first implementation or ship a directional proxy. Directional support must account for every material changed effect and its interactions within the advertised objective.

## Field presentation and provenance

Use a compact section headed **About your character** only when at least one supported dependency needs an answer. Label each required field with its exact in-game stat name, a persistent unit, and a single brief reason if the dependency is not obvious. Prefer the current-equipped character state; never require equipping the potential new item. Retain literal input and normalized quantity separately.

| Conditional dependency | Player-facing question once implemented | Input contract | Must not imply |
| --- | --- | --- | --- |
| Current affected Attack baseline | Attack, with current equip | Required integer or supported displayed interval; identify the usable in-game screen | Adding the item flat difference to this total is always valid |
| Changed applicable additive bucket | Exact in-game Damage / Boss Monster Damage / Normal Monster Damage label | Displayed percentage with explicit grouping/precision rules | All these labels are one interchangeable pool |
| Changed critical expectation | Critical Rate and Critical Damage | Percent fields; retain the displayed Critical Damage definition | Rate alone determines value, or a universal overflow cap/resistance law exists |
| Target-dependent mitigation | Supported target or target-specific field | Prefer a bounded verified target option to unverifiable free-form defense | Any boss choice establishes a complete named encounter profile |
| Relevant attack objective | The supported ordinary attack/objective, with a concise eligibility description | Only choices backed by executable profiles | A per-hit comparison ranks sustained DPS, survival or clear speed |

Do not show a field until its consumer is implemented. This table is a conditional design contract, not a request to add all these fields now.

For any displayed-number baseline, do not ask the player to certify that a rounded screen value is mathematically exact. Precision should follow the supplied screen/value evidence and supported interval model. Missing source identity, aggregation stage, resistance law, skill conversion or encounter constants are implementation/evidence blockers. Ordinary players cannot reasonably supply them by typing a total or checking “I understand.”

A real scope condition the player can observe may be asked plainly, for example whether the chosen comparison concerns ordinary attack damage rather than a skill that explicitly scales with HP. Its wording and necessity must be reviewed against the actual supported mathematics; do not invent broad assurances such as “all other effects cancel.”

## Four dependency classes, two visible actions

The domain layer should preserve exact issue codes and field references. The normal UI offers only a concise explanation and the relevant action:

| Dependency state | Presentation | Action |
| --- | --- | --- |
| Missing player information | “Enter [stat] to compare these items.” beside the required field | Fill the field; focus the first missing field on submit |
| Unresolved or unimplemented mechanics | “This comparison includes [effect] that we cannot model yet.” | Edit items if the reading is wrong; otherwise retain an unavailable result |
| Demonstrably unchanged/cancelled factor | No normal input or warning | Optional explanation can name the cancellation and its supported scope |
| Outside the supported objective | One scope sentence, with detail only when needed | Preserve the effect; do not score it or declare it globally useless |

An effect that changes survival, resource availability, skill damage or cadence may be outside a deliberately narrow ordinary-hit objective but still prevents advertising a general equipment recommendation. Scope copy must make that distinction before calculation and in result details.

Do not disable every action behind unexplained unavailable inputs. Missing player fields can block a supported calculation with inline errors; unsupported comparisons may still calculate eligibility and reach the compact honest result. The existing item-confirmation requirement remains separate.

## Result contract

Keep one row per actual supported named context or clearly bounded modeled objective. Use the official context names already sourced in the project; do not merge all boss content or all PvP into one assumed profile.

Each row contains:

- Context/objective name.
- **Current equip (left)**, **New equip (right)**, or **No reliable preference**.
- Confidence: **High**, **Medium**, or **Low**.

“No reliable preference” covers equal supported outcome or an unresolved ordering, but the optional explanation must distinguish these cases. Unsupported profiles should read **Unable to recommend** rather than implying a measured tie. Low confidence cannot authorize a chosen winner. Do not show raw differences, CP weights or partial-factor percentages as the recommendation.

One optional **Why?** / **Details** action for the entire result can state the objective, assumptions, missing dependencies, source/model versions, and validation status. Keep per-context reasons short within that single detail surface. Separate source publication quality from prediction confidence: an official formula plus synthetic software tests is not controlled in-game validation. Do not label a supported winner High confidence merely because its arithmetic tests pass.

The loading screen is only a brief processing state; do not introduce an artificial fixed delay. Announce it with `role=status`, place focus on the result heading after completion, and guard against stale asynchronous results when inputs change.

## Acceptance checks for integration

- Both cards stay collapsed while essential inputs are entered. Editing either retains all entered character values; dependencies are recomputed, stale answers cannot silently apply to a different stat or objective.
- Supported and unsupported comparisons do not inherit a winner from a previous result.
- Empty, malformed, incompatible-unit and out-of-range player values get a field-addressed error. Explicit zero is retained only when valid for that field's mathematics.
- Required inputs can be completed on a phone with persistent labels, at least 16px entry text and 44px controls. No horizontal overflow or keyboard-covered primary action.
- A repeat stat remains a distinct occurrence; an unknown or unmodeled changed effect cannot be ignored merely because recognized fields are valid.
- No numeric user question appears when only missing mechanics prevent the result. No source-stage knowledge is requested as an ordinary-player certainty checkbox.
- Result rows remain legible without opening details. Raw deltas and OCR fragments never return to the normal result list.
- Browser workflow verification and synthetic arithmetic verification are reported separately from physical-phone testing and controlled live-game evidence.

This document-only review did not run tests or inspect a rendered new implementation. The final exact fields and eligible objective must be reconciled with the mechanics specialist's implementation contract before handoff is complete.

## Mechanics handoff: candidate first implementation

The mechanics specialist proposes coordinatewise dominance for eligible ordinary Attack-based damage: every materially affected supported factor must be non-worsening and at least one must strictly improve. Mixed Attack-versus-Crit trade-offs remain unsupported. This can be a useful directional recommendation without numerical character totals, provided the engine actually proves its prerequisites; it is not a permission to rank by counting green item lines.

For that candidate scope, title the modeled objective **Ordinary attack damage**. State before calculation: **Compares ordinary attack damage. It does not compare survival or clear speed.** The final wording must additionally distinguish successful-hit/per-hit scope from sustained damage when that is the implemented contract. No decorative Attack, Critical Rate, Accuracy or job fields are required when their numeric values do not enter the proof.

Changed Critical Rate, skill levels, Main Stat, source-dependent transfer/attachment, or other unresolved effects must remain blockers where not modeled. A player checking a stable-situation premise does not implement these mechanics. In particular, the math handoff identifies non-skill flat-source interpretation as necessary for flat Attack support. The source family must come from evidence or an objectively verifiable selection; a generic Attack label, ordinal match, or “these are ordinary item stats” checkbox does not establish it.

If a scope premise is genuinely observable, ask it with a concise question and no preselection. A possible factual gate is **Do these replace the same equipment slot?** with **Yes / No / Not sure**, but only if the engine consumes that fact and a source-backed transfer rule is separately satisfied. Do not ask a blanket “all relevant effects are unchanged” question that forces users to understand the model. Keep every necessary premise explicit in the explanation while avoiding source-decomposition jargon in the normal flow.

If no ordinary player can provide the required stage evidence, present the exact blocker and request a targeted controlled measurement outside the calculator. Do not hide the blocker by accepting an unverifiable confirmation. Independent QA explicitly agrees that unknown source stage or attachment cannot be resolved by matching repeated lines in occurrence order.

**Final source-stage clarification from mechanics:** the freshly inspected official general stage formula does not identify comparison-panel Attack rows as non-skill flat sources or establish hidden slot-transfer invariance. Therefore changed Attack must be a hard blocker until that evidence is resolved. The proposed first eligible dominance families are supported same-type ordinary Damage, applicable Boss/Normal Monster Damage, Basic/Skill Damage, and independent Final Damage, with every other relevant offensive family unchanged and each source contract independently established. These families still do not allow arbitrary cross-bucket trade-offs. Keep the scope visible; do not promise that the user's current mixed Attack/Critical Rate shoulder example can receive a recommendation from this first slice.
