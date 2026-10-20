import React from 'react';
import { X, Sliders, Bell, Moon, Sun, Volume2, ShieldCheck, Check } from 'lucide-react';
import { SoundType, TimerSettings } from '../types/pomodoro';
import { playClayPopSound, playCompletionSound } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onUpdateSettings: (newSettings: Partial<TimerSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleSoundTest = () => {
    playClayPopSound(0.2);
    playCompletionSound(settings.soundType, settings.volume);
  };

  const soundOptions: Array<{ id: SoundType; label: string; desc: string }> = [
    { id: 'zenBell', label: 'Zen Bell', desc: 'Solfeggio resonant chime' },
    { id: 'marimba', label: 'Clay Marimba', desc: 'Warm wooden mallet notes' },
    { id: 'digital', label: 'Digital Chime', desc: 'Ascending melodic triad' },
    { id: 'gong', label: 'Meditation Gong', desc: 'Deep soothing vibration' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto clay-card bg-white dark:bg-slate-800 p-6 sm:p-8 text-slate-800 dark:text-slate-100 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 clay-card-subtle">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-xl font-bold">
                Timer Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize cycles, sounds, and night mode
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
            aria-label="Close settings dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Timer Durations */}
        <div className="mb-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Session Intervals (Minutes)
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {/* Focus */}
            <div className="clay-card-subtle bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl flex flex-col">
              <label htmlFor="focus-input" className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Focus
              </label>
              <input
                id="focus-input"
                type="number"
                min="1"
                max="120"
                value={settings.focusMinutes}
                onChange={(e) =>
                  onUpdateSettings({ focusMinutes: Math.max(1, Math.min(120, parseInt(e.target.value) || 25)) })
                }
                className="w-full text-center font-bold text-lg bg-white dark:bg-slate-800 rounded-xl py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Short Break */}
            <div className="clay-card-subtle bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl flex flex-col">
              <label htmlFor="sbreak-input" className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Short Rest
              </label>
              <input
                id="sbreak-input"
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakMinutes}
                onChange={(e) =>
                  onUpdateSettings({ shortBreakMinutes: Math.max(1, Math.min(30, parseInt(e.target.value) || 5)) })
                }
                className="w-full text-center font-bold text-lg bg-white dark:bg-slate-800 rounded-xl py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Long Break */}
            <div className="clay-card-subtle bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl flex flex-col">
              <label htmlFor="lbreak-input" className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Long Rest
              </label>
              <input
                id="lbreak-input"
                type="number"
                min="1"
                max="60"
                value={settings.longBreakMinutes}
                onChange={(e) =>
                  onUpdateSettings({ longBreakMinutes: Math.max(1, Math.min(60, parseInt(e.target.value) || 15)) })
                }
                className="w-full text-center font-bold text-lg bg-white dark:bg-slate-800 rounded-xl py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Sound Alerts & Preview */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sound Alerts
            </h3>
            <button
              type="button"
              onClick={handleSoundTest}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl clay-button bg-slate-100 dark:bg-slate-700/60 text-xs font-bold text-rose-600 dark:text-rose-400"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Chime</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {soundOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playClayPopSound(0.2);
                  onUpdateSettings({ soundType: opt.id });
                  playCompletionSound(opt.id, settings.volume);
                }}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  settings.soundType === opt.id
                    ? 'clay-card-subtle bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {settings.soundType === opt.id && <Check className="w-3.5 h-3.5 text-rose-500" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Volume slider */}
          <div className="mt-3 clay-card-subtle bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Volume</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
              aria-label="Alert volume level"
              className="w-40 accent-rose-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-500 w-8 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>

        {/* Section 3: Dark Mode & Toggles */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Appearance & Flow
          </h3>

          {/* Dark Mode toggle item */}
          <div className="clay-card-subtle bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                  Dark Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Velvety night palette for evening focus
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.darkMode}
              onClick={() => {
                playClayPopSound(0.2);
                onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors clay-card-inset ${
                settings.darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Focus Notification Shield toggle item */}
          <div className="clay-card-subtle bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                  Focus Shield (DND)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Muffle notifications and distractions while timer is active
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.notificationShield}
              onClick={() => {
                playClayPopSound(0.2);
                onUpdateSettings({ notificationShield: !settings.notificationShield });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors clay-card-inset ${
                settings.notificationShield ? 'bg-rose-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl clay-button bg-rose-500 text-white font-bold text-xs"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
