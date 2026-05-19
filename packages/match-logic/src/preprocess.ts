import type { PixelBuffer } from './types';

/**
 * Centre-crop the middle `fraction` of the buffer.
 * Default 0.6 keeps the centre 60% × 60% area, dropping background edges.
 */
export function centreCrop(buf: PixelBuffer, fraction: number = 0.6): PixelBuffer {
  const cropW = Math.max(1, Math.floor(buf.width * fraction));
  const cropH = Math.max(1, Math.floor(buf.height * fraction));
  const startX = Math.floor((buf.width - cropW) / 2);
  const startY = Math.floor((buf.height - cropH) / 2);

  const data = new Uint8Array(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((startY + y) * buf.width + (startX + x)) * 4;
      const dstIdx = (y * cropW + x) * 4;
      data[dstIdx] = buf.data[srcIdx]!;
      data[dstIdx + 1] = buf.data[srcIdx + 1]!;
      data[dstIdx + 2] = buf.data[srcIdx + 2]!;
      data[dstIdx + 3] = buf.data[srcIdx + 3]!;
    }
  }
  return { width: cropW, height: cropH, data };
}

/**
 * Downscale via nearest-neighbour. Fast, good enough for clustering (we don't need
 * smooth interpolation when we're just classifying colour buckets).
 *
 * Per docs/reusable-tooling.md: 64×64 is the target. 50× faster than full-res
 * clustering with indistinguishable result.
 */
export function downscale(buf: PixelBuffer, targetSize: number = 64): PixelBuffer {
  const scale = Math.min(targetSize / buf.width, targetSize / buf.height);
  if (scale >= 1) return buf;
  const newW = Math.max(1, Math.floor(buf.width * scale));
  const newH = Math.max(1, Math.floor(buf.height * scale));
  const data = new Uint8Array(newW * newH * 4);
  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      const srcX = Math.floor(x / scale);
      const srcY = Math.floor(y / scale);
      const srcIdx = (srcY * buf.width + srcX) * 4;
      const dstIdx = (y * newW + x) * 4;
      data[dstIdx] = buf.data[srcIdx]!;
      data[dstIdx + 1] = buf.data[srcIdx + 1]!;
      data[dstIdx + 2] = buf.data[srcIdx + 2]!;
      data[dstIdx + 3] = buf.data[srcIdx + 3]!;
    }
  }
  return { width: newW, height: newH, data };
}
