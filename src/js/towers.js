import state from './state.js';
import { spawnParticles } from './particles.js';

export function updateTowers() {
  state.towers.forEach(t => {
    if (t.fireFlash > 0) t.fireFlash--;
    if (t.cooldown > 0) { t.cooldown--; return; }
    let best = null;
    state.enemies.forEach(e => {
      let d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d <= t.def.range && e.pathIdx > (best ? best.pathIdx : -1)) best = e;
    });
    if (!best) return;
    t.angle = Math.atan2(best.y - t.y, best.x - t.x);
    t.cooldown = t.def.rate;
    t.fireFlash = 5;

    if (t.def.chain) {
      let targets = [best];
      let remaining = [...state.enemies].filter(e => e !== best);
      for (let i = 1; i < t.def.chain; i++) {
        let last = targets[targets.length - 1];
        let closest = null, cd = Infinity;
        remaining.forEach(e => {
          let d = Math.hypot(e.x - last.x, e.y - last.y);
          if (d < 100 && d < cd) { closest = e; cd = d; }
        });
        if (closest) { targets.push(closest); remaining = remaining.filter(e => e !== closest); }
      }
      targets.forEach(tgt => {
        tgt.hp -= t.def.damage;
        spawnParticles(tgt.x, tgt.y, t.def.bulletColor, 3);
      });
      t.chainTargets = targets;
      t.chainTimer = 8;
    } else {
      state.bullets.push({
        x: t.x + Math.cos(t.angle) * 16,
        y: t.y + Math.sin(t.angle) * 16,
        tx: best.x, ty: best.y,
        target: best,
        speed: t.def.bulletSpeed,
        damage: t.def.damage,
        color: t.def.bulletColor,
        splash: t.def.splash || 0,
        slow: t.def.slow || 0,
        pierce: t.def.pierce || false,
        homing: t.def.homing || false,
        trail: [],
        towerId: t.def.id
      });
    }
  });

  state.towers.forEach(t => { if (t.chainTimer > 0) t.chainTimer--; });
}
