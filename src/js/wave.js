import state from './state.js';
import { TILE, ENEMY_TYPES } from './config.js';
import { PATH } from './path.js';

export function startWave() {
  if (state.waveActive) return;
  state.waveNum++;
  state.waveActive = true;
  state.spawnQueue = [];
  let count = 5 + state.waveNum * 3;
  for (let i = 0; i < count; i++) {
    let typeIdx;
    if (state.waveNum >= 10 && Math.random() < 0.08) typeIdx = 6;
    else if (state.waveNum >= 7 && Math.random() < 0.15) typeIdx = 4;
    else if (state.waveNum >= 4 && Math.random() < 0.2) typeIdx = 3;
    else if (state.waveNum >= 5 && Math.random() < 0.25) typeIdx = 5;
    else if (state.waveNum >= 3 && Math.random() < 0.3) typeIdx = 2;
    else if (state.waveNum >= 2 && Math.random() < 0.4) typeIdx = 1;
    else typeIdx = 0;
    let base = ENEMY_TYPES[typeIdx];
    let hpMult = 1 + (state.waveNum - 1) * 0.25;
    state.spawnQueue.push({
      type: base,
      hp: Math.floor(base.hp * hpMult),
      maxHp: Math.floor(base.hp * hpMult),
      speed: base.speed,
      reward: base.reward,
      pathIdx: 0,
      x: PATH[0][0] * TILE + TILE/2,
      y: PATH[0][1] * TILE + TILE/2,
      slowTimer: 0,
      walkCycle: Math.random() * Math.PI * 2,
      facing: 0
    });
  }
  state.spawnTimer = 0;
}
