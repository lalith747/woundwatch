import React from 'react';
import { ImageFeatures } from '@/types';
import { AlertTriangle, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';

interface PhotoQualityProps {
  imageFeatures: ImageFeatures;
  onRetake: () => void;
  onContinue: () => void;
}

export const PhotoQuality: React.FC<PhotoQualityProps> = ({
  imageFeatures,
  onRetake,
  onContinue,
}) => {
  const { avgBrightness, sharpness, imageQuality } = imageFeatures;

  const getConfidenceScore = () => {
    if (imageQuality === 'low') return 30;
    
    // Rough heuristic for demonstration
    let score = 100;
    if (avgBrightness < 60 || avgBrightness > 200) score -= 20;
    if (sharpness < 15) score -= 30;
    
    return Math.max(30, Math.min(100, score));
  };

  const confidence = getConfidenceScore();
  const isLowConfidence = confidence < 60 || imageQuality === 'low';

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4 sm:p-0">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Photo Quality Assessment</h3>
        <p className="text-sm text-slate-500 mt-1">Analyzing image for longitudinal comparison reliability.</p>
      </div>

      <div className="bg-surface-soft dark:bg-surface-darkSoft border border-surface-border dark:border-surface-darkBorder rounded-3xl p-5 space-y-4">
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Lighting</span>
          {avgBrightness >= 50 && avgBrightness <= 210 ? (
            <span className="text-emerald-500 font-bold text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Good</span>
          ) : (
            <span className="text-amber-500 font-bold text-sm flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Poor</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sharpness</span>
          {sharpness >= 10 ? (
            <span className="text-emerald-500 font-bold text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Good</span>
          ) : (
            <span className="text-amber-500 font-bold text-sm flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Blurry</span>
          )}
        </div>

        <div className="pt-4 border-t border-surface-border dark:border-surface-darkBorder">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comparison Confidence</span>
            <span className={`font-black text-lg ${isLowConfidence ? 'text-amber-500' : 'text-emerald-500'}`}>
              {confidence}%
            </span>
          </div>
          
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                confidence >= 80 ? 'bg-emerald-500' : confidence >= 60 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

      </div>

      {isLowConfidence && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium">
            This image may be too dark or blurry for a reliable visual comparison. We strongly recommend retaking it in better lighting.
          </p>
        </div>
      )}

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={onRetake}
          className="flex-1 py-3.5 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retake Photo</span>
        </button>
        <button
          onClick={onContinue}
          className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
            isLowConfidence 
              ? 'bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500' 
              : 'bg-brand-500 hover:bg-brand-600'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
