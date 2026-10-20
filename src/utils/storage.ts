import { SessionRecord, TimerSettings, UserStats } from '../types/pomodoro';
import { getLocalDateString } from './statsCalculator';

const SETTINGS_KEY = 'pomodoroflow_settings_v1';
const STATS_KEY = 'pomodoroflow_stats_v1';
const TIMER_STATE_KEY = 'pomodoroflow_timer_state_v1';

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundType: 'zenBell',
  volume: 0.75,
  soundEnabled: true,
  darkMode: false,
  notificationShield: true,
};

export const DEFAULT_STATS: UserStats = {
  totalFocusMinutes: 0,
  completedSessions: 0,
  streakDays: 0,
  longestStreakDays: 0,
  lastActiveDate: '',
  dailyHistory: {},
  dailySessionCount: {},
  tagMinutes: {
    Study: 0,
    Code: 0,
    Write: 0,
    Read: 0,
    Work: 0,
  },
  sessionsHistory: [],
  xp: 0,
  unlockedBadges: [],
};

export interface StoredTimerState {
  mode: 'focus' | 'shortBreak' | 'longBreak';
  remainingSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  targetEndTime: number | null;
  currentRound: number;
  activeTag: string;
}

export function loadSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TimerSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function loadStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      longestStreakDays: parsed.longestStreakDays ?? Math.max(parsed.streakDays || 0, 0),
      dailySessionCount: parsed.dailySessionCount || {},
      tagMinutes: { ...DEFAULT_STATS.tagMinutes, ...(parsed.tagMinutes || {}) },
      dailyHistory: parsed.dailyHistory || {},
      sessionsHistory: parsed.sessionsHistory || [],
      unlockedBadges: parsed.unlockedBadges || [],
    };
  } catch (e) {
    console.error('Error loading stats', e);
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats', e);
  }
}

export function loadTimerState(defaultFocusMinutes: number = 25): StoredTimerState {
  const fallback: StoredTimerState = {
    mode: 'focus',
    remainingSeconds: defaultFocusMinutes * 60,
    totalDurationSeconds: defaultFocusMinutes * 60,
    isRunning: false,
    targetEndTime: null,
    currentRound: 1,
    activeTag: 'Study',
  };

  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(TIMER_STATE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch (e) {
    console.error('Error loading timer state', e);
    return fallback;
  }
}

export function saveTimerState(state: StoredTimerState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving timer state', e);
  }
}
