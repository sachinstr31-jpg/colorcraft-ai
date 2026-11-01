/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DotPoint {
  x: number;
  y: number;
  number: number;
  labelOffsetX: number;
  labelOffsetY: number;
}

export type PresetShape = 'dinosaur' | 'elephant' | 'rocket' | 'car' | 'star' | 'apple' | 'butterfly' | 'teddy';

/**
 * Returns sequentially ordered contour points for preset recognizable subjects.
 */
export function getContourPointsForShape(
  shape: PresetShape,
  width: number,
  height: number,
  dotCount: number
): DotPoint[] {
  const cx = width / 2;
  const cy = height / 2;
  const basePoints: [number, number][] = [];
  const samples = 600; // High-resolution sampling space

  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    let r = 160;

    switch (shape) {
      case 'dinosaur':
        // Long neck at -PI/4, stout body, tail at PI
        r = 150 + 45 * Math.sin(t) - 35 * Math.cos(2 * t) + 25 * Math.sin(3 * t);
        break;
      case 'elephant':
        // Head, trunk dip, rounded back
        r = 145 + 35 * Math.cos(t) + 30 * Math.sin(2 * t) - 20 * Math.cos(3 * t);
        break;
      case 'rocket':
        // Elongated aerodynamic silhouette with fin flares
        r = 165 + 55 * Math.cos(2 * t) - 25 * Math.abs(Math.sin(3 * t));
        break;
      case 'car':
        // Low ground, cabin top, front hood
        r = 140 + 40 * Math.sin(2 * t) - 20 * Math.cos(4 * t);
        break;
      case 'apple':
        // Top indentation (dimple) and bottom curves
        r = 160 - 25 * Math.cos(t) + 18 * Math.sin(2 * t);
        break;
      case 'butterfly':
        // Symmetrical wings
        r = 120 + 60 * Math.sin(2 * t) * Math.sin(2 * t) + 30 * Math.cos(4 * t);
        break;
      case 'teddy':
        // Teddy bear round head with ear lobes
        r = 135 + 25 * Math.cos(t) + 35 * Math.cos(3 * t) * Math.cos(3 * t);
        break;
      case 'star':
      default:
        // 5-pointed star
        r = 130 + 55 * Math.cos(5 * t);
        break;
    }

    basePoints.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }

  // Subsample exactly dotCount points along the perimeter
  return subsamplePoints(basePoints, cx, cy, dotCount);
}

/**
 * Extracts external boundary from a user-uploaded canvas and returns ordered dot points.
 */
export function extractOrderedContourFromCanvas(
  canvas: HTMLCanvasElement,
  dotCount: number
): DotPoint[] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const cx = width / 2;
  const cy = height / 2;
  const rawPoints: [number, number][] = [];
  const totalRays = 720;

  // Radial ray sampling from outer radius inwards to find first dark outline
  const maxR = Math.min(width, height) * 0.45;
  for (let i = 0; i < totalRays; i++) {
    const angle = (i / totalRays) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    let found = false;
    for (let r = maxR; r > 15; r -= 2) {
      const px = Math.floor(cx + r * cos);
      const py = Math.floor(cy + r * sin);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4;
        // Check for dark outline (luminance < 120)
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 120) {
          rawPoints.push([px, py]);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      // Default boundary fallback point
      const fallbackR = maxR * 0.7;
      rawPoints.push([cx + fallbackR * cos, cy + fallbackR * sin]);
    }
  }

  return subsamplePoints(rawPoints, cx, cy, dotCount);
}

/**
 * Equidistantly samples points and calculates anti-collision outward label offsets.
 */
function subsamplePoints(
  points: [number, number][],
  cx: number,
  cy: number,
  dotCount: number
): DotPoint[] {
  const result: DotPoint[] = [];
  const step = Math.max(1, Math.floor(points.length / dotCount));

  for (let i = 0; i < dotCount; i++) {
    const idx = Math.min((i * step) % points.length, points.length - 1);
    const [x, y] = points[idx];

    // Outward normal vector calculation for label positioning
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const labelOffsetX = Math.round((dx / len) * 16);
    const labelOffsetY = Math.round((dy / len) * 16);

    result.push({
      x: Math.round(x),
      y: Math.round(y),
      number: i + 1,
      labelOffsetX,
      labelOffsetY,
    });
  }

  return result;
}
