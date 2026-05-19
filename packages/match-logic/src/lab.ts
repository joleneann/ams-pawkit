import { converter, differenceCiede2000, formatHex } from 'culori';
import type { LabColor } from './types';

const toLab = converter('lab');
const deltaE = differenceCiede2000();

/** sRGB (0-255) to CIELAB (D65, 2° observer). */
export function rgbToLab(r: number, g: number, b: number): LabColor {
  const lab = toLab({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });
  if (!lab) return { L: 0, a: 0, b: 0 };
  return { L: lab.l ?? 0, a: lab.a ?? 0, b: lab.b ?? 0 };
}

/** Hex string ('#RRGGBB') → CIELAB. */
export function hexToLab(hex: string): LabColor {
  const lab = toLab(hex);
  if (!lab) return { L: 0, a: 0, b: 0 };
  return { L: lab.l ?? 0, a: lab.a ?? 0, b: lab.b ?? 0 };
}

/** ΔE2000 between two LAB colours. */
export function labDistance(p: LabColor, q: LabColor): number {
  return deltaE(
    { mode: 'lab', l: p.L, a: p.a, b: p.b },
    { mode: 'lab', l: q.L, a: q.a, b: q.b }
  );
}

/** Mean of a non-empty list of LAB colours. */
export function meanLab(points: LabColor[]): LabColor {
  if (points.length === 0) return { L: 0, a: 0, b: 0 };
  let L = 0, a = 0, b = 0;
  for (const p of points) {
    L += p.L;
    a += p.a;
    b += p.b;
  }
  return { L: L / points.length, a: a / points.length, b: b / points.length };
}

/** Chroma (saturation magnitude) of a LAB colour. C* = sqrt(a² + b²). */
export function labChroma(lab: LabColor): number {
  return Math.sqrt(lab.a * lab.a + lab.b * lab.b);
}

/** LAB → hex string (for debugging). */
export function labToHex(lab: LabColor): string {
  return formatHex({ mode: 'lab', l: lab.L, a: lab.a, b: lab.b }) ?? '#000000';
}
