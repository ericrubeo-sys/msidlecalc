# Decisions and open questions

## Current execution authority — 2026-10-22

**Mobile follow-up — 2026-10-23:** user reports failed area detection and near-impossible finger drawing, and requests UX improvement plus a quiet reading state. The example and Show example action now disappear after selection; loading hides intake/results while retaining entries. UX specifies an enlarged one-area-at-a-time dialog, native target selection and large tap controls, transactional Back/Cancel and one-pixel fine adjustment. Deterministic detection now considers word-backed merged headings and one bounded alternative segmentation; all areas/lines still require review. Changes remain on the feature branch pending later production approval. See `MOBILE_CROP_UX.md`, `MOBILE_CROP_QA.md`, `PANEL_DETECTION_IMPROVEMENTS.md` and `MOBILE_REVIEW_CHECK.md`.

**2026-10-23 release update:** the user approved pushing the screenshot review checkpoint live for site testing. Production is now `71544b3`, with successful production CI/Vercel status and public OCR/fallback smoke check. This supersedes the historical production/feature-only status below for that checkpoint; subsequent evolving changes retain a separate approval gate. See `SCREENSHOT_RELEASE_CHECK.md`.

Phase 1 is deployed and verified at `b827d72`. Phase 2 now runs on `feature/source-linked-damage-model`; see `FEATURE_PREVIEW.md`, `DAMAGE_MODEL_SPEC.md` and independent QA. Numerical application scope is a conditional isolated Final Damage source effect, with all named-context recommendations unavailable. The ordinary stage/reaggregation/PvP level helpers are source-linked pure APIs, not a validated complete damage engine. Modelv4 interprets the level100 transition using inclusive English ranges and same-date Korean after100 wording; regional/build applicability remains unestablished. Experimental local OCR drafts are now integrated, with explicit role and individual line review; automatic extraction reliability is not established.

The latest user authorizes further dependency research and deterministic extraction implementation. Build source-supported slices on the feature branch; preserve the later production approval gate. Spatial proposal extraction and optional neutral-text masking are evaluation-only, default mask off, with raw originals retained and all values unconfirmed. Arbitrary reviewed regions replace reliance on a single hardcoded layout. No numeric substitution or best-of-truth selection is allowed. Representative held-out imagery and reviewed manual integration remain adoption gates.

The user approves the latest revised screenshot-first direction and explicitly authorizes its push to production `main` through the existing GitHub → Vercel connection. Preserve project/domain settings. This supersedes older pending visual/production approval gates for this specified release. Later calculation/OCR release still requires separate approval.

Use distinct Designer, UX, Damage Mathematician, Data & Tooling and independent QA roles; orchestrator owns integration. Chief of Staff audit precedes implementation/research and briefs all assignments. See `LESSONS.md` and `VISUAL_RELEASE.md`.

Appearance options are System / **BasilMarket** / **Hidden Street**, as verified from first-party site indexed content. Names identify visual inspiration; no affiliation claim. System exposes its resolved skin accessibly and in the control title. Header typography contracts slightly on narrow screens to fit the longer names without another header row.

The user explicitly authorizes publishing the **exact mockup screenshot** as the landing example in a reply this execution. That overrides its earlier local-only status for this one image; other real fixtures remain private. Leaf remains the selected GMS/83 item 4001126 runtime image.

Manual path now uses dynamic ordered lines, explicit units and raw comparisons; no fixed six-field limit. It never implies raw gains establish damage. Numerical recommendations, report/contact delivery and payment integration remain unavailable. Support has one null destination configuration and a compact yellow disabled placeholder.

## 2026-10-23 — Experimental screenshot review integration

User requests actual screenshot intake rather than a developer evaluator and authorizes building after specialist agreement. UX, extraction engineering and independent QA support an unconfirmed-draft flow despite poor current numeric recognition. Preserve raw observations, unknowns and each occurrence. Require distinct role assignment and per-line review, stage rereads, make populated-editor replacement explicit with undo, and invalidate old-image confirmation without deleting corrections. A one-character heading-only proposal tolerance never repairs stat text or numbers. Visual region marking has keyboard move/resize/cancel; it does not establish equipment roles. No bulk OCR acceptance or full equipment recommendation is enabled.

Vendor fixed pinned local OCR resources at build time, disable language caching, and restrict worker/connect destinations to same origin. Generated libraries/notices are separate from private fixtures. Tests and runtime privacy checks are recorded in `SCREENSHOT_RELEASE_CHECK.md`; page instrumentation does not inspect every worker global. Production remains unchanged pending the later release approval.

Multiple separate supported battle-context recommendations after Calculate supersede the historical one-primary-context presentation. Do not require equipping an unavailable candidate; investigate source reaggregation and ask only for mathematically necessary missing inputs. Reconsider temporary/skill/artifact effects for advanced accuracy; confirmed passive totals must not be double-counted. No unmodeled tie-breakers.

## Confirmed

| Decision | Current choice | Reason / boundary |
| --- | --- | --- |
| Product scope | Compare two equipment items for likely damage impact | Keep the first release focused and reviewable |
| Screenshot processing | Local deterministic browser OCR is preferred | Avoid per-image paid AI/API use and unnecessary screenshot transfer |
| Correction | User can correct extracted item names and stats | OCR must not silently determine the final calculation |
| Data storage | No database or account system for the initial version | Inputs/calculation remain in the browser unless requirements change |
| Result language | Verdict plus High / Medium / Low confidence and reasons | Communicate uncertainty honestly |
| Activity context | Start with Boss and Chapter Breakthrough | Check whether their damage conditions differ |
| Visual identity | Two original selectable skins inspired by BasilMarket (light) and Hidden Street (dark), with a small designer-curated set of MapleStory sprites considered for each mode | Sprite selection should be sparse and serve the mode's mood; do not copy either fan site's branding or distinctive layout. MapleStory.io is the preferred technical prototype source, not a rights grant; production use remains subject to rights and service review. Dark mode uses deep charcoal/navy surfaces with a restrained MapleStory-orange accent and Hidden Street-inspired blue grouping. |
| Theme behavior | One page/app with both theme token sets available from initial load; theme can switch at any point without refresh; default to the operating-system color preference | Light/dark are skins only, not separate pages/routes. Select active tokens before first paint, then switch by changing the active theme selector. Preserve current inputs, step, focus, scroll position, and results. |
| Repository | Public `ericrubeo-sys/msidlecalc` is intended | Inspect remote contents before reconciling; no license chosen |
| Hosting | Separate Vercel project; start on Hobby | Preserve the existing Eric's Trade Binder deployment |

## Open

Current 2026-10-22 kickoff and recovered decisions below supersede conflicting older scope notes. The current live scaffold is not approved visual design.

- What exact formulas and stat effects are verified for the current game version?
- Which target / enemy details are needed to model accuracy and hit reliability?
- How do skill-level lines affect the character's equipped skills and expected damage?
- What minimal character inputs provide a useful comparison without becoming a planner?
- Which local OCR engine best balances accuracy, bundle size, browser compatibility, and license terms?
- What are the current terms for Vercel Hobby if any monetization is later considered? Verify at that time.
- Which small set of MapleStory sprites should the Designer select for the light and dark modes, and what production permissions/hosting approach will cover them?

## Decision log format

For new choices, record the date, decision, alternatives considered, evidence, and any conditions that would change the choice.

## 2026-10-22 — Repository reconciliation

Inspected the existing `main` branch and initial commit. Preserve that history and `.gitignore`, expand the initial README with the local guide, and add the planning documents. The user authorized transferring these materials to `ericrubeo-sys/msidlecalc`; deployment and access to other projects are outside this authorization.

## 2026-10-22 — Initial Vercel-ready page

The user requested an initial page and GitHub push to verify Vercel go-live. Repository inspection found planning files and no application stack to retain. Use dependency-free static HTML/CSS/native JavaScript modules for this first browser-only preview, with `public/` as the explicitly configured Vercel output. A framework can be adopted if application complexity warrants it; none is required for the current flow.

Implement a manual raw-stat comparison, optional local screenshot reference, and both planned skins now. Keep comparison logic separate from UI and future OCR. Because the source register has no validated formulas, return no damage winner or damage percentage and show Low confidence plus the limitations. Do not guess numerical mechanics merely to make the first page appear complete. Full deployment, domain configuration, and final visual approval remain review steps.

## 2026-10-22 — Coordinated build and recovery

- User authorizes distinct specialist agents with orchestrator-selected models/effort and necessary verification. Keep Designer and UX separate.
- Work on `feature/planned-calculator-build`; no production branch push, deployment, domain change, or protected-project access without explicit authorization.
- Recovered msIdleCalc-only planning and actual approved visual mockups from the earlier chat's visualization folder. The repository's empty source register did not mean no research existed. Historical planning is retained under `docs/recovered/`, with current corrections in the mechanics audit. Raw screenshot imagery stays in ignored local review only.
- The default objective is scenario-specific offensive output, assuming sufficient hit reliability and survival. HP/Defense/Evasion/surplus Accuracy and CP do not receive hidden offensive weights. Context follows item confirmation; one scenario drives each result. MVP output is modeled offensive impact until cadence supports sustained DPS. No clear-probability claim.
- A generic raw item delta cannot universally update aggregate totals. Require verified replacement semantics or confirmed post-equip totals, especially for flat/percent ordering, Final Damage, and capped-fill families.
- Use the actual previously selected GMS/83 item 4001126 leaf from MapleStory.io. This supersedes the original abstract-mark preference; access is not a third-party rights grant. No substitute drawing.
- User now authorizes a disabled, configurable Buy Me a Coffee placeholder, superseding the earlier no-donation-link preference. No payment or invented destination. Recovered mockups already establish footer support placement; show it in the required visual checkpoint.
- Preserve exact community disclaimer and separate matching Methodology / Report a Bug / Contact Us links recovered from user feedback. Contact/bug delivery is not configured.
- User requires a concrete mobile/desktop, both-theme visual checkpoint before full visual implementation. Prior typography/geometry proposals still require this review. Full build is not complete at the audit/checkpoint stage.
- User confirmed footer placement for the coffee placeholder and rejected the large prominent mockup treatment. Latest clarification: preserve a compact yellow provider-style placeholder because the eventual embedded support button is yellow; disclaimer text should stay small and secondary. This supersedes the intermediate neutral-outline treatment. This correction is not approval of the full visual checkpoint.
- Reexamination with separate Designer/UX found unsupported checkpoint overrides: 14px disclaimer, tall footer links/padding, forced second header row, a separate extra manual action, and arbitrary 880px phone frames. Restore the recovered compact intake and actual viewport proportions, while keeping manual input in the application requirements. Scale desktop screenshot/action as one aligned group. Do not crop the approved full screenshot to fake larger phone text.
