import { AchievementBadge, PlantStageInfo, PomodoroMode, UserStats } from '../types/pomodoro';

export const PLANT_STAGES: PlantStageInfo[] = [
  {
    stage: 1,
    name: 'Pebble Seedling',
    title: 'A tiny clay seed waiting to bloom',
    minXp: 0,
    maxXp: 50,
    description: 'Freshly planted in soft pastel soil. Keep focusing to watch it sprout!',
    color: '#86efac',
  },
  {
    stage: 2,
    name: 'Clay Sprout',
    title: 'Two vibrant pastel leaves stretching up',
    minXp: 50,
    maxXp: 120,
    description: 'Your dedication gives this little sprout energy to grow steadily.',
    color: '#34d399',
  },
  {
    stage: 3,
    name: 'Chubby Succulent',
    title: 'A rounded, pillowy clay succulent',
    minXp: 120,
    maxXp: 240,
    description: 'Hardy and serene, storing pure focus power inside soft petals.',
    color: '#06b6d4',
  },
  {
    stage: 4,
    name: 'Pastel Lotus',
    title: 'An exquisite blooming clay blossom',
    minXp: 240,
    maxXp: 400,
    description: 'Radiating tranquil energy and deep flow state mastery.',
    color: '#f472b6',
  },
  {
    stage: 5,
    name: 'Zen Bonsai Master',
    title: 'The ultimate venerable clay bonsai tree',
    minXp: 400,
    maxXp: 1000,
    description: 'A monument to your perseverance, wisdom, and daily mastery.',
    color: '#fbbf24',
  },
];

export const ALL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first focused Pomodoro session.',
    iconName: 'Sparkles',
    category: 'milestone',
    requiredValue: 1,
  },
  {
    id: 'streak_3',
    title: 'Steady Momentum',
    description: 'Maintain a 3-day focus streak.',
    iconName: 'Flame',
    category: 'streak',
    requiredValue: 3,
  },
  {
    id: 'streak_7',
    title: 'Zen Discipline',
    description: 'Reach an impressive 7-day focus streak.',
    iconName: 'Trophy',
    category: 'streak',
    requiredValue: 7,
  },
  {
    id: 'focus_100',
    title: 'Century Scholar',
    description: 'Accumulate 100 total minutes of deep focus.',
    iconName: 'Hourglass',
    category: 'time',
    requiredValue: 100,
  },
  {
    id: 'focus_300',
    title: 'Deep Work Sage',
    description: 'Log over 300 minutes of undistracted focus.',
    iconName: 'Crown',
    category: 'time',
    requiredValue: 300,
  },
  {
    id: 'sessions_10',
    title: 'Focus Veteran',
    description: 'Complete 10 successful focus sessions.',
    iconName: 'Target',
    category: 'milestone',
    requiredValue: 10,
  },
  {
    id: 'night_owl',
    title: 'Starlit Focus',
    description: 'Finish a session during evening hours (after 8 PM).',
    iconName: 'Moon',
    category: 'special',
    requiredValue: 1,
  },
  {
    id: 'plant_stage_3',
    title: 'Green Thumb',
    description: 'Nurture your clay companion to Stage 3 or above.',
    iconName: 'Sprout',
    category: 'special',
    requiredValue: 120,
  },
];

/**
 * Calculates XP earned from a session
 */
export function calculateSessionXP(mode: 'focus' | 'shortBreak' | 'longBreak', streakDays: number): number {
  if (mode === 'focus') {
    const base = 25;
    const streakBonus = Math.min(25, streakDays * 3);
    return base + streakBonus;
  }
  return 5; // Reward taking restful breaks too
}

/**
 * Gets plant stage information based on XP
 */
export function getPlantStage(xp: number): {
  stageInfo: PlantStageInfo;
  stageNumber: number;
  progressPercent: number;
  xpInCurrentStage: number;
  xpNeededForNext: number;
  isMaxStage: boolean;
} {
  const currentStage = PLANT_STAGES.slice().reverse().find((s) => xp >= s.minXp) || PLANT_STAGES[0];
  const isMaxStage = currentStage.stage === PLANT_STAGES[PLANT_STAGES.length - 1].stage;
  
  const span = currentStage.maxXp - currentStage.minXp;
  const xpInCurrentStage = Math.max(0, xp - currentStage.minXp);
  const progressPercent = isMaxStage ? 100 : Math.min(100, (xpInCurrentStage / span) * 100);
  const xpNeededForNext = isMaxStage ? 0 : Math.max(0, currentStage.maxXp - xp);

  return {
    stageInfo: currentStage,
    stageNumber: currentStage.stage,
    progressPercent: Number(progressPercent.toFixed(1)),
    xpInCurrentStage,
    xpNeededForNext,
    isMaxStage,
  };
}

/**
 * Checks for newly unlocked achievements given updated stats
 */
export function checkNewAchievements(stats: UserStats, currentHour: number = new Date().getHours(), completedMode?: PomodoroMode): string[] {
  const newlyUnlocked: string[] = [];
  const existingSet = new Set(stats.unlockedBadges || []);

  if (!existingSet.has('first_step') && stats.completedSessions >= 1) {
    newlyUnlocked.push('first_step');
  }

  if (!existingSet.has('streak_3') && stats.streakDays >= 3) {
    newlyUnlocked.push('streak_3');
  }

  if (!existingSet.has('streak_7') && stats.streakDays >= 7) {
    newlyUnlocked.push('streak_7');
  }

  if (!existingSet.has('focus_100') && stats.totalFocusMinutes >= 100) {
    newlyUnlocked.push('focus_100');
  }

  if (!existingSet.has('focus_300') && stats.totalFocusMinutes >= 300) {
    newlyUnlocked.push('focus_300');
  }

  if (!existingSet.has('sessions_10') && stats.completedSessions >= 10) {
    newlyUnlocked.push('sessions_10');
  }

  if (!existingSet.has('night_owl') && completedMode === 'focus' && (currentHour >= 20 || currentHour < 4) && stats.completedSessions >= 1) {
    newlyUnlocked.push('night_owl');
  }

  if (!existingSet.has('plant_stage_3') && stats.xp >= 120) {
    newlyUnlocked.push('plant_stage_3');
  }

  return newlyUnlocked;
}

/**
 * Returns contextual motivational phrases for the plant companion
 */
export function getCompanionDialogue(isRunning: boolean, mode: string, xp: number): string {
  if (isRunning) {
    if (mode === 'focus') {
      const focusQuotes = [
        "Inhale clarity, exhale distraction. I'm growing right alongside you!",
        "Every focused minute waters my clay roots!",
        "Quiet the world, elevate your craft. You've got this!",
        "Pure focus in progress. Feel the flow state blooming!",
      ];
      return focusQuotes[Math.floor((xp / 10) % focusQuotes.length)];
    } else {
      return "Rest your mind, hydrate, and stretch. Good rest fuels great focus!";
    }
  }

  const idleQuotes = [
    "Ready for our next burst of flow? Click start when you're set!",
    "Together we build consistency, one clay petal at a time.",
    "A 25-minute session is all it takes to plant deep wisdom.",
    "Tap me anytime for a little extra clay encouragement!",
  ];
  return idleQuotes[Math.floor((xp / 15) % idleQuotes.length)];
}
