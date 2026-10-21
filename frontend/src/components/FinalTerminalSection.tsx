import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Shield,
  Zap,
  Sparkles,
  Cpu,
  Flame,
  CheckCircle2,
  Lock,
  Unlock,
  CornerDownLeft,
  RefreshCw,
  Eye,
  KeyRound,
  Binary
} from 'lucide-react';
import { TerminalEntry, TeamProfile } from '../types';
import { sound } from '../utils/audio';

interface FinalTerminalSectionProps {
  currentTeam: TeamProfile | null;
  remainingSeconds: number;
}

export const FinalTerminalSection: React.FC<FinalTerminalSectionProps> = ({
  currentTeam,
  remainingSeconds,
}) => {
  const [hashInput, setHashInput] = useState('');
  const [cliInput, setCliInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState<string | null>(null);
  const [aiHashProgress, setAiHashProgress] = useState(84); // Starts near milestone 50
  const [isMilestone50Unlocked, setIsMilestone50Unlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai-oracle' | 'cli-console'>('ai-oracle');

  const [logs, setLogs] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      type: 'system',
      content: '╔═══════════════════════════════════════════════════════════════════════╗\n║  HOGWARTS ARITHMANCY NEURAL ORACLE // MILESTONE 50                     ║\n║  CHAMBER OF KEYS · AI CRYPTOGRAPHIC HASH INJECTION TERMINAL          ║\n╚═══════════════════════════════════════════════════════════════════════╝',
      timestamp: '00:00:01',
    },
    {
      id: 'init-2',
      type: 'output',
      content: 'AI Oracle Core: ONLINE. Neural Arithmancy Wards calibrated to Sector 50.\nAwaiting 256-bit cryptographic hash injection to breach Horcrux deadbolt.',
      timestamp: '00:00:02',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle Injecting Hash into the AI Oracle
  const handleInjectHash = (targetHash = hashInput) => {
    const trimmed = targetHash.trim();
    if (!trimmed || isAiProcessing) return;

    sound.playSparkle();
    setIsAiProcessing(true);
    setAiAnalysisStep('Ingesting 256-bit hash block into Arithmancy Neural Mesh...');

    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: `hash-in-${Date.now()}`,
        type: 'input',
        content: `[AI-CONDUIT] >> INJECTING HASH: ${trimmed}`,
        timestamp,
      },
    ]);

    // Sequence realistic multi-stage AI analysis
    setTimeout(() => {
      sound.playTimekeeperBell();
      setAiAnalysisStep('Decomposing modular residue matrix mod 26 across neural nodes...');
      setLogs((prev) => [
        ...prev,
        {
          id: `hash-proc-1-${Date.now()}`,
          type: 'output',
          content: `AI SYNAPSE: Vector decomposed into prime residue fields. Calculating discrete logarithms...`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 900);

    setTimeout(() => {
      sound.playSparkle();
      setAiAnalysisStep('Simulating Horcrux deadbolt permutation on sector 50...');
      setLogs((prev) => [
        ...prev,
        {
          id: `hash-proc-2-${Date.now()}`,
          type: 'output',
          content: `AI VERIFICATION: Inverting XOR 5x5 polyalphabetic matrix key [ALOHOMORA]...`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 1900);

    setTimeout(() => {
      setIsAiProcessing(false);
      setAiAnalysisStep(null);
      setAiHashProgress(100);
      setIsMilestone50Unlocked(true);
      sound.playSuccess();

      setLogs((prev) => [
        ...prev,
        {
          id: `hash-succ-${Date.now()}`,
          type: 'success',
          content: `⚡ AI ORACLE BREAKTHROUGH: Hash token verified! Master Key deciphered: "PROTECT THE MODULE". 50th Chamber Milestone DEADBOLT UNSEALED! House points awarded!`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 3000);
  };

  // Handle CLI Spells & Commands
  const handleCliCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    sound.playSparkle();
    const timestamp = new Date().toLocaleTimeString();
    const newLogs: TerminalEntry[] = [
      ...logs,
      { id: `in-${Date.now()}`, type: 'input', content: `chamber-6@hogwarts-ai:~$ ${trimmed}`, timestamp },
    ];

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (cmd === 'clear') {
      setLogs([]);
      setCliInput('');
      return;
    }

    if (cmd === 'help') {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'output',
        content: `Available Spells & Terminal Directives:
  • inject <hash>   - Inject cryptographic hash directly into the AI Core
  • status          - Inspect AI neural wards, lock integrity, and Round 6 diagnostics
  • decrypt <text>  - Run Arithmancy modulo deciphering routine on <text>
  • matrix <key>    - Compute the inverse of the XOR 5x5 polyalphabetic matrix
  • cast lumos      - Ignite glowing starlight phosphor aura in AI core
  • cast alohomora  - Attempt to breach the 50th chamber deadbolt
  • cast patronus   - Deploy defensive anti-tamper cryptographic wards
  • solve 50        - Trigger AI master solution verification for Milestone 50
  • clear           - Clear terminal logs`,
        timestamp,
      });
    } else if (cmd === 'status') {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'output',
        content: `[AI NEURAL DIAGNOSTICS - ROUND 6 / 50TH MILESTONE]
Team: ${currentTeam?.teamName || 'GUEST SQUAD (Unregistered)'}
House: ${currentTeam?.house || 'Unaligned'}
AI Core Status: ${isMilestone50Unlocked ? '100% CRACKED // DEADBOLT UNLOCKED' : 'ONLINE // 84.7% CONVERGENCE'}
Target Vector: 0x7F4A982CB17D...E502
Entropy Reducer: ACTIVE [SHA-256 Horcrux Engine]`,
        timestamp,
      });
    } else if (cmd === 'inject') {
      handleInjectHash(arg || '0x7F4A982C');
      return;
    } else if (cmd === 'decrypt') {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'success',
        content: `AI Decryption Engine: Result for '${arg || 'TVIHJLA AOL TVKBSL'}': "PROTECT THE MODULE". Congruence verified!`,
        timestamp,
      });
    } else if (cmd === 'matrix') {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'output',
        content: `XOR MATRIX INVERSION [Key: ${arg || 'ALOHOMORA'}]:
[ X  O  R  K  Y ]^-1  ==>  det(M) ≡ 3 (mod 26). Modular Inverse gcd(3, 26) = 1.
AI Synapses aligned. Matrix successfully diagonalized!`,
        timestamp,
      });
    } else if (cmd === 'cast') {
      const spell = arg.toLowerCase();
      if (spell === 'lumos') {
        sound.playSparkle();
        newLogs.push({
          id: `out-${Date.now()}`,
          type: 'success',
          content: '✨ Lumos Maxima! Holographic AI core illumination amplified to 100%. Dark shadows dispersed.',
          timestamp,
        });
      } else if (spell === 'alohomora') {
        handleInjectHash('0xALOHOMORA-50');
        return;
      } else if (spell === 'patronus') {
        sound.playSuccess();
        newLogs.push({
          id: `out-${Date.now()}`,
          type: 'success',
          content: '🦌 Expecto Patronum! Silver patronus shield formed. Dark network sniffing neutralized.',
          timestamp,
        });
      }
    } else if (cmd === 'solve' && arg === '50') {
      handleInjectHash('0xHORCRUX-FINAL-SOLVE-50');
      return;
    } else {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'error',
        content: `Directive '${trimmed}' not recognized. Type "help" for available directives.`,
        timestamp,
      });
    }

    setLogs(newLogs);
    setCliInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Round 6 Status & Sub-Navigation */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#071318] via-[#081c22] to-[#071318] p-5 md:p-6 shadow-[0_10px_35px_rgba(4,120,87,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative h-13 w-13 rounded-2xl border-2 border-emerald-400 bg-emerald-950/60 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
            <Cpu className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border border-[#060c18] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                ROUND 6 · CHAMBER OF KEYS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                50th Milestone
              </span>
            </div>
            <h3 className="font-cinzel text-xl md:text-2xl font-black text-[#fef9c3] tracking-wide">
              The AI Cryptographic Oracle
            </h3>
            <p className="text-xs text-slate-300 font-serif">
              Inject cryptographic hashes and cipher vectors directly into the neural Arithmancy engine.
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060c18] border border-emerald-500/40 shadow-inner">
          <button
            onClick={() => setActiveTab('ai-oracle')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai-oracle'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#060c18] font-black shadow-md'
                : 'text-slate-300 hover:text-emerald-300'
            }`}
          >
            <Binary className="h-3.5 w-3.5" />
            <span>AI Neural Conduit</span>
          </button>
          <button
            onClick={() => setActiveTab('cli-console')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cli-console'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#060c18] font-black shadow-md'
                : 'text-slate-300 hover:text-emerald-300'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Chamber CLI</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION A: VISUAL HOLOGRAPHIC AI CORE & HASH INTAKE CHAMBER
          ========================================================================= */}
      {activeTab === 'ai-oracle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Holographic 3D AI Core Visualizer */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-[#061214] to-[#04080c] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[460px]">
            {/* Background cyber grid & scanlines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="scanline-effect absolute inset-0 pointer-events-none opacity-40" />

            {/* Core Header */}
            <div className="w-full flex items-center justify-between text-xs border-b border-emerald-500/30 pb-3 relative z-10">
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                NEURAL ORACLE CORE
              </span>
              <span className="font-mono text-xs text-[#f3d069]">
                {isMilestone50Unlocked ? 'STATUS: DECRYPTION UNLOCKED' : isAiProcessing ? 'STATUS: RECOMBINING' : 'STATUS: SYNCHRONIZED'}
              </span>
            </div>

            {/* THE HOLOGRAPHIC 3D AI CORE GRAPHIC */}
            <div className="relative my-auto flex items-center justify-center h-64 w-64 select-none">
              {/* Outer Rotating Runic Gold Ring */}
              <div
                className={`absolute inset-0 rounded-full border border-[#f3d069]/40 border-dashed ${
                  isAiProcessing ? 'animate-ai-spin-fast' : 'animate-ai-spin'
                }`}
              />

              {/* Middle Counter-Rotating Cyan Data Ring */}
              <div
                className={`absolute inset-4 rounded-full border-2 border-cyan-400/50 border-t-transparent border-b-transparent ${
                  isAiProcessing ? 'animate-ai-spin-fast' : 'animate-ai-spin-reverse'
                }`}
              />

              {/* Inner Emerald Energy Ring */}
              <div className="absolute inset-8 rounded-full border border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse" />

              {/* Glowing Laser Scanline across Core */}
              {isAiProcessing && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee] animate-ai-laser" />
                </div>
              )}

              {/* Center Neural Core Orb */}
              <div
                className={`relative h-28 w-28 rounded-full flex flex-col items-center justify-center text-center p-3 border-2 transition-all duration-700 ${
                  isMilestone50Unlocked
                    ? 'border-amber-400 bg-gradient-to-br from-amber-900/80 to-[#122818] shadow-[0_0_60px_rgba(245,158,11,0.9)] animate-bounce'
                    : isAiProcessing
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-950 via-[#0a2e26] to-[#061214] animate-ai-core-surge'
                    : 'border-emerald-400 bg-gradient-to-br from-emerald-950/80 to-[#05110e] shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                }`}
              >
                {isMilestone50Unlocked ? (
                  <>
                    <Unlock className="h-8 w-8 text-amber-300 mb-1" />
                    <span className="font-cinzel text-[10px] font-black text-amber-200 uppercase tracking-widest">
                      DEADBOLT 50 CRACKED
                    </span>
                  </>
                ) : isAiProcessing ? (
                  <>
                    <RefreshCw className="h-8 w-8 text-cyan-300 animate-spin mb-1" />
                    <span className="font-mono text-[9px] font-bold text-cyan-200 uppercase tracking-tighter">
                      HASH COMPUTING
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="h-7 w-7 text-emerald-300 mb-1" />
                    <span className="font-cinzel text-[9px] font-bold text-emerald-200 uppercase tracking-wider">
                      HORCRUX 50 LOCKED
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Core Diagnostics Footer */}
            <div className="w-full space-y-2 relative z-10 pt-2 border-t border-emerald-500/20">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Milestone Decryption:</span>
                <span className="text-emerald-300 font-bold">{aiHashProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-emerald-950/80 border border-emerald-500/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-[#f3d069] transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                  style={{ width: `${aiHashProgress}%` }}
                />
              </div>

              {aiAnalysisStep && (
                <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 p-2 rounded-lg border border-cyan-500/40 animate-pulse flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{aiAnalysisStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Hash Injector Console & Active Vector Stream */}
          <div className="lg:col-span-7 space-y-5">
            {/* Target Hash Specification Box */}
            <div className="rounded-2xl border border-emerald-500/40 bg-[#09151e]/90 p-5 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#f3d069]" />
                  <span className="font-cinzel text-xs font-bold text-[#fef9c3] uppercase tracking-wider">
                    ✦ Target Cryptographic Vector: Milestone 50 ✦
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  SHA-256 Vector
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#04090d] border border-emerald-500/30 font-mono text-xs text-emerald-300 break-all select-all flex items-center justify-between gap-3">
                <span>0x7F4A982CB17D4029E6B5D71C0F8293AA819C64E502B48D93E10C838F561D9802</span>
                <span className="text-[10px] text-[#f3d069] shrink-0 font-sans font-semibold">
                  [CHAMBER-HASH]
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                Enter your decrypted token from Round 1 or paste the computed SHA-256 Horcrux hash to trigger the AI oracle's deadbolt unlock sequence.
              </p>
            </div>

            {/* Interactive Hash Input & Injection Conduit Form */}
            <div className="rounded-2xl border-2 border-emerald-500/50 bg-[#081720]/95 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-cinzel text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Binary className="h-4 w-4" />
                  <span>AI Hash Injection Conduit</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Input format: Hex hash, Token, or Cipher solution
                </span>
              </div>

              {/* Input field with cyber glow */}
              <div className="relative">
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInjectHash();
                  }}
                  disabled={isAiProcessing}
                  placeholder="Paste SHA-256 hash or cipher token (e.g. PROTECT THE MODULE, 0x7F4A...)"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#040a10] border-2 border-emerald-500/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-emerald-200 font-mono text-xs md:text-sm placeholder:text-slate-600 outline-none transition-all shadow-inner"
                />
              </div>

              {/* Quick-Inject Pre-computed Hash Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-cinzel">Quick Feed:</span>
                {[
                  { label: 'Round 5 Hash (a7f9b2c4e1)', val: 'a7f9b2c4e1' },
                  { label: 'Master Key Token', val: 'PROTECT THE MODULE' },
                  { label: 'Horcrux Hash 0x7F4A', val: '0x7F4A982CB17D4029' },
                  { label: 'Caesar Ciphertext', val: 'TVIHJLA AOL TVKBSL' },
                  { label: 'Alohomora Key 50', val: '0xALOHOMORA-50' },
                ].map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => {
                      setHashInput(sample.val);
                      handleInjectHash(sample.val);
                    }}
                    disabled={isAiProcessing}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 font-mono text-[11px] transition-all cursor-pointer disabled:opacity-50"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>

              {/* Major Glowing "Inject Hash Into AI" Button */}
              <button
                onClick={() => handleInjectHash()}
                disabled={isAiProcessing || !hashInput.trim()}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-[#060c18] font-cinzel font-black text-sm md:text-base tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {isAiProcessing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Neural AI Analyzing Hash Vector...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-current" />
                    <span>Inject Hash into AI Oracle</span>
                    <Zap className="h-5 w-5 fill-current" />
                  </>
                )}
              </button>
            </div>

            {/* Live Terminal Feed Preview */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#04080d] p-3 text-xs font-mono h-36 overflow-y-auto space-y-1 text-emerald-400/90 shadow-inner">
              <div className="text-[10px] text-slate-500 uppercase pb-1 border-b border-emerald-950 flex items-center justify-between">
                <span>AI Live Feed Stream</span>
                <span>Port 8042 // Horcrux Wards</span>
              </div>
              {logs.slice(-4).map((l) => (
                <div key={l.id} className="text-[11px]">
                  <span className="text-slate-500">[{l.timestamp}] </span>
                  <span className={l.type === 'success' ? 'text-[#fef08a] font-bold' : 'text-emerald-300'}>
                    {l.content.split('\n')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION B: FULL RETRO CRT CHAMBER CLI CONSOLE
          ========================================================================= */}
      {activeTab === 'cli-console' && (
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-[#07120a] p-5 md:p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden font-mono text-xs md:text-sm">
          {/* Subtle scanline overlay */}
          <div className="scanline-effect absolute inset-0 pointer-events-none opacity-50" />

          {/* Quick Directive Pills for Fast Cast */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pb-3 border-b border-emerald-900/60 mb-3 relative z-10">
            <span className="text-neutral-500 text-[11px] mr-1">Directives:</span>
            {['help', 'status', 'cast lumos', 'cast alohomora', 'cast patronus', 'matrix ALOHOMORA', 'solve 50'].map((q) => (
              <button
                key={q}
                onClick={() => handleCliCommand(q)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-emerald-300 font-mono text-[11px] border border-emerald-800/50 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Logs Output View */}
          <div className="min-h-[380px] max-h-[500px] overflow-y-auto space-y-2.5 pr-2 select-text relative z-10">
            {logs.map((log) => (
              <div key={log.id} className="leading-relaxed">
                {log.type === 'input' ? (
                  <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <span className="text-emerald-500">❯</span>
                    <span>{log.content}</span>
                  </div>
                ) : log.type === 'error' ? (
                  <div className="text-red-400 pl-4">{log.content}</div>
                ) : log.type === 'success' ? (
                  <div className="text-amber-300 pl-4 font-semibold">{log.content}</div>
                ) : log.type === 'system' ? (
                  <pre className="text-emerald-400/90 font-mono whitespace-pre text-[11px] md:text-xs">
                    {log.content}
                  </pre>
                ) : (
                  <div className="text-emerald-200/90 pl-4 whitespace-pre-wrap">{log.content}</div>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive Command Input Line */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCliCommand(cliInput);
            }}
            className="mt-4 pt-3 border-t border-emerald-900/60 flex items-center gap-2 relative z-10"
          >
            <span className="text-emerald-400 font-bold shrink-0">
              chamber-6@hogwarts-ai:~$
            </span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Type directive (e.g. 'help', 'status', 'cast lumos', 'solve 50')..."
              className="flex-1 bg-transparent border-none outline-none text-emerald-200 font-mono text-xs md:text-sm placeholder:text-emerald-900 focus:ring-0"
              autoFocus
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition-colors cursor-pointer"
              title="Execute command"
            >
              <CornerDownLeft className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
