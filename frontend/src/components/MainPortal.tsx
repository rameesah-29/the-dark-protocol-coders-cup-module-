import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  FileCode2,
  BellRing,
  Radio,
  Zap,
  Coins,
  LogOut,
  Lock,
  Compass
} from 'lucide-react';
import { TeamProfile, FolderAllocation, LeaderboardEntry } from '../types';
import { ASSETS } from '../data/assets';
import { FLOATING_CIPHER_ELEMENTS } from '../data/moduleData';
import { RoundOneSection } from './RoundOneSection';
import { LiveDashboardSection } from './LiveDashboardSection';
import { PromptExporterModal } from './PromptExporterModal';
import { RoundSevenFinalBreach } from './RoundSevenFinalBreach';
import { CinematicNarrationPlayer } from './CinematicNarrationPlayer';
import { MagicalScoreProgression } from './MagicalScoreProgression';
import { SpellsInventorySidebar } from './SpellsInventorySidebar';
import { D3ScoreCascade } from './D3ScoreCascade';
import { PensieveArchives } from './PensieveArchives';
import { sound } from '../utils/audio';

interface MainPortalProps {
  onBackToBook: () => void;
  onOpenRoadmap?: () => void;
  currentTeam: TeamProfile | null;
  allocatedFolder: FolderAllocation | null;
  onRegisterTeam: (team: TeamProfile, folder: FolderAllocation) => void;
  onLogout?: () => void;
  onSolveChallenge: (challengeId: string, answer: string) => boolean;
  onAdvanceToRoundTwo: () => void;
  leaderboard: LeaderboardEntry[];
  remainingSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAddMinutes: (mins: number) => void;
  onDeductMinutes?: (mins: number) => void;
  onAwardPoints?: (pts: number) => void;
  sparklesEnabled: boolean;
  onToggleSparkles: () => void;
}

export const MainPortal: React.FC<MainPortalProps> = ({
  onBackToBook,
  onOpenRoadmap,
  currentTeam,
  allocatedFolder,
  onRegisterTeam,
  onLogout,
  onSolveChallenge,
  onAdvanceToRoundTwo,
  leaderboard,
  remainingSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onAddMinutes,
  onDeductMinutes,
  onAwardPoints,
  sparklesEnabled,
  onToggleSparkles,
}) => {
  const [activeTab, setActiveTab] = useState<'round1' | 'pensieve' | 'dashboard' | 'terminal'>('round1');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [d3Cascade, setD3Cascade] = useState<{
    points: number;
    challengeTitle?: string;
  } | null>(null);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
  };

  const handleSolveChallengeWithCascade = (challengeId: string, answer: string): boolean => {
    const isCorrect = onSolveChallenge(challengeId, answer);
    if (isCorrect) {
      const challenge = allocatedFolder?.challenges.find((c) => c.id === challengeId);
      const pts = challenge?.points || 100;
      setD3Cascade({
        points: pts,
        challengeTitle: challenge?.title || 'Arithmancy Cipher Solved',
      });
    }
    return isCorrect;
  };

  const handleAdvanceWithCascade = () => {
    setD3Cascade({
      points: 200,
      challengeTitle: 'Round 1 Completed · Advance to Round 2',
    });
    onAdvanceToRoundTwo();
  };

  const handleSimulatePointsWithCascade = (pts: number) => {
    setD3Cascade({
      points: pts,
      challengeTitle: 'Wizarding Score Boost',
    });
    if (onAwardPoints) onAwardPoints(pts);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#060c18] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Hogwarts Gothic Great Hall Night Backdrop with floating candles & starry sky */}
      <div className="fixed inset-0 pointer-events-none opacity-25 z-0">
        <img
          src={ASSETS.greatHallNight || ASSETS.hogwartsNightCastle}
          alt="Hogwarts Gothic Great Hall Night Backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-60 contrast-125 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-[#081224]/80 to-[#060c18]/90" />
      </div>

      {/* FLOATING MATHEMATICAL FORMULAS, MAGICAL CIPHERS & PARCHMENT SCRAPS BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {FLOATING_CIPHER_ELEMENTS.map((elem, idx) => {
          if (elem.type === 'scrap') {
            return (
              <div
                key={idx}
                className="absolute animate-parchment-flutter"
                style={{
                  top: `${elem.y}%`,
                  left: `${elem.x}%`,
                  animationDelay: `${elem.delay}s`,
                  animationDuration: `${elem.duration || 14}s`,
                }}
              >
                <div className="px-3.5 py-2 rounded-lg bg-[#efe3c8]/85 border border-[#c59b27]/70 text-[#221307] shadow-[0_8px_20px_rgba(0,0,0,0.6)] backdrop-blur-xs max-w-[210px] transform rotate-[-2deg]">
                  <div className="font-cinzel text-[10px] font-bold text-[#3e230c] flex items-center gap-1 border-b border-[#c59b27]/40 pb-0.5">
                    <span>📜</span>
                    <span className="truncate">{elem.text}</span>
                  </div>
                  {elem.secondaryText && (
                    <div className="font-serif italic text-[9px] text-[#4a2e15] mt-1 leading-snug">
                      "{elem.secondaryText}"
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (elem.type === 'formula') {
            return (
              <div
                key={idx}
                className={`absolute font-mono text-[11px] md:text-xs font-semibold ${
                  elem.driftType === 'drift-alt' ? 'animate-cyber-drift-alt' : 'animate-cyber-drift'
                }`}
                style={{
                  top: `${elem.y}%`,
                  left: `${elem.x}%`,
                  animationDelay: `${elem.delay}s`,
                  animationDuration: `${elem.duration || 18}s`,
                }}
              >
                <div className="animate-math-glow text-sky-300/80 px-2.5 py-1 rounded-md bg-sky-950/20 border border-sky-500/20 backdrop-blur-xs tracking-wider">
                  {elem.text}
                </div>
              </div>
            );
          }

          // Magical Ciphers & Ancient Runes
          return (
            <div
              key={idx}
              className={`absolute font-mono text-[10px] md:text-xs font-bold ${
                elem.driftType === 'drift-alt' ? 'animate-cyber-drift-alt' : 'animate-cyber-drift'
              }`}
              style={{
                top: `${elem.y}%`,
                left: `${elem.x}%`,
                animationDelay: `${elem.delay}s`,
                animationDuration: `${elem.duration || 16}s`,
              }}
            >
              <div className="animate-cipher-glow text-[#f3d069]/85 px-2.5 py-1 rounded-md bg-[#0a182c]/40 border border-[#c59b27]/30 backdrop-blur-xs tracking-widest font-cinzel">
                {elem.text}
              </div>
            </div>
          );
        })}

        {/* Ambient Marauder's Map footsteps drifting subtly */}
        <div className="absolute top-1/3 left-1/4 opacity-25 text-[#f3d069] font-mono text-[10px] animate-pulse">
          👣 👣 👣
        </div>
        <div className="absolute bottom-1/4 right-1/3 opacity-25 text-[#f3d069] font-mono text-[10px] animate-pulse" style={{ animationDelay: '2.5s' }}>
          👣 👣 👣
        </div>
      </div>

      {/* TOP NAVIGATION BAR (Zone 1: Title, Zone 2: 3 Core Tabs, Zone 3: Actions) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#c59b27]/40 bg-[#071120]/95 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-lg">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playPageTurn();
              onBackToBook();
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer px-3.5 py-1.5 rounded-xl bg-[#1c222b]/40 backdrop-blur-md border border-[#c59b27]/25 hover:border-[#c59b27]/40 hover:bg-[#252c38]/50 transition-all shadow-xs"
            title="Return to Grimoire Cover & Harry's Narration"
          >
            <div className="h-8 w-8 rounded-lg border border-[#c59b27]/30 bg-[#121620]/60 flex items-center justify-center text-[#f3d069] group-hover:scale-105 transition-transform shadow-xs">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-cinzel text-xs md:text-sm font-bold text-[#f3d069] tracking-wider flex items-center gap-1.5">
                <span>✦ HOGWARTS CYBER & ARITHMANCY ✦</span>
              </div>
              <div className="text-[10px] text-slate-300 font-serif">
                Official Module Platform · Year 2026
              </div>
            </div>
          </button>
        </div>

        {/* The 3 Core Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-[#091526] border border-[#c59b27]/40 shadow-inner">
          <button
            onClick={() => {
              sound.playSparkle();
              setActiveTab('round1');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round1'
                ? 'bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] text-[#060c18] font-black shadow-md'
                : 'text-slate-300 hover:text-[#f3d069]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{currentTeam ? 'Round 1: Ciphers' : 'Squad Login'}</span>
          </button>

          {/* PENSIEVE ARCHIVES TAB (Only accessible after login) */}
          <button
            onClick={() => {
              if (!currentTeam) {
                sound.playSparkle();
                setActiveTab('round1');
                return;
              }
              sound.playPageTurn();
              setActiveTab('pensieve');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pensieve'
                ? 'bg-gradient-to-r from-sky-700 via-cyan-400 to-sky-700 text-[#060c18] font-black shadow-md'
                : currentTeam
                ? 'text-slate-300 hover:text-cyan-300'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={currentTeam ? 'Pensieve Archives: Review all decrypted answers from previous rounds' : 'Authentication required to access Pensieve Archives'}
          >
            {currentTeam ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3 w-3 text-amber-500/70" />
            )}
            <span>Pensieve Archives</span>
            {currentTeam && allocatedFolder && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                  activeTab === 'pensieve'
                    ? 'bg-black/30 text-slate-950'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                }`}
              >
                {allocatedFolder.challenges.filter((c) => c.isSolved).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!currentTeam) {
                sound.playSparkle();
                setActiveTab('round1');
                return;
              }
              sound.playSparkle();
              setActiveTab('dashboard');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] text-[#060c18] font-black shadow-md'
                : currentTeam
                ? 'text-slate-300 hover:text-[#f3d069]'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={currentTeam ? 'Live Dashboard' : 'Authentication required to view Dashboard'}
          >
            {currentTeam ? <Activity className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3 text-amber-500/70" />}
            <span>Time & Dashboard</span>
          </button>

          <button
            onClick={() => {
              if (!currentTeam) {
                sound.playSparkle();
                setActiveTab('round1');
                return;
              }
              sound.playSparkle();
              setActiveTab('terminal');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#10b981] text-[#060c18] font-black shadow-md'
                : currentTeam
                ? 'text-slate-300 hover:text-emerald-300'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={currentTeam ? 'Round 7: The Final Breach' : 'Authentication required to access Round 7'}
          >
            {currentTeam ? <Terminal className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3 text-amber-500/70" />}
            <span>Final Escape (Round 7)</span>
          </button>
        </nav>

        {/* Primary Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 7 Gates Roadmap Launcher */}
          {onOpenRoadmap && (
            <button
              onClick={() => {
                sound.playSparkle();
                onOpenRoadmap();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/80 bg-gradient-to-r from-cyan-950/70 via-sky-900/50 to-cyan-950/70 hover:from-cyan-900/80 hover:to-sky-800/60 text-cyan-200 text-xs font-cinzel font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.35)] cursor-pointer"
              title="View The Dark Protocol Prison Escape Roadmap (7 Gates)"
            >
              <Compass className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>7 Gates Roadmap</span>
            </button>
          )}

          {/* Spells Inventory Launcher */}
          <button
            onClick={() => {
              sound.playSparkle();
              setIsInventoryOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/80 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 hover:from-amber-600/50 hover:to-yellow-500/40 text-amber-200 text-xs font-cinzel font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
            title="Open Grimoire Spells Inventory & Cast Charms"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-current animate-pulse" />
            <span>Spells</span>
          </button>

          {/* D3.js Score Cascade Launcher */}
          <button
            onClick={() => {
              handleSimulatePointsWithCascade(100);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/80 bg-gradient-to-r from-amber-600/30 via-yellow-500/25 to-amber-600/30 hover:from-amber-600/50 hover:to-yellow-500/50 text-yellow-200 text-xs font-cinzel font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.35)] cursor-pointer"
            title="Trigger D3.js Score Cascade: Shower of Gold Galleons"
          >
            <Coins className="h-3.5 w-3.5 text-yellow-300 animate-bounce" />
            <span className="hidden sm:inline">Cascade</span>
          </button>

          {/* Character Voice Stories Launcher */}
          <button
            onClick={() => {
              sound.playSparkle();
              setIsStoryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/70 bg-gradient-to-r from-amber-950/60 via-[#0e1d35] to-amber-950/60 hover:from-amber-900/80 hover:to-amber-900/80 text-[#fef9c3] text-xs font-cinzel font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer"
            title="Open Chronicles of Hogwarts: Character Storybook"
          >
            <Radio className="h-3.5 w-3.5 text-[#f3d069] animate-pulse" />
            <span className="hidden lg:inline">Stories</span>
          </button>

          {/* Return to Fullscreen Book Cover */}
          <button
            onClick={() => {
              sound.playPageTurn();
              onBackToBook();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c59b27]/60 bg-[#0c182c]/90 hover:bg-[#142646] text-[#f3d069] text-xs font-cinzel font-semibold transition-all shadow-[0_0_12px_rgba(197,155,39,0.2)] cursor-pointer"
            title="Return to Fullscreen Book Cover"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Book Cover</span>
          </button>

          {/* Authenticated Squad Badge & Logout */}
          {currentTeam && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#c59b27]/30">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-[11px] font-cinzel font-bold text-[#fef9c3] leading-tight">
                  {currentTeam.teamName}
                </span>
                <span className="text-[9px] text-[#f3d069]/80 font-mono">
                  {currentTeam.score} XP
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    sound.playPageTurn();
                    onLogout();
                  }}
                  className="p-2 rounded-lg border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs transition-colors cursor-pointer"
                  title="Logout current squad session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Sparkles cursor toggle */}
          <button
            onClick={onToggleSparkles}
            aria-label="Toggle magical sparkles trail"
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              sparklesEnabled
                ? 'border-[#c59b27]/60 bg-[#0c182c] text-[#f3d069] shadow-[0_0_10px_rgba(197,155,39,0.3)]'
                : 'border-[#c59b27]/20 bg-[#081220] text-slate-500'
            }`}
            title={sparklesEnabled ? 'Magical wand sparkle trail active' : 'Sparkle trail disabled'}
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Sound audio toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle magical spell sounds"
            className="p-2 rounded-lg border border-[#c59b27]/40 bg-[#091526] hover:bg-[#0f213a] text-slate-200 text-xs transition-colors cursor-pointer"
            title={isMuted ? 'Spell sound muted' : 'Spell sound enabled'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-[#f3d069]" />}
          </button>

          {/* Export Master Prompt Modal Button */}
          <button
            onClick={() => setIsPromptModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c59b27]/50 bg-[#0c182c]/90 hover:bg-[#12233f] text-[#f3d069] text-xs font-cinzel font-semibold transition-colors cursor-pointer"
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>Prompt Blueprint</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER MODULE BANNER & TEAM CLEARANCE STATUS */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 pt-5 pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-b border-[#c59b27]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-cinzel text-slate-200">
              Module: <strong className="text-[#f3d069]">Hogwarts Cyber-Maths Olympiad</strong>
            </span>
            <span aria-hidden="true" className="text-[#c59b27]/60">❖</span>
            <span className="text-slate-300">
              Ciphers: <strong className="text-[#fef08a]">XOR, Modular Residue & Caesar</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            {currentTeam ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Team: <strong className="text-slate-100">{currentTeam.teamName}</strong>
              </span>
            ) : (
              <span className="text-[#f3d069] italic">
                Awaiting Squad Login in Round 1
              </span>
            )}
            <span aria-hidden="true" className="text-[#c59b27]/60">❖</span>
            <button
              onClick={onBackToBook}
              className="text-[#f3d069] hover:underline cursor-pointer"
            >
              Reopen Grimoire
            </button>
          </div>
        </div>
      </div>

      {/* MAGICAL SCORE PROGRESSION SYSTEM (Wand, Enchanted Book & Phoenix Evolution) */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 md:px-8 pt-3 pb-2">
        <MagicalScoreProgression
          currentScore={currentTeam?.score || 0}
          house={currentTeam?.house || 'Gryffindor'}
          teamName={currentTeam?.teamName || 'Code-Breakers'}
          maxScore={1200}
          onSimulatePoints={handleSimulatePointsWithCascade}
        />
      </div>

      {/* MAIN CONTENT VIEW CONTAINER */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-3">
        {activeTab === 'round1' && (
          <RoundOneSection
            currentTeam={currentTeam}
            onRegisterTeam={onRegisterTeam}
            allocatedFolder={allocatedFolder}
            onSolveChallenge={handleSolveChallengeWithCascade}
            onAdvanceToRoundTwo={handleAdvanceWithCascade}
            onDeductMinutes={onDeductMinutes}
          />
        )}

        {/* PENSIEVE ARCHIVES: STORED ANSWERS FROM PREVIOUS ROUNDS (ONLY ACCESSIBLE AFTER LOGIN) */}
        {activeTab === 'pensieve' && (
          currentTeam ? (
            <PensieveArchives
              currentTeam={currentTeam}
              allocatedFolder={allocatedFolder}
              onNavigateToRound1={() => setActiveTab('round1')}
              onOpenRoadmap={onOpenRoadmap}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl bg-[#091526]/90 border border-[#c59b27]/40 space-y-4 shadow-xl">
              <Lock className="h-12 w-12 text-[#f3d069] mx-auto animate-pulse" />
              <h3 className="font-cinzel text-xl font-bold text-[#fef9c3]">
                Pensieve Archives Sealed
              </h3>
              <p className="text-xs text-slate-300 font-serif">
                Squad authentication is required to access the Pensieve Archives. Please login your squad in Round 1 to view and review preserved answers.
              </p>
              <button
                onClick={() => setActiveTab('round1')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c59b27] to-[#f3d069] text-[#060c18] font-cinzel font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                Go to Squad Login
              </button>
            </div>
          )
        )}

        {activeTab === 'dashboard' && (
          currentTeam ? (
            <LiveDashboardSection
              leaderboard={leaderboard}
              currentTeam={currentTeam}
              remainingSeconds={remainingSeconds}
              isTimerRunning={isTimerRunning}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl bg-[#091526]/90 border border-[#c59b27]/40 space-y-4">
              <Lock className="h-12 w-12 text-[#f3d069] mx-auto animate-pulse" />
              <h3 className="font-cinzel text-xl font-bold text-[#fef9c3]">
                Restricted Ministry Archive
              </h3>
              <p className="text-xs text-slate-300 font-serif">
                Squad credentials are required to view live competition statistics. Please login your module squad first.
              </p>
              <button
                onClick={() => setActiveTab('round1')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c59b27] to-[#f3d069] text-[#060c18] font-cinzel font-bold text-xs uppercase cursor-pointer"
              >
                Go to Squad Login
              </button>
            </div>
          )
        )}

        {activeTab === 'terminal' && (
          currentTeam ? (
            <RoundSevenFinalBreach
              currentTeam={currentTeam}
              remainingSeconds={remainingSeconds}
              isTimerRunning={isTimerRunning}
              onAwardPoints={onAwardPoints}
              onOpenRoadmap={onOpenRoadmap}
              onNavigateToPensieve={() => setActiveTab('pensieve')}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl bg-[#091526]/90 border border-[#c59b27]/40 space-y-4">
              <Lock className="h-12 w-12 text-[#f3d069] mx-auto animate-pulse" />
              <h3 className="font-cinzel text-xl font-bold text-[#fef9c3]">
                Round 7 Locked
              </h3>
              <p className="text-xs text-slate-300 font-serif">
                Access to Round 7 (The Final Breach) requires an authenticated squad profile. Please login your module squad first.
              </p>
              <button
                onClick={() => setActiveTab('round1')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c59b27] to-[#f3d069] text-[#060c18] font-cinzel font-bold text-xs uppercase cursor-pointer"
              >
                Go to Squad Login
              </button>
            </div>
          )
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-neutral-800 bg-neutral-950/80 px-4 md:px-8 py-4 text-center text-xs text-neutral-500">
        <p className="font-cinzel text-neutral-400">
          Hogwarts School of Witchcraft & Wizardry · Department of Magical Cryptology & Arithmancy
        </p>
      </footer>

      {/* MASTER PROMPT EXPORTER MODAL */}
      <PromptExporterModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />

      {/* CINEMATIC CHARACTER VOICE STORYBOOK MODAL */}
      <CinematicNarrationPlayer
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* SPELLS INVENTORY SIDEBAR */}
      <SpellsInventorySidebar
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        allocatedFolder={allocatedFolder}
        clearanceLevel={currentTeam?.clearanceLevel || 1}
        currentScore={currentTeam?.score || 0}
        house={currentTeam?.house || 'Gryffindor'}
      />

      {/* D3.JS SCORE CASCADE: ANIMATED GOLD COINS RAINING EFFECT */}
      <D3ScoreCascade
        points={d3Cascade?.points ?? null}
        challengeTitle={d3Cascade?.challengeTitle}
        house={currentTeam?.house || 'Gryffindor'}
        teamName={currentTeam?.teamName || 'Code-Breakers'}
        onComplete={() => setD3Cascade(null)}
      />
    </div>
  );
};
