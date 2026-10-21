import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Check,
  Copy,
  Feather,
  Bookmark,
  Compass,
  Layers,
  Award
} from 'lucide-react';
import { TeamProfile, FolderAllocation } from '../types';
import { sound } from '../utils/audio';

export interface PensieveArchiveEntry {
  id: string;
  roundNumber: number;
  roundTitle: string;
  challengeTitle: string;
  challengeCategory: string;
  encryptedPrompt: string;
  verifiedAnswer: string;
  userSubmittedAnswer?: string;
  points: number;
  solvedAt: string;
  mathematicalProof?: string;
  runicSymbol?: string;
  folderCode?: string;
  status: 'verified' | 'unlocked' | 'archived';
}

interface PensieveArchivesProps {
  currentTeam: TeamProfile | null;
  allocatedFolder: FolderAllocation | null;
  onNavigateToRound1?: () => void;
  onOpenRoadmap?: () => void;
}

export const PensieveArchives: React.FC<PensieveArchivesProps> = ({
  currentTeam,
  allocatedFolder,
  onNavigateToRound1,
  onOpenRoadmap,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'round1' | 'gates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPensieveSwirling, setIsPensieveSwirling] = useState(false);

  // Derive solved memories dynamically from the team's allocatedFolder
  const solvedFromFolder: PensieveArchiveEntry[] = (allocatedFolder?.challenges || [])
    .filter((ch) => ch.isSolved)
    .map((ch) => ({
      id: ch.id,
      roundNumber: 1,
      roundTitle: 'Round 1: Cryptographic Enigmas',
      challengeTitle: ch.title,
      challengeCategory: ch.subtitle,
      encryptedPrompt: ch.encryptedPayload,
      verifiedAnswer: ch.solution,
      userSubmittedAnswer: ch.userAnswer || ch.solution,
      points: ch.points,
      solvedAt: 'Extracted during Round 1',
      mathematicalProof: ch.hints?.[0] || 'Decrypted via strict Arithmancy congruences.',
      runicSymbol: allocatedFolder?.runeSymbol || 'ᚠ',
      folderCode: allocatedFolder?.code || 'FOLDER-ARCHIVE',
      status: 'verified',
    }));

  // Default / Historical Sample Memories (if team hasn't solved any yet, or in addition)
  const defaultHistoricalMemories: PensieveArchiveEntry[] = [
    {
      id: 'hist_gate1',
      roundNumber: 1,
      roundTitle: 'Round 1: Preliminary Briefing',
      challengeTitle: 'The Nihilist Memory Dump',
      challengeCategory: 'Coordinate Matrix Substitution',
      encryptedPrompt: 'COORDS: 44 23 15 32 11 // NIHILIST KEY: 0x7F',
      verifiedAnswer: 'DARK PROTOCOL ACTIVATED',
      userSubmittedAnswer: 'DARK PROTOCOL ACTIVATED',
      points: 100,
      solvedAt: 'Ministry Archive Seal #881',
      mathematicalProof: 'Decoded using 5×5 Polybius grid shifted by Arithmancy seed key.',
      runicSymbol: '✦',
      folderCode: 'GATE-01 // PRISON-PERIMETER',
      status: 'archived',
    },
    {
      id: 'hist_gate2',
      roundNumber: 2,
      roundTitle: 'Round 2: The Safe Zone Matrix',
      challengeTitle: 'Linear Transformation Eigenvalues',
      challengeCategory: 'Matrix Determinant & Inverse',
      encryptedPrompt: 'det(M - λI) = 0 where M = [[3, 2], [1, 4]]',
      verifiedAnswer: 'λ₁=2, λ₂=5 // TOKEN: EIGEN-ALOHOMORA',
      userSubmittedAnswer: 'λ₁=2, λ₂=5 // TOKEN: EIGEN-ALOHOMORA',
      points: 200,
      solvedAt: 'Safe Zone Chamber Archive',
      mathematicalProof: 'Characteristic polynomial λ² - 7λ + 10 = 0 factors into (λ-2)(λ-5).',
      runicSymbol: 'ᛏ',
      folderCode: 'GATE-02 // MATRIX-TRANSFORM',
      status: 'verified',
    },
    {
      id: 'hist_gate5',
      roundNumber: 5,
      roundTitle: 'Round 5: Logic, Block Calibration & SHA-256 Slicing',
      challengeTitle: 'override.cpp Calibration & 10-char Hash Slice',
      challengeCategory: 'Parameter Injection & Slicing',
      encryptedPrompt: 'Calibration Seed = (Pipeline mod 10007) + (Token 22218 × Result A)',
      verifiedAnswer: 'a7f9b2c4e1',
      userSubmittedAnswer: 'a7f9b2c4e1',
      points: 250,
      solvedAt: 'Elimination Zone Chamber 5',
      mathematicalProof: 'Calculated from pipeline order sequence combined with API Token 22218; 10-character slice extracted at Start Index.',
      runicSymbol: 'ᚱ',
      folderCode: 'GATE-05 // OVERRIDE-SLICING',
      status: 'verified',
    },
  ];

  // Combine live solved challenges with any historical memories
  const allMemories: PensieveArchiveEntry[] =
    solvedFromFolder.length > 0 ? solvedFromFolder : defaultHistoricalMemories;

  const filteredMemories = allMemories.filter((mem) => {
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'round1' && mem.roundNumber === 1) ||
      (selectedFilter === 'gates' && mem.roundNumber > 1);

    const matchesSearch =
      mem.challengeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.verifiedAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.challengeCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.encryptedPrompt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCopyAnswer = (entry: PensieveArchiveEntry) => {
    sound.playSparkle();
    navigator.clipboard.writeText(entry.verifiedAnswer);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleStirPensieve = () => {
    sound.playWandSpellCast();
    setIsPensieveSwirling(true);
    setTimeout(() => {
      sound.playSparkle();
      setIsPensieveSwirling(false);
    }, 1800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in select-none">
      {/* Top Ambient Ribbon & Lore Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#071120]/90 border border-[#c59b27]/40 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#09182d] border border-cyan-400/60 flex items-center justify-center text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <BookOpen className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-sm sm:text-base font-bold text-[#fef08a] tracking-wider uppercase">
                THE PENSIEVE ARCHIVES
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 font-bold uppercase">
                {allMemories.length} Memories Preserved
              </span>
            </div>
            <p className="text-[11px] font-serif text-slate-300 italic">
              "One simply siphons the excess thoughts from one's mind, pours them into the basin, and examines them at leisure."
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStirPensieve}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/60 bg-gradient-to-r from-cyan-950/80 to-[#0b2447] hover:from-cyan-900 hover:to-[#0f3468] text-cyan-200 text-xs font-cinzel font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-all cursor-pointer"
            title="Dip wand and stir silvery memory liquid"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-300 ${isPensieveSwirling ? 'animate-spin' : ''}`} />
            <span>Stir Pensieve</span>
          </button>

          {onOpenRoadmap && (
            <button
              onClick={onOpenRoadmap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c59b27]/60 bg-[#0e1d35] hover:bg-[#142847] text-[#fef08a] text-xs font-cinzel font-bold transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#f3d069]" />
              <span className="hidden sm:inline">7 Gates Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          THE MAIN ANCIENT BOOK PAGE (CLEAN, SEAMLESS ILLUMINATED MANUSCRIPT)
          ========================================================================= */}
      <div className="relative rounded-3xl p-3 sm:p-6 md:p-8 bg-gradient-to-b from-[#21170d] via-[#1a1208] to-[#120c04] border-4 border-[#c59b27] shadow-[0_25px_80px_rgba(0,0,0,0.95),inset_0_0_40px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Leather Corner Brackets with Antique Brass Studs */}
        <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-[#d4af37] rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-[#d4af37] rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-[#d4af37] rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-[#d4af37] rounded-br-xl pointer-events-none" />

        {/* Silver Silk Bookmark Ribbon trailing across the top */}
        <div className="absolute -top-3 right-12 w-8 h-20 bg-gradient-to-b from-cyan-400 via-sky-600 to-cyan-800 shadow-xl rounded-b-md border-b-2 border-amber-300 pointer-events-none z-30 flex flex-col items-center justify-end pb-1 opacity-90">
          <div className="w-2.5 h-2.5 rotate-45 border border-amber-300 bg-cyan-950" />
        </div>

        {/* The Open Parchment Manuscript Book Page */}
        <div className="relative rounded-2xl bg-[#fbf5e9] text-[#2a1708] shadow-[0_15px_45px_rgba(0,0,0,0.85)] border-2 border-[#a67c1e] p-5 sm:p-7 md:p-8 space-y-5 overflow-hidden">
          
          {/* Subtle Manuscript Aging Gradient & Grain */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-amber-900/10 pointer-events-none" />

          {/* Book Page Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-b border-[#a67c1e]/40 pb-3 gap-2">
            <div>
              <span className="font-serif text-xs italic text-[#5f3d1b] block">
                Scriptorium Archives · Preserved Solutions from Previous Chambers
              </span>
              <h3 className="font-cinzel text-lg sm:text-xl font-black text-[#261506] leading-tight pt-0.5">
                FOLIO VII · THE PENSIEVE REPOSITORY
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold text-[#8c6218] tracking-widest uppercase flex items-center gap-1.5 bg-[#ebdfc8] px-3 py-1 rounded-md border border-[#a67c1e]/40">
                <Feather className="w-3.5 h-3.5 text-[#8c6218]" />
                <span>Scriptorium Folio VII</span>
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar Styled as Antique Parchment Controls */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pb-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search answers, ciphers, formulas..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#eee2cb] border border-[#a67c1e]/60 text-xs font-mono text-[#2a1708] placeholder-[#7d5624] focus:outline-hidden focus:border-[#781808]"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#7d5624]" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'All Memories' },
                { id: 'round1', label: 'Round 1 Ciphers' },
                { id: 'gates', label: 'Gates & Zones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playSparkle();
                    setSelectedFilter(tab.id as any);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-cinzel font-bold transition-all cursor-pointer ${
                    selectedFilter === tab.id
                      ? 'bg-[#781808] text-[#fef08a] shadow-xs'
                      : 'bg-[#eee2cb] text-[#5f3d1b] hover:bg-[#e4d3b6] border border-[#a67c1e]/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* The List of Solved Answer Entries (Illuminated Manuscript Entries) */}
          <div className="relative z-10 space-y-3.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#a67c1e]/50">
            {filteredMemories.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-[#a67c1e]/40 rounded-2xl bg-[#eee2cb]/50 space-y-3">
                <Feather className="w-8 h-8 text-[#8c6218] mx-auto animate-bounce" />
                <h4 className="font-cinzel text-sm font-bold text-[#2a1708]">
                  No Preserved Memories Found
                </h4>
                <p className="text-xs text-[#5f3d1b] font-serif max-w-sm mx-auto">
                  No answers match this search. Solve challenges in Round 1 or open the 7 Gates to distill solutions into your Pensieve.
                </p>
                {onNavigateToRound1 && (
                  <button
                    onClick={onNavigateToRound1}
                    className="px-4 py-1.5 rounded-lg bg-[#781808] hover:bg-[#8f1e0a] text-[#fef08a] text-xs font-cinzel font-bold transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Enter Round 1 Vault</span>
                  </button>
                )}
              </div>
            ) : (
              filteredMemories.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-[#a67c1e] bg-[#fdf9f0] shadow-sm hover:shadow-md transition-all space-y-2.5 relative group"
                >
                  {/* Entry Header: Round Tag & Points Stamp */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#a67c1e]/30 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-cinzel font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#781808] text-[#fef08a]">
                          Entry #{idx + 1} · {entry.roundTitle.split(':')[0]}
                        </span>
                        <span className="text-[10px] font-mono text-[#5f3d1b] font-bold">
                          {entry.folderCode}
                        </span>
                      </div>
                      <h4 className="font-cinzel text-sm sm:text-base font-black text-[#1f0f04] pt-1">
                        {entry.challengeTitle}
                      </h4>
                      <p className="text-[11px] font-serif text-[#68431f] italic">
                        Category: {entry.challengeCategory}
                      </p>
                    </div>

                    {/* Wax Seal Points Stamp */}
                    <div className="shrink-0 text-right">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#801b0b] to-[#b91c1c] border border-amber-300 text-amber-100 flex items-center justify-center font-cinzel font-bold text-xs shadow-md">
                        +{entry.points}
                      </div>
                      <span className="text-[8px] font-mono uppercase text-[#781808] font-bold block mt-0.5">
                        XP SEAL
                      </span>
                    </div>
                  </div>

                  {/* Original Cipher Prompt & Verification Answer Inscription */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-[#68431f] flex flex-wrap items-center justify-between gap-1">
                      <span>Cipher Payload / Root Formula:</span>
                      <span className="font-bold text-[#1f0f04] bg-[#eee2cb] px-2 py-0.5 rounded border border-[#a67c1e]/40">
                        {entry.encryptedPrompt}
                      </span>
                    </div>

                    {/* The Verified Answer Plaque (Gilded Calligraphic Style) */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#211204] via-[#351e09] to-[#211204] border border-[#c59b27] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
                          ✦ VERIFIED PENSIEVE ANSWER:
                        </span>
                        <span className="font-mono text-base sm:text-lg font-black text-[#fef08a] tracking-wider select-text">
                          {entry.verifiedAnswer}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyAnswer(entry)}
                        className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-[#c59b27]/30 hover:bg-[#c59b27]/50 border border-[#c59b27] text-[#fef08a] text-xs font-cinzel flex items-center gap-1.5 transition cursor-pointer"
                        title="Copy answer to clipboard"
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#fef08a]" />
                            <span className="text-[10px]">Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mathematical Proof / Inquisitor Hint Note */}
                  {entry.mathematicalProof && (
                    <div className="text-[11px] font-serif text-[#523518] bg-[#f0e4cf] p-2.5 rounded-lg border border-[#a67c1e]/30 flex items-start gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-[#8c6218] shrink-0 mt-0.5" />
                      <span>
                        <strong>Arithmancy Proof:</strong> {entry.mathematicalProof}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Book Page Footer */}
          <div className="relative z-10 pt-3 border-t border-[#a67c1e]/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5f3d1b] font-serif gap-1">
            <span>Verified under Ministry Arithmancy Seal 1897</span>
            <span>Scriptorium Folio VII · Hogwarts Cyber & Arithmancy Module</span>
          </div>
        </div>
      </div>
    </div>
  );
};
