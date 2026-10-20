import React, { useState } from 'react';
import {
  Clock,
  Target,
  Trophy,
  Flame,
  Calendar,
  BarChart3,
  TrendingUp,
  Tag,
  RefreshCw,
  Sparkles,
  Database,
  ArrowLeft,
  X,
  Filter,
} from 'lucide-react';
import { SESSION_TAGS, UserStats } from '../types/pomodoro';
import {
  getWeeklyFocusSummary,
  getTodayMetrics,
  calculateTagBreakdown,
  formatMinutesHuman,
  generateDemoStats,
} from '../utils/statsCalculator';
import { playClayPopSound } from '../utils/soundEffects';

interface StatsDashboardProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onClose?: () => void;
  isFullView?: boolean;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onUpdateStats,
  onClose,
  isFullView = false,
}) => {
  const [chartMode, setChartMode] = useState<'sessions' | 'minutes'>('sessions');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

  const weeklySummary = getWeeklyFocusSummary(stats.dailySessionCount, stats.dailyHistory);
  const todayMetrics = getTodayMetrics(stats.dailySessionCount, stats.dailyHistory);
  const tagBreakdown = calculateTagBreakdown(stats.tagMinutes);

  const maxChartValue =
    chartMode === 'sessions'
      ? Math.max(4, ...weeklySummary.days.map((d) => d.sessionCount))
      : Math.max(60, ...weeklySummary.days.map((d) => d.minutes));

  const handleSeedDemo = () => {
    playClayPopSound(0.25);
    const demo = generateDemoStats();
    onUpdateStats(demo);
  };

  const handleReset = () => {
    playClayPopSound(0.2);
    if (window.confirm('Reset all statistics in local storage to zero?')) {
      const resetStats: UserStats = {
        totalFocusMinutes: 0,
        completedSessions: 0,
        streakDays: 0,
        longestStreakDays: 0,
        lastActiveDate: '',
        dailyHistory: {},
        dailySessionCount: {},
        tagMinutes: { Study: 0, Code: 0, Write: 0, Read: 0, Work: 0 },
        sessionsHistory: [],
        xp: 0,
        unlockedBadges: [],
      };
      onUpdateStats(resetStats);
    }
  };

  const filteredSessions = stats.sessionsHistory
    .slice()
    .reverse()
    .filter((s) => selectedTagFilter === 'all' || s.tag === selectedTagFilter);

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 ${isFullView ? 'py-4' : 'p-2'}`}>
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={() => {
                playClayPopSound(0.2);
                onClose();
              }}
              className="p-2.5 rounded-xl clay-button bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              aria-label="Back to Timer"
              title="Return to Timer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Focus Statistics Dashboard
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                <Database className="w-3 h-3" />
                <span>LocalStorage Synced</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive analytics, streaks, and daily/weekly session progression
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.completedSessions === 0 && (
            <button
              type="button"
              onClick={handleSeedDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl clay-button bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40"
              title="Load realistic sample sessions to test graphs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-xl clay-button bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500"
            title="Clear all statistics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          {onClose && !isFullView && (
            <button
              type="button"
              onClick={() => {
                playClayPopSound(0.2);
                onClose();
              }}
              className="p-2 rounded-xl clay-button text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label="Close dashboard dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 5 Key Metric Clay Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        {/* Metric 1: Total Focused Time */}
        <div className="col-span-2 sm:col-span-1 clay-card-subtle bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Focus</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 clay-card-inset">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatMinutesHuman(stats.totalFocusMinutes)}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {stats.totalFocusMinutes} minutes all-time
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Sessions */}
        <div className="clay-card-subtle bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 clay-card-inset">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.completedSessions}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Pomodoros finished
            </div>
          </div>
        </div>

        {/* Metric 3: Longest Consecutive Streak */}
        <div className="clay-card-subtle bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Longest Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 clay-card-inset">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.longestStreakDays}d
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5">
              Current: {stats.streakDays}d streak 🔥
            </div>
          </div>
        </div>

        {/* Metric 4: Daily Focus Sessions */}
        <div className="clay-card-subtle bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Sessions</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-500 clay-card-inset">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
              {todayMetrics.todaySessions}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {todayMetrics.todayMinutes}m focused today
            </div>
          </div>
        </div>

        {/* Metric 5: Weekly Focus Count */}
        <div className="clay-card-subtle bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">This Week</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 clay-card-inset">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {weeklySummary.totalThisWeekSessions}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              ~{weeklySummary.avgSessionsPerDay} sessions/day
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Charts & Daily Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column (7 cols): Interactive 7-Day Chart */}
        <div className="lg:col-span-7 clay-card bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-500" />
                  <span>Weekly Focus Activity</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Last 7 days performance comparison
                </p>
              </div>

              {/* Chart Mode Toggle */}
              <div className="p-1 rounded-xl clay-card-inset bg-slate-100 dark:bg-slate-900 flex items-center gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    playClayPopSound(0.15);
                    setChartMode('sessions');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartMode === 'sessions'
                      ? 'clay-button bg-rose-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Sessions Count
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClayPopSound(0.15);
                    setChartMode('minutes');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartMode === 'minutes'
                      ? 'clay-button bg-rose-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Focus Minutes
                </button>
              </div>
            </div>

            {/* Clay Bar Columns */}
            <div className="h-48 flex items-end justify-between gap-2.5 pt-8 pb-2 px-2">
              {weeklySummary.days.map((day) => {
                const value = chartMode === 'sessions' ? day.sessionCount : day.minutes;
                const heightPct = Math.min(100, Math.max(8, (value / maxChartValue) * 100));

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Hover Value Badge */}
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 mb-1.5 opacity-90 transition-opacity">
                      {chartMode === 'sessions' ? `${day.sessionCount}` : `${day.minutes}m`}
                    </span>

                    {/* Clay Inset Column Frame */}
                    <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-900/80 rounded-2xl overflow-hidden h-full flex items-end clay-card-inset p-1">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-xl transition-all duration-500 shadow-sm ${
                          day.isToday
                            ? 'bg-gradient-to-t from-rose-500 via-rose-400 to-amber-300'
                            : value > 0
                            ? 'bg-gradient-to-t from-rose-400 to-rose-300 dark:from-rose-600 dark:to-rose-400'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>

                    {/* Day of Week Label */}
                    <span
                      className={`text-xs mt-2 font-bold ${
                        day.isToday
                          ? 'text-rose-600 dark:text-rose-400 underline decoration-2 underline-offset-4'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Under Chart Highlights Banner */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Peak Day: <strong className="text-slate-700 dark:text-slate-200">{weeklySummary.bestDay.dayLabel}</strong> ({weeklySummary.bestDay.sessionCount} sessions · {weeklySummary.bestDay.minutes}m)
              </span>
            </div>
            <div>
              <span>Weekly Total: </span>
              <strong className="text-rose-600 dark:text-rose-400 font-bold">
                {weeklySummary.totalThisWeekSessions} sessions ({formatMinutesHuman(weeklySummary.totalThisWeekMinutes)})
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Daily Session Counts Breakdown */}
        <div className="lg:col-span-5 clay-card bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Daily Session Counts</span>
              </h3>
              <span className="text-xs text-slate-400">Last 7 Days</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {weeklySummary.days
                .slice()
                .reverse()
                .map((day) => (
                  <div
                    key={day.dateStr}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      day.isToday
                        ? 'clay-card-subtle bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 text-rose-950 dark:text-rose-100'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          day.sessionCount > 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span className="font-bold">
                        {day.dayLabel} {day.isToday ? '(Today)' : ''}
                      </span>
                      <span className="text-[11px] text-slate-400">{day.dateStr}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {day.sessionCount} {day.sessionCount === 1 ? 'session' : 'sessions'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold w-12 text-right">
                        {day.minutes}m
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Average: ~{weeklySummary.avgSessionsPerDay} sessions/day</span>
            <span>7-Day Volume: {weeklySummary.totalThisWeekSessions} sessions</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Category Breakdown & Filterable Sessions Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category / Tag Distribution (5 cols) */}
        <div className="lg:col-span-5 clay-card bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              <span>Category Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">{tagBreakdown.length} Tags</span>
          </div>

          <div className="space-y-3">
            {tagBreakdown.map((item) => (
              <div key={item.tag} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-200">#{item.tag}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {item.minutes}m ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full clay-card-inset bg-slate-100 dark:bg-slate-900 overflow-hidden p-0.5">
                  <div
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions History Log (7 cols) */}
        <div className="lg:col-span-7 clay-card bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span>Recent Pomodoro Sessions</span>
              </h3>
              <p className="text-xs text-slate-400">
                Log saved persistently in browser storage
              </p>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setSelectedTagFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  selectedTagFilter === 'all'
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              {SESSION_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTagFilter(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    selectedTagFilter === tag
                      ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Session Items */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                No sessions completed yet. Start a focus timer to log your first session!
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      #{session.tag}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="capitalize text-slate-500 dark:text-slate-400 font-medium">
                      {session.mode === 'focus' ? 'Focus Session' : session.mode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {session.durationMinutes} min
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
