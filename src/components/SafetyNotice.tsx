import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface SafetyNoticeProps {
  message?: string;
  variant?: 'info' | 'warning';
  compact?: boolean;
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({
  message,
  variant = 'info',
  compact = false,
}) => {
  const defaultText =
    message ||
    'WoundWatch AI provides observable visual signals and symptom tracking for educational observation only. It does not diagnose infections, classify pathogens, or replace professional medical advice.';

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800">
        <Info className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span>Observation • Not diagnosis</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 border flex items-start space-x-3 transition-colors ${
        variant === 'warning'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-brand-50/70 dark:bg-surface-darkSoft border-brand-200/60 dark:border-brand-900 text-slate-700 dark:text-slate-300'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {variant === 'warning' ? (
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        ) : (
          <Info className="w-5 h-5 text-brand-500" />
        )}
      </div>
      <div className="text-xs sm:text-sm leading-relaxed font-medium">
        {defaultText}
      </div>
    </div>
  );
};
