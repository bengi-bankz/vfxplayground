import { Texture } from "pixi.js";

const SAMPLE_SIZE = 32;
const MIN_ALPHA = 24;

const toBin = (value: number) => Math.min(15, Math.floor(value / 16));

const isCanvasSource = (
  source: unknown,
): source is
  | HTMLImageElement
  | HTMLCanvasElement
  | OffscreenCanvas
  | ImageBitmap => {
  return (
    typeof source === "object" &&
    source !== null &&
    "width" in source &&
    "height" in source
  );
};

export const sampleDominantTextureColor = (
  textureName: string,
): number | undefined => {
  const texture = Texture.from(textureName);
  const baseSource = texture.source.resource;

  if (!isCanvasSource(baseSource)) return undefined;

  const frame = texture.frame;
  const sourceWidth = Math.max(1, Math.floor(frame.width));
  const sourceHeight = Math.max(1, Math.floor(frame.height));

  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return undefined;

  ctx.clearRect(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  ctx.drawImage(
    baseSource,
    Math.floor(frame.x),
    Math.floor(frame.y),
    sourceWidth,
    sourceHeight,
    0,
    0,
    SAMPLE_SIZE,
    SAMPLE_SIZE,
  );

  const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;

  const binWeights = new Map<number, number>();
  const binColorSums = new Map<number, { r: number; g: number; b: number }>();

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    if (a < MIN_ALPHA) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const weight = (a / 255) * (0.25 + saturation * 0.75);

    const bin = (toBin(r) << 8) | (toBin(g) << 4) | toBin(b);
    binWeights.set(bin, (binWeights.get(bin) ?? 0) + weight);

    const existing = binColorSums.get(bin) ?? { r: 0, g: 0, b: 0 };
    existing.r += r * weight;
    existing.g += g * weight;
    existing.b += b * weight;
    binColorSums.set(bin, existing);
  }

  let dominantBin: number | undefined;
  let dominantWeight = -1;
  for (const [bin, weight] of binWeights) {
    if (weight > dominantWeight) {
      dominantWeight = weight;
      dominantBin = bin;
    }
  }

  if (dominantBin === undefined || dominantWeight <= 0) return undefined;

  const colorSum = binColorSums.get(dominantBin);
  if (!colorSum) return undefined;

  const red = Math.max(
    0,
    Math.min(255, Math.round(colorSum.r / dominantWeight)),
  );
  const green = Math.max(
    0,
    Math.min(255, Math.round(colorSum.g / dominantWeight)),
  );
  const blue = Math.max(
    0,
    Math.min(255, Math.round(colorSum.b / dominantWeight)),
  );

  return (red << 16) | (green << 8) | blue;
};
