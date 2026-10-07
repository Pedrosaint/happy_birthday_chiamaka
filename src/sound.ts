// Every sound is made here with the Web Audio API, so there are no audio files to find or
// license: a soft music-box lullaby with a warm pad underneath, plus a few small effects.
// Browsers only allow sound after a tap, so nothing starts until startAmbient() or an
// effect is called from a click handler.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null; // everything goes through here: a little echo, then master
let muted = false;
let ambientOn = false;
let nextNote = 0;
let step = 0;

const LEVEL = 0.9;
const BEAT = 0.6; // seconds between music-box notes
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// C, Am, F, G: warm and unresolved, so it can loop forever without getting old
const CHORDS = [
  [60, 64, 67],
  [57, 60, 64],
  [53, 57, 60],
  [55, 59, 62],
];
const PATTERN = [0, 1, 2, 1, 2, 1, 0, 2]; // which chord tone each of the 8 notes plays

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : LEVEL;
  master.connect(ctx.destination);

  // a soft echo makes the plinks sound like a music box in a quiet room
  bus = ctx.createGain();
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.32;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  bus.connect(master);
  bus.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(master);

  // stop the sound when she switches to another tab or app
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
  return ctx;
}

// one music-box note: a bright "plink" that rings out and fades
function plink(freq: number, at: number, vol = 0.1, length = 1.6) {
  if (!ctx || !bus) return;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(vol, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  env.connect(bus);
  for (const [mult, amp] of [[1, 1], [3, 0.18], [5.4, 0.06]]) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const level = ctx.createGain();
    level.gain.value = amp;
    osc.connect(level);
    level.connect(env);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }
}

// a slow, breathing chord under the notes
function pad(notes: number[], at: number, length: number) {
  if (!ctx || !bus) return;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(0.045, at + 1.8);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  filter.connect(env);
  env.connect(bus);
  for (const n of notes) {
    for (const detune of [-7, 7]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = midi(n);
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(at);
      osc.stop(at + length + 0.1);
    }
  }
}

function scheduleAmbient() {
  if (!ctx || !ambientOn) return;
  while (nextNote < ctx.currentTime + 0.8) {
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
    const i = step % 8;
    if (i === 0) pad(chord.map((n) => n - 12), nextNote, 8 * BEAT + 1.5);
    if (Math.random() > 0.12) plink(midi(chord[PATTERN[i]] + 12), nextNote, 0.08 + Math.random() * 0.03);
    nextNote += BEAT;
    step++;
  }
}

export function startAmbient() {
  const c = ensure();
  if (!c || ambientOn) return;
  void c.resume();
  ambientOn = true;
  nextNote = c.currentTime + 0.3;
  step = 0;
  window.setInterval(scheduleAmbient, 200);
  scheduleAmbient();
}

export function setMuted(value: boolean) {
  muted = value;
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : LEVEL, ctx.currentTime, 0.08);
}

// a short burst of filtered noise, for the curtain and for blowing out candles
function noise(length: number, from: number, to: number, vol: number, type: BiquadFilterType) {
  const c = ensure();
  if (!c || !bus) return;
  void c.resume();
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * length), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.Q.value = 0.8;
  const t = c.currentTime;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + length * 0.7);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vol, t + length * 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(filter);
  filter.connect(env);
  env.connect(bus);
  src.start(t);
}

// Happy Birthday on the music box, in C like the lullaby under it. [note, beats]
const BIRTHDAY: Array<[number, number]> = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2],
];

export const sfx = {
  // a little bubble pop for every button
  pop(pitch = 1) {
    const c = ensure();
    if (!c || !bus) return;
    void c.resume();
    const t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(780 * pitch, t + 0.09);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(env);
    env.connect(bus);
    osc.start(t);
    osc.stop(t + 0.16);
  },
  // the soft "tick" of a lantern rope
  click() {
    const c = ensure();
    if (!c || !bus) return;
    void c.resume();
    const t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.06);
    const env = c.createGain();
    env.gain.setValueAtTime(0.2, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(env);
    env.connect(bus);
    osc.start(t);
    osc.stop(t + 0.1);
  },
  // the curtain sweeping open, then a sparkle
  curtain() {
    noise(1.6, 250, 2600, 0.22, 'bandpass');
    const c = ensure();
    if (!c) return;
    [79, 83, 86, 91, 95].forEach((n, i) => plink(midi(n), c.currentTime + 0.9 + i * 0.1, 0.1, 1.8));
  },
  // a breath across the candles, then the song
  blow() {
    noise(0.7, 1800, 500, 0.3, 'lowpass');
    const c = ensure();
    if (!c) return;
    const start = c.currentTime + 1.2;
    let beats = 0;
    for (const [note, length] of BIRTHDAY) {
      plink(midi(note), start + beats * 0.5, 0.15, 1.4);
      beats += length;
    }
  },
};
