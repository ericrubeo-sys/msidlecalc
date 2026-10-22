# Comparison data contract and local OCR validation plan

Status: proposed implementation contract, 2026-10-22. This document defines boundaries; it does not implement or validate a numerical damage model, select an OCR dependency, or approve the visual design. Build the manual path and review the calculation core before adding OCR. Obtain the user's visual checkpoint approval before full visual implementation.

## Sources and present implementation

- [Project brief](PROJECT_BRIEF.md): screenshot/manual entry, correction, conditional context, confidence, browser processing, and CP distinct from DPS.
- [Deterministic tooling plan](DETERMINISTIC_TOOLING_PLAN.md): versioned source-linked data, a pure calculator, raw OCR preservation, local permissioned fixtures, and privacy checks.
- [Mechanics evidence audit](../research/MECHANICS_AUDIT_2026-10-22.md): published-rule evidence, unresolved conversions/interactions, activity scope, and the safer confirmed-total comparison route. Its references include [Nexon's English guide](https://maplestoryidle.nexon.com/en/guide) and [developer Q&A](https://maplestoryidle.nexon.com/en/qna). The audit reports the guide as updated October 15, 2026; no game build was identified. This contract relies on that audit and adds no independent mechanics verification.
- [Research register](../research/SOURCES.md): canonical destination for claim records. It was reconciled with recovered research and the audit during this kickoff. Published evidence, isolated tested primitives, a complete executable model, and live-game validation remain separate states.
- [Current pure domain module](../public/domain/comparison.js) and [tests](../tests/comparison.test.mjs): six fixed raw item-line fields, null for missing values, candidate-minus-current deltas, and unavailable damage with Low confidence and null winner/percentage. The tests cover this limited behavior; they are not formula or OCR validation.

The current fixed `stats` object cannot represent two lines for the same stat, unknown labels, units by line, field provenance, character totals, or extraction uncertainty. Retain its safe abstention behavior while introducing a lossless input model. Do not infer evidence from the fact that a field currently exists in the UI.

## Boundary between layers

| Layer | Receives | Returns / owns | Must not do |
| --- | --- | --- | --- |
| Intake | Local File or manual text | Ephemeral image handle and intake status | Upload, persist, log contents, infer a winner |
| OCR adapter | Decoded local image/crops and pinned configuration | Raw text, tokens/boxes where available, engine scores, run identity | Overwrite corrections or claim mechanics support |
| Parser | Raw/manual text and explicit locale | Ordered line records, candidate stat IDs, quantities, parse issues | Drop unknown lines, merge duplicate lines, guess unreadable digits |
| Correction/session | Parsed records and user edits | Immutable input revision, confirmed effective fields | Treat OCR score as user confirmation |
| Schema/context validation | Confirmed revision and versioned mechanics dataset | Typed input or field-addressed issues; required context | Supply unknown values as zero or guessed defaults |
| Pure comparison | Validated immutable input plus explicit model/data versions | Raw deltas, eligibility, modeled factors when supported, confidence/reasons and source IDs | Access DOM, image pixels, storage, network, clock, random state or theme |
| Presentation | Result for the active input revision | Explanation and correction actions | Convert unavailable/partial factors into a universal equip recommendation |

The dependency direction is intake -> OCR/parser -> correction -> validation -> calculator -> presentation. Manual and OCR inputs converge at the same line/field model. A theme change touches none of those data stages.

## Canonical envelope

Use a schema version independent from mechanics and OCR versions. The following is a shape specification, not runtime TypeScript or a populated player example.

```text
ComparisonInput
  schemaVersion
  inputRevision
  items: { current: Item, candidate: Item }
  characterStates:
    current: ConfirmedState | null
    candidate: ConfirmedState | null
  context: ComparisonContext
  versions:
    parserVersion
    statRegistryVersion
    mechanicsDataVersion
    formulaModelVersion
  objective: eligibleAttackImpact | unsupported

Item
  localId
  name: Field<string>
  slot: Field<string>
  lines: ItemLine[]
  completeness: unreviewed | reviewedVisibleLines | incomplete

ItemLine
  lineId
  ordinal
  rawLabel
  rawText
  statId: registered ID | null
  quantity: Field<Quantity>
  valueKind: flat | additivePercent | multiplier | level | unknown
  sourceFamily: equipmentBase | potential | enhancement | other | unknown
  recognition: recognized | ambiguous | unknown
  mechanicsClaimIds: claim IDs[]

ConfirmedState
  stateId
  basis: confirmedPostEquipTotals | verifiedReaggregation
  itemRef
  stableContextRef
  totals: TotalField[]
  completeness: fieldsConfirmed | incomplete

TotalField
  fieldId
  statId
  quantity: Field<Quantity>
  meaningClaimIds: claim IDs[]
  includes: known source-family IDs[] | unknown

Field<T>
  observation: { rawText, candidateValue: T | null, provenance }
  correction: { value: T | null, revision } | null
  effectiveValue: T | null
  state: missing | unreadable | ambiguous | invalid | needsReview | confirmed
  issues: issue codes[]

Quantity
  decimal: canonical finite base-10 string
  unit: statPoint | displayPercent | internalRate | factor | level
```

Implementation rules:

1. `lineId` identifies an occurrence, not a stat. Repeated Max HP, Attack, or similarly named lines remain separate in original order. Mapping a label does not establish its aggregation family. Any aggregation is a later supported operation with source IDs.
2. Keep unrecognized lines with `statId: null`, raw label/text, and review status. Renaming or dismissing a line is an explicit correction; dismissal does not prove the line has no effect. Visible screenshot absence does not prove a hidden effect is absent.
3. A missing/unreadable value has `effectiveValue: null`; explicit confirmed zero is a quantity with decimal `"0"`. Removing a correction restores the retained observation and review status, not a fabricated value. OCR reprocessing proposes a new observation without silently replacing an active correction.
4. `effectiveValue` is derived from the active correction when present, otherwise the observation, and checked against `state`. A supplied effective value inconsistent with its provenance is invalid. Numerical eligibility requires confirmation of every consumed field; partial raw-line review remains usable without a verdict.
5. `reviewedVisibleLines` means the user checked the visible extraction. It is not certification of all gear effects or a complete character snapshot. `fieldsConfirmed` applies to listed required totals, not every stat in the game.
6. Stable A/B context records identify unchanged job, level, skill/passive/preset state, target and relevant effects. An unverified same-context assertion is reported as an assumption and may block the supported slice. Do not ask for irrelevant planner fields simply because the envelope can hold them.
7. Store data and revisions only in active page memory. Schema serializability supports deterministic local fixtures; it does not authorize save/export/sharing features or persistent player data.

## Units, parsing and validity

Quantities retain their displayed text and normalized decimal separately. A decimal string avoids losing text precision during parsing; conversion to calculator arithmetic must use a documented precision/range policy and reject unsupported magnitudes rather than silently round. This document selects no new numeric library.

| Concept | Canonical treatment |
| --- | --- |
| Raw Attack / attributes / Accuracy | `statPoint`, with separate stat identity. Attack and Main Stat are not interchangeable. A percentage Attack line is a different value kind from flat Attack. |
| Rate and displayed damage percentage | `displayPercent`; the meaning registry distinguishes Critical Rate, Critical Damage, Stat Prop. Damage, and each damage bucket. A `%` sign alone does not define stacking or critical multiplier semantics. |
| Internal rate | `internalRate`; converting to displayed percent requires an applicable audited claim. Do not globally divide every stat by ten because the guide describes 1,000 = 100% for rate representation. |
| Multiplicative factor | `factor`; do not silently treat a displayed percentage as a final multiplier. Conversion requires a supported definition. |
| Skill line | `level`, integer only, plus tier/job/affected-skill identity when known. No generic damage-per-level weight. |
| Raw delta | Candidate minus current, for matching stat identity, value kind, unit and source scope only. Display-percent subtraction is percentage points. Relative damage change is a separate modeled output. |

The stat registry records `id`, canonical label, locale-specific aliases, unit/value kind, meaning claim IDs, modeled scope and known limits. Start from the six current fields but allow additional and unknown lines. Do not turn the ambiguous historical “elemental proportion” translation into a second invented stat; the audit identifies Stat Prop. Damage and leaves its attribute conversion unresolved.

Use a full-string numeric grammar rather than permissive JavaScript coercion. Blank stays missing. Reject nonfinite tokens, partial parses, object/boolean inputs, unsafe magnitude, fractional skill levels, and mismatched unit tokens. Locale/grouping/decimal conventions must be explicit: ambiguous separators, suffixes such as K/M/B, hexadecimal, scientific notation, Unicode lookalikes and OCR substitutions require a documented supported rule or correction. Never autocorrect `O` into `0` as confirmed input. Permit signed deltas separately from nonnegative quantities; if the game presents a negative modifier outside the registered domain, retain it as unsupported rather than erase it.

Do not invent maximum Critical Rate, Accuracy or stat values as schema limits. A technical magnitude bound is not a game cap. Add a game cap only through a scoped mechanics claim. Keep CP, Max HP and Max MP as retained fields if present; CP is not DPS, and a non-modeled line must not gain an arbitrary offensive weight.

## Mechanics and field provenance

Separate where an input came from from why a calculation is supported.

- Field provenance: `manual`, `ocr`, `userCorrection`, or `derived`; ephemeral observation/run ID; panel and line position; original/crop bounding boxes where available; transformation/version references; OCR engine score as nullable metadata; explicit confirmation revision. Derived fields list their input field IDs and operation claim IDs.
- Mechanics claim: stable ID; exact supported claim; source URL and section; publication/update and access dates; game title, region/build (nullable when unknown), activity/attack scope; variables/units; aggregation/order/caps; exceptions; evidence type; unresolved issues; evidence status (`verifiedPublished`, `provisional`, `unknown`, `conflicting`); and separate implementation validation status (`notImplemented`, `fixturesOnly`, `controlledComparisonValidated`).
- Dataset manifest: schema/data/model versions, claim IDs and reproducible revision identifier. Include observed scope rather than labeling an unidentified build “current.” Unknown build compatibility remains visible and must be evaluated before generalizing.
- Model result: claim IDs used by each factor, consumed field IDs, input revision and version tuple. Model changes invalidate prior results and require fixture review. Parser changes must never masquerade as formula changes.

The mechanics audit is a reconciliation source, not a completed machine-readable claim register. Before numerical implementation, assign canonical claim IDs in the register/data, link every modeled operation, and record conflicts. A user-entered number confirms a measurement; it does not validate its mechanical meaning.

## Numerical eligibility and result contract

The minimal safe proposed numerical route is **confirmed post-equip totals for both states**, for one specified eligible attack and verified context profile. Another possible route is a fully verified source decomposition plus replacement/reaggregation. Neither route is implemented by this document.

Do not universally calculate `candidateTotal = currentTotal + candidateRawLine - currentRawLine`. Flat/percentage/skill ordering, multiplicative Final Damage and remaining-cap aggregation can invalidate that update. Main Stat may already affect Attack and Stat Prop. Damage; passive and unchanged enhancement/artifact effects may already be inside totals. Adding them again double counts. A user confirmation cannot make an unsupported replacement equation valid.

Required context is produced by model eligibility, not one mandatory character form. The supported slice declares required A/B totals and relevant target defense/penetration, damage buckets, critical/range treatment, job/skills and activity profile. An unchanged factor may cancel only when the source-linked algebra establishes cancellation for the selected context. A Boss/Chapter label alone does not select a verified transform or target. Skill coefficients, nonlinear context transforms, and outcome averaging must preserve the documented order; do not assume transforming mean damage equals averaging transformed outcomes.

```text
ComparisonResult
  inputRevision
  versions
  status: rawOnly | needsCorrection | needsContext | unsupported | modeled
  rawRows: typed comparable deltas and unmatched/unknown lines
  eligibility:
    supportedScope
    requiredFieldIds
    issues: { code, fieldIds, claimIds, explanation, recovery }[]
    unsupportedLineIds
  factors: { id, before, after, unit, inputFieldIds, claimIds }[]
  assumptions: explicit statements[]
  confidence: High | Medium | Low
  confidenceReasons: statements[]
  damage: { winner: current | candidate | equal | null,
            percentChange: decimal | null, scope: description | null }
```

Only `modeled` may contain a numerical impact/winner, and then only within its named supported scope. Unsupported, incomplete or invalid inputs keep winner/percentage null. A low confidence label never licenses invented coefficients. Unsupported changed offensive effects block a complete item ranking; a calculated isolated factor may be explained without claiming the better item. Equality needs valid comparable evidence and a documented rounding/tolerance policy; missing inputs do not imply a tie. Swapping an eligible comparison reverses preference; relative percentage changes are reciprocal transformations, not generally equal and opposite.

Keep reasons separate for extraction ambiguity, missing context, mechanics uncertainty and model validation. High OCR confidence cannot raise mechanics confidence. Do not report sustained DPS, clear success, or a universal equipment winner from a per-attack factor model. Under the recovered offensive objective, HP/MP/survival and hit adequacy assumptions remain explicit; resource-limited casting requires its own supported sustain model.

## Local OCR pipeline and adoption gate

Sequence: select local image -> validate type/size and decode -> identify/review panel boundaries -> deterministic crop/preprocessing -> worker OCR -> retain raw output -> parse candidate lines -> user correction/confirmation -> shared manual-path validation -> calculation. Preserve an untouched local original while crop transformations are reversible. Do not infer panel identity solely from left/right location, green text or CP arrows. If only one panel is recognized, leave the other missing.

An adapter owns engine/WASM/worker/language-model versions and hashes, language, segmentation mode, preprocessing algorithm/version, dimensions, crop coordinates and configuration. Pin these in a run manifest. Record engine scores as engine metadata, not calibrated probabilities or a promise of identical OCR across all browser/hardware combinations. Check repeated runs and browser differences rather than assuming bitwise determinism.

No engine is selected or installed in this work. Evaluate browser-capable candidates against official documentation for local execution, worker/WASM support, language data, configurable resource paths, license and dependency costs, then benchmark the same permissioned fixtures. Preserve the existing dependency-free manual experience until a dependency is justified. Do not quietly adopt a remote OCR API as a fallback.

Privacy acceptance:

1. Pixel buffers, file bytes/names, raw OCR, item stats and corrections never enter network requests, URLs, analytics, console/error logs, crash reporting or a remote AI service. Use opaque ephemeral run IDs rather than player/file names. No local/session storage or IndexedDB persistence of those inputs.
2. Keep selected file, preview/object URL, crops, OCR results and corrections in memory; revoke URLs and release worker/image buffers on reset/removal/replacement. Reject stale worker output after replacement or cancellation using run/input revisions. Theme changes and back navigation preserve the active session and do not re-run OCR.
3. Fetching a pinned worker/language resource is different from uploading an image, but third-party hosting still creates visitor requests. Prefer reviewed same-origin static resources for the eventual release; verify cache/service-worker settings never retain player data. No remote asset lookup based on recognized player content without separate review.
4. Code review plus browser network/storage inspection must verify no payload transmission during selection, decode, OCR, correction, failure, reset and theme change. Collect diagnostic error codes only during local testing; redact network artifacts before sharing. An offline-after-resource-load test must still permit OCR/manual correction, or explain the missing static resource.
5. Public repository, public preview screenshots, documentation, golden fixtures and deployment artifacts must not expose private player screenshots, OCR text, names or stat sets. Keep permissioned representative images outside `public/` and tracked files. Ignored `.private-fixtures/` is now established for future permitted evaluation; ignored `.review/` holds the user's recovered local-only design reference. Permission for local evaluation or visual review does not grant public redistribution.

## Verification plan and remaining gates

This is a plan. No OCR benchmark, new schema validator or calculation test was executed for this document.

| Area | Required cases and evidence |
| --- | --- |
| Lossless fields | Duplicate same-stat lines; unsupported label; unmapped unit; partial panel; explicit zero versus blank/unreadable; conflicting mapped labels; corrections retained after parse failure and rerun |
| Parser/schema | Full-string malformed input; large/precision boundary; separators/locales; OCR `O/0`, `I/1`; lost percent sign; suffixes; signed line; integer skill level; incompatible units; inconsistent effective/provenance data |
| Version/source | Missing/dangling claim IDs; mismatched game/region/activity; unknown build; conflicting claim; incompatible schema; result stale after edit/model update |
| Numerical core, when sourced | Published examples with exact scope; equal and swapped states; verified caps/thresholds; unsupported line abstention; named activity differences; duplicate baseline contributions; post-equip versus unverified raw-delta route; nonlinear stage order and skill effects |
| OCR | Repeated runs; complete/partial panels; compressed/low-resolution/dark/light imagery; cropped text; alternate layouts/locales only if supported; label/value association; duplicate lines; panel swap; decode/worker/resource failure and cancellation |
| Session/UI boundary | Shared manual/OCR validation; correction precedence; stale-run rejection; theme changes at every step; file replacement/removal; focus/progress preserved; keyboard correction and uncertainty labels |
| Privacy | Network/storage/console checks above; no fixture/image/stat leakage into public output, git diff, screenshots or reports |

For each permitted OCR fixture, keep a private manifest with permission/sanitization scope, image quality/language/layout, human-labeled panel/name/ordered-line/value/unit truth and explicit unreadable fields. Use only synthetic arithmetic/unit fixtures in public tests; label them invented and make no claim that they validate game mechanics. Sanitized real screenshots remain private even if identifiers were cropped.

Report OCR exact-match numerator/denominator by field and quality, line/panel association errors, omitted/extra lines, unknown retention, false numeric certainty and correction effort. Fix matching/normalization rules before scoring; do not exclude failed images from the denominator. Keep a held-out portion for an adoption decision, version baseline results, and rerun after dependency/preprocessing/parser changes. No representative permitted fixture set is established in the reviewed files, so no OCR accuracy claim or adoption decision is currently supported.

Implementation handoff gates:

- Builder: add canonical validation and lossless manual data flow first; preserve current null-winner safeguards. Keep visual implementation behind the user's checkpoint approval.
- Damage Mathematician: reconcile claim register, define one eligible numerical scope, required fields, cancellation rules, precision/rounding and abstention conditions; independently review before calling it accurate.
- Data & Tooling Engineer: implement/version schema and adapters, private fixture setup, reproducible manifests and evaluation only after those boundaries are settled.
- QA Breaker: independently challenge unknown/double-counting/context/version cases and privacy; verify source-linked expected outputs rather than mirroring implementation.
- Unresolved inputs: exact build compatibility, raw-source replacement semantics, critical display/overflow, accuracy curve/target facts, skill coefficients/passive interactions, activity profiles and outcome distribution/rounding. These block dependent numerical claims, not the lossless manual/correction contract or approved visual checkpoint work.
