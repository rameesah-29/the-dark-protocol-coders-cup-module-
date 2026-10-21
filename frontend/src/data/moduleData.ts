import { CharacterAlert, FolderAllocation, LeaderboardEntry } from '../types';
import { ASSETS } from './assets';

export const HARRY_FULL_STORY_TEXT = `Listen carefully. I don't have much time to explain.

What I'm about to tell you might be the most dangerous thing you'll ever hear.

Beneath the grounds of Hogwarts lies an ancient prison. A place built to contain the magic that even the Ministry of Magic was afraid to control.

For years, its doors remained sealed. Its enchantments remained unbroken.

Until tonight.

Someone has tampered with the prison's magical security system. The spells protecting its chambers have been corrupted, the locks have become unpredictable, and something that should never have escaped is now roaming the corridors.

And somehow… you've ended up inside.

There is only one way out.

The prison is divided into chambers, each protected by an enchanted door. These doors cannot be opened by ordinary spells. You'll need to solve the mathematical enchantments, uncover hidden codes, repair broken spells, and outsmart the security system protecting each chamber.

But be warned. Not every answer will be obvious, and not every path will lead you forward.

The prison is already aware of your presence. Every second you spend here brings it closer to finding you.

You have ninety minutes.

Ninety minutes to solve the puzzles. Ninety minutes to unlock the chambers. Ninety minutes to reach the final door.

If you fail, the prison's defenses will activate, and you may never find your way out.

I'll guide you whenever I can, but I cannot solve these challenges for you.

Your intelligence is your greatest weapon. Your teamwork is your only advantage.

So stay alert. Trust your reasoning. Check every number, every symbol, every line of code.

And whatever you do…

**Don't let it catch you.**

Now, get moving.

Your escape begins… NOW.`;

export const HARRY_STORY_SCRIPT = [
  {
    chapter: "Chapter I: The Ancient Prison Beneath Hogwarts",
    subtitle: "The Breach & The Awakening",
    text: "Listen carefully. I don't have much time to explain. What I'm about to tell you might be the most dangerous thing you'll ever hear. Beneath the grounds of Hogwarts lies an ancient prison. A place built to contain the magic that even the Ministry of Magic was afraid to control. For years, its doors remained sealed. Its enchantments remained unbroken. Until tonight.",
  },
  {
    chapter: "Chapter II: The Corrupted Chambers",
    subtitle: "Something Has Escaped",
    text: "Someone has tampered with the prison's magical security system. The spells protecting its chambers have been corrupted, the locks have become unpredictable, and something that should never have escaped is now roaming the corridors. And somehow… you've ended up inside.",
  },
  {
    chapter: "Chapter III: The Mathematical Enchantments",
    subtitle: "Chambers & Hidden Codes",
    text: "There is only one way out. The prison is divided into chambers, each protected by an enchanted door. These doors cannot be opened by ordinary spells. You'll need to solve the mathematical enchantments, uncover hidden codes, repair broken spells, and outsmart the security system protecting each chamber. But be warned. Not every answer will be obvious, and not every path will lead you forward. The prison is already aware of your presence. Every second you spend here brings it closer to finding you.",
  },
  {
    chapter: "Chapter IV: The Ninety-Minute Countdown",
    subtitle: "Your Escape Begins Now",
    text: "You have ninety minutes. Ninety minutes to solve the puzzles. Ninety minutes to unlock the chambers. Ninety minutes to reach the final door. If you fail, the prison's defenses will activate, and you may never find your way out. I'll guide you whenever I can, but I cannot solve these challenges for you. Your intelligence is your greatest weapon. Your teamwork is your only advantage. So stay alert. Trust your reasoning. Check every number, every symbol, every line of code. And whatever you do… **Don't let it catch you.** Now, get moving. Your escape begins… NOW.",
  },
];

export interface FloatingElement {
  text: string;
  type: 'formula' | 'cipher' | 'scrap';
  x: number;
  y: number;
  delay: number;
  duration?: number;
  driftType: 'drift' | 'drift-alt' | 'parchment';
  secondaryText?: string;
}

export const FLOATING_CIPHER_ELEMENTS: FloatingElement[] = [
  // Glowing Mathematical Formulas
  { text: "e^{iπ} + 1 = 0", type: "formula", x: 8, y: 14, delay: 0, duration: 16, driftType: "drift" },
  { text: "c ≡ m^e (mod n) [RSA]", type: "formula", x: 74, y: 12, delay: 2.4, duration: 20, driftType: "drift-alt" },
  { text: "a^p ≡ a (mod p)", type: "formula", x: 28, y: 36, delay: 4.1, duration: 18, driftType: "drift" },
  { text: "gcd(a, b) = a·x + b·y", type: "formula", x: 85, y: 44, delay: 1.8, duration: 22, driftType: "drift-alt" },
  { text: "det(M - λI) = 0", type: "formula", x: 14, y: 68, delay: 3.5, duration: 17, driftType: "drift" },
  { text: "H(m) = SHA256(m ⊕ K)", type: "formula", x: 62, y: 76, delay: 5.2, duration: 19, driftType: "drift-alt" },

  // Glowing Magical Ciphers & Runes
  { text: "✦ XOR CIPHER MATRIX [7×7]", type: "cipher", x: 52, y: 8, delay: 1.2, duration: 15, driftType: "drift" },
  { text: "⚡ CAESAR SHIFT (ROT-13)", type: "cipher", x: 82, y: 28, delay: 3.0, duration: 21, driftType: "drift-alt" },
  { text: "ᚠ VIGENÈRE TABULA RECTA", type: "cipher", x: 4, y: 48, delay: 2.1, duration: 19, driftType: "drift" },
  { text: "🗝 ALOHOMORA KEY: 0x7F4A", type: "cipher", x: 38, y: 62, delay: 4.8, duration: 23, driftType: "drift-alt" },
  { text: "✧ PATRONUS ENTROPY SEED", type: "cipher", x: 78, y: 86, delay: 0.8, duration: 16, driftType: "drift" },

  // Drifting Parchment Scraps with handwritten notes & charred borders
  {
    text: "Restricted Section · Folio 93",
    secondaryText: "Warning: Modular inverses invert dark hexes",
    type: "scrap",
    x: 42,
    y: 26,
    delay: 1.5,
    duration: 14,
    driftType: "parchment",
  },
  {
    text: "Marauder's Cryptographic Note",
    secondaryText: "Mischief Managed 👣 Key = PADFOOT",
    type: "scrap",
    x: 18,
    y: 82,
    delay: 3.8,
    duration: 18,
    driftType: "parchment",
  },
  {
    text: "Ravenclaw Diadem Algorithm",
    secondaryText: "Wit beyond measure is cipher's greatest treasure",
    type: "scrap",
    x: 66,
    y: 52,
    delay: 2.9,
    duration: 16,
    driftType: "parchment",
  },
];

export const CHARACTER_ALERTS: CharacterAlert[] = [
  {
    id: "dumbledore",
    characterName: "Albus Dumbledore",
    title: "Headmaster of Hogwarts",
    avatar: ASSETS.dumbledoreTimer,
    houseColor: "#d4af37",
    quoteTemplate: (remainingMinutes: number) => 
      `"Time is a mysterious thing, code-breakers... You have precisely ${remainingMinutes} minutes left before the chamber wards seal shut. Remember: it is our choices that show what we truly are, far more than our raw computational abilities."`,
    audioVoicePitch: 0.70,
    audioVoiceRate: 0.80,
  },
  {
    id: "hermione",
    characterName: "Hermione Granger",
    title: "Chief Arithmancer & Prefect",
    avatar: ASSETS.hermionePortrait,
    houseColor: "#7f1d1d",
    quoteTemplate: (remainingMinutes: number) =>
      `"Attention, everyone! Exactly ${remainingMinutes} minutes remaining in this round! Honestly, double-check your modular reductions—an error in step three will propagate right through the entire XOR matrix key! Hurry up!"`,
    audioVoicePitch: 1.25,
    audioVoiceRate: 1.08,
  },
  {
    id: "snape",
    characterName: "Severus Snape",
    title: "Master of Cryptographic Arts",
    avatar: ASSETS.snapePortrait,
    houseColor: "#14532d",
    quoteTemplate: (remainingMinutes: number) =>
      `"${remainingMinutes} minutes remaining... Clearly... most of you have not even begun to comprehend the delicate science of modular congruence. Foolish hesitation... will cost your house dear."`,
    audioVoicePitch: 0.58,
    audioVoiceRate: 0.72,
  },
  {
    id: "mcgonagall",
    characterName: "Minerva McGonagall",
    title: "Deputy Headmistress",
    avatar: ASSETS.mcgonagallPortrait,
    houseColor: "#b45309",
    quoteTemplate: (remainingMinutes: number) =>
      `"${remainingMinutes} minutes on the hourglass! The Ministry examiners are observing the live dashboard. Keep your wits about you, step to your desks, and submit your decrypted folder tokens at once!"`,
    audioVoicePitch: 0.94,
    audioVoiceRate: 0.90,
  },
  {
    id: "ron",
    characterName: "Ron Weasley",
    title: "Gryffindor Keeper & Strategist",
    avatar: ASSETS.ronPortrait,
    houseColor: "#b91c1c",
    quoteTemplate: (remainingMinutes: number) =>
      `"Bloody hell, mate! There's only ${remainingMinutes} minutes left! Hermione's going mental over the residue formulas and my brain feels like a squashed Cauldron Cake. We've got to submit that token now!"`,
    audioVoicePitch: 1.12,
    audioVoiceRate: 1.04,
  },
  {
    id: "harry",
    characterName: "Harry Potter",
    title: "Order of the Phoenix Operative",
    avatar: ASSETS.harryNarrator,
    houseColor: "#991b1b",
    quoteTemplate: (remainingMinutes: number) =>
      `"Keep your wands and minds steady! We have ${remainingMinutes} minutes remaining on the clock. Trust your instincts, decode the intercepted parchment, and keep moving forward!"`,
    audioVoicePitch: 1.05,
    audioVoiceRate: 0.98,
  },
];

export const FOLDER_PACKS: FolderAllocation[] = [
  {
    id: "folder_alpha",
    code: "FOLDER-ALPHA // PHOENIX-CIPHER",
    title: "The Order's Cryptogram: Marauder's Transposition",
    lore: "Recovered from Sirius Black's secret hideout in Grimmauld Place. An encrypted parchment using Caesar shifts combined with ancient Arithmancy runes.",
    cipherCategory: "Polyalphabetic & Substitution Ciphers",
    difficulty: "Apprentice Cryptanalyst (Moderate)",
    accentColor: "#ef4444",
    runeSymbol: "ᚠ",
    challenges: [
      {
        id: "alpha_c1",
        number: 1,
        title: "The Marauder's Intercepted Whisper",
        subtitle: "Caesar Shift Cryptanalysis (k = 7)",
        storyContext: "Death Eaters communicated through an enchanted parchment using a rotational shift of 7 positions.",
        type: "caesar",
        cipherPrompt: "Decode the intercepted cipher string below to reveal the secret password required for the Room of Requirement entrance:",
        encryptedPayload: "TVIHJLA AOL TVKBSL", // Shifted by 7: PROTECT THE MODULE
        hints: [
          "The stars in the astronomy tower march forward in an unyielding cycle of seven paces. Seek what lies behind when the seventh step is walked in reverse.",
          "A guardian's oath: the words urge you to defend the very challenge you have entered."
        ],
        solution: "PROTECT THE MODULE",
        points: 100,
        isSolved: false,
      },
      {
        id: "alpha_c2",
        number: 2,
        title: "The Arithmancy Congruence Lock",
        subtitle: "Modular Arithmetic & Residue System",
        storyContext: "To open the enchanted brass padlock on Folder Alpha, Hermione inscribed a system of modular congruences based on harmonic ratios.",
        type: "modular_arithmancy",
        cipherPrompt: "Find the smallest positive integer X that satisfies the Arithmancy system:",
        encryptedPayload: "X ≡ 3 (mod 5)  and  X ≡ 4 (mod 7)",
        arithmeticClue: "Two magical cycles spin at different cadences. Seek the point of harmonic alignment.",
        hints: [
          "Follow the sequence of shadows left when stepping in strides of seven until division by five leaves three footsteps behind.",
          "A young seeker who comes of age in the wizarding world will recognize this number."
        ],
        solution: "18",
        points: 150,
        isSolved: false,
      },
      {
        id: "alpha_c3",
        number: 3,
        title: "The XOR Matrix Decryption",
        subtitle: "Polyalphabetic Matrix Key",
        storyContext: "The final layer of Folder Alpha uses the legendary XOR protocol—a dynamic substitution matrix powered by Arithmancy indices.",
        type: "xor_matrix",
        cipherPrompt: "Using the XOR Keyword 'ALOHOMORA' to decrypt the ciphertext:",
        encryptedPayload: "XOR-KEY-9842",
        matrixGrid: [
          ["X", "O", "R", "K", "Y"],
          ["A", "R", "I", "T", "H"],
          ["M", "A", "N", "C", "Y"],
          ["H", "A", "C", "K", "S"],
          ["L", "U", "M", "O", "S"]
        ],
        hints: [
          "Look to the unlocking charm that opens forbidden doors, combined with the modern realm of digital defence.",
          "Two words: the spell cast upon stubborn deadbolts, followed by the domain of digital networks."
        ],
        solution: "ALOHOMORA CYBER",
        points: 250,
        isSolved: false,
      }
    ]
  },
  {
    id: "folder_beta",
    code: "FOLDER-BETA // BASILISK-MATRIX",
    title: "The Chamber's Cipher: Modular Prime Residue",
    lore: "Discovered etched onto the serpent statues in the Chamber of Secrets. Uses prime factorization and discrete logarithms.",
    cipherCategory: "Asymmetric Public Key & Modular Arithmetic",
    difficulty: "Advanced Arithmancer (Challenging)",
    accentColor: "#10b981",
    runeSymbol: "ᛋ",
    challenges: [
      {
        id: "beta_c1",
        number: 1,
        title: "The Parseltongue Rotational Shift",
        subtitle: "Caesar Cryptanalysis (k = 13 / ROT13)",
        storyContext: "Salazar Slytherin's journal was obscured by a symmetrical rotational cipher.",
        type: "caesar",
        cipherPrompt: "Decode the serpent's intercepted message:",
        encryptedPayload: "FCRYYF NAQ FHOWRPGF", // SPELLS AND SUBJECTS
        hints: [
          "A serpent's wheel turns half a circle, where the reflection mirrors the cipher itself. Turn the wheel to its opposite pole.",
          "The inscription speaks of incantations and the academic disciplines taught at the school."
        ],
        solution: "SPELLS AND SUBJECTS",
        points: 100,
        isSolved: false,
      },
      {
        id: "beta_c2",
        number: 2,
        title: "The Diophantine Basilisk Equation",
        subtitle: "Linear Congruence: 7x ≡ 1 (mod 26)",
        storyContext: "Find the modular multiplicative inverse of 7 modulo 26 to unlock the serpent vault.",
        type: "modular_arithmancy",
        cipherPrompt: "Compute the integer x (1 ≤ x < 26) such that (7 * x) mod 26 = 1:",
        encryptedPayload: "7·x ≡ 1 (mod 26)",
        arithmeticClue: "Seek the multiplier that yields a remainder of one over the alphabet.",
        hints: [
          "Seek a multiplier that, when multiplied by seven, exceeds a multiple of twenty-six by exactly one.",
          "Think of a fortnight plus a single day."
        ],
        solution: "15",
        points: 150,
        isSolved: false,
      },
      {
        id: "beta_c3",
        number: 3,
        title: "The XOR Serpent Matrix",
        subtitle: "Polyalphabetic Block Decryption",
        storyContext: "Decrypt the final hex sequence from the basilisk's scale grid.",
        type: "xor_matrix",
        cipherPrompt: "Decrypt the cipher with the master serpent keyword 'SERPENS':",
        encryptedPayload: "XOR-BASILISK-404",
        matrixGrid: [
          ["S", "L", "Y", "T", "H"],
          ["E", "R", "I", "N", "A"],
          ["B", "A", "S", "I", "L"],
          ["I", "S", "K", "O", "R"],
          ["V", "E", "N", "O", "M"]
        ],
        hints: [
          "The serpent scales conceal the name of the founder who built this chamber.",
          "Two words: the master of snakes, followed by the word for an encrypted code."
        ],
        solution: "SALAZAR CIPHER",
        points: 250,
        isSolved: false,
      }
    ]
  },
  {
    id: "folder_gamma",
    code: "FOLDER-GAMMA // HORCRUX-HASH",
    title: "The Dark Horcrux: Binary Bitwise & Matrix Permutation",
    lore: "Retrieved from the black lake cave. Guarded by complex bitwise logic and modular exponentiation ciphers.",
    cipherCategory: "Binary XOR & Advanced Matrix Arithmancy",
    difficulty: "Master Cryptanalyst (High)",
    accentColor: "#8b5cf6",
    runeSymbol: "ᛗ",
    challenges: [
      {
        id: "gamma_c1",
        number: 1,
        title: "The Diadem's Intercepted Cipher",
        subtitle: "Caesar Cryptanalysis (k = 3)",
        storyContext: "Rowena Ravenclaw's diadem is protected by an antique shift cipher.",
        type: "caesar",
        cipherPrompt: "Decode the wisdom inscription:",
        encryptedPayload: "ZLW EHBRQG PHDVXUH", // WIT BEYOND MEASURE
        hints: [
          "The shift is as brief as the three Deathly Hallows. Step backwards three times to let the true letters take flight.",
          "Reflect upon the words inscribed on Rowena Ravenclaw's lost diadem."
        ],
        solution: "WIT BEYOND MEASURE",
        points: 100,
        isSolved: false,
      },
      {
        id: "gamma_c2",
        number: 2,
        title: "Fermat's Little Theorem Key",
        subtitle: "Fast Modular Exponentiation",
        storyContext: "Calculate 3^16 mod 17 using prime modular reduction laws.",
        type: "modular_arithmancy",
        cipherPrompt: "What is the remainder when 3^16 is divided by prime 17?",
        encryptedPayload: "3^16 mod 17 = ?",
        arithmeticClue: "The base is coprime to the prime modulus, and the power is prime minus one.",
        hints: [
          "Look to the fundamental law of prime powers: when any coprime base is raised to the order of a prime minus one, the cosmos collapses to the most singular unit of all.",
          "The unity that stands at the very beginning of all numbers."
        ],
        solution: "1",
        points: 150,
        isSolved: false,
      },
      {
        id: "gamma_c3",
        number: 3,
        title: "The XOR Horcrux Matrix",
        subtitle: "Polyalphabetic Block Decryption",
        storyContext: "Break the final Horcrux seal using the XOR cryptographic matrix.",
        type: "xor_matrix",
        cipherPrompt: "Decrypt the Horcrux token with key 'RAVENCLAW':",
        encryptedPayload: "XOR-HORCRUX-777",
        matrixGrid: [
          ["H", "O", "R", "C", "R"],
          ["U", "X", "K", "E", "Y"],
          ["M", "A", "G", "I", "C"],
          ["C", "O", "D", "E", "S"],
          ["N", "I", "G", "H", "T"]
        ],
        hints: [
          "The diadem requires both house allegiance and pure rational intellect.",
          "Two words: Rowena's house name, followed by the philosophical study of valid inference."
        ],
        solution: "RAVENCLAW LOGIC",
        points: 250,
        isSolved: false,
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    teamName: "Order of the Phoenix",
    house: "Gryffindor",
    score: 850,
    solvedCount: 3,
    lastSolveTime: "12m ago",
    status: "Advancing to Round 2"
  },
  {
    rank: 2,
    teamName: "Ravenclaw Arithmancy Guild",
    house: "Ravenclaw",
    score: 800,
    solvedCount: 3,
    lastSolveTime: "18m ago",
    status: "Advancing to Round 2"
  },
  {
    rank: 3,
    teamName: "Slytherin Parsel-Devs",
    house: "Slytherin",
    score: 650,
    solvedCount: 2,
    lastSolveTime: "24m ago",
    status: "In Round 1"
  },
  {
    rank: 4,
    teamName: "Hufflepuff Logic Keepers",
    house: "Hufflepuff",
    score: 500,
    solvedCount: 2,
    lastSolveTime: "31m ago",
    status: "In Round 1"
  },
  {
    rank: 5,
    teamName: "Dumbledore's Army",
    house: "Gryffindor",
    score: 350,
    solvedCount: 1,
    lastSolveTime: "40m ago",
    status: "In Round 1"
  }
];
