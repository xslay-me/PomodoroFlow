import React from 'react';
import { Shield, BellOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusShieldBannerProps {
  isRunning: boolean;
  mode: string;
}

export const FocusShieldBanner: React.FC<FocusShieldBannerProps> = ({ isRunning, mode }) => {
  return (
    <AnimatePresence>
      {isRunning && mode === 'focus' && (
        <motion.aside
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          aria-label="Focus mode notification status"
          className="w-full max-w-xl mx-auto px-4 mb-4"
        >
          <div className="clay-card-subtle bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-rose-950/40 border border-rose-200/40 dark:border-rose-900/40 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-200 font-medium">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <BellOff className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="font-bold text-rose-700 dark:text-rose-300">Focus Shield Active:</strong> All notifications silenced for deep work
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px] shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DND Muffled</span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
