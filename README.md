# msIdleCalc

Local planning and implementation workspace for **msIdleCalc.com**, a fan-made MapleStory Idle equipment comparison tool.

This workspace is connected to `ericrubeo-sys/msidlecalc`. Planning materials were reconciled with the existing `main` branch, preserving its initial history and `.gitignore`. Work only in msIdleCalc; do not access ericstradebinder or eric-ai-toolkit files without explicit user authorization.

## Start here

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

**Feature follow-up:** the latest branch adds an enlarged tap-controlled mobile read-area editor, a quiet reading screen with no example after upload, and bounded word/alternate-segmentation detection. This iteration is not yet on production. See [mobile verification](docs/MOBILE_REVIEW_CHECK.md).

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

Run `npm run build`, `npm run check`, `npm test`, and the local browser preview. The current feature checkpoint passes 147 synthetic tests. See the current feature and QA documents above for exercised browser behavior and the limits of those checks; arithmetic agreement is not live-game validation.
