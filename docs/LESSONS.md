# Agent and project lessons

Record only durable lessons from user corrections, reproducible failures, daily active-work reviews, or milestone retrospectives. A daily review can be brief and need not create a lesson when nothing useful changed. This is a private project-work log; it is not product analytics and must not contain user screenshots or personal data.

## Lesson record format

- **Date / active-work day / milestone:**
- **Observation:** What happened, with evidence or a reproducible example.
- **Impact:** Why it matters to the product or workflow.
- **Change to try:** One concrete update to the prompt, process, data, or test fixture.
- **Review point:** When to check whether the change helped.

## Lessons

- **Date / milestone:** 2026-10-22 — GitHub connection and planning transfer.
- **Observation:** The user clarified that the msIdleCalc workspace and planning materials were already available locally.
- **Impact:** Asking for existing setup information delayed actionable work.
- **Change to try:** Inspect the msIdleCalc workspace and available repository access before requesting paths or setup details. Do not read or write ericstradebinder or eric-ai-toolkit files without explicit user authorization.
- **Review point:** Next implementation or repository task.

- **Date / milestone:** 2026-10-22 — Real build kickoff after deployment scaffold.
- **Observation:** The initial page used generic diamond/hero visuals and missed the user's earlier screenshot-first composition. Earlier msIdleCalc calculations and actual mockups existed in a separate visualization folder, discoverable from the relevant chat, despite the checked-in source ledger being blank.
- **Impact:** Treating the incomplete repository as the complete planning record caused incorrect statements about missing prior work and unnecessary repeated questions.
- **Change to try:** Reconcile relevant msIdleCalc chat/artifacts with repository plans first; track requirements by source, preserve explicit user copy and asset choices, and show a concrete visual checkpoint before implementation. Keep Designer and UX distinct. Do not equate a working deployment or correct arithmetic with approved design or validated mechanics.
- **Review point:** User visual approval and independent formula review before the next implementation milestone.

- **Date / milestone:** 2026-10-22 — Coffee placeholder review.
- **Observation:** User confirmed footer placement but rejected the prominent button size in the checkpoint.
- **Change to try:** Keep support visually secondary and compact. Latest user clarification preserves its yellow provider appearance; prominence should be controlled through size and placement, not an invented neutral restyling. Placement confirmation does not approve the surrounding design.
- **Review point:** Next visual checkpoint.

- **Date / milestone:** 2026-10-22 — Rejected oversized footer and distorted preview proportions.
- **Observation:** Blanket accessibility overrides increased secondary disclaimer size and footer height, forced a second header row, and used 880px-tall frames regardless of phone size. Side-by-side screenshots further reduced the apparent size of the application in chat.
- **Change to try:** Preserve the user's content hierarchy and recovered composition. Keep disclaimers small, primary controls clear, support yellow and compact, and review actual width/height pairs without scaling. Report viewport simulation separately from physical-device and complete application testing.
- **Review point:** Next visual review and eventual full application responsive QA.
