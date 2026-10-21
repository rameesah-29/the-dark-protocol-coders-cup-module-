import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  BookOpen,
  ChevronRight,
  BookMarked,
  Feather,
  RotateCcw,
  Radio,
  Award,
  Compass,
  Map,
  Clock,
  Maximize2,
  Lock,
  Unlock,
  CheckCircle2,
  Shield,
  ExternalLink
} from 'lucide-react';
import { ASSETS } from '../data/assets';
import { HARRY_FULL_STORY_TEXT } from '../data/moduleData';
import { ROADMAP_GATES, GateInfo, GateStatus } from '../data/roadmapData';
import { GateArtwork } from './GateArtwork';
import { GateDetailModal } from './GateDetailModal';
import { sound } from '../utils/audio';
import { narration } from '../utils/narrationEngine';
import { CinematicNarrationPlayer } from './CinematicNarrationPlayer';

interface MagicalBookOpeningProps {
  onEnterModulePortal: () => void;
  onOpenRoadmap?: () => void;
  onOpenAdmin?: () => void;
  isLoggedIn?: boolean;
  remainingSeconds?: number;
  isTimerRunning?: boolean;
}

export const MagicalBookOpening: React.FC<MagicalBookOpeningProps> = ({
  onEnterModulePortal,
  onOpenRoadmap,
  onOpenAdmin,
  isLoggedIn = false,
  remainingSeconds = 90 * 60,
  isTimerRunning = false,
}) => {
  // Stages: 'cover' (fullscreen pristine cover) | 'opened' (Harry Potter narrating backstory)
  const [stage, setStage] = useState<'cover' | 'opened'>('cover');
  const [bookFolioTab, setBookFolioTab] = useState<'briefing' | 'roadmap'>('briefing');
  const [selectedGate, setSelectedGate] = useState<GateInfo | null>(null);
  const [gateStatuses, setGateStatuses] = useState<Record<number, GateStatus>>(() => {
    const initial: Record<number, GateStatus> = {};
    ROADMAP_GATES.forEach((g) => {
      initial[g.id] = g.defaultStatus;
    });
    return initial;
  });

  const handleUpdateStatus = (gateId: number, newStatus: GateStatus) => {
    setGateStatuses((prev) => ({
      ...prev,
      [gateId]: newStatus,
    }));
  };

  const [isOpeningTransition, setIsOpeningTransition] = useState(false);
  const [isFlippingToPortal, setIsFlippingToPortal] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Play narration using modular cinematic narration system (Full Escape Briefing)
  const handlePlayHarryNarration = () => {
    setIsNarrating(true);
    narration.playCharacterDialogue('harry', HARRY_FULL_STORY_TEXT, {
      emotion: 'brave',
      speed: 1.05,
      onStart: () => {
        setIsNarrating(true);
      },
      onAudioLevel: (lvl) => {
        setAudioLevel(lvl);
      },
      onEnd: () => {
        setIsNarrating(false);
        setAudioLevel(0);
      },
      onError: () => {
        setIsNarrating(false);
        setAudioLevel(0);
      },
    });
  };

  const handleStopHarryNarration = () => {
    narration.stopCharacterDialogue();
    setIsNarrating(false);
    setAudioLevel(0);
  };

  // When clicking "OPEN THE BOOK": animate realistic 3D page turn, unseal spell, reveal Harry Potter, and start movie voice narration
  const handleOpenBook = () => {
    if (isOpeningTransition || stage === 'opened') return;

    // Play rich cinematic unsealing chime, ascending star cascade, and heavy parchment whoosh
    sound.playGrimoireOpen();
    setIsOpeningTransition(true);

    setTimeout(() => {
      setStage('opened');
      setIsOpeningTransition(false);
      // Harry Potter immediately speaks the ancient prison escape backstory in his authentic movie voice
      handlePlayHarryNarration();
    }, 1350);
  };

  const handleCloseBook = () => {
    handleStopHarryNarration();
    sound.playPageTurn();
    setStage('cover');
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
    narration.setMuted(nextState);
    if (nextState) {
      handleStopHarryNarration();
    }
  };

  const handlePageFlipToPortal = () => {
    handleStopHarryNarration();
    sound.playPageTurn();
    sound.playSuccess();
    setIsFlippingToPortal(true);
    setTimeout(() => {
      onEnterModulePortal();
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none bg-[#050b14] perspective-book">
      {/* =========================================================================
          STAGE 1: FULLSCREEN PRISTINE BOOK COVER WITH CINEMATIC 3D OPENING ANIMATION
          ========================================================================= */}
      {stage === 'cover' && (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#02040a] select-none flex items-center justify-center">
          {/* =========================================================================
              EXACT RECREATION: PHOTOREALISTIC GOTHIC LIBRARY WITH ASTRONOMICAL
              INSTRUMENT, PERCHED OWL, AMBER CANDLES, AND DISTANT ARCHED MOONLIGHT
              ========================================================================= */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* 100% Single Continuous Scene: Photorealistic Gothic Library with Table, Candles, Astrolabe, and Arches */}
            <img
              src={ASSETS.masterWidescreen}
              alt="Grand Gothic Library Sanctuary with Bookshelves, Arched Window, Owl, and Candlelight"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.04]"
            />

            {/* Seamless deep atmospheric vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,5,12,0.45)_82%,rgba(1,3,7,0.92)_100%)] pointer-events-none" />
          </div>

          {/* Very subtle atmospheric fog at floor/lower level */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#040916]/45 via-[#040916]/18 to-transparent blur-xl pointer-events-none animate-mist-drift z-5" />

          {/* Soft, diffused golden & celestial spotlight behind the center of the book */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,rgba(15,26,48,0.20)_42%,transparent_70%)] blur-3xl pointer-events-none z-6" />

          {/* Sparse, slowly drifting tiny golden particles (restrained, no excessive sparkles) */}
          <div className="absolute inset-0 pointer-events-none z-7 overflow-hidden">
            {[
              { top: '22%', left: '18%', delay: '0s', duration: '20s', size: 'w-1 h-1' },
              { top: '35%', left: '82%', delay: '4s', duration: '22s', size: 'w-1 h-1' },
              { top: '62%', left: '15%', delay: '2s', duration: '18s', size: 'w-0.5 h-0.5' },
              { top: '74%', left: '85%', delay: '6s', duration: '24s', size: 'w-1 h-1' },
              { top: '28%', left: '72%', delay: '3s', duration: '19s', size: 'w-0.5 h-0.5' },
              { top: '68%', left: '26%', delay: '7s', duration: '21s', size: 'w-0.5 h-0.5' },
            ].map((mote, idx) => (
              <div
                key={idx}
                className={`absolute ${mote.size} rounded-full bg-amber-200/40 blur-[0.4px] pointer-events-none animate-mote-drift`}
                style={{
                  top: mote.top,
                  left: mote.left,
                  animationDelay: mote.delay,
                  animationDuration: mote.duration,
                }}
              />
            ))}
          </div>

          {/* Discreet top bar (Pristine atmosphere: strictly NO options before opening the book) */}
          <header className="absolute top-3 sm:top-4 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-none">
            <div
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c222b]/40 border border-[#c59b27]/25 text-[10px] sm:text-[11px] font-cinzel text-[#c59b27]/85 tracking-widest uppercase backdrop-blur-md pointer-events-auto shadow-xs cursor-pointer select-none hover:border-[#c59b27]/60 hover:text-[#f3d069] transition"
              title="Restricted Staff Archives (Staff shortcut: Ctrl+Shift+A)"
            >
              <span>✦ Restricted Archives · Folio 1897 ✦</span>
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={toggleSound}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#c59b27]/25 bg-[#1c222b]/40 hover:bg-[#252c38]/60 text-[11px] font-medium text-[#f3d069] transition-all backdrop-blur-md shadow-xs cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-500" /> : <Volume2 className="h-3.5 w-3.5 text-[#f3d069]" />}
                <span className="hidden md:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>
          </header>

          {/* 3D Grimoire Book Container with True Spine Anchor */}
          <div className="relative z-10 max-h-screen max-w-screen flex items-center justify-center perspective-[2500px]">
            {/* The Stacked Back Pages Underneath (only active and visible during opening transition when cover turns) */}
            <div className="relative flex items-center justify-center">
              {/* Underneath Stacked Parchment Base & Gilded Edge */}
              {isOpeningTransition && (
                <div className="absolute inset-0 rounded-r-2xl bg-[#f7edd7] border-r-4 border-b-4 border-[#c59b27] shadow-[25px_30px_70px_rgba(0,0,0,0.98)] pointer-events-none overflow-hidden opacity-95">
                  <div className="absolute inset-0 bg-manuscript opacity-90" />
                  <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-black/60 to-transparent" />
                  {/* Runic seal watermark on first page */}
                  <div className="absolute right-8 top-12 font-cinzel text-xs text-[#9a7318]/60 tracking-widest uppercase">
                    ✦ The Dark Protocol · Restricted Archives ✦
                  </div>
                  <div className="absolute right-8 bottom-12 font-serif text-[11px] italic text-[#785b1a]/50">
                    "Let only those pure of intent unseal this cipher..."
                  </div>
                </div>
              )}

              {/* Intermediate Fanning Parchment Leaves (during opening transition) */}
              {isOpeningTransition && (
                <>
                  {/* Fanning Leaf 1 (Deepest) */}
                  <motion.div
                    className="absolute inset-0 origin-left transform-style-3d bg-manuscript rounded-r-xl border-r-2 border-[#c59b27]/60 pointer-events-none shadow-2xl"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -28 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/10" />
                  </motion.div>

                  {/* Fanning Leaf 2 */}
                  <motion.div
                    className="absolute inset-0 origin-left transform-style-3d bg-manuscript rounded-r-xl border-r-2 border-[#c59b27]/70 pointer-events-none shadow-2xl"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -60 }}
                    transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/15" />
                  </motion.div>

                  {/* Fanning Leaf 3 */}
                  <motion.div
                    className="absolute inset-0 origin-left transform-style-3d bg-manuscript rounded-r-xl border-r-2 border-[#c59b27]/80 pointer-events-none shadow-2xl"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -92 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
                  </motion.div>

                  {/* Fanning Leaf 4 */}
                  <motion.div
                    className="absolute inset-0 origin-left transform-style-3d bg-manuscript rounded-r-xl border-r-2 border-[#c59b27]/90 pointer-events-none shadow-2xl"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -118 }}
                    transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/25" />
                  </motion.div>

                  {/* Radiant Celestial Light Beam pouring out from opening spine and pages */}
                  <div className="absolute top-0 bottom-0 right-0 w-48 bg-gradient-to-r from-amber-400/50 via-yellow-200/80 to-transparent pointer-events-none animate-light-beam blur-lg z-30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent pointer-events-none animate-pulse z-30" />
                </>
              )}

              {/* The Heavy Front Cover (Swings open from the left spine on opening) */}
              <motion.div
                className="relative z-20 origin-left transform-style-3d select-none"
                initial={{ rotateY: 0, scale: 1 }}
                animate={
                  isOpeningTransition
                    ? {
                        rotateY: -138,
                        scale: 1.02,
                        filter: 'brightness(0.65)',
                        transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] },
                      }
                    : { rotateY: 0, scale: 1 }
                }
              >
                {/* Upright Book Standing Naturally on the Wooden Table (40-45% viewport width, balanced vertical space) */}
                <div className="relative flex items-center justify-center w-[85vw] sm:w-[65vw] md:w-[50vw] lg:w-[42vw] max-w-[560px] h-[78vh] sm:h-[82vh] max-h-[800px]">
                  {/* In static resting state, the master background displays the scene seamlessly; during 3D opening, the book cover texture is revealed */}
                  <img
                    src={ASSETS.navyBookCover}
                    alt="The Dark Protocol - A Hogwarts Story"
                    className={`w-full h-full object-contain object-center select-none pointer-events-none rounded-xl transition-opacity duration-300 ${
                      isOpeningTransition ? 'opacity-100 shadow-2xl' : 'opacity-0'
                    }`}
                  />

                  {/* The Opulent "OPEN THE BOOK" interactive button (positioned below the lock, compact and refined) */}
                  <div className="absolute bottom-4 sm:bottom-6 md:bottom-7 left-1/2 -translate-x-1/2 z-20">
                    <motion.button
                      onClick={handleOpenBook}
                      disabled={isOpeningTransition}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#040915]/88 hover:bg-[#08152a]/95 backdrop-blur-md border border-[#c59b27]/80 hover:border-[#fef08a] text-[#f3d069] hover:text-[#fef08a] shadow-[0_6px_24px_rgba(0,0,0,0.9),0_0_15px_rgba(197,155,39,0.22)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.95),0_0_24px_rgba(243,208,105,0.5)] transition-all duration-300 cursor-pointer flex flex-col items-center gap-0.5 overflow-hidden"
                      title="Whisper Alohomora to unseal The Dark Protocol"
                    >
                      {/* Gentle metallic gold shimmer sweep on hover */}
                      <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[#fef08a]/25 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer-sweep pointer-events-none transition-opacity duration-300" />

                      <div className="flex items-center gap-2 relative z-10">
                        <Sparkles className="h-3.5 w-3.5 text-[#c59b27] group-hover:text-[#fef08a] group-hover:rotate-45 transition-all duration-300 shrink-0" />
                        <span className="font-cinzel text-[11px] sm:text-xs font-black tracking-[0.22em] uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                          Open the Book
                        </span>
                        <Sparkles className="h-3.5 w-3.5 text-[#c59b27] group-hover:text-[#fef08a] group-hover:-rotate-45 transition-all duration-300 shrink-0" />
                      </div>
                      <span className="text-[8.5px] font-cinzel tracking-widest text-[#f3d069]/70 group-hover:text-[#fef08a] transition-colors uppercase">
                        ✦ Whisper Alohomora ✦
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>


          {/* Opening Transition Cinematic Overlay Banner */}
          {isOpeningTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 z-40 bg-gradient-radial from-[#c59b27]/30 via-[#071120]/80 to-[#050b14] flex flex-col items-center justify-center pointer-events-none gap-3"
            >
              <div className="flex items-center gap-3 text-[#f3d069] font-cinzel text-sm sm:text-base tracking-[0.25em] animate-pulse drop-shadow-[0_0_15px_rgba(243,208,105,0.9)]">
                <Sparkles className="h-5 w-5 text-amber-300 animate-spin" />
                <span>Alohomora! Unsealing The Dark Protocol...</span>
                <Sparkles className="h-5 w-5 text-amber-300 animate-spin" />
              </div>
              <div className="font-serif italic text-xs text-amber-200/70 tracking-wider">
                Summoning Harry Potter & Restoring Ancient Manuscript
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* =========================================================================
          STAGE 2: OPENED BOOK WITH HARRY POTTER NARRATING BACKSTORY IN HIS VOICE
          ========================================================================= */}
      {stage === 'opened' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between p-3 sm:p-6 md:p-8">
          {/* Photorealistic Ancient Gothic Library Night Background with deep navy to midnight gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={ASSETS.navyMidnightScene}
              alt="Ancient Gothic Library Archives - Cinema Plate"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.10] saturate-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B1D] via-[#0B1B36]/80 to-[#050B1D]/90" />
          </div>

          {/* Starlight motes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { top: '15%', left: '15%', delay: '0s' },
              { top: '22%', left: '80%', delay: '1.2s' },
              { top: '78%', left: '20%', delay: '2.1s' },
              { top: '82%', left: '85%', delay: '0.7s' },
            ].map((star, idx) => (
              <div
                key={idx}
                className="absolute flex flex-col items-center animate-magical-pulse pointer-events-none"
                style={{ top: star.top, left: star.left, animationDelay: star.delay }}
              >
                <div className="w-1.5 h-1.5 bg-amber-200 rounded-full blur-[0.5px] shadow-[0_0_8px_#fef08a]" />
              </div>
            ))}
          </div>

          {/* Header Bar */}
          <header className="relative z-30 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 pb-4">
            <div
              onClick={onOpenAdmin}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#1c222b]/40 backdrop-blur-md border border-[#c59b27]/25 shadow-xs cursor-pointer select-none hover:border-[#c59b27]/60 transition"
              title="Restricted Staff Archives (Staff shortcut: Ctrl+Shift+A)"
            >
              <div className="h-8 w-8 rounded-lg border border-[#c59b27]/30 bg-[#121620]/60 flex items-center justify-center text-[#f3d069] shadow-xs">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <div>
                <h1 className="font-cinzel text-xs sm:text-sm md:text-base font-bold text-[#f3d069] tracking-wider">
                  ✦ HOGWARTS CYBER & ARITHMANCY ✦
                </h1>
                <p className="text-[11px] text-slate-300 font-serif">
                  Backstory Prologue · Narrated by Harry Potter
                </p>
              </div>
            </div>



            <div className="flex items-center gap-2">
              {/* Option to unfold full widescreen roadmap */}
              {onOpenRoadmap && (
                <button
                  onClick={onOpenRoadmap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/70 bg-[#06182c]/90 hover:bg-[#0a2747] text-cyan-200 text-xs font-cinzel font-bold transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)] cursor-pointer"
                  title="Unfold Panoramic Roadmap in Fullscreen"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Panoramic Roadmap</span>
                </button>
              )}

              {/* Launch Full Chronicles Storybook Button */}
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/70 bg-gradient-to-r from-amber-950/60 via-[#0e1d35] to-amber-950/60 hover:from-amber-900/80 hover:to-amber-900/80 text-[#fef9c3] text-xs font-cinzel font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <Radio className="h-3.5 w-3.5 text-[#f3d069] animate-pulse" />
                <span>All Voices</span>
              </button>

              <button
                onClick={handleCloseBook}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c59b27]/40 bg-[#0a1526]/90 hover:bg-[#0f2038] text-xs font-cinzel text-[#f3d069] transition-all cursor-pointer shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Close to Cover</span>
              </button>

              <button
                onClick={toggleSound}
                aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c59b27]/50 bg-[#0a1526]/90 hover:bg-[#0f2038] text-xs font-medium text-[#f3d069] transition-all shadow-sm cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-[#f3d069]" />}
                <span className="hidden md:inline">{isMuted ? 'Muted' : 'Voice Active'}</span>
              </button>
            </div>
          </header>

          {/* Main Opened Double-Page Manuscript */}
          <main
            className={`relative z-20 w-full mx-auto my-auto flex items-center justify-center py-2 transition-all duration-500 ${
              bookFolioTab === 'roadmap' ? 'max-w-7xl' : 'max-w-5xl'
            }`}
          >
            <motion.div
              initial={{ rotateY: -70, opacity: 0, scale: 0.95 }}
              animate={
                isFlippingToPortal
                  ? { rotateY: 90, opacity: 0, scale: 0.92, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }
                  : { rotateY: 0, opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full rounded-2xl p-2 sm:p-3 md:p-4 shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_60px_rgba(197,155,39,0.3)] border-2 border-[#c59b27]/80 bg-gradient-to-b from-[#0a1628] to-[#040913]"
            >
              {/* Central book gutter subtle divide */}
              {bookFolioTab === 'briefing' && (
                <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 book-gutter-shadow z-20 pointer-events-none" />
              )}

              {/* ========================================================================= */}
              {/* VIEW A: BRIEFING SPREAD (FOLIO I: HARRY STORY | FOLIO II: ROADMAP INLAY)   */}
              {/* ========================================================================= */}
              {bookFolioTab === 'briefing' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#c59b27]/50 bg-manuscript text-[#1f160b] relative z-10 shadow-[inset_0_0_40px_rgba(197,155,39,0.2)]">
                  {/* ================= LEFT PAGE: HARRY'S LIVING PORTRAIT & NARRATION ================= */}
                  <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between relative book-spine-crease">
                    <div className="space-y-4">
                      {/* Antique Page Header */}
                      <div className="flex items-center justify-between border-b border-[#c59b27]/40 pb-2.5">
                        <span className="font-cinzel text-xs font-bold text-[#2e1f0e] tracking-widest uppercase flex items-center gap-1.5">
                          <BookMarked className="h-3.5 w-3.5 text-[#9a7318]" />
                          <span>Folio I: Harry Potter Narrating</span>
                        </span>
                        <span className="font-serif italic text-xs text-[#523719]">
                          Restricted Section Archives
                        </span>
                      </div>

                      {/* Harry Potter Living Portrait in Gold Frame */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#ecdcc0]/70 p-3.5 rounded-xl border border-[#c59b27]/50 shadow-inner">
                        {/* Portrait with Candlelight Glow & Speaking Indicator */}
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden border-2 border-[#c59b27] shadow-[0_8px_20px_rgba(0,0,0,0.35)] bg-[#071120] group">
                          <img
                            src={ASSETS.harryNarrator}
                            alt="Harry Potter Narrating"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {isNarrating && (
                            <div className="absolute bottom-1 left-1 right-1 py-0.5 rounded bg-[#060c18]/90 text-[9px] text-[#f3d069] font-mono text-center flex items-center justify-center gap-1 shadow border border-[#c59b27]/40">
                              <span
                                className="w-1 bg-[#f3d069] rounded-full animate-pulse"
                                style={{ height: `${6 + audioLevel * 10}px` }}
                              />
                              <span
                                className="w-1 bg-[#fef08a] rounded-full animate-pulse"
                                style={{ height: `${10 + audioLevel * 14}px` }}
                              />
                              <span
                                className="w-1 bg-[#f3d069] rounded-full animate-pulse"
                                style={{ height: `${6 + audioLevel * 8}px` }}
                              />
                              <span className="ml-0.5">Speaking</span>
                            </div>
                          )}
                        </div>

                        {/* Character Voice Controls */}
                        <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h3 className="font-cinzel text-base sm:text-lg font-black text-[#1b1005]">
                              Harry Potter
                            </h3>
                          </div>
                          <p className="text-xs text-[#482c13] font-serif italic truncate">
                            "Listen carefully. I don't have much time to explain..."
                          </p>

                          <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            {isNarrating ? (
                              <button
                                onClick={handleStopHarryNarration}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-amber-100 text-xs font-cinzel font-bold shadow-md transition-colors cursor-pointer"
                              >
                                <Square className="h-3 w-3 fill-current" />
                                <span>Pause Voice</span>
                              </button>
                            ) : (
                              <button
                                onClick={handlePlayHarryNarration}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#9a7318] to-[#c59b27] hover:from-[#c59b27] hover:to-[#f3d069] text-[#060c18] text-xs font-cinzel font-bold shadow-md transition-all cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>Play Harry's Voice</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Full Escape Briefing Header Banner */}
                      <div className="pt-1">
                        <div className="w-full px-3.5 py-2 rounded-lg text-xs font-cinzel flex items-center justify-between border border-[#c59b27] bg-[#091526] text-[#f3d069] shadow-md">
                          <span className="flex items-center gap-2 font-bold tracking-wide">
                            <Feather className="h-4 w-4 text-[#f3d069]" />
                            <span>✦ Full Escape Briefing ✦</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#f3d069] bg-[#c59b27]/25 px-2.5 py-0.5 rounded border border-[#c59b27]/40 tracking-wider">
                            90-Minute Deadline
                          </span>
                        </div>
                      </div>

                      {/* Manuscript Narrative Paragraph with Drop Cap & Antique Styling */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede0cb]/85 border border-[#c59b27]/40 shadow-inner max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-2">
                        <div className="space-y-2 font-serif text-xs sm:text-[13px] text-[#1b0e03] leading-relaxed italic">
                          <h4 className="font-cinzel text-xs font-bold text-[#2b1808] uppercase tracking-wider not-italic flex items-center gap-1.5 mb-2 sticky top-0 bg-[#ede0cb]/95 py-0.5 border-b border-[#c59b27]/30 z-10">
                            <Feather className="h-3.5 w-3.5 text-[#9a7318]" />
                            <span>✦ The Ancient Prison Beneath Hogwarts ✦</span>
                          </h4>
                          <p className="drop-cap">
                            Listen carefully. I don't have much time to explain.
                          </p>
                          <p>
                            What I'm about to tell you might be the most dangerous thing you'll ever hear.
                          </p>
                          <p>
                            Beneath the grounds of Hogwarts lies an ancient prison. A place built to contain the magic that even the Ministry of Magic was afraid to control.
                          </p>
                          <p>
                            For years, its doors remained sealed. Its enchantments remained unbroken.
                          </p>
                          <p className="font-semibold text-[#3a1d08]">
                            Until tonight.
                          </p>
                          <p>
                            Someone has tampered with the prison's magical security system. The spells protecting its chambers have been corrupted, the locks have become unpredictable, and something that should never have escaped is now roaming the corridors.
                          </p>
                          <p>
                            And somehow… you've ended up inside.
                          </p>
                          <p className="font-semibold text-[#3a1d08]">
                            There is only one way out.
                          </p>
                          <p>
                            The prison is divided into chambers, each protected by an enchanted door. These doors cannot be opened by ordinary spells. You'll need to solve the mathematical enchantments, uncover hidden codes, repair broken spells, and outsmart the security system protecting each chamber.
                          </p>
                          <p>
                            But be warned. Not every answer will be obvious, and not every path will lead you forward.
                          </p>
                          <p>
                            The prison is already aware of your presence. Every second you spend here brings it closer to finding you.
                          </p>
                          <p className="font-bold text-[#801b0b]">
                            You have ninety minutes.
                          </p>
                          <p>
                            Ninety minutes to solve the puzzles. Ninety minutes to unlock the chambers. Ninety minutes to reach the final door.
                          </p>
                          <p>
                            If you fail, the prison's defenses will activate, and you may never find your way out.
                          </p>
                          <p>
                            I'll guide you whenever I can, but I cannot solve these challenges for you.
                          </p>
                          <p>
                            Your intelligence is your greatest weapon. Your teamwork is your only advantage.
                          </p>
                          <p>
                            So stay alert. Trust your reasoning. Check every number, every symbol, every line of code.
                          </p>
                          <p>
                            And whatever you do…
                          </p>
                          <div className="my-2 p-2 rounded-lg bg-red-950/15 border border-red-900/60 shadow-md flex items-center justify-between gap-2.5 animate-pulse">
                            <span className="text-red-700 font-bold text-xs">✦</span>
                            <p className="font-black text-sm not-italic text-red-950 tracking-wider font-cinzel text-center drop-shadow-xs flex-1 uppercase">
                              Don't let it catch you.
                            </p>
                            <span className="text-red-700 font-bold text-xs">✦</span>
                          </div>
                          <p>
                            Now, get moving.
                          </p>
                          <p className="font-black text-xs not-italic text-[#781808] uppercase tracking-wider font-cinzel">
                            Your escape begins… NOW.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Left Page Footer */}
                    <div className="pt-3 border-t border-[#c59b27]/40 flex items-center justify-between text-[11px] text-[#4f3316] font-serif">
                      <span>Order of the Phoenix Archives</span>
                      <span>Folio Page I</span>
                    </div>
                  </div>

                  {/* ================= RIGHT PAGE (FOLIO II): THE DARK PROTOCOL ROADMAP ================= */}
                  <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between relative book-spine-crease bg-[#f7eedd]/90">
                    <div className="space-y-3.5">
                      {/* Antique Page Header */}
                      <div className="flex items-center justify-between border-b border-[#c59b27]/40 pb-2">
                        <span className="font-serif italic text-xs text-[#523719]">
                          The Cyber & Arithmancy Gauntlet
                        </span>
                        <span className="font-cinzel text-xs font-bold text-[#2e1f0e] tracking-widest uppercase flex items-center gap-1.5">
                          <Map className="h-3.5 w-3.5 text-[#9a7318]" />
                          <span>Folio II · Prison Escape Roadmap</span>
                        </span>
                      </div>

                      {/* IN-BOOK ROADMAP SHOWCASE PLATE */}
                      <div className="rounded-xl overflow-hidden border-2 border-[#c59b27] bg-[#030814] text-slate-100 p-3 sm:p-4 shadow-xl space-y-3 relative">
                        {/* Ambient Aura */}
                        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-sky-950/40 via-cyan-900/10 to-transparent pointer-events-none" />

                        {/* Plate Header: Exact Titles & Quotation */}
                        <div className="relative z-10 text-center space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800 pb-1.5">
                            <span className="text-slate-300 font-serif italic text-[11px]">
                              “Six doors. Seven challenges. One way out.”
                            </span>
                            <span className="text-[#fef08a] font-serif font-bold flex items-center gap-1.5 bg-[#121c2c] px-2.5 py-0.5 rounded border border-[#d4af37]/60">
                              <Clock className="w-3 h-3 text-[#f3d069]" />
                              <span>
                                TIME REMAINING: {isLoggedIn ? `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}` : '90:00'}
                              </span>
                              {!isLoggedIn && (
                                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-950/90 text-amber-300 border border-amber-600/60 uppercase">
                                  Standby
                                </span>
                              )}
                            </span>
                          </div>

                          <h3
                            className="text-base sm:text-lg font-serif font-black tracking-[0.2em] text-[#bae6fd] uppercase pt-1"
                            style={{ fontFamily: "var(--font-cinzel), Georgia, serif" }}
                          >
                            THE DARK PROTOCOL
                          </h3>

                          {/* Geometric cyber frame with subtitle */}
                          <div className="inline-block px-3 py-0.5 rounded bg-[#031526] border border-cyan-400/80 text-[10px] font-sans font-bold tracking-[0.25em] text-[#38bdf8] uppercase">
                            THE AI LOCKDOWN
                          </div>

                          <div className="text-[10px] font-serif font-bold tracking-[0.3em] text-[#f59e0b] uppercase">
                            GAME ROADMAP
                          </div>
                        </div>

                        {/* Interactive 7 Gates Horizontal Strip inside the Book */}
                        <div className="relative z-10 bg-black/60 rounded-lg p-2 border border-slate-800/90">
                          <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between px-1">
                            <span>SEVEN GATES CORRIDOR:</span>
                            <span className="text-cyan-300 font-semibold text-[9px]">Click any door to inspect challenges</span>
                          </div>

                          <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
                            <div className="flex items-center gap-2 min-w-[530px] py-1">
                              {ROADMAP_GATES.map((gate) => (
                                <div
                                  key={gate.id}
                                  onClick={() => {
                                    sound.playSparkle();
                                    setSelectedGate(gate);
                                  }}
                                  className="w-[72px] shrink-0 cursor-pointer group flex flex-col items-center p-1.5 rounded-lg bg-[#070e1c] border hover:border-amber-400 transition-all text-center shadow-md hover:-translate-y-0.5"
                                  style={{ borderColor: `${gate.borderColor}55` }}
                                >
                                  {/* Gate Thumbnail */}
                                  <div className="relative w-12 h-16 rounded-t-md overflow-hidden border border-slate-700 bg-black">
                                    <img
                                      src={gate.imageUrl}
                                      alt={gate.title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {/* Gate Number Badge */}
                                    <div
                                      className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/85 text-[8px] font-bold text-white flex items-center justify-center border"
                                      style={{ borderColor: gate.borderColor, color: gate.accentColor }}
                                    >
                                      {gate.gateNumber}
                                    </div>
                                  </div>

                                  {/* Title & Zone */}
                                  <span
                                    className="text-[8px] font-bold font-serif truncate w-full mt-1 uppercase"
                                    style={{ color: gate.accentColor }}
                                    title={gate.title}
                                  >
                                    {gate.title.split(' ')[0].replace(/,/g, '')}
                                  </span>

                                  <span
                                    className={`text-[7px] font-mono font-bold uppercase px-1 rounded truncate w-full mt-0.5 ${
                                      gate.zoneType === 'SAFE ZONE'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                        : gate.zoneType === 'ELIMINATION ZONE'
                                        ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                                        : 'bg-amber-950 text-amber-300 border border-amber-600/60'
                                    }`}
                                  >
                                    {gate.zoneType === 'SAFE ZONE' ? 'SAFE' : gate.zoneType === 'ELIMINATION ZONE' ? 'ELIM' : 'EXIT'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Option to View Full Roadmap */}
                        {onOpenRoadmap && (
                          <div className="relative z-10 pt-1">
                            <button
                              onClick={onOpenRoadmap}
                              className="w-full py-2.5 px-4 rounded-xl border border-cyan-400/80 bg-gradient-to-r from-[#031525] via-[#092547] to-[#031525] hover:border-cyan-300 text-cyan-200 font-cinzel font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_24px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Maximize2 className="h-4 w-4 text-cyan-400" />
                              <span>View Panoramic Roadmap (Fullscreen)</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Briefing summary notice */}
                      <div className="p-2.5 rounded-lg bg-[#ede0cb]/80 border border-[#c59b27]/40 text-xs text-[#241306] flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#9a7318] shrink-0" />
                        <p className="text-[11px] font-serif leading-tight">
                          Inspect all 7 gates above, decode the files, or flip to the portal to begin your mission.
                        </p>
                      </div>
                    </div>

                    {/* FLIP PAGE ACTION: Enter Module Portal */}
                    <div className="pt-3 border-t border-[#c59b27]/40 space-y-1.5">
                      <button
                        onClick={handlePageFlipToPortal}
                        disabled={isFlippingToPortal}
                        className="w-full py-3 px-6 rounded-xl border border-[#c59b27] bg-gradient-to-r from-[#091526] via-[#12233f] to-[#091526] hover:from-[#0d1d36] hover:to-[#0d1d36] text-[#f3d069] font-cinzel font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-[0_0_25px_rgba(197,155,39,0.4)] flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <span>Flip Page & Enter Main Module Portal</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform text-[#f3d069]" />
                      </button>
                      <p className="text-center text-[10px] text-[#4f3316] font-mono">
                        ✦ Unlocks Round 1, Live Dashboard & The 50th Chamber AI Oracle ✦
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* VIEW B: FULL IN-BOOK ROADMAP SPREAD (THE DARK PROTOCOL 7 GATES CORRIDOR)  */
                /* ========================================================================= */
                <div className="rounded-xl overflow-hidden bg-[#030713] text-slate-100 p-4 sm:p-6 border border-[#c59b27]/60 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] relative z-10 flex flex-col justify-between min-h-[580px]">
                  
                  {/* Top Bar of In-Book Roadmap */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    {/* Left Quote */}
                    <div className="text-center md:text-left">
                      <span className="text-xs sm:text-sm font-serif italic text-slate-300">
                        “Six doors. Seven challenges. One way out.”
                      </span>
                    </div>

                    {/* Center Title */}
                    <div className="text-center">
                      <h2
                        className="text-lg sm:text-xl font-serif font-black tracking-[0.22em] text-[#bae6fd] uppercase"
                        style={{ fontFamily: "var(--font-cinzel), Georgia, serif" }}
                      >
                        THE DARK PROTOCOL
                      </h2>
                      <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                        THE AI LOCKDOWN · GAME ROADMAP
                      </div>
                    </div>

                    {/* Right: Quick Actions & Timer */}
                    <div className="flex items-center gap-2.5">
                      <div className="px-3 py-1 rounded bg-[#091220] border border-[#d4af37]/70 flex items-center gap-2 text-xs font-mono font-bold text-[#fef08a]">
                        <Clock className="w-3.5 h-3.5 text-[#f3d069]" />
                        <span>90:00</span>
                      </div>

                      {onOpenRoadmap && (
                        <button
                          onClick={onOpenRoadmap}
                          className="px-2.5 py-1 rounded bg-[#071c35] border border-cyan-400 text-[11px] font-mono text-cyan-200 hover:text-white transition-colors flex items-center gap-1 shadow-sm"
                          title="Open Widescreen View"
                        >
                          <Maximize2 className="w-3 h-3 text-cyan-400" />
                          <span>Fullscreen</span>
                        </button>
                      )}

                      <button
                        onClick={() => setBookFolioTab('briefing')}
                        className="px-2.5 py-1 rounded bg-black/60 border border-slate-700 text-[11px] font-mono text-amber-200 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Briefing</span>
                      </button>
                    </div>
                  </div>

                  {/* Panoramic In-Book Gates Corridor & Information Cards */}
                  <div className="w-full overflow-x-auto py-3 scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="min-w-[1100px] px-2">
                      {/* Gate Artworks Row */}
                      <div className="grid grid-cols-7 gap-3 items-end">
                        {ROADMAP_GATES.map((gate) => {
                          const status = gateStatuses[gate.id] || gate.defaultStatus;
                          return (
                            <div
                              key={gate.id}
                              onClick={() => {
                                sound.playWandSpellCast();
                                setSelectedGate(gate);
                              }}
                              className="cursor-pointer group flex flex-col items-center transition-all duration-300 hover:-translate-y-1"
                            >
                              <GateArtwork gate={gate} status={status} isHovered={false} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Continuous Glowing Energy Line */}
                      <div className="relative w-full h-8 -my-1 flex items-center justify-between pointer-events-none">
                        <div className="absolute inset-x-6 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-200 to-cyan-400 shadow-[0_0_10px_#38bdf8]" />
                        <div className="relative w-full grid grid-cols-7 px-4">
                          {ROADMAP_GATES.map((gate) => (
                            <div key={`dot-${gate.id}`} className="flex justify-center items-center">
                              <div
                                className="w-3 h-3 rounded-full border border-white flex items-center justify-center"
                                style={{ backgroundColor: gate.accentColor, boxShadow: `0 0 10px ${gate.accentColor}` }}
                              >
                                <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Information Cards Row */}
                      <div className="grid grid-cols-7 gap-3 items-start mt-1">
                        {ROADMAP_GATES.map((gate) => {
                          const status = gateStatuses[gate.id] || gate.defaultStatus;
                          return (
                            <div
                              key={`card-book-${gate.id}`}
                              onClick={() => {
                                sound.playSparkle();
                                setSelectedGate(gate);
                              }}
                              className="relative cursor-pointer group flex flex-col justify-between rounded-lg transition-all duration-200 min-h-[260px] p-2.5 bg-[#050b18]/95 border hover:border-amber-400 shadow-lg"
                              style={{ borderColor: `${gate.borderColor}55` }}
                            >
                              {/* Round Number Badge */}
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center font-serif font-black text-xs text-white shadow"
                                  style={{ backgroundColor: '#030814', border: `1.5px solid ${gate.borderColor}`, color: gate.accentColor }}
                                >
                                  {gate.gateNumber}
                                </div>
                              </div>

                              {/* Title & Category */}
                              <div className="pt-2 text-center">
                                <h4
                                  className="text-[11px] font-serif font-bold tracking-wide uppercase line-clamp-2"
                                  style={{ color: gate.accentColor, fontFamily: "var(--font-cinzel), Georgia, serif" }}
                                >
                                  {gate.title}
                                </h4>
                                <div className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-300 truncate">
                                  {gate.category}
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-[10px] text-slate-300 font-sans leading-relaxed line-clamp-3 my-2 text-center">
                                {gate.description}
                              </p>

                              {/* Meta: File & Time */}
                              <div className="space-y-1 text-[9px] font-mono border-t border-slate-800 pt-1.5">
                                {Boolean(
                                  gate.file &&
                                  gate.file.trim() !== '' &&
                                  !gate.file.toLowerCase().includes('no file') &&
                                  gate.gateNumber !== 5 &&
                                  gate.gateNumber !== 6 &&
                                  gate.gateNumber !== 7
                                ) && (
                                  <div className="flex items-center justify-between text-slate-400">
                                    <span>File:</span>
                                    <span className="font-semibold truncate max-w-[80px]" style={{ color: gate.accentColor }}>
                                      {gate.file}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Time:</span>
                                  <span className="text-amber-300 font-semibold">{gate.targetTime}</span>
                                </div>
                              </div>

                              {/* Zone Badge */}
                              <div className="mt-2 pt-1 border-t border-slate-800/80">
                                <div
                                  className={`w-full py-0.5 rounded text-center text-[8px] font-mono font-bold tracking-wider uppercase ${
                                    gate.zoneType === 'SAFE ZONE'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                                      : gate.zoneType === 'ELIMINATION ZONE'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                                      : 'bg-amber-950 text-amber-300 border border-amber-500/60'
                                  }`}
                                >
                                  {gate.zoneType}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer of In-Book Roadmap */}
                  <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p
                      className="text-xs font-serif font-bold tracking-[0.25em] text-[#d4af37] uppercase text-center sm:text-left"
                      style={{ fontFamily: "var(--font-cinzel), Georgia, serif" }}
                    >
                      YOUR SKILLS + YOUR TEAM = YOUR ESCAPE
                    </p>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setBookFolioTab('briefing')}
                        className="py-2 px-3 rounded-lg border border-slate-700 bg-black/60 hover:bg-slate-800 text-xs font-cinzel text-slate-300 transition-colors"
                      >
                        Back to Briefing
                      </button>

                      <button
                        onClick={handlePageFlipToPortal}
                        disabled={isFlippingToPortal}
                        className="flex-1 sm:flex-initial py-2 px-5 rounded-lg border border-[#c59b27] bg-gradient-to-r from-[#091526] via-[#12233f] to-[#091526] hover:from-[#0d1d36] hover:to-[#0d1d36] text-[#f3d069] font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>Enter Module Portal</span>
                        <ChevronRight className="h-3.5 w-3.5 text-[#f3d069]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </main>

          {/* Clean Bottom Footer Bar */}
          <footer className="relative z-20 w-full max-w-6xl mx-auto pt-2 flex items-center justify-between text-[11px] text-slate-300 font-serif border-t border-[#c59b27]/20">
            <div>Hogwarts School of Witchcraft and Wizardry · Cryptography Division</div>
            <div className="flex items-center gap-1.5 text-[#f3d069]">
              <Sparkles className="h-3 w-3" />
              <span>Lumos Spell Active</span>
            </div>
          </footer>
        </div>
      )}

      {/* Cinematic Narration Storybook Modal (Available in all stages) */}
      <CinematicNarrationPlayer
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* Gate Detail Inspection Modal */}
      {selectedGate && (
        <GateDetailModal
          gate={selectedGate}
          status={gateStatuses[selectedGate.id] || selectedGate.defaultStatus}
          onClose={() => setSelectedGate(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};
