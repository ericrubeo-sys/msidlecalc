# msIdleCalc project instructions

## Scope

- Work only on the msIdleCalc fan-made MapleStory Idle equipment comparison tool.
- Keep this work independent from the Eric's Trade Binder social-media project and its data, accounts, and application.
- Treat the user as the final approver for meaningful product decisions and every public deployment or publication.

## Product principles

- Keep the first release mobile-friendly and focused on comparing two equipment items for likely damage impact.
- Prefer deterministic processing in the visitor's browser. Do not introduce paid AI/API screenshot processing, analytics, accounts, a database, or user-data collection without discussing the privacy and cost implications first.
- Let users correct extracted item names and stats before calculation.
- Communicate uncertainty with High / Medium / Low confidence and explain the main factors. Do not imply precision beyond the evidence.
- Research mechanics before numerical modeling. Record source links, what each source establishes, unresolved mechanics, and any assumptions in `research/SOURCES.md`.
- Treat fan sites as visual inspiration only. Do not copy their branding or assets, and do not imply official MapleStory affiliation.

## Working method

- Codex is the primary orchestrator. Use the specialist roles in `docs/AGENT_ROLES.md` as review lenses; do not create parallel agents unless the user explicitly asks for delegation or parallel work.
- Keep product decisions and rationale in `docs/DECISIONS.md`; update the roadmap when scope or phase changes.
- Inspect existing files and repository history before selecting or replacing a framework, scaffolding an app, or reconciling this workspace with GitHub.
- Do not overwrite an existing remote repository or its files. Inspect first and preserve useful work when connecting it.
- Do not add an open-source license automatically; the user has not selected one.
- Do not add donation links, connect Vercel, change DNS, or deploy without the user's request and a reviewable result.
- Do not run tests unless the user asks for verification. Report what was and was not checked.
