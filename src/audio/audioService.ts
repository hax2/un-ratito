class AudioService {
  private soundEnabled: boolean = true;
  private speechRate: number = 0.9;
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Check localStorage initial setting
    try {
      const saved = localStorage.getItem('un_ratito_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.soundEnabled === 'boolean') {
          this.soundEnabled = parsed.soundEnabled;
        }
        if (typeof parsed.speechRate === 'number') {
          this.speechRate = parsed.speechRate;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSpeechRate(rate: number): void {
    this.speechRate = Math.max(0.6, Math.min(1.2, rate));
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0, gainLevel: number = 0.1): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }

  public playSuccessChime(): void {
    if (!this.soundEnabled) return;
    // Pleasant two-note ascending chord (E5 -> A5)
    this.playTone(659.25, 'sine', 0.25, 0, 0.12);
    this.playTone(880.00, 'sine', 0.35, 0.12, 0.15);
  }

  public playErrorSound(): void {
    if (!this.soundEnabled) return;
    // Gentle low soft bounce (C3 -> B2)
    this.playTone(260.00, 'triangle', 0.2, 0, 0.12);
    this.playTone(220.00, 'triangle', 0.3, 0.15, 0.1);
  }

  public playTap(): void {
    if (!this.soundEnabled) return;
    this.playTone(480, 'sine', 0.05, 0, 0.04);
  }

  public playRemove(): void {
    if (!this.soundEnabled) return;
    this.playTone(380, 'sine', 0.05, 0, 0.04);
  }

  public speakSpanish(text: string, onEnd?: () => void): void {
    if (!this.soundEnabled) {
      if (onEnd) onEnd();
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean punctuation for speech clarity
      const clean = text.replace(/[¿¡]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      this.currentUtterance = utterance;

      utterance.lang = 'es-ES';
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;

      // Try selecting a Spain Spanish voice if available
      const voices = window.speechSynthesis.getVoices();
      const spainVoice = voices.find(v => v.lang === 'es-ES') || voices.find(v => v.lang.startsWith('es'));
      if (spainVoice) {
        utterance.voice = spainVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (onEnd) onEnd();
    }
  }

  public isSpeaking(): boolean {
    return this.currentUtterance !== null;
  }

  public stopAll(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentUtterance) {
      this.currentUtterance = null;
    }
  }
}

export const audioService = new AudioService();
