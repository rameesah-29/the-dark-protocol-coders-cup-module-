import { CharacterId, getCharacterVoiceConfig, CharacterVoiceConfig } from '../config/characterVoices';
import { sound } from './audio';

export interface NarrationOptions {
  emotion?: string;
  speed?: number;
  voiceIdOverride?: string;
  onStart?: () => void;
  onProgress?: (progress: number, currentTime: number, duration: number) => void;
  onAudioLevel?: (level: number) => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
  onFallback?: (msg: string) => void;
}

export interface StoryScene {
  id: string;
  character: CharacterId;
  sceneTitle: string;
  dialogue: string;
  emotion?: string;
  backgroundGlow?: string;
  subtitlesDelay?: number;
}

// Client-side in-memory Audio Cache to prevent redundant requests
// Key: character:voiceId:emotion:speed:text -> blob URL
const clientAudioCache = new Map<string, string>();

class NarrationEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentText: string = '';
  private currentCharacter: CharacterId = 'harry';
  private currentOptions: NarrationOptions = {};
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private isLoading: boolean = false;
  private volume: number = 1.0;
  private isMuted: boolean = false;
  private animFrameId: number | null = null;
  private speechSynthUtterance: SpeechSynthesisUtterance | null = null;
  private simulatedLevelInterval: number | null = null;

  constructor() {
    // Sync with global sound mute state
    this.isMuted = sound.getMuted();
  }

  public getCharacterVoice(character: CharacterId): CharacterVoiceConfig {
    return getCharacterVoiceConfig(character);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.currentAudio) {
      this.currentAudio.muted = muted;
    }
    if (muted) {
      this.stopCharacterDialogue();
    }
  }

  /**
   * Generates or fetches cached speech audio from backend /api/tts
   */
  public async generateSpeech(
    text: string,
    character: CharacterId,
    options: NarrationOptions = {}
  ): Promise<string | null> {
    const config = getCharacterVoiceConfig(character);
    const emotion = options.emotion || config.speakingStyle.defaultEmotion;
    const speed = options.speed || config.speakingStyle.speed;
    const voiceId = options.voiceIdOverride || config.voiceId;

    const cacheKey = `${character}:${voiceId}:${emotion}:${speed}:${text.trim()}`;

    // 1. Check client-side blob cache
    if (clientAudioCache.has(cacheKey)) {
      return clientAudioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          character,
          emotion,
          speed,
          voiceIdOverride: options.voiceIdOverride,
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      // If returned binary audio/mpeg MP3 stream
      if (contentType.includes('audio/')) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        clientAudioCache.set(cacheKey, blobUrl);
        return blobUrl;
      }

      // If returned JSON fallback/status object
      const json = await response.json();
      if (json.fallback) {
        if (options.onFallback) {
          options.onFallback(json.message || 'Activating acoustic character synthesis');
        }
        return null; // Signals to use acoustic movie synthesis
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Primary modular function: Plays character dialogue with synchronized animation
   */
  public async playCharacterDialogue(
    character: CharacterId,
    text: string,
    options: NarrationOptions = {}
  ): Promise<void> {
    this.stopCharacterDialogue();

    this.currentCharacter = character;
    this.currentText = text;
    this.currentOptions = options;
    this.isLoading = true;

    // Check for cached audio or fetch from /api/tts
    const audioUrl = await this.generateSpeech(text, character, options);
    this.isLoading = false;

    if (audioUrl && !this.isMuted) {
      // PLAY STREAMED/CACHED REAL MP3 AUDIO
      this.playAudioBlob(audioUrl, options);
    } else {
      // HIGH-FIDELITY ACOUSTIC MOVIE CADENCE FALLBACK
      this.playAcousticMovieFallback(character, text, options);
    }
  }

  /**
   * Internal player for generated audio file
   */
  private playAudioBlob(url: string, options: NarrationOptions) {
    try {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.volume = this.volume;
      audio.muted = this.isMuted;

      audio.onplay = () => {
        this.isPlaying = true;
        this.isPaused = false;
        if (options.onStart) options.onStart();
        this.startAudioLevelSimulation(options.onAudioLevel);
      };

      audio.ontimeupdate = () => {
        if (options.onProgress && audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          options.onProgress(progress, audio.currentTime, audio.duration);
        }
      };

      audio.onended = () => {
        this.cleanupPlayback();
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = () => {
        this.cleanupPlayback();
        // Graceful switch to acoustic speech synthesis
        this.playAcousticMovieFallback(this.currentCharacter, this.currentText, options);
      };

      audio.play().catch(() => {
        this.cleanupPlayback();
        this.playAcousticMovieFallback(this.currentCharacter, this.currentText, options);
      });
    } catch {
      this.cleanupPlayback();
      this.playAcousticMovieFallback(this.currentCharacter, this.currentText, options);
    }
  }

  /**
   * High-fidelity acoustic synthesis matching character's exact movie cadence & pitch
   */
  private playAcousticMovieFallback(
    character: CharacterId,
    text: string,
    options: NarrationOptions
  ) {
    if (this.isMuted || typeof window === 'undefined') {
      if (options.onEnd) options.onEnd();
      return;
    }

    const config = getCharacterVoiceConfig(character);
    const effectiveSpeed = options.speed || config.speakingStyle.speed;

    // Play subtle acoustic character cue chime from sound engine
    sound.speakCharacter(
      character,
      text,
      () => {
        this.cleanupPlayback();
        if (options.onEnd) options.onEnd();
      },
      effectiveSpeed
    );

    this.isPlaying = true;
    this.isPaused = false;
    if (options.onStart) options.onStart();
    this.startAudioLevelSimulation(options.onAudioLevel);

    // Track estimated duration based on text length and character tempo
    const words = text.split(/\s+/).length;
    const estSeconds = Math.max(2.5, (words / 2.6) * (1 / effectiveSpeed));
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(progressInterval);
        return;
      }
      elapsed += 0.2;
      const progress = Math.min(100, (elapsed / estSeconds) * 100);
      if (options.onProgress) {
        options.onProgress(progress, elapsed, estSeconds);
      }
      if (elapsed >= estSeconds) {
        clearInterval(progressInterval);
      }
    }, 200);
  }

  /**
   * Starts audio level animation loop for lips/particles/speaking aura
   */
  private startAudioLevelSimulation(callback?: (level: number) => void) {
    if (!callback) return;

    if (this.simulatedLevelInterval) {
      clearInterval(this.simulatedLevelInterval);
    }

    // Generates natural speech cadence modulation (0.2 to 0.95 with pauses)
    let t = 0;
    this.simulatedLevelInterval = window.setInterval(() => {
      if (!this.isPlaying || this.isPaused) {
        callback(0);
        return;
      }
      t += 0.15;
      // Speech modulation envelope with occasional syllables
      const base = Math.sin(t * 8) * 0.35 + 0.5;
      const flutter = Math.sin(t * 19) * 0.15;
      const level = Math.max(0.15, Math.min(0.95, base + flutter));
      callback(level);
    }, 60);
  }

  /**
   * Stops currently playing character speech
   */
  public stopCharacterDialogue() {
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // safe
      }
      this.currentAudio = null;
    }

    sound.stopSpeaking();

    if (this.simulatedLevelInterval) {
      clearInterval(this.simulatedLevelInterval);
      this.simulatedLevelInterval = null;
    }
  }

  /**
   * Pauses character speech
   */
  public pauseCharacterDialogue() {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.isPlaying = false;
    }
  }

  /**
   * Resumes character speech
   */
  public resumeCharacterDialogue() {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
      this.isPlaying = true;
    }
  }

  /**
   * Replays the last active dialogue
   */
  public replayCharacterDialogue() {
    if (this.currentText && this.currentCharacter) {
      this.playCharacterDialogue(this.currentCharacter, this.currentText, this.currentOptions);
    }
  }

  private cleanupPlayback() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.simulatedLevelInterval) {
      clearInterval(this.simulatedLevelInterval);
      this.simulatedLevelInterval = null;
    }
  }
}

export const narration = new NarrationEngine();

// Convenience top-level modular helpers as requested in Section 12
export const speakAsCharacter = (
  character: CharacterId,
  text: string,
  options?: NarrationOptions
) => narration.playCharacterDialogue(character, text, options);

export const stopCharacterDialogue = () => narration.stopCharacterDialogue();
export const replayCharacterDialogue = () => narration.replayCharacterDialogue();
export const pauseCharacterDialogue = () => narration.pauseCharacterDialogue();
export const resumeCharacterDialogue = () => narration.resumeCharacterDialogue();
export const getCharacterVoice = (character: CharacterId) => narration.getCharacterVoice(character);
