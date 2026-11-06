/* Sound design from real recordings, mixed live.

   Beds crossfade with the shot on screen. Footsteps are real footfalls, triggered at a
   cadence set by how fast the visitor scrolls: scroll harder and the runner picks up.
   Everything passes through one filter that closes as the lens flares, so each cut
   sounds like moving through the light. Nothing loads until the visitor asks for sound. */
import { MIX } from './reel.js';

const LOOPS = ['bed', 'low', 'rain', 'crowd', 'breath', 'train', 'birds', 'heart'];


export class Sound {
  constructor() { this.on = false; this.stems = {}; this.once = {}; this.nextStep = 0; this.side = 1; this.scene = null; }

  async start() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx ||= new AC({ latencyHint: 'playback' });
    this.ctx.resume();
    this.on = true;
    if (!this.ready) this.ready = this.build();
    await this.ready;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.on ? 0.85 : 0, t, 0.7);
    return true;
  }

  stop() {
    this.on = false;
    if (!this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.35);
    setTimeout(() => { if (!this.on) this.ctx.suspend(); }, 1400);
  }

  async build() {
    const ctx = this.ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
    this.tone = ctx.createBiquadFilter(); this.tone.type = 'lowpass'; this.tone.frequency.value = 18000; this.tone.Q.value = 0.4;
    this.tone.connect(this.master); this.master.connect(comp); comp.connect(ctx.destination);

    /* a large, dark space for the bell and footsteps to sit in */
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.22; d[i] = lp * (1 - i / len) ** 3.2; }
    }
    this.room = ctx.createConvolver(); this.room.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.5;
    this.room.connect(wet); wet.connect(this.tone);

    const manifest = await (await fetch('/audio/stems.json')).json();
    const get = async (n) => ctx.decodeAudioData(await (await fetch(`/audio/${n}.m4a`)).arrayBuffer());
    /* the two beds you hear first come first, the rest follow */
    const order = ['low', 'bed', 'bell', 'steps', 'whoosh', 'breath', 'heart', 'rain', 'train', 'birds', 'crowd'];
    for (const n of order) {
      const buf = await get(n);
      if (LOOPS.includes(n)) {
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf; src.loop = true;
        const [a, b] = manifest[n].loop;
        src.loopStart = a; src.loopEnd = Math.min(b, buf.duration - 0.01);
        g.gain.value = 0;
        src.connect(g); g.connect(this.tone);
        src.start(0, a);
        this.stems[n] = g;
      } else this.once[n] = buf;
      if (n === 'steps') this.stepInfo = manifest.steps;
      if (this.scene) this.mix(this.scene, true);
    }
  }

  mix(scene, force) {
    if (scene === this.scene && !force) return;
    this.scene = scene;
    if (!this.master) return;
    const levels = MIX[scene] || {}, t = this.ctx.currentTime;
    for (const n of LOOPS) if (this.stems[n]) this.stems[n].gain.setTargetAtTime(levels[n] || 0, t, 0.9);
  }

  hit(name, { gain = 1, rate = 1, room = 0.5, when = 0 } = {}) {
    if (!this.on || !this.once[name]) return;
    const ctx = this.ctx, s = ctx.createBufferSource(), g = ctx.createGain(), r = ctx.createGain();
    s.buffer = this.once[name]; s.playbackRate.value = rate; g.gain.value = gain; r.gain.value = room;
    s.connect(g); g.connect(this.tone); s.connect(r); r.connect(this.room);
    s.start(ctx.currentTime + when);
  }

  bell(gain = 1) { this.hit('bell', { gain, rate: 0.86, room: 0.8 }); }

  step(gain) {
    const info = this.stepInfo, buf = this.once.steps;
    if (!info || !buf || !this.on) return;
    const ctx = this.ctx, s = ctx.createBufferSource(), g = ctx.createGain(), pan = ctx.createStereoPanner(), r = ctx.createGain();
    s.buffer = buf; s.playbackRate.value = 0.9 + Math.random() * 0.16;
    g.gain.value = gain * (0.8 + Math.random() * 0.2); r.gain.value = 0.12;
    this.side = -this.side; pan.pan.value = this.side * 0.14;
    s.connect(g); g.connect(pan); pan.connect(this.tone); g.connect(r); r.connect(this.room);
    const i = Math.floor(Math.random() * info.count);
    s.start(0, i * info.gap, info.length);
  }

  /* called every frame */
  update(now, { speed, amp, slow }) {
    if (!this.on || !this.master) return;
    this.tone.frequency.setTargetAtTime(18000 - 16800 * Math.min(1, amp) ** 1.4, this.ctx.currentTime, 0.08);
    const v = Math.min(1.6, speed);
    if (slow) {
      if (now > this.nextStep) { this.step(0.34); this.nextStep = now + 0.62 + Math.random() * 0.05; }
    } else if (v > 0.06 && now > this.nextStep) {
      this.step(0.16 + v * 0.34);
      this.nextStep = now + Math.max(0.27, 0.56 - v * 0.26);
    }
  }

  suspend(hidden) {
    if (!this.ctx) return;
    if (hidden) this.ctx.suspend(); else if (this.on) this.ctx.resume();
  }
}


