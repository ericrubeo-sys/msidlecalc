# Dependency follow-up — 2026-10-22

Damage Mathematician. Read complete lessons, model specification/source ledger, prior mechanics and independent QA, recovered model plan and pure modules. Existing research was preserved. This bounded primary-source follow-up is not live-game validation or an exhaustive notice catalog.

## Resolved slice: level100 transition

Freshly rendered [English guide](https://maplestoryidle.nexon.com/en/guide) and [Korean guide](https://maplestoryidle.nexon.com/ko/guide), Battle System§4.2, both display update date2026-10-15. Accessed2026-10-22. English still prints61–100 followed100+. Korean has the same inclusive ranges followed by `100 레벨 이후` (after level100). Thus gained100 belongs to the preceding band and101 starts the following band. This cross-language interpretation uses explicit Korean wording; shared regional/build applicability is not established. No build identifier was disclosed.

| Mode | Gained31–60 |61–70 |71–100 |101+ |
| --- | --- | --- | --- | --- |
| Arena / World Arena |.995 |.987 |.987 |.985 |
| Colosseum |.995 |.987 |.985 |.975 |

Multiply once per gained level; reverse paths reciprocate. Units are fractional multipliers. This relative receiver-level helper supplies no absolute<=30 anchor and enables no complete PvP recommendation. Rounding/live agreement remain unknown. Publication confidence High; implementation synthetic tests; prediction unvalidated. Indexed official [July2 Korean patch](https://forum.nexon.com/maplestoryidle-kr/board_view?board=6698&thread=3490212) repeats the wording; current rendered guide is authoritative for this edit. Ignored screenshot: `.review/ko-pvp-level-source.png` (source page only).

Source→requirement→implementation→verification: Korean§4.2→inclusive100→modelv4/claims4→owner boundary/reciprocity tests plus independent QA. Prior rejection was justified by English alone; new evidence resolves it. Full Arena eligibility stays unchanged.

## Remaining dependencies

Korean Dictionary confirms attributes contribute to Attack and Stat Prop. Damage without a numerical conversion. Range values bound hits without a sampling law. Critical Resistance lowers attacker chance without an explicit subtraction/clamp. Ordinary over100% critical behavior remains unspecified. Do not invent coefficients, uniform distributions or borrow the PvP cap.

Critical Rate plus adequate Accuracy is not sufficient universally: changed rate also needs Critical Damage/effective chance; changed penetration needs target Defense; changed buckets need baseline; changed attributes/skills need their dependencies. Unchanged factors can cancel in an isolated same-stage comparison, so mandatory Critical Rate is also unjustified universally. Existing spec counterexamples apply.

Both guides§1.2 describe half-strength fixed cooldown reduction below7seconds and a4second floor from that effect. Percentage/fixed order, already-below4 base cooldown behavior, skill exceptions, scheduling and rounding remain unresolved. No full cooldown helper is built. Useful minimum evidence: exact skill base cooldown and both effective reduction types, with controlled cooldown observations spanning7seconds; no unavailable candidate equipment needed.

Full PvP still needs grouped normalization, resistance/eligibility and receiver prebattle data. Named PvE root prose does not establish complete constants/targets/exceptions. No generic Boss/Chapter profile is enabled.

## Historical skill amendments

Indexed official [August13 Korean patch](https://forum.nexon.com/maplestoryidle-kr/board_view?board=6698&thread=3521991), published2026-08-13, changes Hero Enhanced Raging Blow550%→610%, cooldown19→17seconds; Night Lord trigger intervals/passive/FD values also change. Zakum arms become boss-classified, and Zakum HP/Attack/Evasion decrease. These are concrete amendment leads, not a complete current level table or regional-parity proof. Later English/Korean reconciliation remains open. This indexed evidence is distinct from rendered current-guide verification. Prior October phase/buff/stage corrections remain applicable.

## Build decision

Build the supported level boundary correction now. Continue deterministic extraction independently. Preserve partial factor/source replacement and unknown-effect abstention. Do not invent Main Stat conversion, ordinary critical/range expectation, generic boss formulas or sustained DPS. Controlled same-context ordinary-hit observations and exact current skill-level descriptions are still needed for stronger claims. CP agreement is not damage validation.
