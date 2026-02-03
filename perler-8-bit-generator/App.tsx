import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import EditorCanvas from './components/EditorCanvas';
import BomTable from './components/BomTable';
import InventoryPanel from './components/InventoryPanel';
import ExportTestPage from './pages/ExportTestPage';
import { Bead, BeadGrid, ToolMode, MatchStrategy } from './types';
import { BEAD_PALETTE } from './constants';
import { loadImage, convertImageToGrid, cleanupGrid } from './services/imageProcessing';
import { translations, Language, Theme } from './locales';

const App: React.FC = () => {
  // State
  const [grid, setGrid] = useState<BeadGrid>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Settings
  const [targetWidth, setTargetWidth] = useState(50);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [matchStrategy, setMatchStrategy] = useState<MatchStrategy>('perceptual');
  
  // Tools
  const [selectedBead, setSelectedBead] = useState<Bead>(BEAD_PALETTE[0]);
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.WAND);
  const [showGridLines, setShowGridLines] = useState(true);

  // Localization & Theme
  const [lang, setLang] = useState<Language>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const t = translations[lang];

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'ruler' | 'bom' | 'complete'>('idle');
  const [previewStats, setPreviewStats] = useState<{width: number, height: number, count: number, sortedBeads: {bead: Bead, count: number}[]} | null>(null);

  // BOM Edit State
  const [replaceModeBeadId, setReplaceModeBeadId] = useState<string | null>(null);
  const [confirmDeleteBeadId, setConfirmDeleteBeadId] = useState<string | null>(null);

  // Inventory State
  const [patternName, setPatternName] = useState('');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Test Page State
  const [showTestPage, setShowTestPage] = useState(false);

  // RAF Ref
  const rafRef = useRef<number | null>(null);

  // Calculate Stats for Status Bar
  const stats = useMemo(() => {
    let count = 0;
    const height = grid.length;
    const width = height > 0 ? grid[0].length : 0;
    
    if (height > 0) {
        grid.forEach(row => {
            row.forEach(cell => {
                if (cell) count++;
            });
        });
    }
    
    // Estimate: 3200 beads per hour (approx 1.1s per bead)
    const hours = count > 0 ? (count / 3200).toFixed(1) : "0.0";
    
    return { width, height, count, hours };
  }, [grid]);

  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
    loadImage(file).then(img => {
      setSourceImage(img);
      const newGrid = convertImageToGrid(img, targetWidth, brightness, contrast, matchStrategy);
      setGrid(newGrid);
    }).catch(console.error);
  };

  const handleDenoise = useCallback(() => {
      if (grid.length > 0) {
          const cleaned = cleanupGrid(grid);
          setGrid(cleaned);
      }
  }, [grid]);

  // Auto remove background - detects background color from corners and removes it
  const handleAutoRemoveBackground = useCallback(() => {
      if (grid.length === 0 || grid[0].length === 0) return;
      
      const height = grid.length;
      const width = grid[0].length;
      
      // Get corner colors to detect background
      const corners = [
          grid[0][0],
          grid[0][width - 1],
          grid[height - 1][0],
          grid[height - 1][width - 1]
      ].filter(Boolean);
      
      if (corners.length === 0) return;
      
      // Find most common corner color (background)
      const colorCounts: Record<string, { bead: Bead; count: number }> = {};
      corners.forEach(bead => {
          if (!bead) return;
          if (!colorCounts[bead.id]) {
              colorCounts[bead.id] = { bead, count: 0 };
          }
          colorCounts[bead.id].count++;
      });
      
      const backgroundEntry = Object.entries(colorCounts)
          .sort((a, b) => b[1].count - a[1].count)[0];
      
      if (!backgroundEntry) return;
      
      const backgroundId = backgroundEntry[0];
      
      // Remove all beads with background color
      const newGrid = grid.map(row => 
          row.map(cell => cell?.id === backgroundId ? null : cell)
      );
      
      setGrid(newGrid);
  }, [grid]);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  // Real-time Update
  useEffect(() => {
    if (!sourceImage) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      try {
        const newGrid = convertImageToGrid(sourceImage, targetWidth, brightness, contrast, matchStrategy);
        setGrid(newGrid);
      } catch (e) {
        console.error("Processing error:", e);
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sourceImage, targetWidth, brightness, contrast, matchStrategy]);

  // BOM Edit Functions
  const handleDeleteBead = useCallback((beadId: string) => {
    const newGrid = grid.map(row => row.map(cell =>
      cell?.id === beadId ? null : cell
    ));
    setGrid(newGrid);
    setConfirmDeleteBeadId(null);
  }, [grid]);

  const handleStartReplace = useCallback((beadId: string) => {
    setReplaceModeBeadId(beadId);
  }, []);

  const handleReplaceBead = useCallback((newBead: Bead) => {
    if (!replaceModeBeadId) return;
    const newGrid = grid.map(row => row.map(cell =>
      cell?.id === replaceModeBeadId ? newBead : cell
    ));
    setGrid(newGrid);
    setReplaceModeBeadId(null);
  }, [grid, replaceModeBeadId]);

  const handleClearUnselected = useCallback(() => {
    // Get all bead IDs currently in use
    const beadIdsInUse = new Set<string>();
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell) beadIdsInUse.add(cell.id);
      });
    });

    // Only keep beads that are selected or in use (this actually does nothing since we keep all)
    // But we could implement a "keep only selected" feature if needed
    // For now, this function can be used to remove transparent pixels
    const newGrid = grid.map(row => row.map(cell => cell));
    setGrid(newGrid);
  }, [grid]);

  // Handle Generate Preview - Two-step workflow
  const handleGeneratePreview = useCallback(async () => {
    if (grid.length === 0) return;

    setIsPreviewOpen(true);
    setIsGenerating(true);
    setGenerationStep('ruler');

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const CELL_PX = 30;
      const RULER_SIZE = 30; // 坐标标尺尺寸
      const MARGIN = 40;
      const TITLE_HEIGHT = 80; // 增加标题高度以容纳更多信息
      const LEGEND_BOX_WIDTH = 120; // 增加宽度以容纳颜色名称
      const LEGEND_BOX_HEIGHT = 60;
      const LEGEND_GAP = 12;

      // Stats
      const counts: Record<string, { bead: Bead, count: number }> = {};
      grid.forEach(row => {
        row.forEach(cell => {
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

      const canvasWidth = contentWidth + (MARGIN * 2);
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

      // Draw subtitle with dimensions and total beads
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
        // Draw ruler number for every 5th column
        if ((x + 1) % 5 === 0 || x === 0) {
          ctx.fillText(String(x + 1), px + CELL_PX / 2, gridStartY - RULER_SIZE / 2);
        }
        // Draw tick mark
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
        // Draw ruler number for every 5th row
        if ((y + 1) % 5 === 0 || y === 0) {
          ctx.fillText(String(y + 1), gridStartX - RULER_SIZE / 2, py + CELL_PX / 2);
        }
        // Draw tick mark
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

          // Draw transparent: only draw 1px grid line, no fill
          if (!bead) {
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, CELL_PX, CELL_PX);
          } else {
            // Draw colored bead
            ctx.fillStyle = bead.hex;
            ctx.fillRect(px, py, CELL_PX, CELL_PX);
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, CELL_PX, CELL_PX);

            const rgb = bead.rgb;
            const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
            const textColor = lum > 128 ? '#000000' : '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(bead.id, px + CELL_PX/2, py + CELL_PX/2);
          }
        });
      });

      // Draw 10x10 grid lines (thick black borders)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const gridWidth = grid[0].length * CELL_PX;
      const gridHeight = grid.length * CELL_PX;

      // Draw vertical lines every 10 columns
      for (let x = 0; x <= grid[0].length; x += 10) {
        const px = x * CELL_PX;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, gridHeight);
        ctx.stroke();
      }

      // Draw horizontal lines every 10 rows
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

      // Draw BOM section title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`${t.bom} (${sortedBeads.length})`, legendStartX, legendStartY);

      // Draw BOM table header
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

          // Draw color box
          ctx.fillStyle = item.bead.hex;
          ctx.fillRect(x, y, 50, LEGEND_BOX_HEIGHT);
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, 50, LEGEND_BOX_HEIGHT);

          // Draw info box
          ctx.fillStyle = '#FAFAFA';
          ctx.fillRect(x + 50, y, LEGEND_BOX_WIDTH - 50, LEGEND_BOX_HEIGHT);
          ctx.strokeRect(x + 50, y, LEGEND_BOX_WIDTH - 50, LEGEND_BOX_HEIGHT);

          const rgb = item.bead.rgb;
          const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
          const boxTextColor = lum > 128 ? '#000000' : '#FFFFFF';

          // Draw bead ID in color box
          ctx.fillStyle = boxTextColor;
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.bead.id, x + 25, y + LEGEND_BOX_HEIGHT/2);

          // Draw count
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(item.count), x + 85, y + LEGEND_BOX_HEIGHT/2);
      });

      // Complete
      setGenerationStep('complete');
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImage(dataUrl);
      setPreviewStats({
        width: grid[0].length,
        height: grid.length,
        count: totalBeads,
        sortedBeads
      });
      setIsGenerating(false);
    }, 100);
  }, [grid, t, lang]);

  // Handle Actual Download
  const handleDownload = useCallback(() => {
    if (!previewImage) return;

    const link = document.createElement('a');
    link.download = `小霏狗拼豆-${Date.now()}.png`;
    link.href = previewImage;
    link.click();
    setIsPreviewOpen(false);
  }, [previewImage]);

  // Original handleExport kept for backward compatibility, now triggers preview
  const handleExport = useCallback(() => {
    handleGeneratePreview();
  }, [handleGeneratePreview]);

  // CSS Classes - adjusted for Zpix pixel font
  const appClass = `flex flex-col h-screen w-screen font-pixel overflow-hidden ${theme === 'dark' ? 'bg-[#212529] text-white' : 'bg-gray-200 text-black'}`;
  const headerClass = `flex-none ${theme === 'dark' ? 'bg-[#212529] border-white' : 'bg-white border-gray-800'} border-b-4 p-3 flex items-center justify-between z-10 h-[60px]`;
  const bodyGridClass = `flex-1 grid grid-cols-[260px_1fr_260px] min-h-0 overflow-hidden`;
  // Removed flex centering and size constraints to allow viewport to fill the space
  const mainStageClass = `relative w-full h-full overflow-hidden transition-all duration-200 ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-300'}`;
  const canvasPatternColor = theme === 'dark' ? '#444' : '#e5e7eb';

  // 显示测试页面
  if (showTestPage) {
    return <ExportTestPage lang={lang} onBack={() => setShowTestPage(false)} />;
  }

  return (
    <div className={appClass}>
      {/* 1. Header */}
      <header className={headerClass}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="小霏狗" className="h-10 w-auto" />
          <h1 className="text-xl font-bold truncate">小霏狗拼豆</h1>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
           {/* 测试页面按钮 */}
           <button
              className={`h-9 px-3 ${theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800' : 'text-yellow-600 hover:text-yellow-700 hover:bg-gray-100'} flex items-center transition-colors`}
              onClick={() => setShowTestPage(true)}
              title="测试导出样式"
            >
              <span className="text-sm font-medium">🧪 测试</span>
            </button>

           {/* 分隔 */}
           <div className={`w-px h-5 mx-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>

           {/* 主要操作按钮 - 深色填充 */}
           <button
              className={`h-9 px-4 ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'} flex items-center transition-colors`}
              onClick={() => setIsInventoryOpen(true)}
              title="豆子仓库"
            >
              <span className="text-sm font-medium">仓库</span>
            </button>

           {/* 分隔 */}
           <div className={`w-px h-5 mx-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>

           {/* 次要按钮 - 纯文字 */}
           <button
             className={`h-9 px-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} flex items-center transition-colors`}
             onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
             title={lang === 'en' ? 'Switch to Chinese' : 'Switch to English'}
           >
             <span className="text-sm font-medium">{lang === 'en' ? 'English' : '中文'}</span>
           </button>

           {/* 主题切换 - 纯文字 */}
           <button
             className={`h-9 px-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} flex items-center transition-colors`}
             onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
             title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
           >
             <span className="text-sm font-medium">{theme === 'dark' ? '深色' : '浅色'}</span>
           </button>
        </div>
      </header>

      {/* 2. Grid Body */}
      <div className={bodyGridClass}>
        
        {/* Left Column: Sidebar Controls */}
        <div className="overflow-hidden h-full border-r-4 border-gray-600">
          <Sidebar
            onImageUpload={handleImageUpload}
            width={targetWidth}
            setWidth={setTargetWidth}
            selectedBead={selectedBead}
            setSelectedBead={setSelectedBead}
            toolMode={toolMode}
            setToolMode={setToolMode}
            matchStrategy={matchStrategy}
            setMatchStrategy={setMatchStrategy}
            onDenoise={handleDenoise}
            onAutoRemoveBackground={handleAutoRemoveBackground}
            showGridLines={showGridLines}
            setShowGridLines={setShowGridLines}
            onExport={handleExport}
            t={t}
            theme={theme}
            replaceModeBeadId={replaceModeBeadId}
            onReplaceBead={replaceModeBeadId ? handleReplaceBead : null}
          />
        </div>

        {/* Middle Column: Square Canvas Stage with Drag & Drop */}
        <main 
          className={mainStageClass}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ 
            backgroundImage: !sourceImage ? 'none' : `radial-gradient(${canvasPatternColor} 1px, transparent 1px)`, 
            backgroundSize: '20px 20px' 
          }}
        >
          {/* Visual Feedback for Dragging */}
          {isDragging && (
             <div className="absolute inset-4 border-4 border-dashed border-primary z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none rounded-lg">
                <i className="nes-icon is-large star mb-4 animate-bounce"></i>
                <h2 className="text-2xl text-white drop-shadow-md">{t.releaseToImport}</h2>
             </div>
          )}

          {/* Empty State Call to Action */}
          {!sourceImage && !isDragging && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-12`}>
               <div className={`flex flex-col items-center justify-center border-4 border-dashed ${theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-400 text-gray-500'} p-12 rounded-lg`}>
                  <i className={`nes-icon is-large ${theme === 'dark' ? 'is-empty' : ''} coin mb-4 opacity-50`}></i>
                  <p className="text-xl mb-4 text-center">{t.dragDrop}</p>
               </div>
            </div>
          )}

          {/* Canvas (Only show if we have an image) */}
           {sourceImage && (
             <div className={`w-full h-full transition-opacity duration-300 ${isDragging ? 'opacity-20' : 'opacity-100'}`}>
                <EditorCanvas 
                  grid={grid}
                  setGrid={setGrid}
                  selectedBead={selectedBead}
                  toolMode={toolMode}
                  showGridLines={showGridLines}
                  t={t}
                  theme={theme}
                />
             </div>
           )}
        </main>

        {/* Right Column: BOM/Inventory */}
        <div className={`overflow-y-auto h-full border-l-4 border-gray-600 p-2 ${theme === 'dark' ? 'bg-[#212529]' : 'bg-gray-100'}`}>
           <BomTable
             grid={grid}
             selectedBead={selectedBead}
             t={t}
             theme={theme}
             onDeleteBead={handleDeleteBead}
             onStartReplace={handleStartReplace}
             confirmDeleteBeadId={confirmDeleteBeadId}
             onConfirmDelete={setConfirmDeleteBeadId}
           />
        </div>

      </div>

      {/* 3. Status Bar */}
      <footer className={`flex-none ${theme === 'dark' ? 'bg-[#212529] border-t-4 border-gray-600' : 'bg-gray-100 border-t-4 border-gray-400'} p-1 px-3 flex items-center justify-between text-[11px] z-20`}>
          <div className="flex items-center gap-1">
             <i className="nes-icon is-small heart"></i>
             <span>{t.currentSize}: <span className="text-yellow-500">{stats.width}x{stats.height}</span></span>
          </div>
          <div className="flex items-center gap-1">
             <i className="nes-icon is-small coin"></i>
             <span>{t.totalBeads}: <span className="text-green-500">{stats.count}</span></span>
          </div>
           <div className="flex items-center gap-1">
              <i className="nes-icon is-small star"></i>
              <span>{t.estimatedTime}: <span className="text-blue-500">{stats.hours} {t.hours}</span></span>
           </div>
        </footer>

        {/* Preview Modal with NES.css Style */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" onClick={() => !isGenerating && setIsPreviewOpen(false)}></div>

            {/* Modal Content - NES.css dialog style */}
            <div className="nes-dialog is-rounded max-w-4xl w-full max-h-[90vh] overflow-hidden relative z-10">
              {/* Dialog Title Bar */}
              <div className="nes-container is-rounded with-title is-dark p-4 mb-4">
                <p className="title text-xl font-bold">{t.previewTitle}</p>
                <p className="text-sm text-gray-300">{t.generatePreview}</p>
              </div>

              {/* Loading State */}
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-12">
                  {/* Pixel Loading Bar */}
                  <div className="nes-progress is-success w-full max-w-md mb-4">
                    <progress
                      className="w-full"
                      value={generationStep === 'ruler' ? 50 : generationStep === 'bom' ? 80 : 100}
                      max="100"
                    ></progress>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className={`nes-icon ${generationStep === 'ruler' ? 'is-loading' : 'coin'} ${generationStep === 'bom' ? 'animate-pulse' : ''}`}></i>
                    <span className="font-pixel">
                      {generationStep === 'ruler' ? t.drawingRuler :
                       generationStep === 'bom' ? t.drawingBom :
                       generationStep === 'complete' ? '✓' : ''}
                    </span>
                  </div>
                </div>
              ) : (
                /* Preview Content */
                <div className="overflow-auto max-h-[70vh] p-4">
                  {/* Preview Image */}
                  <div className="mb-4 text-center">
                    <img src={previewImage} alt="Preview" className="max-w-full border-4 border-gray-600 inline-block" />
                  </div>

                  {/* Stats Panel */}
                  {previewStats && (
                    <div className="nes-container is-rounded with-title is-dark mb-4">
                      <p className="title text-sm">{t.bom}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <i className="nes-icon is-small star"></i>
                          <span>{t.dimensions}: {previewStats.width}x{previewStats.height} {t.beadCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="nes-icon is-small heart"></i>
                          <span>{t.totalBeads}: {previewStats.count} {t.beadCount}</span>
                        </div>
                      </div>

                      {/* Color Table */}
                      <div className="overflow-auto max-h-48">
                        <table className="nes-table is-bordered is-dark w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-center">{t.id}</th>
                              <th className="text-center">{t.name}</th>
                              <th className="text-center">{t.count}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewStats.sortedBeads.map((item, index) => (
                              <tr key={index}>
                                <td className="text-center">
                                  <span
                                    className="inline-block w-6 h-6 border-2 border-white"
                                    style={{ backgroundColor: item.bead.hex }}
                                  ></span>
                                  <span className="ml-2">{item.bead.id}</span>
                                </td>
                                <td className="text-center">{t.beadNames[item.bead.name] || item.bead.name}</td>
                                <td className="text-center font-bold">{item.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 p-4 border-t-4 border-gray-600">
                <button
                  className="nes-btn is-error"
                  onClick={() => setIsPreviewOpen(false)}
                  disabled={isGenerating}
                >
                  {t.cancel}
                </button>
                <button
                  className="nes-btn is-success"
                  onClick={handleDownload}
                  disabled={isGenerating}
                >
                  <i className="nes-icon is-small download mr-2"></i>
                  {t.confirmSave}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal */}
        {isInventoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setIsInventoryOpen(false)}></div>
            <div className="nes-dialog is-rounded max-w-4xl w-full max-h-[90vh] relative z-10" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' }}>
               <div className={`p-4 border-b-4 ${theme === 'dark' ? 'border-white border-gray-600' : 'border-black'}`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    <i className="nes-icon is-small coin mr-2"></i>
                    📦 豆子仓库
                  </h2>
                  <button
                    className={`h-7 px-2 pixel-btn flex items-center`}
                    style={theme === 'dark' ? { backgroundColor: '#8b0000', borderColor: '#a00000', color: 'white' } : { backgroundColor: '#dc3545', borderColor: '#c82333', color: 'white' }}
                    onClick={() => setIsInventoryOpen(false)}
                  >
                    <i className="nes-icon close mr-1"></i>
                    关闭
                  </button>
                </div>
               </div>
              <div className="p-2" style={{ maxHeight: 'calc(90vh - 80px)', overflow: 'auto' }}>
                <InventoryPanel
                  grid={grid}
                  selectedBead={selectedBead}
                  t={t}
                  theme={theme}
                  onConsume={(name) => {
                    setPatternName('');
                  }}
                  patternName={patternName}
                  onPatternNameChange={setPatternName}
                />
              </div>
            </div>
          </div>
        )}
      </div>
   );
};

export default App;