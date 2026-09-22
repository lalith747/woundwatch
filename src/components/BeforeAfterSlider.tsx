import React, { useState, useRef, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel: string;
  afterLabel: string;
  beforeSignal: number;
  afterSignal: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImageUrl,
  afterImageUrl,
  beforeLabel,
  afterLabel,
  beforeSignal,
  afterSignal,
}) => {
  const [position, setPosition] = useState(50); // 0–100 percent
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
    const onMove = (ev: MouseEvent) => {
      if (isDragging.current) updatePosition(ev.clientX);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    isDragging.current = true;
    updatePosition(touch.clientX);
    const onMove = (ev: TouchEvent) => {
      if (isDragging.current) updatePosition(ev.touches[0].clientX);
    };
    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  const delta = afterSignal - beforeSignal;
  const deltaStr = delta < 0 ? `↓ ${Math.abs(delta)} pp` : delta > 0 ? `↑ ${delta} pp` : '—';
  const deltaColor = delta < 0 ? 'text-emerald-600 dark:text-emerald-400' : delta > 0 ? 'text-rose-500' : 'text-slate-400';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
        <span>Visual comparison</span>
        <span className="text-[10px] text-slate-400 normal-case font-medium">drag to compare</span>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-surface-border dark:border-surface-darkBorder select-none cursor-col-resize"
        style={{ aspectRatio: '500/380' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* After image (full width, underneath) */}
        <img
          src={afterImageUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before image (clipped to left of handle) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeImageUrl}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: `${10000 / position}%`, maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
          style={{ left: `${position}%` }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center shadow-md cursor-col-resize"
          style={{ left: `${position}%` }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path d="M5 1L1 6L5 11M13 1L17 6L13 11" stroke="#00598e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Day labels on image */}
        <div className="absolute top-2 left-2 z-10 bg-brand-900/90 text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
          {beforeLabel}
        </div>
        <div className="absolute top-2 right-2 z-10 bg-brand-900/90 text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
          {afterLabel}
        </div>
      </div>

      {/* Signal readout */}
      <div className="grid grid-cols-3 items-center bg-slate-50 dark:bg-surface-dark rounded-xl border border-surface-border dark:border-surface-darkBorder p-4 text-sm">
        <div className="text-left">
          <div className="font-extrabold text-slate-900 dark:text-white text-lg">{beforeSignal}%</div>
          <div className="text-xs text-slate-500">{beforeLabel} signal</div>
        </div>
        <div className={`text-center font-extrabold text-base ${deltaColor}`}>
          {deltaStr}
        </div>
        <div className="text-right">
          <div className="font-extrabold text-slate-900 dark:text-white text-lg">{afterSignal}%</div>
          <div className="text-xs text-slate-500">{afterLabel} signal</div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Observable visual signal {delta < 0 ? `decreased from ${beforeSignal}% to ${afterSignal}%.` : delta > 0 ? `increased from ${beforeSignal}% to ${afterSignal}.` : 'is unchanged.'}
        {' '}This reflects the measured red-channel presence in the selected wound region — not a clinical assessment.
      </p>
    </div>
  );
};
