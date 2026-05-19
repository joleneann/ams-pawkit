import { kmeans } from './kmeans';
import { labChroma, rgbToLab } from './lab';
import { centreCrop, downscale } from './preprocess';
import { applyRules } from './rules';
import type { FurMatch, LabColor, PixelBuffer } from './types';

/**
 * The fur-match algorithm. Pure TS, platform-agnostic, deterministic.
 *
 * Pipeline:
 * 1. Centre-crop the middle 60% (drop background edges)
 * 2. Downscale to 64×64 (50× faster k-means, indistinguishable result)
 * 3. Convert each pixel to CIELAB (D65, 2° observer)
 * 4. Cluster with k-means k=3 (deterministic seed for reproducible tests)
 * 5. Saturation floor: if any cluster is saturated, demote near-grey clusters
 *    (prevents grey backgrounds from beating a colourful pet)
 * 6. Map dominant cluster(s) → closest fur tone via ΔE2000
 * 7. Apply rules: solo / two-tone (>= 25% second cluster) / auto-pair
 *
 * @param photo decoded RGBA pixel buffer (from expo-image-manipulator on Expo, sharp on Node)
 * @returns the resolved fur match: primary + optional secondary + flags
 */
export function resolveFurMatch(photo: PixelBuffer): FurMatch {
  // 1 + 2: centre-crop, then downscale
  const cropped = centreCrop(photo, 0.6);
  const small = downscale(cropped, 64);

  // 3: convert each pixel to LAB
  const labPoints: LabColor[] = [];
  for (let i = 0; i < small.data.length; i += 4) {
    const a = small.data[i + 3]!;
    if (a < 128) continue; // skip transparent pixels
    labPoints.push(rgbToLab(small.data[i]!, small.data[i + 1]!, small.data[i + 2]!));
  }

  if (labPoints.length === 0) {
    return { primary: 'vanilla', isAutoPair: false, isTwoTone: false, confidence: 0 };
  }

  // 4: k-means k=3
  const clusters = kmeans(labPoints, 3);

  // 5: saturation floor. If any cluster is saturated (chroma > threshold),
  // demote near-grey clusters so they can't beat a colourful pet.
  const SATURATION_FLOOR = 6;
  const hasSaturated = clusters.some((c) => labChroma(c.centroid) > SATURATION_FLOOR);
  let filtered = clusters;
  if (hasSaturated) {
    const colourful = clusters.filter((c) => labChroma(c.centroid) > 3);
    if (colourful.length > 0) filtered = colourful;
  }

  // 6 + 7: rules
  return applyRules(filtered, labPoints.length);
}

export type { FurMatch, FurTone, LabColor, PixelBuffer } from './types';
export { palette, FUR_TONES, AUTO_PAIRS } from '@pawkit/design-tokens';
