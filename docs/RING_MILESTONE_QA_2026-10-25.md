# Ring and OCR milestone: independent QA

Date: 2026-10-25. Feature-branch preview; no publication or deployment performed by this reviewer. This report separates independently authored software checks, visual inspection, integration-owner browser observations, and game-mechanics evidence.

## Decision

The complete ring remains **No reliable preference** in all ten result contexts. This is the correct evidence-blocked result for this milestone, not a complete recommendation implementation. Main Stat conversion into both Attack and Stat Prop. Damage, current job-skill replacement, and damage-range behavior must be resolved together. A large favourable supported Attack line, checked assumptions, or an elaborate character questionnaire must not bypass those blockers.

The new OCR path can notice some omitted interior rows, make bounded targeted retries, and retain a required blank when recovery is ambiguous. It cannot certify a complete item list. Edge omissions and rows without usable independent neutral label/value ink remain limitations. The user must still check both crops and correct typed fields.

## Independently checked acceptance image

I inspected the original Squashy Ring comparison image, rather than using a previous OCR transcript as truth. The current panel has Attack 6,624; Max HP 32,562; Main Stat 486; 2nd Job Skill Lv. 16; Critical Rate 9.6%; 3rd Job Skill Lv. 17. The new panel has Attack 6,042; Max HP 30,327; Main Stat 444; Normal Monster Damage 9.5%; 3rd Job Skill Lv. 16; Max Damage Multiplier 14.5%. Both headers have twelve filled yellow stars.

The new skill row's coloured −1 is a comparison delta, not part of its base level. The image establishes neither character totals nor job, skill progression, hit distribution, opponent resistance or observed battle performance. It has already been used in development and is **not held out**.

## Software checks run

The following three new files were authored by the independent QA role using invented numerical/geometry fixtures. Those fixtures test contracts and arithmetic; they are not game measurements.

| File | Passing groups | Principal challenges |
| --- | ---: | --- |
| `tests/ring-milestone-independent.test.mjs` | 11 | Complete-ring abstention; structured mechanics blockers; gained/lost unsupported effects; exact value/unit cancellation; missing/merged/wrong-unit lines; both Attack sources; independently bounded whole Attack/Critical/Boss tradeoff and reversed orientation; root-before-expectation counterexample; unknown resistance/ties; duplicate source stages and magnitude limits. |
| `tests/ocr-milestone-independent.test.mjs` | 13 | Interior missing row; no fixed six-row assumption; edge/semantic uncertainty; two-row retry bound; numeric glyph evidence; second-row ambiguity; original transcript retention; corrected/confirmed/manual preservation; required blank; recovered Attack coordinate/role inference; cancellation and stale generation during an actual pending retry; retry failure redaction and resource disposal. |
| `tests/extraction-metrics-independent.test.mjs` | 8 | Balanced omission plus extra row; legitimate repeated Attack; explicit duplicate annotation; invalid alignment; unreadable truth versus false completeness; unverified held-out declarations; aggregate privacy; unexpected-panel completeness claims; finite timing and safe counter limits. |

Command run successfully:

```text
node --test tests/ring-milestone-independent.test.mjs tests/extraction-metrics-independent.test.mjs tests/ocr-milestone-independent.test.mjs tests/coverage-retention.test.mjs tests/ocr-coverage.test.mjs tests/ocr-reader.test.mjs
```

Result: **50 passed, 0 failed**. Of these, 32 groups are independently authored here; 18 are existing/integration-owner groups. The latter are useful regression coverage, not independent fixture authorship. The root agent owns full-suite and browser verification.

I additionally inspected the integration: edited same-image records survive rereads; new unmatched recovery evidence enters as an empty required row instead of overwriting a user's number; identical gap evidence is deduplicated; fresh-image proposals replace old-image corrections. App-level run and image revisions are checked after the reader resolves, and retry failures recheck cancellation before being downgraded to unresolved recovery. No stale/cancellation bypass was found in the checked paths.

## Findings repaired during review

1. The scorer originally failed to count a `complete:true` claim on an unexpected observed panel. Such claims now count as false completeness; an independent regression verifies it.
2. Finite per-run latencies could overflow their aggregate, and retry counters did not enforce safe integers. Aggregate timing and counter guards now reject those declarations.
3. Recovery initially accepted boundary evidence on any word. A label's evidence could therefore substitute for missing numeric-base evidence. Recovery now requires explicit acceptable evidence on the base-number word.
4. Recovery initially filtered unknown rows before checking that a retry contained one row. A valid adjacent row plus a second unknown/unreadable row could have been promoted. The retry now rejects additional substantive rows; independent numeric and unreadable second-row cases pass.

Recovered numeric values remain unconfirmed proposals. Mapped geometry uses the original panel coordinate system before Attack-source inference, with original retry observations retained separately. Missing mapping metadata falls back to retained row order rather than mixing coordinate systems.

## Original-image browser evidence supplied by integration owner

The root agent reports actual local-browser/Tesseract runs of the complete reader on the original ring and shoulder images, with private evidence files retained locally. I did not independently execute those browser runs. These are reused development images, not untouched validation data.

| Reused comparison | Exact numeric values before targeted retry | Exact numeric values after retry | Remaining issue |
| --- | ---: | ---: | --- |
| Ring, two complete panels | 11/12 | 12/12 | No remaining value error in this observed run. |
| Shoulder, two complete panels | 11/12 | 11/12 | Boss Monster Damage 7.5% remains blank because retry evidence includes an extra border/letter observation. Manual correction is required. |

The root reports all 24 expected row identities and units present, with no missing, extra or duplicate rows after the blank-separator integration fix. This distinguishes value unreadability from row omission: an explicitly blank required field is not an exact numeric read. **Held-out images: 0.** This small reused sample cannot estimate general OCR accuracy, omission recall, failure rates or confidence calibration. No latency-performance claim is made here.

## Evidence and remaining limits

The mechanics specialist's `RING_COMPLETE_MECHANICS_2026-10-25.md` distinguishes documented guide/patch facts, mathematical requirements, historical datasets, and unknown relationships. I checked its full-comparison reasoning and dependency handoff against the engine, but did not independently reproduce its rendered official-source browsing. The resulting source evidence is attributed to that specialist, not a second live-game validation.

Passing software tests demonstrate that implemented arithmetic respects the tested inputs and that unsupported families block a numerical preference. They do not establish the Attack response assumption, rounding bounds, critical/resistance law, range distribution, job passives, skill timing, or activity rules as demonstrated game truth. No controlled Attack experiment or other live-game measurement was performed. Neither a larger stat form nor confidence wording can repair missing formula evidence.

Release review should retain the evidence blocker, conditional questions only for implemented consumers, and no ring winner. Follow-up research must supply current complete skill curves and source interactions, numeric attribute conversion into both affected offensive quantities, and range/critical/context behavior or a valid bound that proves a complete-pair preference. OCR follow-up needs genuinely unused complete screenshots with truth declared before tuning, including first/last-row omissions, unknown effects, colour/scale variation, and recovery false positives. The current edge uncertainty and conservative shoulder blank must remain visible limitations.
