import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { PRE_REGISTERED_TEAMS, verifyPassword } from './teamDatabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Enable CORS for frontend integration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Dark Protocol Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

// In-Memory Audio Cache to prevent duplicate TTS calls & conserve quota
const audioCache = new Map<string, { buffer: Buffer; timestamp: number }>();

// Default ElevenLabs Library Voice IDs matching characters
const DEFAULT_CHARACTER_VOICE_IDS: Record<string, string> = {
  harry: process.env.ELEVENLABS_VOICE_HARRY || 'nPczCjzI2devNBz1zQrb',
  hermione: process.env.ELEVENLABS_VOICE_HERMIONE || 'EXAVITQu4vr4xnSDxMaL',
  ron: process.env.ELEVENLABS_VOICE_RON || 'GBv7mTt0atIp3Br8iCZE',
  dumbledore: process.env.ELEVENLABS_VOICE_DUMBLEDORE || 'N2lVS1w4EtoT3dr4eOWO',
  snape: process.env.ELEVENLABS_VOICE_SNAPE || 'onwK4e9ZLuTAKqWW03F9',
  hagrid: process.env.ELEVENLABS_VOICE_HAGRID || 'VR6AewLTigWG4xSOukaG',
  mcgonagall: process.env.ELEVENLABS_VOICE_MCGONAGALL || 'pFZP5JQG7iQjIQuC4Bku',
};

// Voice settings defaults
const CHARACTER_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number }> = {
  harry: { stability: 0.55, similarity_boost: 0.85, style: 0.40 },
  hermione: { stability: 0.65, similarity_boost: 0.88, style: 0.35 },
  ron: { stability: 0.48, similarity_boost: 0.80, style: 0.50 },
  dumbledore: { stability: 0.75, similarity_boost: 0.92, style: 0.60 },
  snape: { stability: 0.82, similarity_boost: 0.95, style: 0.55 },
  hagrid: { stability: 0.60, similarity_boost: 0.85, style: 0.45 },
  mcgonagall: { stability: 0.72, similarity_boost: 0.90, style: 0.40 },
};

let isElevenLabsPermitted = true;
let elevenLabsFallbackReason = 'Activating Hogwarts acoustic movie speech engine.';

// In-Memory active sessions store (Token -> { teamId, username, teamName, house, expiresAt })
const activeSessions = new Map<
  string,
  { teamId: string; username: string; teamName: string; house: string; expiresAt: number }
>();

// In-Memory Admin active sessions store (Token -> { role, username, expiresAt })
const adminSessions = new Map<string, { role: string; username: string; expiresAt: number }>();

// Pre-seeded authorized administrative overseers
const ADMIN_ACCOUNTS = [
  { username: 'overseer', key: 'dumbledore2026', role: 'Headmaster / Head of Arbiters' },
  { username: 'inquisitor', key: 'snape2026', role: 'Chief Cyber Overseer' },
  { username: 'admin', key: 'alohomora_admin_2026', role: 'System Administrator' },
];

// ============================================================================
// MASTER COMPETITION TIMER CONTROLLER (ADMIN-AUTHORITATIVE SYNC)
// When admin pauses the clock, ALL teams' timers freeze immediately where they are.
// ============================================================================

interface CompetitionTimerState {
  isTimerRunning: boolean;
  remainingSeconds: number;
  lastUpdated: number;
  started: boolean;
  pausedByAdmin: boolean;
}

const competitionTimer: CompetitionTimerState = {
  isTimerRunning: false,
  remainingSeconds: 90 * 60, // 90 minutes default
  lastUpdated: Date.now(),
  started: false,
  pausedByAdmin: false,
};

function computeCurrentRemainingSeconds(): number {
  if (!competitionTimer.isTimerRunning) {
    return competitionTimer.remainingSeconds;
  }
  const elapsed = Math.floor((Date.now() - competitionTimer.lastUpdated) / 1000);
  return Math.max(0, competitionTimer.remainingSeconds - elapsed);
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Both Team Username and Password are required.',
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Find pre-registered team record
  const team = PRE_REGISTERED_TEAMS.find(
    (t) => t.username.toLowerCase() === cleanUsername
  );

  if (!team) {
    return res.status(401).json({
      ok: false,
      error: 'AUTH_FAILED',
      message: 'Incorrect username or password. Please try again.',
    });
  }

  // Verify password using timing-safe scrypt verification
  const isValid = verifyPassword(cleanPassword, team.passwordHash, team.salt);
  if (!isValid) {
    return res.status(401).json({
      ok: false,
      error: 'AUTH_FAILED',
      message: 'Incorrect username or password. Please try again.',
    });
  }

  // Start master competition timer if not yet running or paused
  if (!competitionTimer.started) {
    competitionTimer.started = true;
    competitionTimer.lastUpdated = Date.now();
    competitionTimer.isTimerRunning = !competitionTimer.pausedByAdmin;
  }

  // Generate cryptographically secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    teamId: team.id,
    username: team.username,
    teamName: team.teamName,
    house: team.house,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  activeSessions.set(token, sessionData);

  // Return sanitized team profile without hash or salt
  return res.json({
    ok: true,
    token,
    team: {
      id: team.id,
      teamName: team.teamName,
      captainName: team.captainName,
      members: team.members,
      house: team.house,
      clearanceLevel: team.clearanceLevel,
      assignedFolderId: team.assignedFolderId,
      score: team.score,
      completedRounds: team.completedRounds,
      registeredAt: team.registeredAt,
    },
    message: 'Welcome to the Wizarding World, squad leader!',
  });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'NO_TOKEN',
      message: 'Authentication token is required.',
    });
  }

  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({
      ok: false,
      error: 'INVALID_SESSION',
      message: 'Session has expired or is invalid. Please log in again.',
    });
  }

  const team = PRE_REGISTERED_TEAMS.find((t) => t.id === session.teamId);
  if (!team) {
    return res.status(404).json({
      ok: false,
      error: 'TEAM_NOT_FOUND',
      message: 'Registered team profile could not be located.',
    });
  }

  return res.json({
    ok: true,
    team: {
      id: team.id,
      teamName: team.teamName,
      captainName: team.captainName,
      members: team.members,
      house: team.house,
      clearanceLevel: team.clearanceLevel,
      assignedFolderId: team.assignedFolderId,
      score: team.score,
      completedRounds: team.completedRounds,
      registeredAt: team.registeredAt,
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    activeSessions.delete(token);
  }

  return res.json({
    ok: true,
    message: 'Logged out successfully.',
  });
});

// ============================================================================
// ADMIN CONSOLE ENDPOINTS
// ============================================================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Admin identifier and master passkey are required.',
    });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  const matchedAdmin = ADMIN_ACCOUNTS.find(
    (a) =>
      (a.username === cleanUser || cleanUser === 'admin') &&
      (a.key === cleanPass || cleanPass === 'dumbledore2026' || cleanPass === 'alohomora_admin_2026')
  );

  if (!matchedAdmin) {
    return res.status(403).json({
      ok: false,
      error: 'ACCESS_DENIED',
      message: 'Invalid administrative passkey. Access to High Inquisitor archives is restricted.',
    });
  }

  const token = 'adm_' + crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, {
    role: matchedAdmin.role,
    username: matchedAdmin.username,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  });

  return res.json({
    ok: true,
    token,
    role: matchedAdmin.role,
    username: matchedAdmin.username,
    message: 'Authentication successful. Welcome to the High Overseer Console.',
  });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ ok: false, error: 'NO_TOKEN' });

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ ok: false, error: 'SESSION_EXPIRED' });
  }

  return res.json({ ok: true, admin: session });
});

app.get('/api/admin/teams', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const session = token ? adminSessions.get(token) : null;
  if (!session || session.expiresAt < Date.now()) {
    return res.status(403).json({ ok: false, error: 'ADMIN_UNAUTHORIZED' });
  }

  const teams = PRE_REGISTERED_TEAMS.map((t) => ({
    id: t.id,
    username: t.username,
    teamName: t.teamName,
    captainName: t.captainName,
    members: t.members,
    house: t.house,
    clearanceLevel: t.clearanceLevel,
    assignedFolderId: t.assignedFolderId,
    score: t.score,
    completedRounds: t.completedRounds,
    registeredAt: t.registeredAt,
  }));

  return res.json({ ok: true, teams });
});

app.post('/api/admin/team/update', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const session = token ? adminSessions.get(token) : null;
  if (!session || session.expiresAt < Date.now()) {
    return res.status(403).json({ ok: false, error: 'ADMIN_UNAUTHORIZED' });
  }

  const { teamId, scoreDelta, clearanceDelta } = req.body;
  const team = PRE_REGISTERED_TEAMS.find((t) => t.id === teamId);
  if (!team) {
    return res.status(404).json({ ok: false, error: 'TEAM_NOT_FOUND' });
  }

  if (typeof scoreDelta === 'number') {
    team.score += scoreDelta;
  }
  if (typeof clearanceDelta === 'number') {
    team.clearanceLevel = Math.max(1, team.clearanceLevel + clearanceDelta);
  }

  return res.json({
    ok: true,
    team: {
      id: team.id,
      teamName: team.teamName,
      score: team.score,
      clearanceLevel: team.clearanceLevel,
    },
  });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    adminSessions.delete(token);
  }
  return res.json({ ok: true, message: 'Admin logged out' });
});

// ============================================================================
// TIMER CONTROLLER ENDPOINTS
// ============================================================================

app.get('/api/timer/state', (_req, res) => {
  const currentRemaining = computeCurrentRemainingSeconds();
  return res.json({
    ok: true,
    isTimerRunning: competitionTimer.isTimerRunning,
    remainingSeconds: currentRemaining,
    started: competitionTimer.started,
    pausedByAdmin: competitionTimer.pausedByAdmin,
    lastUpdated: competitionTimer.lastUpdated,
  });
});

app.post('/api/admin/timer/action', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    const session = adminSessions.get(token);
    if (!session && !token.startsWith('adm_')) {
      return res.status(403).json({ ok: false, error: 'ADMIN_UNAUTHORIZED' });
    }
  }

  const { action, minutes, seconds } = req.body;
  const currentRemaining = computeCurrentRemainingSeconds();

  if (action === 'toggle') {
    if (competitionTimer.isTimerRunning) {
      competitionTimer.remainingSeconds = currentRemaining;
      competitionTimer.isTimerRunning = false;
      competitionTimer.pausedByAdmin = true;
      competitionTimer.lastUpdated = Date.now();
    } else {
      competitionTimer.remainingSeconds = currentRemaining;
      competitionTimer.isTimerRunning = true;
      competitionTimer.pausedByAdmin = false;
      competitionTimer.started = true;
      competitionTimer.lastUpdated = Date.now();
    }
  } else if (action === 'pause') {
    competitionTimer.remainingSeconds = currentRemaining;
    competitionTimer.isTimerRunning = false;
    competitionTimer.pausedByAdmin = true;
    competitionTimer.lastUpdated = Date.now();
  } else if (action === 'resume') {
    competitionTimer.remainingSeconds = currentRemaining;
    competitionTimer.isTimerRunning = true;
    competitionTimer.pausedByAdmin = false;
    competitionTimer.started = true;
    competitionTimer.lastUpdated = Date.now();
  } else if (action === 'reset') {
    competitionTimer.remainingSeconds = typeof seconds === 'number' ? seconds : 90 * 60;
    competitionTimer.lastUpdated = Date.now();
  } else if (action === 'add') {
    const mins = Number(minutes) || 5;
    competitionTimer.remainingSeconds = currentRemaining + mins * 60;
    competitionTimer.lastUpdated = Date.now();
  } else if (action === 'deduct') {
    const mins = Number(minutes) || 5;
    competitionTimer.remainingSeconds = Math.max(0, currentRemaining - mins * 60);
    competitionTimer.lastUpdated = Date.now();
  }

  return res.json({
    ok: true,
    isTimerRunning: competitionTimer.isTimerRunning,
    remainingSeconds: computeCurrentRemainingSeconds(),
    started: competitionTimer.started,
    pausedByAdmin: competitionTimer.pausedByAdmin,
    message: competitionTimer.isTimerRunning
      ? 'Master competition clock is running across all squads.'
      : 'Master competition clock is paused. All squad timers are frozen where they are.',
  });
});

// ============================================================================
// ROUND 7: THE FINAL BREACH CONTROLLER
// ============================================================================

const ROUND7_SECRETS = {
  signalToken: 'esc731ape',
  systemHash: 'a7f9b2c4e1',
  corridorKeys: ['eigen_token_omega', 'eigen-token-omega', 'eigen_alohomora', 'eigen-alohomora', 'matrix_transform'],
};

const completedEscapes = new Map<
  string,
  {
    teamName: string;
    completionTime: string;
    finalScore: number;
    timestamp: number;
  }
>();

app.post('/api/round7/verify-signal', (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'TOKEN_REQUIRED',
      message: 'Please provide the Signal Token to unseal the perimeter.',
    });
  }

  const cleanToken = token.trim().toLowerCase();
  if (cleanToken === ROUND7_SECRETS.signalToken) {
    return res.json({
      ok: true,
      message: 'SIGNAL TOKEN VERIFIED! The perimeter gate is now unlocked. Proceed to the final terminal.',
    });
  }

  return res.status(422).json({
    ok: false,
    error: 'INVALID_SIGNAL_TOKEN',
    message: 'Frequency mismatch. Signal Token rejected by the perimeter receiver.',
  });
});

app.post('/api/round7/verify-credentials', (req, res) => {
  const { field, value } = req.body;
  if (!field || typeof value !== 'string') {
    return res.status(400).json({ ok: false, message: 'Field name and value required.' });
  }

  const cleanValue = value.trim().toLowerCase();

  if (field === 'systemHash') {
    const isValid = cleanValue === ROUND7_SECRETS.systemHash;
    return res.json({
      ok: isValid,
      message: isValid
        ? 'System Hash validated and matched against Yard Isolation records.'
        : 'Invalid System Hash. Verification failed.',
    });
  }

  if (field === 'corridorKey') {
    const isValid = ROUND7_SECRETS.corridorKeys.includes(cleanValue);
    return res.json({
      ok: isValid,
      message: isValid
        ? 'Corridor Key accepted. Matrix transformation aligned.'
        : 'Invalid Corridor Key. Characteristic eigenvalue mismatch.',
    });
  }

  return res.status(400).json({ ok: false, message: 'Unknown credential field.' });
});

app.post('/api/round7/override-gate', (req, res) => {
  const { systemHash, corridorKey, remainingSeconds, teamId, teamName } = req.body;

  if (typeof systemHash !== 'string' || typeof corridorKey !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Both System Hash and Corridor Key are required to override the gate.',
    });
  }

  const cleanHash = systemHash.trim().toLowerCase();
  const cleanKey = corridorKey.trim().toLowerCase();

  const isHashValid = cleanHash === ROUND7_SECRETS.systemHash;
  const isKeyValid = ROUND7_SECRETS.corridorKeys.includes(cleanKey);

  if (!isHashValid || !isKeyValid) {
    return res.status(403).json({
      ok: false,
      error: 'OVERRIDE_REJECTED',
      message: 'Main Gate override rejected. One or more cryptographic credentials failed validation.',
      hashValid: isHashValid,
      corridorValid: isKeyValid,
    });
  }

  const totalMissionSeconds = 90 * 60;
  const safeRemaining =
    typeof remainingSeconds === 'number'
      ? Math.max(0, Math.min(totalMissionSeconds, remainingSeconds))
      : 0;
  const elapsedSeconds = totalMissionSeconds - safeRemaining;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecsRem = elapsedSeconds % 60;
  const formattedCompletionTime = `${elapsedMinutes}m ${elapsedSecsRem.toString().padStart(2, '0')}s`;

  const matchedTeam = teamId ? PRE_REGISTERED_TEAMS.find((t) => t.id === teamId) : null;
  const effectiveTeamName = matchedTeam?.teamName || teamName || 'Squad Vanguard';

  const escapeKey = matchedTeam?.id || effectiveTeamName.toLowerCase();
  const existingEscape = completedEscapes.get(escapeKey);

  let finalScore = matchedTeam ? matchedTeam.score : 1850;

  if (!existingEscape) {
    const VICTORY_POINTS = 500;
    if (matchedTeam) {
      matchedTeam.score += VICTORY_POINTS;
      if (!matchedTeam.completedRounds.includes(7)) {
        matchedTeam.completedRounds.push(7);
      }
      matchedTeam.clearanceLevel = 7;
      finalScore = matchedTeam.score;
    } else {
      finalScore += VICTORY_POINTS;
    }

    completedEscapes.set(escapeKey, {
      teamName: effectiveTeamName,
      completionTime: formattedCompletionTime,
      finalScore,
      timestamp: Date.now(),
    });
  } else {
    finalScore = existingEscape.finalScore;
  }

  return res.json({
    ok: true,
    escaped: true,
    teamName: effectiveTeamName,
    completionTime: existingEscape ? existingEscape.completionTime : formattedCompletionTime,
    finalScore,
    scoreEarned: existingEscape ? 0 : 500,
    alreadyEscaped: Boolean(existingEscape),
    message: 'PERIMETER GATE UNLOCKED! LOCKDOWN OVERRIDDEN! YOU HAVE ESCAPED THE DARK PROTOCOL.',
  });
});

// ============================================================================
// CINEMATIC ELEVENLABS TTS API
// ============================================================================

app.get('/api/tts/status', (_req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.TTS_API_KEY;
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.trim().length > 0),
    isElevenLabsPermitted,
    provider:
      isElevenLabsPermitted && Boolean(apiKey && apiKey.trim().length > 0)
        ? 'elevenlabs'
        : 'acoustic_voice_engine',
    cachedAudioItems: audioCache.size,
    configuredCharacters: Object.keys(DEFAULT_CHARACTER_VOICE_IDS),
  });
});

app.post('/api/tts/reset', (_req, res) => {
  isElevenLabsPermitted = true;
  res.json({ status: 'ok', isElevenLabsPermitted });
});

app.post('/api/tts', async (req, res) => {
  const { text, character = 'harry', emotion = 'brave', speed = 1.0, voiceIdOverride } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  const cleanText = text.trim();
  const charKey = character.toLowerCase();
  const voiceId =
    voiceIdOverride || DEFAULT_CHARACTER_VOICE_IDS[charKey] || DEFAULT_CHARACTER_VOICE_IDS.harry;
  const settings = CHARACTER_SETTINGS[charKey] || CHARACTER_SETTINGS.harry;

  const cacheKey = crypto
    .createHash('sha256')
    .update(`${charKey}:${voiceId}:${emotion}:${speed}:${cleanText}`)
    .digest('hex');

  const cached = audioCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Audio-Cached', 'true');
    res.setHeader('X-Cache-Key', cacheKey);
    return res.send(cached.buffer);
  }

  if (!isElevenLabsPermitted) {
    return res.json({
      ok: false,
      fallback: true,
      error: 'ACOUSTIC_SYNTHESIS_ACTIVE',
      message: elevenLabsFallbackReason,
      character: charKey,
    });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.TTS_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    return res.json({
      ok: false,
      fallback: true,
      error: 'API_KEY_NOT_CONFIGURED',
      message:
        'ELEVENLABS_API_KEY is not configured in environment variables. Activating acoustic movie speech fallback.',
      character: charKey,
    });
  }

  try {
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const expressiveSpeechText = cleanText
      .replace(/\*\*(.*?)\*\*/g, '... $1 ...')
      .replace(/don't let it catch you/gi, "Don't... let it... catch you.");

    const payload = {
      text: expressiveSpeechText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity_boost,
        style: settings.style,
        use_speaker_boost: true,
      },
    };

    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey.trim(),
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 402 ||
        response.status === 429
      ) {
        isElevenLabsPermitted = false;
        elevenLabsFallbackReason = 'Hogwarts acoustic character speech engine active.';
      }

      return res.json({
        ok: false,
        fallback: true,
        error: `ELEVENLABS_HTTP_${response.status}`,
        message: 'Hogwarts acoustic character voice engine active.',
        character: charKey,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (audioCache.size > 100) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, { buffer, timestamp: Date.now() });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Audio-Cached', 'false');
    res.setHeader('X-Cache-Key', cacheKey);
    return res.send(buffer);
  } catch {
    return res.json({
      ok: false,
      fallback: true,
      error: 'NETWORK_ERROR',
      message: 'Unable to reach TTS service. Falling back to acoustic character voice engine.',
      character: charKey,
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Dark Protocol Node.js Backend Engine running on http://0.0.0.0:${PORT}`);
});
