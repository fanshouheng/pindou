import React, { ChangeEvent, useState, useMemo } from 'react';
import { BEAD_PALETTE } from '../constants';
import { Bead, ToolMode, MatchStrategy } from '../types';
import { Theme } from '../locales';

interface SidebarProps {
  onImageUpload: (file: File) => void;
  width: number;
  setWidth: (w: number) => void;
  selectedBead: Bead;
  setSelectedBead: (bead: Bead) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  matchStrategy: MatchStrategy;
  setMatchStrategy: (s: MatchStrategy) => void;
  onDenoise: () => void;
  showGridLines: boolean;
  setShowGridLines: (show: boolean) => void;
  onExport: () => void;
  t: any;
  theme: Theme;
  replaceModeBeadId: string | null;
  onReplaceBead: ((bead: Bead) => void) | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  onImageUpload,
  width,
  setWidth,
  selectedBead,
  setSelectedBead,
  toolMode,
  setToolMode,
  matchStrategy,
  setMatchStrategy,
  onDenoise,
  showGridLines,
  setShowGridLines,
  onExport,
  t,
  theme,
  replaceModeBeadId,
  onReplaceBead
}) => {

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  // Professional tool styling - 1px solid borders, no box-shadow
  const sidebarBg = theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-100';
  const panelBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#333]' : 'border-gray-300';
  const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const mutedText = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const dividerColor = theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200';

  // 1px solid border style (no box-shadow, professional look)
  const panelClass = `border ${borderColor} ${panelBg} rounded-sm`;

  // Unified gray button style for all buttons
  const buttonGray = theme === 'dark'
    ? 'bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 hover:bg-[#3a3a3a] cursor-pointer rounded-sm'
    : 'bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-300 cursor-pointer rounded-sm';

  // 16px font styling with Zpix pixel font
  const font16Class = 'text-base zpix-text';
  const inputClass = `w-full h-8 px-2 ${font16Class} border ${borderColor} ${theme === 'dark' ? 'bg-[#0a0a0a] text-gray-200' : 'bg-white text-gray-800'} outline-none rounded-sm`;
  const checkboxClass = `w-4 h-4 border ${borderColor} ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'} cursor-pointer rounded-sm`;
  const radioClass = `w-4 h-4 border ${borderColor} ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'} cursor-pointer rounded-sm`;

  // Title style: 18px (text-lg)
  const titleClass = `text-lg font-bold border-b ${dividerColor} pb-1 mb-2`;

  // Palette category filter state
  const [paletteFilter, setPaletteFilter] = useState<string>('ALL');

  // Get unique first letters from BEAD_PALETTE
  const categoryOptions = useMemo(() => {
    const letters = new Set(BEAD_PALETTE.map(bead => bead.id.charAt(0).toUpperCase()));
    return ['ALL', ...Array.from(letters).sort()];
  }, []);

  // Filter colors based on selected category
  const filteredPalette = useMemo(() => {
    if (paletteFilter === 'ALL') return BEAD_PALETTE;
    return BEAD_PALETTE.filter(bead => bead.id.charAt(0).toUpperCase() === paletteFilter);
  }, [paletteFilter]);

  return (
    <div className={`w-full h-full flex flex-col p-2 gap-1.5 overflow-hidden ${sidebarBg} ${textColor}`}>

      {/* SECTION 1: Project & Adjustments */}
      <div className={`${panelClass} p-2.5 flex-shrink-0`}>
        <p className={titleClass}>{t.import || "Project"}</p>

        <div className="mb-2">
          <button className={`w-full h-9 ${font16Class} border ${buttonGray} pixel-btn flex items-center justify-center relative`}>
            <span>{t.uploadImage}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </button>

          <div className="flex items-center gap-2">
            <label className={`${font16Class} flex-shrink-0`}>{t.width}</label>
            <input
              type="number"
              className={inputClass}
              value={width}
              onChange={(e) => setWidth(Math.max(10, Math.min(200, parseInt(e.target.value) || 50)))}
            />
          </div>
        </div>

        <div className={`border-t ${dividerColor} my-1.5`}></div>

        {/* Algorithm Selection */}
        <div className="mb-2">
            <label className={`${font16Class} block mb-1`}>{t.algorithm}</label>
            <div className="flex flex-col gap-1">
                <label className={`flex items-center ${font16Class} cursor-pointer`}>
                    <input
                        type="radio"
                        className={radioClass}
                        style={{ marginRight: '6px' }}
                        checked={matchStrategy === 'perceptual'}
                        onChange={() => setMatchStrategy('perceptual')}
                    />
                    <span>{t.modePerceptual}</span>
                </label>
                <label className={`flex items-center ${font16Class} cursor-pointer`}>
                    <input
                        type="radio"
                        className={radioClass}
                        style={{ marginRight: '6px' }}
                        checked={matchStrategy === 'contrast'}
                        onChange={() => setMatchStrategy('contrast')}
                    />
                    <span>{t.modeContrast}</span>
                </label>
            </div>
        </div>

      </div>

      {/* SECTION 2: Tools - Smart Actions */}
      <div className={`${panelClass} p-2.5 flex-shrink-0`}>
        <p className={titleClass}>{t.tools}</p>

        {/* Two side-by-side gray buttons */}
        <div className="flex gap-1.5">
          {/* Smart Cutout Button - gray */}
          <button
            className={`flex-1 h-9 ${font16Class} border ${buttonGray} pixel-btn flex items-center justify-center`}
            onClick={() => setToolMode(ToolMode.WAND)}
          >
            {t.smartCutout || '智能抠图'}
          </button>

          {/* Denoise Button - gray */}
          <button
            className={`flex-1 h-9 ${font16Class} border ${buttonGray} pixel-btn flex items-center justify-center`}
            onClick={onDenoise}
          >
            {t.denoise}
          </button>
        </div>

        {/* Grid Toggle */}
        <div className="flex items-center justify-between mt-1.5">
          <label className={`flex items-center ${font16Class} cursor-pointer`}>
            <input
              type="checkbox"
              className={checkboxClass}
              style={{ marginRight: '6px' }}
              checked={showGridLines}
              onChange={(e) => setShowGridLines(e.target.checked)}
            />
            <span className={mutedText}>{t.showGrid}</span>
          </label>
        </div>
      </div>

      {/* SECTION 3: Palette with Category Filter */}
      <div className={`${panelClass} p-2.5 flex-1 flex flex-col min-h-0`}>
        {/* Title with Category Filter */}
        <div className="flex items-center justify-between mb-2">
          <p className={titleClass}>{t.palette}</p>
          <select
            value={paletteFilter}
            onChange={(e) => setPaletteFilter(e.target.value)}
            className={`h-7 px-2 ${font16Class} border ${borderColor} ${theme === 'dark' ? 'bg-[#2a2a2a] text-gray-200' : 'bg-white text-gray-800'} outline-none cursor-pointer rounded-sm`}
            style={{ minWidth: '60px' }}
          >
            {categoryOptions.map(option => (
              <option key={option} value={option}>
                {option === 'ALL' ? '全部' : option}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Color Preview */}
        <div className={`mb-1 flex items-center gap-2 p-1 border ${borderColor} ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-sm`}>
           <div
             className="w-6 h-6 border border-[#555] flex-shrink-0 rounded-sm"
             style={{ backgroundColor: selectedBead.hex }}
           ></div>
           <div className={`${font16Class} leading-tight truncate flex-1`}>
             <span className="font-bold mr-1">{selectedBead.id}</span>
             <span className={mutedText}>{t.beadNames[selectedBead.name] || selectedBead.name}</span>
           </div>
        </div>

        {/* Replace Mode Indicator */}
        {replaceModeBeadId && (
          <div className="mb-2 p-2 bg-green-100 border border-green-400 rounded-sm">
             <p className={`${font16Class} text-green-800`}>
               <i className="nes-icon is-small exchange mr-1"></i>
               替换颜色 {replaceModeBeadId}
             </p>
             <p className={`${font16Class} text-green-600 mt-1 text-sm`}>请选择新颜色</p>
          </div>
        )}

        {/* Color Grid - flex layout with fixed 24px squares */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div 
              className="flex flex-wrap content-start"
              style={{ 
                gap: '2px',
                width: 'calc(100% + 4px)', // Compensate for negative margin if any
                margin: '-2px'
              }}
            >
            {filteredPalette.map(bead => (
                <div
                  key={bead.id}
                  onClick={() => {
                    if (replaceModeBeadId && onReplaceBead) {
                      onReplaceBead(bead);
                    } else {
                      setSelectedBead(bead);
                    }
                  }}
                  className={`w-6 h-6 flex-shrink-0 cursor-pointer transition-all relative ${
                    selectedBead.id === bead.id
                      ? 'ring-2 ring-yellow-400 z-10 scale-105'
                      : replaceModeBeadId
                      ? 'ring-2 ring-green-400 z-10 scale-105 animate-pulse'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: bead.hex,
                    boxShadow: 'none'
                  }}
                  title={`${bead.id} - ${t.beadNames[bead.name] || bead.name}`}
                />
            ))}
            </div>
        </div>
      </div>

      {/* SECTION 4: Export */}
      <div className={`${panelClass} p-2.5 flex-shrink-0 mt-auto`}>
        <p className={titleClass}>{t.export}</p>
        <button className={`w-full h-9 ${font16Class} border ${buttonGray} pixel-btn flex items-center justify-center`} onClick={onExport}>
          {t.downloadPng}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
