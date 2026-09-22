import { RecoveryCheck } from '@/types';

const STORAGE_KEY = 'woundwatch_recovery_checks_v1';

export function getSavedChecks(): RecoveryCheck[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    const checks = Array.isArray(parsed) ? parsed : [];
    
    // Migrate legacy checks
    return checks.map((c: any) => ({
      ...c,
      safetyLevel: c.safetyLevel || 'normal',
      trend: c.trend ? c.trend.toLowerCase() : 'stable',
      comparison: c.comparison || {
        comparisonConfidence: 'high',
        previousPain: null,
        currentPain: c.context?.pain || 0,
        painDelta: null,
        previousVisualSignal: null,
        currentVisualSignal: c.visualSignal?.redDominance || 0,
        visualSignalDelta: null,
        baselinePain: null,
        baselineVisualSignal: null,
      },
      reasoning: c.reasoning || [],
    }));
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return [];
  }
}

export function saveCheck(check: RecoveryCheck): RecoveryCheck[] {
  const existing = getSavedChecks();
  // Insert newest check at top of list
  const updated = [check, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save check to localStorage:', err);
  }
  return updated;
}

export function deleteCheck(id: string): RecoveryCheck[] {
  const existing = getSavedChecks();
  const updated = existing.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete check:', err);
  }
  return updated;
}

export function clearAllChecks(): RecoveryCheck[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear checks:', err);
  }
  return [];
}
