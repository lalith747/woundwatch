import React from 'react';
import { RecoveryCheck } from '@/types';

interface SparklinesProps {
  checks: RecoveryCheck[];
}

export const Sparklines: React.FC<SparklinesProps> = ({ checks }) => {
  if (checks.length < 3) {
    return (
      <div className="bg-surface-soft dark:bg-surface-darkSoft border border-surface-border dark:border-surface-darkBorder rounded-3xl p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold h-full flex items-center justify-center min-h-[140px]">
        Not enough observations to draw trajectory
      </div>
    );
  }

  // Sort checks by date ascending (oldest first)
  const sortedChecks = [...checks].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const padding = 16;
  const height = 100;
  const width = 250;
  
  const generatePath = (
    data: number[],
    min: number,
    max: number,
    color: string
  ) => {
    if (data.length === 0) return null;
    
    // Scale X
    const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
    
    // Scale Y
    const rangeY = max - min;
    // Add some padding to Y range so dots don't hit the absolute top/bottom edges
    const paddedRangeY = rangeY === 0 ? 1 : rangeY * 1.2;
    const paddedMin = min - (rangeY === 0 ? 0.5 : rangeY * 0.1);
    
    const points = data.map((value, index) => {
      const x = padding + index * stepX;
      // Invert Y because SVG coordinates go top-down
      const y = height - padding - ((value - paddedMin) / paddedRangeY) * (height - padding * 2);
      return { x, y, value };
    });

    const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
        ))}
      </svg>
    );
  };

  const pains = sortedChecks.map(c => c.context.pain);
  const visuals = sortedChecks.map(c => c.visualSignal.regionRedDominance ?? c.visualSignal.redDominance);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Pain Sparkline */}
      <div className="bg-surface-soft dark:bg-surface-darkSoft border border-surface-border dark:border-surface-darkBorder rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pain Trajectory</span>
          <span className="text-sm font-extrabold text-amber-500">{pains[pains.length - 1]} / 10</span>
        </div>
        <div className="h-20 w-full relative -ml-1">
          {generatePath(pains, 0, 10, '#f59e0b')}
        </div>
      </div>

      {/* Visual Signal Sparkline */}
      <div className="bg-surface-soft dark:bg-surface-darkSoft border border-surface-border dark:border-surface-darkBorder rounded-3xl p-5 space-y-4">
         <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Trajectory</span>
          <span className="text-sm font-extrabold text-brand-500">{visuals[visuals.length - 1]}%</span>
        </div>
        <div className="h-20 w-full relative -ml-1">
          {generatePath(visuals, Math.max(0, Math.min(...visuals) - 10), Math.min(100, Math.max(...visuals) + 10), '#3b82f6')}
        </div>
      </div>
    </div>
  );
};
