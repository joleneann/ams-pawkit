import { describe, expect, it } from 'vitest';
import { palette } from '@pawkit/design-tokens';
import { resolveFurMatch } from '../index';
import type { FurTone, PixelBuffer } from '../types';

// ---- helpers ----------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Synthetic solid-colour pixel buffer for "yellow Lab" / "white Persian" baseline tests. */
function makeSolidBuffer(hex: string, size: number = 200): PixelBuffer {
  const { r, g, b } = hexToRgb(hex);
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return { width: size, height: size, data };
}

/** Synthetic two-tone buffer (top half hex1, bottom half hex2) for tuxedo / Husky tests. */
function makeTwoToneBuffer(hex1: string, hex2: string, size: number = 200): PixelBuffer {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const c = y < size / 2 ? c1 : c2;
      data[i] = c.r;
      data[i + 1] = c.g;
      data[i + 2] = c.b;
      data[i + 3] = 255;
    }
  }
  return { width: size, height: size, data };
}

// ---- solo solid-tone fixtures ----------------------------------------------

describe('resolveFurMatch: solo solid tones', () => {
  it('Yellow Lab (Vanilla hex) → solo Vanilla', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.vanilla));
    expect(result.primary).toBe('vanilla');
    expect(result.isAutoPair).toBe(false);
    expect(result.isTwoTone).toBe(false);
  });

  it('Darker Golden (Honey hex) → solo Honey [Vanilla/Honey decision boundary, mitigates Risk #1]', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.honey));
    expect(result.primary).toBe('honey');
  });

  it('Orange tabby (Peach hex) → solo Peach', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.peach));
    expect(result.primary).toBe('peach');
  });

  it('Irish Setter (Rust hex) → solo Rust', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.rust));
    expect(result.primary).toBe('rust');
  });

  it('Brown Lab (Mushroom hex) → solo Mushroom', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.mushroom));
    expect(result.primary).toBe('mushroom');
  });

  it('Russian Blue (Smoke hex) → solo Smoke', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.smoke));
    expect(result.primary).toBe('smoke');
  });

  it('Schnauzer (Steel hex) → solo Steel', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.steel));
    expect(result.primary).toBe('steel');
  });

  it('Chocolate Lab (Bark hex) → solo Bark', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.bark));
    expect(result.primary).toBe('bark');
  });
});

// ---- auto-pair fixtures (Rules 03 + 04) ------------------------------------

describe('resolveFurMatch: auto-pair rules', () => {
  it('White Persian (Milk hex) → Milk + Vanilla auto-pair (Rule 03)', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.milk));
    expect(result.primary).toBe('milk');
    expect(result.secondary).toBe('vanilla');
    expect(result.isAutoPair).toBe(true);
    expect(result.isTwoTone).toBe(false);
  });

  it('Black Lab (Sable hex) → Sable + Bark auto-pair (Rule 04)', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.sable));
    expect(result.primary).toBe('sable');
    expect(result.secondary).toBe('bark');
    expect(result.isAutoPair).toBe(true);
    expect(result.isTwoTone).toBe(false);
  });
});

// ---- two-tone fixtures -----------------------------------------------------

describe('resolveFurMatch: two-tone (>= 25% second cluster)', () => {
  it('Tuxedo cat (Sable + Milk 50/50) → two-tone Sable + Milk', () => {
    const result = resolveFurMatch(makeTwoToneBuffer(palette.sable, palette.milk));
    expect([result.primary, result.secondary].sort()).toEqual(['milk', 'sable']);
    expect(result.isTwoTone).toBe(true);
    expect(result.isAutoPair).toBe(false);
  });

  it('Husky (Smoke + Milk 50/50) → two-tone Smoke + Milk', () => {
    const result = resolveFurMatch(makeTwoToneBuffer(palette.smoke, palette.milk));
    expect([result.primary, result.secondary].sort()).toEqual(['milk', 'smoke']);
    expect(result.isTwoTone).toBe(true);
  });

  it('Calico-ish (Peach + Milk 50/50) → two-tone Peach + Milk', () => {
    const result = resolveFurMatch(makeTwoToneBuffer(palette.peach, palette.milk));
    expect([result.primary, result.secondary].sort()).toEqual(['milk', 'peach']);
    expect(result.isTwoTone).toBe(true);
  });

  it('Brindle-ish (Bark + Honey 50/50) → two-tone Bark + Honey', () => {
    const result = resolveFurMatch(makeTwoToneBuffer(palette.bark, palette.honey));
    expect([result.primary, result.secondary].sort()).toEqual(['bark', 'honey']);
    expect(result.isTwoTone).toBe(true);
  });
});

// ---- algorithm output stability --------------------------------------------

describe('resolveFurMatch: output shape', () => {
  it('confidence is between 0 and 1', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.honey));
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('solid-colour buffer → confidence very high (close to 1)', () => {
    const result = resolveFurMatch(makeSolidBuffer(palette.vanilla));
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('determinism: same input gives same output across runs', () => {
    const buf = makeSolidBuffer(palette.honey);
    const r1 = resolveFurMatch(buf);
    const r2 = resolveFurMatch(buf);
    expect(r1.primary).toBe(r2.primary);
    expect(r1.confidence).toBeCloseTo(r2.confidence, 5);
  });
});
