import React, { useState, useMemo, useEffect } from 'react';
import { Bead, BeadGrid } from '../types';
import { Theme } from '../locales';
import {
  getInventory,
  getHistory,
  getInventoryCount,
  updateInventory,
  addInventory,
  importTraySet,
  consumeFromBOM,
  clearInventory,
  getInventoryStats,
  InventoryItem,
  ConsumptionRecord
} from '../services/inventory';

interface InventoryPanelProps {
  grid: BeadGrid;
  selectedBead: Bead;
  t: any;
  theme: Theme;
  onConsume: (patternName: string) => void;
  patternName: string;
  onPatternNameChange: (name: string) => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  grid,
  selectedBead,
  t,
  theme,
  onConsume,
  patternName,
  onPatternNameChange
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<ConsumptionRecord[]>([]);
  const [stats, setStats] = useState({ totalColors: 0, totalBeads: 0, lowStock: 0, outOfStock: 0 });
  const [activeTab, setActiveTab] = useState<'inventory' | 'import' | 'history'>('import');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConsuming, setIsConsuming] = useState(false);
  const [consumeResult, setConsumeResult] = useState<{ success: boolean; missing: string[] } | null>(null);

  // 统一按钮样式（与 Sidebar 一致）
  const buttonGray = theme === 'dark'
    ? 'bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 hover:bg-[#3a3a3a] cursor-pointer rounded-sm'
    : 'bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-300 cursor-pointer rounded-sm';
  const font14Class = 'text-sm';

  // 当前 BOM 统计
  const bomStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          counts[cell.id] = (counts[cell.id] || 0) + 1;
          total++;
        }
      });
    });

    return { counts, total, items: Object.entries(counts).map(([id, count]) => ({ id, count })) };
  }, [grid]);

  // 刷新数据
  const refreshData = () => {
    setInventory(getInventory());
    setHistory(getHistory());
    setStats(getInventoryStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 筛选库存
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    return inventory.filter(item =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  // 检查某个色号是否库存不足
  const getStockStatus = (id: string, needed: number) => {
    const count = getInventoryCount(id);
    if (count === 0) return 'out';
    if (count < needed) return 'low';
    return 'ok';
  };

  // 导入套装
  const handleImport = (count: number) => {
    const imported = importTraySet(count);
    if (imported) {
      refreshData();
      alert(`成功导入 ${imported} 个色号！`);
    }
  };

  // 快速调整库存
  const handleQuickAdjust = (id: string, delta: number) => {
    addInventory(id, delta);
    refreshData();
  };

  // 手动添加色号
  const [manualAddId, setManualAddId] = useState('');
  const handleManualAdd = () => {
    if (manualAddId.trim()) {
      const upperId = manualAddId.trim().toUpperCase();
      updateInventory(upperId, 1000);
      refreshData();
      setManualAddId('');
    }
  };

  // 消耗库存
  const handleConsume = () => {
    if (bomStats.items.length === 0) {
      alert('当前没有图案数据！');
      return;
    }

    setIsConsuming(true);
    const result = consumeFromBOM(bomStats.items, patternName || '未命名作品');
    setConsumeResult(result);

    if (result.success) {
      refreshData();
      onConsume(patternName);
    }

    setIsConsuming(false);
  };

  const borderColor = theme === 'dark' ? 'border-[#333]' : 'border-gray-300';
  const headerBg = theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100';
  const panelBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const mutedText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="p-2 w-full flex flex-col h-full">
      {/* Title */}
      <div className={`flex items-center justify-between mb-2 pb-1 border-b-2 ${theme === 'dark' ? 'border-white' : 'border-black'}`}>
        <span className={`font-bold text-lg ${textClass}`}>📦 豆子仓库</span>
        <div className="flex gap-1">
          <button
            className={`h-6 px-2 ${font14Class} border ${buttonGray} pixel-btn flex items-center ${activeTab === 'import' ? (theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-gray-300') : ''}`}
            onClick={() => setActiveTab('import')}
          >
            导入
          </button>
          <button
            className={`h-6 px-2 ${font14Class} border ${buttonGray} pixel-btn flex items-center ${activeTab === 'inventory' ? (theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-gray-300') : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            库存
          </button>
          <button
            className={`h-6 px-2 ${font14Class} border ${buttonGray} pixel-btn flex items-center ${activeTab === 'history' ? (theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-gray-300') : ''}`}
            onClick={() => setActiveTab('history')}
          >
            记录
          </button>
        </div>
      </div>

      {/* 统计面板 */}
      <div className={`mb-2 p-2 rounded-sm border ${borderColor} ${headerBg}`}>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-yellow-400">{stats.totalColors}</div>
            <div className="text-xs text-gray-400">色号</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{Math.round(stats.totalBeads / 1000)}K</div>
            <div className="text-xs text-gray-400">总数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400">{stats.lowStock}</div>
            <div className="text-xs text-gray-400">预警</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">{stats.outOfStock}</div>
            <div className="text-xs text-gray-400">缺货</div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 导入 Tab */}
        {activeTab === 'import' && (
          <div className="flex-1 overflow-auto">
            <div className="mb-3">
              <p className={`text-sm mb-2 ${mutedText}`}>快速导入 MARD 套装：</p>
              <div className="grid grid-cols-4 gap-1">
                {[24, 48, 72, 96, 120, 144, 216, 264].map(count => (
                  <button
                    key={count}
                    className={`h-7 px-1 ${font14Class} border ${buttonGray} pixel-btn flex items-center justify-center`}
                    onClick={() => handleImport(count)}
                  >
                    {count}色
                  </button>
                ))}
              </div>
            </div>

             <div className="mb-3">
               <p className={`text-sm mb-2 ${mutedText}`}>手动添加色号：</p>
               <div className="flex gap-1">
                 <input
                   type="text"
                   value={manualAddId}
                   onChange={(e) => setManualAddId(e.target.value.toUpperCase())}
                   placeholder="输入色号如: H11"
                   className={`flex-1 px-2 py-1 border ${borderColor} ${panelBg} text-sm`}
                 />
                 <button className={`h-7 px-3 ${font14Class} border ${buttonGray} pixel-btn flex items-center`} onClick={handleManualAdd}>
                   添加
                 </button>
               </div>
             </div>

            {/* 消耗预览 */}
            {bomStats.items.length > 0 && (
              <div className={`mb-3 p-2 rounded-sm border ${borderColor} ${headerBg}`}>
                <p className={`text-sm font-bold mb-2 ${textClass}`}>📋 消耗预览</p>
                <input
                  type="text"
                  value={patternName}
                  onChange={(e) => onPatternNameChange(e.target.value)}
                  placeholder="作品名称"
                  className={`w-full px-2 py-1 mb-2 border ${borderColor} ${panelBg} text-sm`}
                />
                <div className="max-h-32 overflow-auto">
                  {bomStats.items.map(({ id, count }) => {
                    const status = getStockStatus(id, count);
                    return (
                      <div key={id} className="flex items-center justify-between text-sm py-1">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-4 h-4 border border-gray-500"
                            style={{ backgroundColor: inventory.find(i => i.id === id)?.brand ? '#666' : '#eee' }}
                          ></span>
                          {id}
                        </span>
                        <span className={status === 'ok' ? 'text-green-400' : status === 'low' ? 'text-orange-400' : 'text-red-400'}>
                          {count} / {getInventoryCount(id)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button
                  className={`w-full mt-2 h-8 px-2 ${font14Class} pixel-btn flex items-center justify-center ${consumeResult?.missing.length ? buttonGray : ''}`}
                  style={!consumeResult?.missing.length ? (theme === 'dark' ? { backgroundColor: '#8b0000', borderColor: '#a00000', color: 'white' } : { backgroundColor: '#dc3545', borderColor: '#c82333', color: 'white' }) : {}}
                  onClick={handleConsume}
                  disabled={isConsuming || bomStats.items.length === 0}
                >
                  {isConsuming ? '扣除中...' : '确认消耗并扣除库存'}
                </button>
                {consumeResult && !consumeResult.success && (
                  <p className="text-red-400 text-xs mt-1">
                    ⚠️ 库存不足: {consumeResult.missing.join(', ')}
                  </p>
                )}
                {consumeResult && consumeResult.success && (
                  <p className="text-green-400 text-xs mt-1">
                    ✓ 库存已扣除！
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 库存 Tab */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索色号..."
              className={`w-full px-2 py-1 mb-2 border ${borderColor} ${panelBg} text-sm`}
            />
            <div className="flex-1 overflow-auto">
              <table className={`w-full text-sm border ${borderColor}`}>
                <thead className={headerBg}>
                  <tr>
                    <th className="p-1 text-left">色号</th>
                    <th className="p-1 text-center">数量</th>
                    <th className="p-1 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.slice(0, 100).map(item => (
                    <tr key={item.id} className="border-t border-gray-600">
                      <td className="p-1 font-bold">{item.id}</td>
                      <td className="p-1 text-center">
                        <span className={
                          item.count === 0 ? 'text-red-400' :
                          item.count < 100 ? 'text-orange-400' :
                          'text-green-400'
                        }>
                          {item.count}
                        </span>
                      </td>
                      <td className="p-1 text-center">
                        <button
                          className={`h-6 px-2 ${font14Class} border ${buttonGray} pixel-btn flex items-center`}
                          onClick={() => handleQuickAdjust(item.id, 100)}
                        >
                          +100
                        </button>
                        <button
                          className={`h-6 px-2 ${font14Class} border ${buttonGray} pixel-btn flex items-center`}
                          style={theme === 'dark' ? { backgroundColor: '#8b0000', borderColor: '#a00000', color: 'white' } : { backgroundColor: '#dc3545', borderColor: '#c82333', color: 'white' }}
                          onClick={() => handleQuickAdjust(item.id, -100)}
                        >
                          -100
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInventory.length > 100 && (
                <p className={`text-xs text-center mt-2 ${mutedText}`}>
                  显示前 100 / 共 {filteredInventory.length} 个色号
                </p>
              )}
              {filteredInventory.length === 0 && (
                <p className={`text-center py-4 ${mutedText}`}>
                  暂无库存数据
                </p>
              )}
            </div>
          </div>
        )}

        {/* 历史 Tab */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-auto">
            <button
              className={`h-7 px-3 ${font14Class} border ${buttonGray} pixel-btn flex items-center mb-2`}
              onClick={() => {
                if (confirm('确定清空所有历史记录？')) {
                  clearHistory();
                  refreshData();
                }
              }}
            >
              清空历史
            </button>
            {history.length === 0 ? (
              <p className={`text-center py-4 ${mutedText}`}>
                暂无消耗记录
              </p>
            ) : (
              history.map(record => (
                <div key={record.id} className={`mb-2 p-2 rounded-sm border ${borderColor} ${panelBg}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{record.patternName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    消耗 {record.consumed.length} 种颜色，共 {
                      record.consumed.reduce((sum, item) => sum + item.count, 0)
                    } 颗
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
