import React, { useState, useRef, useEffect } from 'react';
import { WoundRegion } from '@/types';
import { Target, Check, RefreshCw } from 'lucide-react';

interface WoundRegionSelectProps {
  imageSrc: string;
  onRegionSelected: (region: WoundRegion) => void;
  onRetake: () => void;
}

export const WoundRegionSelect: React.FC<WoundRegionSelectProps> = ({
  imageSrc,
  onRegionSelected,
  onRetake,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [finalRegion, setFinalRegion] = useState<WoundRegion | null>(null);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Clamp coordinates to container bounds
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    return { 
      x: x / rect.width, 
      y: y / rect.height 
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch devices while drawing
    setFinalRegion(null);
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setStartPos(coords);
    setCurrentBox({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const currentPos = getCoordinates(e);
    
    setCurrentBox({
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      w: Math.abs(currentPos.x - startPos.x),
      h: Math.abs(currentPos.y - startPos.y)
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentBox) return;
    setIsDrawing(false);
    
    // Ignore tiny clicks (must drag a bit)
    if (currentBox.w > 0.05 && currentBox.h > 0.05) {
      setFinalRegion({
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.w,
        height: currentBox.h,
      });
    } else {
      setCurrentBox(null);
    }
  };

  // Prevent scrolling when touching the drawing area
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const preventScroll = (e: TouchEvent) => { e.preventDefault(); };
    el.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      el.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4 sm:p-0">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-brand-500" />
          Target Region
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Draw a box around the primary wound area to focus the analysis.
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 border-2 border-surface-border dark:border-surface-darkBorder shadow-xl cursor-crosshair touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <img
          src={imageSrc}
          alt="Wound to target"
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* Darkened overlay outside the box */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Drawn Box */}
        {currentBox && (
          <div 
            className="absolute border-2 border-brand-400 bg-brand-400/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
            style={{
              left: `${currentBox.x * 100}%`,
              top: `${currentBox.y * 100}%`,
              width: `${currentBox.w * 100}%`,
              height: `${currentBox.h * 100}%`,
            }}
          >
            {/* Corner handlers purely for visuals */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-500 rounded-full" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-brand-500 rounded-full" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-500 rounded-full" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-brand-500 rounded-full" />
          </div>
        )}

        {!currentBox && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white font-medium text-sm drop-shadow-md">
            Tap and drag to select region
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            setCurrentBox(null);
            setFinalRegion(null);
          }}
          className="flex-1 py-3.5 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear Selection</span>
        </button>
        <button
          onClick={() => finalRegion && onRegionSelected(finalRegion)}
          disabled={!finalRegion}
          className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
            finalRegion 
              ? 'bg-brand-500 hover:bg-brand-600 cursor-pointer' 
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Confirm Region</span>
        </button>
      </div>
      
      <div className="text-center mt-2">
         <button onClick={onRetake} className="text-xs text-slate-400 font-medium hover:text-slate-600 dark:hover:text-slate-200 underline">
            Retake Photo Instead
         </button>
      </div>
    </div>
  );
};
