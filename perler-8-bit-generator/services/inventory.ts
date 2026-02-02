import { Bead } from './types';

// 豆子库存条目
export interface InventoryItem {
  id: string;       // 色号ID
  count: number;    // 剩余数量
  brand: string;    // 品牌
  lastUpdated: string; // 最后更新时间
}

// 消耗历史记录
export interface ConsumptionRecord {
  id: string;
  patternName: string;
  date: string;
  consumed: { id: string; count: number }[];
}

// MARD 色盘数据
export const MARD_TRAYS: Record<string, string[]> = {
  "1": ["B3", "B5", "B8", "H1", "C3", "C5", "C8", "H2", "D9", "D6", "D7", "H3", "E2", "E4", "F5", "H4", "G1", "G5", "G7", "H5", "A4", "A6", "A7", "H7"],
  "2": ["C2", "C10", "C11", "B12", "C13", "C6", "C7", "D3", "D19", "D18", "D21", "D15", "E8", "E3", "D13", "E7", "A13", "A10", "F13", "F8", "A11", "G9", "G13", "G8"],
  "3": ["A3", "B18", "B14", "B17", "B20", "B10", "B19", "B7", "D16", "D11", "D2", "C16", "D8", "D12", "D20", "D14", "E1", "E12", "E5", "E13", "G2", "G3", "F10", "F7"],
  "4": ["E11", "E15", "E9", "D5", "E14", "F14", "E6", "E10", "F1", "F9", "F12", "F4", "A14", "F2", "F3", "F6", "M6", "G14", "F11", "G17", "M5", "M9", "M12", "H6"],
  "5": ["A15", "A1", "H12", "C14", "A5", "B13", "C1", "D17", "A8", "B1", "B16", "D1", "A12", "B2", "B6", "C4", "A9", "B4", "C15", "C17", "G6", "B11", "B15", "C9"],
  "A": ["B10", "B6", "C15", "B19", "C2", "C4", "C11", "B7", "C3", "C10", "C5", "C8", "C13", "C17", "C6", "C9", "D16", "D1", "C7", "D3", "D17", "D11", "D2", "C16"],
  "B": ["E12", "E6", "E5", "E7", "E2", "E4", "E10", "E13", "E8", "E3", "D5", "D21", "D19", "E9", "D13", "D14", "D8", "D12", "D20", "D7", "D9", "D6", "D18", "D15"],
  "C": ["C14", "B3", "B5", "B15", "B20", "B16", "B4", "B12", "C1", "B13", "B2", "B8", "B18", "B1", "B14", "B17", "M5", "G13", "G7", "B11", "M6", "F10", "F11", "G8"],
  "D": ["A15", "A4", "A5", "A8", "A3", "A13", "A10", "A14", "A11", "A6", "A7", "F4", "A9", "F1", "F13", "F5", "F14", "F2", "F9", "F8", "F12", "F3", "F6", "F7"],
  "E": ["E15", "A12", "G6", "G14", "E1", "G3", "G5", "M12", "E14", "G2", "G9", "G17", "E11", "G1", "G13", "H5", "H2", "A1", "H3", "H6", "H1", "H12", "H4", "H7"],
  "6": ["H8", "G15", "A2", "H13", "G16", "H9", "H10", "M1", "G11", "G4", "M4", "H14", "M10", "M2", "G12", "M13", "M7", "H11", "M11", "M3", "G10", "M14", "M8", "M15"],
  "7": ["P18", "P16", "P3", "P12", "P1", "T1", "P7", "P17", "P6", "P13", "P9", "P11", "P4", "P5", "P15", "P14", "P2", "R12", "P23", "P22", "P21", "P20", "P19", "P8"],
  "8": ["P10", "R11", "Y2", "Y3", "Q2", "Y4", "Y5", "Y1", "R3", "R4", "R5", "R8", "R9", "R2", "R1", "R10", "R6", "R7", "D10", "R13", "Q5", "B9", "C12", "D4"],
  "9": ["H17", "H18", "H19", "E16", "F16", "F17", "D23", "E24", "E19", "E18", "E17", "E20", "B24", "A16", "A17", "A18", "F24", "F23", "A24", "A22", "A21", "F21", "F22", "A19"],
  "10": ["A26", "A25", "A20", "A23", "G18", "H21", "B26", "B32", "B31", "B30", "B27", "B29", "C22", "C23", "C24", "B28", "C25", "C27", "H15", "H20", "H23", "H22", "C20", "C21"],
  "11": ["F15", "F19", "G20", "E21", "E22", "D26", "F25", "F20", "G19", "F18", "G21", "E23", "D25", "D22", "D24", "C20", "B21", "B25", "H16", "B23", "C18", "B22", "C19", "C26"]
};

// 套装配置
export const MARD_SETS: Record<number, string[]> = {
  24: ["1"],
  48: ["1", "2"],
  72: ["1", "2", "3"],
  96: ["1", "2", "3", "4"],
  120: ["A", "B", "C", "D", "E"],
  144: ["A", "B", "C", "D", "E", "6"],
  216: ["A", "B", "C", "D", "E", "6", "9", "10", "11"],
  264: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
};

// 存储 key
const INVENTORY_KEY = 'xiaofeigou_inventory';
const HISTORY_KEY = 'xiaofeigou_history';
const DEFAULT_COUNT = 1000;

// 获取库存
export function getInventory(): InventoryItem[] {
  try {
    const data = localStorage.getItem(INVENTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存库存
function saveInventory(inventory: InventoryItem[]) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

// 获取消耗历史
export function getHistory(): ConsumptionRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存消耗历史
function saveHistory(history: ConsumptionRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// 获取库存数量
export function getInventoryCount(id: string): number {
  const inventory = getInventory();
  const item = inventory.find(i => i.id === id);
  return item ? item.count : 0;
}

// 检查库存是否充足
export function isStockSufficient(id: string, needed: number): boolean {
  return getInventoryCount(id) >= needed;
}

// 更新库存数量
export function updateInventory(id: string, count: number, brand: string = 'MARD') {
  const inventory = getInventory();
  const index = inventory.findIndex(i => i.id === id);

  const now = new Date().toISOString();

  if (index >= 0) {
    inventory[index] = {
      ...inventory[index],
      count,
      lastUpdated: now
    };
  } else {
    inventory.push({
      id,
      count,
      brand,
      lastUpdated: now
    });
  }

  saveInventory(inventory);
  return inventory;
}

// 增加库存
export function addInventory(id: string, amount: number, brand: string = 'MARD') {
  const current = getInventoryCount(id);
  return updateInventory(id, current + amount, brand);
}

// 减少库存
export function deductInventory(id: string, amount: number): boolean {
  const current = getInventoryCount(id);
  if (current < amount) {
    return false; // 库存不足
  }
  return updateInventory(id, current - amount) !== null;
}

// 导入套装
export function importTraySet(count: number) {
  const targetSets = MARD_SETS[count];
  if (!targetSets) {
    console.warn(`未找到 ${count} 色的套装配置`);
    return;
  }

  let imported = 0;
  targetSets.forEach(setID => {
    const colors = MARD_TRAYS[setID];
    if (colors) {
      colors.forEach(colorID => {
        updateInventory(colorID, DEFAULT_COUNT, 'MARD');
        imported++;
      });
    }
  });

  return imported;
}

// 从 BOM 消耗库存
export function consumeFromBOM(bom: { id: string; count: number }[], patternName: string): { success: boolean; missing: string[] } {
  const inventory = getInventory();
  const missing: string[] = [];

  // 检查是否所有色号都足够
  bom.forEach(item => {
    if (!isStockSufficient(item.id, item.count)) {
      missing.push(item.id);
    }
  });

  if (missing.length > 0) {
    return { success: false, missing };
  }

  // 扣除库存
  bom.forEach(item => {
    deductInventory(item.id, item.count);
  });

  // 记录历史
  const history = getHistory();
  const record: ConsumptionRecord = {
    id: Date.now().toString(),
    patternName,
    date: new Date().toISOString(),
    consumed: bom.map(item => ({ id: item.id, count: item.count }))
  };

  history.unshift(record);
  // 只保留最近 50 条记录
  if (history.length > 50) {
    history.splice(50);
  }

  saveHistory(history);

  return { success: true, missing: [] };
}

// 清空库存
export function clearInventory() {
  localStorage.removeItem(INVENTORY_KEY);
}

// 清空历史
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// 获取库存统计
export function getInventoryStats() {
  const inventory = getInventory();
  const totalColors = inventory.length;
  const totalBeads = inventory.reduce((sum, item) => sum + item.count, 0);
  const lowStock = inventory.filter(item => item.count < 100).length;
  const outOfStock = inventory.filter(item => item.count === 0).length;

  return {
    totalColors,
    totalBeads,
    lowStock,
    outOfStock
  };
}
