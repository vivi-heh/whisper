/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSystem {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicVolume: number = 0.55;
  private sfxVolume: number = 0.75;

  private musicTimer: number | null = null;
  private droneOscs: OscillatorNode[] = [];

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startAtmosphericMusic() {
    if (this.isMusicPlaying || !this.ctx || !this.musicGain) return;
    this.isMusicPlaying = true;
    this.resume();

    // Deep melancholic Rusty Lake / Ori chord drone (A minor / E minor)
    const droneFreqs = [55.0, 82.41, 110.0, 164.81]; // A1, E2, A2, E3
    this.droneOscs = droneFreqs.map((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.4, this.ctx!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280 + i * 40, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.09 / (i + 1), this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.start();
      return osc;
    });

    // Melodic piano / celestial music box drops
    const notes = [220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 659.25]; // A minor pentatonic
    let step = 0;

    const playMelodyNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const curTime = this.ctx.currentTime;

      const pattern = [0, 2, 4, 1, 3, 5, 2, 4, 6, 3, 1, 0];
      const noteIdx = pattern[step % pattern.length];
      const freq = notes[noteIdx] ?? 440;
      step++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, curTime);

      gain.gain.setValueAtTime(0.001, curTime);
      gain.gain.exponentialRampToValueAtTime(0.08, curTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, curTime + 2.2);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(curTime);
      osc.stop(curTime + 2.3);

      const delay = 680 + (step % 3 === 0 ? 550 : 0);
      this.musicTimer = window.setTimeout(playMelodyNote, delay);
    };

    playMelodyNote();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.droneOscs.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.droneOscs = [];
  }

  // --- Sound Effects ---

  public playFootstep() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, curTime);
    osc.frequency.exponentialRampToValueAtTime(30, curTime + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, curTime);

    gain.gain.setValueAtTime(0.04, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.1);
  }

  public playOwlHoot() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Two-tone hollow owl hoot: 420Hz -> 380Hz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, curTime);
    osc.frequency.linearRampToValueAtTime(380, curTime + 0.25);
    osc.frequency.setValueAtTime(410, curTime + 0.35);
    osc.frequency.linearRampToValueAtTime(360, curTime + 0.65);

    gain.gain.setValueAtTime(0.001, curTime);
    gain.gain.linearRampToValueAtTime(0.12, curTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.75);
  }

  public playOwlVoiceUtterance(syllables: number = 4) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Eerie formant vocal pulses for Mr. Owl's voice
    const count = Math.min(Math.max(syllables, 3), 7);
    for (let i = 0; i < count; i++) {
      const startTime = curTime + i * 0.16;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 105 + (i % 3) * 18 - (i % 2) * 12;
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.linearRampToValueAtTime(baseFreq - 10, startTime + 0.14);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(460 + (i % 2) * 140, startTime);
      filter.Q.setValueAtTime(5.5, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.065, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    }
  }

  public playHoverTick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, curTime);
    osc.frequency.exponentialRampToValueAtTime(1200, curTime + 0.03);

    gain.gain.setValueAtTime(0.02, curTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, curTime + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.04);
  }

  public playLeverClick(isDown: boolean = true) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Heavy mechanical clunk + gear ratchet
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isDown ? 180 : 130, curTime);
    osc.frequency.exponentialRampToValueAtTime(isDown ? 45 : 70, curTime + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, curTime);

    gain.gain.setValueAtTime(0.25, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.22);
  }

  public playStoneDoorOpen() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Deep grinding friction sound
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, curTime);
    osc.frequency.linearRampToValueAtTime(60, curTime + 1.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(120, curTime);
    filter.Q.setValueAtTime(4.0, curTime);

    gain.gain.setValueAtTime(0.001, curTime);
    gain.gain.linearRampToValueAtTime(0.2, curTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 1.5);
  }

  public playPageTurn() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, curTime);
    osc.frequency.linearRampToValueAtTime(550, curTime + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, curTime);

    gain.gain.setValueAtTime(0.08, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.12);
  }

  public playItemPickup() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Gentle upward sparkle: E5 -> G#5 -> B5
    [659.25, 830.61, 987.77].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, curTime + idx * 0.06);

      gain.gain.setValueAtTime(0.001, curTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.2, curTime + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, curTime + idx * 0.06 + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(curTime + idx * 0.06);
      osc.stop(curTime + idx * 0.06 + 0.9);
    });
  }

  public playResonanceSeparation() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Triumphant chord burst (D5, F#5, A5, D6)
    [587.33, 739.99, 880.0, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, curTime + idx * 0.07);

      gain.gain.setValueAtTime(0.001, curTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.25, curTime + idx * 0.07 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, curTime + idx * 0.07 + 1.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(curTime + idx * 0.07);
      osc.stop(curTime + idx * 0.07 + 1.9);
    });
  }

  public playScrambleNoise() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    // Dissonant static / glass crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, curTime);
    osc.frequency.linearRampToValueAtTime(95, curTime + 0.35);

    gain.gain.setValueAtTime(0.22, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.42);
  }

  public playButtonClick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, curTime);
    osc.frequency.exponentialRampToValueAtTime(1040, curTime + 0.05);

    gain.gain.setValueAtTime(0.12, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.07);
  }

  public playOscilloscopeTone(freq = 440) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, curTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, curTime + 0.12);

    gain.gain.setValueAtTime(0.08, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.2);
  }

  public playStaticGlitch() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, curTime);
    filter.Q.setValueAtTime(3, curTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, curTime);
    gain.gain.exponentialRampToValueAtTime(0.01, curTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(curTime);
    noise.stop(curTime + 0.13);
  }

  public playHarmonicResonance() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;
    const freqs = [330, 440, 554.37, 659.25]; // A major chord

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, curTime + idx * 0.06);

      gain.gain.setValueAtTime(0.001, curTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.1 / (idx + 1), curTime + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, curTime + idx * 0.06 + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(curTime + idx * 0.06);
      osc.stop(curTime + idx * 0.06 + 1.3);
    });
  }

  public playLensZoom() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, curTime);
    osc.frequency.exponentialRampToValueAtTime(680, curTime + 0.18);

    gain.gain.setValueAtTime(0.09, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.25);
  }

  public playHotspotPulse() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, curTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, curTime + 0.1);

    gain.gain.setValueAtTime(0.07, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.38);
  }

  public playPrismAlign() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, curTime);
    osc.frequency.exponentialRampToValueAtTime(960, curTime + 0.25);

    gain.gain.setValueAtTime(0.001, curTime);
    gain.gain.exponentialRampToValueAtTime(0.12, curTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, curTime + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.65);
  }

  public playTelescopeClick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, curTime);
    osc.frequency.exponentialRampToValueAtTime(300, curTime + 0.04);

    gain.gain.setValueAtTime(0.09, curTime);
    gain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 0.06);
  }

  public playCelestialIgnite() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, curTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, curTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.09 / (idx + 1), curTime + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, curTime + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(curTime + idx * 0.08);
      osc.stop(curTime + idx * 0.08 + 0.95);
    });
  }

  public playCinematicBoom() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, curTime);
    osc.frequency.exponentialRampToValueAtTime(32, curTime + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, curTime);
    filter.frequency.exponentialRampToValueAtTime(50, curTime + 1.5);

    gain.gain.setValueAtTime(0.25, curTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, curTime + 2.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(curTime);
    osc.stop(curTime + 2.5);
  }

  public playFanfare() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const curTime = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, curTime + i * 0.12);

      gain.gain.setValueAtTime(0.001, curTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, curTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, curTime + i * 0.12 + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(curTime + i * 0.12);
      osc.stop(curTime + i * 0.12 + 1.7);
    });
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      const curTime = this.ctx.currentTime;
      if (this.musicGain) {
        this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, curTime);
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, curTime);
      }
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const audioSystem = new AudioSystem();
