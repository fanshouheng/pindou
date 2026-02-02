import React, { useMemo } from 'react';
import { Bead, BeadGrid } from '../types';
import { Theme } from '../locales';

interface BomTableProps {
  grid: BeadGrid;
  selectedBead: Bead;
  t: any;
  theme: Theme;
  onDeleteBead: (beadId: string) => void;
  onStartReplace: (beadId: string) => void;
  confirmDeleteBeadId: string | null;
  onConfirmDelete: (beadId: string | null) => void;
}

const BomTable: React.FC<BomTableProps> = ({
  grid,
  selectedBead,
  t,
  theme,
  onDeleteBead,
  onStartReplace,
  confirmDeleteBeadId,
  onConfirmDelete
}) => {
  const stats = useMemo(() => {
    const counts: Record<string, { bead: Bead; count: number }> = {};
    let total = 0;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          if (!counts[cell.id]) {
            counts[cell.id] = { bead: cell, count: 0 };
          }
          counts[cell.id].count++;
          total++;
        }
      });
    });

    return {
      items: Object.values(counts).sort((a, b) => b.count - a.count),
      total
    };
  }, [grid]);

  const isEmpty = stats.items.length === 0;

  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-black';
  const outerBorderColor = theme === 'dark' ? 'border-white' : 'border-black';
  const tableBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white';
  const headerBg = theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200';
  const rowHover = theme === 'dark' ? 'hover:bg-[#252525]' : 'hover:bg-gray-100';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const mutedText = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  // 计算文字颜色（根据背景亮度）
  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b);
    return lum > 140 ? '#000000' : '#FFFFFF';
  };

  // 计算背景亮度（用于判断是否需要深色边框）
  const isLightBg = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b);
    return lum > 140;
  };

  return (
    <div className="p-2 w-full flex flex-col h-full">
      {/* Title */}
      <div className={`flex items-center justify-between mb-2 pb-1 border-b-2 ${outerBorderColor}`}>
        <span className={`font-bold text-lg ${textColor}`}>{t.bom}</span>
      </div>

      <div className="w-full flex-1 overflow-hidden">
        {/* Table Container */}
        <table className={`w-full border-collapse ${tableBg}`} style={{ border: '2px solid currentColor' }}>
          {/* Header Row */}
          <thead>
            <tr className={borderColor} style={{ borderBottom: '1px solid currentColor' }}>
              <th className={`px-3 py-2 text-sm font-bold text-left ${textColor}`} style={{ width: '35%' }}>
                {t.id}
              </th>
              <th className={`px-3 py-2 text-sm font-bold text-center ${textColor}`} style={{ width: '25%' }}>
                {t.count}
              </th>
              <th className={`px-2 py-2 text-sm font-bold text-center ${textColor}`} style={{ width: '20%' }}>
                {t.replace}
              </th>
              <th className={`px-2 py-2 text-sm font-bold text-center ${textColor}`} style={{ width: '20%' }}>
                {t.delete}
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={4} className={`p-8 text-center ${mutedText}`}>
                  <span className="text-2xl block mb-2">...</span>
                  <span className="text-sm">{t.waitingCalculation}</span>
                </td>
              </tr>
            ) : (
              <>
                {stats.items.map(({ bead, count }) => {
                  const beadTextColor = getTextColor(bead.hex);
                  const isLight = isLightBg(bead.hex);
                  const isSelected = selectedBead.id === bead.id;

                  return (
                    <React.Fragment key={bead.id}>
                      <tr
                        className={`${rowHover} ${isSelected ? (theme === 'dark' ? 'bg-[#3a3a2a]' : 'bg-yellow-50') : ''}`}
                        style={{ borderBottom: '1px solid currentColor' }}
                      >
                        {/* Column 1: 颜色 Badge */}
                        <td className={`px-2 py-1.5 ${textColor}`}>
                          <div
                            className="flex items-center gap-2 px-3 py-1 rounded-sm"
                            style={{
                              backgroundColor: bead.hex,
                              color: beadTextColor,
                              border: isLight ? '1px solid #999' : '1px solid rgba(255,255,255,0.3)',
                              width: 'fit-content',
                              minWidth: '60px'
                            }}
                          >
                            <span className="font-bold text-sm">{bead.id}</span>
                          </div>
                        </td>

                        {/* Column 2: 数量 */}
                        <td className={`px-3 py-1.5 text-center ${textColor}`}>
                          <span className="font-bold text-lg">{count}</span>
                        </td>

                        {/* Column 3: 替换按钮 */}
                        <td className="px-2 py-1.5 text-center">
                          <button
                            className="pixel-btn w-6 h-6 flex items-center justify-center rounded-sm"
                            style={{
                              backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e0e0e0',
                              border: theme === 'dark' ? '2px solid #4a4a4a' : '2px solid #999'
                            }}
                            onClick={() => onStartReplace(bead.id)}
                            title={t.replace}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={theme === 'dark' ? '#fff' : '#333'}>
                              <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
                            </svg>
                          </button>
                        </td>

                        {/* Column 4: 删除按钮 */}
                        <td className="px-2 py-1.5 text-center">
                          <button
                            className="pixel-btn w-6 h-6 flex items-center justify-center rounded-sm"
                            style={{
                              backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e0e0e0',
                              border: theme === 'dark' ? '2px solid #4a4a4a' : '2px solid #999'
                            }}
                            onClick={() => onConfirmDelete(bead.id)}
                            title={t.delete}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={theme === 'dark' ? '#fff' : '#333'}>
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 16.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Delete Confirmation Modal */}
                      {confirmDeleteBeadId === bead.id && (
                        <tr>
                          <td colSpan={4}>
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                              <div
                                className="absolute inset-0 bg-black/70"
                                onClick={() => onConfirmDelete(null)}
                              ></div>
                              <div
                                className="nes-dialog is-rounded relative z-10"
                                style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff' }}
                              >
                                <div
                                  className={`nes-container with-title is-rounded ${theme === 'dark' ? 'is-dark' : ''}`}
                                  style={{
                                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
                                  }}
                                >
                                  <p className="title">🐕 汪！</p>
                                  <p className={textColor}>确定要从图纸中抹掉这个颜色吗？</p>
                                  <p
                                    className="text-sm mt-2 font-bold"
                                    style={{ color: bead.hex }}
                                  >
                                    {bead.id} × {count}
                                  </p>
                                </div>
                                <div className="flex justify-end gap-4 p-4">
                                  <button
                                    className="pixel-btn h-8 px-4 text-sm rounded-sm"
                                    style={{
                                      backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e0e0e0',
                                      border: theme === 'dark' ? '2px solid #4a4a4a' : '2px solid #999'
                                    }}
                                    onClick={() => onConfirmDelete(null)}
                                  >
                                    {t.cancel}
                                  </button>
                                  <button
                                    className="pixel-btn h-8 px-4 text-sm text-white rounded-sm"
                                    style={{
                                      backgroundColor: '#8b0000',
                                      border: '2px solid #a00000'
                                    }}
                                    onClick={() => onDeleteBead(bead.id)}
                                  >
                                    {t.confirmSave}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Total Row */}
                <tr
                  className={theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'}
                  style={{ borderTop: '2px solid currentColor' }}
                >
                  <td className={`px-3 py-2 text-sm font-bold ${textColor}`}>
                    {t.total}:
                  </td>
                  <td className={`px-3 py-2 text-center ${textColor}`}>
                    <span className="font-bold text-lg">{stats.total}</span>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BomTable;
