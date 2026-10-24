# Source-linked damage model specification

**Minimum-input extension:** `source-domain-bounds-2026-10-24-v1` evaluates an exact whole-product polynomial over shared unknown Sub amplification, independent Main response and nonnegative common backgrounds. It can prove some opposing-factor choices without character numbers. Automatic Basic/Skill agreement replaces attack selection. Advanced effective-source arithmetic is a separate technical/sensitivity contract, never silently applied to uploaded percentages. See MINIMUM_INPUT_PREVIEW.md, MINIMUM_INPUT_MECHANICS.md and MINIMUM_INPUT_QA.md. Underlying partial APIs and named-mode limitations remain as documented below.

**2026-10-24 new feature layer:** `ordinary-dominance-2026-10-24-v1` adds a conditional whole-admitted-comparison equipment preference without changing the partial arithmetic APIs below. It is not a full named-mode or DPS model. See RECOMMENDATION_PREVIEW.md and the separate mechanics/independent-QA handoffs for source admission, consumed conditions, exact decimal ordering, source bounds and abstentions. Production remains unchanged pending approval.

2026-10-22. Model `ordinary-stage-2026-10-22-v4`. The implemented scope is an ordinary pre-content arithmetic stage, partial-factor explanations and an isolated relative defender-level adjustment. It is not a named-content equipment recommendation, sustained DPS, absolute DPS or clear probability. Calculation/OCR production release needs separate user approval.

## Evidence reconciliation and traceability

The Chief of Staff lessons, recovered model/stat/methodology/resume planning, mechanics audit, source register, independent model QA, data contract and build requirements were read before implementation. Prior research existed; its absence from the old ledger did not make it missing. Historical universal raw-delta replacement, mandatory candidate post-equip totals and single-primary-context guidance are superseded by the latest user instructions.

The Damage Mathematician inspected the rendered Battle System and Stat Dictionary tabs of [Nexon's English guide](https://maplestoryidle.nexon.com/en/guide) on2026-10-22. The page reported last update2026-10-15. Game is MapleStory : Idle RPG; server/build applicability remains unidentified. Publication confidence is High; fixture consistency and game prediction confidence are separate. Historical Traditional Chinese material was not independently retranslated in this pass. Later game notices take precedence; the bounded notice audit below is not exhaustive.

| Source claim | Requirement | Implementation | Verification boundary |
| --- | --- | --- | --- |
| MSI-G15-UNITS, Battle1.1 | 1000 internal units=100%; bonus factor=(1000+s)/1000 | Explicit unit normalization before model | Synthetic unit fixtures only |
| MSI-G15-ATTRIBUTE-ORDER,1.1 | Flat sum, ordinary percentage stage, skill percentage stage, skill flat addition | Reaggregation module with source-stage identity | Ordered replacement; no universal total+rawDelta |
| MSI-G15-FINAL-DAMAGE,1.1 | Independent source factors multiply | FD source replacement; partial factor route |20% and30% yield1.56; no additive FD replacement |
| MSI-G15-REMAINING-CAP,1.1–1.2 | current+(cap-current)*source/cap | Source reaggregation | Caps/precision/saturated inverse guards |
| MSI-G15-DEFENSE,1.3/Dictionary | Dpost=D*(1-p); mitigation=5000/(Dpost+6000) | Ordinary outcome | Zero defense retains5/6; no guessed targetDefense |
| MSI-G15-DAMAGE-ORDER,1.3 | Applicable buckets, critical/range/status, FD, content, coefficient | Pre-content amount; final coefficient deliberately absent | Pure staged arithmetic, no encounter verdict |
| MSI-G15-CRITICAL,Dictionary/1.3 | Critical Damage is full multiplier on critical outcomes | Explicit joint outcomes | No ordinary crit overflow cap/range distribution guessed |
| MSI-G15-CONTEXT,2.1/4.2 | Content rules differ; attacks have exceptions | Separate unsupported profiles | Broad Boss/Guild/Chapter labels never enable formula |
| MSI-G15-PVP-LEVEL,4.2 | Relative receiver-level reductions in named bands | pvpDefenderLevelRatio | Korean corroboration resolves100; no full PvP verdict |
| MSI-Q22-TRIGGERS,Q&A | Attack trigger once/cast, strike trigger once/hit, with exclusions | Not encoded as cadence/uptime | No tier-level CP weight used as damage |

Claim records and dataset version live in `public/domain/mechanics-data.js`. Model results contain formula/data versions, consumed claim IDs, input revision and empirical status. Source publication is not proof of implementation or prediction accuracy. Parser/schema versions belong to their owning layers; UI must invalidate results after any relevant input/data/model change.

## Formula, units and order

The ordinary Attack-based formula before content adjustments and skill coefficient is:

```text
A * 5000/(D*(1-p)+6000)
 * targetTakenIncrease * targetTakenDecrease * targetDungeonAdjustment
 * Damage * Amplification * MonsterType * AttackType * StatProp
 * Mastery * OtherSkill * Critical(outcome) * Range(outcome)
 * Status(outcome) * FinalDamage
```

`A` and target `D` use stat points; effective penetration `p` is a fraction0…1. All other inputs above are full multiplicative factors, not raw display percentages. Damage bonuses use1+bonus; Critical Damage and Final Damage inputs are already complete multipliers. Unknown never becomes0 or1. Caller explicitly supplies1 only for verified absent/inapplicable factors. The routine does not infer attack eligibility from a number; exceptional fixed, target-HP-based, defense-ignoring, companion or bypass attacks require their own eligibility and formulas.

Actual `calculateOrdinaryOutcome` operation order follows the listed published sequence: base/defense; target modifiers; damage buckets/mastery/other skills; critical, range and status; **Final Damage last at this stage**. Content transformation and skill coefficient are not included. Multiplication is mathematically commutative without intermediate rounding, but that does not establish game rounding. The code uses finite IEEE-754 arithmetic without inserting unverified integer floors or intermediate rounding. No claim that this reproduces the game's undisclosed rounding is made.

`state` requires `attack`, `targetDefense`, `defensePenetration` and `multipliers` containing explicit full factors `targetDamageTakenIncrease`, `targetDamageTakenDecrease`, `targetDungeonAdjustment`, `damage`, `damageAmplification`, `monsterType`, `attackType`, `statProportional`, `skillMastery`, `otherSkill`, `finalDamage`. Unknown multiplier keys reject. `outcome` requires `criticalMultiplier`, `rangeMultiplier`, `statusMultiplier`; a noncritical branch uses1 for critical, an inactive status branch uses1 for status.

`expectedOrdinaryDamage(state,outcomes)` consumes explicit joint outcomes with probabilities0…1 summing to1 within1e-10 arithmetic tolerance. It does not assume independence, uniform min/max range, displayed Critical Rate meaning or a hit-rate curve. Equal range endpoints can be deterministic; distinct endpoints alone do not establish probabilities. Outcome probabilities may be user-supplied assumptions/observations, not calibrated predictions. Future nonlinear content processing must transform each branch before expectation. `E[root(X)]` generally differs from`root(E[X])`; skill coefficient belongs outside the content transform. The existing exponent primitive is algebra, not an enabled encounter profile.

`compareOrdinaryStates({current,candidate,currentOutcomes,candidateOutcomes,contextId,unsupportedEffects,completeEffectsConfirmed,inputRevision})` accepts only literal `ordinary-before-content`. It returns partial stage factors and always null complete-equipment winner/percentage. Neither a confirmation checkbox nor supplied numbers establish complete context mechanics. Missing/invalid values and unknown contexts abstain. A zero baseline has no percentage. Overflow/nonfinite values and positive product/ratio/weighted-outcome underflow reject rather than silently becoming zero or Infinity.

`compareSupportedFactors({factors,unsupportedEffects,inputRevision})` is the light route. Each factor is `{id,current,candidate}` with positive confirmed effective values. IDs are `attack`, `damage`, `damageAmplification`, `monsterType`, `attackType`, `statProportional`, `finalDamage`, `defense`; here defense means the **target mitigation factor**, never the player's Defense. Duplicate/unknown IDs reject. It returns individual/combined conditional factor ratios, always partial with null equipment verdict. Unlisted terms are held equal for the isolated explanation; it does not prove they are actually equal. Unknown changed effects remain eligibility issues even if a supported partial contribution is computed.

## Replacement and minimum-input policy

Do not require an unavailable candidate item to be equipped. Obtain verified source decomposition/reaggregation when available; otherwise show independently supported partial factors and request the smallest missing stage/source measurement. Current totals+raw item delta is invalid for arbitrary percentages, attribute stages, Final Damage, remaining-cap families and changed passives. Rounded aggregates are not exact inverse measurements. Saturated cap sources can destroy inverse uniqueness. Stable character totals already include relevant passive effects once; adding an artifact/passive again double counts. Main/sub stats affect both Attack and Stat Prop. Damage; no numerical conversion is invented.

The user's Critical Rate plus adequate Accuracy hypothesis is not a universal minimum. If critical chance changes.2→.3, the critical factor is1.06/1.04≈1.0192 for full multiplier1.2 but1.9/1.6=1.1875 for multiplier4. These reverse ranking against a10% Attack increase. Conversely, unchanged joint crit/range/hit behavior can cancel in an ordinary conditional factor ratio, so mandatory typed crit/accuracy totals are unnecessary for some narrow slices. Cancellation needs matching algebra/stages and assumptions; it is not universal context support.

| Field | Formula/eligibility consumer | Essential, optional or cancellable | Missing data and screenshot limits |
| --- | --- | --- | --- |
| All ordered item lines/units/source/identity | Replacement and completeness | Always preserve repeated, unknown, unmatched and unequal line sets | Missing/unknown changed offense blocks full ranking; visible screenshot is not hidden-effect certification |
| Current Attack and source stage | Attack factor/reaggregation | Changed Attack needs current effective total and verified source replacement | Item screenshot alone lacks baseline multipliers; partial only when stages unresolved |
| Main/sub attributes, job, level | Attack/StatProp and per-level effects | Needed only when deriving affected totals; can avoid conversion with verified reconstructed totals | No guessed MainStat coefficient; changed unsupported effect blocks full winner |
| Damage/Amplification totals |1+bonus buckets | Relevant changed bucket needs baseline; unchanged factors may cancel | Item delta without bucket baseline insufficient |
| Boss/Normal totals, target classification | Monster-type bucket | Irrelevant type excluded; changed relevant factor needs baseline | No generic boss identity from a broad mode label |
| Basic/Skill totals, attack type | Attack-type bucket | Same attack may cancel unchanged factor; mixed rotation needs mixture | Per-attack evidence cannot rank sustained mixture |
| Stat Prop. Damage | Separate offensive bucket | Need changed total/source semantics when attributes/passives change | Dictionary supplies meaning, not numeric conversion |
| FD aggregate/source factors | Multiplicative replacement | Exact aggregate division only with verified old source/precision | Rounded or unclassified source needs bounds/decomposition, never additive replacement |
| Target Defense and penetration | Defense factor | Unchanged mitigation cancels ordinary ratio; changed penetration needs targetDefense | No default target0; screenshot cannot establish target stats |
| Effective Critical Rate, full Critical Damage, resistance | Changed critical expectation | Both can cancel if unchanged joint law and eligibility; changed rate alone insufficient | No ordinary overflow cap or resistance subtraction guessed |
| Min/max and actual outcome law | Expected damage | Equal endpoints deterministic; unchanged law may cancel | Different endpoints cannot imply uniform distribution/mean |
| Accuracy, Evasion, attack eligibility | Hit adequacy | Adequate-hit assumption explicit; surplus Accuracy gets no weight under it | Published70% evasion boundary not full curve; no universal threshold |
| Status damage/status uptime | Conditional branch | Inactive status term absent; unchanged joint behavior may cancel | Screenshot supplies magnitude, not uptime |
| Target received-damage and dungeon effects | Target-side terms | Matching unchanged factors may cancel at ordinary stage | Role and stage unresolved means no context effect |
| Skills/levels/mastery/passives | Coefficients and changed baseline | Already-reflected totals counted once; changed skill needs exact dependencies | No CP skill weight or generic per-level damage multiplier |
| AS/cooldown%/flat cooldown | Cast/hit schedule | No direct per-hit multiplier or arbitrary tie-breaker | Changed cadence blocks sustained claim without timing model |
| Artifacts/temporary buffs/triggers | Snapshot or explicit dynamic state | Stable totals include passive once; material dynamics must be reconsidered for advanced | Cannot promise advanced accuracy while silently omitting changed effects |
| Companions/summon duration | Snapshot inheritance and uptime | Separate guide2.5 rules and exclusions | Player skill coefficient alone insufficient |
| MP/recovery/cost/action lock | Resource/action schedule | Irrelevant only under adequate-resource/uninterrupted-action assumption | No hidden weight; changed casts need schedule |
| Target count/availability | Multi-target throughput | No single-target gain without additional eligible targets | Need skill/target caps and encounter availability |
| Player HP/Defense/Evasion | Survival/receiver exceptions | No outgoing weight under adequate survival/ordinary attack objective | Not declared universally useless; supported exceptions separate |
| CP/EXP/Meso | Progress/utility display | No ordinary outgoing damage consumer | Retain separately, never validate or break DPS ties |
| Exact mode/target/stage | Profile eligibility | Always required for named recommendation | Unsupported profiles get separate unavailable cards |

Screenshot extraction reliability is unverified here. Item screenshots do not supply all character/target values. Every extracted line must remain editable; unreadable values stay unknown. This matrix specifies dependencies, not a claim OCR obtains them.

## Context eligibility, confidence and Henesys

Chapter Breakthrough has no complete verified profile in inspected material. Named Zakum/Horntail Boss/Guild Raid entries describe root-based adjustment; Guild Training describes cube-root-based adjustment. That prose alone does not establish complete constants/target exceptions. Other bosses/Guild content do not inherit those profiles. Arena/World Arena/Colosseum have more detailed appendix data but full role-aware input normalization/grouping/exception verification is unfinished. Each remains a separate unavailable full recommendation. Low confidence never permits an invented number.

Publication confidence High; implementation confidence source-linked synthetic fixtures plus independent QA; live-game prediction unvalidated. No CP proxy, hidden defense/surplus Accuracy weighting or fabricated OCR exists in this numerical module. Controlled game comparison is a separate future gate.

No official guarantee was found that leaving Chapter Breakthrough for Henesys removes every temporary effect. A failed search is not proof the procedure fails. Do not publish it as guaranteed. Minimal optional observation: unchanged gear/preset; record detailed Attack/AttackSpeed and buff icons before exit, immediately in Henesys and after known visible timers expire; repeat twice without triggering skills, record persistent effects and time. No candidate equipment needed. This validates only the observed setup, not all jobs/artifacts/auras. Independent source work can continue meanwhile.

## Detailed PvP appendix and bounded notice audit

Rendered guide4.2 gives receive-side sequence `sqrt(ordinary formula without coefficient) * coefficient * level adjustment * PvP adjustment * 2`. The base uses attacker offense and receiver defense. The separate PvP reduction uses **receiver prebattle offense and defense**, unaffected by active skills/buffs/start-of-battle changes. Role confusion can reverse recommendations.

Its constants are Arena7206000000, Colosseum4323600000, WorldArena5764800000. The reduction combines a receiver offensive product plus1000000000 raised to.23, `(MaxHP*100000000)^.12`, `((Defense+6000)*1000000000000)^.14`, `((100%+DamageTakenDecrease%)*1000000)^.5`, and published scale divisions. Offense includes Attack, penetration, Damage/Amplification, Basic/Skill average, StatProp, critical average, min/max average and FD. All abbreviated percent factors require exact permille normalization and grouping verification. A typography transcription is not an implementation fixture; this full reduction is not encoded.

The PvP reduction specifically caps critical weighting at100%, uses CriticalDamage average and min/max average, using max if minimum exceeds max. These are **reduction-stage rules**, not ordinary overflow/range laws. CriticalResistance's effective-rate role and the exact normalization of every abbreviated factor remain unresolved for a complete implementation. No universal subtraction/clamp was added.

`pvpDefenderLevelRatio({mode,fromLevel,toLevel})` returns only the relative damage taken from receiver level. Allowed modes: arena/world-arena/colosseum; safe integer levels>=30. Gained levels31–60 use.995. Arena/WorldArena61–100 use.987; above100 use.985. Colosseum61–70 use.987,71–100 use.985,above100 use.975. Reverse paths reciprocate. No below31 absolute anchor or attacker-level difference is inferred. The English source ends its closed band at100 and next says100+. Fresh rendered same-date Korean§4.2 says after level100, resolving this translation overlap: gained100 uses the preceding band; gained101 uses the next. v4 removes the prior conservative rejection using this new primary evidence; see research/DEPENDENCY_RESEARCH_2026-10-22.md. Shared regional/build applicability and live-game agreement remain unverified. Numeric overflow/underflow rejects. This helper does not enable full Arena support.

Further primary sources accessed2026-10-22:

- [Jan29 patch notes](https://forum.nexon.com/maplestoryidle/board_view?board=6675&stickyBoard=1&thread=3360937) and [Apr30 patch note](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3435578) publish job-specific skill coefficients/hit counts/passives/trigger chances. Claims that no coefficients are public would be wrong. Dated snapshots need later balance and exact skill-level reconciliation; never linearly extrapolate. Job-main-stat labels do not give numeric attribute conversion.
- [Aug6 combat-disclosure announcement](https://forum.nexon.com/maplestoryidle/board_view?thread=3518029) identifies the battle-information page and planned job balance changes, cautioning against assuming older coefficients current.
- [Oct15 patch notes](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3563772) add PinkBean GuildRaid with HP-dependent incoming damage and timed statue buffs. Event Chapter-idle boosters affect FD/cooldown/AS. These materially require state/buff treatment. CP-weight changes do not validate damage. The orchestrator additionally inspected [Oct15 live patch](https://forum.nexon.com/maplestoryidle/board_view?thread=3564301): GuildWar boss-stat stage-scaling correction further rules out silently generalizing one Guild profile; this is attributed orchestrator evidence.
- [Oct16 app update](https://forum.nexon.com/maplestoryidle/board_view?thread=3564557) concerns login delay in inspected indexed text; not proof no later damage fix exists.
- [June25 Arena/Colosseum correction](https://forum.nexon.com/maplestoryidle/board_view?board=6653&thread=3484256) was located but content did not extract in this specialist pass. Title only is a lead, not an encoded formula.

The English [notice](https://forum.nexon.com/maplestoryidle/board_list?board=6653) and [patch](https://forum.nexon.com/maplestoryidle/board_list?board=6675) indexes returned dynamic shells; the specialist browser then became unavailable. Indexed primary text and prior rendered-tab inspection are distinguished above; no exhaustive later-notice audit is claimed. No primary numeric MainStat conversion was located in this pass. Community claims remain discovery leads requiring primary confirmation or controlled observations before encoding.

## Verification and next work

Seven owned synthetic tests cover defense/buckets/joint outcomes, missing/unsupported contexts, partial reciprocal/equal factors, numerical failures and PvP level transitions/ambiguous-boundary rejection. Independent QA owns its invariant suite/report. Tests establish implementation consistency only, never live-game accuracy or OCR reliability. Source/requirement/implementation mapping above must be revisited at integration and release review.

Advanced work remains dependency-driven: reconcile skill coefficients/passives/levels and later balance; model cast-vs-hit triggers, cooldown/AS carryover/interruptions, resource limits, material buffs/artifacts/companions and exact named encounters. Relative sustained DPS additionally needs proven invariant timing/attack mixture/uptime or a complete schedule; absolute DPS needs time and a complete damage model. Controlled repeated same-context observations with held-out cases are required before prediction confidence increases. No arbitrary error tolerance or CP agreement substitutes for that validation.
