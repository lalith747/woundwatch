import { RecoveryCheck } from '@/types';

/**
 * Generate synthetic demo SVG images that clearly communicate they are not real clinical photos.
 */
function makeSyntheticSvg(day: number, redSignal: number, isBlurry: boolean = false): string {
  const r = Math.round(180 + (redSignal / 100) * 60);
  const g = Math.round(120 - (redSignal / 100) * 80);
  const b = Math.round(100 - (redSignal / 100) * 60);
  const coreColor = `rgb(${r},${g},${b})`;
  const haloOpacity = (redSignal / 100) * 0.5 + 0.1;
  const coreRadius = 30 + (redSignal / 100) * 18;
  const haloRadius = coreRadius + 22;
  const filter = isBlurry ? 'filter="url(#blur)"' : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="380" viewBox="0 0 500 380">
  <defs>
    <filter id="blur">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>
  <rect width="500" height="380" fill="#f5deb3"/>
  <line x1="0" y1="95" x2="500" y2="85" stroke="#e8cfa0" stroke-width="1.5" opacity="0.5"/>
  <line x1="0" y1="185" x2="500" y2="178" stroke="#e8cfa0" stroke-width="1.5" opacity="0.5"/>
  <line x1="0" y1="275" x2="500" y2="268" stroke="#e8cfa0" stroke-width="1.5" opacity="0.5"/>
  <g ${filter}>
    <circle cx="250" cy="185" r="${haloRadius}" fill="${coreColor}" opacity="${haloOpacity.toFixed(2)}"/>
    <circle cx="250" cy="185" r="${coreRadius.toFixed(0)}" fill="${coreColor}" opacity="0.85"/>
  </g>
  ${!isBlurry ? `<rect x="175" y="115" width="150" height="140" rx="6" stroke="#00598e" stroke-width="2" stroke-dasharray="6 4" fill="none" opacity="0.8"/>` : ''}
  <rect x="14" y="14" width="80" height="28" rx="6" fill="#001a2a" opacity="0.9"/>
  <text x="54" y="32" font-family="sans-serif" font-size="12" font-weight="700" fill="#85c8f2" text-anchor="middle">Day ${day}</text>
  <rect x="0" y="346" width="500" height="34" fill="#001a2a" opacity="0.92"/>
  <text x="250" y="368" font-family="sans-serif" font-size="10" font-weight="700" fill="#85c8f2" text-anchor="middle" letter-spacing="1">SYNTHETIC DEMO DATA</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const now = Date.now();
const d = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();

// Base properties for shared days (Day 1, 2, 3)
const day1Base = {
  id: 'demo-day1', timestamp: d(4), imageUrl: makeSyntheticSvg(1, 31),
  visualSignal: { redDominance: 31, avgBrightness: 125, brightnessVariance: 52, sharpness: 14, woundRegion: { x: 0.35, y: 0.30, width: 0.30, height: 0.37 }, regionRedDominance: 31, regionBrightness: 125, imageQuality: 'good' as 'good' | 'low', observableArea: 1250 },
  context: { pain: 8, symptoms: ['Swelling', 'Warmth'] }
};

const day2Base = {
  id: 'demo-day2', timestamp: d(3), imageUrl: makeSyntheticSvg(2, 27),
  visualSignal: { redDominance: 27, avgBrightness: 132, brightnessVariance: 46, sharpness: 15, woundRegion: { x: 0.35, y: 0.30, width: 0.30, height: 0.37 }, regionRedDominance: 27, regionBrightness: 132, imageQuality: 'good' as const, observableArea: 1220 },
  context: { pain: 7, symptoms: ['Swelling'] }
};

const day3Base = {
  id: 'demo-day3', timestamp: d(2), imageUrl: makeSyntheticSvg(3, 23),
  visualSignal: { redDominance: 23, avgBrightness: 138, brightnessVariance: 43, sharpness: 16, woundRegion: { x: 0.35, y: 0.30, width: 0.30, height: 0.37 }, regionRedDominance: 23, regionBrightness: 138, imageQuality: 'good' as const, observableArea: 1150 },
  context: { pain: 5, symptoms: ['Mild itch'] }
};

// We will export a function to generate the scenario by running the engine over raw data.
import { observationEngine } from '../services/observationEngine';

export async function generateDemoScenario(scenarioType: 'improving' | 'change_point' | 'low_confidence' | 'seek_care'): Promise<RecoveryCheck[]> {
  const history: RecoveryCheck[] = [];
  
  // Create raw data sequence
  const rawData = [day1Base, day2Base, day3Base];
  
  if (scenarioType === 'improving') {
    rawData.push({
      id: 'demo-day4', timestamp: d(1), imageUrl: makeSyntheticSvg(4, 19),
      visualSignal: { redDominance: 19, avgBrightness: 143, brightnessVariance: 40, sharpness: 17, woundRegion: { x: 0.35, y: 0.30, width: 0.30, height: 0.37 }, regionRedDominance: 19, regionBrightness: 143, imageQuality: 'good' as 'good' | 'low', observableArea: 1080 },
      context: { pain: 4, symptoms: [] }
    });
    rawData.push({
      id: 'demo-day5', timestamp: d(0), imageUrl: makeSyntheticSvg(5, 15),
      visualSignal: { redDominance: 15, avgBrightness: 148, brightnessVariance: 38, sharpness: 18, woundRegion: { x: 0.35, y: 0.30, width: 0.30, height: 0.37 }, regionRedDominance: 15, regionBrightness: 148, imageQuality: 'good' as 'good' | 'low', observableArea: 1040 },
      context: { pain: 3, symptoms: [] }
    });
  } else if (scenarioType === 'change_point') {
    rawData.push({
      id: 'demo-day4-spike', timestamp: d(1), imageUrl: makeSyntheticSvg(4, 45), // Massive red spike
      visualSignal: { redDominance: 45, avgBrightness: 110, brightnessVariance: 55, sharpness: 17, woundRegion: { x: 0.35, y: 0.30, width: 0.35, height: 0.40 }, regionRedDominance: 45, regionBrightness: 110, imageQuality: 'good' as 'good' | 'low', observableArea: 1450 },
      context: { pain: 9, symptoms: ['Throbbing pain', 'Warmth'] }
    });
  } else if (scenarioType === 'low_confidence') {
    rawData.push({
      id: 'demo-day4-blurry', timestamp: d(1), imageUrl: makeSyntheticSvg(4, 25, true), // Blurry
      visualSignal: { redDominance: 25, avgBrightness: 100, brightnessVariance: 10, sharpness: 2, woundRegion: null as any, regionRedDominance: 25, regionBrightness: 100, imageQuality: 'low' as 'low', observableArea: 1150 },
      context: { pain: 0, symptoms: [] } // missing symptom data
    });
  } else if (scenarioType === 'seek_care') {
    rawData.push({
      id: 'demo-day4-danger', timestamp: d(1), imageUrl: makeSyntheticSvg(4, 35),
      visualSignal: { redDominance: 35, avgBrightness: 120, brightnessVariance: 45, sharpness: 16, woundRegion: { x: 0.35, y: 0.30, width: 0.30, height: 0.37 }, regionRedDominance: 35, regionBrightness: 120, imageQuality: 'good' as 'good' | 'low', observableArea: 1300 },
      context: { pain: 8, symptoms: ['Fever', 'Discharge'] } // Red flags
    });
  }

  // Run each through the engine to build up the history array with perfect derived values
  for (const raw of rawData) {
    // We pass a copy of history, but reversed since the engine expects [0] to be previous, [1] to be older
    const engineHistory = [...history].reverse();
    
    // We mock the image extraction step by overriding the engine temporarily or just pasting the raw fields
    // Actually, observationEngine.analyze takes a string and runs extractImageFeatures.
    // Instead of overriding, we can just assemble the ObservationResult manually using the engine's internal logic.
    // However, it's easier to just construct the RecoveryCheck here by duplicating the engine's logic for the demo,
    // OR just use the engine but mock the image feature extraction.
    
    // Since we exported the prototype class, we can instantiate a test version that skips extraction!
    const result = await observationEngine.analyze(raw.imageUrl, raw.context, engineHistory, raw.visualSignal);
    // Overwrite the visualSignal with our hardcoded demo one
    result.visualSignal = raw.visualSignal;
    
    // Re-run the engine analysis methods directly if they were public, but they are private.
    // Let's just use the result and overwrite visualSignal, it will be slightly off for the distance calc 
    // unless the image feature extractor returns exactly what we passed. 
    // Actually, since this is a demo, let's just use the real engine but bypass the image extraction.
    
    const check: RecoveryCheck = {
      id: raw.id,
      timestamp: raw.timestamp,
      imageUrl: raw.imageUrl,
      visualSignal: raw.visualSignal,
      context: raw.context,
      trend: result.trend,
      safetyLevel: result.safetyLevel,
      comparison: result.comparison,
      reasoning: result.reasoning,
      explanation: result.explanation,
      safetyPrompt: result.safetyPrompt,
      expectedRange: result.expectedRange,
      anomalies: result.anomalies,
      confidence: result.confidence,
      changePoint: result.changePoint,
      anomalyEvidence: result.anomalyEvidence
    };
    
    // But wait, the engine used `extractImageFeatures(raw.imageUrl)` which will return dummy data
    // because it doesn't know about `makeSyntheticSvg`. It will return some random data.
    // So the anomalies will be based on random data. 
    // Let's fix this by adding a `rawVisualSignal` parameter to the engine.
    
    history.push(check);
  }

  // Reverse back to match Dashboard expectations (newest first)
  return history.reverse();
}

// Fallback synchronous export for backwards compatibility during load
export const DEMO_CHECKS: RecoveryCheck[] = []; // Will be populated dynamically via App.tsx if empty
