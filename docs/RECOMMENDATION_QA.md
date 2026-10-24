# Independent equipment recommendation QA

2026-10-24. Independent reviewer owns this report and `tests/recommendation-independent.test.mjs`; no application, mechanics module, production or deployment edits. Read full project instructions and lessons, prior damage-model QA, essential-input reconciliation, source-reaggregation, typed stat and inline-review contracts before writing acceptance fixtures.

## Admitted objective

The proposed first recommendation is a conditional choice for ordinary successful outgoing attack damage **before named-mode rules**, with other attack/event conditions held unchanged. It compares every admitted changed offensive family by direction. It is not an isolated Attack/Final Damage score presented as a whole recommendation, a weighted CP proxy, absolute damage prediction, sustained DPS, survival/clear probability or enabled Boss Raid/Arena profile.

The source-stage bridge for one flat Attack row per item is explicitly a bounded inference: both values must be observable upper main/base options of same-slot equipment, rather than skill-granted flat Attack or extra options. The mechanics specialist's fresh official equipment findings support common positive main/sub-option amplification; they do not establish universal source attachment, hidden-effect completeness, arbitrary percentage replacement or live-game validation. Repeated Attack, Attack percentage, missing-sided Attack and unmodeled attribute/skill changes remain outside this first bridge.

Scope confirmations express the player's observed setup and the calculation's conditions; they are not proof of otherwise missing mechanics. Every listed effect must be reviewed, replacement must change only the admitted on-equip effects, and survival, landed-hit eligibility, resources, cadence and secondary mechanisms must remain adequate/unchanged. Player defensive/resource differences have no hidden offensive weight under this restricted objective.

## Independent acceptance cases

- Candidate/current swap reverses a strict modeled preference; equal inputs return no reliable preference. Input order cannot change the choice and input records remain immutable.
- Every item confirmation and relevant scope premise is consumed. Visible-list completeness establishes absent visible sources, never hidden-effect completeness.
- Unknown labels block even if their displayed values are unchanged. Any unmodeled changed critical, attribute, skill, range, speed, penetration, cooldown or status effect blocks despite arbitrarily favorable Attack.
- Repeated or percent Attack cannot be silently summed or attributed by occurrence order. Repeated changed percentage families cannot become a guessed common source.
- Opposing offensive directions abstain with a baseline/dependency explanation rather than arbitrary stat weights. Basic/skill tradeoffs cannot be averaged with an invented rotation.
- Normal and Boss monster bonuses remain separate; known target classification can change the preferred item without netting incompatible buckets.
- Missing/invalid/nonfinite/out-of-policy numbers and duplicate identities cannot become zero, a partial winner or a successful recommendation.
- Exact accepted decimal strings remain ordered even when an IEEE-754 conversion would make them equal. This is numerical comparison precision, not proof of the game's hidden precision/rounding.
- Added/lost supported sources require complete reviewed visible lists. Unsupported named encounters remain unavailable.

## Evidence and verification

All acceptance examples are synthetic algebra/data fixtures. They contain no real player measurements. The reviewer has not independently reproduced the mechanics specialist's rendered equipment-source inspection; that primary-source handoff is attributed evidence, not this reviewer's own rendered verification.

Executed `node --test tests/recommendation-independent.test.mjs`: **16 passed, 0 failed**. Independently read the complete new `equipment-recommendation.js` implementation after its initial handoff. It uses exact decimal comparisons via BigInt rather than summed weights or a manufactured relative-damage percentage; all unsupported/missing categories prevent a winner. Optional explicitly supplied source bounds must contain the displayed value and establish strict separated order; touching, overlapping, equal uncertain intervals and invalid enclosures abstain. No game rounding bounds are inferred from display syntax.

The review identified a stale-classification risk: a recognized offensive row retaining `otherReading:true` could previously be ignored. The integration owner changed the engine to exclude only unclassified observations; recognized stat rows are still processed. Independent regressions require a flagged Critical Rate change and flagged extra Attack row to block the result. Both pass after the change.

These 16 groups verify pure recommendation contracts with synthetic inputs. They do not establish OCR accuracy, browser/mobile behavior, named battle mechanics, empirical damage prediction, or production deployment. Those remain separate integration evidence. The numerical recommendation feature is not authorized for production in this task.

Two further audit findings were corrected by the integration owner and received independent regressions: null/default-missing input and null confirmation/assumption containers now abstain instead of throwing; Attack admission occurs before same-value cancellation, so even equal Attack requires the observable upper-main-option identity and equal Attack percentages remain unsupported. An otherwise favorable Damage increase cannot bypass either guard. The final focused run passes both regressions.

The integration owner subsequently identified an applicability dependency: a Skill-only improvement cannot establish strict improvement for Basic Attacks. The API now requires an actual attack-type selection only when Basic/Skill Damage changes, excludes the opposite bucket from that objective, and includes the selected type in its objective text. The independent applicability regression passes: unspecified type blocks; Skill-only improvement yields no reliable preference for Basic Attacks and candidate preference for Skills; unchanged Skill Damage does not demand an unused question.

Conservative rejections remain intentional: repeated sources block instead of being occurrence-matched; admitted factors with opposing directions block rather than accepting unused baseline questions; unchanged uncertainty intervals are not assumed to represent identical actual source values.

An eventual controlled game check should use one same-slot pair differing only in admitted main Attack or one verified independent Final Damage source, unchanged preset/target/skill/buffs, and character Attack plus repeated individual successful-hit observations before/after. This validation may use an already-owned alternative item; requiring an unavailable candidate to be equipped is not a calculator dependency. Exact collection instructions should follow the finalized supported scope rather than requesting speculative data now.
