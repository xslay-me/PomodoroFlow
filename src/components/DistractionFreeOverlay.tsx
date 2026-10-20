import React, { useEffect } from 'react';
import { Minimize2, Play, Pause, RotateCcw } from 'lucide-react';
import { PomodoroMode } from '../types/pomodoro';
import { formatTime, calculateProgressPercentage, getClayThemeForMode } from '../utils/timerUtils';
import { playClayPopSound } from '../utils/soundEffects';

interface DistractionFreeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mode: PomodoroMode;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  activeTag: string;
  isDark: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const DistractionFreeOverlay: React.FC<DistractionFreeOverlayProps> = ({
  isOpen,
  onClose,
  mode,
  remainingSeconds,
  totalDurationSeconds,
  isRunning,
  activeTag,
  isDark,
  onStart,
  onPause,
  onReset,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const theme = getClayThemeForMode(mode, isDark);
  const progressPercent = calculateProgressPercentage(remainingSeconds, totalDurationSeconds);

  return (
    <div
      role="dialog"
      aria-label="Distraction-Free Zen Timer Mode"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors animate-in fade-in"
    >
      {/* Top Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Zen Mode · #{activeTag}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playClayPopSound(0.2);
            onClose();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl clay-button bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
          aria-label="Exit distraction-free mode (or press Escape)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Zen Mode</span>
        </button>
      </div>

      {/* Center Giant Clay Clock */}
      <div className="flex flex-col items-center my-auto">
        <div className="w-72 h-72 sm:w-84 sm:h-84 rounded-full clay-card bg-white dark:bg-slate-900/90 flex flex-col items-center justify-center p-8 relative">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.accentBg} ${theme.accentText} mb-2 border ${theme.accentBorder}`}>
            {theme.badgeText}
          </span>

          <h1
            className="text-6xl sm:text-7xl font-black tracking-tight text-slate-800 dark:text-white my-2"
            style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', monospace" }}
          >
            {formatTime(remainingSeconds)}
          </h1>

          <div className="w-36 h-2 rounded-full clay-card-inset bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
            <div
              style={{ width: `${progressPercent}%`, backgroundColor: theme.accentColor }}
              className="h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => {
              playClayPopSound(0.2);
              onReset();
            }}
            className="p-3.5 rounded-2xl clay-button bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning ? (
            <button
              type="button"
              onClick={() => {
                playClayPopSound(0.3);
                onPause();
              }}
              className="px-8 py-3.5 rounded-2xl clay-button bg-amber-500 text-white font-extrabold flex items-center gap-2"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playClayPopSound(0.3);
                onStart();
              }}
              className="px-8 py-3.5 rounded-2xl clay-button-primary bg-rose-500 text-white font-extrabold flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <p className="text-xs text-slate-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Esc</kbd> to return to standard view
      </p>
    </div>
  );
};
