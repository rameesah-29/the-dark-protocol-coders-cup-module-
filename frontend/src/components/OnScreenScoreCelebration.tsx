import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Award, Flame, BookOpen, Star } from 'lucide-react';
import { HogwartsHouse } from '../types';
import { ASSETS } from '../data/assets';
import { sound } from '../utils/audio';

export interface OnScreenScoreCelebrationProps {
  pointsDelta: number | null;
  newTotalScore: number;
  house: HogwartsHouse;
  teamName: string;
  onComplete?: () => void;
}

interface HouseStyle {
  glowColor: string;
  particleColors: string[];
  crestBg: string;
  accentText: string;
  badgeBorder: string;
  mascotSymbol: string;
  mascotName: string;
}

const HOUSE_STYLES: Record<HogwartsHouse, HouseStyle> = {
  Gryffindor: {
    glowColor: 'rgba(239, 68, 68, 0.55)',
    particleColors: ['#f59e0b', '#ef4444', '#dc2626', '#fef08a', '#fbbf24'],
    crestBg: 'from-red-950 via-[#1b080b] to-amber-950/60',
    accentText: 'text-amber-300',
    badgeBorder: 'border-amber-400/80',
    mascotSymbol: '🦁',
    mascotName: 'Gryffindor Lion',
  },
  Slytherin: {
    glowColor: 'rgba(16, 185, 129, 0.55)',
    particleColors: ['#10b981', '#059669', '#34d399', '#e2e8f0', '#6ee7b7'],
    crestBg: 'from-emerald-950 via-[#061811] to-slate-900',
    accentText: 'text-emerald-300',
    badgeBorder: 'border-emerald-400/80',
    mascotSymbol: '🐍',
    mascotName: 'Slytherin Serpent',
  },
  Ravenclaw: {
    glowColor: 'rgba(59, 130, 246, 0.55)',
    particleColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#d97706', '#fde047'],
    crestBg: 'from-blue-950 via-[#07132c] to-amber-950/40',
    accentText: 'text-sky-300',
    badgeBorder: 'border-sky-400/80',
    mascotSymbol: '🦅',
    mascotName: 'Ravenclaw Eagle',
  },
  Hufflepuff: {
    glowColor: 'rgba(234, 179, 8, 0.55)',
    particleColors: ['#eab308', '#facc15', '#ca8a04', '#71717a', '#fef08a'],
    crestBg: 'from-yellow-950 via-[#1a1506] to-zinc-900',
    accentText: 'text-yellow-300',
    badgeBorder: 'border-yellow-400/80',
    mascotSymbol: '🦡',
    mascotName: 'Hufflepuff Badger',
  },
};

const RUNIC_SYMBOLS = ['ᚠ', 'ᛋ', '⚡', 'ᛟ', '⚯͛', '☿', '🜂', 'ᛗ', 'ᚱ', '✦'];

export const OnScreenScoreCelebration: React.FC<OnScreenScoreCelebrationProps> = ({
  pointsDelta,
  newTotalScore,
  house,
  teamName,
  onComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const houseStyle = HOUSE_STYLES[house] || HOUSE_STYLES.Gryffindor;

  useEffect(() => {
    if (pointsDelta && pointsDelta > 0) {
      setVisible(true);
      // Play wand and celebration chimes
      sound.playWandSpellCast();
      sound.playSparkle();

      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 3600);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [pointsDelta, onComplete]);

  if (!visible || !pointsDelta) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4 overflow-hidden select-none">
        {/* Cinematic Backdrop Vignette & Golden Ambient Flare */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-gradient-radial from-amber-500/15 via-[#060c18]/60 to-[#060c18]/80 backdrop-blur-xs"
        />

        {/* Concentric Rotating Ancient Runic Shockwave Rings */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: 0 }}
          animate={{ scale: [0.3, 1.25, 1.6], opacity: [0, 0.7, 0], rotate: 180 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full border-2 border-dashed border-amber-300/40 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[75%] h-[75%] rounded-full border border-amber-400/30 flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-full border border-dashed border-[#c59b27]/40" />
          </div>
        </motion.div>

        {/* Floating Sparks & Embers (18 particles radiating from center) */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * 360;
          const rad = (angle * Math.PI) / 180;
          const dist = 140 + (i % 4) * 55;
          const tx = Math.cos(rad) * dist;
          const ty = Math.sin(rad) * dist - 30;
          const color = houseStyle.particleColors[i % houseStyle.particleColors.length];
          const rune = RUNIC_SYMBOLS[i % RUNIC_SYMBOLS.length];

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
              animate={{
                x: tx,
                y: ty,
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1.3, 0.6],
              }}
              transition={{
                duration: 2.4,
                delay: 0.05 + (i * 0.03),
                ease: 'easeOut',
              }}
              className="absolute z-20 pointer-events-none flex items-center justify-center"
              style={{ color }}
            >
              {i % 3 === 0 ? (
                <span className="font-cinzel text-base font-bold drop-shadow-[0_0_8px_currentColor]">
                  {rune}
                </span>
              ) : i % 2 === 0 ? (
                <Sparkles className="h-4 w-4 drop-shadow-[0_0_10px_currentColor]" />
              ) : (
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                  style={{ backgroundColor: color }}
                />
              )}
            </motion.div>
          );
        })}

        {/* MAIN HERO ON-SCREEN CELEBRATION CARD */}
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{
            scale: [0.5, 1.08, 1],
            y: [50, -10, 0],
            opacity: 1,
          }}
          exit={{ scale: 0.85, y: -40, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-30 max-w-lg w-full mx-4"
        >
          {/* Outer Magical Glow Aura */}
          <div
            className="absolute -inset-3 rounded-3xl blur-2xl opacity-60 pointer-events-none transition-all"
            style={{ backgroundColor: houseStyle.glowColor }}
          />

          <div
            className={`relative rounded-3xl border-2 ${houseStyle.badgeBorder} bg-gradient-to-b ${houseStyle.crestBg} p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] text-center overflow-hidden`}
          >
            {/* Top Gilded Filigree Crest Banner */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#f3d069] to-transparent" />

            {/* Antique corner accents */}
            <div className="absolute top-2 left-2 text-[#c59b27]/60 text-xs font-cinzel">✦</div>
            <div className="absolute top-2 right-2 text-[#c59b27]/60 text-xs font-cinzel">✦</div>
            <div className="absolute bottom-2 left-2 text-[#c59b27]/60 text-xs font-cinzel">✦</div>
            <div className="absolute bottom-2 right-2 text-[#c59b27]/60 text-xs font-cinzel">✦</div>

            {/* WAND POWER-UP SPELLCAST ANIMATION (Header Assembly) */}
            <div className="relative mb-4 flex items-center justify-center">
              {/* Wand Graphic with Casting Flare */}
              <motion.div
                animate={{
                  rotate: [-20, 15, -5, 0],
                  scale: [0.9, 1.25, 1],
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#060c18] border-2 border-amber-400/90 shadow-[0_0_30px_#fef08a] flex items-center justify-center text-amber-300"
              >
                {/* Wand Icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 sm:h-12 sm:w-12 fill-none stroke-current stroke-2 drop-shadow-[0_0_12px_#fef08a]"
                >
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                  <path d="m14 7 3 3" />
                  <path d="M5 16l3 3" />
                </svg>

                {/* Wand Tip Spell Flare */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.8, 1.2], opacity: [0, 1, 0.8] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute -top-3 -right-3 text-amber-200"
                >
                  <Sparkles className="h-8 w-8 drop-shadow-[0_0_15px_#fef08a] animate-spin" />
                </motion.div>

                {/* House Mascot Emoji Badge */}
                <div className="absolute -bottom-2 -left-2 h-7 w-7 rounded-full bg-[#060c18] border border-amber-400 flex items-center justify-center text-sm shadow">
                  {houseStyle.mascotSymbol}
                </div>
              </motion.div>
            </div>

            {/* PRESTIGE HEADING */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[#f3d069] text-xs">❖</span>
                <span className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#f3d069]">
                  Squad Mastery Points Awarded
                </span>
                <span className="text-[#f3d069] text-xs">❖</span>
              </div>

              {/* HUGE GLOWING FLYING POINTS BADGE */}
              <motion.div
                initial={{ scale: 0.4, y: 25, opacity: 0 }}
                animate={{ scale: [0.4, 1.3, 1], y: [25, -6, 0], opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="py-1"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-cinzel font-black text-3xl sm:text-4xl shadow-[0_0_35px_#fef08a] border-2 border-amber-200">
                  <Zap className="h-7 w-7 fill-neutral-950 stroke-neutral-950" />
                  <span>+{pointsDelta} Points!</span>
                </div>
              </motion.div>
            </div>

            {/* ENCHANTED BOOK & PHOENIX PROGRESSION SUB-BANNER */}
            <div className="mt-4 pt-3 border-t border-[#c59b27]/40 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-cinzel text-slate-200">
                <BookOpen className="h-4 w-4 text-[#f3d069]" />
                <span className="font-bold text-[#fef9c3]">The Dark Protocol Awakens</span>
                <span className="text-amber-400">✦</span>
                <span className="font-serif italic text-slate-300">Runes Illuminated</span>
              </div>

              <p className="text-xs text-slate-300 font-serif italic max-w-sm mx-auto leading-relaxed">
                "Arithmancy wards unsealed. Your cumulative prowess surges to{' '}
                <strong className="text-amber-300 font-mono font-bold">{newTotalScore} XP</strong>."
              </p>

              {/* Mini Phoenix Embers Strip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/70 border border-orange-500/50 text-[11px] font-cinzel text-orange-200 mt-1">
                <Flame className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <span>Phoenix Plumes Ignite With Golden Flames</span>
                <span className="text-orange-400 font-mono text-[10px]">({teamName})</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
