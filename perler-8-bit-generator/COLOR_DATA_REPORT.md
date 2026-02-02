# 296色MARD拼豆颜色库整合报告

## 数据来源
- **原始项目**: Zippland/perler-beads (GitHub)
- **颜色数量**: 296色
- **品牌**: MARD (国内主流拼豆品牌)

## 颜色分类统计

| 系列 | 颜色数 | 说明 |
|------|--------|------|
| A系列 | 26色 | 黄色/橙色 |
| B系列 | 32色 | 绿色 |
| C系列 | 29色 | 蓝色 |
| D系列 | 26色 | 紫色 |
| E系列 | 24色 | 粉色 |
| F系列 | 25色 | 红色 |
| G系列 | 21色 | 肤色/棕色 |
| H系列 | 23色 | 黑白灰 |
| M系列 | 15色 | 复古/大地色 |
| P系列 | 23色 | 珠光色 |
| Q系列 | 5色 | 夜光色 |
| R系列 | 28色 | 透明/果冻色 |
| T系列 | 1色 | 透明白 |
| Y系列 | 5色 | 荧光色 |
| ZG系列 | 8色 | 复古色 |
| **总计** | **296色** | - |

## 多品牌色号对照

支持5个品牌的色号对照：
- **MARD**: A01-ZG8
- **COCO**: A01-GB8  
- **漫漫**: 字母+数字编号
- **盼盼**: 数字编号
- **咪小窝**: 数字编号

## 新增功能

### 1. 颜色分类对象 (COLOR_CATEGORIES)
```typescript
COLOR_CATEGORIES.yellow    // A系列 - 黄色/橙色 (26色)
COLOR_CATEGORIES.green     // B系列 - 绿色 (32色)
COLOR_CATEGORIES.blue      // C系列 - 蓝色 (29色)
COLOR_CATEGORIES.purple    // D系列 - 紫色 (26色)
COLOR_CATEGORIES.pink      // E系列 - 粉色 (24色)
COLOR_CATEGORIES.red       // F系列 - 红色 (25色)
COLOR_CATEGORIES.skin      // G系列 - 肤色/棕色 (21色)
COLOR_CATEGORIES.gray      // H系列 - 黑白灰 (23色)
COLOR_CATEGORIES.retro     // M系列 - 复古色 (15色)
COLOR_CATEGORIES.pearl     // P系列 - 珠光色 (23色)
COLOR_CATEGORIES.glow      // Q系列 - 夜光色 (5色)
COLOR_CATEGORIES.clear     // R系列 - 透明/果冻 (28色)
COLOR_CATEGORIES.transparent // T系列 - 透明白 (1色)
COLOR_CATEGORIES.neon      // Y系列 - 荧光色 (5色)
COLOR_CATEGORIES.vintage   // ZG系列 - 复古色 (8色)
```

### 2. 多品牌色号对照表 (COLOR_MAPPING)
```typescript
COLOR_MAPPING['#FAF4C8']   // { MARD: 'A01', COCO: 'E02', 漫漫: 'E2', 盼盼: '65', 咪小窝: '77' }
COLOR_MAPPING['#000000']   // { MARD: 'H07', COCO: 'B09', 漫漫: 'F7', 盼盼: '14', 咪小窝: '14' }
```

### 3. 辅助函数
```typescript
findBeadById(id: string)           // 根据ID查找颜色
findBeadByHex(hex: string)         // 根据Hex查找颜色
getMultiBrandCodes(hex: string)    // 获取多品牌色号对照
```

## 项目运行状态

✅ **构建成功**: vite build 完成
✅ **颜色数据**: 296色已打包到生产环境
✅ **预览服务**: http://localhost:4173

## 与原项目对比

| 项目 | 原有 | 现在 |
|------|------|------|
| 颜色数量 | 31色 | **296色** (+855%) |
| 品牌支持 | Perler | **MARD + 多品牌对照** |
| 颜色名称 | 英文 | **中文** |
| 颜色分类 | 无 | **15个分类** |
| 色号对照 | 无 | **5品牌对照** |

## 使用方式

```typescript
import { 
  BEAD_PALETTE,      // 296色完整色板
  COLOR_CATEGORIES,  // 颜色分类
  COLOR_MAPPING,     // 多品牌对照
  findBeadById,      // 查找函数
  getMultiBrandCodes // 获取多品牌色号
} from './constants';

// 使用示例
const bead = findBeadById('A01');           // 奶油黄 #FAF4C8
const mapping = getMultiBrandCodes('#FAF4C8'); // 获取所有品牌色号
```

---
*报告生成时间: 2025-01-30*
*数据来源: Zippland/perler-beads GitHub项目*
