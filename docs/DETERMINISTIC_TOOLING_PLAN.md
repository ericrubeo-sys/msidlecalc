# Deterministic tooling plan

Plan the toolchain early; implement it alongside the feature it validates. Keep the core calculation reproducible and make uncertain OCR visible and correctable. Do not add paid AI processing, hidden telemetry, or screenshot upload for the MVP.

## 1. Source-linked mechanics data

- Keep supported stat definitions and formula parameters in a versioned, machine-readable dataset (likely JSON or TypeScript constants after the repository is inspected).
- Give each claim a source ID pointing to `research/SOURCES.md`, plus game version/activity scope and an evidence status: verified, provisional, or unknown.
- Validate required keys, units, permitted ranges, source references, and unresolved assumptions with a schema check.
- Do not let data for an unknown mechanic silently fall through to a guessed value.

## 2. Pure comparison calculator

- Use a side-effect-free function: validated item A + item B + character/context + formula-data version -> verdict details.
- Return the intermediate factors and assumptions along with the verdict, so the UI can explain the result.
- Add deterministic golden fixtures for sourced examples and edge fixtures for caps, thresholds, missing stats, equal outcomes, and unsupported lines.
- Add property/invariant checks where applicable: swapping A/B swaps the verdict, equal items do not produce a strong winner, and stats beyond a verified cap do not keep increasing modeled value.
- Version formula changes and rerun the full fixture set; document expected changes before updating outputs.

## 3. Local OCR and correction pipeline

- Keep screenshot processing in the browser. Separate image preprocessing, OCR, text parsing, normalized values, and user corrections.
- Preserve raw OCR text and field-level extraction status; never convert low confidence or missing text into a confident stat value.
- User corrections override extraction for the active comparison.
- Use a small, permissioned and sanitized local screenshot fixture set with manually labeled expected fields. Measure exact-field match rates by stat and image quality; don't turn these into an unsupported user-facing accuracy claim.
- Benchmark OCR library/version changes against the same fixtures before adoption.

## 4. Repeatable engineering checks

After inspecting the repository and its existing stack, define standard scripts for formatting/linting, type checking, unit/regression tests, production build, and accessibility checks. Use the same commands locally and in continuous integration after GitHub is connected. Avoid adding duplicate test frameworks or dependency stacks.

## 5. Privacy and risk checks

- Verify from code and browser network inspection that selected screenshots are not sent to a service or stored by default.
- Scan for secrets and review dependency licenses and known vulnerabilities using established tools selected for the eventual stack.
- Check that errors do not log screenshot contents or unnecessary personal data.
- Keep deterministic checks and their tool versions documented; a passing scan is evidence for its scope, not a blanket compliance guarantee.

## 6. Agent performance and lessons

Track only local work-quality signals: source coverage, unresolved assumptions, regression failures, OCR fixture scores, reopened defects, skipped checks, and user corrections. Do not add product analytics. See `AGENT_ROLES.md` and `LESSONS.md` for cadence and records.

## Implementation order

1. Inspect the remote repository and its stack.
2. Define the source-linked stat/formula data shape.
3. Implement manual item entry and the pure calculator with golden fixtures.
4. Add repeatable lint/type/build/accessibility checks.
5. Add browser OCR, correction UX, labeled fixtures, and an evaluation script.
6. Add CI and security/dependency checks after the repo is connected.
