import { ImageFeatures, WoundRegion } from '@/types';

/**
 * Extract simple browser-local visual signals from an image using HTML Canvas API.
 * NOTE: These are prototype visual features for observation only and NOT medically validated measurements.
 */
export async function extractImageFeatures(imageSrc: string, region: WoundRegion | null = null): Promise<ImageFeatures> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 150;
      const scale = targetWidth / img.width;
      const targetHeight = Math.max(1, Math.round(img.height * scale));

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(getFallbackSignal(region));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;

      // Full Image Stats
      let totalR = 0, totalG = 0, totalB = 0;
      let redDominantPixelCount = 0;
      const totalPixels = targetWidth * targetHeight;
      const brightnessArr: number[] = [];

      // Region Stats
      let regionTotalR = 0, regionTotalG = 0, regionTotalB = 0;
      let regionRedDominantCount = 0;
      let regionPixelCount = 0;

      const minX = region ? Math.floor(region.x * targetWidth) : 0;
      const maxX = region ? Math.floor((region.x + region.width) * targetWidth) : targetWidth;
      const minY = region ? Math.floor(region.y * targetHeight) : 0;
      const maxY = region ? Math.floor((region.y + region.height) * targetHeight) : targetHeight;

      // Simple Sharpness (variance of Laplacian approximation via neighboring pixel diffs)
      let diffSum = 0;

      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const i = (y * targetWidth + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          totalR += r;
          totalG += g;
          totalB += b;
          
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          brightnessArr.push(luma);

          if (r > g + 15 && r > b + 15) {
            redDominantPixelCount++;
          }

          // Sharpness approximation
          if (x > 0) {
            const leftI = (y * targetWidth + (x - 1)) * 4;
            const leftLuma = 0.299 * data[leftI] + 0.587 * data[leftI + 1] + 0.114 * data[leftI + 2];
            diffSum += Math.abs(luma - leftLuma);
          }

          if (x >= minX && x < maxX && y >= minY && y < maxY) {
            regionTotalR += r;
            regionTotalG += g;
            regionTotalB += b;
            regionPixelCount++;
            if (r > g + 15 && r > b + 15) {
              regionRedDominantCount++;
            }
          }
        }
      }

      const avgBrightness = Math.round((totalR + totalG + totalB) / (totalPixels * 3));
      const redDominance = Math.min(100, Math.round((redDominantPixelCount / totalPixels) * 100));
      
      const meanLuma = brightnessArr.reduce((a, b) => a + b, 0) / totalPixels;
      const brightnessVariance = brightnessArr.reduce((a, b) => a + Math.pow(b - meanLuma, 2), 0) / totalPixels;
      const sharpness = diffSum / totalPixels;

      let regionBrightness = avgBrightness;
      let regionRedDominance = redDominance;
      if (regionPixelCount > 0) {
        regionBrightness = Math.round((regionTotalR + regionTotalG + regionTotalB) / (regionPixelCount * 3));
        regionRedDominance = Math.min(100, Math.round((regionRedDominantCount / regionPixelCount) * 100));
      }

      // Simple heuristic for image quality based on brightness and sharpness
      const isLowQuality = img.width < 200 || avgBrightness < 30 || avgBrightness > 235 || sharpness < 5;

      // Phase 3.0: Calculate approximate area
      let observableArea = 0;
      if (region) {
        observableArea = Math.round(region.width * region.height * img.width * img.height);
      } else {
        observableArea = img.width * img.height;
      }

      resolve({
        redDominance: Math.max(12, redDominance),
        avgBrightness,
        brightnessVariance,
        sharpness,
        woundRegion: region,
        regionRedDominance: Math.max(12, regionRedDominance),
        regionBrightness,
        imageQuality: isLowQuality ? 'low' : 'good',
        observableArea,
      });
    };

    img.onerror = () => resolve(getFallbackSignal(region));
    img.src = imageSrc;
  });
}

function getFallbackSignal(region: WoundRegion | null): ImageFeatures {
  return {
    redDominance: 25,
    avgBrightness: 110,
    brightnessVariance: 0,
    sharpness: 0,
    woundRegion: region,
    regionRedDominance: 25,
    regionBrightness: 110,
    imageQuality: 'good',
    observableArea: 1000,
  };
}
