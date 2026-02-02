/**
 * 拼豆颜色数据
 * 数据来源: 
 *   - Dolkow/perler GitHub 项目 (Perler, Hama, Nabbi)
 *   - Zippland/perler-beads GitHub 项目 (MARD, COCO, 漫漫, 盼盼, 咪小窝)
 * 包含品牌: Perler, Hama, Nabbi, MARD (国内品牌)
 */

// 国内品牌颜色数据 (直接包含以避免循环依赖)
export const MARD_COLORS = [
  { id: "A01", name: "奶油黄", hex: "#FAF4C8", r: 250, g: 244, b: 200, brand: "MARD" },
  { id: "A02", name: "浅黄", hex: "#FFFFD5", r: 255, g: 255, b: 213, brand: "MARD" },
  { id: "A03", name: "柠檬黄", hex: "#FEFF8B", r: 254, g: 255, b: 139, brand: "MARD" },
  { id: "A04", name: "黄色", hex: "#FBED56", r: 251, g: 237, b: 86, brand: "MARD" },
  { id: "A05", name: "金黄", hex: "#F4D738", r: 244, g: 215, b: 56, brand: "MARD" },
  { id: "H07", name: "黑", hex: "#000000", r: 0, g: 0, b: 0, brand: "MARD" },
  { id: "H02", name: "白", hex: "#FEFFFF", r: 254, g: 255, b: 255, brand: "MARD" }
];

// 多品牌色号对照表 (部分常用颜色)
export const COLOR_MAPPING = {
  "#FAF4C8": { "MARD": "A01", "COCO": "E02", "漫漫": "E2", "盼盼": "65", "咪小窝": "77" },
  "#FFFFD5": { "MARD": "A02", "COCO": "E01", "漫漫": "B1", "盼盼": "2", "咪小窝": "2" },
  "#FEFF8B": { "MARD": "A03", "COCO": "E05", "漫漫": "B2", "盼盼": "28", "咪小窝": "28" },
  "#FBED56": { "MARD": "A04", "COCO": "E07", "漫漫": "B3", "盼盼": "3", "咪小窝": "3" },
  "#F4D738": { "MARD": "A05", "COCO": "D03", "漫漫": "B4", "盼盼": "74", "咪小窝": "79" },
  "#000000": { "MARD": "H07", "COCO": "B09", "漫漫": "F7", "盼盼": "14", "咪小窝": "14" },
  "#FEFFFF": { "MARD": "H02", "COCO": "A01", "漫漫": "F2", "盼盼": "1", "咪小窝": "1" }
};

// Perler 品牌颜色 (40色)
export const PERLER_COLORS = [
  { id: "P1", name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255, brand: "Perler" },
  { id: "P2", name: "Cream", hex: "#FFF0CD", r: 255, g: 240, b: 205, brand: "Perler" },
  { id: "P3", name: "Yellow", hex: "#FFDC3C", r: 255, g: 220, b: 60, brand: "Perler" },
  { id: "P4", name: "Orange", hex: "#F5735A", r: 245, g: 115, b: 90, brand: "Perler" },
  { id: "P5", name: "Red", hex: "#DC5A4B", r: 220, g: 90, b: 75, brand: "Perler" },
  { id: "P7", name: "Purple", hex: "#785AA0", r: 120, g: 90, b: 160, brand: "Perler" },
  { id: "P8", name: "Dark Blue", hex: "#0F5FA0", r: 15, g: 95, b: 160, brand: "Perler" },
  { id: "P9", name: "Light Blue", hex: "#329BD2", r: 50, g: 155, b: 210, brand: "Perler" },
  { id: "P10", name: "Dark Green", hex: "#5F964B", r: 95, g: 150, b: 75, brand: "Perler" },
  { id: "P11", name: "Light Green", hex: "#6ED70F", r: 110, g: 215, b: 15, brand: "Perler" },
  { id: "P12", name: "Brown", hex: "#7D5041", r: 125, g: 80, b: 65, brand: "Perler" },
  { id: "P17", name: "Grey", hex: "#9B96A0", r: 155, g: 150, b: 160, brand: "Perler" },
  { id: "P18", name: "Black", hex: "#000000", r: 0, g: 0, b: 0, brand: "Perler" },
  { id: "P20", name: "Rust", hex: "#AA4646", r: 170, g: 70, b: 70, brand: "Perler" },
  { id: "P21", name: "Light Brown", hex: "#A06450", r: 160, g: 100, b: 80, brand: "Perler" },
  { id: "P33", name: "Peach", hex: "#FFC3BE", r: 255, g: 195, b: 190, brand: "Perler" },
  { id: "P35", name: "Tan", hex: "#E1A596", r: 225, g: 165, b: 150, brand: "Perler" },
  { id: "P38", name: "Magenta", hex: "#C3829B", r: 195, g: 130, b: 155, brand: "Perler" },
  { id: "P52", name: "Pastel Blue", hex: "#69AFD7", r: 105, g: 175, b: 215, brand: "Perler" },
  { id: "P53", name: "Pastel Green", hex: "#9BE191", r: 155, g: 225, b: 145, brand: "Perler" },
  { id: "P54", name: "Pastel Lavender", hex: "#A096D2", r: 160, g: 150, b: 210, brand: "Perler" },
  { id: "P55", name: "Pastel Pink", hex: "#E19BCD", r: 225, g: 155, b: 205, brand: "Perler" },
  { id: "P56", name: "Pastel Yellow", hex: "#FFFA9B", r: 255, g: 250, b: 155, brand: "Perler" },
  { id: "P57", name: "Cheddar", hex: "#FFA055", r: 255, g: 160, b: 85, brand: "Perler" },
  { id: "P58", name: "Toothpaste", hex: "#B9EBEB", r: 185, g: 235, b: 235, brand: "Perler" },
  { id: "P59", name: "Hot Coral", hex: "#FA6E82", r: 250, g: 110, b: 130, brand: "Perler" },
  { id: "P60", name: "Plum", hex: "#BE64A5", r: 190, g: 100, b: 165, brand: "Perler" },
  { id: "P61", name: "Kiwi Lime", hex: "#96CD23", r: 150, g: 205, b: 35, brand: "Perler" },
  { id: "P62", name: "Turquoise", hex: "#6987B9", r: 105, g: 135, b: 185, brand: "Perler" },
  { id: "P63", name: "Blush", hex: "#FAAFB9", r: 250, g: 175, b: 185, brand: "Perler" },
  { id: "P64", name: "Bubble Gum", hex: "#F578A0", r: 245, g: 120, b: 160, brand: "Perler" },
  { id: "P65", name: "Pink", hex: "#E182AA", r: 225, g: 130, b: 170, brand: "Perler" },
  { id: "P70", name: "Periwinkle", hex: "#23B4E6", r: 35, g: 180, b: 230, brand: "Perler" },
  { id: "P79", name: "Light Pink", hex: "#F5D2F0", r: 245, g: 210, b: 240, brand: "Perler" },
  { id: "P80", name: "Bright Green", hex: "#87BE50", r: 135, g: 190, b: 80, brand: "Perler" },
  { id: "P88", name: "Raspberry", hex: "#E14B7D", r: 225, g: 75, b: 125, brand: "Perler" },
  { id: "P90", name: "Butterscotch", hex: "#F5965F", r: 245, g: 150, b: 95, brand: "Perler" },
  { id: "P91", name: "Parrot Green", hex: "#41B49B", r: 65, g: 180, b: 155, brand: "Perler" },
  { id: "P92", name: "Dark Grey", hex: "#645A5A", r: 100, g: 90, b: 90, brand: "Perler" }
];

// Hama 品牌颜色 (32色)
export const HAMA_COLORS = [
  { id: "H1", name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255, brand: "Hama" },
  { id: "H2", name: "Cream", hex: "#F7F4D6", r: 247, g: 244, b: 214, brand: "Hama" },
  { id: "H3", name: "Yellow", hex: "#F1DA1B", r: 241, g: 218, b: 27, brand: "Hama" },
  { id: "H4", name: "Orange", hex: "#E56C14", r: 229, g: 108, b: 20, brand: "Hama" },
  { id: "H5", name: "Red", hex: "#CB0A0A", r: 203, g: 10, b: 10, brand: "Hama" },
  { id: "H6", name: "Pink", hex: "#FFC4EF", r: 255, g: 196, b: 239, brand: "Hama" },
  { id: "H7", name: "Purple", hex: "#803DB8", r: 128, g: 61, b: 184, brand: "Hama" },
  { id: "H8", name: "Blue", hex: "#2E36A6", r: 46, g: 54, b: 166, brand: "Hama" },
  { id: "H9", name: "Light Blue", hex: "#4D57DC", r: 77, g: 87, b: 220, brand: "Hama" },
  { id: "H10", name: "Green", hex: "#207617", r: 32, g: 118, b: 23, brand: "Hama" },
  { id: "H11", name: "Light Green", hex: "#8EEAB1", r: 142, g: 234, b: 177, brand: "Hama" },
  { id: "H12", name: "Brown", hex: "#3F2E10", r: 63, g: 46, b: 16, brand: "Hama" },
  { id: "H17", name: "Grey", hex: "#959595", r: 149, g: 149, b: 149, brand: "Hama" },
  { id: "H18", name: "Black", hex: "#000000", r: 0, g: 0, b: 0, brand: "Hama" },
  { id: "H20", name: "Red Brown", hex: "#A44C2E", r: 164, g: 76, b: 46, brand: "Hama" },
  { id: "H21", name: "Light Brown", hex: "#B66D31", r: 182, g: 109, b: 49, brand: "Hama" },
  { id: "H22", name: "Dark Red", hex: "#850326", r: 133, g: 3, b: 38, brand: "Hama" },
  { id: "H23", name: "Ash", hex: "#464646", r: 70, g: 70, b: 70, brand: "Hama", note: "transparent" },
  { id: "H25", name: "Flesh", hex: "#F1D2C1", r: 241, g: 210, b: 193, brand: "Hama" },
  { id: "H27", name: "Beige", hex: "#EED4AA", r: 238, g: 212, b: 170, brand: "Hama" },
  { id: "H28", name: "Dark Green", hex: "#073D07", r: 7, g: 61, b: 7, brand: "Hama" },
  { id: "H29", name: "Raspberry", hex: "#B32460", r: 179, g: 36, b: 96, brand: "Hama" },
  { id: "H30", name: "Burgundy", hex: "#4F102B", r: 79, g: 16, b: 43, brand: "Hama" },
  { id: "H31", name: "Turquoise", hex: "#5D96B0", r: 93, g: 150, b: 176, brand: "Hama" },
  { id: "H32", name: "Fuchsia", hex: "#DC91CD", r: 220, g: 145, b: 205, brand: "Hama" },
  { id: "H43", name: "Pastel Yellow", hex: "#E8F446", r: 232, g: 244, b: 70, brand: "Hama" },
  { id: "H44", name: "Pastel Coral", hex: "#FB9B88", r: 251, g: 155, b: 136, brand: "Hama" },
  { id: "H45", name: "Pastel Purple", hex: "#AB88FB", r: 171, g: 136, b: 251, brand: "Hama" },
  { id: "H46", name: "Pastel Blue", hex: "#79C2FF", r: 121, g: 194, b: 255, brand: "Hama" },
  { id: "H47", name: "Pastel Green", hex: "#99FF67", r: 153, g: 255, b: 103, brand: "Hama" },
  { id: "H48", name: "Pastel Pink", hex: "#D57DE2", r: 213, g: 125, b: 226, brand: "Hama" },
  { id: "H60", name: "Teddybear", hex: "#EDBD39", r: 237, g: 189, b: 57, brand: "Hama" }
];

// Nabbi 品牌颜色 (30色)
export const NABBI_COLORS = [
  { id: "N1", name: "Black", hex: "#000000", r: 0, g: 0, b: 0, brand: "Nabbi" },
  { id: "N2", name: "Dark Brown", hex: "#292521", r: 41, g: 37, b: 33, brand: "Nabbi" },
  { id: "N3", name: "Brown Medium", hex: "#31211A", r: 49, g: 33, b: 26, brand: "Nabbi" },
  { id: "N4", name: "Wine Red", hex: "#5B1B2E", r: 91, g: 27, b: 46, brand: "Nabbi" },
  { id: "N5", name: "Butterscotch", hex: "#A7652A", r: 167, g: 101, b: 42, brand: "Nabbi" },
  { id: "N6", name: "Beige", hex: "#A89886", r: 168, g: 152, b: 134, brand: "Nabbi" },
  { id: "N7", name: "Skin", hex: "#E5C28D", r: 229, g: 194, b: 141, brand: "Nabbi" },
  { id: "N8", name: "Ash Grey", hex: "#8A8C85", r: 138, g: 140, b: 133, brand: "Nabbi" },
  { id: "N9", name: "Dark Green", hex: "#1A3524", r: 26, g: 53, b: 36, brand: "Nabbi" },
  { id: "N10", name: "Light Grey", hex: "#BDBDBD", r: 189, g: 189, b: 189, brand: "Nabbi" },
  { id: "N11", name: "Purple", hex: "#402195", r: 64, g: 33, b: 149, brand: "Nabbi" },
  { id: "N12", name: "Ivory", hex: "#EEE3D7", r: 238, g: 227, b: 215, brand: "Nabbi" },
  { id: "N13", name: "Clear Orange", hex: "#E55133", r: 229, g: 81, b: 51, brand: "Nabbi" },
  { id: "N14", name: "Yellow", hex: "#FBDD45", r: 251, g: 221, b: 69, brand: "Nabbi" },
  { id: "N15", name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255, brand: "Nabbi" },
  { id: "N16", name: "Green", hex: "#267731", r: 38, g: 119, b: 49, brand: "Nabbi" },
  { id: "N17", name: "Blue", hex: "#335ACD", r: 51, g: 90, b: 205, brand: "Nabbi" },
  { id: "N18", name: "Light Pink", hex: "#F0CCCB", r: 240, g: 204, b: 203, brand: "Nabbi" },
  { id: "N19", name: "Light Red", hex: "#BC242C", r: 188, g: 36, b: 44, brand: "Nabbi" },
  { id: "N20", name: "Light Brown", hex: "#B38E6A", r: 179, g: 142, b: 106, brand: "Nabbi" },
  { id: "N21", name: "Light Yellow", hex: "#FBF8A9", r: 251, g: 248, b: 169, brand: "Nabbi" },
  { id: "N22", name: "Pearl Green", hex: "#43B536", r: 67, g: 181, b: 54, brand: "Nabbi" },
  { id: "N23", name: "Pastel Blue", hex: "#7AA6FC", r: 122, g: 166, b: 252, brand: "Nabbi" },
  { id: "N24", name: "Lilac", hex: "#BEACF6", r: 190, g: 172, b: 246, brand: "Nabbi" },
  { id: "N25", name: "Old Rose", hex: "#E25B9D", r: 226, g: 91, b: 157, brand: "Nabbi" },
  { id: "N26", name: "Light Orange", hex: "#F6B18A", r: 246, g: 177, b: 138, brand: "Nabbi" },
  { id: "N27", name: "Brown", hex: "#6C4336", r: 108, g: 67, b: 54, brand: "Nabbi" },
  { id: "N28", name: "Light Blue", hex: "#B9D2FE", r: 185, g: 210, b: 254, brand: "Nabbi" },
  { id: "N29", name: "Pearl Orange", hex: "#F69F3A", r: 246, g: 159, b: 58, brand: "Nabbi" },
  { id: "N30", name: "Olive", hex: "#CFD063", r: 207, g: 208, b: 99, brand: "Nabbi" }
];

// 所有颜色合并
export const ALL_COLORS = [
  ...PERLER_COLORS,
  ...HAMA_COLORS,
  ...NABBI_COLORS,
  ...MARD_COLORS
];

// 按品牌分组
export const COLORS_BY_BRAND = {
  Perler: PERLER_COLORS,
  Hama: HAMA_COLORS,
  Nabbi: NABBI_COLORS,
  MARD: MARD_COLORS
};

// 颜色数量统计
export const COLOR_STATS = {
  Perler: PERLER_COLORS.length,
  Hama: HAMA_COLORS.length,
  Nabbi: NABBI_COLORS.length,
  MARD: MARD_COLORS.length,
  total: ALL_COLORS.length
};

// COLOR_MAPPING 已在上方导出

// 辅助函数：根据ID获取颜色
export function getColorById(id) {
  return ALL_COLORS.find(color => color.id === id);
}

// 辅助函数：根据品牌获取颜色
export function getColorsByBrand(brand) {
  return COLORS_BY_BRAND[brand] || [];
}

// 辅助函数：RGB转Hex
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// 辅助函数：Hex转RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// 辅助函数：计算两个颜色之间的欧几里得距离
export function colorDistance(color1, color2) {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

// 辅助函数：找到最接近的颜色
export function findClosestColor(r, g, b, brand = null) {
  const colors = brand ? getColorsByBrand(brand) : ALL_COLORS;
  let closest = null;
  let minDistance = Infinity;
  
  for (const color of colors) {
    const distance = Math.sqrt(
      Math.pow(color.r - r, 2) +
      Math.pow(color.g - g, 2) +
      Math.pow(color.b - b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }
  
  return closest;
}

export default {
  PERLER_COLORS,
  HAMA_COLORS,
  NABBI_COLORS,
  MARD_COLORS,
  ALL_COLORS,
  COLORS_BY_BRAND,
  COLOR_STATS,
  COLOR_MAPPING,
  getColorById,
  getColorsByBrand,
  rgbToHex,
  hexToRgb,
  colorDistance,
  findClosestColor
};
