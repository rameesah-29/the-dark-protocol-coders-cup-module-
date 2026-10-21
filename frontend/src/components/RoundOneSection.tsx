import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  FolderLock,
  FolderCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Key,
  Flame,
  Award,
  RefreshCw,
  Sliders,
  Calculator,
  Grid,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { HogwartsHouse, TeamProfile, FolderAllocation, RoundChallenge } from '../types';
import { FOLDER_PACKS } from '../data/moduleData';
import { sound } from '../utils/audio';

interface RoundOneSectionProps {
  currentTeam: TeamProfile | null;
  onRegisterTeam: (team: TeamProfile, folder: FolderAllocation) => void;
  allocatedFolder: FolderAllocation | null;
  onSolveChallenge: (challengeId: string, answer: string) => boolean;
  onAdvanceToRoundTwo: () => void;
  onDeductMinutes?: (mins: number) => void;
}

export const RoundOneSection: React.FC<RoundOneSectionProps> = ({
  currentTeam,
  onRegisterTeam,
  allocatedFolder,
  onSolveChallenge,
  onAdvanceToRoundTwo,
  onDeductMinutes,
}) => {
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Allocation Transition Animation State
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationStepText, setAllocationStepText] = useState('');

  // Game UI State
  const [activeChallengeTab, setActiveChallengeTab] = useState(0);
  const [userInputs, setUserInputs] = useState<{ [id: string]: string }>({});
  const [feedback, setFeedback] = useState<{ [id: string]: { success: boolean; msg: string } }>({});
  const [activeHintIndex, setActiveHintIndex] = useState<{ [id: string]: number }>({});
  
  // Caesar helper wheel state for Game 1
  const [caesarShiftHelper, setCaesarShiftHelper] = useState(7);

  // Handle Team Login with Backend Database Validation
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        sound.playSparkle();
        setErrorMessage(data.message || 'Incorrect username or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Successful verification against database
      sound.playPageTurn();
      if (data.token) {
        try {
          localStorage.setItem('hogwarts_auth_token', data.token);
        } catch {
          // ignore storage block in private sandbox
        }
      }

      // Trigger enchanted folder allocation ceremony
      setIsAllocating(true);
      const teamData: TeamProfile = data.team;

      // Find assigned folder or fallback to hash-based match
      const assignedFolder =
        FOLDER_PACKS.find((f) => f.id === teamData.assignedFolderId) ||
        FOLDER_PACKS[0];

      const steps = [
        "Verifying squad credentials in Ministry Registry...",
        `Authenticating ${teamData.teamName}...`,
        `Retrieving ${assignedFolder.title}...`,
        "Unsealing Round 1 Cryptographic Vault..."
      ];

      steps.forEach((text, i) => {
        setTimeout(() => {
          setAllocationStepText(text);
          sound.playSparkle();
        }, (i + 1) * 600);
      });

      setTimeout(() => {
        sound.playSuccess();
        setIsAllocating(false);
        setIsLoading(false);
        onRegisterTeam(teamData, assignedFolder);
      }, 2600);
    } catch {
      setIsLoading(false);
      setErrorMessage('Unable to connect to the Ministry authentication service. Please try again.');
    }
  };

  const handleInputChange = (challengeId: string, val: string) => {
    setUserInputs((prev) => ({ ...prev, [challengeId]: val }));
    // Clear previous error feedback when typing
    if (feedback[challengeId]?.success === false) {
      setFeedback((prev) => ({ ...prev, [challengeId]: { success: false, msg: '' } }));
    }
  };

  const handleSubmitAnswer = (challenge: RoundChallenge) => {
    const rawVal = userInputs[challenge.id] || '';
    const isCorrect = onSolveChallenge(challenge.id, rawVal);

    if (isCorrect) {
      sound.playSuccess();
      setFeedback((prev) => ({
        ...prev,
        [challenge.id]: {
          success: true,
          msg: `Brilliant! Cipher solved! +${challenge.points} XP awarded to ${currentTeam?.teamName || 'your squad'}.`,
        },
      }));
    } else {
      sound.playSparkle();
      setFeedback((prev) => ({
        ...prev,
        [challenge.id]: {
          success: false,
          msg: "Incorrect cipher key. Examine the clues and check your modular reductions.",
        },
      }));
    }
  };

  const [hintPenaltyNotification, setHintPenaltyNotification] = useState<string | null>(null);

  const toggleHint = (challengeId: string, totalHints: number) => {
    setActiveHintIndex((prev) => ({
      ...prev,
      [challengeId]: ((prev[challengeId] ?? -1) + 1) % totalHints,
    }));

    // Deduct 10 minutes and notify the team
    if (onDeductMinutes) {
      onDeductMinutes(10);
      sound.playTimekeeperBell();
      setHintPenaltyNotification("⏳ 10 Minutes Deducted from Competition Clock! (Arithmancy Hint Penalty)");
      setTimeout(() => {
        setHintPenaltyNotification(null);
      }, 8000);
    }
  };

  // Caesar cipher preview helper
  const shiftText = (text: string, shift: number) => {
    return text.replace(/[A-Z]/g, (char) => {
      const code = char.charCodeAt(0) - 65;
      const shifted = (code - shift + 26) % 26;
      return String.fromCharCode(shifted + 65);
    });
  };

  const challenges = allocatedFolder?.challenges || [];
  const solvedCount = challenges.filter((c) => c.isSolved).length;
  const isAllSolved = challenges.length > 0 && solvedCount === challenges.length;

  return (
    <div className="w-full space-y-8">
      {/* If No Team Logged In Yet: Team Login Page */}
      {!currentTeam || isAllocating ? (
        <div className="max-w-xl mx-auto rounded-2xl border border-[#c59b27]/50 bg-[#091526] p-6 md:p-10 relative overflow-hidden">

          {isAllocating ? (
            /* ALLOCATION CEREMONY ANIMATION */
            <div className="py-16 text-center space-y-6">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#c59b27]/30 border-t-[#f3d069] animate-spin" />
                <FolderLock className="h-10 w-10 text-[#f3d069] animate-magical-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-cinzel text-xl font-bold text-[#fef9c3] [text-shadow:none] [filter:none]">
                  ✦ Authenticating Squad Dossier ✦
                </h3>
                <p className="text-sm font-mono text-[#f3d069] animate-pulse">
                  {allocationStepText || "Consulting Ministry records..."}
                </p>
              </div>
            </div>
          ) : (
            /* TEAM LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Heading & Subtitle */}
              <div className="text-center space-y-2 border-b border-[#c59b27]/30 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c222b] border border-[#c59b27]/25 text-[#f3d069] text-xs font-cinzel">
                  <Shield className="h-3.5 w-3.5 text-[#f3d069]" />
                  <span>✦ Department of Magical Cryptology ✦</span>
                </div>
                <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-[#fef9c3] tracking-wide [text-shadow:none] [filter:none]">
                  Login Your Module Squad
                </h3>
                <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto font-serif">
                  Your mission awaits. Enter your squad credentials to continue.
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl border border-red-500/60 bg-red-950/50 text-red-200 text-xs flex items-center gap-2.5 shadow-md"
                >
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </motion.div>
              )}

              {/* Field 1: Team Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-cinzel font-semibold text-[#f3d069] flex items-center justify-between">
                  <span>Team Username</span>
                  <span className="text-[11px] text-slate-400 font-serif">Pre-assigned by Administrator</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    autoComplete="username"
                    placeholder="Enter your team username (e.g. phoenix, ravenclaw)"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060c18] border border-[#c59b27]/40 focus:border-[#f3d069] focus:ring-1 focus:ring-[#f3d069] focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 font-medium transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c59b27]/80">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Field 2: Team Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-cinzel font-semibold text-[#f3d069] flex items-center justify-between">
                  <span>Team Password</span>
                  <span className="text-[11px] text-slate-400 font-serif">Squad cipher passkey</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    placeholder="Enter your squad password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#060c18] border border-[#c59b27]/40 focus:border-[#f3d069] focus:ring-1 focus:ring-[#f3d069] focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 font-medium transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c59b27]/80">
                    <Lock className="h-4 w-4" />
                  </div>
                  {/* Optional show/hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#f3d069] transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#f3d069]" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Magical-themed Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl border border-[#c59b27] bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] hover:from-[#d4af37] hover:to-[#e2b947] text-[#060c18] font-cinzel font-black text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[0_0_25px_rgba(243,208,105,0.4)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#060c18]" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 text-[#060c18]" />
                    <span>Enter the Wizarding World</span>
                    <Sparkles className="h-4 w-4 fill-current text-[#060c18]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* REGISTERED TEAM DASHBOARD & ROUND 1 GAME CHALLENGES */
        <div className="space-y-6">
          {/* Allocated Folder Dossier Banner */}
          <div className="rounded-2xl border border-[#c59b27]/50 bg-gradient-to-r from-[#091526] via-[#0c1c33] to-[#091526] p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl border-2 border-[#c59b27] bg-[#060c18] flex items-center justify-center text-3xl font-cinzel text-[#f3d069] shadow-inner">
                {allocatedFolder?.runeSymbol || "ᚠ"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#f3d069]">
                    {allocatedFolder?.code}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#fef9c3] font-cinzel">
                    Squad Clearance: Level {currentTeam.clearanceLevel || 1}
                  </span>
                </div>
                <h3 className="font-cinzel text-xl md:text-2xl font-bold text-[#fef9c3]">
                  {allocatedFolder?.title}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl font-serif">
                  {allocatedFolder?.lore}
                </p>
              </div>
            </div>

            {/* Team summary & score badge */}
            <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#c59b27]/30">
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 font-serif">Team: </span>
                <strong className="text-sm font-cinzel text-[#f3d069]">{currentTeam.teamName}</strong>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#060c18] border border-[#c59b27]/40 text-[#f3d069] text-xs font-mono">
                  Points: <strong className="text-[#fef9c3] font-bold">{currentTeam.score} XP</strong>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                  Solved: <strong>{solvedCount}/{challenges.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Stepping Stones Progress Bar Animation */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
              <span className="font-cinzel text-amber-300 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                Round 1 Progression Pathway
              </span>
              <span>{Math.round((solvedCount / (challenges.length || 1)) * 100)}% Completed</span>
            </div>

            {/* Stepping stones */}
            <div className="grid grid-cols-3 gap-3">
              {challenges.map((c, index) => (
                <div
                  key={c.id}
                  onClick={() => setActiveChallengeTab(index)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                    c.isSolved
                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : activeChallengeTab === index
                      ? 'border-amber-400 bg-amber-950/30 text-amber-200 ring-2 ring-amber-400/50'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-[11px] font-mono flex items-center justify-center gap-1.5">
                    {c.isSolved ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                        {index + 1}
                      </span>
                    )}
                    <span>{index === 0 ? 'ROUND 1' : `ROUND ${index + 1}`}</span>
                  </div>
                  <div className="font-cinzel text-xs font-bold truncate mt-1">
                    {c.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE GAME PLAYGROUND CONTAINER */}
          {challenges[activeChallengeTab] && (
            <div className="rounded-2xl border border-[#c59b27]/50 bg-[#0a1526]/95 p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6">
              {/* Game Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c59b27]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#f3d069] font-mono">
                      ✦ {activeChallengeTab === 0 ? 'ROUND 1' : `ROUND ${activeChallengeTab + 1}`} of 3 ✦
                    </span>
                    <span className="text-xs text-slate-300">
                      Value: +{challenges[activeChallengeTab].points} XP
                    </span>
                  </div>
                  <h4 className="font-cinzel text-2xl font-bold text-[#fef9c3] mt-1">
                    {challenges[activeChallengeTab].title}
                  </h4>
                  <p className="text-xs font-mono text-[#f3d069]/90">
                    {challenges[activeChallengeTab].subtitle}
                  </p>
                </div>

                {challenges[activeChallengeTab].isSolved && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500 bg-emerald-950/60 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Unlocked & Verified</span>
                  </div>
                )}
              </div>

              {/* Story Context & Cipher Payload */}
              <div className="space-y-4">
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic bg-[#060c18] p-3.5 rounded-xl border border-[#c59b27]/30 font-serif">
                  📜 "{challenges[activeChallengeTab].storyContext}"
                </p>

                {/* Encrypted Parchment Display Box (Midnight Blue & Burnished Gold) */}
                <div className="p-5 rounded-xl border-2 border-[#c59b27] bg-gradient-to-b from-[#091526] to-[#040912] text-center space-y-2 shadow-inner relative overflow-hidden">
                  <div className="text-xs font-cinzel text-[#f3d069] uppercase tracking-widest">
                    ✦ Intercepted Cipher Payload ✦
                  </div>
                  <div className="font-mono text-xl md:text-3xl font-bold tracking-widest text-[#fef9c3] select-all py-2 drop-shadow-[0_0_12px_rgba(243,208,105,0.3)]">
                    {challenges[activeChallengeTab].encryptedPayload}
                  </div>
                  {challenges[activeChallengeTab].arithmeticClue && (
                    <div className="text-xs font-mono text-[#f3d069]/90 pt-1">
                      {challenges[activeChallengeTab].arithmeticClue}
                    </div>
                  )}
                </div>

                {/* INTERACTIVE CIPHER TOOL ACCORDING TO GAME TYPE */}
                {challenges[activeChallengeTab].type === 'caesar' && (
                  /* Caesar Wheel & Shift Helper Tool */
                  <div className="p-4 rounded-xl border border-[#c59b27]/30 bg-[#060c18] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-cinzel font-semibold text-[#f3d069] flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-[#f3d069]" />
                        Interactive Caesar Rotational Dial (Shift k = {caesarShiftHelper}):
                      </span>
                      <span className="font-mono text-[#fef9c3]">k = {caesarShiftHelper}</span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={caesarShiftHelper}
                      onChange={(e) => setCaesarShiftHelper(Number(e.target.value))}
                      className="w-full accent-[#f3d069] cursor-pointer"
                    />

                    <div className="p-2.5 rounded-lg bg-[#091526] border border-[#c59b27]/40 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-400">Shifted Preview:</span>
                      <span className="text-[#fef9c3] font-bold tracking-wider">
                        {shiftText(challenges[activeChallengeTab].encryptedPayload, caesarShiftHelper)}
                      </span>
                    </div>
                  </div>
                )}

                {challenges[activeChallengeTab].type === 'xor_matrix' && challenges[activeChallengeTab].matrixGrid && (
                  /* XOR 5x5 Matrix Grid Display */
                  <div className="p-4 rounded-xl border border-[#c59b27]/30 bg-[#060c18] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-cinzel font-semibold text-[#f3d069] flex items-center gap-1.5">
                        <Grid className="h-4 w-4 text-[#f3d069]" />
                        Enchanted XOR Polyalphabetic Substitution Matrix:
                      </span>
                    </div>

                    <div className="inline-block mx-auto max-w-sm w-full">
                      <div className="grid grid-cols-5 gap-1.5 p-2 bg-[#091526] rounded-xl border border-[#c59b27]/50">
                        {challenges[activeChallengeTab].matrixGrid?.map((row, rIdx) =>
                          row.map((cell, cIdx) => (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className="h-10 flex items-center justify-center font-mono font-bold text-sm bg-[#060c18] text-[#fef9c3] border border-[#c59b27]/40 rounded hover:border-[#f3d069] hover:text-[#f3d069] transition-colors"
                            >
                              {cell}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submission Area */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      disabled={challenges[activeChallengeTab].isSolved}
                      value={userInputs[challenges[activeChallengeTab].id] || ''}
                      onChange={(e) => handleInputChange(challenges[activeChallengeTab].id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmitAnswer(challenges[activeChallengeTab]);
                        }
                      }}
                      placeholder="Type decrypted plaintext or numerical key..."
                      className="w-full px-4 py-3 rounded-xl bg-[#060c18] border border-[#c59b27]/50 focus:border-[#f3d069] focus:outline-none text-sm text-slate-100 font-mono tracking-wider uppercase placeholder:normal-case placeholder:text-slate-600 disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={challenges[activeChallengeTab].isSolved || !(userInputs[challenges[activeChallengeTab].id] || '').trim()}
                    onClick={() => handleSubmitAnswer(challenges[activeChallengeTab])}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] hover:from-[#d4af37] hover:to-[#e2b947] disabled:bg-neutral-800 disabled:text-neutral-500 text-[#060c18] font-cinzel font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_20px_rgba(243,208,105,0.4)]"
                  >
                    <span>Verify Cipher</span>
                    <Key className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleHint(challenges[activeChallengeTab].id, challenges[activeChallengeTab].hints.length)}
                    className="py-3 px-4 rounded-xl border border-[#c59b27]/40 bg-[#091526] hover:bg-[#0f213a] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 text-[#f3d069]" />
                    <span>Hint</span>
                  </button>
                </div>

                {/* Feedback alert */}
                {feedback[challenges[activeChallengeTab].id]?.msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                      feedback[challenges[activeChallengeTab].id]?.success
                        ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                        : 'border-red-500/60 bg-red-950/40 text-red-200'
                    }`}
                  >
                    {feedback[challenges[activeChallengeTab].id]?.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <HelpCircle className="h-4 w-4 text-red-400 shrink-0" />
                    )}
                    <span>{feedback[challenges[activeChallengeTab].id].msg}</span>
                  </motion.div>
                )}

                {/* 10-Minute Deduction Penalty Notification */}
                {hintPenaltyNotification && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl border border-amber-500/80 bg-amber-950/60 text-amber-200 text-xs font-cinzel font-bold flex items-center gap-2 shadow-lg animate-pulse"
                  >
                    <span className="text-amber-400 text-base">⏳</span>
                    <span>{hintPenaltyNotification}</span>
                  </motion.div>
                )}

                {/* Active Hint Box */}
                {activeHintIndex[challenges[activeChallengeTab].id] !== undefined && (
                  <div className="p-3.5 rounded-xl border border-[#c59b27]/40 bg-[#0c1a30] text-xs text-[#fef9c3] space-y-1">
                    <span className="font-cinzel font-bold uppercase text-[10px] text-[#f3d069]">
                      ✦ Hermione's Arithmancy Clue (Hint {activeHintIndex[challenges[activeChallengeTab].id] + 1} of {challenges[activeChallengeTab].hints.length}):
                    </span>
                    <p className="italic font-serif">
                      "{challenges[activeChallengeTab].hints[activeHintIndex[challenges[activeChallengeTab].id]]}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALL CHALLENGES SOLVED: GATEWAY TO ROUND 2 */}
          {isAllSolved && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-emerald-950/40 text-center space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-cinzel text-2xl font-bold text-emerald-200">
                  Round 1 Completed! Chamber Gates Unlocked!
                </h3>
                <p className="text-xs md:text-sm text-neutral-300 max-w-lg mx-auto">
                  Your team has successfully cracked all 3 ciphers in {allocatedFolder?.title}. Your squad stands recorded on the live dashboard.
                </p>
              </div>

              <button
                onClick={onAdvanceToRoundTwo}
                className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-neutral-950 font-cinzel font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-emerald-500/50 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Advance Stepping Stone to Round 2</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
