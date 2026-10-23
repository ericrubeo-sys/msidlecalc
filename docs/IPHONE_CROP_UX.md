# iPhone crop follow-up

2026-10-23. Reviewed the full lessons, mobile crop UX specification, crop editor, geometry/layout contracts, mobile invariants, and the six supplied follow-up screenshots. The latest supported-layout correction supersedes the old neutral-role wording in the earlier UX document: equipped is left; potential new equip is right. No new branding or footer layout is required.

Observed: the user reports rapid arrow taps cause iPhone browser zoom. Their second-area screenshot also visibly leaves part of the stat-label column outside the selected box while the numeric column is inside. This supports a crop-coverage problem; it does not establish that the OCR engine cannot recognize the label text. A supplied screen with old role selectors despite newer crop titles warrants separate release/cache investigation, not a conclusion about the cause.

Implemented changes:

- A short press still makes one native click adjustment. An optional hold starts after 400 ms and repeats every 100 ms, avoiding the need for rapid tapping. A held press does not receive an extra compatibility-click movement on release. Keyboard/assistive activation remains available.
- Repeat stops on pointer release, cancellation, leaving the button, lost pointer capture, window blur, document visibility change, dialog close, navigation, reset, adjustment-target change, and fine-mode change. Late timer callbacks are invalidated. Global listeners are removed when the dialog closes.
- Fine adjustment remains one original-image pixel. Geometry and opposite-edge invariants remain in the shared geometry implementation. Holding cannot exceed image bounds.
- If there is no valid supplied second area, its first visit starts adjacent to the reviewed first area, at first.x + first.width, using the same y, width and height wherever image bounds permit. This is explicitly labeled a starting box for review. It is not detection, numeric confirmation, or evidence that both complete item lists were captured. Existing valid second proposals and subsequent user adjustments survive Back/Next.
- Crop title uses **Potential new equip · right**. Review must include the full label column and base-value column, not values alone.

The integration owner adds scoped `touch-action: manipulation` to crop controls to avoid double-tap activation zoom while preserving pinch zoom; there is no viewport zoom prohibition or global touch cancellation. A hold is optional, so users can still use ordinary single taps or keyboard controls.

Verification: deterministic injected-timer tests cover taps, hold timing, trailing-click suppression, canceled/queued callbacks, replacement holds, and keyboard activation. Invented geometry tests cover an adjacent label/value span and image bounds; existing editor invariants cover preservation of a supplied second area, Back, reset, cancellation and fine pixel movements. These establish interaction logic, not physical iPhone Safari usability. Physical-device double-tap/hold behavior remains a follow-up for the user; no claim of iOS testing is made.
