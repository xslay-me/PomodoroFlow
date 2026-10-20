import React from 'react';
import {
  Sun,
  Moon,
  Settings,
  BarChart2,
  Trophy,
  Maximize2,
  Volume2,
  VolumeX,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { PomodoroMode, TimerSettings, UserStats } from '../types/pomodoro';
import { playClayPopSound } from '../utils/soundEffects';

interface HeaderProps {
  mode: PomodoroMode;
  settings: TimerSettings;
  stats: UserStats;
  isRunning: boolean;
  currentView: 'timer' | 'dashboard';
  onSelectView: (view: 'timer' | 'dashboard') => void;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onToggleDistractionFree: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  settings,
  stats,
  isRunning,
  currentView,
  onSelectView,
  onToggleDarkMode,
  onOpenSettings,
  onOpenStats,
  onOpenAchievements,
  onToggleDistractionFree,
  onToggleSound,
}) => {
  const handleAction = (cb: () => void) => {
    playClayPopSound(0.2);
    cb();
  };

  return (
    <header className="w-full max-w-5xl mx-auto pt-6 pb-4 px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Brand logo & view switch */}
      <div className="flex items-center justify-between gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-400 via-rose-300 to-amber-200 clay-card-subtle flex items-center justify-center p-2 text-white shadow-sm transition-transform hover:scale-105 shrink-0">
            {/* Custom clay tomato / leaf icon */}
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 sm:w-7 sm:h-7" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 4C9 4 5 7 5 13C5 17.5 8 21 12 21C16 21 19 17.5 19 13C19 7 15 4 12 4Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M12 2V6M9.5 3.5C10.5 4.5 11 5.5 12 6C13 5.5 13.5 4.5 14.5 3.5"
                stroke="#047857"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="11.5" r="1.5" fill="#e11d48" />
              <circle cx="14.5" cy="11.5" r="1.5" fill="#e11d48" />
              <path d="M10.5 15C11 15.5 13 15.5 13.5 15" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-800 dark:text-white font-sans">
                Pomodoro<span className="text-rose-500 dark:text-rose-400">Flow</span>
              </h1>
              {isRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden xs:block">
              Claymorphic Focus Companion
            </p>
          </div>
        </div>

        {/* View Switcher Tabs: Timer vs Dashboard */}
        <div className="flex items-center p-1 rounded-2xl clay-card-inset bg-slate-100 dark:bg-slate-800/80 shrink-0 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => handleAction(() => onSelectView('timer'))}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'timer'
                ? 'clay-button bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timer</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => onSelectView('dashboard'))}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'dashboard'
                ? 'clay-button bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 justify-end">
        {/* Streak Quick Indicator */}
        <button
          type="button"
          onClick={() => handleAction(onOpenStats)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl clay-button text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40"
          aria-label={`View stats. Current streak: ${stats.streakDays} days, Longest: ${stats.longestStreakDays} days`}
          title={`Streak: ${stats.streakDays} days (Record: ${stats.longestStreakDays} days)`}
        >
          <span className="text-base leading-none">🔥</span>
          <span>{stats.streakDays}d streak</span>
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={() => handleAction(onToggleSound)}
          className="p-2.5 rounded-xl clay-button text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
          aria-label={settings.soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
          title={settings.soundEnabled ? 'Audio Alerts: On' : 'Audio Alerts: Muted'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Trophies / Achievements */}
        <button
          type="button"
          onClick={() => handleAction(onOpenAchievements)}
          className="p-2.5 rounded-xl clay-button text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:text-amber-500 dark:hover:text-amber-400 relative"
          aria-label={`Achievements. Unlocked: ${stats.unlockedBadges.length}`}
          title="Achievements & Trophies"
        >
          <Trophy className="w-4 h-4" />
          {stats.unlockedBadges.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {stats.unlockedBadges.length}
            </span>
          )}
        </button>

        {/* Journey Statistics Modal Button */}
        <button
          type="button"
          onClick={() => handleAction(onOpenStats)}
          className="p-2.5 rounded-xl clay-button text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:text-rose-500 dark:hover:text-rose-400"
          aria-label="Open statistics dashboard modal"
          title="Open Statistics Dashboard"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Distraction Free Fullscreen */}
        <button
          type="button"
          onClick={() => handleAction(onToggleDistractionFree)}
          className="hidden md:flex p-2.5 rounded-xl clay-button text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:text-indigo-500 dark:hover:text-indigo-400"
          aria-label="Toggle distraction-free zen mode"
          title="Zen Distraction-Free Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => handleAction(onOpenSettings)}
          className="p-2.5 rounded-xl clay-button text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
          aria-label="Open timer settings"
          title="Timer Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => handleAction(onToggleDarkMode)}
          className="p-2.5 rounded-xl clay-button text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:text-amber-500 dark:hover:text-amber-400"
          aria-label={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={settings.darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>
    </header>
  );
};
