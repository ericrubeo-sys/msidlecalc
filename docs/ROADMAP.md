# Roadmap

## Phase 0 — Workspace and repository readiness

- [x] Capture the project brief, constraints, decisions, roadmap, and role charter locally.
- [x] Inspect the GitHub repository contents and default branch before connecting or reconciling local files. Existing `main` contained an initial README and `.gitignore`.
- [x] Reconcile planning materials on top of the existing history, retaining `.gitignore` and expanding the README.

## Phase 1 — Mechanics research and product definition

- [ ] Research Attack, Main Stat, Critical Rate and Critical Damage behavior, skill levels, Accuracy, CP, and activity differences.
- [ ] Record primary sources, community evidence, version/date, unresolved questions, and confidence in `research/SOURCES.md`.
- [ ] Define a conservative first comparison model and the minimum character/context inputs it needs.
- [ ] Document when the calculator should abstain or lower confidence.
- [ ] Define a source-linked, versioned stat/formula data shape with explicit unknowns.

## Phase 2 — Manual comparison experience

- [ ] Inspect the repository and select or retain its existing stack based on evidence.
- [ ] Build a responsive one-page flow with manual input for the two items and relevant character/activity context.
- [ ] Present the verdict, confidence, key factors, and assumptions.
- [ ] Add golden and boundary fixtures for the pure calculator before trusting numeric recommendations.
- [ ] Add example scenarios only when they use sourced or clearly labeled assumed mechanics.

## Phase 3 — Visual skins and interaction review

- [ ] Design original BasilMarket-inspired light and Hidden Street-inspired dark skins using their companion guides.
- [ ] Have the Designer curate a small, mode-specific MapleStory sprite set; prototype ID-based lookups through MapleStory.io and resolve production source/rights before shipping.
- [ ] Implement the theme as an instant skin change at any workflow step, defaulting to system preference and preserving user progress/state.
- [ ] Review responsive layout, contrast, text sizing, keyboard access, validation, and mobile interactions.
- [ ] Keep fan-made / unofficial status clear.

## Phase 4 — Local screenshot OCR

- [ ] Select a deterministic browser OCR approach after evaluating accuracy, bundle size, language support, and licensing.
- [ ] Extract the two item panels and visible stat lines while preserving raw OCR output for correction.
- [ ] Let users correct all extracted values before calculation.
- [ ] Handle unreadable or unsupported screenshots gracefully; do not upload them to a paid service.
- [ ] Evaluate library/version changes against a labeled local fixture set and record field-level results.

## Phase 5 — Review and preview deployment

- [ ] Conduct product, mechanics, privacy, security, and mobile reviews.
- [ ] Review the preview with the user before production deployment.
- [ ] Create a separate Vercel project and preserve the existing Eric's Trade Binder project.
- [ ] Connect `msidlecalc.com` DNS only after the deployment is ready and reviewed.

## Continuous project operations

- [ ] Keep source coverage, unresolved assumptions, regression results, OCR evaluation results, reopened defects, and skipped checks reviewable without product telemetry.
- [ ] Record durable user corrections and milestone lessons in `docs/LESSONS.md` and update the workflow when warranted.

## Guardrails

- Do not skip mechanics research before presenting numeric damage results as definitive.
- Do not add user accounts, a database, analytics, donation links, paid AI/OCR, or a full planner without a concrete need and discussion.
- Do not add an open-source license without the user's choice.
- Do not publish, deploy, or change DNS without user review and approval.
