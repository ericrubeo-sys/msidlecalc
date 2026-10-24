# msIdleCalc

Local planning and implementation workspace for **msIdleCalc.com**, a fan-made MapleStory Idle equipment comparison tool.

This workspace is connected to `ericrubeo-sys/msidlecalc`. Planning materials were reconciled with the existing `main` branch, preserving its initial history and `.gitignore`. Work only in msIdleCalc; do not access ericstradebinder or eric-ai-toolkit files without explicit user authorization.

## Start here

[Numerical feature review preview](https://msidlecalc-git-feature-source-linked-d30e05-erics-trade-binder.vercel.app/) requires Vercel sign-in. Production is unchanged. [Scope and verification](docs/RECOMMENDATION_PREVIEW.md).

- [Project brief](docs/PROJECT_BRIEF.md): the product goal, constraints, and first-release scope.
- [BasilMarket-inspired light style guide](docs/design/BASILMARKET_LIGHT_STYLE_GUIDE.md): screenshot-derived design principles and original implementation guidance.
- [Hidden Street-inspired dark style guide](docs/design/HIDDEN_STREET_DARK_STYLE_GUIDE.md): dark surfaces, restrained orange accents, shared-component treatments, and accessibility requirements.
- [Simple mobile web app UI research](docs/design/SIMPLE_MOBILE_WEB_APP_UI_RESEARCH.md): reusable mobile-first, accessibility, interaction, and theme guidance for both skins.
- [Agent roles](docs/AGENT_ROLES.md): how Codex should organize specialist work while remaining the primary orchestrator.
- [Deterministic tooling plan](docs/DETERMINISTIC_TOOLING_PLAN.md): the planned calculation, OCR, QA, and privacy checks.
- [Lessons](docs/LESSONS.md): durable user corrections and milestone retrospectives.
- [Roadmap](docs/ROADMAP.md): staged work from setup through a reviewed preview.
- [Decisions](docs/DECISIONS.md): current choices and open questions.
- [Research sources](research/SOURCES.md): evidence register for game mechanics and formulas.
- [MapleStory art and asset research](research/MAPLESTORY_ASSET_RESEARCH.md): official MapleStory Worlds resource catalog, permitted scope, and repository guidance.

## Current phase

**New numerical feature preview — not production:** source-guarded ordinary-landed-hit dominance can now choose Current/New equip when every admitted effect favors it. It blocks unmodeled effects and tradeoffs, and asks only consumed conditions/applicability questions.278 software checks pass;16 recommendation groups are independently authored. No controlled game validation or full named-battle/DPS model. See [recommendation preview](docs/RECOMMENDATION_PREVIEW.md). Production stays unchanged until separate user approval.

**Current production — compact confirmation, 2026-10-24:** `4256b0e` provides local OCR into editable typed stat selectors, separate item confirmations that collapse each crop/form, and a compact checking → context-status screen. Raw changes and OCR fragments are removed from normal results. All context winners currently abstain with Low confidence because the recommendation model and essential character/context integration remain unfinished.262 tests, CI and production deployment passed; public build `4cca063d3252`. See [compact workflow verification](docs/COMPACT_CONFIRMATION_RELEASE.md) and [essential-input status](docs/ESSENTIAL_INPUT_STATUS.md). This is not a validated calculator.

### Historical releases and superseded UI flows

**Latest production — automatic intake recovery:** `97c95b8` tries one evidence-gated local OCR pair before requiring area adjustment. The previously failing authorized example reaches item review on untouched upload; unsupported or insufficient evidence still falls back.250 tests and production CI/Vercel pass; hosted build `ca669bc85fcc` verified. See [initial intake verification](docs/INITIAL_INTAKE_RECOVERY.md).

**Earlier reading cleanup:** `f58f16a` separates unresolved preview fragments into counted Other readings disclosures without changing correction imports, and prevents crop action buttons from covering arrows.231 tests and production CI/Vercel passed; hosted build `15f4a3e144c2` verified. See [review cleanup verification](docs/REVIEW_CLEANUP.md).

**Earlier second-panel follow-up:** `5f3b431` separates observed neutral base glyphs from trailing colored comparison glyphs and retains border artifacts outside stat rows. All226 tests passed; production CI/Vercel and public build `1723e0d8dad4` verified. Automatic localization, label fragments and punctuation recognition remain imperfect. See [field-recognition evidence and limits](docs/SECOND_PANEL_FIX.md).

**Earlier iPhone follow-up:** approved release `0b2764b` added optional press-and-hold crop arrows, a second starting box beside the reviewed first, clipping advisories, Potential new equip wording and a hosted build identifier. CI/Vercel and public screenshot/crop behavior checks passed; physical iPhone behavior and recognition accuracy remain open. See [iPhone follow-up verification](docs/IPHONE_REVIEW_CHECK.md).

Release `197640b` added fixed equipped-left/candidate-right interpretation, base-only previews and reviewed visible-line gains/losses. See [item review verification](docs/ITEM_REVIEW_CHECK.md).

**Latest production release:** user-approved `3f83ca9` adds an enlarged tap-controlled mobile read-area editor, a quiet reading screen with no example after upload, and bounded word/alternate-segmentation detection. Production CI/Vercel and public smoke checks passed. See [mobile verification](docs/MOBILE_REVIEW_CHECK.md).

**Production update — 2026-10-23:** user-approved release `71544b3` is live at [msIdleCalc](https://www.msidlecalc.com/). It includes experimental local screenshot drafts and editable review. Production CI/Vercel and public OCR/fallback behavior were checked; see [release verification](docs/SCREENSHOT_RELEASE_CHECK.md). Historical phase notes below describe the earlier visual baseline.

Production visual release `b827d72` provides local screenshot reference, dynamic manual item lines, repeated/unknown/unmatched line retention, exact raw differences, and instant System / BasilMarket / Hidden Street skins. Contact/report delivery and support payments are unavailable. See [visual release verification](docs/VISUAL_RELEASE.md).

The `feature/source-linked-damage-model` branch adds pure source-linked aggregation, ordinary pre-content stages, an isolated independent Final Damage explanation, and experimental screenshot upload → local OCR → editable review. Every extracted line starts unconfirmed. Recognition still makes errors; complete battle-context recommendations and DPS remain unavailable. See [screenshot flow verification](docs/SCREENSHOT_RELEASE_CHECK.md), [feature scope](docs/FEATURE_PREVIEW.md), and [model QA](docs/DAMAGE_MODEL_QA.md). No controlled live-game validation has been performed.

## Run locally

Use Node.js 22 or later. Install the pinned OCR build dependencies once; the build copies their fixed resources into ignored `public/vendor/`. The application fetches those same-origin assets, with no per-image external service.

```sh
npm ci --ignore-scripts
npm run dev
```

Open the printed local URL (`http://127.0.0.1:4173`). Item data is kept in memory; only the appearance preference is saved locally.

## Implementation layout

- `public/index.html` and `public/styles.css`: one semantic page with shared geometry and two theme palettes.
- `public/theme.js`: pre-paint appearance selection and optional preference persistence.
- `public/app.js`: form, screenshot reference, validation, and result presentation.
- `public/domain/item-lines.js`: lossless dynamic manual lines and exact occurrence-based raw differences; no equipment winner.
- `public/domain/mechanics-data.js`, `reaggregation.js`, `damage-model.js`: versioned claims, source replacement and partial ordinary stages; see the feature scope before using their output.
- `public/ocr-reader.js`, `public/domain/panel-detection.js`, `screenshot-review.js`: bounded local reading, proposed regions, raw evidence, correction overlays and explicit image-specific review.
- `public/domain/ocr-session.js` and `scripts/serve-ocr-evaluation.mjs`: separate evaluation/session tools; benchmark results are not automatic acceptance criteria.
- `scripts/vendor-ocr.mjs`: pinned local assets, notices and byte-integrity manifest; no fixture copying.
- `public/config.js`: single unavailable future support destination.
- `tests/comparison.test.mjs`: missing values, invalid inputs, differences, and no unsupported damage verdicts.

## Vercel deployment

Preserve the existing `msidlecalc` project, Root Directory `./`, Framework Preset **Other**, and production branch `main`. This feature's tracked `vercel.json` installs pinned dependencies without install scripts, runs `npm run build`, and serves only `public/`. No environment variables are needed. Planning documents and private fixtures are outside public output.

The existing Vercel connection and `msidlecalc.com` domain were configured by the user. Preserve them. The user authorized this specified visual release to `main`; later calculation/OCR production release requires separate approval.

## Verification

Run `npm run build`, `npm run check`, `npm test`, and the local browser preview. The current checkpoint passes262 tests. See the current feature and QA documents above for exercised browser behavior and the limits of those checks; arithmetic agreement is not live-game validation.
