import { Bead, BeadGrid, RGB, MatchStrategy, ColorLimit, PixelModeOptions } from '../types';
import { BEAD_PALETTE } from '../constants';

// ============================================
// CIELAB Color Space Conversion (D65 Illuminant)
// ============================================

interface Lab {
  l: number;
  a: number;
  b: number;
}

// Convert sRGB to XYZ (D65 illuminant)
function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;

  // Gamma correction (sRGB)
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  rr *= 100;
  gg *= 100;
  bb *= 100;

  const x = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375;
  const y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750;
  const z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041;

  return { x, y, z };
}

// Convert XYZ to Lab (D65 illuminant)
function xyzToLab(x: number, y: number, z: number): Lab {
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let xx = x / refX;
  let yy = y / refY;
  let zz = z / refZ;

  const f = (t: number) =>
    t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t) + 16 / 116;

  xx = f(xx);
  yy = f(yy);
  zz = f(zz);

  const l = 116 * yy - 16;
  const a = 500 * (xx - yy);
  const bVal = 200 * (yy - zz);

  return { l: l, a: a, b: bVal };
}

function rgbToLab(r: number, g: number, b: number): Lab {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

// ============================================
// Delta E 2000 (CIEDE2000) Formula
// ============================================

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function deltaE2000(lab1: Lab, lab2: Lab): number {
  const kL = 1;
  const kC = 1;
  const kH = 1;

  const L1 = lab1.l;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.l;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cb = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = radiansToDegrees(Math.atan2(b1, a1p));
  if (h1p < 0) h1p += 360;

  let h2p = radiansToDegrees(Math.atan2(b2, a2p));
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(degreesToRadians(dhp / 2));

  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let Hp: number;
  if (C1p * C2p === 0) {
    Hp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    Hp = (h1p + h2p + 360) / 2;
  } else {
    Hp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(degreesToRadians(Hp - 30)) +
    0.24 * Math.cos(degreesToRadians(2 * Hp)) +
    0.32 * Math.cos(degreesToRadians(3 * Hp + 6)) -
    0.2 * Math.cos(degreesToRadians(4 * Hp - 63));

  const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const RT = -Math.sin(degreesToRadians(2 * dTheta)) * RC;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

// ============================================
// Pre-computed Lab values for palette
// ============================================

const labCache: Map<string, Lab> = new Map();
const BLACK_BEAD_ID = 'H07'; // 黑色珠子 ID

function getLabForBead(bead: Bead): Lab {
  const cached = labCache.get(bead.id);
  if (cached) return cached;
  const lab = rgbToLab(bead.rgb.r, bead.rgb.g, bead.rgb.b);
  labCache.set(bead.id, lab);
  return lab;
}

// ============================================
// Calculate luminance
// ============================================

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// ============================================
// Enhanced Color Matching with Black Outline Detection
// ============================================

const findClosestBead = (
  r: number, 
  g: number, 
  b: number, 
  palette: Bead[], 
  allowedIds?: Set<string>,
  neighborLuminance?: number
): Bead => {
  const sourceLab = rgbToLab(r, g, b);
  const luminance = getLuminance(r, g, b);
  
  let minDist = Infinity;
  let closest = palette[0];

  // ============================================
  // Black Outline Enhancement (强化黑色轮廓)
  // ============================================
  const isDark = luminance < 40;
  const isEdge = neighborLuminance !== undefined && neighborLuminance > luminance + 50;
  
  if (isDark && isEdge) {
    const blackBead = palette.find(b => b.id === BLACK_BEAD_ID);
    if (blackBead) {
      const blackLab = getLabForBead(blackBead);
      const distToBlack = deltaE2000(sourceLab, blackLab);
      if (distToBlack < 35) {
        return blackBead;
      }
    }
  }

  // Standard Delta E 2000 matching
  for (const bead of palette) {
    if (allowedIds && !allowedIds.has(bead.id)) {
      continue;
    }
    const beadLab = getLabForBead(bead);
    const dist = deltaE2000(sourceLab, beadLab);
    if (dist < minDist) {
      minDist = dist;
      closest = bead;
    }
  }
  return closest;
};

// ============================================
// Image Loading
// ============================================

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// ============================================
// Image to Grid Conversion
// ============================================

export const convertImageToGrid = (
  img: HTMLImageElement,
  targetWidth: number,
  brightnessMod: number,
  contrastMod: number,
  strategy: MatchStrategy = 'perceptual',
  colorLimit?: ColorLimit,
  pixelMode?: PixelModeOptions
): BeadGrid => {
  let allowedBeadIds: Set<string> | undefined;
  let limitedPalette = BEAD_PALETTE;
  
  if (colorLimit && colorLimit.mode !== 'none' && colorLimit.beadIds.length > 0) {
    allowedBeadIds = new Set(colorLimit.beadIds);
    limitedPalette = BEAD_PALETTE.filter(b => allowedBeadIds!.has(b.id));
  }

  // ============================================
  // 1:1 Pixel Mapping Mode (像素原图模式)
  // ============================================
  let targetHeight: number;

  if (pixelMode && pixelMode.enabled) {
    const multiplier = pixelMode.scaleMultiplier || 1;
    const finalWidth = pixelMode.lockWidth 
      ? img.width * multiplier 
      : targetWidth;
    targetHeight = Math.round(finalWidth * (img.height / img.width));
  } else {
    targetHeight = Math.round(targetWidth * (img.height / img.width));
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // ============================================
  // Nearest Neighbor Sampling (邻近取样)
  // ============================================
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'low';

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;
  const grid: BeadGrid = [];

  const factor = (259 * (contrastMod + 255)) / (255 * (259 - contrastMod));

  // Pre-fetch neighbor luminances for edge detection
  const luminanceMap: number[][] = [];
  for (let y = 0; y < targetHeight; y++) {
    const row: number[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      row.push(getLuminance(data[i], data[i + 1], data[i + 2]));
    }
    luminanceMap.push(row);
  }

  for (let y = 0; y < targetHeight; y++) {
    const row: (Bead | null)[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) {
        row.push(null);
        continue;
      }

      // Apply brightness
      r += brightnessMod;
      g += brightnessMod;
      b += brightnessMod;

      // Apply contrast
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      if (strategy === 'contrast') {
        const aggressiveFactor = 1.5;
        r = aggressiveFactor * (r - 128) + 128;
        g = aggressiveFactor * (g - 128) + 128;
        b = aggressiveFactor * (b - 128) + 128;
      }

      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      // Calculate average neighbor luminance for edge detection
      let neighborLumSum = 0;
      let neighborCount = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < targetWidth && ny >= 0 && ny < targetHeight) {
            neighborLumSum += luminanceMap[ny][nx];
            neighborCount++;
          }
        }
      }
      const avgNeighborLum = neighborCount > 0 ? neighborLumSum / neighborCount : luminanceMap[y][x];

      const bead = findClosestBead(r, g, b, limitedPalette, allowedBeadIds, avgNeighborLum);
      row.push(bead);
    }
    grid.push(row);
  }
  return grid;
};

// ============================================
// Enhanced Denoise (去噪增强)
// ============================================

export const cleanupGrid = (grid: BeadGrid, passes: number = 3): BeadGrid => {
  let newGrid = grid.map(row => [...row]);
  
  const directions = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ];

  // Multiple passes for better denoising
  for (let pass = 0; pass < passes; pass++) {
    const height = newGrid.length;
    if (height === 0) break;
    const width = newGrid[0].length;
    
    const passGrid = newGrid.map(row => [...row]);
    let hasChanges = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const current = passGrid[y][x];
        if (!current) continue;

        let sameColorNeighbors = 0;
        const neighborColors: Record<string, { count: number; bead: Bead }> = {};

        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const neighbor = passGrid[ny][nx];
            if (neighbor) {
              if (neighbor.id === current.id) {
                sameColorNeighbors++;
              }
              if (!neighborColors[neighbor.id]) {
                neighborColors[neighbor.id] = { count: 0, bead: neighbor };
              }
              neighborColors[neighbor.id].count++;
            }
          }
        }

        // Enhanced: If same-color neighbors < 2, consider it noise
        if (sameColorNeighbors < 2 && Object.keys(neighborColors).length > 0) {
          let maxCount = 0;
          let bestReplacement = current;
          
          Object.values(neighborColors).forEach(({ count, bead }) => {
            if (count > maxCount) {
              maxCount = count;
              bestReplacement = bead;
            }
          });
          
          if (maxCount > 0) {
            newGrid[y][x] = bestReplacement;
            hasChanges = true;
          }
        }
      }
    }

    if (!hasChanges) break;
  }
  
  return newGrid;
};
