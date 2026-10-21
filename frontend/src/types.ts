export type HogwartsHouse = 'Gryffindor' | 'Ravenclaw' | 'Slytherin' | 'Hufflepuff';

export interface TeamProfile {
  id: string;
  teamName: string;
  captainName: string;
  members: string[];
  house: HogwartsHouse;
  clearanceLevel: number;
  assignedFolderId: string;
  score: number;
  completedRounds: number[];
  registeredAt: string;
}

export interface FolderAllocation {
  id: string;
  code: string;
  title: string;
  lore: string;
  cipherCategory: string;
  difficulty: string;
  accentColor: string;
  runeSymbol: string;
  challenges: RoundChallenge[];
}

export interface RoundChallenge {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  storyContext: string;
  type: 'caesar' | 'modular_arithmancy' | 'xor_matrix';
  cipherPrompt: string;
  encryptedPayload: string;
  arithmeticClue?: string;
  matrixGrid?: string[][];
  hints: string[];
  solution: string; // normal uppercase string
  points: number;
  isSolved: boolean;
  userAnswer?: string;
}

export interface CharacterAlert {
  id: string;
  characterName: string;
  title: string;
  avatar: string;
  houseColor: string;
  quoteTemplate: (remainingMinutes: number) => string;
  audioVoicePitch: number;
  audioVoiceRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  house: HogwartsHouse;
  score: number;
  solvedCount: number;
  lastSolveTime: string;
  status: 'In Round 1' | 'Advancing to Round 2' | 'Solving Round 6';
}

export interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
  timestamp: string;
}
