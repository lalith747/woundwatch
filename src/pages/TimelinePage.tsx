import React, { useState } from 'react';
import { RecoveryCheck } from '@/types';
import { deleteCheck, clearAllChecks } from '@/services/storage';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Sparklines } from '@/components/Sparklines';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { HeatmapOverlay } from '@/components/HeatmapOverlay';
import {
  History, Calendar, Trash2, TrendingDown, Minus,
  ShieldAlert, Activity, PlusCircle, ShieldCheck, Info, Map,
  FileText, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelinePageProps {
  checks: RecoveryCheck[];
  isDemoMode?: boolean;
  onRefreshTimeline: () => void;
  onStartNewCheck: () => void;
  onOpenReport?: () => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  checks,
  isDemoMode = false,
  onRefreshTimeline,
  onStartNewCheck,
  onOpenReport,
}) => {
  const [filterTrend, setFilterTrend] = useState<string>('all');
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const [expandedHeatmap, setExpandedHeatmap] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const filteredChecks = checks.filter((item) => {
    if (filterTrend === 'all') return true;
    return item.trend.toLowerCase().replace(/\s+/g, '') === filterTrend;
  });

  const handleDelete = (id: string) => {
    if (isDemoMode) return;
    deleteCheck(id);
    setConfirmDeleteId(null);
    onRefreshTimeline();
  };

  const handleClearAll = () => {
    if (isDemoMode) return;
    clearAllChecks();
    setConfirmClearAll(false);
    onRefreshTimeline();
  };

  const getTrendBadge = (trendString: string) => {
    const trend = trendString.toLowerCase();
    switch (trend) {
      case 'improving':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <TrendingDown className="w-3.5 h-3.5" /><span>Improving</span>
          </span>
        );
      case 'seek-care':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs">
            <ShieldAlert className="w-3.5 h-3.5" /><span>Seek Care</span>
          </span>
        );
      case 'monitor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Activity className="w-3.5 h-3.5" /><span>Monitor</span>
          </span>
        );
      case 'baseline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" /><span>Baseline</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
            <Minus className="w-3.5 h-3.5" /><span>Stable</span>
          </span>
        );
    }
  };

  const oldestCheck = checks.length > 1 ? checks[checks.length - 1] : null;
  const newestCheck = checks.length > 1 ? checks[0] : null;
  const trackingDays = oldestCheck && newestCheck
    ? Math.max(1, Math.ceil((new Date(newestCheck.timestamp).getTime() - new Date(oldestCheck.timestamp).getTime()) / (1000 * 3600 * 24)))
    : 0;
  const hasBothImages = oldestCheck?.imageUrl && newestCheck?.imageUrl && checks.length >= 2;

  return (
    <div className="space-y-5 pb-24 md:pb-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            Recovery Timeline
          </h1>
          {checks.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">{checks.length} observation{checks.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {checks.length > 0 && onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-surface-darkSoft border border-surface-border dark:border-surface-darkBorder text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Report
            </button>
          )}
          {checks.length > 0 && !isDemoMode && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-surface-darkSoft border border-rose-200 dark:border-rose-900 text-rose-500 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Clear all confirmation */}
      <AnimatePresence>
        {confirmClearAll && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-700 dark:text-rose-300 text-sm">Delete all {checks.length} observations?</p>
              <p className="text-xs text-rose-600/70 dark:text-rose-400/60 mt-0.5">This cannot be undone. Your entire recovery history will be erased.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setConfirmClearAll(false)} className="px-3 py-1.5 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">Cancel</button>
              <button onClick={handleClearAll} className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors">Delete all</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {checks.length === 0 ? (
        <div className="bg-white dark:bg-surface-darkSoft p-10 rounded-2xl border border-surface-border dark:border-surface-darkBorder text-center space-y-4">
          <History className="w-10 h-10 text-brand-300 mx-auto" />
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No observations yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Your recovery timeline starts here. Complete your first check to begin tracking.</p>
          </div>
          <button onClick={onStartNewCheck} className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm inline-flex items-center gap-2 transition-colors">
            <PlusCircle className="w-4 h-4" />Start First Check
          </button>
        </div>
      ) : (
        <>
          {/* Recovery Summary */}
          {checks.length >= 2 && oldestCheck && newestCheck && (
            <div className="bg-white dark:bg-surface-darkSoft rounded-2xl border border-surface-border dark:border-surface-darkBorder overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-border dark:border-surface-darkBorder">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recovery Summary</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">{trackingDays}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">days tracked</div>
                </div>
                <div className="text-center border-x border-surface-border dark:border-surface-darkBorder">
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">{checks.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">observations</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-extrabold capitalize ${newestCheck.trend === 'improving' ? 'text-emerald-600' : newestCheck.trend === 'seek-care' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                    {newestCheck.trend}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">trajectory</div>
                </div>
              </div>
            </div>
          )}

          {/* Sparklines */}
          <Sparklines checks={checks} />

          {/* Before / After Slider */}
          {hasBothImages && (
            <div className="bg-white dark:bg-surface-darkSoft rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5">
              <BeforeAfterSlider
                beforeImageUrl={oldestCheck!.imageUrl!}
                afterImageUrl={newestCheck!.imageUrl!}
                beforeLabel="Day 1"
                afterLabel="Today"
                beforeSignal={oldestCheck!.visualSignal.regionRedDominance ?? oldestCheck!.visualSignal.redDominance}
                afterSignal={newestCheck!.visualSignal.regionRedDominance ?? newestCheck!.visualSignal.redDominance}
              />
            </div>
          )}

          {/* Baseline callout */}
          {checks.length === 1 && (
            <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-2xl border border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-200 text-xs font-semibold flex items-center justify-between">
              <span>Baseline established. Add a second check to start tracking change.</span>
              <button onClick={onStartNewCheck} className="ml-3 px-3 py-1.5 rounded-lg bg-brand-500 text-white font-bold text-xs shrink-0">+ Add</button>
            </div>
          )}

          {/* Filter tabs */}
          <div className="bg-white dark:bg-surface-darkSoft p-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder inline-flex w-full justify-around">
            <AnimatedBackground
              defaultValue="all"
              value={filterTrend}
              onValueChange={(val) => setFilterTrend(val || 'all')}
              className="rounded-lg bg-brand-500 text-white"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
            >
              {['all', 'improving', 'monitor', 'seek-care'].map((f) => (
                <button
                  key={f}
                  data-id={f}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filterTrend === f ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  {f === 'all' ? `All (${checks.length})` : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                </button>
              ))}
            </AnimatedBackground>
          </div>

          {/* Timeline cards */}
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-200 dark:before:bg-brand-900">
            <AnimatePresence>
              {filteredChecks.map((item, index) => {
                const dateObj = new Date(item.timestamp);
                const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const previousCheck = checks[checks.findIndex(c => c.id === item.id) + 1];
                const isReasoningOpen = expandedReasoning === item.id;
                const isHeatmapOpen = expandedHeatmap === item.id;
                const isSeekCare = item.trend.toLowerCase() === 'seek-care';
                const isConfirmingDelete = confirmDeleteId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="relative group"
                  >
                    {/* Timeline node */}
                    <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm z-10 ${
                      isSeekCare
                        ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-500'
                        : 'bg-white dark:bg-surface-dark border-brand-500 text-brand-500'
                    }`}>
                      {isSeekCare ? <ShieldAlert className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                    </div>

                    {/* Card */}
                    <div className={`bg-white dark:bg-surface-darkSoft rounded-2xl border shadow-sm transition-colors ${
                      isSeekCare
                        ? 'border-rose-200 dark:border-rose-900'
                        : 'border-surface-border dark:border-surface-darkBorder'
                    }`}>
                      {/* Card header — date + delete */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-darkBorder">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          {formattedDate} · {formattedTime}
                        </div>
                        {!isDemoMode && (
                          <button
                            onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : item.id)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isConfirmingDelete
                                ? 'bg-rose-500 text-white'
                                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isConfirmingDelete ? 'Delete?' : 'Delete'}</span>
                          </button>
                        )}
                      </div>

                      {/* Delete confirmation bar */}
                      <AnimatePresence>
                        {isConfirmingDelete && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900">
                              <p className="text-xs text-rose-700 dark:text-rose-300">Remove this observation from your timeline?</p>
                              <div className="flex gap-2 shrink-0 ml-3">
                                <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">Cancel</button>
                                <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors">Confirm</button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Card body */}
                      <div className="p-4 space-y-4">
                        {/* Seek Care block */}
                        {isSeekCare && (
                          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300 text-sm">
                              <ShieldAlert className="w-4 h-4 shrink-0" />
                              ⚠ SEEK CARE
                            </div>
                            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{item.explanation}</p>
                            <p className="text-[10px] text-rose-500/70 dark:text-rose-400/60">WoundWatch cannot determine the cause. Consider contacting a healthcare professional.</p>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          {item.imageUrl && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-800">
                              <img src={item.imageUrl} alt="Observation" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="flex-1 space-y-3 min-w-0">
                            {/* What Changed */}
                            {item.comparison.previousPain !== null ? (
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">What Changed?</div>
                                <div className="space-y-1.5 text-xs">
                                  {[
                                    {
                                      label: 'Pain',
                                      from: item.comparison.previousPain,
                                      to: item.comparison.currentPain,
                                      delta: item.comparison.painDelta,
                                      unit: '',
                                    },
                                    {
                                      label: 'Visual signal',
                                      from: item.comparison.previousVisualSignal,
                                      to: item.comparison.currentVisualSignal,
                                      delta: item.comparison.visualSignalDelta,
                                      unit: '%',
                                    },
                                  ].map(({ label, from, to, delta, unit }) => (
                                    <div key={label} className="flex items-center justify-between gap-2">
                                      <span className="text-slate-500 shrink-0">{label}</span>
                                      <span className="text-slate-400 text-right truncate">{from}{unit} → {to}{unit}</span>
                                      <span className={`font-bold w-14 text-right shrink-0 ${(delta ?? 0) > 0 ? 'text-rose-500' : (delta ?? 0) < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {(delta ?? 0) > 0 ? `↑ ${delta}` : (delta ?? 0) < 0 ? `↓ ${Math.abs(delta!)}` : '—'}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Overall + Why */}
                                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 mt-3 pt-2.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall</span>
                                  <button onClick={() => setExpandedReasoning(isReasoningOpen ? null : item.id)} className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                                    {getTrendBadge(item.trend)}
                                    <Info className="w-3.5 h-3.5 text-slate-400" />
                                  </button>
                                </div>

                                {/* Why panel */}
                                <AnimatePresence>
                                  {isReasoningOpen && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 mt-3 space-y-2">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Why this result?</div>
                                        <ol className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                          {item.reasoning.map((r, i) => (
                                            <li key={i} className="flex gap-2"><span className="text-brand-500 font-bold shrink-0">{i + 1}.</span><span>{r}</span></li>
                                          ))}
                                        </ol>
                                        <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">This is not a diagnosis.</p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              // Baseline
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baseline Established</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-white dark:bg-surface-dark p-2 rounded-lg">
                                    <span className="text-slate-400 block text-[10px]">Pain</span>
                                    <span className="font-bold">{item.context.pain}/10</span>
                                  </div>
                                  <div className="bg-white dark:bg-surface-dark p-2 rounded-lg">
                                    <span className="text-slate-400 block text-[10px]">Visual signal</span>
                                    <span className="font-bold text-brand-600 dark:text-brand-400">{item.visualSignal.regionRedDominance ?? item.visualSignal.redDominance}%</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-[10px] text-slate-400">Trajectory</span>
                                  {getTrendBadge(item.trend)}
                                </div>
                              </div>
                            )}

                            {/* Heatmap toggle */}
                            {item.imageUrl && (
                              <button
                                onClick={() => setExpandedHeatmap(isHeatmapOpen ? null : item.id)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-700 transition-colors"
                              >
                                <Map className="w-3.5 h-3.5" />
                                {isHeatmapOpen ? 'Hide' : 'Show'} color signal map
                              </button>
                            )}

                            {/* Heatmap panel */}
                            <AnimatePresence>
                              {isHeatmapOpen && item.imageUrl && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                  <HeatmapOverlay
                                    imageUrl={item.imageUrl}
                                    woundRegion={item.visualSignal.woundRegion}
                                    redSignal={item.visualSignal.regionRedDominance ?? item.visualSignal.redDominance}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};
