import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from './storage.ts';
import { completeTimer, createTimer, nextTimer, recordSession } from './sessionState.ts';
import { getActiveStreak, getLocalDateString } from './statsCalculator.ts';
import { PersistedAppState } from './appState.ts';

const deadline = new Date(2026, 9, 20, 21, 0).getTime();
function running(mode: 'focus' | 'shortBreak' | 'longBreak' = 'focus'): PersistedAppState {
  const timer = createTimer(mode, 1, 'Read', DEFAULT_SETTINGS);
  return { revision: 1, stats: structuredClone(DEFAULT_STATS),
    timer: { ...timer, isRunning: true, targetEndTime: deadline } };
}

test('expired restored session is credited with its saved duration, tag and deadline', () => {
  const saved = running();
  saved.timer.totalDurationSeconds = 1800;
  const restored = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline + 86400000);
  assert.equal(restored.stats.completedSessions, 1);
  assert.equal(restored.stats.totalFocusMinutes, 30);
  assert.equal(restored.stats.tagMinutes.Read, 30);
  assert.equal(restored.stats.sessionsHistory[0].timestamp, deadline);
  assert.equal(restored.stats.dailySessionCount[getLocalDateString(deadline)], 1);
  assert.equal(restored.stats.dailySessionCount[getLocalDateString(deadline + 86400000)], undefined);
  assert.equal(restored.timer.mode, 'shortBreak');
  assert.equal(restored.timer.isRunning, false);
  assert.notEqual(restored.timer.sessionId, saved.timer.sessionId);
});

test('repeated callbacks and another tab cannot credit the same timer twice', () => {
  const saved = running();
  const first = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline);
  const repeat = completeTimer(first, saved.timer.sessionId, DEFAULT_SETTINGS, deadline);
  assert.equal(repeat, first);
  assert.equal(first.stats.completedSessions, 1);
  assert.equal(recordSession(first.stats, first.stats.sessionsHistory[0]), first.stats);
});

test('callbacks cannot complete paused, replaced or not-yet-expired timers', () => {
  const saved = running();
  assert.equal(completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline - 1), saved);
  assert.equal(completeTimer(saved, 'other-session', DEFAULT_SETTINGS, deadline), saved);
  saved.timer.isRunning = false;
  assert.equal(completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline), saved);
});

test('a later distinct session preserves all previously committed statistics', () => {
  const initial = running();
  const first = completeTimer(initial, initial.timer.sessionId, DEFAULT_SETTINGS, deadline);
  const second = { ...first, timer: { ...createTimer('focus', 2, 'Code', DEFAULT_SETTINGS), isRunning: true, targetEndTime: deadline + 3600000 } };
  const result = completeTimer(second, second.timer.sessionId, DEFAULT_SETTINGS, deadline + 3600000);
  assert.equal(result.stats.completedSessions, 2);
  assert.equal(result.stats.totalFocusMinutes, 50);
  assert.equal(result.stats.tagMinutes.Read, 25);
  assert.equal(result.stats.tagMinutes.Code, 25);
  assert.equal(result.stats.sessionsHistory.length, 2);
});

test('expired streak is hidden and contributes no XP bonus on returning', () => {
  const saved = running();
  saved.stats = { ...saved.stats, streakDays: 10, longestStreakDays: 10, lastActiveDate: '2026-10-16' };
  assert.equal(getActiveStreak(saved.stats, deadline), 0);
  const result = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline);
  assert.equal(result.stats.xp, 25);
  assert.equal(result.stats.streakDays, 1);
  assert.equal(result.stats.longestStreakDays, 10);
});

test('valid prior streak earns a bonus and advances on a consecutive day', () => {
  const saved = running();
  saved.stats = { ...saved.stats, streakDays: 3, longestStreakDays: 3, lastActiveDate: '2026-10-19' };
  const result = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline);
  assert.equal(result.stats.xp, 34);
  assert.equal(result.stats.streakDays, 4);
});

test('night owl uses completion hour even when waking during daytime', () => {
  const saved = running();
  const result = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline + 12 * 3600000);
  assert.ok(result.stats.unlockedBadges.includes('night_owl'));
});

test('a nighttime break cannot earn night owl for an older daytime focus', () => {
  const saved = running('shortBreak');
  saved.stats.completedSessions = 1;
  const result = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline);
  assert.equal(result.stats.unlockedBadges.includes('night_owl'), false);
  assert.equal(result.stats.completedSessions, 1);
});

test('auto-start options apply independently to breaks and focus phases', () => {
  for (const mode of ['focus', 'shortBreak', 'longBreak'] as const) {
    for (const autoStartBreaks of [false, true]) {
      for (const autoStartPomodoros of [false, true]) {
        const saved = running(mode);
        const settings = { ...DEFAULT_SETTINGS, autoStartBreaks, autoStartPomodoros };
        const wake = deadline + 86400000;
        const result = completeTimer(saved, saved.timer.sessionId, settings, wake);
        const expected = mode === 'focus' ? autoStartBreaks : autoStartPomodoros;
        assert.equal(result.timer.isRunning, expected);
        assert.equal(result.timer.targetEndTime, expected ? wake + result.timer.remainingSeconds * 1000 : null);
        assert.equal(result.stats.sessionsHistory.length, 1);
      }
    }
  }
});

test('fourth focus session gets a long break; skipped phases do not award stats', () => {
  const saved = running();
  saved.timer.currentRound = 4;
  assert.equal(nextTimer(saved.timer, DEFAULT_SETTINGS).mode, 'longBreak');
  assert.equal(saved.stats.completedSessions, 0);
  const result = completeTimer(saved, saved.timer.sessionId, DEFAULT_SETTINGS, deadline);
  assert.equal(result.timer.mode, 'longBreak');
  assert.equal(result.timer.currentRound, 1);
  assert.equal(result.stats.completedSessions, 1);
});
