# msIdleCalc Hobby release policy

2026-10-27 follow-up: the owner asked to keep these release-plan notes for later and explicitly requested publication of a better ready application version. Release-plan/dashboard setup remains deferred; no retention, deletion, billing or other-project change is authorized. Treat this as a one-time request to publish the locally checked ready batch, without extra Preview/CLI deployment experiments or changing the production-only dashboard rule. The rolling8/25 guard still applies. Readiness and any access blocker are recorded in [RELEASE_READINESS_2026-10-27.md](RELEASE_READINESS_2026-10-27.md). The standing future release workflow below remains a note to revisit, not evidence that a Preview or Production deployment has occurred.

Repository changes approved 2026-10-25. Deployment, dashboard/retention changes and deletions are **not approved**. Work only in msidlecalc; do not change billing, account settings or the second project. This policy supersedes routine hosted-preview checks in older release documents.

## Verified facts and current blocker

- Hobby permits100 deployments per86,400 seconds. The owner reports two projects share the account allowance and Functions Storage is8.59/10GB; those dashboard values/project attribution are accepted as given, not independently verified. [Limits](https://vercel.com/docs/limits).
- The owner's dashboard remains **Only build production**. An Ignored Build Step cancellation still counts toward deployment quota. Do not confuse an Ignored/Canceled record with no deployment. [Project settings](https://vercel.com/docs/project-configuration/project-settings#ignored-build-step).
- The repository allows automatic Git deployment triggers only for `main` and `release/**`. `**` covers nested branch names; a matching true rule permits the exception. Other branches are disabled. A release branch is Preview only if the dashboard's Production Branch is `main` (owner-reported; independently unverified). [Git configuration](https://vercel.com/docs/project-configuration/git-configuration).
- **Release Preview blocker:** allowing `release/**` does not override the production-only Ignored Build Step. A release push may create a counted canceled Preview instead of a working link. No dashboard change, permanent `ignoreCommand`, CLI workaround or deployment is authorized. Propose a narrowly scoped compatible build rule and obtain separate approval before attempting a release. Do not merge without a successful owner-reviewed release Preview.
- Repo verification: JavaScript/static `public/` output; existing build, syntax/resource/color checks and Node tests; no separate lint/type-check scripts or headless-browser runner. No Functions are declared in this repo; historical storage attribution remains unverified.

## Batch and number releases

1. Finish work on the existing feature branch. Assemble and freeze one combined candidate locally as `release/R001`, then R002, etc. The numbering begins this policy's history, not the site's entire history.
2. Complete the local gate below and inspect the final diff. Check the current deployment count and unresolved build-rule blocker. Obtain explicit approval for the Preview deployment; branch creation locally is not permission to push it.
3. After the blocker is resolved with approval, push the frozen release branch once for **one intended automatic Preview**. Send the owner the successful Preview URL and exact candidate SHA. No CLI Preview steps for the owner. Every additional push can trigger another Preview; finish fixes locally, rerun checks and obtain approval before a replacement Preview.
4. After the owner reviews the Preview and approves production, recheck the rolling budget and merge the unchanged batch to `main` once: one intended Production build. If main or the candidate changed after review, stop and revalidate the integrated candidate. Do not also run a CLI deployment or click Redeploy.
5. Verify Production status, merge SHA, public build identity and smoke behavior. Record UTC date, number, contents and actual main merge SHA in `RELEASE_LOG.md` on the working feature branch after release; include it in the next batch, avoiding a second main push solely for logging. Do not insert a fabricated/self-referential merge SHA before the merge.
6. On an incident, seek approval for rollback to an existing eligible Production deployment instead of repeated rebuilds. Never force-push main.

## Local gate before every push

Use Node22, matching CI, from the repository. Stop on any failure. Build precedes check because generated release/vendor files must exist.

```powershell
npm ci --include=dev --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Install failed' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Production build failed' }
npm run check
if ($LASTEXITCODE -ne 0) { throw 'Project checks failed' }
npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed' }
$env:PORT = '4182'
node scripts/serve.mjs
```

Open `http://127.0.0.1:4182/`. Check upload/loading/cancel/reupload; typed and required-value corrections; retained edits; both item confirmations/collapse; conditional character questions and retained Advanced values; calculation/unsupported abstention; light/dark and narrow layouts. Stop the server with Ctrl+C afterward.

Record candidate SHA, generated build ID and verification results in release review evidence. Lint and type checking are currently **N/A**, not passed: `npm run check` supplies the existing syntax/resource/color checks, not semantic lint or type analysis. No headless runner exists; browser smoke checks remain required. Add any future project lint/type/browser commands to this gate. GitHub CI supplements, never replaces, local checks. Any later change requires validation of the final candidate before pushing.

## Rolling 24-hour budget: target8, absolute cap25

Use **msidlecalc → Deployments**, all environments and all statuses, for the exact UTC interval `(now−24h, now]`; inspect every page and reconcile unique deployment IDs. Include Preview, Production, failed, Ignored/Canceled, redeploys, queued and building records. Do this before every release and again before any additional attempt or main merge. Do not maintain a per-deployment ledger.

- Below8: an approved routine release may proceed only if its planned Preview plus Production fit within8. Normally one batch costs2, not1.
- At8: stop routine releases; only an explicitly approved urgent **production fix** may exceed8, including any approved release Preview required for that fix. Never exceed25.
- At24: do not begin a two-deployment cycle. At25: no deployment-triggering push/retry, even for an emergency. Wait for sufficient records to age out.
- Never borrow the second project's share, even if the account has spare capacity. If the account is blocked, stop regardless of our own count. Unknown/incomplete counts mean stop, not assume zero.
- Coordinate one release at a time so another action cannot consume capacity between the count and the push. Count observed attempts even when canceled; do not repeatedly probe deployment availability.
- If deployments were deleted inside this window, the page may undercount historical creations. Mark the count uncertain and wait or obtain a trustworthy count; deletion is not a way around the budget.

## First-push verification and approval boundary

After the first separately approved non-release push carrying this config, inspect msidlecalc's Deployments page for that exact branch/SHA and time interval. Confirm **no deployment record**, including no Ignored/Canceled record; Git CI success alone is insufficient. If a record exists, count it, stop and investigate.

Locally verify that `main` remains enabled, then inspect the dashboard Production Branch/build rule read-only. Only after a separately approved real main release can we confirm that main still deploys with this config: match its merge SHA, Production environment and Ready status/public build. Do not push a dummy main commit or deploy solely to test this. Current status: non-release no-deployment check **pending**; main enabled in repo, actual Production deployment verification **pending**; release Preview build **blocked/unverified**. No push/deployment occurs under repository-only approval.

## Owner dashboard steps and proposals (not authorization)

| msidlecalc-only action | Estimate | Status |
| --- | --- | --- |
| Read Production Branch and confirm production-only Ignored Build Step | 2min | Read-only verification pending; do not change |
| Count all deployments in rolling24h, including pagination/statuses | 5–10min | Required before each release/attempt |
| Review a narrowly scoped build-rule solution for `release/**` Preview | 3–5min | Separate proposal/approval required; currently blocked |
| Review msidlecalc's Deployment Storage and Functions Storage attribution | 3–5min | Unverified; no other-project management |
| Inspect retention choices: shortest Preview/Canceled/Errored, longest Production allowed on Hobby | 3–5min | Recommendation only; no save approved |
| Inventory old unaliased nonproduction cleanup candidates, then approve exact IDs | 10–20min | No deletion approved |
| Owner deletes only individually approved candidates and later rechecks usage | 5–15min + 2–3min | Separate approval; no bulk-delete script |

Retain the current Production and at least two preceding Ready Production deployments for rollback. Exclude **every Production deployment** and any deployment with a custom/branch domain or alias from manual cleanup; do not detach domains to make an item deletable. Generated deployment URLs do not establish deletion safety. Show exact IDs/environment/aliases before requesting deletion approval. Retention changes can cause automatic deletions and require separate approval too. Exact retention dropdown choices are unverified; documented Hobby defaults are30 days, with current protected-deployment exceptions. [Retention](https://vercel.com/docs/deployment-retention), [deployment management](https://vercel.com/docs/deployments/managing-deployments).

Retained assets and Function bundles have separate storage metrics. Shorter retention may reduce future storage; do not promise immediate recovery of previously metered GB-month usage or treat the account's nominal remaining capacity as msidlecalc's allowance. [Storage](https://vercel.com/docs/deployment-storage).

Open questions: which separately approved mechanism should allow release Preview builds while ordinary previews stay blocked; actual dashboard Production Branch and retention choices; current rolling deployment count and msidlecalc storage attribution; safe cleanup IDs. None is a reason to change billing, another project or dashboard settings without approval.
