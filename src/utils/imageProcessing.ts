/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessOptions {
  threshold: number;      // 10 to 180
  thickness: number;      // 1 to 3
  brightness: number;     // -100 to 100
  contrast: number;       // -100 to 100
  style: 'simple' | 'detailed' | 'bold' | 'kids';
  invert?: boolean;
}

/**
 * Converts any image source canvas into a clean, printable black-and-white coloring outline.
 * Fixes perimeter black line artifacts and prevents division-by-zero on contrast calculations.
 */
export function processImageToColoringPage(
  sourceCanvas: HTMLCanvasElement,
  options: ProcessOptions
): HTMLCanvasElement {
  const { threshold, thickness, brightness, contrast, style, invert = false } = options;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true })!;

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
  const imgData = srcCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Grayscale + Safe Clamped Brightness & Contrast Adjustment
  const safeContrast = Math.max(-100, Math.min(100, contrast));
  const factor = (259 * (safeContrast + 255)) / (255 * (259 - safeContrast));
  const gray = new Float32Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] + brightness;
    let g = data[i + 1] + brightness;
    let b = data[i + 2] + brightness;

    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;

    // Luminance standard formula
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i / 4] = Math.min(255, Math.max(0, lum));
  }

  // 2. 3x3 Gaussian Noise Suppression
  const blurred = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    const yOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const sum =
        gray[yOffset - width + (x - 1)] + 2 * gray[yOffset - width + x] + gray[yOffset - width + (x + 1)] +
        2 * gray[yOffset + (x - 1)]     + 4 * gray[yOffset + x]         + 2 * gray[yOffset + (x + 1)] +
        gray[yOffset + width + (x - 1)] + 2 * gray[yOffset + width + x] + gray[yOffset + width + (x + 1)];
      blurred[yOffset + x] = sum / 16;
    }
  }

  // 3. Sobel Edge Detection with perimeter initialized to 255 (WHITE)
  const edges = new Uint8ClampedArray(width * height);
  edges.fill(255); // Prevents dark perimeter border dilation

  const effectiveThreshold =
    style === 'kids' ? threshold + 30 : style === 'detailed' ? Math.max(15, threshold - 15) : threshold;

  for (let y = 1; y < height - 1; y++) {
    const yOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = yOffset + x;

      const gx =
        -1 * blurred[idx - width - 1] + 1 * blurred[idx - width + 1] +
        -2 * blurred[idx - 1]         + 2 * blurred[idx + 1] +
        -1 * blurred[idx + width - 1] + 1 * blurred[idx + width + 1];

      const gy =
        -1 * blurred[idx - width - 1] - 2 * blurred[idx - width] - 1 * blurred[idx - width + 1] +
         1 * blurred[idx + width - 1] + 2 * blurred[idx + width] + 1 * blurred[idx + width + 1];

      const mag = Math.hypot(gx, gy);
      edges[idx] = mag > effectiveThreshold ? 0 : 255;
    }
  }

  // 4. Line Dilation (Kids Easy Coloring lines)
  const finalData = ctx.createImageData(width, height);
  const out = finalData.data;

  for (let y = 0; y < height; y++) {
    const yOffset = y * width;
    for (let x = 0; x < width; x++) {
      const pos = (yOffset + x) * 4;
      let val = edges[yOffset + x];

      if (thickness > 1 && val === 255) {
        const rad = thickness - 1;
        checkNeighbors: for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              if (edges[ny * width + nx] === 0) {
                val = 0;
                break checkNeighbors;
              }
            }
          }
        }
      }

      if (invert) {
        val = 255 - val;
      }

      out[pos] = val;
      out[pos + 1] = val;
      out[pos + 2] = val;
      out[pos + 3] = 255;
    }
  }

  ctx.putImageData(finalData, 0, 0);
  return outputCanvas;
}
