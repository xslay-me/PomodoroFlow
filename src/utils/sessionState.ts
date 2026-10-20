import { PomodoroMode, SessionRecord, TimerSettings, UserStats } from '../types/pomodoro';
import { PersistedAppState } from './appState';
import { StoredTimerState } from './storage';
import { createSessionId, getNextPhase } from './timerUtils';
import { getActiveStreak, getLocalDateString, updateStreakAndLongest } from './statsCalculator';
import { calculateSessionXP, checkNewAchievements } from './rewardsEngine';

export function createTimer(
  mode: PomodoroMode,
  currentRound: number,
  activeTag: string,
  settings: TimerSettings,
): StoredTimerState {
  const minutes = mode === 'focus' ? settings.focusMinutes
    : mode === 'shortBreak' ? settings.shortBreakMinutes : settings.longBreakMinutes;
  return {
    sessionId: createSessionId(), mode, currentRound, activeTag,
    remainingSeconds: minutes * 60, totalDurationSeconds: minutes * 60,
    isRunning: false, targetEndTime: null,
  };
}

export function nextTimer(timer: StoredTimerState, settings: TimerSettings): StoredTimerState {
  const next = getNextPhase(timer.mode, timer.currentRound, settings.longBreakInterval);
  return createTimer(next.nextMode, next.nextRound, timer.activeTag, settings);
}

export function recordSession(stats: UserStats, record: SessionRecord): UserStats {
  if (stats.sessionsHistory.some((session) => session.id === record.id)) return stats;
  const isFocus = record.mode === 'focus';
  const date = getLocalDateString(record.timestamp);
  const streak = isFocus
    ? updateStreakAndLongest(stats.streakDays, stats.longestStreakDays, stats.lastActiveDate, date)
    : { currentStreak: stats.streakDays, longestStreak: stats.longestStreakDays };
  const minutes = isFocus ? record.durationMinutes : 0;
  const next: UserStats = {
    ...stats,
    totalFocusMinutes: stats.totalFocusMinutes + minutes,
    completedSessions: stats.completedSessions + Number(isFocus),
    streakDays: streak.currentStreak,
    longestStreakDays: streak.longestStreak,
    lastActiveDate: isFocus ? date : stats.lastActiveDate,
    dailyHistory: isFocus ? { ...stats.dailyHistory, [date]: (stats.dailyHistory[date] || 0) + minutes } : stats.dailyHistory,
    dailySessionCount: isFocus ? { ...stats.dailySessionCount, [date]: (stats.dailySessionCount[date] || 0) + 1 } : stats.dailySessionCount,
    tagMinutes: isFocus ? { ...stats.tagMinutes, [record.tag]: (stats.tagMinutes[record.tag] || 0) + minutes } : stats.tagMinutes,
    sessionsHistory: [...stats.sessionsHistory, record],
    // The bonus uses the valid streak before this session; the first session earns base XP.
    xp: stats.xp + calculateSessionXP(record.mode, getActiveStreak(stats, record.timestamp)),
  };
  next.unlockedBadges = [...new Set([
    ...stats.unlockedBadges,
    ...checkNewAchievements(next, new Date(record.timestamp).getHours(), record.mode),
  ])];
  return next;
}

export function completeTimer(
  current: PersistedAppState,
  expectedSessionId: string,
  settings: TimerSettings,
  now = Date.now(),
): PersistedAppState {
  const timer = current.timer;
  if (timer.sessionId !== expectedSessionId || !timer.isRunning
    || timer.targetEndTime === null || now < timer.targetEndTime) return current;
  const record: SessionRecord = {
    id: timer.sessionId, mode: timer.mode,
    durationMinutes: Math.round(timer.totalDurationSeconds / 60),
    timestamp: timer.targetEndTime, tag: timer.activeTag,
  };
  const next = nextTimer(timer, settings);
  const autoStart = next.mode === 'focus' ? settings.autoStartPomodoros : settings.autoStartBreaks;
  if (autoStart) {
    next.isRunning = true;
    // Start one fresh phase on recovery; never invent focus sessions during an absence.
    next.targetEndTime = now + next.remainingSeconds * 1000;
  }
  return { ...current, stats: recordSession(current.stats, record), timer: next };
}
