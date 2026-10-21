import React from 'react';
import { Lock, Unlock, Sparkles, CheckCircle2 } from 'lucide-react';
import { GateInfo, GateStatus } from '../data/roadmapData';

interface GateArtworkProps {
  gate: GateInfo;
  status: GateStatus;
  isHovered: boolean;
}

export const GateArtwork: React.FC<GateArtworkProps> = ({ gate, status, isHovered }) => {
  const { accentColor, glowColor, imageUrl } = gate;
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const isEscaped = status === 'escaped' || gate.id === 7;

  return (
    <div className="relative w-full flex flex-col items-center select-none group">
      {/* Volumetric Backlight & Atmospheric Colored Aura */}
      <div
        className="absolute -inset-2 rounded-t-full pointer-events-none transition-all duration-700 blur-xl opacity-60 group-hover:opacity-100"
        style={{
          background: isEscaped
            ? 'radial-gradient(ellipse at 50% 50%, rgba(224, 242, 254, 0.7) 0%, rgba(56, 189, 248, 0.4) 60%, transparent 90%)'
            : `radial-gradient(ellipse at 50% 60%, ${glowColor} 0%, transparent 75%)`,
          transform: isHovered || isActive ? 'scale(1.08)' : 'scale(0.95)',
        }}
      />

      {/* Gothic Stone Portal Architectural Structure */}
      <div
        className="relative w-full aspect-[3/4] max-h-56 sm:max-h-64 rounded-t-[42%] overflow-hidden border-2 transition-all duration-500 shadow-2xl bg-[#03060c]"
        style={{
          borderColor: isHovered || isActive ? accentColor : '#1e293b',
          boxShadow: isHovered || isActive
            ? `0 0 30px ${glowColor}, 0 16px 36px rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(0,0,0,0.8)`
            : '0 10px 30px rgba(0, 0, 0, 0.9), inset 0 0 25px rgba(0,0,0,0.9)',
        }}
      >
        {/* Photorealistic Cinematic Gate Art Image */}
        <img
          src={imageUrl}
          alt={gate.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          style={{
            filter: isLocked
              ? 'brightness(0.65) contrast(1.1) saturate(0.85)'
              : isHovered || isActive
              ? 'brightness(1.15) contrast(1.15) saturate(1.1)'
              : 'brightness(0.95) contrast(1.05)',
          }}
        />

        {/* Cinematic Vignette Overlay (Dark fantasy dungeon shadow edges) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#02050b] via-transparent to-black/60" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_24px_rgba(0,0,0,0.85)]" />

        {/* Keystone / Carved Gate Number at Top Arch */}
        <div className="absolute top-1.5 inset-x-0 flex justify-center pointer-events-none">
          <div
            className="px-2.5 py-0.5 rounded-b-md bg-[#070d18]/90 border-x border-b border-slate-700/80 shadow-lg flex items-center gap-1 backdrop-blur-sm"
            style={{
              borderColor: isHovered ? accentColor : '#334155',
            }}
          >
            <span
              className="text-[10px] font-serif font-black tracking-widest uppercase"
              style={{
                color: isHovered || isActive ? accentColor : '#94a3b8',
                textShadow: isHovered ? `0 0 8px ${accentColor}` : 'none',
              }}
            >
              GATE {gate.gateNumber}
            </span>
          </div>
        </div>

        {/* LOCKED STATE OVERLAY: Heavy Iron Chains & Padlock */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[1px] transition-all duration-300">
            {/* Visual Crossing Silhouette Chains */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 pointer-events-none flex items-center justify-center opacity-60">
              <div className="w-full h-1 bg-stone-700 rotate-12 shadow-lg" />
              <div className="w-full h-1 bg-stone-700 -rotate-12 absolute shadow-lg" />
            </div>

            {/* Weathered Iron Padlock Badge */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-[#0a101d]/90 border border-slate-600 shadow-xl flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="relative z-10 text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-1 px-1.5 py-0.5 rounded bg-black/70">
              LOCKED
            </span>
          </div>
        )}

        {/* ACTIVE STATE OVERLAY: Pulsing Breach Aura */}
        {isActive && !isCompleted && !isEscaped && (
          <div className="absolute bottom-2 inset-x-2 flex justify-between items-center pointer-events-none">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border shadow-lg"
              style={{ borderColor: accentColor }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="text-[9px] font-mono font-bold tracking-wider uppercase"
                style={{ color: accentColor }}
              >
                BREACH ACTIVE
              </span>
            </div>
            <div className="p-1 rounded-full bg-black/70 border border-slate-700 text-amber-400">
              <Unlock className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* COMPLETED STATE OVERLAY: Green Runestone Sigil */}
        {isCompleted && !isEscaped && (
          <div className="absolute bottom-2 inset-x-2 flex justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/70 shadow-lg text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
                BYPASS SECURED
              </span>
            </div>
          </div>
        )}

        {/* ESCAPED STATE (GATE 7) OVERLAY: Radiant Victory Light */}
        {isEscaped && (
          <div className="absolute bottom-2 inset-x-2 flex justify-center pointer-events-none">
            <div className="flex items-center gap-1 px-3 py-0.5 rounded bg-sky-950/90 border border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.7)] text-cyan-200">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span className="text-[9px] font-serif font-black tracking-widest uppercase">
                FREEDOM EXIT
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Heavy Gothic Stone Pedestal Base */}
      <div className="w-full flex flex-col items-center pointer-events-none -mt-0.5">
        <div
          className="w-[96%] h-2.5 bg-gradient-to-b from-[#1c2433] via-[#0f1520] to-[#070a10] border-x border-t border-slate-700/80 rounded-t-sm shadow-md"
        />
        <div
          className="w-full h-3 bg-gradient-to-b from-[#111724] to-[#05080e] border-x border-b border-stone-800 shadow-xl flex items-center justify-between px-2"
        >
          {/* Subtle Pedestal Rivets */}
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Wet Stone Specular Floor Reflection */}
        <div
          className="w-4/5 h-4 -mt-0.5 opacity-40 blur-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-80"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
};
