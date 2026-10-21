import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sparkles, BookOpen } from 'lucide-react';
import { ASSETS } from '../data/assets';
import { sound } from '../utils/audio';
import { HogwartsHouse } from '../types';
import { OnScreenScoreCelebration } from './OnScreenScoreCelebration';

export interface MagicalScoreProgressionProps {
  currentScore: number;
  house?: string;
  teamName?: string;
  maxScore?: number;
  compact?: boolean;
  onSimulatePoints?: (pts: number) => void;
}

export interface MilestoneTier {
  percentage: number;
  threshold: number;
  title: string;
  wandTitle: string;
  bookChapter: string;
  phoenixStage: string;
  perkDescription: string;
  symbol: string;
}

export const MILESTONE_TIERS: MilestoneTier[] = [
  {
    percentage: 25,
    threshold: 300,
    title: 'Apprentice Arithmancer',
    wandTitle: 'Silver Core Resonance',
    bookChapter: 'Chapter II: The Runic Transposition Matrix',
    phoenixStage: 'Fledgling Spark',
    perkDescription: 'Wand glow amplifies with silver sparks; first runic seals awaken.',
    symbol: 'ᚠ',
  },
  {
    percentage: 50,
    threshold: 600,
    title: 'Journeyman Cryptanalyst',
    wandTitle: 'Golden Lumos Incandescence',
    bookChapter: 'Chapter III: The Modular Congruence Seal',
    phoenixStage: 'Flame Crest',
    perkDescription: 'The Dark Protocol illuminates ancient numerals; fiery plumage emerges.',
    symbol: 'ᛋ',
  },
  {
    percentage: 75,
    threshold: 900,
    title: 'Order Cryptographic Master',
    wandTitle: 'Dragon Heartstring Surge',
    bookChapter: 'Chapter IV: The Unbroken Horcrux Cipher',
    phoenixStage: 'Ascending Wings',
    perkDescription: 'The Phoenix unfurls magnificent wings; golden embers stream across the sanctum.',
    symbol: 'ᛟ',
  },
  {
    percentage: 100,
    threshold: 1200,
    title: 'Arch-Arithmancer of Hogwarts',
    wandTitle: 'Elder Wand Celestial Blazon',
    bookChapter: 'Master Folio: The 50th Chamber Gateway',
    phoenixStage: 'Grand Ascended Phoenix',
    perkDescription: 'Full Phoenix Ascension! Master of all Hogwarts cryptographic wards.',
    symbol: '⚡',
  },
];

export const MagicalScoreProgression: React.FC<MagicalScoreProgressionProps> = ({
  currentScore,
  house = 'Gryffindor',
  teamName = 'Code-Breakers',
  maxScore = 1200,
  compact = false,
  onSimulatePoints,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Score Tracking & Animated Tally
  const [displayedScore, setDisplayedScore] = useState(currentScore);
  const [pointsDelta, setPointsDelta] = useState<number | null>(null);
  const [isWandCasting, setIsWandCasting] = useState(false);
  const [isBookAwakened, setIsBookAwakened] = useState(false);
  const [isFlyingPhoenix, setIsFlyingPhoenix] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<MilestoneTier | null>(null);

  const prevScoreRef = useRef<number>(currentScore);
  const isFirstMountRef = useRef<boolean>(true);

  // Milestone Progress
  const progressPercent = Math.min(100, Math.round((currentScore / maxScore) * 100));
  const currentTier =
    progressPercent >= 100
      ? 4
      : progressPercent >= 75
      ? 3
      : progressPercent >= 50
      ? 2
      : progressPercent >= 25
      ? 1
      : 0;

  // React strictly when score increases genuinely
  useEffect(() => {
    // Skip animation on initial mount / page load
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevScoreRef.current = currentScore;
      setDisplayedScore(currentScore);
      return;
    }

    const previous = prevScoreRef.current;
    if (currentScore > previous) {
      const delta = currentScore - previous;
      setPointsDelta(delta);
      prevScoreRef.current = currentScore;

      // 1. Trigger Wand Power-Up Spellcast
      setIsWandCasting(true);
      sound.playWandSpellCast();

      // 2. Trigger Enchanted Book Awakening
      setIsBookAwakened(true);

      // 3. Smooth Score Counting Animation
      let start = previous;
      const step = Math.max(1, Math.ceil(delta / 25));
      const interval = setInterval(() => {
        start += step;
        if (start >= currentScore) {
          start = currentScore;
          clearInterval(interval);
        }
        setDisplayedScore(start);
        sound.playScoreTick();
      }, 35);

      // 4. Check if a milestone was crossed
      const crossedMilestone = MILESTONE_TIERS.find(
        (m) => previous < m.threshold && currentScore >= m.threshold
      );

      if (crossedMilestone) {
        setCelebrationMilestone(crossedMilestone);
        // Trigger Phoenix Spread Wings Flight
        setIsFlyingPhoenix(true);
        if (crossedMilestone.percentage === 100) {
          sound.playPhoenixAscension();
        } else {
          sound.playSuccess();
        }

        setTimeout(() => {
          setShowCelebrationModal(true);
        }, 1200);
      }

      // Cleanup spell bursts after 3.5s
      const timer = setTimeout(() => {
        setIsWandCasting(false);
        setIsBookAwakened(false);
        setIsFlyingPhoenix(false);
        setPointsDelta(null);
      }, 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else if (currentScore < previous) {
      // Score decreased (e.g. penalty)
      prevScoreRef.current = currentScore;
      setDisplayedScore(currentScore);
    }
  }, [currentScore, maxScore]);

  // Wand power glow intensity based on score percentage
  const getWandGlowClasses = () => {
    if (currentTier >= 4) {
      return 'shadow-[0_0_35px_#fef08a,0_0_70px_#f59e0b] border-[#fef08a] text-[#fef9c3]';
    }
    if (currentTier >= 3) {
      return 'shadow-[0_0_25px_#f59e0b,0_0_45px_#d97706] border-[#f3d069] text-[#fde047]';
    }
    if (currentTier >= 2) {
      return 'shadow-[0_0_20px_#eab308] border-[#c59b27] text-[#fef08a]';
    }
    if (currentTier >= 1) {
      return 'shadow-[0_0_12px_#38bdf8] border-[#94a3b8] text-slate-200';
    }
    return 'shadow-[0_0_6px_rgba(197,155,39,0.3)] border-[#855e1d] text-amber-200/80';
  };

  return (
    <div className="relative select-none">
      {/* =========================================================================
          COMPACT / HEADER WIDGET PRESENTATION (CLEAN NO GREY SHADOW)
          ========================================================================= */}
      <div className="rounded-2xl border border-[#c59b27]/40 bg-gradient-to-r from-[#081220] via-[#0b192e] to-[#081220] p-3 sm:p-4 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Subtle magical runes watermark in background */}
        <div className="absolute inset-0 pointer-events-none opacity-5 font-cinzel text-4xl flex items-center justify-around select-none">
          <span>ᚠ</span>
          <span>ᛋ</span>
          <span>⚡</span>
          <span>ᛟ</span>
        </div>

        {/* LEFT: WAND POWER-UP & SCORE COUNTER */}
        <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto justify-between md:justify-start">
          {/* Wand Casting Assembly */}
          <div className="relative shrink-0 flex items-center">
            {/* Wand Glow Aura (Only shines during active spellcast, no persistent blur shadow) */}
            {isWandCasting && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0, 0.7, 0],
                }}
                transition={{ duration: 0.35 }}
                className="absolute -inset-1 rounded-full border border-amber-300 pointer-events-none"
              />
            )}

            {/* Elder Wand Graphic & Tip Spell Sparks */}
            <motion.div
              animate={
                isWandCasting
                  ? {
                      rotate: [-15, 12, -4, 0],
                      scale: [1, 1.18, 1.05, 1],
                    }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className={`relative z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#060c18] border-2 flex items-center justify-center transition-all ${getWandGlowClasses()}`}
              title={`Wand Power Level: ${currentTier}/4 · ${MILESTONE_TIERS[Math.max(0, currentTier - 1)]?.wandTitle || 'Dormant Wood'}`}
            >
              {/* Wand SVG Icon with Glowing Core */}
              <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7 fill-none stroke-current stroke-2">
                <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                <path d="m14 7 3 3" />
                <path d="M5 16l3 3" />
              </svg>

              {/* Sparks emitting from wand tip */}
              {isWandCasting && (
                <div className="absolute -top-2 -right-2 text-amber-300 animate-spin">
                  <Sparkles className="h-5 w-5 drop-shadow-[0_0_8px_#fef08a]" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Cumulative Score & Flying Points Orb */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-cinzel font-bold text-[#f3d069] uppercase tracking-widest">
                ✦ Master Wizardry Score ✦
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-600/40 text-amber-300 font-mono">
                Tier {currentTier}
              </span>
            </div>

            {/* Big Tabular Counter */}
            <div className="flex items-baseline gap-2">
              <motion.span
                animate={
                  isWandCasting
                    ? {
                        scale: [1, 1.15, 1],
                        color: ['#fef9c3', '#fef08a', '#fef9c3'],
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4 }}
                className="font-mono text-2xl sm:text-3xl font-black text-[#fef9c3] tracking-wide tabular-nums drop-shadow-[0_0_15px_rgba(243,208,105,0.4)]"
              >
                {displayedScore}
              </motion.span>
              <span className="text-xs font-cinzel text-slate-400">/ {maxScore} XP</span>
            </div>

            </div>
          </div>

        {/* CENTER: ENCHANTED BOOK AWAKENING ("THE DARK PROTOCOL") */}
        <div className="flex items-center gap-3 bg-[#060c18]/80 px-3.5 py-2 rounded-xl border border-[#c59b27]/40 relative overflow-hidden w-full md:w-auto">
          {/* Page Flutter & Rune Radiance Animation */}
          <motion.div
            animate={
              isBookAwakened
                ? {
                    rotateY: [0, -25, 0],
                    scale: [1, 1.12, 1],
                  }
                : { scale: 1 }
            }
            transition={{ duration: 0.6 }}
            className="h-9 w-9 rounded-lg bg-[#091526] border border-[#c59b27] flex items-center justify-center text-[#f3d069] relative shadow-md shrink-0"
          >
            <BookOpen className="h-5 w-5" />
            {isBookAwakened && (
              <div className="absolute inset-0 bg-amber-400/30 rounded-lg animate-ping pointer-events-none" />
            )}
          </motion.div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#fef9c3]">
              <span>The Dark Protocol</span>
              <span className="text-amber-400">✦</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentTier >= 1 ? `Ch. ${Math.min(4, currentTier + 1)} Awakened` : 'Ch. I Active'}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-serif truncate">
              {currentTier >= 4
                ? 'Master Folio: 50th Chamber Gates Unlocked'
                : currentTier >= 3
                ? 'Secret Horcrux Ciphers Unsealed'
                : currentTier >= 2
                ? 'Arithmancy Residue Matrix Active'
                : currentTier >= 1
                ? 'Runic Ward of Alohomora Glowing'
                : 'Parchment dormant; crack ciphers to unseal'}
            </p>
          </div>
        </div>
      </div>

      {/* OVERALL PROGRESS BAR WITH MILESTONE PINS */}
      <div className="mt-1 px-2 space-y-1">
        <div className="relative h-2 w-full bg-[#060c18] rounded-full overflow-hidden border border-[#c59b27]/30">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Threshold markers */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1">
          <span>0 XP</span>
          <span className={currentScore >= 300 ? 'text-[#f3d069] font-bold' : ''}>25% (300)</span>
          <span className={currentScore >= 600 ? 'text-[#f3d069] font-bold' : ''}>50% (600)</span>
          <span className={currentScore >= 900 ? 'text-[#f3d069] font-bold' : ''}>75% (900)</span>
          <span className={currentScore >= 1200 ? 'text-orange-400 font-bold' : ''}>100% (1200)</span>
        </div>
      </div>

      {/* =========================================================================
          FULL PHOENIX FLIGHT ANIMATION ACROSS VIEWPORT ON MILESTONE
          ========================================================================= */}
      <AnimatePresence>
        {isFlyingPhoenix && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0, x: '-20vw', y: '60vh', scale: 0.6 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: ['-10vw', '50vw', '110vw'],
              y: ['50vh', '25vh', '10vh'],
              scale: [0.7, 1.25, 0.9],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          >
            <div className="relative flex flex-col items-center">
              <img
                src={ASSETS.phoenixCrest}
                alt="Ascending Phoenix"
                className="h-44 w-44 rounded-full border-2 border-amber-300 shadow-[0_0_80px_#f97316,0_0_120px_#fef08a] object-cover animate-spin-slow"
              />
              <div className="text-amber-200 font-cinzel font-black text-lg tracking-widest uppercase drop-shadow-[0_0_20px_#f97316] mt-2">
                ✦ Fawkes Takes Flight ✦
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MILESTONE CROSSING CELEBRATION MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showCelebrationModal && celebrationMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCelebrationModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border-2 border-[#f3d069] bg-gradient-to-b from-[#0e1d35] via-[#091526] to-[#040a14] p-6 sm:p-8 shadow-[0_0_80px_rgba(243,208,105,0.4)] text-center space-y-5"
            >
              {/* Phoenix Artwork Emblem */}
              <div className="relative h-28 w-28 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_35px_#f97316]">
                <img
                  src={ASSETS.phoenixCrest}
                  alt="Phoenix Awakened"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-widest">
                  ✦ Hogwarts Mastery Milestone Unlocked ({celebrationMilestone.percentage}%) ✦
                </span>
                <h3 className="font-cinzel text-2xl font-black text-[#fef9c3] drop-shadow">
                  {celebrationMilestone.title}
                </h3>
                <p className="text-xs text-slate-300 font-serif">
                  {celebrationMilestone.perkDescription}
                </p>
              </div>

              {/* Unlocked Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs bg-[#060c18] p-3 rounded-xl border border-[#c59b27]/40">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">Wand Resonance</span>
                  <strong className="text-amber-200 font-cinzel">{celebrationMilestone.wandTitle}</strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">Codex Awakening</span>
                  <strong className="text-amber-200 font-cinzel">{celebrationMilestone.bookChapter}</strong>
                </div>
              </div>

              <button
                onClick={() => setShowCelebrationModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] text-neutral-950 font-cinzel font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[0_0_25px_#fef08a] cursor-pointer"
              >
                Claim House Honor & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* =========================================================================
          FULL ON-SCREEN MAGICAL SCORE ADDING ANIMATION OVERLAY (NOT ON SLIDING BAR)
          ========================================================================= */}
      <OnScreenScoreCelebration
        pointsDelta={pointsDelta}
        newTotalScore={currentScore}
        house={(house as HogwartsHouse) || 'Gryffindor'}
        teamName={teamName}
        onComplete={() => setPointsDelta(null)}
      />
    </div>
  );
};
