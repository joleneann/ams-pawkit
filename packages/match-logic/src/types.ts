import type { FurTone } from '@pawkit/design-tokens';

export type { FurTone };

/** RGBA pixel buffer (typically from `expo-image-manipulator` on Expo or sharp on Node tests). */
export interface PixelBuffer {
  width: number;
  height: number;
  /** RGBA, length = width * height * 4 */
  data: Uint8Array;
}

/** A single point in CIELAB space. */
export interface LabColor {
  L: number;
  a: number;
  b: number;
}

/** Result of `resolveFurMatch`. Stored as both the user-visible result AND
 * (separately) as `algorithm_match_*` for the override-tracking training signal. */
export interface FurMatch {
  primary: FurTone;
  /** Present only for two-tone or auto-pair results. */
  secondary?: FurTone;
  /** True if `secondary` came from an auto-pair rule (Milk→Vanilla or Sable→Bark) rather than k-means. */
  isAutoPair: boolean;
  /** True if both primary and secondary came from the photo (not auto-pair). */
  isTwoTone: boolean;
  /** Fraction of pixels in the dominant cluster, 0 to 1. Higher equals more confident. */
  confidence: number;
}
