import { labDistance, meanLab } from './lab';
import type { LabColor } from './types';

export interface Cluster {
  centroid: LabColor;
  size: number;
}

/**
 * K-means clustering in LAB space.
 * Deterministic via fixed seed (default 42) so tests are stable.
 *
 * @param points input LAB colours (one per pixel)
 * @param k number of clusters (typically 3)
 * @param maxIter convergence cap
 * @param seed RNG seed
 * @returns clusters sorted by size, largest first
 */
export function kmeans(
  points: LabColor[],
  k: number,
  maxIter: number = 50,
  seed: number = 42
): Cluster[] {
  if (points.length === 0) return [];
  if (points.length <= k) {
    return points.map((p) => ({ centroid: p, size: 1 }));
  }

  const rng = makeRng(seed);
  let centroids = pickInitialCentroids(points, k, rng);

  for (let iter = 0; iter < maxIter; iter++) {
    const buckets: LabColor[][] = Array.from({ length: k }, () => []);
    for (const p of points) {
      buckets[closestCentroidIndex(p, centroids)]!.push(p);
    }
    const newCentroids = buckets.map((bucket, i) =>
      bucket.length > 0 ? meanLab(bucket) : centroids[i]!
    );
    if (centroidsConverged(centroids, newCentroids)) {
      centroids = newCentroids;
      break;
    }
    centroids = newCentroids;
  }

  // Compute final cluster sizes
  const sizes = new Array<number>(k).fill(0);
  for (const p of points) {
    sizes[closestCentroidIndex(p, centroids)]!++;
  }

  return centroids
    .map((c, i) => ({ centroid: c, size: sizes[i]! }))
    .filter((c) => c.size > 0)
    .sort((x, y) => y.size - x.size);
}

function closestCentroidIndex(p: LabColor, centroids: LabColor[]): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < centroids.length; i++) {
    const d = labDistance(p, centroids[i]!);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function centroidsConverged(a: LabColor[], b: LabColor[], epsilon: number = 0.5): boolean {
  for (let i = 0; i < a.length; i++) {
    if (labDistance(a[i]!, b[i]!) > epsilon) return false;
  }
  return true;
}

/** k-means++ initial centroid selection. Picks well-separated starting points. */
function pickInitialCentroids(points: LabColor[], k: number, rng: () => number): LabColor[] {
  const centroids: LabColor[] = [];
  centroids.push(points[Math.floor(rng() * points.length)]!);

  for (let c = 1; c < k; c++) {
    const distances = points.map((p) => {
      let minDist = Infinity;
      for (const cc of centroids) {
        const d = labDistance(p, cc);
        if (d < minDist) minDist = d;
      }
      return minDist;
    });
    const totalSquared = distances.reduce((s, d) => s + d * d, 0);
    let target = rng() * totalSquared;
    let chosenIdx = 0;
    for (let i = 0; i < distances.length; i++) {
      target -= distances[i]! * distances[i]!;
      if (target <= 0) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push(points[chosenIdx]!);
  }
  return centroids;
}

/** Simple deterministic LCG so tests are reproducible. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}
