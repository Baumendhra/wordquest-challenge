// Web Audio API sound effects - no external files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playCorrectSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  
  // Rising two-tone "correct" chime
  osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
  osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15); // E5
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

export function playWrongSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sawtooth';
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  // Low buzz for wrong
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function playGameCompleteSound() {
  const ctx = getCtx();
  
  // Ascending arpeggio celebration
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const startTime = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    osc.frequency.setValueAtTime(freq, startTime);
    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

export function playKeySound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

export function playInvalidSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'square';
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.setValueAtTime(200, ctx.currentTime + 0.07);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}
