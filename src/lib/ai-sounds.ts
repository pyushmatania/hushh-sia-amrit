// Futuristic AI sound effects using Web Audio API
let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Sci-fi "processing" blip — rising dual-tone */
export function playAIThinkingSound() {
  try {
    const c = ctx(); const now = c.currentTime;
    [440, 660].forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.06 + 0.1);
      const g = c.createGain();
      g.gain.setValueAtTime(0.06, now + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
      osc.connect(g).connect(c.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.15);
    });
  } catch {}
}

/** Triumphant "complete" chime — descending arpeggio */
export function playAISuccessSound() {
  try {
    const c = ctx(); const now = c.currentTime;
    [880, 1100, 1320, 1760].forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      const g = c.createGain();
      g.gain.setValueAtTime(0.08, now + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2);
      osc.connect(g).connect(c.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.2);
    });
  } catch {}
}

/** Action executed — electric zap */
export function playAIActionSound() {
  try {
    const c = ctx(); const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    osc.connect(filter).connect(g).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {}
}

/** Error / warning tone */
export function playAIErrorSound() {
  try {
    const c = ctx(); const now = c.currentTime;
    [300, 250].forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      const g = c.createGain();
      g.gain.setValueAtTime(0.08, now + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.15);
      osc.connect(g).connect(c.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.15);
    });
  } catch {}
}

/** Subtle keystroke blip for typing */
export function playAIKeystroke() {
  try {
    const c = ctx(); const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
    const g = c.createGain();
    g.gain.setValueAtTime(0.02, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(g).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {}
}
