import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X, Volume2, Sparkles, UserCheck } from 'lucide-react';
import { CharacterAlert } from '../types';
import { CHARACTER_ALERTS } from '../data/moduleData';
import { sound } from '../utils/audio';
import { narration } from '../utils/narrationEngine';
import { CharacterId } from '../config/characterVoices';

type CornerLocation = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const CORNERS: CornerLocation[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

interface ActiveAlertState {
  character: CharacterAlert;
  message: string;
  id: number;
  corner: CornerLocation;
}

interface CharacterTimekeeperAlertProps {
  remainingMinutes: number;
  isTimerRunning?: boolean;
  onManualTriggerRequest?: (character: CharacterAlert) => void;
}

export const CharacterTimekeeperAlert: React.FC<CharacterTimekeeperAlertProps> = ({
  remainingMinutes,
  isTimerRunning = false,
}) => {
  const [activeAlert, setActiveAlert] = useState<ActiveAlertState | null>(null);
  const [nextSentinelSeconds, setNextSentinelSeconds] = useState(15 * 60);
  const lastCornerRef = useRef<CornerLocation | null>(null);

  // Trigger a character notification from any corner, changing corner location each time
  const triggerCharacter = (character?: CharacterAlert) => {
    const selectedChar = character || CHARACTER_ALERTS[Math.floor(Math.random() * CHARACTER_ALERTS.length)];
    const message = selectedChar.quoteTemplate(remainingMinutes);

    // Pick a corner different from the previous one so it always changes corner
    const availableCorners = CORNERS.filter((c) => c !== lastCornerRef.current);
    const nextCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    lastCornerRef.current = nextCorner;

    // Play character-specific voice via narration system
    narration.playCharacterDialogue(selectedChar.id as CharacterId, message, {
      emotion: 'urgent',
    });

    setActiveAlert({
      character: selectedChar,
      message,
      id: Date.now(),
      corner: nextCorner,
    });
  };

  // 15-minute recurring timer interval (only active after login when timer is running!)
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setNextSentinelSeconds((prev) => {
        if (prev <= 1) {
          triggerCharacter();
          return 15 * 60; // reset to 15 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, remainingMinutes]);

  // Auto-dismiss after 14 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timeout = setTimeout(() => {
      setActiveAlert(null);
    }, 14000);
    return () => clearTimeout(timeout);
  }, [activeAlert]);

  const handleDismiss = () => {
    sound.stopSpeaking();
    setActiveAlert(null);
  };

  // Minutes and seconds until next scheduled character check
  const minsLeft = Math.floor(nextSentinelSeconds / 60);
  const secsLeft = nextSentinelSeconds % 60;

  // Corner CSS placement classes (only from the 4 corners)
  const getCornerClasses = (corner: CornerLocation) => {
    switch (corner) {
      case 'top-left':
        return 'top-16 sm:top-20 left-4 sm:left-6';
      case 'top-right':
        return 'top-16 sm:top-20 right-4 sm:right-6';
      case 'bottom-left':
        return 'bottom-4 sm:bottom-6 left-4 sm:left-6';
      case 'bottom-right':
        return 'bottom-4 sm:bottom-6 right-4 sm:right-6';
    }
  };

  // Realistic entrance physics based on which corner it emerges from
  const getCornerAnimation = (corner: CornerLocation) => {
    switch (corner) {
      case 'top-left':
        return {
          initial: { opacity: 0, x: -140, y: -40, scale: 0.9 },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          exit: { opacity: 0, x: -140, scale: 0.85, transition: { duration: 0.3 } },
        };
      case 'top-right':
        return {
          initial: { opacity: 0, x: 140, y: -40, scale: 0.9 },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          exit: { opacity: 0, x: 140, scale: 0.85, transition: { duration: 0.3 } },
        };
      case 'bottom-left':
        return {
          initial: { opacity: 0, x: -140, y: 40, scale: 0.9 },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          exit: { opacity: 0, x: -140, scale: 0.85, transition: { duration: 0.3 } },
        };
      case 'bottom-right':
        return {
          initial: { opacity: 0, x: 140, y: 40, scale: 0.9 },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          exit: { opacity: 0, x: 140, scale: 0.85, transition: { duration: 0.3 } },
        };
    }
  };

  return (
    <>
      {/* Quick Sentinel Status Bar centered at bottom */}
      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#030713]/90 border border-[#c59b27]/50 text-[11px] text-[#f3d069] shadow-[0_6px_25px_rgba(0,0,0,0.92)] backdrop-blur-md">
        <Clock className="h-3.5 w-3.5 text-[#f3d069] animate-spin" style={{ animationDuration: '10s' }} />
        <span className="whitespace-nowrap font-serif">
          Timekeeper Sentinel: <strong className="font-mono text-[#fef9c3] font-bold">{minsLeft}:{secsLeft < 10 ? `0${secsLeft}` : secsLeft}</strong>
        </span>
        <button
          onClick={() => triggerCharacter()}
          title="Manually summon a random character time announcement from a corner"
          className="ml-1 text-[10px] text-[#f3d069]/85 hover:text-[#fef08a] transition-colors font-cinzel font-semibold cursor-pointer whitespace-nowrap"
        >
          [Summon Sentinel]
        </button>
      </div>

      {/* Floating Animated Character Notification Card emerging from any of the 4 corners */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            key={activeAlert.id}
            {...getCornerAnimation(activeAlert.corner)}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className={`fixed z-50 w-[92vw] max-w-sm rounded-2xl border-2 border-[#c59b27] bg-[#0a1526]/95 text-slate-100 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(197,155,39,0.35)] backdrop-blur-xl overflow-hidden ${getCornerClasses(
              activeAlert.corner
            )}`}
          >
            {/* Top gold filigree header bar with corner indicator */}
            <div className="flex items-center justify-between border-b border-[#c59b27]/40 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#f3d069] animate-magical-pulse" />
                <span className="text-[11px] font-cinzel font-bold text-[#f3d069] tracking-wider uppercase">
                  ✦ Sentinel Check · {activeAlert.corner.replace('-', ' ')} ✦
                </span>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss alert"
                className="text-slate-400 hover:text-[#f3d069] transition-colors p-1 rounded-md hover:bg-[#060c18] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content: Portrait + Dialogue */}
            <div className="flex items-start gap-3">
              {/* Character Avatar with gold border frame */}
              <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 border-[#c59b27] shadow-md bg-[#060c18]">
                <img
                  src={activeAlert.character.avatar}
                  alt={activeAlert.character.characterName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#060c18] to-transparent -z-10">
                  <UserCheck className="h-8 w-8 text-[#f3d069]/60" />
                </div>
              </div>

              {/* Dialogue */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-xs font-bold text-[#fef9c3]">
                    {activeAlert.character.characterName}
                  </h4>
                  <span className="text-[10px] text-[#f3d069] font-mono">
                    {remainingMinutes}m left
                  </span>
                </div>
                <p className="text-[10px] text-[#c59b27] font-medium font-serif">
                  {activeAlert.character.title}
                </p>
                <p className="text-xs text-slate-200 leading-relaxed italic pt-1 font-serif">
                  {activeAlert.message}
                </p>
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-3 pt-2 border-t border-[#c59b27]/30 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-[#f3d069]">
                <Volume2 className="h-3 w-3 animate-pulse" />
                <span>Voice announcement active</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-[#f3d069] hover:text-[#fef08a] px-2.5 py-0.5 rounded bg-[#060c18] border border-[#c59b27]/40 font-cinzel font-medium cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
