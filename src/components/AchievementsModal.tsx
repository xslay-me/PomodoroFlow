import { Modal } from './Modal';
import React from 'react';
import { X, Trophy, Sparkles, Flame, Hourglass, Crown, Target, Moon, Sprout, Lock, CheckCircle2 } from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../utils/rewardsEngine';
import { UserStats } from '../types/pomodoro';
import { playClayPopSound } from '../utils/soundEffects';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  Flame: <Flame className="w-5 h-5 text-orange-500" />,
  Trophy: <Trophy className="w-5 h-5 text-yellow-500" />,
  Hourglass: <Hourglass className="w-5 h-5 text-indigo-500" />,
  Crown: <Crown className="w-5 h-5 text-purple-500" />,
  Target: <Target className="w-5 h-5 text-rose-500" />,
  Moon: <Moon className="w-5 h-5 text-blue-500" />,
  Sprout: <Sprout className="w-5 h-5 text-emerald-500" />,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, stats }) => {
  const unlockedSet = new Set(stats.unlockedBadges || []);
  const unlockedCount = stats.unlockedBadges?.length || 0;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="achievements-modal-title"
      className="fixed inset-0 z-50 open:flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto clay-card bg-white dark:bg-slate-800 p-6 sm:p-8 text-slate-800 dark:text-slate-100 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 clay-card-subtle">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="achievements-modal-title" className="text-xl font-bold">
                Trophies & Milestones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unlock clay trophies through steady focus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playClayPopSound(0.2);
              onClose();
            }}
            className="p-2 rounded-xl clay-button text-slate-400 hover:text-slate-700 dark:hover:text-white"
            aria-label="Close trophies dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="clay-card-subtle bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-amber-800 dark:text-amber-200 mb-2">
            <span>Overall Progress</span>
            <span>{unlockedCount} of {totalCount} Unlocked ({percentage}%)</span>
          </div>
          <div className="w-full h-3 rounded-full clay-card-inset bg-amber-100 dark:bg-slate-900 overflow-hidden p-0.5">
            <div
              style={{ width: `${percentage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-500"
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {ALL_ACHIEVEMENTS.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl transition-all flex items-start gap-3 border ${
                  isUnlocked
                    ? 'clay-card-subtle bg-white dark:bg-slate-700/60 border-amber-200/60 dark:border-amber-800/40'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'clay-card-subtle bg-amber-50 dark:bg-amber-950/40'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isUnlocked ? ICON_MAP[badge.iconName] || <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {badge.title}
                    </h3>
                    {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl clay-button bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
