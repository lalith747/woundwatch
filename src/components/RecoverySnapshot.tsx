import React from 'react';
import { ObservationResult, SymptomContext } from '@/types';
import { TrendingUp, TrendingDown, Minus, Activity, Eye, ShieldAlert, Sparkles, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { SafetyNotice } from './SafetyNotice';
import { motion } from 'framer-motion';

interface RecoverySnapshotProps {
  imageSrc: string | null;
  context: SymptomContext;
  result: ObservationResult | null;
  isAnalyzing: boolean;
  onSave: () => void;
  onPrevStep: () => void;
}

export const RecoverySnapshot: React.FC<RecoverySnapshotProps> = ({
  imageSrc,
  context,
  result,
  isAnalyzing,
  onSave,
  onPrevStep,
}) => {
  if (isAnalyzing || !result) {
    return (
      <div className="bg-white dark:bg-surface-darkSoft p-8 rounded-3xl border border-surface-border dark:border-surface-darkBorder text-center space-y-4 max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center mx-auto text-brand-500 animate-spin">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Computing Local Observation Signal...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing visual features & combining user context locally in your browser.
          </p>
        </div>
      </div>
    );
  }

  const { trend, visualSignal, explanation, safetyPrompt, reasoning, safetyLevel } = result;

  const getTrendBadge = () => {
    switch (trend) {
      case 'improving':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
            <TrendingDown className="w-4 h-4" />
            <span>Improving</span>
          </div>
        );
      case 'seek-care':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Seek Care</span>
          </div>
        );
      case 'monitor':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Monitor</span>
          </div>
        );
      case 'baseline':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Baseline</span>
          </div>
        );
      case 'stable':
      default:
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold text-xs border border-brand-200 dark:border-brand-800">
            <Minus className="w-4 h-4" />
            <span>Stable</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* 1. Recovery Snapshot Header Card */}
      <div className="bg-white dark:bg-surface-darkSoft p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Recovery Observation Snapshot
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Observation Summary
            </h2>
          </div>
          {getTrendBadge()}
        </div>

        {/* Image & Key Signal split view */}
        <div className="flex items-center space-x-4 pt-1">
          {imageSrc && (
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-700">
              <img src={imageSrc} alt="Observation" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Observable Visual Signal:</span>
              <span className="font-extrabold text-brand-600 dark:text-brand-400">
                {visualSignal.regionRedDominance}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Reported Pain Score:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {context.pain} / 10
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Image Signal Clarity:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                {visualSignal.imageQuality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Observable Symptoms List */}
      <div className="bg-white dark:bg-surface-darkSoft p-5 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Reported Symptoms
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {context.symptoms.length > 0 ? (
            context.symptoms.map((symptom) => (
              <span
                key={symptom}
                className="px-3 py-1 rounded-xl bg-surface-soft dark:bg-surface-dark border border-surface-border dark:border-surface-darkBorder text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {symptom}
              </span>
            ))
          ) : (
            <span className="text-xs font-medium text-slate-400 italic">
              No symptoms selected
            </span>
          )}
        </div>
      </div>

      {/* 3. AI Observation & Explanation */}
      <div className="bg-white dark:bg-surface-darkSoft p-5 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Observation Reasoning
          </span>
        </div>
        
        {reasoning && reasoning.length > 0 && (
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
            {reasoning.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        )}
        
        <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 leading-relaxed font-bold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {explanation}
        </p>
      </div>

      {/* 4. Safety Notice */}
      <SafetyNotice
        message={safetyPrompt}
        variant={safetyLevel === 'seek-care' ? 'warning' : (safetyLevel === 'monitor' ? 'warning' : 'info')}
      />

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={onPrevStep}
          className="py-3 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center space-x-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Adjust</span>
        </button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Save Observation to Timeline</span>
        </motion.button>
      </div>
    </div>
  );
};
