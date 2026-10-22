> Historical msIdleCalc planning recovered on 2026-10-22. Not implementation-validated. Read alongside research/MECHANICS_AUDIT_2026-10-22.md and current decisions; historical translations and universal raw-delta replacement guidance require correction.

# How the equipment comparison works

*Draft for the Methodology link. This describes the intended approach; the calculator and its supported features are still being designed.*

The goal is to help you choose gear for the content you want to clear by comparing **damage per second (DPS)** over an encounter—not one large hit or Combat Power alone. The default recommendation is about offensive output. It assumes your character is already accurate enough to land attacks and is not at risk of dying.

## What the tool compares

The tool reads a game screenshot and identifies the currently equipped item, the item being considered, and the stat lines shown for each. It presents those readings for you to check. You can correct a misread value before the calculation uses it.

The comparison applies the difference between the two items to your confirmed character stats. This matters because the value of a stat can depend on your existing totals, how the game combines that stat, and any cap that applies. After checking the scan, you choose what you are trying to clear—such as Chapter Breakthrough, a boss, Guild Boss, or Arena—because each context can favor different offensive stats and rules.

## How recommendations are calculated

The calculator is intended to use MapleStory Idle combat rules published by Nexon, including documented stat stacking and context-specific adjustments. It will rank items by offensive damage for the selected scenario. A per-attack estimate can be built from the published damage rules; sustained DPS additionally needs reliable skill timing, attack cadence, and scenario data. The best item can differ between Chapter Breakthrough, bosses, Guild Boss, Arena, and other modes, so each recommendation should name its target context.

Combat Power is not treated as a direct measure of damage or DPS. It can include stats such as Max HP, Evasion, and Accuracy that raise CP without improving DPS when you already survive and your attacks already land. Under that assumption, those stats do not add points to the DPS recommendation. Accuracy matters only if it changes the chance of landing attacks against the selected target. A comparison is only as precise as the confirmed values and combat rules available for that context.

The model checks every stat against the selected content. Some stats affect damage directly; others matter only at a cap, when a particular skill or effect is active, when attacks hit multiple targets, or when a resource limits casts. Stats that only affect CP, survival, or non-combat rewards stay outside the default DPS score. Unknown stat labels are not guessed; they need to be identified before they can affect the result.

## What the estimate includes—and may leave out

The default comparison focuses on the item change against a stable character-stat snapshot. Temporary buffs and individual artifact or skill-buff effects are not separately modeled in the first version. Permanent bonuses already reflected in the confirmed character totals contribute to that baseline; they should not be added again.

Sustained performance depends on skill timing, attack cadence, target defenses, effect triggers, and how long an effect remains active. If those inputs or rules are unavailable, the tool will state its assumptions and identify what it did not model. A per-attack stat impact should not be presented as sustained DPS.

## How estimates will improve

The initial version can compare documented offensive stat changes. A later version can model verified skill rotations over a selected encounter window and report estimated sustained DPS. Repeated controlled in-game results—damage or progress over time, with the same content, preset, and buffs—will show how well the estimate ranks gear. Clear/fail, remaining time, HP, deaths, and potion use can be recorded as secondary checks, but the default recommendation does not optimize survivability.

## Your review matters

Screenshot reading can make mistakes. The tool shows the values it detected so you can confirm or edit them before calculating. If an important value is unclear or missing, it should ask for that value or explain the limitation instead of silently guessing.

## Living documentation

Game rules and balance can change. The calculator’s formula and supported contexts should be tied to a documented source/version and reviewed when Nexon updates its guidance. This is a fan-made community project and is not affiliated with Nexon.

---

## Internal drafting notes (remove before publishing)

- The complete optional Advanced Calculation field list is not finalized.
- Default objective: maximize DPS for the selected content. Exclude Max HP, Defense, Evasion, and surplus Accuracy from the score when the player survives and hits reliably; keep these CP-related stats distinct from offensive output.
- First release promise: modeled offensive damage impact for the selected content. Do not call it sustained DPS until relevant cadence/rotation is modeled.
- Long-term goal: estimate scenario-specific sustained DPS and validate gear rankings against controlled repeated outcomes. Survival analysis is separate/opt-in, not silently blended into DPS.
- Verify current official formula values and labels, including critical-hit and accuracy/evasion handling, before treating this copy as final.
- Artifact-specific triggers, uptime, scroll/Star Force/Potential transfer behavior, and encounter-specific exceptions need separate evidence before support is claimed.
