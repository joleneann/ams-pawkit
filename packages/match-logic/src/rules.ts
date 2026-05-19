import { AUTO_PAIRS, FUR_TONES } from '@pawkit/design-tokens';
import type { FurTone } from '@pawkit/design-tokens';
import { hexToLab, labDistance } from './lab';
import type { Cluster } from './kmeans';
import type { FurMatch, LabColor } from './types';
import { palette } from '@pawkit/design-tokens';

/**
 * Recompute the LAB targets at module load from the canonical hex values in
 * @pawkit/design-tokens. This is more reliable than the placeholder LAB table
 * in design-tokens/src/colors.ts (which is marked as needing verification).
 */
const FUR_LAB_VERIFIED: Record<FurTone, LabColor> = {
  milk: hexToLab(palette.milk),
  vanilla: hexToLab(palette.vanilla),
  honey: hexToLab(palette.honey),
  peach: hexToLab(palette.peach),
  rust: hexToLab(palette.rust),
  mushroom: hexToLab(palette.mushroom),
  smoke: hexToLab(palette.smoke),
  steel: hexToLab(palette.steel),
  bark: hexToLab(palette.bark),
  sable: hexToLab(palette.sable),
};

/** Find the fur tone with the smallest ΔE2000 distance to `lab`. */
export function closestFurTone(lab: LabColor): FurTone {
  let bestTone: FurTone = 'vanilla';
  let bestDist = Infinity;
  for (const tone of FUR_TONES) {
    const d = labDistance(lab, FUR_LAB_VERIFIED[tone]);
    if (d < bestDist) {
      bestDist = d;
      bestTone = tone;
    }
  }
  return bestTone;
}

/**
 * Apply the four matching rules from docs/decisions-log.md / docs/brand-system.md:
 * - Solo: only one cluster wins, no auto-pair
 * - Two-tone: top two clusters are distinct AND second is large enough (>= 25% of pixels)
 * - White auto-pair (Rule 03): solo Milk → Milk + Vanilla
 * - Black auto-pair (Rule 04): solo Sable → Sable + Bark
 */
export function applyRules(clusters: Cluster[], totalPixels: number): FurMatch {
  if (clusters.length === 0) {
    // Degenerate fallback. Shouldn't happen with real photos.
    return {
      primary: 'vanilla',
      isAutoPair: false,
      isTwoTone: false,
      confidence: 0,
    };
  }

  const labeled = clusters.map((c) => ({
    ...c,
    tone: closestFurTone(c.centroid),
  }));

  const primary = labeled[0]!.tone;
  const primaryFraction = labeled[0]!.size / totalPixels;

  const second = labeled[1];
  const secondTone = second?.tone;
  const secondFraction = second ? second.size / totalPixels : 0;

  const TWO_TONE_THRESHOLD = 0.25;
  const isTwoTone = !!secondTone && secondTone !== primary && secondFraction >= TWO_TONE_THRESHOLD;

  // Apply auto-pair only if NOT already two-tone from photo
  if (!isTwoTone) {
    const autoPair = AUTO_PAIRS[primary];
    if (autoPair) {
      return {
        primary,
        secondary: autoPair,
        isAutoPair: true,
        isTwoTone: false,
        confidence: primaryFraction,
      };
    }
    return {
      primary,
      isAutoPair: false,
      isTwoTone: false,
      confidence: primaryFraction,
    };
  }

  return {
    primary,
    secondary: secondTone,
    isAutoPair: false,
    isTwoTone: true,
    confidence: primaryFraction,
  };
}
