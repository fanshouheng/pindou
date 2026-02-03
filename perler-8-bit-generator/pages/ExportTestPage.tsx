import React, { useState, useCallback, useEffect } from 'react';
import { Bead, BeadGrid } from '../types';
import { BEAD_PALETTE } from '../constants';
import { translations, Language } from '../locales';

interface ExportTestPageProps {
  lang?: Language;
  onBack?: () => void;
}

const ExportTestPage: React.FC<ExportTestPageProps> = ({ lang = 'zh', onBack }) => {
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'ruler' | 'bom' | 'complete'>('idle');
  const [previewStats, setPreviewStats] = useState<{
    width: number;
    height: number;
    count: number;
    sortedBeads: { bead: Bead; count: number }[];
  } | null>(null);

  const t = translations[lang];

  // 生成测试图案 - 一个 30x25 的心形图案
  const generateTestGrid = useCallback((): BeadGrid => {
    const width = 30;
    const height = 25;
    const grid: BeadGrid = [];

    // 心形图案数据 (1 = 有珠子, 0 = 无)
    const heartPattern = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0],
      [0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];

    // 使用的颜色
    const redBead = BEAD_PALETTE.find(b => b.id === 'F2') || BEAD_PALETTE[0];
    const darkRedBead = BEAD_PALETTE.find(b => b.id === 'F8') || BEAD_PALETTE[0];
    const pinkBead = BEAD_PALETTE.find(b => b.id === 'E3') || BEAD_PALETTE[0];

    for (let y = 0; y < height; y++) {
      const row: (Bead | null)[] = [];
      for (let x = 0; x < width; x++) {
        if (y < heartPattern.length && heartPattern[y][x] === 1) {
          // 根据位置选择颜色，创造渐变效果
          if (x < 8 || x > 22) {
            row.push(pinkBead);
          } else if (y < 8) {
            row.push(redBead);
          } else {
            row.push(darkRedBead);
          }
        } else {
          row.push(null);
        }
      }
      grid.push(row);
    }

    return grid;
  }, []);

  const handleGeneratePreview = useCallback(async () => {
    const grid = generateTestGrid();
    if (grid.length === 0) return;

    setIsGenerating(true);
    setGenerationStep('ruler');

    setTimeout(() => {
      const CELL_PX = 30;
      const RULER_SIZE = 30;
      const MARGIN = 40;
      const TITLE_HEIGHT = 80;
      const LEGEND_BOX_WIDTH = 120;
      const LEGEND_BOX_HEIGHT = 60;
      const LEGEND_GAP = 12;

      const counts: Record<string, { bead: Bead; count: number }> = {};
      grid.forEach((row) => {
        row.forEach((cell) => {
          if (cell) {
            if (!counts[cell.id]) counts[cell.id] = { bead: cell, count: 0 };
            counts[cell.id].count++;
          }
        });
      });
      const sortedBeads = Object.values(counts).sort((a, b) => b.count - a.count);
      const totalBeads = sortedBeads.reduce((acc, item) => acc + item.count, 0);

      const gridWidthPx = grid[0].length * CELL_PX;
      const gridHeightPx = grid.length * CELL_PX;

      const minCanvasWidth = 900;
      const contentWidth = Math.max(gridWidthPx + RULER_SIZE, minCanvasWidth);
      const legendItemsPerRow = Math.floor(contentWidth / (LEGEND_BOX_WIDTH + LEGEND_GAP));
      const legendRows = Math.ceil(sortedBeads.length / legendItemsPerRow);
      const legendHeightPx = legendRows * (LEGEND_BOX_HEIGHT + LEGEND_GAP) + 60;

      const canvasWidth = contentWidth + MARGIN * 2;
      const canvasHeight = MARGIN + TITLE_HEIGHT + gridHeightPx + RULER_SIZE + 60 + legendHeightPx + MARGIN;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border frame
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

      // Draw title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${t.appTitle}`, canvasWidth / 2, MARGIN + 25);

      // Draw subtitle
      const today = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US');
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(
        `${t.dimensions}: ${grid[0].length}×${grid.length} ${t.beadCount} | ${t.totalBeads}: ${totalBeads} | ${today}`,
        canvasWidth / 2,
        MARGIN + 55
      );

      // Draw grid with rulers
      setGenerationStep('ruler');
      const gridStartX = (canvasWidth - gridWidthPx - RULER_SIZE) / 2 + RULER_SIZE;
      const gridStartY = MARGIN + TITLE_HEIGHT + RULER_SIZE;

      // Draw ruler background
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(gridStartX - RULER_SIZE, gridStartY, RULER_SIZE, gridHeightPx);
      ctx.fillRect(gridStartX, gridStartY - RULER_SIZE, gridWidthPx, RULER_SIZE);

      // Draw column ruler (top)
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let x = 0; x < grid[0].length; x++) {
        const px = gridStartX + x * CELL_PX;
        if ((x + 1) % 5 === 0 || x === 0) {
          ctx.fillText(String(x + 1), px + CELL_PX / 2, gridStartY - RULER_SIZE / 2);
        }
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + CELL_PX / 2, gridStartY - 5);
        ctx.lineTo(px + CELL_PX / 2, gridStartY);
        ctx.stroke();
      }

      // Draw row ruler (left)
      for (let y = 0; y < grid.length; y++) {
        const py = gridStartY + y * CELL_PX;
        if ((y + 1) % 5 === 0 || y === 0) {
          ctx.fillText(String(y + 1), gridStartX - RULER_SIZE / 2, py + CELL_PX / 2);
        }
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gridStartX - 5, py + CELL_PX / 2);
        ctx.lineTo(gridStartX, py + CELL_PX / 2);
        ctx.stroke();
      }

      ctx.translate(gridStartX, gridStartY);

      grid.forEach((row, y) => {
        row.forEach((bead, x) => {
          const px = x * CELL_PX;
          const py = y * CELL_PX;

          if (!bead) {
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, CELL_PX, CELL_PX);
          } else {
            ctx.fillStyle = bead.hex;
            ctx.fillRect(px, py, CELL_PX, CELL_PX);
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, CELL_PX, CELL_PX);

            const rgb = bead.rgb;
            const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
            const textColor = lum > 128 ? '#000000' : '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(bead.id, px + CELL_PX / 2, py + CELL_PX / 2);
          }
        });
      });

      // Draw 10x10 grid lines (thick black borders)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const gridWidth = grid[0].length * CELL_PX;
      const gridHeight = grid.length * CELL_PX;

      for (let x = 0; x <= grid[0].length; x += 10) {
        const px = x * CELL_PX;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, gridHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= grid.length; y += 10) {
        const py = y * CELL_PX;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(gridWidth, py);
        ctx.stroke();
      }

      ctx.translate(-gridStartX, -gridStartY);

      // Draw BOM section
      setGenerationStep('bom');
      const legendStartX = MARGIN;
      const legendStartY = gridStartY + gridHeightPx + 50;

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`${t.bom} (${sortedBeads.length})`, legendStartX, legendStartY);

      const headerY = legendStartY + 25;
      ctx.fillStyle = '#F0F0F0';
      ctx.fillRect(legendStartX, headerY, LEGEND_BOX_WIDTH, 24);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendStartX, headerY, LEGEND_BOX_WIDTH, 24);

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.id, legendStartX + 40, headerY + 12);
      ctx.fillText(t.count, legendStartX + 90, headerY + 12);

      const legendItemsStartY = headerY + 30;

      sortedBeads.forEach((item, index) => {
        const col = index % legendItemsPerRow;
        const row = Math.floor(index / legendItemsPerRow);
        const x = legendStartX + col * (LEGEND_BOX_WIDTH + LEGEND_GAP);
        const y = legendItemsStartY + row * (LEGEND_BOX_HEIGHT + LEGEND_GAP);

        ctx.fillStyle = item.bead.hex;
        ctx.fillRect(x, y, 50, LEGEND_BOX_HEIGHT);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 50, LEGEND_BOX_HEIGHT);

        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(x + 50, y, LEGEND_BOX_WIDTH - 50, LEGEND_BOX_HEIGHT);
        ctx.strokeRect(x + 50, y, LEGEND_BOX_WIDTH - 50, LEGEND_BOX_HEIGHT);

        const rgb = item.bead.rgb;
        const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
        const boxTextColor = lum > 128 ? '#000000' : '#FFFFFF';

        ctx.fillStyle = boxTextColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.bead.id, x + 25, y + LEGEND_BOX_HEIGHT / 2);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(item.count), x + 85, y + LEGEND_BOX_HEIGHT / 2);
      });

      setGenerationStep('complete');
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImage(dataUrl);
      setPreviewStats({
        width: grid[0].length,
        height: grid.length,
        count: totalBeads,
        sortedBeads,
      });
      setIsGenerating(false);
    }, 100);
  }, [generateTestGrid, t, lang]);

  // 自动加载预览
  useEffect(() => {
    handleGeneratePreview();
  }, [handleGeneratePreview]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">📋 导出图纸样式测试页面</h1>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                ← 返回主应用
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-4">
            此页面使用预设的心形测试图案，快速预览导出图纸的样式效果。
          </p>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isGenerating ? '生成中...' : '重新生成'}
            </button>
            {previewImage && (
              <a
                href={previewImage}
                download={`测试图纸-${Date.now()}.png`}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors inline-block"
              >
                下载图纸
              </a>
            )}
          </div>

          {isGenerating && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span>
                {generationStep === 'ruler'
                  ? '绘制坐标标尺...'
                  : generationStep === 'bom'
                  ? '绘制材料清单...'
                  : '完成...'}
              </span>
            </div>
          )}
        </div>

        {previewImage && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">预览结果</h2>
            {previewStats && (
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
                <div>
                  <span className="text-gray-600">尺寸:</span>
                  <span className="ml-2 font-bold">
                    {previewStats.width}×{previewStats.height}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">总豆数:</span>
                  <span className="ml-2 font-bold">{previewStats.count}</span>
                </div>
                <div>
                  <span className="text-gray-600">颜色种类:</span>
                  <span className="ml-2 font-bold">{previewStats.sortedBeads.length}</span>
                </div>
              </div>
            )}
            <div className="border-2 border-gray-300 rounded overflow-auto">
              <img src={previewImage} alt="图纸预览" className="max-w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportTestPage;
