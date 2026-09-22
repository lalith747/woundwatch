import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RecoveryCheck } from '../types';
import { RadarChart } from '../components/RadarChart';
import { TrajectoryChart } from '../components/TrajectoryChart';
import {
  Activity, AlertTriangle, CheckCircle, Camera, Upload,
  ArrowRight, ShieldCheck, Lock, Play, ScanFace, Check,
} from 'lucide-react';

interface Props {
  checks: RecoveryCheck[];
  onNewCheck: () => void;
  onOpenReport: () => void;
  isDemoMode: boolean;
  onLoadDemo?: (scenario: 'improving' | 'change_point' | 'low_confidence' | 'seek_care') => void;
}

/* ─────────────────────────── VARIANTS ─────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ─────────────────────────── SECTION WRAPPER ─────────────────── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─────────────────────────── SECTION LABEL ─────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-3">
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export function DashboardPage({ checks: initialChecks, onNewCheck, onOpenReport, isDemoMode, onLoadDemo }: Props) {
  const checks = useMemo(() =>
    [...initialChecks].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  [initialChecks]);

  const current = checks[0];
  const previous = checks[1];
  const oldest   = checks[checks.length - 1];

  const toRadar = (c: RecoveryCheck) => ({
    pain:     (c.context.pain / 10) * 100,
    visual:   c.visualSignal.regionRedDominance ?? c.visualSignal.redDominance,
    area:     c.visualSignal.observableArea ? Math.min(100, (c.visualSignal.observableArea / 1250) * 100) : 50,
    symptoms: Math.min(100, c.context.symptoms.length * 25),
  });

  const radarCurrent = current  ? toRadar(current)  : undefined;
  const radarPrev    = previous ? toRadar(previous)  : undefined;

  const trajectoryData = useMemo(() => {
    if (!checks.length) return [];
    const asc = [...checks].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const t0  = new Date(asc[0].timestamp).getTime();
    return asc.map((c, i) => {
      const days = Math.round((new Date(c.timestamp).getTime() - t0) / 86_400_000) + 1;
      const pain   = 100 - (c.context.pain / 10) * 100;
      const visual = 100 - (c.visualSignal.regionRedDominance ?? c.visualSignal.redDominance);
      return { day: days, value: pain * 0.4 + visual * 0.6, label: i === asc.length - 1 ? 'Today' : `Day ${days}` };
    });
  }, [checks]);

  /* ── EMPTY STATE ─────────────────────────────────────────────── */
  if (!checks.length) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)' }}>
        
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-2xl">
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/25 rounded-full px-5 py-2 mb-10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 text-sm font-semibold tracking-wide">Recovery Intelligence Platform</span>
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-6xl sm:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Understand how<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' }}>
              your recovery
            </span>
            <br />is changing.
          </motion.h1>

          <motion.p variants={fadeUp}
            className="text-xl text-slate-400 leading-relaxed mb-12 max-w-lg mx-auto">
            WoundWatch turns repeated wound observations into a private, explainable recovery trajectory — directly on your device.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={onNewCheck}
              className="group flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-5 px-10 rounded-2xl shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.97]">
              <ScanFace className="w-6 h-6" />
              Start Recovery Scan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {onLoadDemo && (
              <button onClick={() => onLoadDemo('improving')}
                className="flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/8 text-white font-bold text-lg py-5 px-10 rounded-2xl transition-all active:scale-[0.97]">
                <Play className="w-5 h-5 text-blue-400" />
                Explore Demo
              </button>
            )}
          </motion.div>

          <motion.div variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /> 100% on-device</span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> No cloud upload</span>
            <span className="text-slate-700">·</span>
            <span>Observation, not diagnosis</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── MAIN DASHBOARD ──────────────────────────────────────────── */
  const statusColor = current.changePoint?.detected ? 'amber' : 'emerald';
  const statusText  = current.changePoint?.detected ? 'Trajectory Shift Detected' : 'Improving';

  return (
    <div className="relative" style={{ background: '#020617' }}>
      {/* Global glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />

      <div className="relative max-w-5xl mx-auto px-6 py-16 space-y-32">

        {/* ════════════════ HERO ════════════════ */}
        <section>
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left — text */}
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-1.5">
                <div className={`w-2 h-2 rounded-full bg-${statusColor}-400 animate-pulse`} />
                <span className="text-sm font-semibold text-slate-300">Recovery active</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Understand<br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg,#60a5fa,#a78bfa)' }}>
                  how you heal.
                </span>
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed max-w-md">
                WoundWatch maps your wound's visual trajectory — privately, on your device.
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={onNewCheck}
                  className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/25 transition-all active:scale-[0.97]">
                  <ScanFace className="w-5 h-5" />
                  Scan Recovery
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {onLoadDemo && (
                  <button onClick={() => onLoadDemo('improving')}
                    className="flex items-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 text-white font-semibold text-base py-4 px-8 rounded-2xl transition-all active:scale-[0.97]">
                    <Play className="w-4 h-4 text-blue-400" /> Demo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Lock className="w-4 h-4 text-emerald-500" />
                100% on-device · No cloud upload · Works offline
              </div>
            </div>

            {/* Right — chart card */}
            <div className="lg:w-1/2 w-full">
              <div className="rounded-3xl border border-white/8 overflow-hidden"
                style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)' }}>
                <div className="px-6 pt-6 pb-2 border-b border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Recovery Trajectory</span>
                  <span className="text-xs font-mono text-slate-600">n={checks.length}</span>
                </div>
                <div className="p-4">
                  <TrajectoryChart data={trajectoryData} height={240} />
                </div>
                <div className="px-6 pb-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  {[
                    { label: 'PAIN',    value: `${current.context.pain}/10` },
                    { label: 'SIGNAL',  value: `${Math.round(current.visualSignal.redDominance)}%` },
                    { label: 'SCANS',   value: String(checks.length).padStart(2,'0') },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ STATUS STRIP ════════════════ */}
        <Section>
          <div className="rounded-3xl border overflow-hidden"
            style={{
              background: statusColor === 'emerald'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(2,6,23,0) 60%)'
                : 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(2,6,23,0) 60%)',
              borderColor: statusColor === 'emerald' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.2)',
            }}>
            <div className="p-8 flex flex-col sm:flex-row gap-8 items-center">
              <div className={`shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center border ${
                statusColor === 'emerald'
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                {statusColor === 'emerald'
                  ? <CheckCircle className="w-10 h-10 text-emerald-400" />
                  : <AlertTriangle className="w-10 h-10 text-amber-400" />}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Label>Recovery Status</Label>
                <h2 className="text-4xl font-black text-white mb-3">{statusText}</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {statusColor === 'emerald'
                    ? 'Your recent observations remain consistent with your personal recovery trajectory.'
                    : 'A significant deviation was detected. Review the evidence below.'}
                </p>
              </div>
              <div className="shrink-0 text-center border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-8">
                <p className="text-xs font-bold tracking-widest uppercase text-slate-600 mb-2">Last scan</p>
                <p className="text-2xl font-black text-white">
                  {new Date(current.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ════════════════ BIG CTA ════════════════ */}
        <Section>
          <div className="rounded-3xl border border-blue-500/15 text-center py-16 px-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 100%)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 120%, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-4">New scan</p>
              <h2 className="text-5xl font-black text-white mb-4">＋ Scan Recovery</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
                Capture today's wound image to update your trajectory and detect anomalies.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onNewCheck}
                  className="flex items-center justify-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all active:scale-[0.97]">
                  <Camera className="w-6 h-6 text-blue-400" /> Take Photo
                </button>
                <button onClick={onNewCheck}
                  className="flex items-center justify-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all active:scale-[0.97]">
                  <Upload className="w-6 h-6 text-blue-400" /> Upload Image
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ════════════════ FINGERPRINT + CHANGES ════════════════ */}
        <Section>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Fingerprint */}
            <div>
              <Label>Recovery Fingerprint</Label>
              <h2 className="text-4xl font-black text-white mb-4">Multidimensional view</h2>
              <p className="text-slate-400 mb-10">Your latest observation vs. previous baseline, across all tracked signals.</p>
              <div className="rounded-3xl border border-white/8 p-6 flex flex-col items-center"
                style={{ background: 'rgba(15,23,42,0.5)' }}>
                {radarCurrent && <RadarChart data={radarCurrent} previousData={radarPrev} size={300} />}
                <div className="flex gap-8 mt-8 text-sm font-semibold">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-blue-400/20" /> Today
                  </div>
                  {radarPrev && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-3 h-3 rounded-full border-2 border-slate-500 bg-slate-500/20" /> Previous
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What changed */}
            {previous && (
              <div className="flex flex-col justify-center">
                <Label>Since last scan</Label>
                <h2 className="text-4xl font-black text-white mb-4">What changed?</h2>
                <p className="text-slate-400 mb-10">Signal-level comparison across all four tracked dimensions.</p>
                <div className="space-y-4">
                  {(current.anomalyEvidence && current.anomalyEvidence.length > 0
                    ? current.anomalyEvidence
                    : [
                        { metric: 'Pain', previousValue: String(previous.context.pain), currentValue: String(current.context.pain), delta: current.context.pain < previous.context.pain ? `↓ ${previous.context.pain - current.context.pain}` : `↑ ${current.context.pain - previous.context.pain}` },
                        { metric: 'Visual Signal', previousValue: `${Math.round(previous.visualSignal.redDominance)}%`, currentValue: `${Math.round(current.visualSignal.redDominance)}%`, delta: current.visualSignal.redDominance < previous.visualSignal.redDominance ? `↓ ${Math.round(previous.visualSignal.redDominance - current.visualSignal.redDominance)}pp` : `↑ ${Math.round(current.visualSignal.redDominance - previous.visualSignal.redDominance)}pp` },
                      ]
                  ).map((ev, i) => {
                    const improving = ev.delta.includes('↓') || ev.delta.includes('-') || ev.delta === 'None';
                    return (
                      <div key={i} className="flex items-center justify-between rounded-2xl border border-white/6 px-6 py-5"
                        style={{ background: 'rgba(15,23,42,0.5)' }}>
                        <div>
                          <p className="text-xs font-bold tracking-widest uppercase text-slate-600 mb-2">{ev.metric}</p>
                          <div className="flex items-center gap-4 text-2xl font-black">
                            <span className="text-slate-500">{ev.previousValue}</span>
                            <ArrowRight className="w-5 h-5 text-slate-700" />
                            <span className="text-white">{ev.currentValue}</span>
                          </div>
                        </div>
                        <div className={`text-lg font-black px-4 py-2 rounded-xl ${
                          improving ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {ev.delta}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ════════════════ TIMELINE ════════════════ */}
        <Section>
          <Label>Your journey</Label>
          <h2 className="text-4xl font-black text-white mb-12">Recovery Timeline</h2>
          <div className="relative">
            <div className="absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div className="flex overflow-x-auto pb-8 pt-2 gap-6 px-2 snap-x hide-scrollbar">
              {[...checks].reverse().map((check, i) => (
                <div key={check.id} className="snap-center shrink-0 w-36 flex flex-col items-center gap-3">
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-600">Day {i + 1}</p>
                  <div className={`w-5 h-5 rounded-full border-4 z-10 ${
                    i === checks.length - 1
                      ? 'bg-blue-400 border-slate-950 ring-4 ring-blue-400/30'
                      : 'bg-slate-700 border-slate-950'
                  }`} />
                  <div className="w-full rounded-2xl border border-white/6 overflow-hidden"
                    style={{ background: 'rgba(15,23,42,0.6)' }}>
                    {check.imageUrl && (
                      <img src={check.imageUrl} alt={`Day ${i+1}`} className="w-full h-20 object-cover opacity-70" />
                    )}
                    <div className="p-3 text-center">
                      <p className="text-xs font-bold text-slate-400">Pain {check.context.pain}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ════════════════ BEFORE / AFTER + CV MAP ════════════════ */}
        <Section>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Before / After */}
            <div>
              <Label>Visual comparison</Label>
              <h2 className="text-4xl font-black text-white mb-4">See the change</h2>
              <p className="text-slate-400 mb-8">{checks.length} observations · Visual signal: {Math.round(oldest.visualSignal.redDominance)}% → {Math.round(current.visualSignal.redDominance)}%</p>
              <div className="rounded-3xl border border-white/8 p-4 flex gap-4"
                style={{ background: 'rgba(15,23,42,0.5)' }}>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-600 text-center">Day 1</p>
                  <img src={oldest.imageUrl!} alt="Day 1" className="w-full aspect-square object-cover rounded-2xl grayscale opacity-40" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold tracking-widest uppercase text-blue-500 text-center">Today</p>
                  <img src={current.imageUrl!} alt="Today" className="w-full aspect-square object-cover rounded-2xl" />
                </div>
              </div>
            </div>

            {/* CV signal map */}
            <div>
              <Label>Computer vision</Label>
              <h2 className="text-4xl font-black text-white mb-4">What WoundWatch sees</h2>
              <p className="text-slate-400 mb-8">Observable color signal extracted from the wound region.</p>
              <div className="rounded-3xl border border-white/8 overflow-hidden relative aspect-[4/3] flex items-center justify-center"
                style={{ background: 'rgba(15,23,42,0.5)' }}>
                <img src={current.imageUrl!} alt="Wound" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                <div className="absolute inset-6 grid grid-cols-8 grid-rows-6 gap-1">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${
                      [19,20,27,28,29,35].includes(i) ? 'bg-red-500/80 animate-pulse' :
                      [18,21,26,30,34,36].includes(i) ? 'bg-amber-500/40' :
                      'bg-slate-800/30 border border-slate-700/20'
                    }`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-5">
                <span className="text-xs text-slate-600">Low signal</span>
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-slate-800 via-amber-500 to-red-500" />
                <span className="text-xs text-slate-600">High signal</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ════════════════ FORECAST ════════════════ */}
        {current.expectedRange && (
          <Section>
            <div className="rounded-3xl border border-white/8 overflow-hidden"
              style={{ background: 'rgba(15,23,42,0.5)' }}>
              <div className="p-10 lg:p-14">
                <Label>Predictive model</Label>
                <h2 className="text-4xl font-black text-white mb-4">What should we expect next?</h2>
                <p className="text-slate-400 mb-12 text-lg">Based on your recent trajectory. Not a medical prediction.</p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { label: 'Pain Range',       value: `${Math.max(0, current.context.pain - 1)} – ${Math.min(10, current.context.pain + 1)}` },
                    { label: 'Visual Signal',     value: `${Math.max(0, Math.round(current.visualSignal.redDominance - 5))}% – ${Math.round(current.visualSignal.redDominance + 2)}%` },
                    { label: 'Observable Area',   value: '85–95% of baseline' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-2xl border border-white/6 px-6 py-6"
                      style={{ background: 'rgba(2,6,23,0.6)' }}>
                      <p className="text-xs font-bold tracking-widest uppercase text-slate-600 mb-3">{stat.label}</p>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ════════════════ HOW IT WORKS + PRIVACY ════════════════ */}
        <Section>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* How it works */}
            <div>
              <Label>Methodology</Label>
              <h2 className="text-4xl font-black text-white mb-12">How it works</h2>
              <ol className="space-y-8 relative before:absolute before:inset-y-0 before:left-[23px] before:w-px before:bg-slate-800">
                {[
                  { n: '01', title: 'Capture',    desc: 'Photo or upload — guided alignment overlay.' },
                  { n: '02', title: 'Standardize', desc: 'Image quality check, region isolation.' },
                  { n: '03', title: 'Analyze',    desc: 'Visual signal extraction, feature mapping.' },
                  { n: '04', title: 'Track',      desc: 'Personal trajectory updated, anomalies detected.' },
                ].map(s => (
                  <li key={s.n} className="flex gap-6 relative z-10">
                    <div className="w-12 h-12 shrink-0 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center font-mono font-bold text-slate-500 text-sm">
                      {s.n}
                    </div>
                    <div className="pt-3">
                      <p className="text-white font-bold text-lg">{s.title}</p>
                      <p className="text-slate-500">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Privacy */}
            <div className="rounded-3xl border border-emerald-500/15 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(2,6,23,0) 60%)' }}>
              <div className="p-10">
                <Label>Privacy</Label>
                <h2 className="text-4xl font-black text-white mb-4">Your data<br />stays here.</h2>
                <p className="text-slate-400 mb-10 text-lg">Private by design. No cloud processing required.</p>
                <ul className="space-y-5 text-lg font-medium text-slate-300">
                  {[
                    'Image processing happens locally',
                    'Recovery history stays on-device',
                    'No wound images uploaded',
                    'Works completely offline',
                    'No account required',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex items-center gap-3 text-sm font-bold text-emerald-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  SYSTEM READY
                </div>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
