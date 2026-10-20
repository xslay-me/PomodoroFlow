/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PomodoroMode, TimerSettings, UserStats } from './types/pomodoro';
import { loadSettings, saveSettings, StoredTimerState } from './utils/storage';
import { PersistedAppState, readAppState, updateAppState } from './utils/appState';
import { completeTimer, createTimer, nextTimer } from './utils/sessionState';
import { calculateSleepResilientRemaining, createSessionId, getClayThemeForMode } from './utils/timerUtils';
import { getActiveStreak } from './utils/statsCalculator';
import { playCompletionSound } from './utils/soundEffects';
import { Header } from './components/Header';
import { TimerDisplay } from './components/TimerDisplay';
import { PlantCompanion } from './components/PlantCompanion';
import { FocusShieldBanner } from './components/FocusShieldBanner';
import { StatsModal } from './components/StatsModal';
import { StatsDashboard } from './components/StatsDashboard';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { DistractionFreeOverlay } from './components/DistractionFreeOverlay';

export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => loadSettings());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [saved, setSaved] = useState<PersistedAppState | null>(null);
  const savedRef = useRef(saved);
  const [now, setNow] = useState(Date.now);
  const [storageError, setStorageError] = useState('');
  const [currentView, setCurrentView] = useState<'timer' | 'dashboard'>('timer');
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const completing = useRef(false);

  const applySaved = useCallback((next: PersistedAppState) => {
    if (!savedRef.current || next.revision >= savedRef.current.revision) {
      savedRef.current = next;
      setSaved(next);
      setNow(Date.now());
    }
    setStorageError('');
  }, []);

  const reportStorageError = useCallback((error: unknown) => {
    console.error('Unable to save progress', error);
    setStorageError('Progress could not be saved. Allow browser storage and try again.');
  }, []);

  const refresh = useCallback(() => {
    return readAppState(settingsRef.current.focusMinutes).then(applySaved).catch(reportStorageError);
  }, [applySaved, reportStorageError]);

  const commit = useCallback(async (update: (current: PersistedAppState) => PersistedAppState) => {
    try {
      const next = await updateAppState(update, settingsRef.current.focusMinutes);
      applySaved(next);
      return next;
    } catch (error) {
      reportStorageError(error);
    }
  }, [applySaved, reportStorageError]);

  useEffect(() => {
    void refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'pomodoroflow_settings_v1') setSettings(loadSettings());
      if (event.key === null || event.key === 'pomodoroflow_timer_state_v1' || event.key === 'pomodoroflow_stats_v1') {
        void refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  useEffect(() => {
    const checkTime = () => {
      const current = savedRef.current;
      const timestamp = Date.now();
      setNow(timestamp);
      if (!current?.timer.isRunning || current.timer.targetEndTime === null
        || timestamp < current.timer.targetEndTime || completing.current) return;
      completing.current = true;
      const sessionId = current.timer.sessionId;
      const completedMode = current.timer.mode;
      let credited = false;
      void commit((latest) => {
        const next = completeTimer(latest, sessionId, settingsRef.current, timestamp);
        credited = next !== latest && next.stats !== latest.stats;
        return next;
      }).then((result) => {
        // Only the tab that credited the session celebrates; saving is independent of audio.
        if (result && credited) {
          try {
            if (settingsRef.current.soundEnabled) {
              playCompletionSound(settingsRef.current.soundType, settingsRef.current.volume);
            }
            if (completedMode === 'focus') {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 },
                colors: ['#fb7185', '#fda4af', '#facc15', '#34d399', '#38bdf8'] });
            }
          } catch (error) {
            console.error('Completion effect unavailable', error);
          }
        }
      }).finally(() => { completing.current = false; });
    };
    const onWake = () => { checkTime(); void refresh(); };
    const onVisibility = () => { if (!document.hidden) onWake(); };
    checkTime();
    const interval = window.setInterval(checkTime, 500);
    window.addEventListener('focus', onWake);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onWake);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [commit, refresh, saved !== null]);

  const updateTimer = (update: (timer: StoredTimerState) => StoredTimerState) => {
    void commit((current) => ({ ...current, timer: update(current.timer) }));
  };
  const handleStart = () => updateTimer((timer) => timer.isRunning ? timer : {
    ...timer, isRunning: true, targetEndTime: Date.now() + timer.remainingSeconds * 1000,
  });
  const handlePause = () => {
    void commit((current) => {
      const next = completeTimer(current, current.timer.sessionId, settingsRef.current);
      const timer = next.timer;
      return { ...next, timer: { ...timer, isRunning: false, targetEndTime: null,
        remainingSeconds: calculateSleepResilientRemaining(timer.targetEndTime, timer.isRunning, timer.remainingSeconds) } };
    });
  };
  const handleReset = () => updateTimer((timer) => ({
    ...timer, sessionId: createSessionId(), remainingSeconds: timer.totalDurationSeconds,
    isRunning: false, targetEndTime: null,
  }));
  const handleSkip = () => updateTimer((timer) => nextTimer(timer, settingsRef.current));
  const handleAddFiveMinutes = () => updateTimer((timer) => ({
    ...timer,
    remainingSeconds: calculateSleepResilientRemaining(timer.targetEndTime, timer.isRunning, timer.remainingSeconds) + 300,
    totalDurationSeconds: timer.totalDurationSeconds + 300,
    targetEndTime: timer.isRunning && timer.targetEndTime !== null ? timer.targetEndTime + 300000 : null,
  }));
  const handleSelectMode = (mode: PomodoroMode) => updateTimer((timer) =>
    createTimer(mode, timer.currentRound, timer.activeTag, settingsRef.current));
  const handleUpdateSettings = (partial: Partial<TimerSettings>) => {
    const updated = { ...settingsRef.current, ...partial };
    settingsRef.current = updated;
    setSettings(updated);
    saveSettings(updated);
    const durationChanged = partial.focusMinutes !== undefined || partial.shortBreakMinutes !== undefined || partial.longBreakMinutes !== undefined;
    if (durationChanged) updateTimer((timer) => {
      const changed = timer.mode === 'focus' ? partial.focusMinutes
        : timer.mode === 'shortBreak' ? partial.shortBreakMinutes : partial.longBreakMinutes;
      return !timer.isRunning && changed !== undefined
        ? createTimer(timer.mode, timer.currentRound, timer.activeTag, updated) : timer;
    });
  };
  const handleUpdateStats = (stats: UserStats) => { void commit((current) => ({ ...current, stats })); };

  if (!saved) return <main className="p-8 text-center">
    <p role={storageError ? 'alert' : 'status'}>{storageError || 'Loading saved progress…'}</p>
    {storageError && <button type="button" onClick={() => void refresh()}>Try again</button>}
  </main>;

  const { stats, timer } = saved;
  const { mode, totalDurationSeconds, isRunning, currentRound, activeTag } = timer;
  const remainingSeconds = calculateSleepResilientRemaining(timer.targetEndTime, isRunning, timer.remainingSeconds, now);
  const displayStats = { ...stats, streakDays: getActiveStreak(stats, now) };
  const clayTheme = getClayThemeForMode(mode, settings.darkMode);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${clayTheme.bgGradient} transition-colors duration-500 pb-12 flex flex-col`}
    >
      {storageError && <p role="alert" className="p-4 text-center text-rose-700 dark:text-rose-300">{storageError}</p>}
      {/* Top Header */}
      <Header
        mode={mode}
        settings={settings}
        stats={displayStats}
        isRunning={isRunning}
        currentView={currentView}
        onSelectView={setCurrentView}
        onToggleDarkMode={() => handleUpdateSettings({ darkMode: !settings.darkMode })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onToggleDistractionFree={() => setIsDistractionFree(true)}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
      />

      {/* Focus Reminder Banner */}
      {settings.notificationShield && currentView === 'timer' && (
        <FocusShieldBanner isRunning={isRunning} mode={mode} />
      )}

      {/* Main Content Area */}
      {currentView === 'dashboard' ? (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 animate-in fade-in duration-300">
          <StatsDashboard
            stats={displayStats}
            onUpdateStats={handleUpdateStats}
            onClose={() => setCurrentView('timer')}
            isFullView={true}
          />
        </main>
      ) : (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
          {/* Left Column: Main Clay Pomodoro Timer Card */}
          <div className="w-full lg:flex-1 flex justify-center">
            <TimerDisplay
              mode={mode}
              remainingSeconds={remainingSeconds}
              totalDurationSeconds={totalDurationSeconds}
              isRunning={isRunning}
              currentRound={currentRound}
              totalRounds={settings.longBreakInterval}
              activeTag={activeTag}
              isDark={settings.darkMode}
              settings={settings}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSkip={handleSkip}
              onAddFiveMinutes={handleAddFiveMinutes}
              onSelectMode={handleSelectMode}
              onSelectTag={(activeTag) => updateTimer((timer) => ({ ...timer, activeTag }))}
            />
          </div>

          {/* Right Column: Gamified Clay Desk Companion & Quick Stats */}
          <div className="w-full lg:w-84 xl:w-92 flex flex-col gap-4 items-center">
            <PlantCompanion xp={stats.xp} isRunning={isRunning} mode={mode} />

            {/* Quick Desk Focus Info */}
            <div className="w-full max-w-sm clay-card-subtle bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-base">🍅</span>
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-100">
                    {stats.completedSessions} Focus Sessions
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stats.totalFocusMinutes} min total · Record: {stats.longestStreakDays || stats.streakDays}d
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 rounded-xl clay-button bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs"
              >
                Dashboard
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Modals & Zen Overlays */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={displayStats}
        onUpdateStats={handleUpdateStats}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        stats={displayStats}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <DistractionFreeOverlay
        isOpen={isDistractionFree}
        onClose={() => setIsDistractionFree(false)}
        mode={mode}
        remainingSeconds={remainingSeconds}
        totalDurationSeconds={totalDurationSeconds}
        isRunning={isRunning}
        activeTag={activeTag}
        isDark={settings.darkMode}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />
    </div>
  );
}
