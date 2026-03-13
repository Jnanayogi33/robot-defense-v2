import state from './state.js';
import { updateEnemies } from './enemies.js';
import { updateTowers } from './towers.js';
import { updateMines, updateBullets } from './projectiles.js';

export function showMsg(m) { state.msg = m; state.msgTimer = 120; }

export function update() {
  state.gameTime++;

  if (state.spawnQueue.length > 0) {
    state.spawnTimer--;
    if (state.spawnTimer <= 0) {
      state.enemies.push(state.spawnQueue.shift());
      state.spawnTimer = 18;
    }
  }

  updateEnemies();
  updateMines();
  updateTowers();
  updateBullets();

  state.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vx *= 0.94; p.vy *= 0.94; p.vy += (p.gravity || 0); });
  state.particles = state.particles.filter(p => p.life > 0);

  if (state.waveActive && state.spawnQueue.length === 0 && state.enemies.length === 0) {
    state.waveActive = false;
    state.money += 25 + state.waveNum * 5;
    showMsg(`Wave ${state.waveNum} cleared! Bonus: $${25 + state.waveNum * 5}`);
  }

  if (state.lives <= 0) {
    state.lives = 0;
    document.getElementById('ov-title').textContent = 'SYSTEM BREACH';
    document.getElementById('ov-text').textContent = `The robots broke through! Score: ${state.score} | Waves survived: ${state.waveNum - 1}`;
    document.getElementById('overlay').classList.add('show');
  }
  if (state.msgTimer > 0) state.msgTimer--;
}
