// 测试 296 色 MARD 拼豆颜色库
// 运行: node test-colors.mjs

import { BEAD_PALETTE, COLOR_CATEGORIES, COLOR_MAPPING, findBeadById, getMultiBrandCodes } from './constants.ts';

console.log('=== 296色MARD拼豆颜色库验证 ===\n');

// 统计信息
console.log('📊 总颜色数:', BEAD_PALETTE.length);
console.log('');

// 分类统计
console.log('🎨 颜色分类统计:');
const categories = [
  ['A系列(黄色/橙色)', COLOR_CATEGORIES.yellow],
  ['B系列(绿色)', COLOR_CATEGORIES.green],
  ['C系列(蓝色)', COLOR_CATEGORIES.blue],
  ['D系列(紫色)', COLOR_CATEGORIES.purple],
  ['E系列(粉色)', COLOR_CATEGORIES.pink],
  ['F系列(红色)', COLOR_CATEGORIES.red],
  ['G系列(肤色/棕色)', COLOR_CATEGORIES.skin],
  ['H系列(黑白灰)', COLOR_CATEGORIES.gray],
  ['M系列(复古色)', COLOR_CATEGORIES.retro],
  ['P系列(珠光色)', COLOR_CATEGORIES.pearl],
  ['Q系列(夜光色)', COLOR_CATEGORIES.glow],
  ['R系列(透明/果冻)', COLOR_CATEGORIES.clear],
  ['T系列(透明白)', COLOR_CATEGORIES.transparent],
  ['Y系列(荧光色)', COLOR_CATEGORIES.neon],
  ['ZG系列(复古色)', COLOR_CATEGORIES.vintage]
];

categories.forEach(([name, colors]) => {
  console.log(`  ${name}: ${colors.length} 色`);
});

// 验证总数
const totalFromCategories = categories.reduce((sum, [, colors]) => sum + colors.length, 0);
console.log(`\n  分类总计: ${totalFromCategories} 色`);
console.log(`  数据验证: ${totalFromCategories === BEAD_PALETTE.length ? '✅ 通过' : '❌ 不匹配'}`);

// 多品牌对照表
console.log('\n🔗 多品牌色号对照表:', Object.keys(COLOR_MAPPING).length, '种颜色');

// 示例颜色
console.log('\n💡 示例颜色:');
const samples = ['A01', 'B01', 'C01', 'H07', 'H02', 'P01'];
samples.forEach(id => {
  const bead = findBeadById(id);
  if (bead) {
    console.log(`  ${id}: ${bead.name} ${bead.hex} RGB(${bead.rgb.r},${bead.rgb.g},${bead.rgb.b})`);
  }
});

// 多品牌对照示例
console.log('\n🌐 多品牌对照示例:');
const testHexes = ['#FAF4C8', '#000000', '#FEFFFF'];
testHexes.forEach(hex => {
  const mapping = getMultiBrandCodes(hex);
  if (mapping) {
    console.log(`  ${hex}: MARD=${mapping.MARD}, COCO=${mapping.COCO}, 漫漫=${mapping['漫漫']}, 盼盼=${mapping['盼盼']}, 咪小窝=${mapping['咪小窝']}`);
  }
});

console.log('\n✨ 验证完成！296色MARD拼豆颜色库已成功加载。');
