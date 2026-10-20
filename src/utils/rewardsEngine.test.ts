import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSessionXP,
  getPlantStage,
  checkNewAchievements,
  PLANT_STAGES,
} from './rewardsEngine.ts';
import { UserStats } from '../types/pomodoro.ts';

test('calculateSessionXP provides base focus XP and streak multiplier', () => {
  const xpNoStreak = calculateSessionXP('focus', 0);
  assert.equal(xpNoStreak, 25);

  const xpWithStreak = calculateSessionXP('focus', 3);
  assert.equal(xpWithStreak, 25 + 9);

  const xpBreak = calculateSessionXP('shortBreak', 5);
  assert.equal(xpBreak, 5);
});

test('getPlantStage correctly identifies stages and progression percentages', () => {
  const stage1 = getPlantStage(25);
  assert.equal(stage1.stageNumber, 1);
  assert.equal(stage1.stageInfo.name, 'Pebble Seedling');
  assert.equal(stage1.progressPercent, 50); // 25 / 50

  const stage2 = getPlantStage(50);
  assert.equal(stage2.stageNumber, 2);
  assert.equal(stage2.stageInfo.name, 'Clay Sprout');

  const maxStage = getPlantStage(1200);
  assert.equal(maxStage.stageNumber, 5);
  assert.equal(maxStage.isMaxStage, true);
  assert.equal(maxStage.progressPercent, 100);
});

test('checkNewAchievements detects newly qualified badges', () => {
  const baseStats: UserStats = {
    totalFocusMinutes: 105,
    completedSessions: 1,
    streakDays: 3,
    longestStreakDays: 3,
    lastActiveDate: '2026-10-20',
    dailyHistory: {},
    dailySessionCount: {},
    tagMinutes: {},
    sessionsHistory: [],
    xp: 50,
    unlockedBadges: [],
  };

  const unlocked = checkNewAchievements(baseStats, 14); // 2 PM
  assert.ok(unlocked.includes('first_step'));
  assert.ok(unlocked.includes('streak_3'));
  assert.ok(unlocked.includes('focus_100'));
  assert.equal(unlocked.includes('night_owl'), false);

  // Night owl check at 21:00 (9 PM)
  const nightUnlocked = checkNewAchievements(baseStats, 21, 'focus');
  assert.ok(nightUnlocked.includes('night_owl'));

  // Should not re-unlock already possessed badges
  const withExisting = checkNewAchievements({
    ...baseStats,
    unlockedBadges: ['first_step', 'streak_3'],
  }, 14);
  assert.equal(withExisting.includes('first_step'), false);
  assert.equal(withExisting.includes('streak_3'), false);
  assert.ok(withExisting.includes('focus_100'));
});


test('night owl requires the newly completed session to be a focus session', () => {
  const stats = baseForNightOwl();
  assert.equal(checkNewAchievements(stats, 21, 'shortBreak').includes('night_owl'), false);
  assert.equal(checkNewAchievements(stats, 21, 'longBreak').includes('night_owl'), false);
  assert.equal(checkNewAchievements(stats, 21).includes('night_owl'), false);
  assert.equal(checkNewAchievements(stats, 14, 'focus').includes('night_owl'), false);
  assert.equal(checkNewAchievements(stats, 21, 'focus').includes('night_owl'), true);
});

function baseForNightOwl(): UserStats {
  return { totalFocusMinutes: 25, completedSessions: 1, streakDays: 1, longestStreakDays: 1,
    lastActiveDate: '2026-10-20', dailyHistory: {}, dailySessionCount: {}, tagMinutes: {},
    sessionsHistory: [], xp: 25, unlockedBadges: [] };
}
