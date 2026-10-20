import { PomodoroMode } from '../types/pomodoro';

/**
 * Formats seconds into MM:SS display format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates remaining seconds in a sleep-resilient and reload-safe way
 * Uses real wall-clock delta when the timer is running.
 */
export function calculateSleepResilientRemaining(
  targetEndTime: number | null,
  isRunning: boolean,
  storedRemaining: number,
  nowMs: number = Date.now()
): number {
  if (!isRunning || targetEndTime === null) {
    return Math.max(0, storedRemaining);
  }
  const diffMs = targetEndTime - nowMs;
  return Math.max(0, Math.ceil(diffMs / 1000));
}

/**
 * Calculates percentage of time elapsed (0 to 100)
 */
export function calculateProgressPercentage(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 100;
  const elapsed = totalSeconds - remainingSeconds;
  const pct = (elapsed / totalSeconds) * 100;
  return Math.min(100, Math.max(0, Number(pct.toFixed(1))));
}

/**
 * Determines the next Pomodoro phase based on completed focus rounds
 */
export function getNextPhase(
  currentMode: PomodoroMode,
  currentRound: number,
  longBreakInterval: number
): {
  nextMode: PomodoroMode;
  nextRound: number;
  completedFocusSession: boolean;
} {
  if (currentMode === 'focus') {
    const isLongBreak = currentRound >= longBreakInterval;
    return {
      nextMode: isLongBreak ? 'longBreak' : 'shortBreak',
      nextRound: isLongBreak ? 1 : currentRound + 1,
      completedFocusSession: true,
    };
  } else {
    // Both shortBreak and longBreak transition back to focus
    return {
      nextMode: 'focus',
      nextRound: currentRound,
      completedFocusSession: false,
    };
  }
}

/**
 * Color theme palette configuration for each pomodoro mode in clay style
 */
export function getClayThemeForMode(mode: PomodoroMode, isDark: boolean) {
  if (isDark) {
    switch (mode) {
      case 'focus':
        return {
          bgGradient: 'from-slate-900 via-rose-950/20 to-slate-900',
          accentColor: '#f43f5e',
          accentText: 'text-rose-400',
          accentBg: 'bg-rose-500/20',
          accentBorder: 'border-rose-500/30',
          cardSurface: 'bg-slate-800/90',
          ringColor: '#f43f5e',
          badgeText: 'Focus Session',
        };
      case 'shortBreak':
        return {
          bgGradient: 'from-slate-900 via-emerald-950/20 to-slate-900',
          accentColor: '#10b981',
          accentText: 'text-emerald-400',
          accentBg: 'bg-emerald-500/20',
          accentBorder: 'border-emerald-500/30',
          cardSurface: 'bg-slate-800/90',
          ringColor: '#10b981',
          badgeText: 'Short Break',
        };
      case 'longBreak':
        return {
          bgGradient: 'from-slate-900 via-indigo-950/20 to-slate-900',
          accentColor: '#818cf8',
          accentText: 'text-indigo-400',
          accentBg: 'bg-indigo-500/20',
          accentBorder: 'border-indigo-500/30',
          cardSurface: 'bg-slate-800/90',
          ringColor: '#818cf8',
          badgeText: 'Long Rest',
        };
    }
  }

  // Light Claymorphic Pastel Theme
  switch (mode) {
    case 'focus':
      return {
        bgGradient: 'from-rose-50 via-orange-50/60 to-amber-50/50',
        accentColor: '#fb7185',
        accentText: 'text-rose-600',
        accentBg: 'bg-rose-100/80',
        accentBorder: 'border-rose-200',
        cardSurface: 'bg-white/95',
        ringColor: '#f43f5e',
        badgeText: 'Focus Session',
      };
    case 'shortBreak':
      return {
        bgGradient: 'from-emerald-50 via-teal-50/60 to-cyan-50/50',
        accentColor: '#34d399',
        accentText: 'text-emerald-700',
        accentBg: 'bg-emerald-100/80',
        accentBorder: 'border-emerald-200',
        cardSurface: 'bg-white/95',
        ringColor: '#10b981',
        badgeText: 'Short Break',
      };
    case 'longBreak':
      return {
        bgGradient: 'from-indigo-50 via-purple-50/60 to-pink-50/50',
        accentColor: '#a78bfa',
        accentText: 'text-indigo-600',
        accentBg: 'bg-indigo-100/80',
        accentBorder: 'border-indigo-200',
        cardSurface: 'bg-white/95',
        ringColor: '#6366f1',
        badgeText: 'Long Rest',
      };
  }
}

/** Focus rounds completed within the displayed cycle. */
export function getCompletedRounds(mode: PomodoroMode, currentRound: number, totalRounds: number): number {
  return mode === 'longBreak' ? totalRounds : Math.max(0, Math.min(totalRounds, currentRound - 1));
}

/** Random IDs also work when the dev server is opened over HTTP on a LAN. */
export function createSessionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
