import { 
  SymptomContext, 
  ImageFeatures, 
  Trend, 
  ObservationResult, 
  ObservationEngine, 
  RecoveryCheck, 
  SafetyLevel, 
  ObservationComparison,
  ObservationConfidence,
  ChangePoint,
  AnomalyEvidence
} from '@/types';
import { extractImageFeatures } from './imageFeatures';

export class PrototypeObservationEngine implements ObservationEngine {
  async analyze(imageSrc: string, context: SymptomContext, fullHistory: RecoveryCheck[] = [], overrideVisualSignal?: ImageFeatures): Promise<ObservationResult> {
    // 1. Extract visual features locally
    const visualSignal: ImageFeatures = overrideVisualSignal || await extractImageFeatures(imageSrc);

    // 2. Compute basic comparisons
    const comparison = this.computeComparison(visualSignal, context, fullHistory);

    // 3. Compute Confidence Score
    const confidence = this.computeConfidence(visualSignal, context, fullHistory);

    // 4. Multivariate Analysis (Normalization, Baseline Distance, Change-Point)
    const { expectedRange, anomalies, anomalyEvidence, changePoint } = this.performMultivariateAnalysis(visualSignal, context, fullHistory, comparison);

    // 5. Determine Safety Level & Trend
    const safetyLevel = this.determineSafetyLevel(context, comparison, anomalies);
    const trend = this.determineTrend(fullHistory.length, safetyLevel, comparison, changePoint);

    // 6. Generate Text
    const reasoning = this.generateReasoning(comparison, context, safetyLevel, changePoint);
    const explanation = this.generateExplanation(trend, safetyLevel, changePoint);
    const safetyPrompt = this.generateSafetyPrompt(safetyLevel);

    return {
      visualSignal,
      trend,
      safetyLevel,
      comparison,
      reasoning,
      explanation,
      safetyPrompt,
      expectedRange,
      anomalies,
      anomalyEvidence,
      changePoint,
      confidence
    };
  }

  private computeConfidence(visualSignal: ImageFeatures, context: SymptomContext, history: RecoveryCheck[]): ObservationConfidence {
    const imageQualityScore = visualSignal.imageQuality === 'good' ? 95 : 40;
    const regionConsistencyScore = visualSignal.woundRegion ? 90 : 50; // Approximated
    const temporalDataCompleteness = history.length > 2 ? 'High' : 'Low';
    
    let symptomDataCompleteness: 'Complete' | 'Partial' | 'Missing' = 'Complete';
    if (context.pain === 0 && context.symptoms.length === 0) symptomDataCompleteness = 'Missing';
    else if (context.symptoms.length === 0) symptomDataCompleteness = 'Partial';

    // Weighted overall score
    let overallScore = (imageQualityScore * 0.4) + (regionConsistencyScore * 0.3);
    overallScore += (temporalDataCompleteness === 'High' ? 15 : 5);
    overallScore += (symptomDataCompleteness === 'Complete' ? 15 : symptomDataCompleteness === 'Partial' ? 10 : 0);

    let level: 'High' | 'Medium' | 'Low' = 'High';
    if (overallScore < 60) level = 'Low';
    else if (overallScore < 80) level = 'Medium';

    return {
      imageQualityScore,
      regionConsistencyScore,
      temporalDataCompleteness,
      symptomDataCompleteness,
      overallScore: Math.round(overallScore),
      level
    };
  }

  private performMultivariateAnalysis(currentVisual: ImageFeatures, currentContext: SymptomContext, history: RecoveryCheck[], comparison: ObservationComparison) {
    const anomalies: string[] = [];
    const anomalyEvidence: AnomalyEvidence[] = [];
    let changePoint: ChangePoint = { detected: false, explanation: '', magnitude: 0 };
    
    if (history.length < 2) {
      return { 
        expectedRange: { pain: [0, 10] as [number, number], visualSignal: [0, 100] as [number, number], area: [80, 120] as [number, number] }, 
        anomalies, anomalyEvidence, changePoint 
      };
    }

    const recent = history.slice(0, 3);
    
    // Baseline calculations
    const baselinePains = recent.map(h => h.context.pain);
    const baselineVis = recent.map(h => h.visualSignal.regionRedDominance ?? h.visualSignal.redDominance);
    const avgPain = baselinePains.reduce((a,b) => a+b, 0) / recent.length;
    const avgVis = baselineVis.reduce((a,b) => a+b, 0) / recent.length;
    
    let avgArea = 100;
    const baselineAreas = recent.map(h => h.visualSignal.observableArea || 0).filter(a => a > 0);
    if (baselineAreas.length > 0) {
      avgArea = baselineAreas.reduce((a,b) => a+b, 0) / baselineAreas.length;
    }

    // Expected Ranges
    const expectedRange = {
      pain: [Math.max(0, Math.floor(avgPain - 1.5)), Math.min(10, Math.ceil(avgPain + 1.5))] as [number, number],
      visualSignal: [Math.max(0, Math.floor(avgVis - 8)), Math.min(100, Math.ceil(avgVis + 8))] as [number, number],
      area: [85, 115] as [number, number] // Percentage of baseline
    };

    // Current Values
    const cPain = currentContext.pain;
    const cVis = currentVisual.regionRedDominance ?? currentVisual.redDominance;
    const cAreaRaw = currentVisual.observableArea || avgArea;
    const cAreaPct = Math.round((cAreaRaw / avgArea) * 100);

    // Vector Normalization (0-100 scale)
    const normBaseline = [
      (avgPain / 10) * 100,
      avgVis,
      100 // baseline area is 100%
    ];
    
    const normCurrent = [
      (cPain / 10) * 100,
      cVis,
      cAreaPct
    ];

    // Calculate Euclidean Distance
    let sumSq = 0;
    let maxDelta = 0;
    for (let i = 0; i < 3; i++) {
      const diff = normCurrent[i] - normBaseline[i];
      sumSq += diff * diff;
      if (Math.abs(diff) > maxDelta) maxDelta = Math.abs(diff);
    }
    const distance = Math.sqrt(sumSq);

    // Anomaly Detection based on range thresholds
    if (cPain > expectedRange.pain[1]) {
      anomalies.push(`Pain level (${cPain}) exceeds expected trailing range (${expectedRange.pain[0]}-${expectedRange.pain[1]})`);
      anomalyEvidence.push({ metric: 'Pain Score', previousValue: avgPain.toFixed(1), currentValue: cPain.toString(), delta: `+${(cPain - avgPain).toFixed(1)}` });
    }
    if (cVis > expectedRange.visualSignal[1]) {
      anomalies.push(`Visual signal (${cVis}%) significantly higher than baseline (${avgVis.toFixed(1)}%)`);
      anomalyEvidence.push({ metric: 'Visual Signal', previousValue: `${avgVis.toFixed(1)}%`, currentValue: `${cVis}%`, delta: `+${(cVis - avgVis).toFixed(1)}%` });
    }
    if (cAreaPct > expectedRange.area[1]) {
      anomalies.push(`Observable area expanded by ${cAreaPct - 100}% relative to baseline`);
      anomalyEvidence.push({ metric: 'Observable Area', previousValue: '100% (Baseline)', currentValue: `${cAreaPct}%`, delta: `+${cAreaPct - 100}%` });
    }

    // Change-Point Detection
    // If the multivariate distance from the baseline centroid is exceptionally large (> 35 normalized units)
    if (distance > 35) {
      changePoint = {
        detected: true,
        magnitude: Math.round(distance),
        explanation: 'A sudden multivariate shift in the trajectory was detected, indicating a significant deviation from the recent healing pattern.'
      };
    }

    return { expectedRange, anomalies, anomalyEvidence, changePoint };
  }

  private computeComparison(currentVisual: ImageFeatures, currentContext: SymptomContext, fullHistory: RecoveryCheck[]): ObservationComparison {
    let comparisonConfidence: 'high' | 'medium' | 'low' = currentVisual.imageQuality === 'good' ? 'high' : 'low';
    
    let previousPain: number | null = null;
    let previousVisualSignal: number | null = null;
    let painDelta: number | null = null;
    let visualSignalDelta: number | null = null;

    let baselinePain: number | null = null;
    let baselineVisualSignal: number | null = null;

    if (fullHistory.length > 0) {
      const previous = fullHistory[0];
      if (previous.visualSignal.imageQuality === 'low') {
        comparisonConfidence = 'low';
      }
      
      previousPain = previous.context.pain;
      previousVisualSignal = previous.visualSignal.regionRedDominance ?? previous.visualSignal.redDominance;
      painDelta = currentContext.pain - previousPain;
      visualSignalDelta = (currentVisual.regionRedDominance ?? currentVisual.redDominance) - previousVisualSignal;
    }

    if (fullHistory.length > 0) {
      const recentChecks = fullHistory.slice(0, 3);
      const sumPain = recentChecks.reduce((acc, check) => acc + check.context.pain, 0);
      const sumVisual = recentChecks.reduce((acc, check) => acc + (check.visualSignal.regionRedDominance ?? check.visualSignal.redDominance), 0);
      baselinePain = Number((sumPain / recentChecks.length).toFixed(1));
      baselineVisualSignal = Number((sumVisual / recentChecks.length).toFixed(1));
    }

    return {
      comparisonConfidence,
      previousPain,
      currentPain: currentContext.pain,
      painDelta,
      previousVisualSignal,
      currentVisualSignal: currentVisual.regionRedDominance ?? currentVisual.redDominance,
      visualSignalDelta,
      baselinePain,
      baselineVisualSignal,
    };
  }

  private determineSafetyLevel(context: SymptomContext, comparison: ObservationComparison, anomalies: string[]): SafetyLevel {
    const hasRedFlagSymptom = context.symptoms.some(s => 
      ['Fever', 'Discharge'].includes(s)
    );
    const hasRapidPainIncrease = (comparison.painDelta !== null && comparison.painDelta >= 3);
    const hasSeverePain = context.pain >= 8;

    if (hasRedFlagSymptom || hasRapidPainIncrease || hasSeverePain) {
      return 'seek-care';
    }

    const hasMonitorSymptom = context.symptoms.some(s => 
      ['Swelling', 'Warmth', 'More pain'].includes(s)
    );
    
    if (hasMonitorSymptom || anomalies.length > 0) {
      return 'monitor';
    }

    return 'normal';
  }

  private determineTrend(historyCount: number, safetyLevel: SafetyLevel, comparison: ObservationComparison, changePoint: ChangePoint): Trend {
    if (historyCount === 0) return 'baseline';
    
    if (changePoint.detected) return 'seek-care';
    if (safetyLevel === 'seek-care') return 'seek-care';
    if (safetyLevel === 'monitor') return 'monitor';

    if (comparison.painDelta !== null && comparison.visualSignalDelta !== null) {
      if (comparison.painDelta < 0 && comparison.visualSignalDelta <= 0) {
        return 'improving';
      }
      if (comparison.visualSignalDelta < -5 && comparison.painDelta <= 0) {
        return 'improving';
      }
    }

    return 'stable';
  }

  private generateReasoning(comparison: ObservationComparison, context: SymptomContext, safetyLevel: SafetyLevel, changePoint: ChangePoint): string[] {
    const reasoning: string[] = [];

    if (changePoint.detected) {
      reasoning.push(changePoint.explanation);
    }

    if (comparison.painDelta !== null) {
      if (comparison.painDelta > 0) reasoning.push(`Reported pain increased by ${comparison.painDelta} point(s).`);
      else if (comparison.painDelta < 0) reasoning.push(`Reported pain decreased by ${Math.abs(comparison.painDelta)} point(s).`);
    }

    if (comparison.visualSignalDelta !== null) {
      if (comparison.comparisonConfidence === 'low') {
        reasoning.push(`Insufficient image quality for a meaningful visual comparison.`);
      } else {
        if (comparison.visualSignalDelta > 0) reasoning.push(`Visual signal increased by ${comparison.visualSignalDelta} percentage points.`);
        else if (comparison.visualSignalDelta < 0) reasoning.push(`Visual signal decreased by ${Math.abs(comparison.visualSignalDelta)} percentage points.`);
      }
    }

    if (context.symptoms.length > 0 && !context.symptoms.includes('No new symptoms')) {
      reasoning.push(`Symptoms reported: ${context.symptoms.join(', ')}.`);
    }

    return reasoning;
  }

  private generateExplanation(trend: Trend, safetyLevel: SafetyLevel, changePoint: ChangePoint): string {
    if (trend === 'baseline') return "Initial observation recorded. Perform another check tomorrow to establish a baseline.";
    if (changePoint.detected) return "Significant trajectory deviation detected. Observation pattern is anomalous compared to your recent baseline.";
    if (safetyLevel === 'seek-care') return "Today's observation flags potential red-flag symptoms or significant negative changes.";
    if (safetyLevel === 'monitor') return "Today's observation shows deviations or increased symptoms compared to expected ranges.";
    if (trend === 'improving') return "Today's observation shows decreasing signals, suggesting positive progression.";
    return "Today's observation remains stable within expected ranges.";
  }

  private generateSafetyPrompt(safetyLevel: SafetyLevel): string {
    if (safetyLevel === 'seek-care') return 'Consider contacting a healthcare professional promptly. These observations include potential red flags.';
    if (safetyLevel === 'monitor') return 'A deviation was observed. Consider taking another standardized photo tomorrow and monitoring your symptoms closely.';
    return 'Continue tracking. Observation only — not a diagnosis.';
  }
}

export const observationEngine = new PrototypeObservationEngine();
