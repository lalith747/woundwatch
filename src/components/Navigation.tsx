import React from 'react';
import { NavigationTab } from '@/types';
import { ScanFace } from 'lucide-react';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: NavigationTab; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'check',     label: 'Scan'     },
    { id: 'timeline',  label: 'Timeline' },
    { id: 'report',    label: 'Report'   },
  ];

  const isActive = (id: NavigationTab) =>
    activeTab === id || (id === 'dashboard' && activeTab === 'overview');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>

        {/* ── LOGO ── */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-105 transition-transform">
            <ScanFace className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-extrabold tracking-tight text-lg leading-none">
            Wound<span className="text-blue-400">Watch</span>
          </span>
        </button>

        {/* ── NAV LINKS ── */}
        <nav className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-2xl p-1.5">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive(id)
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── STATUS PILL ── */}
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-sm font-semibold tracking-tight">On-device</span>
        </div>

      </div>
    </header>
  );
};
