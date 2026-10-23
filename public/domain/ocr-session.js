// Pure ephemeral session operations. Pixels, names and transport live outside.
export const OCR_SESSION_VERSION = 'ocr-session-2';
export function createOcrSession() {
  return { version: OCR_SESSION_VERSION, imageId: null, imageRevision: 0, revision: 0, nextRun: 0, activeRun: null, panels: [], corrections: {}, metadata: null };
}
const clone = value => structuredClone(value);
export function replaceOcrImage(state, imageId) {
  if (imageId !== null && (typeof imageId !== 'string' || !imageId)) throw new TypeError('Opaque image ID required.');
  return { ...createOcrSession(), imageId, imageRevision: state.imageRevision + 1, revision: state.revision + 1, nextRun: state.nextRun };
}
export function beginOcrRun(state, settings = {}) {
  if (!state.imageId) throw new RangeError('Select an image first.');
  const token = { imageRevision: state.imageRevision, run: state.nextRun + 1 };
  return { token, session: { ...state, nextRun: token.run, activeRun: { ...token, settings: clone(settings) } } };
}
export function isOcrRunCurrent(state, token) {
  return Boolean(token && state.activeRun && token.imageRevision === state.imageRevision && token.imageRevision === state.activeRun.imageRevision && token.run === state.activeRun.run);
}
export function cancelOcrRun(state) { return { ...state, activeRun: null }; }
export function acceptOcrRun(state, token, output) {
  if (!isOcrRunCurrent(state, token)) return { accepted: false, session: state };
  if (!output || !Array.isArray(output.panels)) throw new TypeError('Explicit panels required.');
  const ids = new Set();
  const panels = output.panels.map(panel => {
    if (!panel || typeof panel.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(panel.id) || ids.has(panel.id) || typeof panel.rawText !== 'string') throw new TypeError('Unique panel IDs and raw text required.');
    const segmentationIdentity = panel.segmentationIdentity ?? null;
    if (segmentationIdentity !== null && (typeof segmentationIdentity !== 'string' || !segmentationIdentity)) throw new TypeError('Segmentation identity must be nonempty text or null.');
    ids.add(panel.id);
    const lines = panel.rawText.split(/\r\n|\n|\r/).map((rawText, ordinal) => {
      const id = `${state.imageRevision}:${panel.id}:${ordinal}`;
      const correction = state.corrections[id] ?? null;
      const needsReview = correction !== null && (correction.observationRawText !== rawText || (correction.segmentationIdentity ?? null) !== segmentationIdentity);
      return { id, ordinal, rawText, statId: null, value: null, provenance: { kind: 'ocr', imageRevision: token.imageRevision, run: token.run, panel: panel.id, segmentationIdentity },
        correction: clone(correction), effectiveText: correction ? correction.text : rawText,
        state: needsReview ? 'changedObservation' : correction ? 'userCorrected' : 'needsReview' };
    });
    return { id: panel.id, rawText: panel.rawText, confidence: typeof panel.confidence === 'number' && Number.isFinite(panel.confidence) ? panel.confidence : null,
      observationMetadata: clone({ crop: panel.crop ?? null, boxes: panel.boxes ?? null, provenance: panel.provenance ?? null, segmentationIdentity }), lines };
  });
  // Corrections for disappeared lines remain retained, never reassigned by label.
  return { accepted: true, session: { ...state, revision: state.revision + 1, activeRun: null, panels,
    metadata: { ...clone(output.metadata ?? {}), runSettings: clone(state.activeRun.settings) } } };
}
export function correctOcrLine(state, lineId, text) {
  if (text !== null && typeof text !== 'string') throw new TypeError('Correction must be text or null to restore observation.');
  const line = state.panels.flatMap(panel => panel.lines).find(entry => entry.id === lineId);
  if (!line) throw new RangeError('Correction line is absent.');
  const corrections = { ...state.corrections };
  if (text === null) delete corrections[lineId];
  else corrections[lineId] = { text, observationRawText: line.rawText, segmentationIdentity: line.provenance.segmentationIdentity ?? null, revision: state.revision + 1 };
  const panels = state.panels.map(panel => ({ ...panel, lines: panel.lines.map(entry => entry.id !== lineId ? entry : {
    ...entry, correction: clone(corrections[lineId] ?? null), effectiveText: text ?? entry.rawText, state: text === null ? 'needsReview' : 'userCorrected',
  }) }));
  return { ...state, corrections, panels, revision: state.revision + 1 };
}
