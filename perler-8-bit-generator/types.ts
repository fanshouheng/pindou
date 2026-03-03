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

// 1:1 Pixel Mapping Mode Options
export interface PixelModeOptions {
  enabled: boolean;       // 是否启用像素原图模式
  lockWidth: boolean;     // 是否锁定宽度为原图的整数倍
  scaleMultiplier: number; // 整数倍 (1, 2, 3, 4...)
}

// 颜色限制模式
export type ColorLimitMode = 'none' | 'basic' | 'warm' | 'cool' | 'earth' | 'pastel' | 'vintage' | 'custom';

export interface ColorLimit {
  mode: ColorLimitMode;
  beadIds: string[];  // 允许使用的颜色 ID 列表
}