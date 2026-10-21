/**
 * Web Audio API and Speech Synthesis helper for the Harry Potter Cyber-Maths module.
 * Provides realistic magical audio chimes, page turns, and movie-authentic character voice synthesis.
 */

export interface CharacterVoiceConfig {
  gender: 'male' | 'female';
  preferredVoiceNames: string[];
  pitch: number;
  rate: number;
  soundCue: 'dumbledore' | 'hermione' | 'snape' | 'mcgonagall' | 'ron' | 'harry';
}

export const MOVIE_VOICE_CONFIGS: Record<string, CharacterVoiceConfig> = {
  harry: {
    gender: 'male',
    preferredVoiceNames: ['daniel', 'ryan', 'oliver', 'george', 'uk english male', 'great britain male', 'en-gb', 'en_gb'],
    pitch: 1.05, // Daniel Radcliffe: youthful, determined, British tenor
    rate: 1.05,
    soundCue: 'harry',
  },
  dumbledore: {
    gender: 'male',
    preferredVoiceNames: ['george', 'david', 'uk english male', 'james', 'great britain male', 'daniel', 'en-gb'],
    pitch: 0.70, // Michael Gambon / Richard Harris: deep, ancient, gentle, resonant
    rate: 0.80, // slow, dignified, thoughtful pauses
    soundCue: 'dumbledore',
  },
  hermione: {
    gender: 'female',
    preferredVoiceNames: ['hazel', 'libby', 'sonia', 'victoria', 'serena', 'stephanie', 'uk english female', 'great britain female', 'en-gb', 'en_gb'],
    pitch: 1.25, // Emma Watson: articulate, crisp, brisk British female
    rate: 1.08, // fast intellectual tempo
    soundCue: 'hermione',
  },
  snape: {
    gender: 'male',
    preferredVoiceNames: ['george', 'david', 'uk english male', 'great britain male', 'en-gb'],
    pitch: 0.58, // Alan Rickman: very deep baritone drawl, icy, menacing
    rate: 0.72, // exceptionally slow, deliberate syllables
    soundCue: 'snape',
  },
  mcgonagall: {
    gender: 'female',
    preferredVoiceNames: ['fiona', 'moira', 'hazel', 'victoria', 'uk english female', 'great britain female', 'en-gb'],
    pitch: 0.94, // Maggie Smith: stern, commanding, Scottish/Northern British matriarch
    rate: 0.90, // precise, strict schoolmistress cadence
    soundCue: 'mcgonagall',
  },
  ron: {
    gender: 'male',
    preferredVoiceNames: ['oliver', 'ryan', 'daniel', 'uk english male', 'great britain male', 'en-gb'],
    pitch: 1.12, // Rupert Grint: expressive, boyish, earnest British banter
    rate: 1.04, // slightly hurried and animated
    soundCue: 'ron',
  },
};

export interface SpokenStoryChunk {
  raw: string;
  cleanText: string;
  isBold: boolean;
}

export function parseStoryChunks(inputText: string): SpokenStoryChunk[] {
  const chunks: SpokenStoryChunk[] = [];

  // Split on paragraph boundaries
  const paragraphs = inputText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    // Case 1: Entire paragraph is marked bold (e.g. "**Don't let it catch you.**")
    const isFullBold =
      (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
      (trimmed.startsWith('<b>') && trimmed.endsWith('</b>')) ||
      (trimmed.startsWith('<strong>') && trimmed.endsWith('</strong>'));

    if (isFullBold) {
      const clean = trimmed.replace(/\*\*|<b>|<\/b>|<strong>|<\/strong>/gi, '').trim();
      if (clean) {
        chunks.push({
          raw: trimmed,
          cleanText: clean,
          isBold: true,
        });
      }
      continue;
    }

    // Case 2: Paragraph contains bold segments mixed with normal sentences
    if (/\*\*([^*]+)\*\*|<b>(.*?)<\/b>|<strong>(.*?)<\/strong>/i.test(para)) {
      const tokens = para.split(/(\*\*[^*]+\*\*|<b>.*?<\/b>|<strong>.*?<\/strong>)/gi);
      for (const token of tokens) {
        const t = token.trim();
        if (!t) continue;
        const isBold = /\*\*[^*]+\*\*|<b>.*?<\/b>|<strong>.*?<\/strong>/i.test(t);
        const clean = t.replace(/\*\*|<b>|<\/b>|<strong>|<\/strong>/gi, '').trim();
        if (!clean) continue;

        if (isBold) {
          chunks.push({
            raw: t,
            cleanText: clean,
            isBold: true,
          });
        } else {
          const subSentences = clean
            .split(/(?<=[.!?…])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          for (const sub of subSentences) {
            chunks.push({
              raw: sub,
              cleanText: sub,
              isBold: false,
            });
          }
        }
      }
      continue;
    }

    // Case 3: Standard paragraph without bold markers: split by sentence
    const sentences = para
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sent of sentences) {
      chunks.push({
        raw: sent,
        cleanText: sent.replace(/[*_"]/g, '').trim(),
        isBold: false,
      });
    }
  }

  return chunks.filter((c) => c.cleanText.length > 0);
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateVoiceList();
      window.speechSynthesis.onvoiceschanged = () => {
        this.populateVoiceList();
      };
    }
  }

  private populateVoiceList() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeaking();
      this.stopRealAudio();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play real character voice audio file (.mp3 / .wav / URL)
  public playRealAudio(audioUrl: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    this.stopSpeaking();
    this.stopRealAudio();

    try {
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.play().catch(() => {
        if (onEnd) onEnd();
      });
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stopRealAudio() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // audio element pause safe
      }
      this.currentAudioElement = null;
    }
  }

  public isPlayingRealAudio(): boolean {
    return this.currentAudioElement !== null && !this.currentAudioElement.paused;
  }

  // Soft sparkle wand chime on cursor move or trigger
  public playSparkle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqs = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
      const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(randomFreq * 1.25, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext policy catch
    }
  }

  // Wax seal breaking sound effect
  public playSealCrack() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // AudioContext policy catch
    }
  }

  // Book opening & page turn whoosh
  public playPageTurn() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.18);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // AudioContext policy catch
    }
  }

  // Cinematic magical grimoire unsealing and opening sound
  public playGrimoireOpen() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // 1. Unsealing resonance (heavy lock release)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(36, ctx.currentTime + 0.6);
      subGain.gain.setValueAtTime(0.22, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 0.6);

      // 2. Crisp heavy parchment whoosh
      const bufferSize = Math.floor(ctx.sampleRate * 0.55);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.28);
      filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.55);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      // 3. Ascending magical star cascade
      const starNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      starNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const startTime = ctx.currentTime + 0.08 + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + 0.3);
        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // AudioContext policy catch
    }
  }

  // Success chime for unlocked cipher
  public playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    } catch {
      // AudioContext policy catch
    }
  }

  // Low error / access denied buzzer
  public playError() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext policy catch
    }
  }

  // Wand power-up spellcast whoosh and magical impact
  public playWandSpellCast() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // 1. Wand whoosh swipe
      const bufferSize = Math.floor(ctx.sampleRate * 0.28);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.28);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      // 2. High-energy spell spark chime
      const sparkFreqs = [1318.51, 1567.98, 2093.0, 2637.02];
      sparkFreqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + 0.06 + i * 0.04);
        osc.frequency.exponentialRampToValueAtTime(f * 1.2, ctx.currentTime + 0.25);
        g.gain.setValueAtTime(0.08, ctx.currentTime + 0.06 + i * 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + 0.06 + i * 0.04);
        osc.stop(ctx.currentTime + 0.25);
      });
    } catch {
      // AudioContext policy catch
    }
  }

  // Soft coin / point tally tick
  public playScoreTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext policy catch
    }
  }

  // Triumphant Phoenix Ascension Fanfare
  public playPhoenixAscension() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Resonant harmonic chord: F4, A4, C5, F5, A5
      const chord = [349.23, 440.0, 523.25, 698.46, 880.0];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const st = ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, st);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, st + 0.8);
        gain.gain.setValueAtTime(0.12, st);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(st);
        osc.stop(st + 0.9);
      });
    } catch {
      // AudioContext policy catch
    }
  }

  // Timekeeper chime (Time-turner gear clock chime)
  public playTimekeeperBell() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, ctx.currentTime); // A6 overtone

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext policy catch
    }
  }

  // Score Cascade gold coins clinking and raining down (D3.js cascade effect)
  public playGoldCoinsCascade(count = 12) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const coinTones = [2093, 2349, 2637, 3136, 3520, 3951, 4186, 4698];
      const maxCoins = Math.min(count, 16);
      for (let i = 0; i < maxCoins; i++) {
        const delay = i * 0.08 + Math.random() * 0.04;
        const tone = coinTones[Math.floor(Math.random() * coinTones.length)];
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(tone, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(tone * 1.05, ctx.currentTime + delay + 0.06);

        oscGain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.12);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.13);
      }
    } catch {
      // AudioContext policy catch
    }
  }

  // Character-specific movie intro sound cue (ambient acoustic aura before dialogue)
  public playCharacterCue(characterId: string) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const normId = characterId.toLowerCase();

      if (normId.includes('snape')) {
        // Severus Snape: Ominous low bass cello drone with dark resonant filter
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 low drone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (normId.includes('dumbledore')) {
        // Albus Dumbledore: Resonant golden temple bell chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        gain.gain.setValueAtTime(0.16, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.4);
      } else if (normId.includes('hermione')) {
        // Hermione Granger: High crystalline intellect arpeggio
        const notes = [659.25, 880, 1174.66]; // E5, A5, D6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.06);
          osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
        });
      } else if (normId.includes('mcgonagall')) {
        // Minerva McGonagall: Authoritative Hogwarts clock tower strike
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      } else if (normId.includes('ron')) {
        // Ron Weasley: Crackling magic spark
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(740, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        // Harry Potter: Dramatic cinematic stinger
        this.playListenCarefullyStinger();
      }
    } catch {
      // AudioContext policy catch
    }
  }

  // Cinematic Chamber Atmosphere Drone while dialogue is active
  private voiceAtmosphereNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } | null = null;

  public startVoiceAtmosphere() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      this.stopVoiceAtmosphere();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Deep subterranean chamber ambience: dark 48Hz and 72Hz fifth with slight detuning
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(48.99, ctx.currentTime); // G1
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(73.42, ctx.currentTime); // D2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 1.2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      this.voiceAtmosphereNodes = { osc1, osc2, gain, filter };
    } catch {
      // AudioContext policy
    }
  }

  public stopVoiceAtmosphere() {
    if (this.voiceAtmosphereNodes) {
      try {
        const { osc1, osc2, gain } = this.voiceAtmosphereNodes;
        const ctx = this.getContext();
        if (ctx) {
          gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
            } catch {}
          }, 650);
        }
      } catch {}
      this.voiceAtmosphereNodes = null;
    }
  }

  // Dramatic cinematic stinger for "Listen carefully" and high-tension moments
  public playListenCarefullyStinger() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // 1. Cinematic Breath Whisper Whoosh
      const bufferSize = Math.floor(ctx.sampleRate * 0.9);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.85);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      // 2. Low resonant sub-bass stinger (82.4Hz -> 41.2Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(82.4, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(41.2, ctx.currentTime + 1.2);
      oscGain.gain.setValueAtTime(0.22, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.4);

      // 3. Eerie high crystal overtone
      const crystal = ctx.createOscillator();
      const crystalGain = ctx.createGain();
      crystal.type = 'triangle';
      crystal.frequency.setValueAtTime(880, ctx.currentTime);
      crystalGain.gain.setValueAtTime(0.07, ctx.currentTime);
      crystalGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
      crystal.connect(crystalGain);
      crystalGain.connect(ctx.destination);
      crystal.start();
      crystal.stop(ctx.currentTime + 1.0);
    } catch {
      // AudioContext policy
    }
  }

  // Spine-chilling emotional tension stinger for bold warning texts (e.g. "**Don't let it catch you.**")
  public playEmotionalBoldStinger() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // 1. Chilling ghostly whisper whoosh (lower, darker bandpass sweep)
      const bufferSize = Math.floor(ctx.sampleRate * 1.1);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(950, ctx.currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 1.0);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 1.0);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      // 2. Heavy Sub-bass pulse drop (73.4Hz down to 28Hz - resonant chest rumble)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(73.41, ctx.currentTime); // D2
      subOsc.frequency.exponentialRampToValueAtTime(28.0, ctx.currentTime + 1.5);
      subGain.gain.setValueAtTime(0.32, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 1.5);

      // 3. Eerie tremolo minor dissonance (sinister presence of the creature)
      const dissonantOsc = ctx.createOscillator();
      const dissonantGain = ctx.createGain();
      dissonantOsc.type = 'sawtooth';
      dissonantOsc.frequency.setValueAtTime(311.13, ctx.currentTime); // Eb4 (dark tritone/minor)
      const distFilter = ctx.createBiquadFilter();
      distFilter.type = 'lowpass';
      distFilter.frequency.setValueAtTime(450, ctx.currentTime);
      distFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.9);

      dissonantGain.gain.setValueAtTime(0.09, ctx.currentTime);
      dissonantGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

      dissonantOsc.connect(distFilter);
      distFilter.connect(dissonantGain);
      dissonantGain.connect(ctx.destination);
      dissonantOsc.start();
      dissonantOsc.stop(ctx.currentTime + 0.9);
    } catch {
      // AudioContext policy
    }
  }

  // Ominous lock resonance effect
  public playOminousLockStinger() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {}
  }

  // Clockwork ticking stinger for 90-minute countdown
  public playClockworkTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [0, 0.14].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx === 0 ? 1200 : 900, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.05);
      });
    } catch {}
  }

  // Chamber unlock chord
  public playChamberUnlockTone() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const chord = [293.66, 369.99, 440.0, 587.33]; // D4, F#4, A4, D5
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const st = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, st);
        gain.gain.setValueAtTime(0.12, st);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(st);
        osc.stop(st + 0.8);
      });
    } catch {}
  }

  // Find the most authentic movie voice for a specific character
  private findBestMovieVoice(characterId: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    const voices = this.cachedVoices;
    if (voices.length === 0) return null;

    const normId = characterId.toLowerCase();
    const config = MOVIE_VOICE_CONFIGS[normId] || MOVIE_VOICE_CONFIGS.harry;

    // 1. Try to find a voice matching the character's preferred voice names (e.g. Daniel, Hazel, George, Oliver, Fiona)
    for (const nameKeyword of config.preferredVoiceNames) {
      const match = voices.find((v) => {
        const vName = v.name.toLowerCase();
        const vLang = v.lang.toLowerCase();
        return (
          vName.includes(nameKeyword) &&
          (vLang.includes('en-gb') || vLang.includes('en-ie') || vLang.includes('en-us') || vLang.startsWith('en'))
        );
      });
      if (match) return match;
    }

    // 2. Try to find an English voice matching character gender
    const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const isFemale = config.gender === 'female';

    // Prioritize British English (en-GB) voices
    const britishVoices = englishVoices.filter((v) => v.lang.toLowerCase().includes('gb') || v.lang.toLowerCase().includes('uk'));
    const pool = britishVoices.length > 0 ? britishVoices : englishVoices;

    const genderMatch = pool.find((v) => {
      const vName = v.name.toLowerCase();
      if (isFemale) {
        return (
          vName.includes('female') ||
          vName.includes('woman') ||
          vName.includes('girl') ||
          vName.includes('hazel') ||
          vName.includes('victoria') ||
          vName.includes('sonia') ||
          vName.includes('libby') ||
          vName.includes('samantha') ||
          vName.includes('zira') ||
          vName.includes('fiona') ||
          vName.includes('moira')
        );
      } else {
        return (
          vName.includes('male') ||
          vName.includes('man') ||
          vName.includes('guy') ||
          vName.includes('george') ||
          vName.includes('daniel') ||
          vName.includes('oliver') ||
          vName.includes('ryan') ||
          vName.includes('david') ||
          vName.includes('mark')
        );
      }
    });

    if (genderMatch) return genderMatch;

    // 3. Fallback to any British English voice or any English voice
    return pool[0] || englishVoices[0] || voices[0] || null;
  }

  /**
   * Speak as a specific Harry Potter character using movie-accurate voice characteristics
   * with dramatic emotional prosody and visceral stingers for bold texts
   */
  private speechKeepAliveInterval: number | null = null;

  public speakCharacter(characterId: string, text: string, onEnd?: () => void, rateOverride?: number) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.stopSpeaking();

      // Start continuous atmospheric chamber room-tone drone
      this.startVoiceAtmosphere();

      // Play movie character acoustic aura
      this.playCharacterCue(characterId);

      const normId = characterId.toLowerCase();
      const config = MOVIE_VOICE_CONFIGS[normId] || MOVIE_VOICE_CONFIGS.harry;

      // Parse structured chunks, preserving bold markdown emphasis
      const spokenChunks = parseStoryChunks(text);

      if (spokenChunks.length === 0) {
        this.stopVoiceAtmosphere();
        if (onEnd) onEnd();
        return;
      }

      const bestVoice = this.findBestMovieVoice(characterId);

      // Keep synthesis alive against Chrome 15-second pause bug
      if (this.speechKeepAliveInterval) {
        window.clearInterval(this.speechKeepAliveInterval);
      }
      this.speechKeepAliveInterval = window.setInterval(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          if (this.speechKeepAliveInterval) {
            window.clearInterval(this.speechKeepAliveInterval);
            this.speechKeepAliveInterval = null;
          }
        }
      }, 4500);

      let currentIdx = 0;
      const speakNextChunk = () => {
        if (currentIdx >= spokenChunks.length) {
          if (this.speechKeepAliveInterval) {
            window.clearInterval(this.speechKeepAliveInterval);
            this.speechKeepAliveInterval = null;
          }
          this.stopVoiceAtmosphere();
          if (onEnd) onEnd();
          return;
        }

        const chunk = spokenChunks[currentIdx];
        currentIdx++;

        let chunkText = chunk.cleanText;
        let chunkPitch = config.pitch; // Harry default: 1.05
        let chunkRate = rateOverride || config.rate; // Harry default: 1.05
        let postDelay = 140;

        const lower = chunkText.toLowerCase();
        const isCatchYou = lower.includes('catch you');
        const isBold = chunk.isBold || isCatchYou;

        // BOLD TEXT / HIGH-STAKES WARNING: EMOTE WITH DRAMATIC WHISPER, PACING & STINGERS
        if (isBold) {
          // Play spine-chilling dark stinger
          this.playEmotionalBoldStinger();

          if (isCatchYou) {
            // Emphasize "**Don't let it catch you.**" with hushed, terrifying gravity
            chunkText = "Don't... let it... catch you.";
            chunkPitch = 0.93; // Deep whisper of dread
            chunkRate = 0.76;  // Slow, measured, deliberate cadence
            postDelay = 680;   // Extended dramatic silence
          } else if (lower.includes('now') && (lower.includes('begins') || lower.includes('moving') || lower.includes('escape'))) {
            this.playChamberUnlockTone();
            chunkText = chunkText.replace(/now/i, '... NOW!');
            chunkPitch = 1.16; // Urgent, rallying command
            chunkRate = 0.98;
            postDelay = 420;
          } else {
            // General bold text: inject emotional pauses between words
            const words = chunkText.split(/\s+/);
            if (words.length <= 5) {
              chunkText = words.join('... ') + '.';
            }
            chunkPitch = 0.95;
            chunkRate = Math.min(chunkRate * 0.80, 0.82);
            postDelay = 580;
          }
        } else if (lower.includes('listen carefully')) {
          this.playListenCarefullyStinger();
          chunkText = chunkText.replace(/listen carefully/i, 'Listen... carefully.');
          chunkPitch = 0.95;
          chunkRate = 0.78;
          postDelay = 520;
        } else if (lower.includes('until tonight')) {
          this.playOminousLockStinger();
          chunkText = chunkText.replace(/until tonight/i, 'Until... tonight.');
          chunkPitch = 0.98;
          chunkRate = 0.84;
          postDelay = 460;
        } else if (lower.includes('there is only one way out')) {
          this.playOminousLockStinger();
          chunkText = chunkText.replace(/there is only one way out/i, 'There is... only one way out.');
          chunkPitch = 0.97;
          chunkRate = 0.82;
          postDelay = 480;
        } else if (lower.includes('ninety minutes')) {
          this.playClockworkTick();
          chunkRate = 0.88;
          postDelay = 380;
        } else if (lower.includes('now') && (lower.includes('begins') || lower.includes('moving'))) {
          this.playChamberUnlockTone();
          chunkRate = 0.96;
          postDelay = 260;
        }

        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.pitch = chunkPitch;
        utterance.rate = chunkRate;
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        utterance.onend = () => {
          if (postDelay > 0) {
            setTimeout(() => {
              speakNextChunk();
            }, postDelay);
          } else {
            speakNextChunk();
          }
        };

        utterance.onerror = (e) => {
          if (e.error === 'canceled' || e.error === 'interrupted') {
            if (this.speechKeepAliveInterval) {
              window.clearInterval(this.speechKeepAliveInterval);
              this.speechKeepAliveInterval = null;
            }
            this.stopVoiceAtmosphere();
            return;
          }
          speakNextChunk();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    } catch {
      this.stopVoiceAtmosphere();
      if (onEnd) onEnd();
    }
  }

  // Speak text with custom pitch and rate (delegates to character-aware synthesis)
  public speak(text: string, pitch = 1.0, rate = 1.0, onEnd?: () => void) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.stopSpeaking();
      const cleanText = text.replace(/["*]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = pitch;
      utterance.rate = rate;

      const bestVoice = this.findBestMovieVoice('harry');
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    this.stopRealAudio();
    this.stopVoiceAtmosphere();
    if (this.speechKeepAliveInterval) {
      window.clearInterval(this.speechKeepAliveInterval);
      this.speechKeepAliveInterval = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sound = new SoundEngine();
