import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { PomodoroMode, SESSION_TAGS, TimerSettings } from '../types/pomodoro';
import { formatTime, calculateProgressPercentage, getClayThemeForMode, getCompletedRounds } from '../utils/timerUtils';
import { playClayPopSound } from '../utils/soundEffects';

interface TimerDisplayProps {
  mode: PomodoroMode;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  currentRound: number;
  totalRounds: number;
  activeTag: string;
  isDark: boolean;
  settings: TimerSettings;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAddFiveMinutes: () => void;
  onSelectMode: (mode: PomodoroMode) => void;
  onSelectTag: (tag: string) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  remainingSeconds,
  totalDurationSeconds,
  isRunning,
  currentRound,
  totalRounds,
  activeTag,
  isDark,
  settings,
  onStart,
  onPause,
  onReset,
  onSkip,
  onAddFiveMinutes,
  onSelectMode,
  onSelectTag,
}) => {
  const theme = getClayThemeForMode(mode, isDark);
  const completedRounds = getCompletedRounds(mode, currentRound, totalRounds);
  const progressPercent = calculateProgressPercentage(remainingSeconds, totalDurationSeconds);

  // SVG circular gauge math
  const size = 320;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleModeClick = (newMode: PomodoroMode) => {
    playClayPopSound(0.2);
    onSelectMode(newMode);
  };

  const handleTagClick = (tag: string) => {
    playClayPopSound(0.15);
    onSelectTag(tag);
  };

  return (
    <section aria-label="Pomodoro Focus Timer" className="w-full max-w-lg mx-auto px-4 flex flex-col items-center">
      {/* Mode Selector Tabs in Clay Segmented Container */}
      <nav aria-label="Timer Mode Navigation" className="p-1.5 rounded-2xl clay-card-subtle bg-white/70 dark:bg-slate-800/70 flex items-center gap-1.5 mb-6">
        <button
          type="button"
          onClick={() => handleModeClick('focus')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'focus'
              ? 'clay-button bg-rose-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-pressed={mode === 'focus'}
        >
          Focus ({settings.focusMinutes}m)
        </button>
        <button
          type="button"
          onClick={() => handleModeClick('shortBreak')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'shortBreak'
              ? 'clay-button bg-emerald-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-pressed={mode === 'shortBreak'}
        >
          Short Break ({settings.shortBreakMinutes}m)
        </button>
        <button
          type="button"
          onClick={() => handleModeClick('longBreak')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'longBreak'
              ? 'clay-button bg-indigo-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-pressed={mode === 'longBreak'}
        >
          Long Rest ({settings.longBreakMinutes}m)
        </button>
      </nav>

      {/* Main Clay Timer Card */}
      <div className="w-full clay-card bg-white/95 dark:bg-slate-800/90 p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
        {/* Breathing animated aura when running */}
        {isRunning && (
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 pointer-events-none rounded-[1.75rem] blur-xl"
            style={{ backgroundColor: theme.accentColor }}
          />
        )}

        {/* Circular SVG Gauge */}
        <div className="relative flex items-center justify-center my-2">
          <svg width={size} height={size} className="clay-circle-gauge -rotate-90">
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-700/60"
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s ease',
              }}
            />
          </svg>

          {/* Center Timer Typography & Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {/* Mode & Round Pill */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.accentBg} ${theme.accentText} mb-1 border ${theme.accentBorder}`}>
              {theme.badgeText} · {currentRound}/{totalRounds}
            </span>

            {/* Main Digital Clock */}
            <h2
              data-testid="timer-display"
              className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white my-1"
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', monospace" }}
            >
              {formatTime(remainingSeconds)}
            </h2>

            {/* Current Active Tag */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              <span>Task:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">#{activeTag}</span>
            </div>

            {/* 4-Cycle Bead Indicators */}
            <div className="flex items-center gap-2 mt-3" aria-label={`Cycle progress: ${completedRounds} of ${totalRounds} completed`}>
              {Array.from({ length: totalRounds }).map((_, idx) => {
                const isCompleted = idx < completedRounds;
                const isCurrent = idx + 1 === currentRound && mode === 'focus';
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-rose-500 shadow-sm scale-110'
                        : isCurrent
                        ? 'bg-rose-400 animate-pulse ring-2 ring-rose-300 dark:ring-rose-800'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    title={`Session Round ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Tag Quick Selector Bar */}
        <div className="w-full flex items-center justify-center gap-1.5 flex-wrap my-4">
          {SESSION_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeTag === tag
                  ? 'clay-button bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'clay-button bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Tactile Clay Control Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 mt-2">
          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              playClayPopSound(0.2);
              onReset();
            }}
            className="p-3.5 rounded-2xl clay-button bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Reset timer to beginning"
            title="Reset Session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Primary Stop / Resume / Start Button */}
          {isRunning ? (
            <button
              type="button"
              onClick={() => {
                playClayPopSound(0.3);
                onPause();
              }}
              className="px-8 py-4 rounded-2xl clay-button bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base sm:text-lg flex items-center gap-2.5 shadow-lg shadow-amber-500/25"
              aria-label="Pause timer"
            >
              <Pause className="w-6 h-6 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playClayPopSound(0.3);
                onStart();
              }}
              className="px-8 py-4 rounded-2xl clay-button-primary bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base sm:text-lg flex items-center gap-2.5"
              aria-label={remainingSeconds < totalDurationSeconds ? 'Resume timer' : 'Start timer'}
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{remainingSeconds < totalDurationSeconds ? 'Resume' : 'Start Focus'}</span>
            </button>
          )}

          {/* Skip Phase Button */}
          <button
            type="button"
            onClick={() => {
              playClayPopSound(0.2);
              onSkip();
            }}
            className="p-3.5 rounded-2xl clay-button bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Skip to next session phase"
            title="Skip Phase"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Quick +5 Min Extension Button */}
          <button
            type="button"
            onClick={() => {
              playClayPopSound(0.2);
              onAddFiveMinutes();
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-3 rounded-2xl clay-button bg-white dark:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200"
            aria-label="Add 5 minutes to current timer"
            title="Add 5 Minutes"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>5m</span>
          </button>
        </div>
      </div>
    </section>
  );
};
