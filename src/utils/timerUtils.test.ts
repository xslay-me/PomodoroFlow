import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  calculateSleepResilientRemaining,
  calculateProgressPercentage,
  getNextPhase,
  getClayThemeForMode,
} from './timerUtils.ts';

test('formatTime correctly formats seconds into MM:SS', () => {
  assert.equal(formatTime(1500), '25:00');
  assert.equal(formatTime(300), '05:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(9), '00:09');
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-10), '00:00');
});

test('calculateSleepResilientRemaining respects wall-clock delta when running', () => {
  const now = 1700000000000;
  // Timer is set to end in 100 seconds
  const targetEndTime = now + 100000;

  // Running: exact 100 seconds
  const remaining1 = calculateSleepResilientRemaining(targetEndTime, true, 100, now);
  assert.equal(remaining1, 100);

  // Simulated sleep wake: 40 seconds passed during sleep
  const wakingNow = now + 40000;
  const remaining2 = calculateSleepResilientRemaining(targetEndTime, true, 100, wakingNow);
  assert.equal(remaining2, 60);

  // Simulated sleep wake past the target end time
  const wakingLate = now + 120000;
  const remaining3 = calculateSleepResilientRemaining(targetEndTime, true, 100, wakingLate);
  assert.equal(remaining3, 0);

  // When paused (not running), stored remaining is preserved
  const pausedRemaining = calculateSleepResilientRemaining(null, false, 75, now + 10000);
  assert.equal(pausedRemaining, 75);
});

test('calculateProgressPercentage returns proper bounds', () => {
  assert.equal(calculateProgressPercentage(1500, 1500), 0);
  assert.equal(calculateProgressPercentage(750, 1500), 50);
  assert.equal(calculateProgressPercentage(0, 1500), 100);
  assert.equal(calculateProgressPercentage(0, 0), 100);
});

test('getNextPhase cycles between focus and break phases correctly', () => {
  // Focus round 1 -> Short break, next round 2
  const step1 = getNextPhase('focus', 1, 4);
  assert.equal(step1.nextMode, 'shortBreak');
  assert.equal(step1.nextRound, 2);
  assert.equal(step1.completedFocusSession, true);

  // Short break -> Focus
  const step2 = getNextPhase('shortBreak', 2, 4);
  assert.equal(step2.nextMode, 'focus');
  assert.equal(step2.nextRound, 2);
  assert.equal(step2.completedFocusSession, false);

  // Focus round 4 -> Long break, resets next round to 1
  const step3 = getNextPhase('focus', 4, 4);
  assert.equal(step3.nextMode, 'longBreak');
  assert.equal(step3.nextRound, 1);
  assert.equal(step3.completedFocusSession, true);

  // Long break -> Focus
  const step4 = getNextPhase('longBreak', 1, 4);
  assert.equal(step4.nextMode, 'focus');
  assert.equal(step4.nextRound, 1);
  assert.equal(step4.completedFocusSession, false);
});

test('getClayThemeForMode returns distinct theme values for light and dark modes', () => {
  const lightFocus = getClayThemeForMode('focus', false);
  const darkFocus = getClayThemeForMode('focus', true);
  assert.ok(lightFocus.bgGradient.includes('rose-50'));
  assert.ok(darkFocus.bgGradient.includes('slate-900'));
});
