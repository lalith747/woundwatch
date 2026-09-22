import React, { useState, useEffect } from 'react';
import { NavigationTab, RecoveryCheck } from '@/types';
import { getSavedChecks } from '@/services/storage';
import { Navigation } from '@/components/Navigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { RecoveryScanner } from '@/pages/RecoveryScanner';
import { TimelinePage } from '@/pages/TimelinePage';
import { CareGuidePage } from '@/pages/CareGuidePage';
import { ReportPage } from '@/pages/ReportPage';
import { generateDemoScenario, DEMO_CHECKS } from '@/data/demoCase';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [checks, setChecks] = useState<RecoveryCheck[]>([]);

  // Always dark — the new design is dark-only
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    setChecks(getSavedChecks());
  }, []);

  const refreshChecks = () => {
    setChecks(getSavedChecks());
  };

  const handleCompleteCheck = () => {
    setIsDemoMode(false);
    setChecks(getSavedChecks());
    setActiveTab('dashboard');
  };

  const loadDemo = () => {
    setIsDemoMode(true);
    setChecks(DEMO_CHECKS);
    setActiveTab('dashboard');
  };

  const loadDemoScenario = async (scenario: 'improving' | 'change_point' | 'low_confidence' | 'seek_care') => {
    setIsDemoMode(true);
    const generatedChecks = await generateDemoScenario(scenario);
    setChecks(generatedChecks);
    setActiveTab('dashboard');
  };

  const clearDemo = () => {
    setIsDemoMode(false);
    setChecks(getSavedChecks());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-between px-4 py-2">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
            Synthetic demo data — not real clinical observations
          </span>
          <button
            onClick={clearDemo}
            className="text-blue-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            Exit demo
          </button>
        </div>
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        darkMode={true}
        onToggleDarkMode={() => {}} // no-op — dark only
      />

      <main className="flex-1 w-full">
        {(activeTab === 'dashboard' || activeTab === 'overview') && (
          <DashboardPage
            checks={checks}
            isDemoMode={isDemoMode}
            onNewCheck={() => setActiveTab('check')}
            onOpenReport={() => setActiveTab('report')}
            onLoadDemo={loadDemoScenario}
          />
        )}

        {activeTab === 'check' && (
          <RecoveryScanner
            onComplete={handleCompleteCheck}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelinePage
            checks={checks}
            isDemoMode={isDemoMode}
            onRefreshTimeline={refreshChecks}
            onStartNewCheck={() => setActiveTab('check')}
            onOpenReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'careguide' && <CareGuidePage />}

        {activeTab === 'report' && (
          <ReportPage
            checks={checks}
            onBack={() => setActiveTab('timeline')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
