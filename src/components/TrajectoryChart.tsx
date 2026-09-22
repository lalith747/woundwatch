import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  day: number;
  value: number; // The combined trajectory value 0-100
  label: string; // e.g. "Day 1", "Today"
}

interface Props {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export function TrajectoryChart({ data, width = 600, height = 250 }: Props) {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 30, bottom: 30, left: 30 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scale functions
  const getX = (index: number) => {
    if (data.length === 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };
  // Invert Y axis so 100 is at top
  const getY = (val: number) => padding.top + innerHeight - (val / 100) * innerHeight;

  const points = data.map((d, index) => ({
    x: getX(index),
    y: getY(d.value),
    label: d.label,
    value: d.value
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  
  // Area under the curve
  const areaD = `${pathD} L ${points[points.length - 1].x},${padding.top + innerHeight} L ${points[0].x},${padding.top + innerHeight} Z`;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden" style={{ minWidth: 300 }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trajectory-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = getY(val);
          return (
            <line 
              key={`grid-${val}`} 
              x1={padding.left} 
              y1={y} 
              x2={width - padding.right} 
              y2={y} 
              stroke="#1e293b" 
              strokeWidth="1" 
              strokeDasharray="4 4" 
            />
          );
        })}

        {/* Area */}
        <motion.path 
          d={areaD} 
          fill="url(#trajectory-gradient)" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Line */}
        <motion.path 
          d={pathD} 
          fill="none" 
          stroke="#38bdf8" 
          strokeWidth="3" 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Points & Labels */}
        {points.map((p, i) => (
          <motion.g 
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + (i * 0.1), duration: 0.3 }}
          >
            <circle cx={p.x} cy={p.y} r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            
            {/* Label below point */}
            <text x={p.x} y={height - 5} textAnchor="middle" fill="#94a3b8" fontSize="12">
              {p.label}
            </text>
            
            {/* Value tooltip-like text above point */}
            <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="600">
              {Math.round(p.value)}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
