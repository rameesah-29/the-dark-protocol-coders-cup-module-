import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  Lock,
  Unlock,
  X,
  Flame,
  Sun,
  KeyRound,
  Eye,
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react';
import { HogwartsHouse, FolderAllocation, RoundChallenge } from '../types';
import { ASSETS } from '../data/assets';
import { sound } from '../utils/audio';

export interface SpellItem {
  id: string;
  name: string;
  incantation: string;
  type: string;
  description: string;
  lore: string;
  requiredChallengeNumber?: number;
  requiredRound?: number;
  requiredPoints?: number;
  iconName: 'key' | 'sun' | 'eye' | 'patronus' | 'flame';
  animationType: 'alohomora' | 'lumos' | 'revelio' | 'patronus' | 'incendio';
  accentColorHex: string;
  badgeBg: string;
}

export const SPELLS_CATALOG: SpellItem[] = [
  {
    id: 'spell-alohomora',
    name: 'Alohomora',
    incantation: 'The Unlocking Charm',
    type: 'Charms & Cryptography',
    description: 'Unseals standard doors, mechanical padlocks, and encrypted transposition matrices.',
    lore: 'Discovered in Africa and brought to Britain by Eldon Elsrickle in the early 17th century.',
    requiredChallengeNumber: 1,
    iconName: 'key',
    animationType: 'alohomora',
    accentColorHex: '#f59e0b',
    badgeBg: 'bg-amber-950/70 border-amber-500/50',
  },
  {
    id: 'spell-lumos',
    name: 'Lumos Maxima',
    incantation: 'The Wand-Lighting Incantation',
    type: 'Illumination Charm',
    description: 'Flashes a blinding sphere of celestial light that reveals hidden ink and concealed clues.',
    lore: 'Invented by Levina Monkstanley in 1772 to locate dropped quills in dark corridors.',
    requiredChallengeNumber: 2,
    iconName: 'sun',
    animationType: 'lumos',
    accentColorHex: '#fef08a',
    badgeBg: 'bg-yellow-950/70 border-yellow-400/50',
  },
  {
    id: 'spell-revelio',
    name: 'Arithmancy Revelio',
    incantation: 'The Revelation Formulation',
    type: 'Divination & Arithmancy',
    description: 'Compels invisible mathematical patterns, modular congruences, and ciphers to manifest.',
    lore: 'Formulated by Bridget Wenlock, the famed thirteenth-century arithmancer.',
    requiredChallengeNumber: 3,
    iconName: 'eye',
    animationType: 'revelio',
    accentColorHex: '#38bdf8',
    badgeBg: 'bg-sky-950/70 border-sky-400/50',
  },
  {
    id: 'spell-patronus',
    name: 'Expecto Patronum',
    incantation: 'The Silver Guardian Charm',
    type: 'Advanced Defensive Spell',
    description: 'Summons a corporeal silver patronus that banishes dark crypt-damp and fills the sanctum with hope.',
    lore: 'The most famous and difficult defensive charm known to wizardkind.',
    requiredRound: 2,
    iconName: 'patronus',
    animationType: 'patronus',
    accentColorHex: '#e0e7ff',
    badgeBg: 'bg-indigo-950/70 border-indigo-400/50',
  },
  {
    id: 'spell-incendio',
    name: 'Incendio Ignis',
    incantation: 'The Fiery Phoenix Surge',
    type: 'Elemental Conjuration',
    description: 'Manifests blazing golden phoenix fire to burn through stubborn runic webs and unseal locked chests.',
    lore: 'Attuned directly to Fawkes and the burning core of the Hogwarts sanctum.',
    requiredPoints: 150,
    iconName: 'flame',
    animationType: 'incendio',
    accentColorHex: '#f97316',
    badgeBg: 'bg-orange-950/70 border-orange-500/50',
  },
];

export interface SpellsInventorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  allocatedFolder: FolderAllocation | null;
  clearanceLevel: number;
  currentScore: number;
  house: HogwartsHouse;
}

export const SpellsInventorySidebar: React.FC<SpellsInventorySidebarProps> = ({
  isOpen,
  onClose,
  allocatedFolder,
  clearanceLevel,
  currentScore,
  house,
}) => {
  const [practiceMode, setPracticeMode] = useState(false);
  const [activeCastSpell, setActiveCastSpell] = useState<SpellItem | null>(null);

  // Check which challenges are solved
  const challenges: RoundChallenge[] = allocatedFolder?.challenges || [];
  const isChallenge1Solved = challenges.find((c) => c.number === 1)?.isSolved || false;
  const isChallenge2Solved = challenges.find((c) => c.number === 2)?.isSolved || false;
  const isChallenge3Solved = challenges.find((c) => c.number === 3)?.isSolved || false;

  const isSpellUnlocked = (spell: SpellItem): boolean => {
    if (practiceMode) return true;
    if (spell.requiredChallengeNumber === 1) return isChallenge1Solved;
    if (spell.requiredChallengeNumber === 2) return isChallenge2Solved;
    if (spell.requiredChallengeNumber === 3) return isChallenge3Solved;
    if (spell.requiredRound === 2) return clearanceLevel >= 2;
    if (spell.requiredPoints) return currentScore >= spell.requiredPoints;
    return false;
  };

  const unlockedCount = SPELLS_CATALOG.filter(isSpellUnlocked).length;

  const handleCastSpell = (spell: SpellItem) => {
    sound.playWandSpellCast();
    setActiveCastSpell(spell);

    // Audio cue matching spell
    if (spell.animationType === 'lumos') {
      sound.playSparkle();
    } else if (spell.animationType === 'alohomora') {
      sound.playSealCrack();
    } else if (spell.animationType === 'patronus') {
      sound.playPhoenixAscension();
    } else if (spell.animationType === 'incendio') {
      sound.playWandSpellCast();
    }

    // Auto-dismiss animation after 3.8s
    setTimeout(() => {
      setActiveCastSpell((prev) => (prev?.id === spell.id ? null : prev));
    }, 3800);
  };

  return (
    <>
      {/* =========================================================================
          SPELLS INVENTORY DRAWER / SIDEBAR
          ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-out Sidebar Container */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-md h-full bg-gradient-to-b from-[#081220] via-[#0b1a2e] to-[#040914] border-l-2 border-[#c59b27]/60 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col select-none overflow-hidden"
            >
              {/* Top Ornate Gilded Header */}
              <div className="p-4 sm:p-5 border-b border-[#c59b27]/40 bg-[#060c18]/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow">
                    <Zap className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-[#fef9c3] flex items-center gap-1.5">
                      <span>Grimoire Spells Inventory</span>
                      <span className="text-xs text-[#c59b27]">✦</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-serif italic">
                      Collect spells as you solve challenges · Click to cast
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-300 hover:bg-[#0c1e38] transition cursor-pointer"
                  title="Close Inventory"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status & Practice Mode Bar */}
              <div className="px-4 py-2.5 bg-[#071322] border-b border-[#c59b27]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-cinzel">
                  <span className="text-[#f3d069]">✦ Collected:</span>
                  <strong className="text-amber-300 font-mono font-bold">
                    {unlockedCount} / {SPELLS_CATALOG.length}
                  </strong>
                </div>

                {/* Practice Mode Toggle */}
                <button
                  onClick={() => setPracticeMode(!practiceMode)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-cinzel font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    practiceMode
                      ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_12px_#fef08a]'
                      : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>Practice Cast Mode:</span>
                  <span>{practiceMode ? 'ON ✓' : 'OFF'}</span>
                </button>
              </div>

              {/* Scrollable Spell Cards List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {SPELLS_CATALOG.map((spell) => {
                  const unlocked = isSpellUnlocked(spell);

                  return (
                    <div
                      key={spell.id}
                      className={`relative rounded-2xl border p-4 transition-all duration-300 ${
                        unlocked
                          ? 'bg-gradient-to-r from-[#09172c] to-[#0d213d] border-[#c59b27]/60 shadow-lg hover:border-amber-400'
                          : 'bg-[#060c18]/60 border-slate-800/80 opacity-60'
                      }`}
                    >
                      {/* Top Row: Icon, Name & Status */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl border flex items-center justify-center text-lg shadow shrink-0 ${
                              unlocked
                                ? `${spell.badgeBg} text-amber-200`
                                : 'bg-slate-900 border-slate-700 text-slate-600'
                            }`}
                          >
                            {spell.iconName === 'key' && <KeyRound className="h-5 w-5" />}
                            {spell.iconName === 'sun' && <Sun className="h-5 w-5" />}
                            {spell.iconName === 'eye' && <Eye className="h-5 w-5" />}
                            {spell.iconName === 'patronus' && <Sparkles className="h-5 w-5" />}
                            {spell.iconName === 'flame' && <Flame className="h-5 w-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-cinzel text-sm font-bold text-[#fef9c3]">
                                {spell.name}
                              </h4>
                              {unlocked && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                                  Ready
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-serif italic text-amber-300/80 block">
                              {spell.incantation}
                            </span>
                          </div>
                        </div>

                        {/* Lock / Unlock Icon */}
                        <div className="shrink-0 pt-0.5">
                          {unlocked ? (
                            <Unlock className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {/* Spell Description & Lore */}
                      <p className="text-xs text-slate-300 font-serif leading-relaxed mb-3">
                        {spell.description}
                      </p>

                      {/* Bottom Action / Requirement Bar */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-cinzel">
                          {unlocked
                            ? '✦ Unlocked for Duel & Sanctum'
                            : spell.requiredChallengeNumber
                            ? `Solve Challenge #${spell.requiredChallengeNumber}`
                            : spell.requiredRound
                            ? `Advance to Round ${spell.requiredRound}`
                            : `Earn ${spell.requiredPoints} XP`}
                        </span>

                        <button
                          onClick={() => handleCastSpell(spell)}
                          disabled={!unlocked}
                          className={`px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            unlocked
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 shadow-md hover:shadow-[0_0_15px_#fef08a] hover:scale-105'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Cast Spell</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Tip Footer */}
              <div className="p-3 bg-[#060c18] border-t border-[#c59b27]/30 text-[11px] text-slate-400 font-serif italic text-center">
                "Words are, in my not-so-humble opinion, our most inexhaustible source of magic."
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          UNIQUE FULL-SCREEN ON-SCREEN SPELLCASTING ANIMATIONS
          ========================================================================= */}
      <AnimatePresence>
        {activeCastSpell && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4 overflow-hidden select-none">
            {/* Background Radial Light Flare */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* 1. ALOHOMORA ANIMATION: GIANT PADLOCK UNLOCKING WITH GOLDEN SHOCKWAVE */}
            {activeCastSpell.animationType === 'alohomora' && (
              <div className="relative flex flex-col items-center">
                {/* Runic Expansion Shockwave */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.4, 1.8], opacity: [0, 0.9, 0] }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                  className="absolute h-96 w-96 rounded-full border-2 border-amber-300/80 shadow-[0_0_80px_#fef08a]"
                />

                {/* Animated Hogwarts Padlock */}
                <motion.div
                  initial={{ scale: 0.4, y: 30, opacity: 0 }}
                  animate={{ scale: [0.4, 1.15, 1], y: [30, -5, 0], opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-28 w-28 rounded-3xl bg-[#0a182c] border-4 border-amber-400 shadow-[0_0_50px_#f59e0b] flex items-center justify-center text-amber-300"
                >
                  <motion.div
                    animate={{ rotate: [0, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <KeyRound className="h-14 w-14 drop-shadow-[0_0_15px_#fef08a]" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-4 text-center space-y-1"
                >
                  <h3 className="font-cinzel text-3xl font-black text-[#fef9c3] tracking-widest uppercase drop-shadow-[0_0_20px_#f59e0b]">
                    ✦ Alohomora! ✦
                  </h3>
                  <p className="text-sm font-serif italic text-amber-200">
                    The ancient cryptographic wards click open!
                  </p>
                </motion.div>
              </div>
            )}

            {/* 2. LUMOS MAXIMA ANIMATION: BLINDING CELESTIAL ILLUMINATION & FIREFLIES */}
            {activeCastSpell.animationType === 'lumos' && (
              <div className="relative flex flex-col items-center">
                {/* Expanding Celestial Flare */}
                <motion.div
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: [0.1, 1.8, 2.5], opacity: [0, 0.95, 0.4] }}
                  transition={{ duration: 1.5 }}
                  className="absolute h-[500px] w-[500px] rounded-full bg-gradient-radial from-amber-200 via-yellow-400/40 to-transparent blur-xl pointer-events-none"
                />

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.25, 1], opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10 h-28 w-28 rounded-full bg-yellow-100 border-4 border-amber-300 shadow-[0_0_80px_#ffffff,0_0_120px_#fef08a] flex items-center justify-center text-amber-700"
                >
                  <Sun className="h-16 w-16 animate-spin-slow" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 mt-5 text-center space-y-1"
                >
                  <h3 className="font-cinzel text-3xl font-black text-[#ffffff] tracking-widest uppercase drop-shadow-[0_0_25px_#ffffff]">
                    ✦ Lumos Maxima! ✦
                  </h3>
                  <p className="text-sm font-serif italic text-yellow-200">
                    Celestial light floods the Chamber of Secrets!
                  </p>
                </motion.div>
              </div>
            )}

            {/* 3. ARITHMANCY REVELIO ANIMATION: FLOATING ANCIENT NUMERALS & CIPHERS */}
            {activeCastSpell.animationType === 'revelio' && (
              <div className="relative flex flex-col items-center">
                {/* Floating Formulas */}
                <div className="absolute inset-0 w-[600px] h-[300px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none">
                  {['a ≡ b (mod m)', 'gcd(e, φ(n)) = 1', 'C ≡ Mᵉ (mod n)', 'XOR 7×7', 'π · r² ≡ Ω'].map(
                    (formula, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20, x: (i - 2) * 60 }}
                        animate={{ opacity: [0, 1, 0], y: [-20, -70], x: (i - 2) * 90 }}
                        transition={{ duration: 2.5, delay: i * 0.2 }}
                        className="absolute font-mono text-sm font-bold text-sky-300 drop-shadow-[0_0_10px_#38bdf8]"
                        style={{ left: `${20 + i * 16}%`, top: '40%' }}
                      >
                        {formula}
                      </motion.div>
                    )
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-28 w-28 rounded-2xl bg-[#05182e] border-4 border-sky-400 shadow-[0_0_60px_#38bdf8] flex items-center justify-center text-sky-300"
                >
                  <Eye className="h-14 w-14 animate-pulse" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-5 text-center space-y-1"
                >
                  <h3 className="font-cinzel text-3xl font-black text-sky-200 tracking-widest uppercase drop-shadow-[0_0_25px_#38bdf8]">
                    ✦ Arithmancy Revelio! ✦
                  </h3>
                  <p className="text-sm font-serif italic text-sky-300">
                    Concealed mathematical congruence lines illuminated!
                  </p>
                </motion.div>
              </div>
            )}

            {/* 4. EXPECTO PATRONUM: RADIANT SILVER PATRONUS ASCENSION */}
            {activeCastSpell.animationType === 'patronus' && (
              <div className="relative flex flex-col items-center">
                {/* Silver Mist Billow */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.5, 2.2], opacity: [0, 0.9, 0.3] }}
                  transition={{ duration: 2.2 }}
                  className="absolute h-[550px] w-[550px] rounded-full bg-gradient-radial from-slate-100 via-indigo-300/30 to-transparent blur-2xl pointer-events-none"
                />

                <motion.div
                  initial={{ scale: 0.3, y: 40, opacity: 0 }}
                  animate={{ scale: [0.3, 1.2, 1], y: [40, -10, 0], opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="relative z-10 h-32 w-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-[0_0_90px_#ffffff,0_0_120px_#a5b4fc]"
                >
                  <img
                    src={ASSETS.phoenixCrest}
                    alt="Silver Patronus"
                    className="h-full w-full object-cover filter brightness-150 contrast-125"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative z-10 mt-5 text-center space-y-1"
                >
                  <h3 className="font-cinzel text-3xl font-black text-slate-100 tracking-widest uppercase drop-shadow-[0_0_30px_#ffffff]">
                    ✦ Expecto Patronum! ✦
                  </h3>
                  <p className="text-sm font-serif italic text-slate-200">
                    The silver guardian sweeps darkness from the sanctum!
                  </p>
                </motion.div>
              </div>
            )}

            {/* 5. INCENDIO: FIERY PHOENIX FLAME SURGE */}
            {activeCastSpell.animationType === 'incendio' && (
              <div className="relative flex flex-col items-center">
                {/* Fiery Embers Blast */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.4, 2], opacity: [0, 0.9, 0] }}
                  transition={{ duration: 1.8 }}
                  className="absolute h-96 w-96 rounded-full bg-gradient-radial from-orange-500 via-red-600/40 to-transparent blur-xl pointer-events-none"
                />

                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 h-28 w-28 rounded-2xl bg-[#200806] border-4 border-orange-500 shadow-[0_0_70px_#ea580c] flex items-center justify-center text-orange-400"
                >
                  <Flame className="h-16 w-16 animate-pulse" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 mt-5 text-center space-y-1"
                >
                  <h3 className="font-cinzel text-3xl font-black text-orange-400 tracking-widest uppercase drop-shadow-[0_0_25px_#f97316]">
                    ✦ Incendio! ✦
                  </h3>
                  <p className="text-sm font-serif italic text-amber-200">
                    Phoenix flames surge with unstoppable warmth!
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
