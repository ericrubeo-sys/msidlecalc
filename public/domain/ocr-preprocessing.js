// Optional evaluation transform, never a semantic item/side detector. Raw
// pixels and the separate unfiltered observation must remain available.
export const NEUTRAL_TEXT_MASK_VERSION = 'neutral-text-mask-1';
export const NEUTRAL_TEXT_MASK_SETTINGS = Object.freeze({ minMean: 150, maxChroma: 48, minAlpha: 128 });
export function maskNeutralText({ data, width, height }) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0 || width * height > 64000000 || !(data instanceof Uint8ClampedArray) || data.length !== width * height * 4) throw new TypeError('Bounded RGBA pixel buffer required.');
  const output = new Uint8ClampedArray(data.length);
  let retainedPixels = 0;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index], green = data[index + 1], blue = data[index + 2];
    const mean = (red + green + blue) / 3;
    const retained = data[index + 3] >= NEUTRAL_TEXT_MASK_SETTINGS.minAlpha && mean >= NEUTRAL_TEXT_MASK_SETTINGS.minMean && Math.max(red, green, blue) - Math.min(red, green, blue) <= NEUTRAL_TEXT_MASK_SETTINGS.maxChroma;
    const tone = retained ? 255 - Math.round(mean) : 255;
    if (retained) retainedPixels++;
    output[index] = tone; output[index + 1] = tone; output[index + 2] = tone; output[index + 3] = 255;
  }
  return { data: output, width, height, version: NEUTRAL_TEXT_MASK_VERSION, settings: { ...NEUTRAL_TEXT_MASK_SETTINGS }, retainedPixels };
}
