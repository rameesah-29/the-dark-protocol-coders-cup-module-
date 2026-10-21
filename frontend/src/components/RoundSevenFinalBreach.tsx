import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Award,
  Check,
  ChevronRight,
  FileCode2,
  Activity
} from 'lucide-react';
import { TeamProfile } from '../types';
import { sound } from '../utils/audio';

interface RoundSevenFinalBreachProps {
  currentTeam: TeamProfile | null;
  remainingSeconds: number;
  isTimerRunning: boolean;
  onAwardPoints?: (pts: number) => void;
  onOpenRoadmap?: () => void;
  onNavigateToPensieve?: () => void;
}

type Stage = 'stage1_locked' | 'stage2_signal_accepted' | 'stage3_terminal' | 'stage4_overriding' | 'stage5_victory';

export const RoundSevenFinalBreach: React.FC<RoundSevenFinalBreachProps> = ({
  currentTeam,
  remainingSeconds,
  isTimerRunning,
  onAwardPoints,
  onOpenRoadmap,
  onNavigateToPensieve,
}) => {
  // Current escape stage
  const [stage, setStage] = useState<Stage>('stage1_locked');

  // Stage 1: Signal Token input
  const [signalTokenInput, setSignalTokenInput] = useState('');
  const [isVerifyingSignal, setIsVerifyingSignal] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);
  const [signalShake, setSignalShake] = useState(false);

  // Stage 3: Two Final Terminal Credentials
  const [systemHashInput, setSystemHashInput] = useState('');
  const [corridorKeyInput, setCorridorKeyInput] = useState('');

  const [isHashVerified, setIsHashVerified] = useState(false);
  const [isKeyVerified, setIsKeyVerified] = useState(false);

  const [isVerifyingHash, setIsVerifyingHash] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  const [hashError, setHashError] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [hashShake, setHashShake] = useState(false);
  const [keyShake, setKeyShake] = useState(false);

  // Stage 4: Overriding animation state
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideProgress, setOverrideProgress] = useState(0);
  const [overrideStepText, setOverrideStepText] = useState('Initiating cryptographic bypass...');

  // Stage 5: Victory details from server
  const [victoryStats, setVictoryStats] = useState<{
    teamName: string;
    completionTime: string;
    finalScore: number;
  }>({
    teamName: currentTeam?.teamName || 'Squad Vanguard',
    completionTime: '45m 12s',
    finalScore: currentTeam?.score || 1850,
  });

  // Calculate formatted countdown string (MM:SS)
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(Math.max(0, totalSecs) / 60);
    const secs = Math.max(0, totalSecs) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Determine urgency tier based on remaining time from 90:00 (5400s)
  const getTimerUrgency = () => {
    if (remainingSeconds <= 300) return 'critical'; // < 5 mins
    if (remainingSeconds <= 900) return 'warning'; // < 15 mins
    return 'normal';
  };
  const urgency = getTimerUrgency();

  // =========================================================================
  // STAGE 1: SUBMIT SIGNAL TOKEN
  // =========================================================================
  const handleVerifySignal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = signalTokenInput.trim();
    if (!cleanToken) {
      setSignalError('Please enter the Signal Token to unseal the perimeter.');
      setSignalShake(true);
      setTimeout(() => setSignalShake(false), 600);
      return;
    }

    setIsVerifyingSignal(true);
    setSignalError(null);

    try {
      const res = await fetch('/api/round7/verify-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken }),
      });
      const data = await res.json();

      if (data.ok) {
        sound.playSealCrack();
        sound.playChamberUnlockTone();
        setStage('stage2_signal_accepted');
      } else {
        sound.playError();
        setSignalError(data.message || 'Signal Token rejected. Verify character sequence from Round 6.');
        setSignalShake(true);
        setTimeout(() => setSignalShake(false), 600);
      }
    } catch {
      // Offline fallback check for competition resilience
      if (cleanToken.toLowerCase() === 'esc731ape') {
        sound.playSealCrack();
        sound.playChamberUnlockTone();
        setStage('stage2_signal_accepted');
      } else {
        sound.playError();
        setSignalError('Signal Token rejected. Check the Tower Radio Array payload.');
        setSignalShake(true);
        setTimeout(() => setSignalShake(false), 600);
      }
    } finally {
      setIsVerifyingSignal(false);
    }
  };

  // Transition from Stage 2 to Stage 3 Terminal
  const handleProceedToTerminal = () => {
    sound.playSparkle();
    setStage('stage3_terminal');
  };

  // =========================================================================
  // STAGE 3: VERIFY INDIVIDUAL CREDENTIALS
  // =========================================================================
  const handleVerifyHash = async () => {
    const clean = systemHashInput.trim();
    if (!clean) {
      setHashError('System Hash is required.');
      setHashShake(true);
      setTimeout(() => setHashShake(false), 600);
      return;
    }

    setIsVerifyingHash(true);
    setHashError(null);

    try {
      const res = await fetch('/api/round7/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'systemHash', value: clean }),
      });
      const data = await res.json();

      if (data.ok) {
        sound.playSuccess();
        setIsHashVerified(true);
      } else {
        sound.playError();
        setHashError('Invalid System Hash. Verification failed against Yard Isolation airlock records.');
        setHashShake(true);
        setTimeout(() => setHashShake(false), 600);
      }
    } catch {
      if (clean.toLowerCase() === 'a7f9b2c4e1') {
        sound.playSuccess();
        setIsHashVerified(true);
      } else {
        sound.playError();
        setHashError('Invalid System Hash. Verify the 10-character slice from Round 5.');
        setHashShake(true);
        setTimeout(() => setHashShake(false), 600);
      }
    } finally {
      setIsVerifyingHash(false);
    }
  };

  const handleVerifyCorridorKey = async () => {
    const clean = corridorKeyInput.trim();
    if (!clean) {
      setKeyError('Corridor Key is required.');
      setKeyShake(true);
      setTimeout(() => setKeyShake(false), 600);
      return;
    }

    setIsVerifyingKey(true);
    setKeyError(null);

    try {
      const res = await fetch('/api/round7/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'corridorKey', value: clean }),
      });
      const data = await res.json();

      if (data.ok) {
        sound.playSuccess();
        setIsKeyVerified(true);
      } else {
        sound.playError();
        setKeyError('Invalid Corridor Key. Matrix transformation failed to produce required eigenvalue.');
        setKeyShake(true);
        setTimeout(() => setKeyShake(false), 600);
      }
    } catch {
      const valid = ['eigen_token_omega', 'eigen-token-omega', 'eigen-alohomora', 'eigen_alohomora', 'matrix_transform'];
      if (valid.includes(clean.toLowerCase())) {
        sound.playSuccess();
        setIsKeyVerified(true);
      } else {
        sound.playError();
        setKeyError('Invalid Corridor Key. Check the Security Matrix round key.');
        setKeyShake(true);
        setTimeout(() => setKeyShake(false), 600);
      }
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Both credentials must be genuine
  const bothCredentialsVerified = isHashVerified && isKeyVerified;

  // =========================================================================
  // STAGE 4 & 5: OVERRIDE MAIN GATE
  // =========================================================================
  const handleOverrideMainGate = async () => {
    if (!bothCredentialsVerified || isOverriding) return;

    sound.playWandSpellCast();
    setIsOverriding(true);
    setStage('stage4_overriding');
    setOverrideProgress(15);
    setOverrideStepText('Aligning ancient rune matrix across iron gateway...');

    try {
      // Step 1: Rune alignment
      setTimeout(() => {
        sound.playSparkle();
        setOverrideProgress(40);
        setOverrideStepText('Collapsing dark perimeter security ward & anti-magic dampeners...');
      }, 900);

      // Step 2: Calling server to validate & award victory
      const res = await fetch('/api/round7/override-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemHash: systemHashInput.trim(),
          corridorKey: corridorKeyInput.trim(),
          remainingSeconds,
          teamId: currentTeam?.id,
          teamName: currentTeam?.teamName,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        sound.playChamberUnlockTone();
        setOverrideProgress(75);
        setOverrideStepText('Disengaging deadbolts · Massive fortress gates opening outward...');
      }, 1900);

      setTimeout(() => {
        setOverrideProgress(100);
        sound.playPhoenixAscension();
        sound.playGoldCoinsCascade(24);

        if (data.ok) {
          setVictoryStats({
            teamName: data.teamName || currentTeam?.teamName || 'Squad Vanguard',
            completionTime: data.completionTime || `${Math.floor((5400 - remainingSeconds) / 60)}m ${(5400 - remainingSeconds) % 60}s`,
            finalScore: data.finalScore || (currentTeam ? currentTeam.score + 500 : 2350),
          });
          if (onAwardPoints && data.scoreEarned) {
            onAwardPoints(data.scoreEarned);
          }
        }
        setStage('stage5_victory');
        setIsOverriding(false);
      }, 3200);

    } catch {
      // Fallback
      setTimeout(() => {
        setOverrideProgress(100);
        sound.playPhoenixAscension();
        const elapsedSecs = Math.max(0, 5400 - remainingSeconds);
        const mm = Math.floor(elapsedSecs / 60);
        const ss = elapsedSecs % 60;
        setVictoryStats({
          teamName: currentTeam?.teamName || 'Squad Vanguard',
          completionTime: `${mm}m ${ss.toString().padStart(2, '0')}s`,
          finalScore: (currentTeam?.score || 1850) + 500,
        });
        if (onAwardPoints) onAwardPoints(500);
        setStage('stage5_victory');
        setIsOverriding(false);
      }, 3200);
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between select-none">
      
      {/* =====================================================================
          TOP HEADER: CINEMATIC CYBER-WIZARDING COMMAND BAR
          ===================================================================== */}
      <div className="w-full mb-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#c59b27]/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0a182c]/80 border border-cyan-500/40 text-[11px] font-mono tracking-widest text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>DARK PROTOCOL</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-stone-950/80 border border-slate-700 text-[11px] font-mono text-slate-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>PERIMETER SECURITY</span>
            </div>
          </div>

          {/* Connected 90-Minute Mission Countdown */}
          <div
            className={`flex items-center gap-2.5 px-4 py-1.5 rounded-lg border font-mono transition-all backdrop-blur-md ${
              urgency === 'critical'
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                : urgency === 'warning'
                ? 'bg-amber-950/90 border-amber-500/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-[#050e1c]/90 border-[#c59b27]/50 text-amber-200 shadow-[0_0_15px_rgba(197,155,39,0.25)]'
            }`}
          >
            <Clock className="w-4 h-4 text-[#f3d069]" />
            <span className="text-xs font-serif font-bold text-[#fef08a] uppercase tracking-wider">
              MISSION TIME:
            </span>
            <span className="text-base font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
              {formatTimer(remainingSeconds)}
            </span>
            {isTimerRunning ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Timer Active" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5" title="Timer Standby" />
            )}
          </div>
        </div>

        {/* Hero Title & Mission Briefing */}
        <div className="text-center pt-5 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <span className="text-xs sm:text-sm font-serif font-bold tracking-[0.35em] text-[#f59e0b] uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
              THE CLIMAX OF THE GREAT ESCAPE
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-5xl font-serif font-black tracking-[0.16em] text-white uppercase mt-1"
              style={{
                fontFamily: "var(--font-cinzel), 'Cinzel Decorative', Georgia, serif",
                textShadow: '0 0 35px rgba(56, 189, 248, 0.45), 0 4px 18px rgba(0,0,0,0.95)',
              }}
            >
              ROUND VII — THE FINAL BREACH
            </h2>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#c59b27] to-transparent mx-auto mt-2" />
          </motion.div>

          <p className="text-xs sm:text-sm text-slate-300 font-serif italic max-w-2xl mx-auto mt-2">
            “Three credentials. One final gate. Escape before the lockdown returns.”
          </p>
        </div>
      </div>

      {/* =====================================================================
          STAGE 1: LOCKED GATE & SIGNAL TOKEN INPUT
          ===================================================================== */}
      {stage === 'stage1_locked' && (
        <motion.div
          key="stage1"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6"
        >
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-xs font-mono font-bold text-rose-300 shadow-md">
              <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>GATE STATUS: SEALED</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/60 text-xs font-mono font-bold text-amber-300 shadow-md">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>LOCKDOWN STATUS: ACTIVE</span>
            </div>
          </div>

          {/* The Large Enchanted Prison Gate (Centrepiece) */}
          <div className="relative w-full max-w-2xl aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-[#030814] shadow-[0_0_50px_rgba(2,132,199,0.3)] flex items-center justify-center">
            {/* Prison Corridor & Gate Backdrop */}
            <img
              src="/src/assets/images/prison_corridor_bg_1792087271379.jpg"
              alt="Sealed Perimeter Gate"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35] contrast-[1.3] scale-105"
            />
            {/* Atmospheric Blue Wash */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030814] via-transparent to-[#020612]/80" />

            {/* Heavy Iron Portcullis Gate Bars (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
              viewBox="0 0 800 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Gothic Stone Archway Outline */}
              <path
                d="M 120 450 L 120 220 Q 400 40 680 220 L 680 450"
                stroke="#1e293b"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 120 220 Q 400 40 680 220"
                stroke="#0284c7"
                strokeWidth="4"
                strokeDasharray="8 8"
                className="animate-pulse"
                opacity="0.7"
              />

              {/* Vertical Iron Spikes & Bars */}
              {[180, 240, 300, 360, 400, 440, 500, 560, 620].map((x, i) => (
                <g key={`bar-${i}`}>
                  <line x1={x} y1="80" x2={x} y2="450" stroke="#0f172a" strokeWidth="12" />
                  <line x1={x} y1="80" x2={x} y2="450" stroke="#334155" strokeWidth="6" />
                  <line x1={x - 2} y1="80" x2={x - 2} y2="450" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
                  {/* Pointed bottom/top spears */}
                  <polygon points={`${x},65 ${x - 6},80 ${x + 6},80`} fill="#475569" />
                </g>
              ))}

              {/* Horizontal Reinforcing Crossbeams with Iron Rivets */}
              {[160, 260, 360].map((y, i) => (
                <g key={`cross-${i}`}>
                  <rect x="130" y={y} width="540" height="14" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                  <line x1="130" y1={y + 7} x2="670" y2={y + 7} stroke="#475569" strokeWidth="2" opacity="0.5" />
                  {[180, 240, 300, 360, 400, 440, 500, 560, 620].map((rx, ri) => (
                    <circle key={`riv-${ri}`} cx={rx} cy={y + 7} r="3.5" fill="#94a3b8" stroke="#0f172a" />
                  ))}
                </g>
              ))}
            </svg>

            {/* Glowing Blue Ancient Runes & Magical Seals */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Central Arcane Lock Keystone */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-cyan-400/80 bg-[#061426]/90 flex items-center justify-center shadow-[0_0_35px_rgba(56,189,248,0.7)] backdrop-blur-md">
                {/* Rotating Runic Inscriptions */}
                <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-300/50 animate-spin-slow pointer-events-none" />
                
                {/* Runic glyphs around circumference */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'].map((rune, i) => {
                    const angle = (i * 360) / 8;
                    return (
                      <span
                        key={i}
                        className="absolute text-cyan-300 font-cinzel text-xs font-bold"
                        style={{
                          transform: `rotate(${angle}deg) translate(50px) rotate(-${angle}deg)`,
                          textShadow: '0 0 8px rgba(56,189,248,0.9)',
                        }}
                      >
                        {rune}
                      </span>
                    );
                  })}
                </div>

                {/* Central Sealed Lock Emblem */}
                <div className="flex flex-col items-center justify-center">
                  <Lock className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
                  <span className="text-[10px] font-mono tracking-widest text-cyan-200 uppercase mt-1">
                    SEALED
                  </span>
                </div>
              </div>

              {/* Security Barrier Status Hologram */}
              <div className="mt-4 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.4)] backdrop-blur-md">
                <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  PERIMETER WARD ACTIVE · 0/3 CREDENTIALS
                </span>
              </div>
            </div>

            {/* Subtle floating sparks and dust particles */}
            <div className="absolute bottom-2 left-6 text-cyan-400/40 font-mono text-[10px]">✦ ᚱ ✦</div>
            <div className="absolute bottom-3 right-8 text-cyan-400/40 font-mono text-[10px]">✦ ᚦ ✦</div>
          </div>

          {/* Parchment-Textured Instruction Card */}
          <div className="w-full max-w-xl p-5 rounded-2xl bg-gradient-to-b from-[#091526] to-[#040914] border border-[#c59b27]/40 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-[#f3d069]">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-cinzel text-sm sm:text-base font-bold tracking-wider text-[#fef9c3]">
                PERIMETER ACCESS VERIFICATION
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
              “The perimeter remains sealed. Present the Signal Token recovered from the Tower Radio Array to unlock the final terminal.”
            </p>

            {/* Input Form */}
            <form onSubmit={handleVerifySignal} className="space-y-3 pt-1">
              <div className="relative">
                <label className="block text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase text-left mb-1.5">
                  SIGNAL TOKEN
                </label>
                <div
                  className={`relative flex items-center rounded-xl bg-[#030712] border transition-all ${
                    signalError
                      ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'border-cyan-500/50 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                  } ${signalShake ? 'animate-shake' : ''}`}
                >
                  <div className="pl-3.5 pr-2 text-cyan-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signalTokenInput}
                    onChange={(e) => {
                      setSignalTokenInput(e.target.value);
                      if (signalError) setSignalError(null);
                    }}
                    placeholder="Enter the decoded signal token..."
                    className="w-full py-2.5 pr-4 bg-transparent font-mono text-sm text-white placeholder-slate-500 focus:outline-none"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {signalTokenInput && (
                    <button
                      type="button"
                      onClick={() => setSignalTokenInput('')}
                      className="pr-3 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {signalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 mt-2 text-xs font-mono text-rose-300 text-left"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{signalError}</span>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyingSignal}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-600 hover:from-cyan-500 hover:to-sky-400 text-slate-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)] cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isVerifyingSignal ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>SYNCHRONIZING RADIO SENSORS...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>UNSEAL THE PERIMETER</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          STAGE 2: SIGNAL TOKEN ACCEPTED & ANIMATION REVEAL
          ===================================================================== */}
      {stage === 'stage2_signal_accepted' && (
        <motion.div
          key="stage2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-6 text-center"
        >
          {/* Animated Emerald Gate Visual */}
          <div className="relative w-full max-w-xl aspect-[16/9] rounded-2xl overflow-hidden border-2 border-emerald-400 bg-[#02130e] shadow-[0_0_50px_rgba(16,185,129,0.5)] flex items-center justify-center">
            <img
              src="/src/assets/images/prison_corridor_bg_1792087271379.jpg"
              alt="Perimeter Unsealed"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-[1.2]"
            />
            {/* Emerald Light Spread & Magical Mist Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent"
            />

            {/* Glowing Emerald Runes */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-24 h-24 rounded-full border-2 border-emerald-400 bg-emerald-950/90 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.8)]"
              >
                <Unlock className="w-10 h-10 text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]" />
              </motion.div>
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase mt-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50">
                RUNES ALIGNED · PERIMETER UNSEALED
              </span>
            </div>
          </div>

          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#061a14] to-[#030d0a] border-2 border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.35)] space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
              <h3 className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-emerald-200">
                SIGNAL TOKEN VERIFIED!
              </h3>
            </div>
            <p className="text-sm sm:text-base font-serif text-slate-200 leading-relaxed">
              The perimeter gate is now unlocked.
              <br />
              <span className="text-emerald-300 font-bold">Proceed to the final terminal.</span>
            </p>

            <div className="pt-3">
              <button
                onClick={handleProceedToTerminal}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cinzel font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>OPEN FINAL TERMINAL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* =====================================================================
          STAGE 3: THE FINAL TERMINAL (TWO CREDENTIAL FIELDS)
          ===================================================================== */}
      {stage === 'stage3_terminal' && (
        <motion.div
          key="stage3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-5xl mx-auto space-y-6"
        >
          {/* Terminal Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-[#071322] via-[#091b2c] to-[#071322] border border-cyan-500/40 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide">
                  CENTRAL PRISON OVERRIDE TERMINAL
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Authentication protocol requires two verified master keys to engage Main Gate hydraulics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300">
                Credentials Verified:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  bothCredentialsVerified
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse'
                    : isHashVerified || isKeyVerified
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {[isHashVerified, isKeyVerified].filter(Boolean).length} / 2
              </span>
            </div>
          </div>

          {/* Main Terminal Layout: Left Credentials Form & Right Status Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Columns: Two Credential Fields & Override Trigger */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* FIELD 01: SYSTEM HASH */}
              <div
                className={`p-5 rounded-2xl bg-gradient-to-b from-[#081526] to-[#040b15] border transition-all ${
                  isHashVerified
                    ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : hashError
                    ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'border-[#c59b27]/40'
                } ${hashShake ? 'animate-shake' : ''}`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isHashVerified
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      }`}
                    >
                      01
                    </div>
                    <div>
                      <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#fef9c3] tracking-wider">
                        FIELD 01: SYSTEM HASH
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-[#f59e0b] font-serif italic">
                        Helper text: Earned from Round 5.
                      </p>
                    </div>
                  </div>

                  {isHashVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-[10px] font-mono font-bold text-emerald-300">
                      <Check className="w-3 h-3" /> VERIFIED
                    </span>
                  )}
                </div>

                <div className="mt-3.5 space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled={isHashVerified}
                      value={systemHashInput}
                      onChange={(e) => {
                        setSystemHashInput(e.target.value);
                        if (hashError) setHashError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyHash();
                      }}
                      placeholder="Enter the 10-character hash credential..."
                      className={`w-full py-2.5 px-4 rounded-xl bg-[#030712] border font-mono text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                        isHashVerified
                          ? 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300 cursor-not-allowed'
                          : 'border-slate-700 focus:border-cyan-400'
                      }`}
                      autoComplete="off"
                      spellCheck="false"
                    />

                    {!isHashVerified && (
                      <button
                        type="button"
                        onClick={handleVerifyHash}
                        disabled={isVerifyingHash || !systemHashInput.trim()}
                        className="absolute right-2 px-3 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                      >
                        {isVerifyingHash ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                  </div>

                  {hashError && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{hashError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* FIELD 02: CORRIDOR KEY */}
              <div
                className={`p-5 rounded-2xl bg-gradient-to-b from-[#081526] to-[#040b15] border transition-all ${
                  isKeyVerified
                    ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : keyError
                    ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'border-[#c59b27]/40'
                } ${keyShake ? 'animate-shake' : ''}`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isKeyVerified
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      }`}
                    >
                      02
                    </div>
                    <div>
                      <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#fef9c3] tracking-wider">
                        FIELD 02: CORRIDOR KEY
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-[#f59e0b] font-serif italic">
                        Helper text: Earned from the Security Matrix round.
                      </p>
                    </div>
                  </div>

                  {isKeyVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-[10px] font-mono font-bold text-emerald-300">
                      <Check className="w-3 h-3" /> VERIFIED
                    </span>
                  )}
                </div>

                <div className="mt-3.5 space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled={isKeyVerified}
                      value={corridorKeyInput}
                      onChange={(e) => {
                        setCorridorKeyInput(e.target.value);
                        if (keyError) setKeyError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyCorridorKey();
                      }}
                      placeholder="Enter the matrix-derived key..."
                      className={`w-full py-2.5 px-4 rounded-xl bg-[#030712] border font-mono text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                        isKeyVerified
                          ? 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300 cursor-not-allowed'
                          : 'border-slate-700 focus:border-cyan-400'
                      }`}
                      autoComplete="off"
                      spellCheck="false"
                    />

                    {!isKeyVerified && (
                      <button
                        type="button"
                        onClick={handleVerifyCorridorKey}
                        disabled={isVerifyingKey || !corridorKeyInput.trim()}
                        className="absolute right-2 px-3 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                      >
                        {isVerifyingKey ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                  </div>

                  {keyError && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{keyError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* OVERRIDE MAIN GATE (Prominent Action Button) */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!bothCredentialsVerified || isOverriding}
                  onClick={handleOverrideMainGate}
                  className={`w-full py-4 px-6 rounded-2xl font-cinzel font-black text-sm sm:text-base tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                    bothCredentialsVerified
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.8)] hover:shadow-[0_0_45px_rgba(16,185,129,1)] cursor-pointer hover:scale-[1.01] animate-pulse'
                      : 'bg-[#0f172a] text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                  }`}
                >
                  {bothCredentialsVerified ? (
                    <>
                      <Zap className="w-5 h-5 text-slate-950 fill-current animate-bounce" />
                      <span>OVERRIDE MAIN GATE</span>
                      <Sparkles className="w-5 h-5 text-slate-950" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-slate-600" />
                      <span>OVERRIDE MAIN GATE (LOCKED)</span>
                    </>
                  )}
                </button>
                {!bothCredentialsVerified && (
                  <p className="text-[11px] font-serif italic text-slate-400 text-center mt-2">
                    Both Field 01 and Field 02 must be verified to authorize main perimeter override.
                  </p>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Terminal Status Panel */}
            <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-[#091526] to-[#040914] border border-[#c59b27]/40 p-5 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-[#f3d069]">
                  <Activity className="w-4 h-4" />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#fef9c3]">
                    LIVE SECURITY TELEMETRY
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-xs font-mono">
                  {/* Lockdown Status */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                    <span className="text-slate-400">Lockdown Status:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>

                  {/* Verified Credentials */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                    <span className="text-slate-400">Verified Credentials:</span>
                    <span
                      className={`font-bold ${
                        bothCredentialsVerified ? 'text-emerald-400' : 'text-cyan-400'
                      }`}
                    >
                      {[isHashVerified, isKeyVerified].filter(Boolean).length} of 2
                    </span>
                  </div>

                  {/* Gate Status */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                    <span className="text-slate-400">Gate Status:</span>
                    <span
                      className={`font-bold ${
                        bothCredentialsVerified ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {bothCredentialsVerified ? 'OVERRIDE READY' : 'INTERLOCKED'}
                    </span>
                  </div>

                  {/* Remaining Mission Time */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                    <span className="text-slate-400">Mission Clock:</span>
                    <span className="font-bold text-white tracking-wider">
                      {formatTimer(remainingSeconds)}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Lights */}
                <div className="mt-5 p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    RUNE CIRCUITS
                  </div>
                  <div className="flex items-center justify-around pt-1">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${
                          isHashVerified
                            ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                            : 'bg-slate-700'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-slate-400">HASH 01</span>
                    </div>

                    <div className="h-0.5 w-12 bg-slate-800" />

                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${
                          isKeyVerified
                            ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                            : 'bg-slate-700'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-slate-400">KEY 02</span>
                    </div>

                    <div className="h-0.5 w-12 bg-slate-800" />

                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${
                          bothCredentialsVerified
                            ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-ping'
                            : 'bg-slate-700'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-slate-400">MAIN GATE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Profile Snapshot */}
              <div className="p-3 rounded-xl bg-[#040810] border border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Squad:</span>
                  <span className="text-[#fef08a] font-bold">{currentTeam?.teamName || 'Squad Vanguard'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Current Score:</span>
                  <span className="text-emerald-400 font-bold">{currentTeam?.score || 1850} PTS</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          STAGE 4: OVERRIDING ANIMATION SCREEN
          ===================================================================== */}
      {stage === 'stage4_overriding' && (
        <motion.div
          key="stage4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-[#02050c]/95 flex flex-col items-center justify-center p-6 text-center select-none"
        >
          {/* Photorealistic Gateway with Radiant Emerald Light Spreading */}
          <div className="relative w-full max-w-2xl aspect-[16/10] rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.7)] flex items-center justify-center">
            <img
              src="/src/assets/images/gate_final_escape_1792087273561.jpg"
              alt="Gate Overriding"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-[1.2] scale-105"
            />
            <div className="absolute inset-0 bg-radial-at-c from-emerald-500/30 via-transparent to-black/80" />

            {/* Pulsing Emerald Shockwaves */}
            <motion.div
              animate={{ scale: [1, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
              className="w-48 h-48 rounded-full border-4 border-emerald-400 absolute"
            />

            {/* Keystone Rune Convergence */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-emerald-950/90 border-2 border-emerald-300 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.9)] animate-spin-slow">
                <Sparkles className="w-10 h-10 text-emerald-300" />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase mt-4 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/60">
                OVERRIDING PRISON PROTOCOL
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full max-w-md mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">{overrideStepText}</span>
              <span className="text-white font-bold">{overrideProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-emerald-500/40 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 shadow-[0_0_15px_#34d399]"
                animate={{ width: `${overrideProgress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          STAGE 5: DRAMATIC FULL-SCREEN VICTORY SCREEN
          ===================================================================== */}
      {stage === 'stage5_victory' && (
        <motion.div
          key="stage5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 bg-[#02050c] flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-y-auto"
        >
          {/* Majestic Full-Screen Gate Standing Open Backdrop */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <img
              src="/src/assets/images/gate_final_escape_1792087273561.jpg"
              alt="Perimeter Gate Unlocked"
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.15]"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050c] via-[#02050c]/50 to-transparent" />
            <div className="absolute inset-0 bg-radial-at-c from-emerald-500/20 via-transparent to-[#02050c]/80" />
          </div>

          {/* Top Victory Seal */}
          <div className="relative z-10 w-full flex items-center justify-between pt-2 px-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-emerald-400/50 text-xs font-mono text-emerald-300">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>ROUND VII · FREEDOM EXIT COMPLETED</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-[#c59b27]/50 text-xs font-mono text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>THE DARK PROTOCOL BREACHED</span>
            </div>
          </div>

          {/* Center Stage: Hero Dramatic Text Banner */}
          <div className="relative z-10 max-w-4xl mx-auto text-center py-6 sm:py-10 space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-2"
            >
              <h3
                className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-[0.2em] text-emerald-400 uppercase drop-shadow-[0_0_25px_rgba(52,211,153,0.8)]"
                style={{ fontFamily: "var(--font-cinzel), Georgia, serif" }}
              >
                PERIMETER GATE UNLOCKED!
              </h3>

              <h4
                className="text-lg sm:text-xl md:text-2xl font-serif font-bold tracking-[0.24em] text-teal-200 uppercase drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]"
                style={{ fontFamily: "var(--font-cinzel), Georgia, serif" }}
              >
                LOCKDOWN OVERRIDDEN!
              </h4>

              <h2
                className="text-2xl sm:text-4xl md:text-6xl font-serif font-black tracking-[0.16em] text-[#fef9c3] uppercase pt-2"
                style={{
                  fontFamily: "var(--font-cinzel), 'Cinzel Decorative', Georgia, serif",
                  textShadow: '0 0 35px rgba(254, 240, 138, 0.7), 0 4px 20px rgba(0,0,0,0.95)',
                }}
              >
                YOU HAVE ESCAPED THE DARK PROTOCOL.
              </h2>
            </motion.div>

            {/* Team Victory Dossier Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-black/85 border-2 border-[#c59b27] shadow-[0_0_40px_rgba(197,155,39,0.35)] backdrop-blur-md"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
                {/* Team Name */}
                <div className="pt-2 sm:pt-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                    SQUAD IDENTITY
                  </span>
                  <span className="text-base sm:text-lg font-cinzel font-black text-[#fef08a] block">
                    {victoryStats.teamName}
                  </span>
                </div>

                {/* Actual Completion Time */}
                <div className="pt-3 sm:pt-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                    COMPLETION TIME
                  </span>
                  <span className="text-base sm:text-lg font-mono font-bold text-white block">
                    {victoryStats.completionTime}
                  </span>
                </div>

                {/* Final Score */}
                <div className="pt-3 sm:pt-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                    FINAL SCORE
                  </span>
                  <span className="text-base sm:text-xl font-mono font-black text-emerald-400 block drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]">
                    {victoryStats.finalScore} PTS
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Action Navigation */}
          <div className="relative z-10 pb-4 flex flex-wrap items-center justify-center gap-4">
            {onOpenRoadmap && (
              <button
                onClick={onOpenRoadmap}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-900 to-sky-950 hover:from-cyan-800 hover:to-sky-900 border border-cyan-400/80 text-cyan-200 font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>VIEW 7 GATES ROADMAP</span>
              </button>
            )}

            {onNavigateToPensieve && (
              <button
                onClick={onNavigateToPensieve}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-900 to-amber-950 hover:from-amber-800 hover:to-amber-900 border border-[#c59b27]/80 text-[#fef08a] font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#f3d069]" />
                <span>INSPECT PENSIEVE ARCHIVES</span>
              </button>
            )}

            <button
              onClick={() => setStage('stage3_terminal')}
              className="py-3 px-4 rounded-xl bg-black/60 hover:bg-black/90 border border-slate-700 text-slate-300 font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Terminal</span>
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
