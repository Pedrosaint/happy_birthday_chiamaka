// One sound for the whole app: Happy Birthday on a music box, in C, looping softly from her
// first tap to the last. Every effect is a note of the same music box, in the same key, so
// it all sounds like one piece. Made with the Web Audio API, so there are no files to find
// or license. Browsers only allow sound after a tap, so nothing starts until startAmbient()
// or an effect is called from a click handler.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null; // everything goes through here: a little echo, then master
let muted = false;

const LEVEL = 0.9;
const BEAT = 0.55; // seconds per beat, gentle enough for a lullaby
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Happy Birthday: [note, beats]. Four phrases of six beats.
const TUNE: Array<[number, number]> = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2],
];
// the chord under each three beats of the tune: C, G, G, C, C, F, C, C
const HARMONY = [
  [48, 52, 55], [43, 47, 50], [43, 47, 50], [48, 52, 55],
  [48, 52, 55], [41, 45, 48], [48, 52, 55], [48, 52, 55],
];
const LOOP_GAP = 2; // beats of quiet before the tune starts again
const QUIET = 0.075; // the background volume of a note
const FULL = 0.16; // the volume of a note when she blows out the candles

// tapping buttons plays these notes in turn, so her answers play a little tune of their own
const SCALE = [72, 76, 79, 84, 79, 76];

let ambientOn = false;
let noteIndex = 0;
let beatPos = 0;
let nextNote = 0;
let fullLoops = 0; // how many more times to play the tune at full volume
let taps = 0;

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : LEVEL;
  master.connect(ctx.destination);

  // a soft echo makes the notes sound like a music box in a quiet room
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
function plink(freq: number, at: number, vol = 0.12, length = 1.6) {
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

// a slow, breathing chord under the tune
function pad(notes: number[], at: number, length: number, vol: number) {
  if (!ctx || !bus) return;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(vol, at + 0.9);
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

// keeps the tune going a little ahead of the clock
function scheduleTune() {
  if (!ctx || !ambientOn) return;
  while (nextNote < ctx.currentTime + 0.8) {
    const [note, beats] = TUNE[noteIndex];
    const full = fullLoops > 0;
    if (beatPos % 3 === 0) pad(HARMONY[beatPos / 3], nextNote, 3 * BEAT + 1, full ? 0.06 : 0.035);
    plink(midi(note), nextNote, full ? FULL : QUIET, full ? 1.8 : 1.5);
    if (full) plink(midi(note + 12), nextNote, 0.05, 1.2); // doubled an octave up
    nextNote += beats * BEAT;
    beatPos += beats;
    noteIndex++;
    if (noteIndex === TUNE.length) {
      noteIndex = 0;
      beatPos = 0;
      nextNote += LOOP_GAP * BEAT;
      if (fullLoops > 0) fullLoops--;
    }
  }
}

export function startAmbient() {
  const c = ensure();
  if (!c || ambientOn) return;
  void c.resume();
  ambientOn = true;
  nextNote = c.currentTime + 0.3;
  window.setInterval(scheduleTune, 200);
  scheduleTune();
}

export function setMuted(value: boolean) {
  muted = value;
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : LEVEL, ctx.currentTime, 0.08);
}

// a short burst of filtered noise: the curtain sweeping open, a breath over the candles
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

// a single music-box note, right now
function note(n: number, delay = 0, vol = 0.12, length = 1.2) {
  const c = ensure();
  if (!c) return;
  void c.resume();
  plink(midi(n), c.currentTime + delay, vol, length);
}

export const sfx = {
  // every answer plays the next note of a little rising scale
  tap() {
    note(SCALE[taps++ % SCALE.length], 0, 0.13, 1.1);
  },
  // the button that runs away squeaks a high note
  dodge() {
    note(88, 0, 0.1, 0.8);
  },
  // the lantern: two notes falling as the light goes off, rising as it comes back
  click(turningOn: boolean) {
    const [first, second] = turningOn ? [79, 84] : [84, 79];
    note(first, 0, 0.12, 0.9);
    note(second, 0.12, 0.12, 1.1);
  },
  // the curtain sweeping open, then a sparkle of C major
  curtain() {
    noise(1.6, 250, 2600, 0.14, 'bandpass');
    [72, 76, 79, 84, 88].forEach((n, i) => note(n, 0.9 + i * 0.1, 0.12, 1.8));
  },
  // a breath across the candles, then the same tune the whole app has been humming,
  // this time fuller and an octave brighter
  blow() {
    noise(0.7, 1800, 500, 0.2, 'lowpass');
    const c = ensure();
    if (!c) return;
    if (ambientOn) {
      noteIndex = 0;
      beatPos = 0;
      nextNote = c.currentTime + 1.2;
      fullLoops = 1;
      scheduleTune();
    } else {
      // no background tune running (a real song file is playing instead): play it once
      let at = c.currentTime + 1.2;
      for (const [n, beats] of TUNE) {
        plink(midi(n), at, FULL, 1.8);
        at += beats * BEAT;
      }
    }
  },
};
