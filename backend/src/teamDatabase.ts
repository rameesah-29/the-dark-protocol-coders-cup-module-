import crypto from 'crypto';

export interface PreRegisteredTeam {
  id: string;
  username: string;
  teamName: string;
  captainName: string;
  members: string[];
  house: 'Gryffindor' | 'Ravenclaw' | 'Slytherin' | 'Hufflepuff';
  passwordHash: string;
  salt: string;
  clearanceLevel: number;
  assignedFolderId: string;
  score: number;
  completedRounds: number[];
  registeredAt: string;
}

/**
 * Standard scrypt password hasher for cryptographic security
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const candidateHash = hashPassword(password, salt);
    const hashBuffer = Buffer.from(hash, 'hex');
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    if (hashBuffer.length !== candidateBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
  } catch {
    return false;
  }
}

// Generate static salt for the competition
const MODULE_SALT = 'hogwarts_arithmancy_salt_2026';

function createTeamRecord(
  id: string,
  username: string,
  plainPassword: string,
  teamName: string,
  captainName: string,
  members: string[],
  house: 'Gryffindor' | 'Ravenclaw' | 'Slytherin' | 'Hufflepuff',
  assignedFolderId: string,
  score: number
): PreRegisteredTeam {
  return {
    id,
    username: username.toLowerCase().trim(),
    teamName,
    captainName,
    members,
    house,
    salt: MODULE_SALT,
    passwordHash: hashPassword(plainPassword, MODULE_SALT),
    clearanceLevel: 1,
    assignedFolderId,
    score,
    completedRounds: [],
    registeredAt: 'Registered by Administrator',
  };
}

/**
 * Pre-registered competition teams in database.
 * No user registration allowed. Pre-seeded by event administrators.
 */
export const PRE_REGISTERED_TEAMS: PreRegisteredTeam[] = [
  createTeamRecord(
    'team_phoenix',
    'phoenix',
    'alohomora2026',
    'Order of the Phoenix',
    'Harry Potter',
    ['Harry Potter', 'Hermione Granger', 'Ron Weasley'],
    'Gryffindor',
    'folder_alpha',
    0
  ),
  createTeamRecord(
    'team_dumbledore_army',
    'dumbledorearmy',
    'patronus777',
    "Dumbledore's Army",
    'Neville Longbottom',
    ['Neville Longbottom', 'Ginny Weasley', 'Luna Lovegood'],
    'Gryffindor',
    'folder_alpha',
    0
  ),
  createTeamRecord(
    'team_ravenclaw_guild',
    'ravenclaw',
    'arithmancy42',
    'Ravenclaw Arithmancy Guild',
    'Luna Lovegood',
    ['Cho Chang', 'Padma Patil', 'Terry Boot'],
    'Ravenclaw',
    'folder_gamma',
    0
  ),
  createTeamRecord(
    'team_slytherin_devs',
    'slytherin',
    'parseltongue88',
    'Slytherin Parsel-Devs',
    'Blaise Zabini',
    ['Draco Malfoy', 'Blaise Zabini', 'Theodore Nott'],
    'Slytherin',
    'folder_beta',
    0
  ),
  createTeamRecord(
    'team_hufflepuff_logic',
    'hufflepuff',
    'badgercipher',
    'Hufflepuff Logic Keepers',
    'Cedric Diggory',
    ['Hannah Abbott', 'Susan Bones', 'Justin Finch-Fletchley'],
    'Hufflepuff',
    'folder_alpha',
    0
  ),
  createTeamRecord(
    'team_marauders',
    'marauders',
    'mischiefmanaged',
    'The Marauders Cryptographers',
    'Remus Lupin',
    ['James Potter', 'Sirius Black', 'Remus Lupin'],
    'Gryffindor',
    'folder_beta',
    0
  ),
  createTeamRecord(
    'team_alpha',
    'squad1',
    'hogwarts123',
    'Cyber Gryffindor Squad',
    'Hermione Granger',
    ['Hermione Granger', 'Dean Thomas', 'Seamus Finnigan'],
    'Gryffindor',
    'folder_alpha',
    0
  ),
  createTeamRecord(
    'team_beta',
    'squad2',
    'hogwarts123',
    'Diadem Codebreakers',
    'Rowena Acolytes',
    ['Anthony Goldstein', 'Michael Corner'],
    'Ravenclaw',
    'folder_gamma',
    0
  ),
];
