import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getCompanionDialogue, getPlantStage } from '../utils/rewardsEngine';
import { playClayPopSound } from '../utils/soundEffects';
import { Sparkles, Heart } from 'lucide-react';

interface PlantCompanionProps {
  xp: number;
  isRunning: boolean;
  mode: string;
}

export const PlantCompanion: React.FC<PlantCompanionProps> = ({ xp, isRunning, mode }) => {
  const [bounce, setBounce] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const stageData = getPlantStage(xp);
  const [customSpeech, setCustomSpeech] = useState<string | null>(null);

  const handlePlantTap = () => {
    playClayPopSound(0.3);
    setBounce((b) => b + 1);
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1200);

    const remarks = [
      "I love growing with you! Keep that focus going! 🌱",
      "Soft clay, strong mind! You're crushing it! ✨",
      "Every minute of focused work waters my roots! 💧",
      "Stay in flow! Great things take mindful time! 🌸",
      "Pillows and clay vibes! Let's get this session done! 🎯",
    ];
    setCustomSpeech(remarks[Math.floor(Math.random() * remarks.length)]);
  };

  const currentSpeech = customSpeech || getCompanionDialogue(isRunning, mode, xp);

  return (
    <section aria-label="Clay Desk Plant Companion" className="w-full max-w-sm mx-auto px-4 mt-6">
      <div className="clay-card bg-white/90 dark:bg-slate-800/90 p-5 flex flex-col items-center relative overflow-hidden">
        {/* Subtle decorative clay background aura */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 pointer-events-none blur-2xl transition-colors"
          style={{ backgroundColor: stageData.stageInfo.color }}
        />

        {/* Speech Bubble */}
        <motion.div
          key={currentSpeech}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative mb-3 max-w-[260px] text-center px-3 py-2 rounded-xl clay-card-subtle bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-200"
        >
          {currentSpeech}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-50 dark:bg-slate-900/60 rotate-45 border-r border-b border-slate-200/50 dark:border-slate-700/50" />
        </motion.div>

        {/* Interactive Plant SVG Surface */}
        <button
          type="button"
          onClick={handlePlantTap}
          aria-label={`Interactive clay plant companion: ${stageData.stageInfo.name}. Tap to interact and earn cheer.`}
          className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-3xl p-1 group cursor-pointer"
        >
          {/* Floating Hearts Animation when tapped */}
          {showHearts && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-rose-500 flex gap-1 z-20"
            >
              <Heart className="w-4 h-4 fill-current" />
              <Sparkles className="w-4 h-4 fill-current text-amber-400" />
            </motion.div>
          )}

          <motion.div
            key={bounce}
            animate={{
              scale: [1, 1.12, 0.92, 1.05, 1],
              rotate: [0, -3, 3, -1, 0],
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-28 h-28 flex items-center justify-center filter drop-shadow-md group-hover:scale-105 transition-transform"
          >
            {/* Stage SVGs */}
            {stageData.stageNumber === 1 && (
              // Stage 1: Pebble Seedling
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                  <radialGradient id="soil" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0.8" />
                  </radialGradient>
                  <radialGradient id="clayPebble" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                  </radialGradient>
                  <radialGradient id="sproutGreen" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#a7f3d0" />
                    <stop offset="100%" stopColor="#059669" />
                  </radialGradient>
                </defs>
                {/* Clay Pot */}
                <ellipse cx="50" cy="85" rx="36" ry="10" fill="#f87171" opacity="0.4" />
                <path d="M22 65 L28 88 Q50 94 72 88 L78 65 Z" fill="#fda4af" />
                <ellipse cx="50" cy="65" rx="28" ry="8" fill="url(#soil)" />
                {/* Pebble Body */}
                <ellipse cx="50" cy="62" rx="14" ry="11" fill="url(#clayPebble)" />
                {/* Tiny green shoot */}
                <path d="M50 56 Q44 42 42 36 Q49 38 50 48" fill="url(#sproutGreen)" />
                <path d="M50 52 Q56 40 60 38 Q56 46 50 50" fill="url(#sproutGreen)" />
                {/* Eyes */}
                <circle cx="46" cy="61" r="1.5" fill="#1e293b" />
                <circle cx="54" cy="61" r="1.5" fill="#1e293b" />
                <path d="M48 65 Q50 67 52 65" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </svg>
            )}

            {stageData.stageNumber === 2 && (
              // Stage 2: Clay Sprout
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                  <radialGradient id="leafGrad2" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#10b981" />
                  </radialGradient>
                </defs>
                {/* Pot */}
                <path d="M22 65 L28 88 Q50 94 72 88 L78 65 Z" fill="#fbcfe8" />
                <ellipse cx="50" cy="65" rx="28" ry="8" fill="#b45309" opacity="0.7" />
                {/* Stem */}
                <path d="M50 65 Q49 46 50 38" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
                {/* Left Leaf */}
                <path d="M50 48 C36 44 32 30 46 36 C48 40 50 45 50 48 Z" fill="url(#leafGrad2)" />
                {/* Right Leaf */}
                <path d="M50 43 C64 38 68 24 54 30 C52 35 50 40 50 43 Z" fill="url(#leafGrad2)" />
                {/* Eyes & Smile on Pot */}
                <circle cx="43" cy="74" r="2" fill="#831843" />
                <circle cx="57" cy="74" r="2" fill="#831843" />
                <path d="M47 78 Q50 82 53 78" stroke="#831843" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                {/* Blush */}
                <ellipse cx="38" cy="77" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                <ellipse cx="62" cy="77" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
              </svg>
            )}

            {stageData.stageNumber === 3 && (
              // Stage 3: Chubby Succulent
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                  <radialGradient id="succGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#a5f3fc" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </radialGradient>
                  <radialGradient id="potTurq" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </radialGradient>
                </defs>
                {/* Rounded Clay Pot */}
                <path d="M22 66 L26 88 Q50 95 74 88 L78 66 Z" fill="url(#potTurq)" />
                <ellipse cx="50" cy="66" rx="28" ry="8" fill="#78350f" opacity="0.6" />
                {/* Back Succulent Petals */}
                <path d="M50 56 C32 46 36 28 50 36 C64 28 68 46 50 56 Z" fill="#0e7490" />
                {/* Left/Right Petals */}
                <ellipse cx="37" cy="48" rx="11" ry="8" transform="rotate(-25 37 48)" fill="url(#succGrad)" />
                <ellipse cx="63" cy="48" rx="11" ry="8" transform="rotate(25 63 48)" fill="url(#succGrad)" />
                {/* Center Petal with Face */}
                <ellipse cx="50" cy="46" rx="13" ry="11" fill="#67e8f9" />
                <circle cx="46" cy="44" r="2" fill="#083344" />
                <circle cx="54" cy="44" r="2" fill="#083344" />
                <path d="M48 48 Q50 51 52 48" stroke="#083344" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                {/* Blush */}
                <circle cx="41" cy="47" r="2.2" fill="#f43f5e" opacity="0.5" />
                <circle cx="59" cy="47" r="2.2" fill="#f43f5e" opacity="0.5" />
              </svg>
            )}

            {stageData.stageNumber === 4 && (
              // Stage 4: Pastel Lotus
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                  <radialGradient id="petalPink" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#db2777" />
                  </radialGradient>
                </defs>
                <path d="M20 68 L26 89 Q50 96 74 89 L80 68 Z" fill="#ddd6fe" />
                <ellipse cx="50" cy="68" rx="30" ry="8" fill="#78350f" opacity="0.6" />
                {/* Outer Lotus Petals */}
                <path d="M30 64 C20 45 32 30 44 48 Z" fill="url(#petalPink)" opacity="0.8" />
                <path d="M70 64 C80 45 68 30 56 48 Z" fill="url(#petalPink)" opacity="0.8" />
                {/* Top Petal */}
                <path d="M50 56 C38 30 62 30 50 18 C38 30 62 30 50 56 Z" fill="url(#petalPink)" />
                {/* Center Blossom Face */}
                <ellipse cx="50" cy="48" rx="14" ry="12" fill="#f472b6" />
                <circle cx="45" cy="46" r="2" fill="#4c0519" />
                <circle cx="55" cy="46" r="2" fill="#4c0519" />
                <path d="M47 51 Q50 54 53 51" stroke="#4c0519" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                {/* Crown glow */}
                <circle cx="50" cy="20" r="3.5" fill="#fef08a" />
              </svg>
            )}

            {stageData.stageNumber === 5 && (
              // Stage 5: Zen Bonsai Master
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                  <radialGradient id="bonsaiFoliage" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </radialGradient>
                </defs>
                <ellipse cx="50" cy="85" rx="38" ry="11" fill="#cbd5e1" opacity="0.5" />
                <path d="M16 70 L22 88 Q50 94 78 88 L84 70 Z" fill="#f59e0b" />
                <ellipse cx="50" cy="70" rx="34" ry="8" fill="#78350f" opacity="0.7" />
                {/* Trunk */}
                <path d="M48 70 Q42 54 54 44 Q56 40 50 32" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Cloud Foliage Clusters */}
                <circle cx="34" cy="40" r="14" fill="url(#bonsaiFoliage)" />
                <circle cx="64" cy="38" r="15" fill="url(#bonsaiFoliage)" />
                <circle cx="48" cy="26" r="16" fill="url(#bonsaiFoliage)" />
                {/* Master Face on Trunk Center */}
                <circle cx="48" cy="48" r="1.8" fill="#fef3c7" />
                <circle cx="53" cy="48" r="1.8" fill="#fef3c7" />
                <path d="M49 53 Q51 55 53 53" stroke="#fef3c7" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                {/* Golden Master Star */}
                <path d="M50 10 L52 15 L57 15 L53 18 L55 23 L50 20 L45 23 L47 18 L43 15 L48 15 Z" fill="#facc15" />
              </svg>
            )}
          </motion.div>
        </button>

        {/* Stage Name & Level */}
        <div className="w-full mt-2 text-center">
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-100">
            <span>{stageData.stageInfo.name}</span>
            <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-800/40">
              Stage {stageData.stageNumber}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stageData.stageInfo.title}
          </p>

          {/* XP Progress Bar in Clay Inset Style */}
          <div className="w-full mt-3 px-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>{xp} Total XP</span>
              <span>{stageData.isMaxStage ? 'Max Mastery' : `${stageData.xpNeededForNext} XP to Stage ${stageData.stageNumber + 1}`}</span>
            </div>
            <div className="w-full h-3 rounded-full clay-card-inset bg-slate-100 dark:bg-slate-900 overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stageData.progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
