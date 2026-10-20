import { SessionRecord, UserStats } from '../types/pomodoro';

/**
 * Returns date in YYYY-MM-DD format based on local time
 */
export function getLocalDateString(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns difference in days between two YYYY-MM-DD date strings
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/** Returns the streak that is still active today (or at a completion timestamp). */
export function getActiveStreak(stats: UserStats, timestamp = Date.now()): number {
  const today = getLocalDateString(timestamp);
  if (!stats.lastActiveDate || stats.lastActiveDate > today) return 0;
  return getDaysDifference(stats.lastActiveDate, today) <= 1 ? stats.streakDays : 0;
}

/**
 * Calculates updated streak count given previous streak, last active date, and current date
 */
export function updateStreak(
  currentStreak: number,
  lastActiveDate: string,
  todayStr: string = getLocalDateString()
): number {
  if (!lastActiveDate) {
    return 1;
  }
  if (lastActiveDate === todayStr) {
    return Math.max(1, currentStreak);
  }

  const diffDays = getDaysDifference(lastActiveDate, todayStr);
  if (diffDays === 1) {
    // Consecutive day
    return currentStreak + 1;
  } else if (diffDays === 0) {
    return Math.max(1, currentStreak);
  } else {
    // Streak broken
    return 1;
  }
}

/**
 * Updates both current streak and records all-time longest streak
 */
export function updateStreakAndLongest(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string,
  todayStr: string = getLocalDateString()
): { currentStreak: number; longestStreak: number } {
  const nextStreak = updateStreak(currentStreak, lastActiveDate, todayStr);
  const nextLongest = Math.max(longestStreak || 0, nextStreak);
  return {
    currentStreak: nextStreak,
    longestStreak: nextLongest,
  };
}

export interface DaySessionMetric {
  dateStr: string;
  dayLabel: string;
  sessionCount: number;
  minutes: number;
  isToday: boolean;
}

export interface WeeklyFocusSummary {
  days: DaySessionMetric[];
  totalThisWeekSessions: number;
  totalThisWeekMinutes: number;
  avgSessionsPerDay: number;
  avgMinutesPerDay: number;
  bestDay: {
    dayLabel: string;
    sessionCount: number;
    minutes: number;
  };
}

/**
 * Generates last 7 days chart data with weekday labels, session counts, and minutes
 */
export function getLast7DaysData(
  dailyHistory: Record<string, number>,
  dailySessionCount: Record<string, number> = {}
): DaySessionMetric[] {
  const result: DaySessionMetric[] = [];
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d.getTime());
    const dayLabel = days[d.getDay()];
    const minutes = dailyHistory[dateStr] || 0;
    const sessionCount = dailySessionCount[dateStr] || (minutes > 0 ? Math.max(1, Math.round(minutes / 25)) : 0);
    result.push({
      dateStr,
      dayLabel,
      sessionCount,
      minutes,
      isToday: i === 0,
    });
  }

  return result;
}

/**
 * Calculates comprehensive weekly focus metrics
 */
export function getWeeklyFocusSummary(
  dailySessionCount: Record<string, number> = {},
  dailyHistory: Record<string, number> = {}
): WeeklyFocusSummary {
  const days = getLast7DaysData(dailyHistory, dailySessionCount);
  const totalThisWeekSessions = days.reduce((sum, d) => sum + d.sessionCount, 0);
  const totalThisWeekMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
  const avgSessionsPerDay = Number((totalThisWeekSessions / 7).toFixed(1));
  const avgMinutesPerDay = Math.round(totalThisWeekMinutes / 7);

  let bestDay = days[0];
  for (const d of days) {
    if (d.sessionCount > bestDay.sessionCount || (d.sessionCount === bestDay.sessionCount && d.minutes > bestDay.minutes)) {
      bestDay = d;
    }
  }

  return {
    days,
    totalThisWeekSessions,
    totalThisWeekMinutes,
    avgSessionsPerDay,
    avgMinutesPerDay,
    bestDay: {
      dayLabel: bestDay.dayLabel,
      sessionCount: bestDay.sessionCount,
      minutes: bestDay.minutes,
    },
  };
}

/**
 * Extracts today's focused minutes and completed session count
 */
export function getTodayMetrics(
  dailySessionCount: Record<string, number> = {},
  dailyHistory: Record<string, number> = {},
  todayStr: string = getLocalDateString()
): { todayMinutes: number; todaySessions: number } {
  return {
    todayMinutes: dailyHistory[todayStr] || 0,
    todaySessions: dailySessionCount[todayStr] || 0,
  };
}

/**
 * Calculates tag percentages and minutes for dashboard visual
 */
export function calculateTagBreakdown(tagMinutes: Record<string, number>): Array<{
  tag: string;
  minutes: number;
  percentage: number;
  color: string;
}> {
  const palette = ['#fb7185', '#38bdf8', '#34d399', '#a78bfa', '#f59e0b', '#ec4899'];
  const entries = Object.entries(tagMinutes).filter(([_, mins]) => mins > 0);
  const total = entries.reduce((acc, [_, mins]) => acc + mins, 0);

  if (total === 0) {
    return [
      {
        tag: 'Study',
        minutes: 0,
        percentage: 100,
        color: '#fb7185',
      },
    ];
  }

  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([tag, mins], idx) => ({
      tag,
      minutes: mins,
      percentage: Math.round((mins / total) * 100),
      color: palette[idx % palette.length],
    }));
}

/**
 * Formats minutes into hours and minutes string (e.g. "2h 45m" or "35m")
 */
export function formatMinutesHuman(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Generates rich demo statistics for immediate testing and previewing
 */
export function generateDemoStats(): UserStats {
  const today = new Date();
  const dailyHistory: Record<string, number> = {};
  const dailySessionCount: Record<string, number> = {};
  const sessionsHistory: SessionRecord[] = [];
  const tags = ['Study', 'Code', 'Write', 'Read', 'Work'];
  const sampleDayMinutes = [75, 125, 100, 150, 50, 125, 100]; // last 7 days

  let totalMinutes = 0;
  let totalSessions = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d.getTime());
    const mins = sampleDayMinutes[6 - i];
    const sessionCount = Math.round(mins / 25);

    dailyHistory[dateStr] = mins;
    dailySessionCount[dateStr] = sessionCount;
    totalMinutes += mins;
    totalSessions += sessionCount;

    for (let s = 0; s < sessionCount; s++) {
      sessionsHistory.push({
        id: `demo-${dateStr}-${s}`,
        mode: 'focus',
        durationMinutes: 25,
        timestamp: d.getTime() + s * 30 * 60 * 1000,
        tag: tags[(i + s) % tags.length],
      });
    }
  }

  return {
    totalFocusMinutes: totalMinutes,
    completedSessions: totalSessions,
    streakDays: 7,
    longestStreakDays: 14,
    lastActiveDate: getLocalDateString(),
    dailyHistory,
    dailySessionCount,
    tagMinutes: {
      Study: 275,
      Code: 225,
      Write: 100,
      Read: 75,
      Work: 50,
    },
    sessionsHistory,
    xp: 380,
    unlockedBadges: ['first_step', 'streak_3', 'streak_7', 'focus_100', 'focus_300', 'sessions_10', 'plant_stage_3'],
  };
}
