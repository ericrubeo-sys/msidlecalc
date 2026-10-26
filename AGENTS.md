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

- Follow `docs/HOBBY_RELEASE_PLAN.md`; it supersedes earlier routine hosted-preview instructions. Run its local verification before every push. No CLI preview workflow.
- Only `main` and `release/**` are permitted automatic Git deployment branches. Freeze a finished release candidate and push it once only after explicit deployment approval; send the successful Preview link to the owner and obtain approval before merging the batch to main. Every further release-branch push can create another deployment. The dashboard's production-only build rule is still in place; release Preview builds are blocked until the owner separately approves a compatible solution.
- Before every release/attempt, count all msidlecalc deployment records in the preceding rolling 24 hours on its Vercel Deployments page. Stop routine releases at 8; only an approved urgent production fix may exceed 8, never 25. Never borrow the other project's allocation. Keep `docs/RELEASE_LOG.md`, not a per-deployment ledger.
- Repository approval does not authorize deployment, dashboard/retention changes, deletion, billing changes or another project's work. Record first-push/main-deployment verification as pending until it can be observed without violating these approvals.
- Codex is the primary orchestrator. Use the specialist roles in `docs/AGENT_ROLES.md` as review lenses; do not create parallel agents unless the user explicitly asks for delegation or parallel work.
- Keep product decisions and rationale in `docs/DECISIONS.md`; update the roadmap when scope or phase changes.
- Inspect existing files and repository history before selecting or replacing a framework, scaffolding an app, or reconciling this workspace with GitHub.
- Do not overwrite an existing remote repository or its files. Inspect first and preserve useful work when connecting it.
- Do not add an open-source license automatically; the user has not selected one.
- Do not add donation links, connect Vercel, change DNS, or deploy without the user's request and a reviewable result.
- Do not run tests unless the user asks for verification. Report what was and was not checked.
