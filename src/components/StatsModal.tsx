import { Modal } from './Modal';
import React from 'react';
import { UserStats } from '../types/pomodoro';
import { StatsDashboard } from './StatsDashboard';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="stats-modal-title"
      className="fixed inset-0 z-50 open:flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto clay-card bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 relative shadow-2xl p-4 sm:p-6">
        <h2 id="stats-modal-title" className="sr-only">Focus statistics</h2>
        <StatsDashboard
          stats={stats}
          onUpdateStats={onUpdateStats}
          onClose={onClose}
          isFullView={false}
        />
      </div>
    </Modal>
  );
};
