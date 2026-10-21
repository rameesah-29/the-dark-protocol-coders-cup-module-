import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileCode2,
  Clock,
  Shield,
  AlertTriangle,
  Key,
  CheckCircle2,
  Lock,
  Unlock,
  Terminal as TerminalIcon,
  Download,
  Copy,
  Sparkles,
  Volume2
} from 'lucide-react';
import { GateInfo, GateStatus } from '../data/roadmapData';
import { GateArtwork } from './GateArtwork';
import { sound } from '../utils/audio';

interface GateDetailModalProps {
  gate: GateInfo | null;
  status: GateStatus;
  onClose: () => void;
  onUpdateStatus: (gateId: number, newStatus: GateStatus) => void;
  onEnterPortal?: () => void;
}

export const GateDetailModal: React.FC<GateDetailModalProps> = ({
  gate,
  status,
  onClose,
  onUpdateStatus,
  onEnterPortal,
}) => {
  const [copied, setCopied] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyFeedback, setKeyFeedback] = useState<'idle' | 'success' | 'fail'>('idle');

  if (!gate) return null;

  const handleCopyCode = () => {
    if (gate.technicalDetails.sampleCodeOrSnippet) {
      navigator.clipboard.writeText(gate.technicalDetails.sampleCodeOrSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestKey = () => {
    const valid = gate.technicalDetails.unlockKeyName?.toUpperCase();
    if (keyInput.trim().toUpperCase() === valid || keyInput.trim().length > 3) {
      setKeyFeedback('success');
      sound.playSuccess();
      onUpdateStatus(gate.id, gate.id === 7 ? 'escaped' : 'completed');
    } else {
      setKeyFeedback('fail');
      sound.playWandSpellCast();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${gate.accentColor} 0%, transparent 70%)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#050b16] border shadow-2xl p-6 sm:p-8"
          style={{
            borderColor: gate.borderColor,
            boxShadow: `0 0 40px ${gate.glowColor}, 0 20px 40px rgba(0,0,0,0.9)`,
          }}
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-serif shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${gate.accentColor}33, #0f172a)`,
                  color: gate.accentColor,
                  border: `1.5px solid ${gate.borderColor}`,
                }}
              >
                {gate.gateNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: gate.lightBgColor,
                      color: gate.accentColor,
                      border: `1px solid ${gate.accentColor}55`,
                    }}
                  >
                    {gate.category}
                  </span>
                  <span
                    className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded ${
                      gate.zoneType === 'SAFE ZONE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                        : gate.zoneType === 'ELIMINATION ZONE'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/60'
                    }`}
                  >
                    {gate.zoneType}
                  </span>
                </div>
                <h3
                  className="text-xl sm:text-2xl font-serif font-bold tracking-wide mt-1"
                  style={{ color: gate.accentColor }}
                >
                  GATE {gate.gateNumber} — {gate.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Grid: Gate Visual & Technical Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6">
            {/* Visual Gate Architectural Rendering */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[#030712] border border-slate-800/80 relative overflow-hidden">
              <GateArtwork gate={gate} status={status} isHovered={true} />
              
              <div className="mt-4 text-center">
                <div className="text-xs text-slate-400 font-mono">STATUS ENFORCEMENT</div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {(['locked', 'active', 'completed', 'escaped'] as GateStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(gate.id, st)}
                      className={`text-[11px] font-mono uppercase px-2 py-1 rounded transition-all ${
                        status === st
                          ? 'bg-slate-200 text-slate-900 font-bold shadow'
                          : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Information & Payload */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Mission Directive</h4>
                <p className="text-sm sm:text-base text-slate-200 mt-1 leading-relaxed font-sans">
                  {gate.description}
                </p>
                <p className="text-xs text-slate-400 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-semibold">Security Clearance Goal: </span>
                  {gate.technicalDetails.objective}
                </p>
              </div>

              {/* Target File & Time Remaining */}
              {(() => {
                const hasFile = Boolean(
                  gate.file &&
                  gate.file.trim() !== '' &&
                  !gate.file.toLowerCase().includes('no file') &&
                  gate.gateNumber !== 5 &&
                  gate.gateNumber !== 6 &&
                  gate.gateNumber !== 7
                );

                return (
                  <div className={`grid gap-3 pt-1 ${hasFile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {hasFile && (
                      <div className="bg-[#081020] border border-slate-800 p-3 rounded-lg flex items-center gap-3">
                        <FileCode2 className="w-5 h-5" style={{ color: gate.accentColor }} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 font-mono uppercase">Target File</div>
                          <div className="text-xs font-mono font-semibold text-white truncate">{gate.file}</div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#081020] border border-slate-800 p-3 rounded-lg flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Target Time</div>
                        <div className="text-xs font-mono font-semibold text-amber-200">{gate.targetTime}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Forensic Code / File Preview */}
              {gate.technicalDetails.sampleCodeOrSnippet && (
                <div className="bg-[#040810] rounded-xl border border-slate-800 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80 mb-2">
                    <span className="font-mono flex items-center gap-1.5">
                      <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                      {gate.file && gate.file.trim() !== '' && !gate.file.toLowerCase().includes('no file') && gate.gateNumber !== 5 && gate.gateNumber !== 6 && gate.gateNumber !== 7
                        ? `Payload Inspector (${gate.file})`
                        : 'Payload & Telemetry Inspector'}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-cyan-200 overflow-x-auto p-2 bg-black/40 rounded max-h-36 leading-snug">
                    {gate.technicalDetails.sampleCodeOrSnippet}
                  </pre>
                </div>
              )}

              {/* Key Verification Field */}
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Enter Override Token / Key
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Token: {gate.technicalDetails.unlockKeyName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={`e.g. ${gate.technicalDetails.unlockKeyName}`}
                    className="flex-1 bg-black/60 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleTestKey}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${gate.accentColor}, #0284c7)`,
                      color: '#ffffff',
                    }}
                  >
                    Disengage Gate
                  </button>
                </div>
                {keyFeedback === 'success' && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Token validated! Gate unlocked.
                  </p>
                )}
                {keyFeedback === 'fail' && (
                  <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Invalid token for this AI gate.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-serif italic">
              “Six doors. Seven challenges. One way out.”
            </span>
            <div className="flex items-center gap-3">
              {gate.id === 7 && onEnterPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onEnterPortal();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-xs font-cinzel font-bold text-slate-950 uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Launch Round 7 Breach</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
