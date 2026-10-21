import { ASSETS } from '../data/assets';

export type CharacterId =
  | 'harry'
  | 'hermione'
  | 'ron'
  | 'dumbledore'
  | 'snape'
  | 'hagrid'
  | 'mcgonagall';

export type EmotionType =
  | 'curious'
  | 'brave'
  | 'intelligent'
  | 'confident'
  | 'humorous'
  | 'nervous'
  | 'calm'
  | 'wise'
  | 'mysterious'
  | 'controlled'
  | 'intimidating'
  | 'warm'
  | 'enthusiastic'
  | 'commanding'
  | 'suspense'
  | 'dramatic';

export interface CharacterVoiceConfig {
  id: CharacterId;
  name: string;
  title: string;
  house: 'Gryffindor' | 'Ravenclaw' | 'Slytherin' | 'Hufflepuff' | 'Hogwarts Staff';
  houseColor: string;
  avatar: string;
  // User configurable voice ID (authorized/licensed voice ID from ElevenLabs or custom provider)
  voiceId: string;
  // Fallback voice ID from ElevenLabs library matching regional/tonal character archetype
  libraryVoiceId: string;
  // Speaking style & acoustic delivery attributes
  speakingStyle: {
    traits: string[];
    defaultEmotion: EmotionType;
    speed: number;
    pitch: number; // Web Audio / Speech pitch
    whisperSupported: boolean;
    dramaticIntensity: number; // 0.0 to 1.0
  };
  // ElevenLabs Voice Settings
  elevenLabsSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  language: string;
  signatureQuote: string;
  // Formant acoustic fallback configuration for realistic client-side movie synthesis
  acousticFallback: {
    basePitch: number;
    tempo: number;
    vocalFormants: { f1: number; f2: number; f3: number };
    preferredWebSpeechVoices: string[];
  };
}

/**
 * AUTHORIZED CHARACTER VOICE MAPPING
 * You can supply your authorized/licensed voice IDs here or via server environment variables:
 * ELEVENLABS_VOICE_HARRY, ELEVENLABS_VOICE_HERMIONE, etc.
 */
const getEnvVoice = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch {
    // browser sandbox fallback
  }
  return undefined;
};

export const CHARACTER_VOICES: Record<CharacterId, string> = {
  harry: getEnvVoice('ELEVENLABS_VOICE_HARRY') || 'nPczCjzI2devNBz1zQrb', // Youthful British male archetype
  hermione: getEnvVoice('ELEVENLABS_VOICE_HERMIONE') || 'EXAVITQu4vr4xnSDxMaL', // Articulate, crisp British female
  ron: getEnvVoice('ELEVENLABS_VOICE_RON') || 'GBv7mTt0atIp3Br8iCZE', // Energetic, expressive British youth
  dumbledore: getEnvVoice('ELEVENLABS_VOICE_DUMBLEDORE') || 'N2lVS1w4EtoT3dr4eOWO', // Ancient, deep, calm resonant elder
  snape: getEnvVoice('ELEVENLABS_VOICE_SNAPE') || 'onwK4e9ZLuTAKqWW03F9', // Deep, slow, menacing baritone drawl
  hagrid: getEnvVoice('ELEVENLABS_VOICE_HAGRID') || 'VR6AewLTigWG4xSOukaG', // Deep, warm, booming West Country cadence
  mcgonagall: getEnvVoice('ELEVENLABS_VOICE_MCGONAGALL') || 'pFZP5JQG7iQjIQuC4Bku', // Strict, commanding Northern British matriarch
};

export const CHARACTER_VOICE_CONFIGS: Record<CharacterId, CharacterVoiceConfig> = {
  harry: {
    id: 'harry',
    name: 'Harry Potter',
    title: 'Order of the Phoenix Operative',
    house: 'Gryffindor',
    houseColor: '#dc2626',
    avatar: ASSETS.harryNarrator,
    voiceId: CHARACTER_VOICES.harry,
    libraryVoiceId: 'nPczCjzI2devNBz1zQrb',
    speakingStyle: {
      traits: ['youthful', 'curious', 'brave', 'slightly emotional', 'natural conversational delivery'],
      defaultEmotion: 'brave',
      speed: 1.05,
      pitch: 1.05,
      whisperSupported: true,
      dramaticIntensity: 0.75,
    },
    elevenLabsSettings: {
      stability: 0.55,
      similarity_boost: 0.85,
      style: 0.40,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: 'I solemnly swear that I am up to no good. Keep your wands and ciphers ready.',
    acousticFallback: {
      basePitch: 1.05,
      tempo: 1.05,
      vocalFormants: { f1: 520, f2: 1680, f3: 2500 },
      preferredWebSpeechVoices: ['daniel', 'george', 'oliver', 'ryan', 'uk english male', 'en-gb'],
    },
  },

  hermione: {
    id: 'hermione',
    name: 'Hermione Granger',
    title: 'Chief Arithmancer & Prefect',
    house: 'Gryffindor',
    houseColor: '#b91c1c',
    avatar: ASSETS.hermionePortrait,
    voiceId: CHARACTER_VOICES.hermione,
    libraryVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    speakingStyle: {
      traits: ['intelligent', 'confident', 'articulate', 'expressive', 'fast analytical tempo'],
      defaultEmotion: 'intelligent',
      speed: 1.06,
      pitch: 1.25,
      whisperSupported: false,
      dramaticIntensity: 0.70,
    },
    elevenLabsSettings: {
      stability: 0.65,
      similarity_boost: 0.88,
      style: 0.35,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: "When in doubt, go to the library. Or in this case, check your modular reductions!",
    acousticFallback: {
      basePitch: 1.25,
      tempo: 1.06,
      vocalFormants: { f1: 650, f2: 1950, f3: 2900 },
      preferredWebSpeechVoices: ['hazel', 'libby', 'sonia', 'victoria', 'uk english female', 'en-gb'],
    },
  },

  ron: {
    id: 'ron',
    name: 'Ron Weasley',
    title: 'Gryffindor Keeper & Strategist',
    house: 'Gryffindor',
    houseColor: '#ea580c',
    avatar: ASSETS.ronPortrait,
    voiceId: CHARACTER_VOICES.ron,
    libraryVoiceId: 'GBv7mTt0atIp3Br8iCZE',
    speakingStyle: {
      traits: ['humorous', 'energetic', 'slightly nervous', 'conversational', 'expressive banter'],
      defaultEmotion: 'humorous',
      speed: 1.04,
      pitch: 1.12,
      whisperSupported: true,
      dramaticIntensity: 0.60,
    },
    elevenLabsSettings: {
      stability: 0.48,
      similarity_boost: 0.80,
      style: 0.50,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: "Bloody hell! You're going to give Hermione a run for her money with these ciphers.",
    acousticFallback: {
      basePitch: 1.12,
      tempo: 1.04,
      vocalFormants: { f1: 580, f2: 1600, f3: 2450 },
      preferredWebSpeechVoices: ['oliver', 'ryan', 'daniel', 'uk english male', 'en-gb'],
    },
  },

  dumbledore: {
    id: 'dumbledore',
    name: 'Albus Dumbledore',
    title: 'Headmaster of Hogwarts',
    house: 'Hogwarts Staff',
    houseColor: '#d4af37',
    avatar: ASSETS.dumbledoreTimer,
    voiceId: CHARACTER_VOICES.dumbledore,
    libraryVoiceId: 'N2lVS1w4EtoT3dr4eOWO',
    speakingStyle: {
      traits: ['calm', 'wise', 'mysterious', 'authoritative', 'slow cinematic delivery', 'thoughtful pauses'],
      defaultEmotion: 'wise',
      speed: 0.82,
      pitch: 0.72,
      whisperSupported: true,
      dramaticIntensity: 0.90,
    },
    elevenLabsSettings: {
      stability: 0.75,
      similarity_boost: 0.92,
      style: 0.60,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.",
    acousticFallback: {
      basePitch: 0.72,
      tempo: 0.82,
      vocalFormants: { f1: 420, f2: 1350, f3: 2250 },
      preferredWebSpeechVoices: ['george', 'david', 'james', 'uk english male', 'en-gb'],
    },
  },

  snape: {
    id: 'snape',
    name: 'Severus Snape',
    title: 'Master of Cryptographic Arts',
    house: 'Slytherin',
    houseColor: '#16a34a',
    avatar: ASSETS.snapePortrait,
    voiceId: CHARACTER_VOICES.snape,
    libraryVoiceId: 'onwK4e9ZLuTAKqWW03F9',
    speakingStyle: {
      traits: ['controlled', 'serious', 'intimidating', 'calm but threatening', 'slow deliberate drawl'],
      defaultEmotion: 'intimidating',
      speed: 0.74,
      pitch: 0.60,
      whisperSupported: true,
      dramaticIntensity: 0.85,
    },
    elevenLabsSettings: {
      stability: 0.82,
      similarity_boost: 0.95,
      style: 0.55,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: "I can teach you how to bottle fame, brew glory... and encrypt the deepest dark arts.",
    acousticFallback: {
      basePitch: 0.60,
      tempo: 0.74,
      vocalFormants: { f1: 390, f2: 1250, f3: 2150 },
      preferredWebSpeechVoices: ['george', 'david', 'uk english male', 'en-gb'],
    },
  },

  hagrid: {
    id: 'hagrid',
    name: 'Rubeus Hagrid',
    title: 'Keeper of Keys and Grounds',
    house: 'Gryffindor',
    houseColor: '#ca8a04',
    avatar: ASSETS.hagridPortrait,
    voiceId: CHARACTER_VOICES.hagrid,
    libraryVoiceId: 'VR6AewLTigWG4xSOukaG',
    speakingStyle: {
      traits: ['warm', 'friendly', 'deep', 'enthusiastic', 'hearty booming delivery'],
      defaultEmotion: 'warm',
      speed: 0.92,
      pitch: 0.68,
      whisperSupported: false,
      dramaticIntensity: 0.65,
    },
    elevenLabsSettings: {
      stability: 0.60,
      similarity_boost: 0.85,
      style: 0.45,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: "What's comin' will come, an' we'll meet it when it does. Good luck with them ciphers!",
    acousticFallback: {
      basePitch: 0.68,
      tempo: 0.92,
      vocalFormants: { f1: 450, f2: 1300, f3: 2200 },
      preferredWebSpeechVoices: ['david', 'george', 'uk english male', 'en-gb'],
    },
  },

  mcgonagall: {
    id: 'mcgonagall',
    name: 'Minerva McGonagall',
    title: 'Deputy Headmistress & Head of Gryffindor',
    house: 'Gryffindor',
    houseColor: '#059669',
    avatar: ASSETS.mcgonagallPortrait,
    voiceId: CHARACTER_VOICES.mcgonagall,
    libraryVoiceId: 'pFZP5JQG7iQjIQuC4Bku',
    speakingStyle: {
      traits: ['stern', 'commanding', 'precise cadence', 'strict schoolmistress', 'dignified'],
      defaultEmotion: 'commanding',
      speed: 0.90,
      pitch: 0.95,
      whisperSupported: false,
      dramaticIntensity: 0.80,
    },
    elevenLabsSettings: {
      stability: 0.72,
      similarity_boost: 0.90,
      style: 0.40,
      use_speaker_boost: true,
    },
    language: 'en-GB',
    signatureQuote: "Five points will be awarded to your House for sheer dumb luck... or sheer brilliance.",
    acousticFallback: {
      basePitch: 0.95,
      tempo: 0.90,
      vocalFormants: { f1: 600, f2: 1800, f3: 2700 },
      preferredWebSpeechVoices: ['fiona', 'moira', 'hazel', 'victoria', 'uk english female', 'en-gb'],
    },
  },
};

/**
 * Helper to get a character's complete voice configuration
 */
export function getCharacterVoiceConfig(character: CharacterId | string): CharacterVoiceConfig {
  const normalized = character.toLowerCase() as CharacterId;
  return CHARACTER_VOICE_CONFIGS[normalized] || CHARACTER_VOICE_CONFIGS.harry;
}
