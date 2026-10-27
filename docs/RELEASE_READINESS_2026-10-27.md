# Application release readiness — 2026-10-27

The owner explicitly requested the newer ready application be published, while deferring release-plan setup. No additional approval for the requested application publication is needed; dashboard, retention, deletion and billing changes remain outside scope. No deployment is claimed until its status and public build identity are observed.

## Candidate

- Feature candidate: `270172b`, application build `d2eb4ce46e19`.
- Fresh origin fetch: main remains `91970b5`; candidate is10 commits ahead, no remote-main divergence.
- Improved scope: approved monster patrol/reading-status animation; automatic upper/lower Attack and matching star metadata; strict shared number validation; visible unreadable stat rows; bounded OCR row retries and correction retention; compact choices/confidence and exact unsupported-effect explanations.
- Existing provisional numerical model is retained. No new Main Stat, skill-level or range probability formula is claimed. The complete ring still abstains; more player totals cannot resolve its mechanics gaps. This is a workflow/OCR release, not a claim that arbitrary equipment recommendation is complete.

## Local verification

The clean pinned install succeeded: `npm ci --include=dev --ignore-scripts`,14 packages,0 audit vulnerabilities reported. `npm run build`, `npm run check` and `npm test` passed:396 tests,0 failed/skipped. Checked resource/syntax closure, generated build identity and both skins' existing color checks. No standalone linter/type checker/headless runner exists in the repo.

Original-image accuracy/evidence boundaries remain those in [OCR_COMPLETENESS_2026-10-25.md](OCR_COMPLETENESS_2026-10-25.md): two reused development comparisons, ring12/12 values after recovery, shoulder11/12 with the unreadable value required for correction, held-out0. Synthetic software checks are not live-game prediction validation.

Fresh local browser smoke test uses `node scripts/serve.mjs` at `http://127.0.0.1:4182/`. Upload starts the approved loader; Cancel stops reading and reports retained edits. A new read through Photo tools succeeds after cancellation. The original ring again yields all12 exact values, matching12 stars, no false unreadable-field warning, both confirmation/collapse actions, zero useless required character fields and all eight displayed activity abstentions with one shared mechanics blocker. Calculation and back-to-review controls work. No physical-phone, hosted Preview or live-game validation is claimed by these local checks.

## Release gate and access

No push, Preview, Production build, settings change or deletion has been attempted in this follow-up. The in-app browser is signed out of Vercel; continuing via GitHub also reaches a sign-in form. A request for the owner to sign in has been presented while local work continues. The required msidlecalc Deployments-page count for the preceding rolling24 hours is therefore **unverified**; do not assume zero or substitute GitHub success statuses for complete canceled/deployment history. Until authenticated count verification, publication is blocked by access rather than code checks. The owner's release permission remains valid when access is restored.

Before the single intended main release: count all msidlecalc deployment records over rolling24h, retain the8 target/25 absolute cap, recheck current origin/main and candidate cleanliness, and publish the verified batch once. Do not create additional deployments merely to probe the rate limit. Afterward verify exact Production SHA, Ready status, public build identity and smoke behavior; then add the real main merge SHA/date to RELEASE_LOG.md on the feature branch without a logging-only main deployment.
