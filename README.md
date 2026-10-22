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

A screenshot-first application now provides local screenshot reference, dynamic manual item lines, repeated/unknown/unmatched line retention, exact raw differences, and instant System / BasilMarket / Hidden Street skins. Damage recommendations and OCR are not implemented. Contact/report delivery and support payments are unavailable. See [visual release verification](docs/VISUAL_RELEASE.md) and [independent QA](docs/VISUAL_RELEASE_QA.md). A deployed scaffold, visual release, encoded formula and live-game validation are separate milestones.

## Run locally

Use Node.js 22 or later. No third-party packages or installation step are required.

```sh
npm run dev
```

Open the printed local URL (`http://127.0.0.1:4173`). Item data is kept in memory; only the appearance preference is saved locally.

## Implementation layout

- `public/index.html` and `public/styles.css`: one semantic page with shared geometry and two theme palettes.
- `public/theme.js`: pre-paint appearance selection and optional preference persistence.
- `public/app.js`: form, screenshot reference, validation, and result presentation.
- `public/domain/item-lines.js`: lossless dynamic manual lines and exact occurrence-based raw differences; no aggregation or equipment winner. Legacy `comparison.js` and isolated `mechanics.js` retain regression coverage; neither is an integrated damage model.
- `public/config.js`: single unavailable future support destination.
- `tests/comparison.test.mjs`: missing values, invalid inputs, differences, and no unsupported damage verdicts.

## Vercel deployment

Import only `ericrubeo-sys/msidlecalc`, branch `main`, into the separate `msidlecalc` project. Keep Root Directory at `./` and Framework Preset at **Other**. The tracked `vercel.json` specifies no build command and `public` as the output directory. No environment variables are needed. Only `public/` is served; planning documents are not part of the website output.

The existing Vercel connection and `msidlecalc.com` domain were configured by the user. Preserve them. The user authorized this specified visual release to `main`; later calculation/OCR production release requires separate approval.

## Verification

When verification is requested, use `npm test`, `node scripts/check-colors.mjs`, and the local browser preview. See `docs/INITIAL_PREVIEW_REVIEW.md` for the checks performed and limits of this initial release.
