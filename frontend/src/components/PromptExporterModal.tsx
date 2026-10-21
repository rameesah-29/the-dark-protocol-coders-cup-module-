import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, X, FileText, Sparkles, Download } from 'lucide-react';

interface PromptExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptExporterModal: React.FC<PromptExporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const MASTER_PROMPT_TEXT = `Create a production-grade, highly immersive interactive web platform for a competitive Harry Potter-themed Cyber Security and Mathematics competition module. The platform must adhere to the following UI/UX architecture and features:

1. MAGICAL BOOK COVER & 3D OPENING PROLOGUE:
- Initial state: A realistic, ornate 3D antique leatherbound grimoire ("Grimoire of Secrets: Cyber & Arithmancy Gauntlet") with gold filigree Hogwarts crest, brass corners, and glowing runic seals.
- Interactive Seal: Clicking "Break Seal & Open Book" triggers a 3D perspective page-opening animation.
- Narrative Scroll (Left Page): Features Harry Potter himself in realistic portrait speaking the competition backstory. Integrated Web Speech API and voice audio controls with synchronized chapter text highlights explaining why Lord Voldemort's Death Eaters embedded dark curses into mathematical ciphers and why student teams are summoned to crack them.
- Lore & Chamber Vault (Right Page): Realistic illustration of the cryptographic Chamber of Secrets with floating Marauder's map scrolls and candles, detailing the rules of the gauntlet and a prominent "Flip Page to Enter Main Portal" transition button.

2. SECOND HOMEPAGE (MAIN MODULE PORTAL) & AMBIENT AESTHETICS:
- Visual Atmosphere: Rich dark parchment and midnight aesthetics with floating, glowing ambient mathematical formulas (Euler's identity e^{iπ}+1=0, modular arithmetic a ≡ b mod m, RSA key equations), Marauder's Map footsteps ("I solemnly swear that I am up to no good"), and cipher terms (XOR CIPHER, CAESAR SHIFT, VIGENÈRE TABULA, ENIGMA ROTOR).
- Sparkle Cursor: A custom high-performance canvas magical sparkle cursor that emits a golden/cyan starlight particle trail following mouse and touch movements, complete with a subtle glowing wand tip aura.

3. 15-MINUTE CHARACTER TIMEKEEPER NOTIFICATION SYSTEM:
- Recurring sentinel alerts: Exactly every 15 minutes, famous Harry Potter characters (Albus Dumbledore, Hermione Granger, Harry Potter, Severus Snape, Minerva McGonagall) slide in from screen edges.
- Each character features an antique time-turner pocket watch frame, custom voice lines announcing how much time is left in the round, and Web Speech Synthesis audio announcements with a test preview button for judges and participants.

4. THREE CORE MODULE NAVIGATION TABS:
- Tab 1: "Round 1 (Team Entry & Dynamic Folder Allocation)":
  * Step 1: Team Registration form capturing Team Name, Captain Name, squad members, and Hogwarts House allegiance (Gryffindor, Ravenclaw, Slytherin, Hufflepuff).
  * Step 2: Animated Arithmancy Folder Allocation ceremony. Based on team entropy, the system allocates an enchanted folder: FOLDER-ALPHA (The Order's Cryptogram), FOLDER-BETA (The Basilisk Matrix), or FOLDER-GAMMA (The Horcrux Hash).
  * Step 3: Interactive cipher games in that folder:
    - Round 1: Rotational Caesar Cipher with interactive shift slider dial.
    - Round 2: Modular Congruence Arithmancy calculation with scratchpad and hint systems.
    - Round 3: XOR Polyalphabetic Matrix substitution with interactive 5x5 key grid.
  * Stepping stones animation: Visual progress pathway leading to the unlocked Round 2 Gateway.
- Tab 2: "Time & Live Dashboard":
  * Master competition hourglass clock with start/pause/add 15 minutes controls.
  * Live House Cup points race bars for all four houses.
  * Tabular squad leaderboard tracking ranks, solve counts, scores, and status.
- Tab 3: "Final Terminal (50th of Round 6 / Chamber of Keys)":
  * Retro-magical CRT phosphor hacker console (CLI) simulating the climactic 50th challenge.
  * Interactive commands: 'help', 'status', 'decrypt <text>', 'matrix <key>', 'cast lumos', 'cast alohomora', 'cast patronus', 'time', 'solve 50'.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([MASTER_PROMPT_TEXT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Harry_Potter_Cyber_Maths_Master_Prompt.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl rounded-2xl border-2 border-[#c59b27] bg-[#0a1526] text-slate-100 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#c59b27]/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#060c18] border border-[#c59b27]/60 flex items-center justify-center text-[#f3d069]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#fef9c3]">
                  ✦ Master Prompt & UI/UX Specification Blueprint ✦
                </h3>
                <p className="text-xs text-slate-300 font-serif">
                  Ready to copy into any prompt-based builder or documentation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#f3d069] hover:bg-[#060c18]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Prompt Content Preview */}
          <div className="flex-1 overflow-y-auto my-4 p-4 rounded-xl bg-[#060c18] border border-[#c59b27]/40 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
            {MASTER_PROMPT_TEXT}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#c59b27]/30">
            <div className="flex items-center gap-1.5 text-xs text-[#f3d069]">
              <Sparkles className="h-4 w-4" />
              <span>Includes complete module logic, book 3D flips, and character alerts</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl border border-[#c59b27]/40 bg-[#060c18] hover:bg-[#0f213a] text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#f3d069]" />
                <span>Download .txt</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f3d069] to-[#c59b27] hover:from-[#d4af37] hover:to-[#e2b947] text-[#060c18] text-xs font-cinzel font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-[#c59b27]/25"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-950" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Master Prompt'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
