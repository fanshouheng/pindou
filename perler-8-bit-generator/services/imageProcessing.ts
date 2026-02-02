import { Bead, BeadGrid, RGB, MatchStrategy } from '../types';
import { BEAD_PALETTE } from '../constants';

// Simple Euclidean distance
const getColorDistance = (c1: RGB, c2: RGB): number => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
};

const findClosestBead = (r: number, g: number, b: number, palette: Bead[]): Bead => {
  let minDist = Infinity;
  let closest = palette[0];

  for (const bead of palette) {
    const dist = getColorDistance({ r, g, b }, bead.rgb);
    if (dist < minDist) {
      minDist = dist;
      closest = bead;
    }
  }
  return closest;
};

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const convertImageToGrid = (
  img: HTMLImageElement,
  targetWidth: number,
  brightnessMod: number,
  contrastMod: number,
  strategy: MatchStrategy = 'perceptual'
): BeadGrid => {
  const aspectRatio = img.height / img.width;
  const targetHeight = Math.round(targetWidth * aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Draw original image resized
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;
  const grid: BeadGrid = [];

  // Base Contrast factor (slider)
  const factor = (259 * (contrastMod + 255)) / (255 * (259 - contrastMod));

  for (let y = 0; y < targetHeight; y++) {
    const row: (Bead | null)[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      const a = data[i + 3];

      // Simple alpha check
      if (a < 128) {
        row.push(null);
        continue;
      }

      // 1. Apply User Brightness
      r += brightnessMod;
      g += brightnessMod;
      b += brightnessMod;

      // 2. Apply User Contrast
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      // 3. Strategy Adjustments
      if (strategy === 'contrast') {
        // High Contrast Mode: Increase saturation and push towards extremes
        // A simplified approach is to re-apply a strong contrast curve
        // Or separate channels further
        const aggressiveFactor = 1.5; // Boost contrast further
        r = aggressiveFactor * (r - 128) + 128;
        g = aggressiveFactor * (g - 128) + 128;
        b = aggressiveFactor * (b - 128) + 128;
      }

      // Clamp
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      const bead = findClosestBead(r, g, b, BEAD_PALETTE);
      row.push(bead);
    }
    grid.push(row);
  }
  return grid;
};

// Denoise Algorithm: Removes isolated pixels
export const cleanupGrid = (grid: BeadGrid): BeadGrid => {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;
  
  // Clone grid to avoid mutating while reading
  const newGrid = grid.map(row => [...row]);
  
  const directions = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const current = grid[y][x];
      if (!current) continue;

      // Count neighbors with same color
      let sameColorNeighbors = 0;
      const neighborColors: Record<string, { count: number, bead: Bead }> = {};

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighbor = grid[ny][nx];
          if (neighbor) {
            if (neighbor.id === current.id) {
              sameColorNeighbors++;
            }
            // Track frequency of neighbor colors
            if (!neighborColors[neighbor.id]) {
                neighborColors[neighbor.id] = { count: 0, bead: neighbor };
            }
            neighborColors[neighbor.id].count++;
          }
        }
      }

      // If isolated (0 neighbors of same color), replace with most frequent neighbor
      if (sameColorNeighbors === 0) {
         let maxCount = 0;
         let bestReplacement = current;
         
         Object.values(neighborColors).forEach(({ count, bead }) => {
            if (count > maxCount) {
                maxCount = count;
                bestReplacement = bead;
            }
         });
         
         // Only replace if we found neighbors, otherwise keep it (island of 1)
         if (maxCount > 0) {
            newGrid[y][x] = bestReplacement;
         }
      }
    }
  }
  
  return newGrid;
};