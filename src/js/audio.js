let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let muted = false;
let musicPlaying = false;
let musicNodes = [];

function ensureContext() {
  if (audioCtx) return true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.25;
    musicGain.connect(masterGain);
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.4;
    sfxGain.connect(masterGain);
    return true;
  } catch(e) {
    return false;
  }
}

export function initAudio() {
  if (!ensureContext()) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function toggleMute() {
  muted = !muted;
  if (masterGain) masterGain.gain.value = muted ? 0 : 1;
  return muted;
}

export function isMuted() { return muted; }

// ============ MUSIC ============
const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25,
};

let musicInterval = null;
let beatCount = 0;

export function startMusic() {
  if (!ensureContext() || musicPlaying) return;
  musicPlaying = true;
  beatCount = 0;

  const BPM = 120;
  const beatMs = (60 / BPM) * 1000;

  musicInterval = setInterval(() => {
    if (!audioCtx || muted) return;
    const t = audioCtx.currentTime;
    playBeat(t, beatCount);
    beatCount++;
  }, beatMs / 2); // 8th notes
}

export function stopMusic() {
  musicPlaying = false;
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
  musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  musicNodes = [];
}

function playBeat(t, beat) {
  const bar = Math.floor(beat / 8);
  const pos = beat % 8;

  // Bass line - plays on every other 8th note
  if (pos % 2 === 0) {
    const bassPattern = [
      [NOTES.C3, NOTES.C3, NOTES.G3, NOTES.E3],
      [NOTES.A3, NOTES.A3, NOTES.F3, NOTES.G3],
    ];
    const bassNotes = bassPattern[bar % 2];
    const note = bassNotes[Math.floor(pos / 2)];
    playTone(note, 'sawtooth', 0.15, 0.2, t, musicGain);
  }

  // Hi-hat on every 8th note
  playNoise(0.02, 0.05, t, 8000, musicGain);

  // Kick on beats 0 and 4
  if (pos === 0 || pos === 4) {
    playKick(t, musicGain);
  }

  // Snare on beats 2 and 6
  if (pos === 2 || pos === 6) {
    playNoise(0.08, 0.12, t, 3000, musicGain);
  }

  // Lead arpeggio
  if (pos % 2 === 0) {
    const arpPatterns = [
      [NOTES.C5, NOTES.E4, NOTES.G4, NOTES.C5],
      [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A4],
    ];
    const arpNotes = arpPatterns[bar % 2];
    const note = arpNotes[Math.floor(pos / 2)];
    playTone(note, 'square', 0.06, 0.1, t, musicGain);
  }
}

function playTone(freq, type, volume, duration, startTime, dest) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(dest || sfxGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
  musicNodes.push(osc);
  osc.onended = () => { musicNodes = musicNodes.filter(n => n !== osc); };
}

function playNoise(volume, duration, startTime, filterFreq, dest) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = filterFreq || 5000;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest || sfxGain);
  source.start(startTime);
}

function playKick(startTime, dest) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(150, startTime);
  osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.08);
  gain.gain.setValueAtTime(0.3, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
  osc.connect(gain);
  gain.connect(dest || sfxGain);
  osc.start(startTime);
  osc.stop(startTime + 0.2);
}

// ============ SOUND EFFECTS ============
export function playLaserSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2000, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function playPlasmaSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.25);
}

export function playEmpSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.linearRampToValueAtTime(100, t + 0.15);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.25);
}

export function playRailgunSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Sharp crack
  playNoise(0.3, 0.04, t, 1000, sfxGain);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.2);
}

export function playTeslaSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500 + Math.random() * 1000, t + i * 0.03);
    osc.frequency.exponentialRampToValueAtTime(300, t + i * 0.03 + 0.06);
    gain.gain.setValueAtTime(0.06, t + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.08);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t + i * 0.03);
    osc.stop(t + i * 0.03 + 0.1);
  }
}

export function playCryoSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playNoise(0.1, 0.15, t, 6000, sfxGain);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(3000, t);
  osc.frequency.exponentialRampToValueAtTime(1500, t + 0.1);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.2);
}

export function playMissileSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.linearRampToValueAtTime(300, t + 0.15);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.35);
  // Whoosh
  playNoise(0.08, 0.2, t, 2000, sfxGain);
}

export function playExplosionSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playNoise(0.25, 0.3, t, 500, sfxGain);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.5);
}

export function playEnemyDeathSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.2);
  playNoise(0.08, 0.08, t, 3000, sfxGain);
}

export function playWaveStartSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Alarm-like two-tone
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t + i * 0.15);
    osc.frequency.setValueAtTime(600, t + i * 0.15 + 0.07);
    gain.gain.setValueAtTime(0.08, t + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.14);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t + i * 0.15);
    osc.stop(t + i * 0.15 + 0.15);
  }
}

export function setMusicIntensity(waveActive) {
  if (!musicGain) return;
  musicGain.gain.value = waveActive ? 0.35 : 0.25;
}
