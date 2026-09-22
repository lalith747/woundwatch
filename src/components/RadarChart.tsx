import React from 'react';

interface RadarData {
  pain: number; // 0-100 (scaled from 0-10)
  visual: number; // 0-100
  area: number; // 0-100 (scaled max expected area)
  symptoms: number; // 0-100 (scaled symptom count)
}

interface Props {
  data: RadarData;
  previousData?: RadarData;
  size?: number;
}

export function RadarChart({ data, previousData, size = 200 }: Props) {
  const center = size / 2;
  const radius = (size / 2) * 0.65; // Leave enough padding for long labels

  // Coordinates for 4 axes (top, right, bottom, left)
  // Pain (Top), Visual (Right), Area (Bottom), Symptoms (Left)
  const getPoint = (value: number, angleIndex: number, totalAxes: number = 4) => {
    const angle = (Math.PI * 2 * angleIndex) / totalAxes - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const currentPoints = [
    getPoint(data.pain, 0),
    getPoint(data.visual, 1),
    getPoint(data.area, 2),
    getPoint(data.symptoms, 3),
  ];

  const currentPath = `M ${currentPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  let previousPath = '';
  if (previousData) {
    const prevPoints = [
      getPoint(previousData.pain, 0),
      getPoint(previousData.visual, 1),
      getPoint(previousData.area, 2),
      getPoint(previousData.symptoms, 3),
    ];
    previousPath = `M ${prevPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
  }

  // Grid rings
  const rings = [25, 50, 75, 100].map(val => {
    const pts = [0, 1, 2, 3].map(i => getPoint(val, i));
    return `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
  });

  return (
    <div className="relative flex justify-center items-center w-full">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {/* Grid */}
        {rings.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {/* Axes */}
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#475569" strokeWidth="1" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#475569" strokeWidth="1" />
        
        {/* Previous Data (Baseline/Yesterday) */}
        {previousData && (
          <path d={previousPath} fill="rgba(148, 163, 184, 0.2)" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        )}

        {/* Current Data */}
        <path d={currentPath} fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeWidth="2" />
        {currentPoints.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="4" fill="#38bdf8" />
        ))}

        {/* Labels */}
        <text x={center} y={center - radius - 10} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="500">Pain</text>
        <text x={center + radius + 10} y={center + 4} textAnchor="start" fill="#94a3b8" fontSize="12" fontWeight="500">Visual</text>
        <text x={center} y={center + radius + 20} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="500">Area</text>
        <text x={center - radius - 10} y={center + 4} textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="500">Symptoms</text>
      </svg>
    </div>
  );
}
