import React, { useMemo } from 'react';
import { Bead, BeadGrid } from '../types';
import { Theme } from '../locales';

interface BomTableProps {
  grid: BeadGrid;
  selectedBead: Bead;
  t: any;
  theme: Theme;
}

const BomTable: React.FC<BomTableProps> = ({ grid, selectedBead, t, theme }) => {
  const stats = useMemo(() => {
    const counts: Record<string, { bead: Bead, count: number }> = {};
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

  // If no items, show a placeholder row
  const isEmpty = stats.items.length === 0;

  const headerBorderColor = theme === 'dark' ? 'border-white' : 'border-black';
  const borderColor = theme === 'dark' ? 'border-[#333]' : 'border-gray-300';
  const tableBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white';
  const headerBg = theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100';
  const rowHover = theme === 'dark' ? 'hover:bg-[#252525]' : 'hover:bg-gray-50';
  const textClass = 'text-sm'; // 14px font size for better readability with Zpix

  return (
    <div className="p-2 w-full flex flex-col h-full">
      {/* Title */}
      <div className={`flex items-center justify-between mb-2 pb-1 border-b-2 ${headerBorderColor}`}>
          <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.bom}</span>

          <div className={`px-2 py-0.5 border ${borderColor} ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'} rounded-sm opacity-50 grayscale`} style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
             <span className="text-xs font-bold">CSV</span>
          </div>
      </div>

      <div className="w-full flex-1 overflow-hidden">
        {/* Custom table without nes-table for better control */}
        <div className={`w-full h-full flex flex-col border ${borderColor} rounded-sm overflow-hidden`}>
          {/* Header Row */}
          <div className={`flex items-center px-2 py-1.5 border-b ${borderColor} ${headerBg} font-bold text-sm`}>
            <span className="w-[35%] truncate">{t.id}</span>
            <span className="w-[25%] text-center">{t.color}</span>
            <span className="w-[40%] text-right">{t.count}</span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isEmpty ? (
              <div className={`flex flex-col items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                 <span className="text-2xl mb-2">...</span>
                 <span className="text-sm">{t.waitingCalculation}</span>
              </div>
            ) : (
              <>
                {stats.items.map(({ bead, count }) => {
                  const isSelected = selectedBead.id === bead.id;
                  const rowBg = isSelected
                     ? (theme === 'dark' ? 'bg-[#3a3a2a]' : 'bg-yellow-50')
                     : '';

                  return (
                    <div key={bead.id} className={`flex items-center px-2 py-1.5 border-b ${borderColor} ${rowHover} ${rowBg}`}>
                      <span className="w-[35%] truncate font-bold">{bead.id}</span>
                      <span className="w-[25%] text-center">
                        <div
                          className="w-4 h-4 inline-block border border-[#555] rounded-sm align-middle"
                          style={{ backgroundColor: bead.hex }}
                          title={`${t.beadNames?.[bead.name] || bead.name} (${bead.id})`}
                        ></div>
                      </span>
                      <span className="w-[40%] text-right font-bold">{count}</span>
                    </div>
                  );
                })}
                {/* Total Row */}
                <div className={`flex items-center px-2 py-1.5 border-t-2 ${borderColor} ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'} font-bold`}>
                  <span className="w-[35%]">{t.total}:</span>
                  <span className="w-[25%]"></span>
                  <span className="w-[40%] text-right">{stats.total}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BomTable;
