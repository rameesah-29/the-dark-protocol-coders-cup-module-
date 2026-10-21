import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  BookOpen,
  Sliders,
  Check,
  ChevronRight,
  Info,
  Radio
} from 'lucide-react';
import { CharacterId, getCharacterVoiceConfig, CharacterVoiceConfig } from '../config/characterVoices';
import { narration } from '../utils/narrationEngine';
import { HOGWARTS_CHRONICLES_SCENES, ChroniclesStoryScene } from '../data/storyScenes';
import { sound } from '../utils/audio';

interface CinematicNarrationPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSceneIndex?: number;
  customCharacter?: CharacterId;
  customText?: string;
  customTitle?: string;
}

const renderDialogueFormatted = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={idx}
          className="font-bold text-red-400 not-italic px-1.5 py-0.5 rounded bg-red-950/40 border border-red-800/40 tracking-wide text-shadow-sm inline-flex items-center gap-1 mx-1"
        >
          <span className="text-red-500 animate-pulse text-[11px]">✦</span>
          <span>{inner}</span>
          <span className="text-red-500 animate-pulse text-[11px]">✦</span>
        </strong>
      );
    }
    return part;
  });
};

export const CinematicNarrationPlayer: React.FC<CinematicNarrationPlayerProps> = ({
  isOpen,
  onClose,
  initialSceneIndex = 0,
  customCharacter,
  customText,
  customTitle,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(initialSceneIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'narration' | 'scenes' | 'voiceConfig'>('narration');
  const [engineStatus, setEngineStatus] = useState<{ provider: string; isElevenLabsPermitted: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/tts/status')
      .then((res) => res.json())
      .then((data) => setEngineStatus(data))
      .catch(() => {});
  }, []);

  const currentScene: ChroniclesStoryScene = HOGWARTS_CHRONICLES_SCENES[currentSceneIdx] || HOGWARTS_CHRONICLES_SCENES[0];
  const activeCharId: CharacterId = customCharacter || currentScene.character;
  const activeDialogue: string = customText || currentScene.dialogue;
  const activeTitle: string = customTitle || currentScene.sceneTitle;
  const charConfig: CharacterVoiceConfig = getCharacterVoiceConfig(activeCharId);

  // Sync volume with narration engine
  useEffect(() => {
    narration.setVolume(volume);
  }, [volume]);

  // Sync mute state
  useEffect(() => {
    narration.setMuted(isMuted);
  }, [isMuted]);

  // When opened, or scene changes, automatically initiate dialogue
  useEffect(() => {
    if (!isOpen) {
      narration.stopCharacterDialogue();
      setIsPlaying(false);
      return;
    }

    startNarrationForCurrentScene();

    return () => {
      narration.stopCharacterDialogue();
    };
  }, [isOpen, currentSceneIdx, customCharacter, customText]);

  const startNarrationForCurrentScene = () => {
    setIsLoading(true);
    setStatusMessage('✨ Preparing the spell...');

    narration.playCharacterDialogue(activeCharId, activeDialogue, {
      emotion: customCharacter ? undefined : currentScene.emotion,
      onStart: () => {
        setIsLoading(false);
        setIsPlaying(true);
        setStatusMessage('');
      },
      onProgress: (p, cur, dur) => {
        setProgress(p);
        setCurrentTime(cur);
        setDuration(dur);
      },
      onAudioLevel: (lvl) => {
        setAudioLevel(lvl);
      },
      onEnd: () => {
        setIsPlaying(false);
        setAudioLevel(0);
        setProgress(100);
        // Handle auto-advance to next scene if in storybook mode
        if (autoAdvance && !customText && currentSceneIdx < HOGWARTS_CHRONICLES_SCENES.length - 1) {
          setTimeout(() => {
            setCurrentSceneIdx((prev) => prev + 1);
          }, 1400);
        }
      },
      onFallback: (msg) => {
        setStatusMessage(msg);
      },
      onError: (err) => {
        setIsLoading(false);
        setIsPlaying(false);
        setStatusMessage(err);
      },
    });
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      narration.pauseCharacterDialogue();
      setIsPlaying(false);
    } else {
      if (progress >= 100) {
        startNarrationForCurrentScene();
      } else {
        narration.resumeCharacterDialogue();
        setIsPlaying(true);
      }
    }
  };

  const handleReplay = () => {
    sound.playSparkle();
    setProgress(0);
    startNarrationForCurrentScene();
  };

  const handleSkipNext = () => {
    sound.playPageTurn();
    if (currentSceneIdx < HOGWARTS_CHRONICLES_SCENES.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSkipPrev = () => {
    sound.playPageTurn();
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((prev) => prev - 1);
    }
  };

  const handleSelectScene = (index: number) => {
    sound.playPageTurn();
    setCurrentSceneIdx(index);
    setActiveTab('narration');
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
        {/* Dimmed Theatrical Vignette Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#030712]/85 backdrop-blur-md z-0"
        />

        {/* Ambient colored starlight motes */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[140px] opacity-25"
            style={{ backgroundColor: charConfig.houseColor }}
          />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px]" />
        </div>

        {/* Main Cinematic Storybook Dialog Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-[#c59b27]/80 bg-gradient-to-b from-[#091526] via-[#0b1c33] to-[#060c18] shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(197,155,39,0.35)] overflow-hidden text-slate-100"
        >
          {/* Top Bar: Scene Title & Actions */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#c59b27]/40 bg-[#060c18]/90">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-cinzel font-bold shadow-md"
                style={{
                  borderColor: charConfig.houseColor,
                  color: charConfig.houseColor,
                  backgroundColor: `${charConfig.houseColor}15`,
                }}
              >
                ✦
              </div>
              <div>
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#fef9c3] tracking-wide">
                  {activeTitle}
                </h3>
                <p className="text-[11px] text-slate-300 font-serif italic">
                  {customText ? 'Interactive Voice Narration' : `Scene ${currentScene.sceneNumber} of ${HOGWARTS_CHRONICLES_SCENES.length} · ${currentScene.location}`}
                </p>
              </div>
            </div>

            {/* Navigation Tabs & Close */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-[#060c18] p-1 rounded-xl border border-[#c59b27]/30">
                <button
                  onClick={() => setActiveTab('narration')}
                  className={`px-3 py-1 rounded-lg text-xs font-cinzel transition-all cursor-pointer ${
                    activeTab === 'narration'
                      ? 'bg-[#c59b27] text-[#060c18] font-bold shadow'
                      : 'text-slate-300 hover:text-amber-200'
                  }`}
                >
                  Narration
                </button>
                <button
                  onClick={() => setActiveTab('scenes')}
                  className={`px-3 py-1 rounded-lg text-xs font-cinzel transition-all cursor-pointer ${
                    activeTab === 'scenes'
                      ? 'bg-[#c59b27] text-[#060c18] font-bold shadow'
                      : 'text-slate-300 hover:text-amber-200'
                  }`}
                >
                  All Scenes ({HOGWARTS_CHRONICLES_SCENES.length})
                </button>
                <button
                  onClick={() => setActiveTab('voiceConfig')}
                  className={`px-3 py-1 rounded-lg text-xs font-cinzel transition-all cursor-pointer ${
                    activeTab === 'voiceConfig'
                      ? 'bg-[#c59b27] text-[#060c18] font-bold shadow'
                      : 'text-slate-300 hover:text-amber-200'
                  }`}
                >
                  Voice Profile
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-[#c59b27]/40 hover:border-amber-400 bg-[#091526] hover:bg-[#0f213a] text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                title="Close Narration"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* MAIN STAGE AREA */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {activeTab === 'narration' && (
              <>
                {/* Character Portrait & Illuminated Stage */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-[#060c18]/80 p-5 sm:p-6 rounded-2xl border border-[#c59b27]/50 shadow-inner relative overflow-hidden">
                  {/* Speaking Aura Ring & Oil Painting Portrait */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    {/* Audio-Reactive Speaking Glow Rings */}
                    <motion.div
                      animate={{
                        scale: isPlaying ? [1, 1 + audioLevel * 0.22, 1] : 1,
                        opacity: isPlaying ? [0.4, 0.85, 0.4] : 0.2,
                      }}
                      transition={{ duration: 0.25, repeat: isPlaying ? Infinity : 0 }}
                      className="absolute -inset-3 rounded-full blur-xl pointer-events-none"
                      style={{ backgroundColor: charConfig.houseColor }}
                    />

                    {/* Outer Gold Filigree Ring with Audio Waves */}
                    <div
                      className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] border-2 transition-all duration-300"
                      style={{
                        borderColor: isPlaying ? '#f3d069' : '#c59b27',
                        boxShadow: isPlaying
                          ? `0 0 ${20 + audioLevel * 30}px ${charConfig.houseColor}`
                          : '0 8px 25px rgba(0,0,0,0.7)',
                      }}
                    >
                      {/* Living Oil Portrait with subtle breathing */}
                      <motion.div
                        animate={
                          isPlaying
                            ? {
                                scale: [1, 1.025, 1],
                                rotate: [0, 0.5, -0.5, 0],
                              }
                            : { scale: 1 }
                        }
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-full rounded-full overflow-hidden bg-[#071120] relative"
                      >
                        <img
                          src={charConfig.avatar}
                          alt={charConfig.name}
                          className="h-full w-full object-cover select-none"
                        />

                        {/* Speaking Wave Bar Indicator */}
                        {isPlaying && (
                          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 bg-[#060c18]/85 py-1 backdrop-blur-xs">
                            <span
                              className="w-1 bg-amber-300 rounded-full animate-pulse"
                              style={{ height: `${8 + audioLevel * 14}px` }}
                            />
                            <span
                              className="w-1 bg-amber-400 rounded-full animate-pulse"
                              style={{ height: `${12 + audioLevel * 18}px` }}
                            />
                            <span
                              className="w-1 bg-yellow-200 rounded-full animate-pulse"
                              style={{ height: `${6 + audioLevel * 12}px` }}
                            />
                            <span className="text-[9px] font-cinzel font-bold text-[#f3d069] ml-1">
                              Speaking
                            </span>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Floating magical sparkles while speaking */}
                    {isPlaying && (
                      <div className="absolute -top-1 -right-1 text-amber-300 animate-spin">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Character Meta & Speech Identity */}
                  <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <h2 className="font-cinzel text-xl sm:text-2xl font-black text-[#fef9c3] tracking-wide">
                        {charConfig.name}
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a182d] border border-[#c59b27]/40 text-[#f3d069] font-mono">
                        {charConfig.speakingStyle.defaultEmotion} delivery
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-serif">
                      {charConfig.title}
                    </p>

                    <p className="text-xs text-[#f3d069] font-serif italic max-w-xl">
                      "{charConfig.signatureQuote}"
                    </p>

                    {/* Voice Delivery Traits */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                      {charConfig.speakingStyle.traits.map((trait, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#0a182d] text-slate-300 border border-[#c59b27]/20"
                        >
                          ✦ {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtitles & Spoken Dialogue Scroll */}
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#c59b27]/60 bg-gradient-to-b from-[#0e1d35] to-[#081222] shadow-xl relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between border-b border-[#c59b27]/30 pb-2.5">
                    <span className="font-cinzel text-xs font-bold text-[#f3d069] uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Synchronized Dialogue Subtitles</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isLoading ? 'Invoking Spell...' : isPlaying ? 'Voice Stream Live' : 'Ready'}
                    </span>
                  </div>

                  {/* Dialogue Text with Illuminated Lettering */}
                  <p className="font-serif text-base sm:text-lg text-[#fef9c3] leading-relaxed drop-cap tracking-wide selection:bg-amber-500/40">
                    {renderDialogueFormatted(activeDialogue)}
                  </p>

                  {/* Loading / Fallback Status Banner */}
                  {(isLoading || statusMessage) && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-[#f3d069] font-cinzel animate-pulse">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{statusMessage || '✨ Invoking character voice from the Restricted Archives...'}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: ALL STORY SCENES */}
            {activeTab === 'scenes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-sm font-bold text-[#f3d069]">
                    ✦ Hogwarts Chronicles Storybook Gauntlet ✦
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {HOGWARTS_CHRONICLES_SCENES.length} Cinematic Scenes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOGWARTS_CHRONICLES_SCENES.map((sc, sIdx) => {
                    const sceneChar = getCharacterVoiceConfig(sc.character);
                    const isSelected = currentSceneIdx === sIdx;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => handleSelectScene(sIdx)}
                        className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-[#0e213d] border-[#f3d069] shadow-[0_0_20px_rgba(243,208,105,0.25)]'
                            : 'bg-[#060c18] border-[#c59b27]/30 hover:border-[#c59b27] hover:bg-[#091526]'
                        }`}
                      >
                        <img
                          src={sceneChar.avatar}
                          alt={sceneChar.name}
                          className="h-12 w-12 rounded-xl object-cover border border-[#c59b27]/50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs font-cinzel font-bold">
                            <span className="text-[#fef9c3]">
                              Scene {sc.sceneNumber}: {sceneChar.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0a182d] text-[#f3d069]">
                              {sc.emotion}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">
                            {sc.sceneTitle}
                          </div>
                          <p className="text-[10px] text-slate-400 font-serif line-clamp-1 italic mt-1">
                            "{sc.dialogue}"
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: VOICE CONFIGURATION & LICENSED VOICES */}
            {activeTab === 'voiceConfig' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#c59b27]/40 bg-[#060c18] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#f3d069]" />
                      <h4 className="font-cinzel text-sm font-bold text-[#fef9c3]">
                        Character Voice Mapping Architecture
                      </h4>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-950/80 border border-amber-500/50 text-amber-200 self-start sm:self-auto">
                      {engineStatus?.provider === 'elevenlabs'
                        ? '✦ ElevenLabs Neural AI Active'
                        : '✦ Hogwarts Acoustic Voice Engine Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-serif leading-relaxed">
                    Every character maps to an authentic vocal cadence profile, pitch curves, and character-specific chimes. When external slots or permissions are unavailable, the built-in Hogwarts acoustic synthesis automatically delivers authentic movie dialogue.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'harry',
                    'hermione',
                    'ron',
                    'dumbledore',
                    'snape',
                    'hagrid',
                    'mcgonagall',
                  ].map((cid) => {
                    const c = getCharacterVoiceConfig(cid);
                    return (
                      <div
                        key={cid}
                        className="p-3.5 rounded-xl border border-[#c59b27]/30 bg-[#071120] space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-10 w-10 rounded-full object-cover border border-[#c59b27]"
                          />
                          <div>
                            <div className="font-cinzel text-xs font-bold text-[#fef9c3]">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Voice ID: {c.voiceId}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center pt-1 border-t border-[#c59b27]/20">
                          <div className="p-1 rounded bg-[#091526]">
                            <span className="text-slate-400 block">Stability</span>
                            <span className="text-[#f3d069]">
                              {c.elevenLabsSettings.stability}
                            </span>
                          </div>
                          <div className="p-1 rounded bg-[#091526]">
                            <span className="text-slate-400 block">Similarity</span>
                            <span className="text-[#f3d069]">
                              {c.elevenLabsSettings.similarity_boost}
                            </span>
                          </div>
                          <div className="p-1 rounded bg-[#091526]">
                            <span className="text-slate-400 block">Speed</span>
                            <span className="text-[#f3d069]">
                              {c.speakingStyle.speed}x
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS & TIMELINE ZONE */}
          <div className="px-5 py-4 border-t border-[#c59b27]/50 bg-[#050b14] space-y-3">
            {/* Progress Bar & Timestamps */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{formatSeconds(currentTime)}</span>
                <span className="text-[#f3d069]">
                  {progress > 0 ? `${Math.round(progress)}% Complete` : 'Ready to listen'}
                </span>
                <span>{duration > 0 ? formatSeconds(duration) : '0:00'}</span>
              </div>

              <div className="h-2 w-full bg-[#0a1628] rounded-full overflow-hidden border border-[#c59b27]/30 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#9a7318] via-[#f3d069] to-[#fef9c3] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Action Buttons Zone */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              {/* Left: Previous, Play/Pause, Next, Replay */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkipPrev}
                  disabled={currentSceneIdx === 0}
                  className="p-2 rounded-xl border border-[#c59b27]/40 bg-[#091526] hover:bg-[#0f213a] disabled:opacity-40 text-slate-200 text-xs transition-colors cursor-pointer"
                  title="Previous Scene"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] hover:from-[#d4af37] hover:to-[#e2b947] text-[#060c18] font-cinzel font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[0_0_20px_rgba(243,208,105,0.4)] flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  <span>{isLoading ? 'Invoking Voice...' : isPlaying ? 'Pause' : 'Listen'}</span>
                </button>

                <button
                  onClick={handleReplay}
                  className="p-2 rounded-xl border border-[#c59b27]/40 bg-[#091526] hover:bg-[#0f213a] text-slate-200 text-xs transition-colors cursor-pointer"
                  title="Replay Dialogue"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={handleSkipNext}
                  className="p-2 rounded-xl border border-[#c59b27]/40 bg-[#091526] hover:bg-[#0f213a] text-slate-200 text-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="Skip Narration / Next Scene"
                >
                  <span className="hidden sm:inline text-xs font-cinzel">Skip</span>
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Right: Volume & Auto-advance */}
              <div className="flex items-center gap-4">
                {/* Auto-Advance checkbox */}
                {!customText && (
                  <label className="flex items-center gap-2 text-xs font-cinzel text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="accent-[#f3d069] rounded cursor-pointer"
                    />
                    <span className="hidden md:inline">Auto-play next scene</span>
                  </label>
                )}

                {/* Volume Slider & Mute Toggle */}
                <div className="flex items-center gap-2 bg-[#091526] px-3 py-1.5 rounded-xl border border-[#c59b27]/40">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-[#f3d069] hover:text-amber-200 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 sm:w-20 accent-[#f3d069] cursor-pointer"
                    title="Volume"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
