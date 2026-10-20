import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalDateString,
  getDaysDifference,
  updateStreak,
  updateStreakAndLongest,
  getLast7DaysData,
  getWeeklyFocusSummary,
  getTodayMetrics,
  calculateTagBreakdown,
  formatMinutesHuman,
} from './statsCalculator.ts';

test('getLocalDateString formats dates properly', () => {
  const d = new Date(2026, 9, 20); // October 20, 2026
  assert.equal(getLocalDateString(d.getTime()), '2026-10-20');
});

test('getDaysDifference computes difference between ISO date strings', () => {
  assert.equal(getDaysDifference('2026-10-19', '2026-10-20'), 1);
  assert.equal(getDaysDifference('2026-10-15', '2026-10-20'), 5);
  assert.equal(getDaysDifference('2026-10-20', '2026-10-20'), 0);
});

test('updateStreak handles consecutive days and broken streaks', () => {
  // First time ever
  assert.equal(updateStreak(0, '', '2026-10-20'), 1);

  // Consecutive day (yesterday -> today)
  assert.equal(updateStreak(3, '2026-10-19', '2026-10-20'), 4);

  // Same day repeated session
  assert.equal(updateStreak(4, '2026-10-20', '2026-10-20'), 4);

  // Missed days (broken streak)
  assert.equal(updateStreak(10, '2026-10-17', '2026-10-20'), 1);
});

test('updateStreakAndLongest preserves or updates historical record streak', () => {
  // Current streak updates from 3 to 4, longest was 10 -> longest stays 10
  const res1 = updateStreakAndLongest(3, 10, '2026-10-19', '2026-10-20');
  assert.equal(res1.currentStreak, 4);
  assert.equal(res1.longestStreak, 10);

  // Current streak updates from 10 to 11, longest was 10 -> longest becomes 11
  const res2 = updateStreakAndLongest(10, 10, '2026-10-19', '2026-10-20');
  assert.equal(res2.currentStreak, 11);
  assert.equal(res2.longestStreak, 11);

  // Streak resets to 1, longest remains 15
  const res3 = updateStreakAndLongest(15, 15, '2026-10-15', '2026-10-20');
  assert.equal(res3.currentStreak, 1);
  assert.equal(res3.longestStreak, 15);
});

test('getLast7DaysData returns exactly 7 days of items ending on today', () => {
  const history = {
    [getLocalDateString()]: 50,
  };
  const sessionCount = {
    [getLocalDateString()]: 2,
  };
  const data = getLast7DaysData(history, sessionCount);
  assert.equal(data.length, 7);
  assert.equal(data[6].isToday, true);
  assert.equal(data[6].minutes, 50);
  assert.equal(data[6].sessionCount, 2);
});

test('getWeeklyFocusSummary computes aggregate metrics and daily averages', () => {
  const todayStr = getLocalDateString();
  const summary = getWeeklyFocusSummary(
    { [todayStr]: 4 },
    { [todayStr]: 100 }
  );
  assert.equal(summary.days.length, 7);
  assert.equal(summary.totalThisWeekSessions, 4);
  assert.equal(summary.totalThisWeekMinutes, 100);
  assert.equal(summary.avgSessionsPerDay, 0.6); // 4 / 7
  assert.equal(summary.bestDay.sessionCount, 4);
});

test('getTodayMetrics extracts current day stats', () => {
  const todayStr = getLocalDateString();
  const metrics = getTodayMetrics({ [todayStr]: 3 }, { [todayStr]: 75 }, todayStr);
  assert.equal(metrics.todaySessions, 3);
  assert.equal(metrics.todayMinutes, 75);
});

test('calculateTagBreakdown aggregates percentages accurately', () => {
  const tagMins = {
    Study: 60,
    Code: 40,
  };
  const breakdown = calculateTagBreakdown(tagMins);
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].tag, 'Study');
  assert.equal(breakdown[0].percentage, 60);
  assert.equal(breakdown[1].tag, 'Code');
  assert.equal(breakdown[1].percentage, 40);
});

test('formatMinutesHuman formats short and long durations properly', () => {
  assert.equal(formatMinutesHuman(25), '25m');
  assert.equal(formatMinutesHuman(60), '1h');
  assert.equal(formatMinutesHuman(125), '2h 5m');
});
