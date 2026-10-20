/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PomodoroMode, SessionRecord, TimerSettings, UserStats } from './types/pomodoro';
import {
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  loadTimerState,
  saveTimerState,
} from './utils/storage';
import {
  calculateSleepResilientRemaining,
  getNextPhase,
  getClayThemeForMode,
} from './utils/timerUtils';
import { calculateSessionXP, checkNewAchievements } from './utils/rewardsEngine';
import { getLocalDateString, updateStreak, updateStreakAndLongest } from './utils/statsCalculator';
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
  // Load persistent configurations
  const [settings, setSettings] = useState<TimerSettings>(() => loadSettings());
  const [stats, setStats] = useState<UserStats>(() => loadStats());
  const [currentView, setCurrentView] = useState<'timer' | 'dashboard'>('timer');

  // Timer operational states
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => settings.focusMinutes * 60);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(() => settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [activeTag, setActiveTag] = useState<string>('Study');

  // Modals & Overlays
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);

  // Initial load from local storage
  const isHydrated = useRef(false);

  useEffect(() => {
    const saved = loadTimerState(settings.focusMinutes);
    setMode(saved.mode);
    setCurrentRound(saved.currentRound);
    setActiveTag(saved.activeTag);

    // If was running prior to reload or sleep, recalculate remaining seconds
    if (saved.isRunning && saved.targetEndTime) {
      const realRemaining = calculateSleepResilientRemaining(
        saved.targetEndTime,
        true,
        saved.remainingSeconds
      );
      if (realRemaining > 0) {
        setRemainingSeconds(realRemaining);
        setTotalDurationSeconds(saved.totalDurationSeconds);
        setTargetEndTime(saved.targetEndTime);
        setIsRunning(true);
      } else {
        // Timer completed during sleep / while closed
        setRemainingSeconds(0);
        setTotalDurationSeconds(saved.totalDurationSeconds);
        setTargetEndTime(null);
        setIsRunning(false);
      }
    } else {
      setRemainingSeconds(saved.remainingSeconds);
      setTotalDurationSeconds(saved.totalDurationSeconds);
      setTargetEndTime(null);
      setIsRunning(false);
    }
    isHydrated.current = true;
  }, []);

  // Sync dark mode class to root document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Persist timer state whenever key timer attributes change
  useEffect(() => {
    if (!isHydrated.current) return;
    saveTimerState({
      mode,
      remainingSeconds,
      totalDurationSeconds,
      isRunning,
      targetEndTime,
      currentRound,
      activeTag,
    });
  }, [mode, remainingSeconds, totalDurationSeconds, isRunning, targetEndTime, currentRound, activeTag]);

  // Handle session completion logic
  const handleSessionComplete = useCallback(() => {
    // Play celebratory sound
    if (settings.soundEnabled) {
      playCompletionSound(settings.soundType, settings.volume);
    }

    // Confetti burst for focus session completions
    if (mode === 'focus') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#fb7185', '#fda4af', '#facc15', '#34d399', '#38bdf8'],
        });
      } catch (e) {
        // Fallback gracefully if confetti fails
      }
    }

    // Calculate progression and stats
    const todayStr = getLocalDateString();
    const durationMins = Math.round(totalDurationSeconds / 60);
    const xpGained = calculateSessionXP(mode, stats.streakDays);

    const newRecord: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      mode,
      durationMinutes: durationMins,
      timestamp: Date.now(),
      tag: activeTag,
    };

    setStats((prev) => {
      const isFocus = mode === 'focus';
      const streakResult = isFocus
        ? updateStreakAndLongest(prev.streakDays, prev.longestStreakDays || 0, prev.lastActiveDate, todayStr)
        : { currentStreak: prev.streakDays, longestStreak: prev.longestStreakDays || prev.streakDays };
      const updatedTotalMins = isFocus ? prev.totalFocusMinutes + durationMins : prev.totalFocusMinutes;
      const updatedCompleted = isFocus ? prev.completedSessions + 1 : prev.completedSessions;
      const updatedXP = prev.xp + xpGained;

      const updatedDailyHistory = { ...prev.dailyHistory };
      const updatedDailySessionCount = { ...(prev.dailySessionCount || {}) };
      if (isFocus) {
        updatedDailyHistory[todayStr] = (updatedDailyHistory[todayStr] || 0) + durationMins;
        updatedDailySessionCount[todayStr] = (updatedDailySessionCount[todayStr] || 0) + 1;
      }

      const updatedTagMinutes = { ...prev.tagMinutes };
      if (isFocus) {
        updatedTagMinutes[activeTag] = (updatedTagMinutes[activeTag] || 0) + durationMins;
      }

      const nextStats: UserStats = {
        ...prev,
        totalFocusMinutes: updatedTotalMins,
        completedSessions: updatedCompleted,
        streakDays: streakResult.currentStreak,
        longestStreakDays: streakResult.longestStreak,
        lastActiveDate: isFocus ? todayStr : prev.lastActiveDate,
        dailyHistory: updatedDailyHistory,
        dailySessionCount: updatedDailySessionCount,
        tagMinutes: updatedTagMinutes,
        sessionsHistory: [...prev.sessionsHistory, newRecord],
        xp: updatedXP,
      };

      // Check achievement badges
      const newBadges = checkNewAchievements(nextStats);
      if (newBadges.length > 0) {
        nextStats.unlockedBadges = [...new Set([...nextStats.unlockedBadges, ...newBadges])];
      }

      saveStats(nextStats);
      return nextStats;
    });

    // Advance to next cycle phase
    const nextPhaseInfo = getNextPhase(mode, currentRound, settings.longBreakInterval);
    const nextDurationMinutes =
      nextPhaseInfo.nextMode === 'focus'
        ? settings.focusMinutes
        : nextPhaseInfo.nextMode === 'shortBreak'
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;

    const nextDurationSecs = nextDurationMinutes * 60;

    setMode(nextPhaseInfo.nextMode);
    setCurrentRound(nextPhaseInfo.nextRound);
    setRemainingSeconds(nextDurationSecs);
    setTotalDurationSeconds(nextDurationSecs);
    setTargetEndTime(null);
    setIsRunning(false);
  }, [
    mode,
    currentRound,
    settings,
    stats.streakDays,
    totalDurationSeconds,
    activeTag,
  ]);

  // Main Timer Interval Loop with Sleep Detection
  useEffect(() => {
    if (!isRunning || !targetEndTime) return;

    const checkTime = () => {
      const realRemaining = calculateSleepResilientRemaining(targetEndTime, true, remainingSeconds);
      if (realRemaining <= 0) {
        setRemainingSeconds(0);
        setIsRunning(false);
        setTargetEndTime(null);
        handleSessionComplete();
      } else {
        setRemainingSeconds(realRemaining);
      }
    };

    // Run check immediately on mount or wake
    checkTime();

    const intervalId = window.setInterval(checkTime, 500);

    // Resynchronize on tab focus or sleep wake
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTime();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkTime);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkTime);
    };
  }, [isRunning, targetEndTime, remainingSeconds, handleSessionComplete]);

  // Timer Control Actions
  const handleStart = () => {
    const end = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(end);
    setIsRunning(true);
  };

  const handlePause = () => {
    // When stopped / paused, freeze remaining seconds and clear target end time
    if (targetEndTime) {
      const realRemaining = calculateSleepResilientRemaining(targetEndTime, true, remainingSeconds);
      setRemainingSeconds(realRemaining);
    }
    setTargetEndTime(null);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTargetEndTime(null);
    setRemainingSeconds(totalDurationSeconds);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setTargetEndTime(null);
    const nextPhaseInfo = getNextPhase(mode, currentRound, settings.longBreakInterval);
    const nextDurationMinutes =
      nextPhaseInfo.nextMode === 'focus'
        ? settings.focusMinutes
        : nextPhaseInfo.nextMode === 'shortBreak'
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;

    const nextDurationSecs = nextDurationMinutes * 60;
    setMode(nextPhaseInfo.nextMode);
    setCurrentRound(nextPhaseInfo.nextRound);
    setRemainingSeconds(nextDurationSecs);
    setTotalDurationSeconds(nextDurationSecs);
  };

  const handleAddFiveMinutes = () => {
    const additionalSecs = 5 * 60;
    setRemainingSeconds((prev) => {
      const nextRemaining = prev + additionalSecs;
      if (isRunning && targetEndTime) {
        setTargetEndTime(targetEndTime + additionalSecs * 1000);
      }
      return nextRemaining;
    });
    setTotalDurationSeconds((prev) => prev + additionalSecs);
  };

  const handleSelectMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setTargetEndTime(null);
    setMode(newMode);
    const durationMinutes =
      newMode === 'focus'
        ? settings.focusMinutes
        : newMode === 'shortBreak'
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
    const durSecs = durationMinutes * 60;
    setRemainingSeconds(durSecs);
    setTotalDurationSeconds(durSecs);
  };

  const handleUpdateSettings = (newPartial: Partial<TimerSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    saveSettings(updated);

    // If timer is not running, adjust total duration if current mode duration was updated
    if (!isRunning) {
      if (mode === 'focus' && newPartial.focusMinutes !== undefined) {
        const dur = newPartial.focusMinutes * 60;
        setRemainingSeconds(dur);
        setTotalDurationSeconds(dur);
      } else if (mode === 'shortBreak' && newPartial.shortBreakMinutes !== undefined) {
        const dur = newPartial.shortBreakMinutes * 60;
        setRemainingSeconds(dur);
        setTotalDurationSeconds(dur);
      } else if (mode === 'longBreak' && newPartial.longBreakMinutes !== undefined) {
        const dur = newPartial.longBreakMinutes * 60;
        setRemainingSeconds(dur);
        setTotalDurationSeconds(dur);
      }
    }
  };

  const handleResetStats = () => {
    const freshStats: UserStats = {
      totalFocusMinutes: 0,
      completedSessions: 0,
      streakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: '',
      dailyHistory: {},
      dailySessionCount: {},
      tagMinutes: { Study: 0, Code: 0, Write: 0, Read: 0, Work: 0 },
      sessionsHistory: [],
      xp: 0,
      unlockedBadges: [],
    };
    setStats(freshStats);
    saveStats(freshStats);
  };

  const clayTheme = getClayThemeForMode(mode, settings.darkMode);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${clayTheme.bgGradient} transition-colors duration-500 pb-12 flex flex-col`}
    >
      {/* Top Header */}
      <Header
        mode={mode}
        settings={settings}
        stats={stats}
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

      {/* Focus Shield / DND Banner */}
      {settings.notificationShield && currentView === 'timer' && (
        <FocusShieldBanner isRunning={isRunning} mode={mode} />
      )}

      {/* Main Content Area */}
      {currentView === 'dashboard' ? (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 animate-in fade-in duration-300">
          <StatsDashboard
            stats={stats}
            onUpdateStats={(newStats) => {
              setStats(newStats);
              saveStats(newStats);
            }}
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
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSkip={handleSkip}
              onAddFiveMinutes={handleAddFiveMinutes}
              onSelectMode={handleSelectMode}
              onSelectTag={setActiveTag}
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
        stats={stats}
        onUpdateStats={(newStats) => {
          setStats(newStats);
          saveStats(newStats);
        }}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        stats={stats}
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
