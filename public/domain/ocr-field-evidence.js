// Observed glyph colors suggest field boundaries, never confirmed quantities.
export const OCR_FIELD_EVIDENCE_VERSION = 'glyph-color-fields-1';
const number = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?$/;
const boxValid = (b, width, height) => b && ['x0','y0','x1','y1'].every(k => Number.isInteger(b[k])) && b.x0 >= 0 && b.y0 >= 0 && b.x1 > b.x0 && b.y1 > b.y0 && b.x1 <= width && b.y1 <= height;
function tone(box, raster) {
  let neutral = 0, colored = 0;
  for (let y = box.y0; y < box.y1; y++) for (let x = box.x0; x < box.x1; x++) {
    const i = (y * raster.width + x) * 4, r=raster.data[i],g=raster.data[i+1],b=raster.data[i+2],a=raster.data[i+3];
    if (a < 128) continue;
    if (Math.min(r,g,b) >= 155 && Math.max(r,g,b) - Math.min(r,g,b) <= 42) neutral++;
    else if ((r >= 170 && r - g >= 65 && r - b >= 55) || (g >= 155 && r >= 110 && Math.min(r,g) - b >= 65)) colored++;
  }
  if (neutral >= 3 && neutral >= colored * 4) return 'neutral';
  if (colored >= 3 && colored >= neutral * 4) return 'colored';
  return 'uncertain';
}
export function annotateFieldEvidence(blocks, raster) {
  if (blocks !== null && !Array.isArray(blocks)) throw new TypeError('OCR blocks required.');
  if (!raster || !Number.isSafeInteger(raster.width) || !Number.isSafeInteger(raster.height) || raster.width <= 0 || raster.height <= 0 || raster.width * raster.height > 28000000 || !(raster.data instanceof Uint8ClampedArray) || raster.data.length !== raster.width * raster.height * 4) throw new TypeError('Bounded original crop raster required.');
  const result = structuredClone(blocks);
  let inspected = 0, sampledArea = 0;
  for (const block of result ?? []) for (const paragraph of block.paragraphs ?? []) for (const line of paragraph.lines ?? []) for (const word of line.words ?? []) {
    if (++inspected > 1000) throw new RangeError('Too many OCR words.');
    if (typeof word.text !== 'string' || !/^[\d,.%+\-:]+$/.test(word.text) || !boxValid(word.bbox,raster.width,raster.height)) continue;
    const evidence = { version: OCR_FIELD_EVIDENCE_VERSION, assumption: 'neutral-base-trailing-colored-comparison', confirmed: false, status: 'unresolved' };
    const symbols = word.symbols;
    if (!Array.isArray(symbols) || symbols.length > 100 || symbols.some(s => typeof s?.text !== 'string' || s.text.length !== 1 || !boxValid(s.bbox,raster.width,raster.height) || s.bbox.x0 < word.bbox.x0 || s.bbox.x1 > word.bbox.x1 || s.bbox.y0 < word.bbox.y0 || s.bbox.y1 > word.bbox.y1) || symbols.map(s => s.text).join('') !== word.text) {
      // Missing symbols cannot certify a merged numeric word as one base field.
      word.fieldEvidence = evidence; continue;
    }
    sampledArea += symbols.reduce((sum,s)=>sum+(s.bbox.x1-s.bbox.x0)*(s.bbox.y1-s.bbox.y0),0);
    if (sampledArea > 8000000) { word.fieldEvidence=evidence; continue; }
    const tones = symbols.map(s => tone(s.bbox,raster));
    evidence.glyphTones = tones;
    if (tones.every(t => t === 'neutral')) evidence.status = 'neutralOnly';
    else {
      const boundary = tones.findIndex(t => t !== 'neutral');
      // OCR sometimes hallucinates a colon in the gap. It remains verbatim in
      // comparison evidence, never a substituted digit or part of the base.
      const trailing = tones.slice(boundary);
      const trailingComparison = trailing.some(t=>t==='colored') && trailing.every((t,i)=>t==='colored' || (t==='uncertain' && symbols[boundary+i].text===':'));
      if (boundary > 0 && trailingComparison && symbols.slice(1).every((s,i) => s.bbox.x0 >= symbols[i].bbox.x0) && symbols[boundary - 1].bbox.x1 <= symbols[boundary].bbox.x0) {
        const baseText = symbols.slice(0,boundary).map(s=>s.text).join('');
        if (number.test(baseText)) Object.assign(evidence,{status:'separated',baseText,comparisonText:symbols.slice(boundary).map(s=>s.text).join(''),boundaryX:symbols[boundary].bbox.x0});
      } else if (tones.every(t => t === 'colored')) evidence.status = 'coloredOnly';
    }
    word.fieldEvidence = evidence;
  }
  return result;
}
