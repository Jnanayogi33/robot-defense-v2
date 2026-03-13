import state from './state.js';
import { MINE_DEF } from './config.js';
import { spawnParticles, spawnMineExplosion } from './particles.js';
import { playExplosionSound } from './audio.js';

export function updateMines() {
  state.mines.forEach(m => {
    if (m.detonated) return;
    if (!m.armed) {
      m.armTimer--;
      if (m.armTimer <= 0) m.armed = true;
      return;
    }
    let triggered = false;
    state.enemies.forEach(e => {
      if (Math.hypot(e.x - m.x, e.y - m.y) < 18) triggered = true;
    });
    if (triggered) {
      m.detonated = true;
      m.flashTimer = 12;
      state.enemies.forEach(e => {
        let d = Math.hypot(e.x - m.x, e.y - m.y);
        if (d < MINE_DEF.splashRadius) {
          let falloff = 1 - (d / MINE_DEF.splashRadius) * 0.5;
          e.hp -= Math.floor(MINE_DEF.damage * falloff);
        }
      });
      spawnMineExplosion(m.x, m.y);
      playExplosionSound();
    }
  });
  state.mines = state.mines.filter(m => !m.detonated || m.flashTimer > 0);
  state.mines.forEach(m => { if (m.flashTimer > 0) m.flashTimer--; });
}

export function updateBullets() {
  state.bullets.forEach(b => {
    if (b.target && b.target.hp > 0) {
      b.tx = b.target.x; b.ty = b.target.y;
    }
    b.trail.push({x: b.x, y: b.y, life: 8});
    let dx = b.tx - b.x, dy = b.ty - b.y;
    let d = Math.hypot(dx, dy);

    if (b.homing && d > b.speed * 3) {
      let targetAngle = Math.atan2(dy, dx);
      if (b.angle === undefined) b.angle = targetAngle;
      let diff = targetAngle - b.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      b.angle += diff * 0.12;
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      if (state.gameTime % 2 === 0) {
        state.particles.push({ x: b.x, y: b.y, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
          life: 10 + Math.random()*8, color: '#888', size: 1.5 + Math.random(), gravity: -0.02 });
      }
    } else if (d < b.speed * 2) {
      b.hit = true;
      if (b.target && b.target.hp > 0) {
        b.target.hp -= b.damage;
        if (b.slow) b.target.slowTimer = 60;
      }
      if (b.splash > 0) {
        state.enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < b.splash) {
            e.hp -= Math.floor(b.damage * 0.5);
            if (b.slow) e.slowTimer = Math.max(e.slowTimer, 45);
          }
        });
        spawnParticles(b.tx, b.ty, b.color, 12);
      }
      if (b.pierce) {
        state.enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < 20) {
            e.hp -= Math.floor(b.damage * 0.5);
          }
        });
      }
      spawnParticles(b.tx, b.ty, b.color, 5);
    } else {
      b.x += (dx/d) * b.speed;
      b.y += (dy/d) * b.speed;
    }
  });
  state.bullets.forEach(b => b.trail = b.trail.filter(t => { t.life--; return t.life > 0; }));
  state.bullets = state.bullets.filter(b => !b.hit);
}
