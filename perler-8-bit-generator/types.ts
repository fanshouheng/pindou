export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Bead {
  id: string;
  name: string;
  hex: string;
  rgb: RGB;
}

export type BeadGrid = (Bead | null)[][];

export enum ToolMode {
  WAND = 'WAND'      // Global Remove/Transparent
}

export type MatchStrategy = 'perceptual' | 'contrast';

export interface ProcessingOptions {
  width: number;
  brightness: number;
  contrast: number;
  strategy: MatchStrategy;
}

export interface ExportOptions {
  showGrid: boolean;
  showLabels: boolean;
  style: 'pixel' | 'realistic';
  scale: number;
}