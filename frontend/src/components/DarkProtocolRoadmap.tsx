import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Shield,
  AlertOctagon,
  Key,
  FileCode2,
  Lock,
  Unlock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Compass,
  ArrowLeft,
  Terminal,
  Activity
} from 'lucide-react';
import { ROADMAP_GATES, GateInfo, GateStatus, PRISON_CORRIDOR_BG } from '../data/roadmapData';
import { GateArtwork } from './GateArtwork';
import { GateDetailModal } from './GateDetailModal';
import { sound } from '../utils/audio';

interface DarkProtocolRoadmapProps {
  onBackToGrimoire?: () => void;
  onEnterPortal?: () => void;
  initialRemainingSeconds?: number;
  remainingSeconds?: number;
  isTimerRunning?: boolean;
  isLoggedIn?: boolean;
  onToggleTimer?: () => void;
}

export const DarkProtocolRoadmap: React.FC<DarkProtocolRoadmapProps> = ({
  onBackToGrimoire,
  onEnterPortal,
  initialRemainingSeconds = 90 * 60, // 90:00 as specified
  remainingSeconds,
  isTimerRunning = false,
  isLoggedIn = false,
  onToggleTimer,
}) => {
  // Gate statuses
  const [gateStatuses, setGateStatuses] = useState<Record<number, GateStatus>>(() => {
    const initial: Record<number, GateStatus> = {};
    ROADMAP_GATES.forEach((g) => {
      initial[g.id] = g.defaultStatus;
    });
    return initial;
  });

  // Active modal inspection
  const [selectedGate, setSelectedGate] = useState<GateInfo | null>(null);
  const [hoveredGateId, setHoveredGateId] = useState<number | null>(null);

  // 90:00 Countdown Timer - Only runs when login is done (isLoggedIn && isTimerRunning)
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds ?? initialRemainingSeconds);

  useEffect(() => {
    if (remainingSeconds !== undefined) {
      setSecondsLeft(remainingSeconds);
    }
  }, [remainingSeconds]);

  useEffect(() => {
    // Timer only counts down when login is completed!
    if (!isLoggedIn || !isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleUpdateStatus = (gateId: number, newStatus: GateStatus) => {
    setGateStatuses((prev) => ({
      ...prev,
      [gateId]: newStatus,
    }));
  };

  const handleGateClick = (gate: GateInfo) => {
    sound.playWandSpellCast();
    setSelectedGate(gate);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#02050b] text-slate-100 flex flex-col justify-between overflow-x-auto overflow-y-auto select-none">
      {/* ========================================================= */}
      {/* 1. CINEMATIC DARK FANTASY PRISON CORRIDOR ENVIRONMENT     */}
      {/* Inspired by Harry Potter, gothic dungeons & sci-fi AI     */}
      {/* ========================================================= */}
      
      {/* Photorealistic Ancient Stone Prison Corridor Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={PRISON_CORRIDOR_BG}
          alt="Ancient Prison Corridor"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-[0.38] contrast-[1.25] saturate-[0.9]"
        />
        {/* Cinematic Vignette, Dark Fog and Atmosphere Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050b] via-[#02050b]/70 to-[#030814]/80" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#02050b]/40 to-[#010307]/95" />
      </div>

      {/* Atmospheric Cold Blue Moonlight Overhead Wash */}
      <div className="fixed top-0 inset-x-0 h-80 pointer-events-none z-0 bg-gradient-to-b from-sky-950/30 via-slate-900/10 to-transparent" />

      {/* Top Floating Quick Navigation Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 pt-3 pb-1 flex items-center justify-between">
        {/* Left: Quick Back Navigation */}
        <div className="flex items-center gap-2">
          {onBackToGrimoire && (
            <button
              onClick={onBackToGrimoire}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black border border-slate-700/80 hover:border-amber-500/60 text-xs font-mono text-slate-300 hover:text-amber-300 transition-all shadow-xl backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Grimoire</span>
            </button>
          )}
          {onEnterPortal && (
            <button
              onClick={onEnterPortal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black border border-slate-700/80 hover:border-cyan-500/60 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-all shadow-xl backdrop-blur-md"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Enter Portal Hub</span>
            </button>
          )}
        </div>

        {/* Right: Tactical Security Status Header */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div
            onClick={() => {
              window.location.hash = '#admin';
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-black/60 border border-slate-800 text-[11px] text-slate-400 cursor-pointer hover:border-amber-500/50 transition"
            title="Overseer Console (Staff shortcut: Ctrl+Shift+A)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-widest uppercase font-semibold text-slate-300">
              PRISON SECURITY GRID: ENGAGED
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN TITLE AND HEADER (EXACT VISUAL REFERENCE MATCH)   */}
      {/* ========================================================= */}
      <section className="relative z-20 w-full px-4 sm:px-8 pt-1 pb-3">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-4">
          
          {/* Top-Left Corner: Inscribed Quotation (Atmospheric Dark Tablet Style) */}
          <div className="md:col-span-3 text-center md:text-left order-2 md:order-1">
            <div className="inline-block relative">
              <p
                className="text-lg sm:text-xl md:text-[22px] text-slate-200 tracking-wide italic font-serif"
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 12px rgba(56,189,248,0.25)',
                }}
              >
                “Six doors. Seven challenges. One way out.”
              </p>
              <div className="w-full h-[1px] bg-gradient-to-r from-cyan-500/50 via-slate-500/30 to-transparent mt-1.5" />
            </div>
          </div>

          {/* Top Center: Main Title, Decorative Geometric Frame & Subtitle */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center order-1 md:order-2">
            
            {/* Main Title: THE DARK PROTOCOL */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-serif font-black tracking-[0.24em] text-[#dbeafe] uppercase"
              style={{
                fontFamily: "var(--font-cinzel), 'Cinzel Decorative', Georgia, serif",
                textShadow: '0 0 28px rgba(56, 189, 248, 0.65), 0 4px 18px rgba(0,0,0,0.95)',
              }}
            >
              THE DARK PROTOCOL
            </h1>

            {/* Decorative Geometric Frame with Subtitle: THE AI LOCKDOWN */}
            <div className="relative mt-2 mb-1 px-8 py-1.5 flex items-center justify-center">
              {/* Outer Cyan Geometric Border with Angled Corners */}
              <div
                className="absolute inset-0 border border-cyan-400/80 bg-[#031326]/90 backdrop-blur-md"
                style={{
                  clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.5), inset 0 0 14px rgba(56, 189, 248, 0.25)',
                }}
              />
              <span
                className="relative z-10 text-xs sm:text-sm font-sans font-extrabold tracking-[0.32em] text-[#38bdf8] uppercase drop-shadow-[0_0_12px_rgba(56,189,248,0.95)]"
              >
                THE AI LOCKDOWN
              </span>
            </div>

            {/* Gold Serif Roadmap Label */}
            <span
              className="text-[11px] sm:text-xs font-serif font-bold tracking-[0.42em] text-[#f59e0b] uppercase mt-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]"
              style={{
                fontFamily: "var(--font-cinzel), Georgia, serif",
              }}
            >
              GAME ROADMAP
            </span>
          </div>

          {/* Top-Right Corner: Ornate Dark Panel with Gold Border and 90:00 Countdown */}
          <div className="md:col-span-3 flex justify-center md:justify-end order-3">
            <div
              className="relative px-5 py-2.5 rounded-lg bg-[#050b18]/95 border border-[#d4af37] shadow-2xl flex items-center gap-3.5 backdrop-blur-md"
              style={{
                boxShadow: '0 0 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(254, 240, 138, 0.35)',
              }}
            >
              {/* Ornate Gold Filigree Corner Rivets */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#f3d069] absolute top-1 left-1 shadow-[0_0_4px_#f3d069]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#f3d069] absolute top-1 right-1 shadow-[0_0_4px_#f3d069]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#f3d069] absolute bottom-1 left-1 shadow-[0_0_4px_#f3d069]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#f3d069] absolute bottom-1 right-1 shadow-[0_0_4px_#f3d069]" />

              {/* Clock Icon in Gold Medallion Badge */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b48c26] to-[#e6bd45] flex items-center justify-center text-stone-950 shadow-md">
                <Clock className="w-5 h-5 stroke-[2.3]" />
              </div>

              {/* Timer Text */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-serif font-bold tracking-[0.22em] text-[#fef08a] uppercase leading-tight">
                    TIME REMAINING
                  </span>
                  {!isLoggedIn && (
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-950/90 border border-amber-500/70 text-amber-300">
                      STANDBY
                    </span>
                  )}
                  {isLoggedIn && isTimerRunning && (
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] leading-none mt-0.5">
                  {formatTimer(secondsLeft)}
                </span>
                {!isLoggedIn ? (
                  <span className="text-[9px] font-serif italic text-amber-200/70 leading-none mt-1">
                    Starts upon squad login
                  </span>
                ) : !isTimerRunning ? (
                  <span className="text-[9px] font-mono text-amber-400 font-semibold leading-none mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                    PAUSED BY OVERSEER
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-emerald-400 leading-none mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE MISSION
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3 & 4. SEVEN GATES HORIZONTAL CORRIDOR & INFORMATION CARDS */}
      {/* Continuous horizontal layout with connected floor path   */}
      {/* ========================================================= */}
      <main className="relative z-20 w-full px-2 sm:px-6 my-1 flex-1 flex flex-col justify-center">
        
        {/* Horizontal Container for all 7 Gates (Panoramic Ratio) */}
        <div className="w-full max-w-[1720px] mx-auto overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          <div className="min-w-[1280px] px-4">
            
            {/* ROW 1: THE SEVEN ARCHITECTURAL GATES */}
            <div className="grid grid-cols-7 gap-3 sm:gap-4 md:gap-5 items-end">
              {ROADMAP_GATES.map((gate) => {
                const status = gateStatuses[gate.id] || gate.defaultStatus;
                const isHovered = hoveredGateId === gate.id;

                return (
                  <div
                    key={gate.id}
                    onMouseEnter={() => setHoveredGateId(gate.id)}
                    onMouseLeave={() => setHoveredGateId(null)}
                    onClick={() => handleGateClick(gate)}
                    className="flex flex-col items-center cursor-pointer group transition-all duration-300 transform group-hover:-translate-y-1"
                  >
                    {/* Gate Architectural Rendering */}
                    <GateArtwork
                      gate={gate}
                      status={status}
                      isHovered={isHovered}
                    />
                  </div>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* 5. CONNECTING PATH ALONG WET PRISON FLOOR                  */}
            {/* Thin continuous glowing blue-white energy trail            */}
            {/* ========================================================= */}
            <div className="relative w-full h-10 -my-2 flex items-center justify-between pointer-events-none">
              
              {/* Wet Stone Floor Specular Horizontal Sheen */}
              <div className="absolute inset-x-0 h-5 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent blur-md" />

              {/* Continuous Glowing Energy Line */}
              <div
                className="absolute inset-x-8 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-200 to-cyan-400 shadow-[0_0_14px_#38bdf8]"
              />

              {/* Pulsing Energy Trail Nodes at Each Gate Center */}
              <div className="relative w-full grid grid-cols-7 px-4">
                {ROADMAP_GATES.map((gate) => {
                  const status = gateStatuses[gate.id];
                  const isCompleted = status === 'completed' || status === 'escaped';

                  return (
                    <div key={`trail-${gate.id}`} className="flex justify-center items-center">
                      <div
                        className="w-4 h-4 rounded-full border border-white/90 flex items-center justify-center transition-all duration-500 shadow-xl"
                        style={{
                          backgroundColor: gate.accentColor,
                          boxShadow: `0 0 12px ${gate.accentColor}, 0 0 24px ${gate.glowColor}`,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 2: THE COMPACT INFORMATION CARDS UNDER EACH GATE */}
            <div className="grid grid-cols-7 gap-3 sm:gap-4 md:gap-5 items-start mt-2">
              {ROADMAP_GATES.map((gate) => {
                const status = gateStatuses[gate.id] || gate.defaultStatus;
                const isHovered = hoveredGateId === gate.id;

                return (
                  <div
                    key={`card-${gate.id}`}
                    onMouseEnter={() => setHoveredGateId(gate.id)}
                    onMouseLeave={() => setHoveredGateId(null)}
                    onClick={() => handleGateClick(gate)}
                    className="relative cursor-pointer group flex flex-col justify-between rounded-xl transition-all duration-300 min-h-[310px] p-3.5 backdrop-blur-md"
                    style={{
                      backgroundColor: 'rgba(3, 8, 19, 0.95)',
                      border: `1.5px solid ${isHovered ? gate.accentColor : `${gate.borderColor}55`}`,
                      boxShadow: isHovered
                        ? `0 0 30px ${gate.glowColor}, 0 12px 32px rgba(0,0,0,0.95)`
                        : '0 8px 24px rgba(0,0,0,0.9)',
                    }}
                  >
                    {/* Top Edge Overlapping Circular Round Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-black text-sm shadow-xl transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: '#030814',
                          border: `2px solid ${gate.borderColor}`,
                          boxShadow: `0 0 14px ${gate.glowColor}`,
                          color: gate.accentColor,
                        }}
                      >
                        {gate.gateNumber}
                      </div>
                    </div>

                    {/* Card Top: Heading & Category */}
                    <div className="pt-2 text-center flex flex-col items-center">
                      <h3
                        className="text-[12px] sm:text-[13px] font-serif font-bold tracking-wider leading-snug line-clamp-2 uppercase mt-1"
                        style={{
                          color: gate.accentColor,
                          textShadow: `0 0 10px ${gate.glowColor}`,
                          fontFamily: "var(--font-cinzel), Georgia, serif",
                        }}
                      >
                        {gate.title}
                      </h3>

                      {/* Category Badge */}
                      <div
                        className="mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border"
                        style={{
                          backgroundColor: gate.lightBgColor,
                          color: gate.accentColor,
                          borderColor: `${gate.borderColor}44`,
                        }}
                      >
                        {gate.category}
                      </div>
                    </div>

                    {/* Card Body: Challenge Description */}
                    <div className="my-2.5 text-center flex-1 flex items-center justify-center">
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-4">
                        {gate.description}
                      </p>
                    </div>

                    {/* Card Meta: Target File & Target Time */}
                    <div className="space-y-1.5 text-[10px] font-mono border-t border-slate-800/90 pt-2">
                      {/* Target File (Hidden for Round 5, Round 6, Round 7 where no file is given) */}
                      {Boolean(
                        gate.file &&
                        gate.file.trim() !== '' &&
                        !gate.file.toLowerCase().includes('no file') &&
                        gate.gateNumber !== 5 &&
                        gate.gateNumber !== 6 &&
                        gate.gateNumber !== 7
                      ) && (
                        <div className="flex items-center justify-between gap-1 text-slate-300 bg-black/60 px-2 py-1 rounded border border-slate-800/70">
                          <span className="text-slate-400 font-sans text-[10px]">File:</span>
                          <span
                            className="font-mono font-semibold truncate max-w-[95px]"
                            title={gate.file}
                            style={{ color: gate.accentColor }}
                          >
                            {gate.file}
                          </span>
                        </div>
                      )}

                      {/* Target Time */}
                      <div className="flex items-center justify-between gap-1 text-slate-300 px-1">
                        <span className="text-slate-400 font-sans text-[10px]">Target Time:</span>
                        <span className="text-amber-300 font-semibold">{gate.targetTime}</span>
                      </div>
                    </div>

                    {/* Card Bottom: Status Label (SAFE ZONE / ELIMINATION ZONE / ESCAPE) */}
                    <div className="mt-2.5 pt-1">
                      <div
                        className={`w-full py-1 rounded text-center text-[10px] font-mono font-bold tracking-widest uppercase transition-all shadow-sm ${
                          gate.zoneType === 'SAFE ZONE'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                            : gate.zoneType === 'ELIMINATION ZONE'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60'
                            : 'bg-amber-950/90 text-amber-300 border border-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                        }`}
                      >
                        {gate.zoneType}
                      </div>

                      {/* Status indicator bar */}
                      <div className="flex items-center justify-between mt-1.5 px-0.5 text-[9px] text-slate-400 font-mono">
                        <span className="uppercase text-slate-500">Status</span>
                        <span
                          className={`font-semibold uppercase ${
                            status === 'completed'
                              ? 'text-emerald-400'
                              : status === 'escaped'
                              ? 'text-amber-300'
                              : status === 'active'
                              ? 'text-cyan-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 5. FOOTER & DECORATIVE GOLD LINE                          */}
      {/* YOUR SKILLS + YOUR TEAM = YOUR ESCAPE                     */}
      {/* ========================================================= */}
      <footer className="relative z-20 w-full px-4 py-3 flex flex-col items-center justify-center text-center">
        {/* Ornate Gold Decorative Divider */}
        <div className="w-full max-w-xl flex items-center justify-center gap-3 mb-2">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/70 to-[#d4af37]" />
          <div className="w-2.5 h-2.5 rotate-45 bg-[#f3d069] shadow-[0_0_10px_#f3d069]" />
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#d4af37]/70 to-[#d4af37]" />
        </div>

        {/* Exact Spaced-out Gold Serif Lettering */}
        <p
          className="text-xs sm:text-sm font-serif font-bold tracking-[0.34em] text-[#d4af37] uppercase drop-shadow-[0_0_12px_rgba(212,175,55,0.75)]"
          style={{
            fontFamily: "var(--font-cinzel), Georgia, serif",
          }}
        >
          YOUR SKILLS + YOUR TEAM = YOUR ESCAPE
        </p>

        {/* Subtle subline info */}
        <div className="text-[10px] text-slate-400/80 font-mono mt-1">
          Click any gate to inspect challenge parameters, files, and verification tokens.
        </div>
      </footer>

      {/* Technical Detail Modal */}
      {selectedGate && (
        <GateDetailModal
          gate={selectedGate}
          status={gateStatuses[selectedGate.id] || selectedGate.defaultStatus}
          onClose={() => setSelectedGate(null)}
          onUpdateStatus={handleUpdateStatus}
          onEnterPortal={onEnterPortal}
        />
      )}
    </div>
  );
};
