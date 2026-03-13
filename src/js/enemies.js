import state from './state.js';
import { TILE } from './config.js';
import { PATH } from './path.js';
import { spawnDeathExplosion } from './particles.js';

export function updateEnemies() {
  state.enemies.forEach(e => {
    if (e.slowTimer > 0) e.slowTimer--;
    let spd = e.speed * (e.slowTimer > 0 ? 0.4 : 1);
    e.walkCycle += spd * 0.15;
    let target = PATH[e.pathIdx + 1];
    if (!target) { e.done = true; return; }
    let tx = target[0] * TILE + TILE/2, ty = target[1] * TILE + TILE/2;
    let dx = tx - e.x, dy = ty - e.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0.1) e.facing = Math.atan2(dy, dx);
    if (dist < spd * 2) {
      e.pathIdx++;
      if (e.pathIdx >= PATH.length - 1) e.done = true;
    } else {
      e.x += (dx/dist) * spd;
      e.y += (dy/dist) * spd;
    }
  });

  state.enemies = state.enemies.filter(e => {
    if (e.done) { state.lives--; return false; }
    if (e.hp <= 0) {
      state.score += e.reward; state.money += e.reward;
      spawnDeathExplosion(e.x, e.y, e.type.color, e.type.size);
      return false;
    }
    return true;
  });
}
