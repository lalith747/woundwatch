import React, { useEffect, useRef } from 'react';
import { WoundRegion } from '@/types';

interface HeatmapOverlayProps {
  imageUrl: string;
  woundRegion: WoundRegion | null;
  redSignal: number; // 0–100
  className?: string;
}

/**
 * Draws the wound photograph with a canvas-based colour signal overlay
 * on the selected wound region. Deliberately labelled "Observed Color Signal"
 * — not "infection level" or anything clinical.
 */
export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  imageUrl,
  woundRegion,
  redSignal,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    imgRef.current = img;
    img.onload = () => {
      // Set canvas size to image natural size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      if (!woundRegion) return;

      // Pixel coords from normalized region
      const rx = woundRegion.x * canvas.width;
      const ry = woundRegion.y * canvas.height;
      const rw = woundRegion.width * canvas.width;
      const rh = woundRegion.height * canvas.height;

      // Get image data for region only
      const imageData = ctx.getImageData(rx, ry, rw, rh);
      const data = imageData.data;

      // Build heatmap overlay on a second canvas
      const overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = rw;
      overlayCanvas.height = rh;
      const octx = overlayCanvas.getContext('2d')!;
      const overlayData = octx.createImageData(rw, rh);
      const od = overlayData.data;

      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];

        // Local red dominance for this pixel
        const total = pr + pg + pb;
        const localRed = total > 0 ? pr / total : 0.33;

        // Map to a signal scale: blue (low) → yellow (mid) → red (high)
        const signal = Math.min(1, Math.max(0, (localRed - 0.3) / 0.4));

        // Colour map: 0=cyan-blue, 0.5=amber, 1=red
        let r: number, g: number, b: number;
        if (signal < 0.5) {
          const t = signal * 2;
          r = Math.round(0 + t * 255);
          g = Math.round(150 + t * 80);
          b = Math.round(180 - t * 180);
        } else {
          const t = (signal - 0.5) * 2;
          r = 255;
          g = Math.round(230 - t * 230);
          b = 0;
        }

        od[i] = r;
        od[i + 1] = g;
        od[i + 2] = b;
        od[i + 3] = 140; // semi-transparent
      }

      octx.putImageData(overlayData, 0, 0);

      // Draw overlay onto main canvas clipped to region
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(overlayCanvas, rx, ry);
      ctx.restore();

      // Draw region border
      ctx.save();
      ctx.strokeStyle = '#00598e';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();

      // Signal label inside region
      ctx.save();
      ctx.fillStyle = 'rgba(0,26,42,0.88)';
      ctx.roundRect(rx + 4, ry + 4, 110, 26, 6);
      ctx.fill();
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillStyle = '#fcd54d';
      ctx.fillText(`Signal: ${redSignal}%`, rx + 10, ry + 22);
      ctx.restore();
    };
    img.src = imageUrl;
  }, [imageUrl, woundRegion, redSignal]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
        <span>Observed color signal</span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-surface-border dark:border-surface-darkBorder">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
        <span>Lower observed red-channel</span>
        <div className="flex-1 mx-2 h-2 rounded-full" style={{
          background: 'linear-gradient(to right, #00b4d8, #ffd166, #ef233c)'
        }} />
        <span>Higher observed red-channel</span>
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed">
        This map shows the measured red-channel intensity within the selected wound region.
        It does not indicate infection, severity, or any clinical outcome.
      </p>
    </div>
  );
};
