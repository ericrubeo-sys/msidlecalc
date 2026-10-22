# Visual release — 2026-10-22

Status: released and publicly verified. Production commit `b827d72e9e9f7cbc82229b6172c5dbdfbea7198f`; GitHub commit status `Vercel: success`, description “Deployment has completed”. Existing deployment: `https://vercel.com/erics-trade-binder/msidlecalc/8fV3UtPzXb55PwzsutvhTYVj8twz`. Public `https://msidlecalc.com` redirects to `https://www.msidlecalc.com/` and serves the approved composition. No project or domain settings changed. This is a functioning manual raw-line comparison application, not an OCR/damage calculator.

## Source → requirement → implementation → verification

| Source | Requirement | Implementation | Verification |
| --- | --- | --- | --- |
| Recovered phone mockup/checkpoint; latest approval | Compact header, exact leaf, full uncropped screenshot with markings | `public/index.html`, `styles.css`, `assets/comparison-example.jpg` | 1280×590 example and 28×30 leaf loaded; contain geometry and same annotations; 78px header |
| Explicit reply this execution | Publish exact mockup screenshot | Exact embedded JPEG extracted without editing into public assets | This one example is authorized; no other private fixtures copied |
| Latest user; Designer source check | System / BasilMarket / Hidden Street, correct capitalization, no affiliation | `theme.js`, selector; Methodology explanation | First-party indexed [BasilMarket](https://basilmarket.net/) and [Hidden Street](https://www.hidden-street.net/gms/node) names; title and accessible resolved System description |
| Recovered exact user wording | One quiet disclaimer and matching Methodology / Report a Bug / Contact Us | Footer, 9–10px continuous paragraph | Exact text retained; footer 85–120.42px depending width, 88px tablet/desktop |
| Latest user support correction | Compact unavailable yellow support, one future setting | `config.js` null destination, disabled button/Coming soon | No invented URL, provider embed or payment |
| Latest user; UX; data contract | Functional manual path with dynamic lines before OCR | `app.js`, `domain/item-lines.js` | Add/remove, duplicate Max HP, unknown effect, unequal sets, zero/blank/invalid values; 19 tests pass |
| Theme contract | Same DOM/state across skins | Root paint attribute; theme preference only persisted | Selected object URL, entries, results, disclosure, focus and scroll unchanged in browser comparison |
| Latest user capability boundary | Honest unavailable OCR/model/contact | Availability copy, raw result with no winner, informational dialogs | No fake extraction, percentage equipment verdict or sending controls; independent QA |
| Responsive instruction | Realistic width AND height in both modes | Shared geometry | 320×568, 360×800, 375×812, 390×844, 430×932, 844×390, 768×1024, 1440×900: 16 cases, no horizontal overflow, both images loaded, matched light/dark geometry; landscape scrolls |
| Privacy instruction | No screenshot/stat transmission, storage or logging | Object URLs; no processing service | Loopback-only instrumented browser run: fetch/XHR/beacon/WebSocket/IndexedDB/console all zero; only `msidlecalc-theme` localStorage writes, empty sessionStorage, no sentinel in resource URLs; fixed public resources/leaf only |
| Verification instruction | Independent review and reproducible checks | `VISUAL_RELEASE_QA.md`, tests, color checker, privacy harness | 19 tests; JS syntax; 18 semantic color pairs + 9 actual gradient/secondary pairs; no code QA blocker |
| Release instruction | Preserve remote, review before merge, no force push/config change | Existing `main` + feature history; existing `vercel.json` unchanged | Fetch succeeded, remote `main` remains `423a060` before release; final diff reviewed; deployed commit/public behavior pending |

Local captures and measurements remain ignored in `.review/`: `release-light-375.png`, `release-dark-375.png`, `release-light-1440.png`, `release-dark-1440.png`, `release-viewports.json`. Captures use actual viewport sizes; an initial stale-tab capture was discovered by inspecting its dimensions and superseded. No physical-device, full screen-reader, OS-theme-emulation or exhaustive 200% text audit is claimed.

Privacy harness: `node scripts/serve-privacy-check.mjs` serves instrumented copies on loopback port 4175. It is outside `public/`, and is not deployed. Its observed resource list, network-call counters, storage key metadata and console counters cover the exercised flow, not every future feature. No OCR exists, so worker/network validation must be repeated when OCR is added.

The named styles retain original application structure and paint rather than fan-site branding. Source-site direct opens had access errors; Designer verified capitalization from first-party indexed titles/content. Third-party runtime leaf access is not a rights grant; the user explicitly selected and authorized this asset/release. The full example is the explicit public-image exception, not an OCR evaluation dataset.

## Phase 2 boundary

Production browser smoke check at 375×812 confirmed leaf/example loaded, no horizontal overflow, synthetic Attack 100→110 yields raw +10 with unavailable damage verdict, theme preserves result, Contact Us explicitly unavailable, and no warning/error logs. Production capture: ignored `.review/production-light-375.png`. Local 16-case viewport review and runtime privacy checks are described above; no claim every local check was repeated on production. Source revision is linked by successful Vercel commit status and matching public behavior.

After production is verified, branch calculation work separately. Build on the existing mechanics audit and independent acceptance cases; examine minimum inputs, source replacement and per-context eligibility before enabling numerical equipment recommendations. Keep unsupported effects visible and abstain where needed. Do not automatically promote the developing numerical engine or OCR to production.
