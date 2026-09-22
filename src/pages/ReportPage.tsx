import React from 'react';
import { RecoveryCheck } from '@/types';
import { Sparklines } from '@/components/Sparklines';
import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react';

interface ReportPageProps {
  checks: RecoveryCheck[];
  onBack: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ checks, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  if (checks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-20">
        <h2 className="text-xl font-bold">No observations available</h2>
        <p className="text-slate-500">Please complete at least one recovery check to generate a report.</p>
        <button onClick={onBack} className="text-brand-500 font-bold underline">Go back</button>
      </div>
    );
  }

  const oldestCheck = checks[checks.length - 1];
  const newestCheck = checks[0];
  const trackingDays = Math.max(1, Math.ceil((new Date(newestCheck.timestamp).getTime() - new Date(oldestCheck.timestamp).getTime()) / (1000 * 3600 * 24)));

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-8">
      {/* Non-printable header controls */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Timeline</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Content */}
      <div className="bg-white dark:bg-surface-darkSoft p-8 md:p-12 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm print:shadow-none print:border-none print:p-0 space-y-10">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              WoundWatch Recovery Report
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex-items-center justify-center print:border print:border-slate-300">
             <ShieldCheck className="w-8 h-8 m-auto" />
          </div>
        </div>

        {/* Summary Overview */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Summary Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-4 print:border print:border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Period</div>
              <div className="font-bold text-lg">{trackingDays} days</div>
            </div>
            <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-4 print:border print:border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Observations</div>
              <div className="font-bold text-lg">{checks.length}</div>
            </div>
            <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-4 print:border print:border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Current Trajectory</div>
              <div className="font-bold text-lg capitalize text-brand-600">{newestCheck.trend}</div>
            </div>
            <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-4 print:border print:border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Safety Level</div>
              <div className={`font-bold text-lg capitalize ${
                newestCheck.safetyLevel === 'seek-care' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
              }`}>
                {newestCheck.safetyLevel}
              </div>
            </div>
          </div>
        </section>

        {/* Trajectories */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trajectories</h2>
           <div className="print:break-inside-avoid">
             <Sparklines checks={checks} />
           </div>
        </section>

        {/* Observation Log */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Observation Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-slate-500 font-semibold">Date</th>
                  <th className="pb-3 text-slate-500 font-semibold">Pain</th>
                  <th className="pb-3 text-slate-500 font-semibold">Visual</th>
                  <th className="pb-3 text-slate-500 font-semibold">Symptoms</th>
                  <th className="pb-3 text-slate-500 font-semibold">Quality</th>
                  <th className="pb-3 text-slate-500 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {checks.map((check) => (
                  <tr key={check.id} className="print:break-inside-avoid">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-200">
                      {new Date(check.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3">{check.context.pain}/10</td>
                    <td className="py-3">{check.visualSignal.regionRedDominance ?? check.visualSignal.redDominance}%</td>
                    <td className="py-3 text-xs max-w-[150px] truncate" title={check.context.symptoms.join(', ')}>
                      {check.context.symptoms.length > 0 ? check.context.symptoms.join(', ') : 'None'}
                    </td>
                    <td className="py-3 capitalize text-xs">{check.comparison.comparisonConfidence}</td>
                    <td className="py-3 capitalize font-semibold">{check.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Latest Reasoning & Changes */}
        {newestCheck.comparison.previousPain !== null && (
           <section className="space-y-4 print:break-inside-avoid">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Latest Changes & Reasoning</h2>
              <div className="bg-brand-50/50 dark:bg-brand-950/20 rounded-2xl p-6 border border-brand-100 dark:border-brand-900/30 text-sm space-y-4">
                 <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {newestCheck.reasoning.map((r, i) => (
                       <li key={i}>{r}</li>
                    ))}
                 </ul>
              </div>
           </section>
        )}

        {/* Disclaimer / Footer */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800 mt-12 print:break-inside-avoid">
          <div className="bg-slate-50 dark:bg-surface-dark p-6 rounded-2xl flex items-start space-x-4 border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-900 dark:text-slate-200">
                WoundWatch provides observational tracking and does not diagnose medical conditions.
              </p>
              <p>
                This report is intended to support discussion with a healthcare professional. Visual signals are calculated algorithmically based on user-captured photographs and may be affected by lighting, camera quality, or positioning. Safety prompts are heuristically generated and should not override professional medical advice.
              </p>
            </div>
          </div>
        </section>
        
        {/* Print Only Footer Logo */}
        <div className="hidden print:block text-center pt-8 text-xs text-slate-400 font-bold">
           Generated by WoundWatch AI
        </div>

      </div>
    </div>
  );
};
