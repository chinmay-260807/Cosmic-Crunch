
export class AudioService {
  private static context: AudioContext | null = null;
  private static bgMusicGain: GainNode | null = null;
  private static masterGain: GainNode | null = null;
  private static oscillators: OscillatorNode[] = [];

  private static getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  static setMuted(muted: boolean) {
    const ctx = this.getContext();
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.1);
    }
    
    // Start music if unmuted and not already playing
    if (!muted && this.oscillators.length === 0) {
      this.startBackgroundMusic();
    }
  }

  static startBackgroundMusic() {
    const ctx = this.getContext();
    if (this.oscillators.length > 0) return;

    this.bgMusicGain = ctx.createGain();
    this.bgMusicGain.gain.setValueAtTime(0, ctx.currentTime);
    this.bgMusicGain.connect(this.masterGain!);

    // Create a soft ethereal drone using 3 sine waves
    const freqs = [110, 164.81, 220]; // A2, E3, A3
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), ctx.currentTime);
      
      // LFO for slow volume breathing
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1 + (i * 0.05), ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      
      const vca = ctx.createGain();
      vca.gain.setValueAtTime(0.03, ctx.currentTime);
      
      osc.connect(vca);
      vca.connect(this.bgMusicGain!);
      
      osc.start();
      lfo.start();
      this.oscillators.push(osc, lfo);
    });

    this.bgMusicGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2);
  }

  static playCrack() {
    const ctx = this.getContext();
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    noise.start();
    noise.stop(ctx.currentTime + 0.15);
  }

  static playReveal() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // 1. The Magical Whoosh
    const whooshGain = ctx.createGain();
    const whooshFilter = ctx.createBiquadFilter();
    const whooshBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const whooshData = whooshBuffer.getChannelData(0);
    for (let i = 0; i < whooshBuffer.length; i++) {
      whooshData[i] = Math.random() * 2 - 1;
    }
    const whooshSource = ctx.createBufferSource();
    whooshSource.buffer = whooshBuffer;

    whooshFilter.type = 'lowpass';
    whooshFilter.frequency.setValueAtTime(100, now);
    whooshFilter.frequency.exponentialRampToValueAtTime(3000, now + 0.5);

    whooshGain.gain.setValueAtTime(0, now);
    whooshGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    whooshSource.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(this.masterGain!);
    whooshSource.start(now);

    // 2. The Chime Cluster
    const frequencies = [880, 1108.73, 1318.51, 1760];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.1 + (i * 0.05));
      
      g.gain.setValueAtTime(0, now + 0.1 + (i * 0.05));
      g.gain.linearRampToValueAtTime(0.08, now + 0.2 + (i * 0.05));
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + (i * 0.05));
      
      osc.connect(g);
      g.connect(this.masterGain!);
      
      osc.start(now + 0.1 + (i * 0.05));
      osc.stop(now + 1.0);
    });
  }

  static playTinkle() {
    this.playReveal();
  }
}
