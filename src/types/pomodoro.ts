/**
 * Core type definitions for PomodoroFlow
 */

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export type SoundType = 'zenBell' | 'marimba' | 'digital' | 'gong';

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundType: SoundType;
  volume: number; // 0 to 1
  soundEnabled: boolean;
  darkMode: boolean;
  notificationShield: boolean;
}

export interface SessionRecord {
  id: string;
  mode: PomodoroMode;
  durationMinutes: number;
  timestamp: number;
  tag: string;
}

export interface UserStats {
  totalFocusMinutes: number;
  completedSessions: number;
  streakDays: number;
  longestStreakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyHistory: Record<string, number>; // date string -> focus minutes
  dailySessionCount: Record<string, number>; // date string -> completed sessions count
  tagMinutes: Record<string, number>; // tag name -> focus minutes
  sessionsHistory: SessionRecord[];
  xp: number;
  unlockedBadges: string[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'milestone' | 'streak' | 'time' | 'special';
  requiredValue: number;
}

export interface PlantStageInfo {
  stage: number;
  name: string;
  title: string;
  minXp: number;
  maxXp: number;
  description: string;
  color: string;
}

export const SESSION_TAGS = ['Study', 'Code', 'Write', 'Read', 'Work'] as const;
