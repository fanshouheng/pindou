import React, { useRef, useEffect, useState, MouseEvent, WheelEvent } from 'react';
import { BeadGrid, Bead, ToolMode } from '../types';
import { CELL_SIZE } from '../constants';
import { Theme } from '../locales';

interface EditorCanvasProps {
  grid: BeadGrid;
  setGrid: (grid: BeadGrid) => void;
  selectedBead: Bead;
  toolMode: ToolMode;
  showGridLines: boolean;
  t: any;
  theme: Theme;
}

interface HoverState {
  xGrid: number;
  yGrid: number;
  screenX: number;
  screenY: number;
  bead: Bead | null;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  grid,
  setGrid,
  selectedBead,
  toolMode,
  showGridLines,
  t,
  theme
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverState | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Transform State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  // Global Key Listeners for Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initial Fit Logic
  useEffect(() => {
    if (!viewportRef.current || width === 0) return;
    const viewport = viewportRef.current.getBoundingClientRect();
    const contentW = width * CELL_SIZE;
    const contentH = height * CELL_SIZE;
    const padding = 60;
    const availW = viewport.width - padding;
    const availH = viewport.height - padding;
    const scale = Math.min(availW / contentW, availH / contentH, 1.0); 
    const k = Math.max(0.1, scale);
    const x = (viewport.width - contentW * k) / 2;
    const y = (viewport.height - contentH * k) / 2;
    setTransform({ x, y, k });
  }, [width, height]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color1 = theme === 'dark' ? '#333' : '#e0e0e0';
    const color2 = theme === 'dark' ? '#444' : '#f0f0f0';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const bead = grid[y][x];
        if (bead) {
          ctx.fillStyle = bead.hex;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? color1 : color2;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    if (showGridLines) {
      ctx.strokeStyle = theme === 'dark' ? 'rgba(128, 128, 128, 0.4)' : 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x++) {
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE);
      }
      for (let y = 0; y <= height; y++) {
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE);
      }
      ctx.stroke();
    }
  }, [grid, showGridLines, width, height, theme]);

  const getGridCoordinates = (clientX: number, clientY: number) => {
    if (!viewportRef.current) return null;
    const rect = viewportRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const canvasX = (mouseX - transform.x) / transform.k;
    const canvasY = (mouseY - transform.y) / transform.k;
    const x = Math.floor(canvasX / CELL_SIZE);
    const y = Math.floor(canvasY / CELL_SIZE);

    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return { x, y };
  };

  const handleAction = (clientX: number, clientY: number) => {
    const coords = getGridCoordinates(clientX, clientY);
    if (!coords) return;
    const { x, y } = coords;
    const targetCell = grid[y][x];

    const newGrid = grid.map(row => [...row]);

    // WAND: Global Remove (Make Transparent)
    if (toolMode === ToolMode.WAND) {
        if (!targetCell) return; // Already empty
        const targetId = targetCell.id;
        for(let r=0; r<height; r++){
            for(let c=0; c<width; c++){
                if (newGrid[r][c]?.id === targetId) {
                    newGrid[r][c] = null;
                }
            }
        }
        setGrid(newGrid);
        return;
    }
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!viewportRef.current) return;
    const ZOOM_SPEED = -0.001;
    const delta = e.deltaY * ZOOM_SPEED;
    const newK = Math.max(0.1, Math.min(8, transform.k * (1 + delta)));
    const rect = viewportRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newX = mouseX - (mouseX - transform.x) * (newK / transform.k);
    const newY = mouseY - (mouseY - transform.y) * (newK / transform.k);
    setTransform({ k: newK, x: newX, y: newY });
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 1 || e.button === 2 || isSpacePressed) {
      e.preventDefault();
      setIsPanning(true);
      return;
    }
    
    if (e.button === 0) {
      setIsDrawing(true);
      handleAction(e.clientX, e.clientY);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
      return;
    }

    const coords = getGridCoordinates(e.clientX, e.clientY);

    if (coords) {
      setHoverInfo({ 
        xGrid: coords.x, 
        yGrid: coords.y, 
        screenX: e.clientX,
        screenY: e.clientY,
        bead: grid[coords.y][coords.x] 
      });
    } else {
      setHoverInfo(null);
    }
  };

  const onMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };
  
  const onMouseLeave = () => {
    setIsDrawing(false);
    setIsPanning(false);
    setHoverInfo(null);
  };

   if (width === 0) return null;

  const borderColor = theme === 'dark' ? 'border-white' : 'border-gray-800';
  
  let cursorStyle = 'cursor-default';
  if (isPanning) cursorStyle = 'cursor-grabbing';
  else if (isSpacePressed) cursorStyle = 'cursor-grab';
  else if (toolMode === ToolMode.WAND) cursorStyle = 'cursor-no-drop'; // Wand/Remove

  return (
    <div 
      ref={viewportRef}
      className={`relative w-full h-full overflow-hidden select-none ${cursorStyle}`}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => e.preventDefault()} 
    >
      <div 
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: '0 0',
          width: width * CELL_SIZE,
          height: height * CELL_SIZE,
          willChange: 'transform'
        }}
      >
        <canvas
          ref={canvasRef}
          width={width * CELL_SIZE}
          height={height * CELL_SIZE}
          className={`block ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border-2 ${borderColor} shadow-xl`}
          style={{ 
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {hoverInfo && hoverInfo.bead && !isPanning && (
        <div 
          className="fixed z-50 p-2 bg-yellow-100 text-black border-2 border-black text-xs pointer-events-none whitespace-nowrap shadow-lg"
          style={{ 
            left: hoverInfo.screenX + 15, 
            top: hoverInfo.screenY + 15 
          }}
        >
          <p>{hoverInfo.bead.id}</p>
          <p>{t.beadNames[hoverInfo.bead.name] || hoverInfo.bead.name}</p>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs pointer-events-none backdrop-blur-sm">
         {Math.round(transform.k * 100)}%
      </div>
      
      <div className="absolute top-4 right-4 text-gray-400 text-xs pointer-events-none opacity-50">
         {t.controlsHint}
      </div>
    </div>
  );
};

export default EditorCanvas;