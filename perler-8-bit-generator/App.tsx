import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import EditorCanvas from './components/EditorCanvas';
import BomTable from './components/BomTable';
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
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const t = translations[lang];

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

  // Handle Export Logic
  const handleExport = useCallback(() => {
    if (grid.length === 0) return;

    const CELL_PX = 30;
    const MARGIN = 40;
    const TITLE_HEIGHT = 60;
    const LEGEND_BOX_WIDTH = 80;
    const LEGEND_BOX_HEIGHT = 50;
    const LEGEND_GAP = 10;
    
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

    const gridWidthPx = grid[0].length * CELL_PX;
    const gridHeightPx = grid.length * CELL_PX;

    const minCanvasWidth = 800;
    const contentWidth = Math.max(gridWidthPx, minCanvasWidth);
    const legendItemsPerRow = Math.floor(contentWidth / (LEGEND_BOX_WIDTH + LEGEND_GAP));
    const legendRows = Math.ceil(sortedBeads.length / legendItemsPerRow);
    const legendHeightPx = legendRows * (LEGEND_BOX_HEIGHT + LEGEND_GAP) + 40;

    const canvasWidth = contentWidth + (MARGIN * 2);
    const canvasHeight = MARGIN + TITLE_HEIGHT + gridHeightPx + 40 + legendHeightPx + MARGIN;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${t.appTitle} - Export`, canvasWidth / 2, MARGIN + 20);

    const gridStartX = (canvasWidth - gridWidthPx) / 2;
    const gridStartY = MARGIN + TITLE_HEIGHT;

    ctx.translate(gridStartX, gridStartY);

    grid.forEach((row, y) => {
      row.forEach((bead, x) => {
        const px = x * CELL_PX;
        const py = y * CELL_PX;
        ctx.fillStyle = bead ? bead.hex : '#FFFFFF';
        ctx.fillRect(px, py, CELL_PX, CELL_PX);
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, CELL_PX, CELL_PX);

        if (bead) {
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

    ctx.translate(-gridStartX, -gridStartY);

    const legendStartX = MARGIN;
    const legendStartY = gridStartY + gridHeightPx + 40;

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(t.bom, legendStartX, legendStartY);

    const legendItemsStartY = legendStartY + 20;

    sortedBeads.forEach((item, index) => {
        const col = index % legendItemsPerRow;
        const row = Math.floor(index / legendItemsPerRow);
        const x = legendStartX + col * (LEGEND_BOX_WIDTH + LEGEND_GAP);
        const y = legendItemsStartY + row * (LEGEND_BOX_HEIGHT + LEGEND_GAP);

        ctx.fillStyle = item.bead.hex;
        ctx.fillRect(x, y, LEGEND_BOX_WIDTH, LEGEND_BOX_HEIGHT);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, LEGEND_BOX_WIDTH, LEGEND_BOX_HEIGHT);
        const rgb = item.bead.rgb;
        const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
        const textColor = lum > 128 ? '#000000' : '#FFFFFF';

        ctx.fillStyle = textColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.bead.id, x + LEGEND_BOX_WIDTH/2, y + LEGEND_BOX_HEIGHT/2);

        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(String(item.count), x + LEGEND_BOX_WIDTH - 4, y + 3);
    });

    const link = document.createElement('a');
    link.download = `perler-pattern-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [grid, t]);

  // CSS Classes - adjusted for Zpix pixel font
  const appClass = `flex flex-col h-screen w-screen font-pixel overflow-hidden ${theme === 'dark' ? 'bg-[#212529] text-white' : 'bg-gray-200 text-black'}`;
  const headerClass = `flex-none ${theme === 'dark' ? 'bg-[#212529] border-white' : 'bg-white border-gray-800'} border-b-4 p-3 flex items-center justify-between z-10 h-[60px]`;
  const bodyGridClass = `flex-1 grid grid-cols-[260px_1fr_260px] min-h-0 overflow-hidden`;
  // Removed flex centering and size constraints to allow viewport to fill the space
  const mainStageClass = `relative w-full h-full overflow-hidden transition-all duration-200 ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-300'}`;
  const canvasPatternColor = theme === 'dark' ? '#444' : '#e5e7eb';

  return (
    <div className={appClass}>
      {/* 1. Header */}
      <header className={headerClass}>
        <div className="flex items-center gap-3">
          <i className="nes-icon coin is-small"></i>
          <h1 className="text-lg truncate">{t.appTitle}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
           <button className={`nes-btn is-small ${lang === 'en' ? 'is-primary' : ''}`} onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}>
             {lang === 'en' ? 'EN' : 'ZH'}
           </button>
           <button className={`nes-btn is-small ${theme === 'dark' ? 'is-warning' : ''}`} onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}>
             {theme === 'dark' ? '🌙' : '☀️'}
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
            showGridLines={showGridLines}
            setShowGridLines={setShowGridLines}
            onExport={handleExport}
            t={t}
            theme={theme}
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
           <BomTable grid={grid} selectedBead={selectedBead} t={t} theme={theme} />
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
    </div>
  );
};

export default App;