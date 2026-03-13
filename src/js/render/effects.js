import state from '../state.js';
import { MINE_DEF } from '../config.js';
import { hexColor } from '../utils.js';

export function drawMines(ctx) {
  state.mines.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);

    if (m.detonated) {
      let alpha = m.flashTimer / 12;
      // Fiery glow
      let expGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, MINE_DEF.splashRadius * alpha);
      expGrd.addColorStop(0, hexColor('#ff8', alpha * 0.4));
      expGrd.addColorStop(0.5, hexColor('#f80', alpha * 0.3));
      expGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = expGrd;
      ctx.beginPath(); ctx.arc(0, 0, MINE_DEF.splashRadius * alpha, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = hexColor('#f42', alpha);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, MINE_DEF.splashRadius * (1 - alpha * 0.5), 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      return;
    }

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 2, 8, 3, 0, 0, Math.PI*2); ctx.fill();

    let armPulse = m.armed ? Math.sin(state.gameTime * 0.15) * 0.3 + 0.7 : 0.3;

    // Main body with gradient
    let mineGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 10);
    mineGrad.addColorStop(0, '#4a4a4a');
    mineGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = mineGrad;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner ring
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.8;

    // Cross lines
    for (let i = 0; i < 4; i++) {
      let a = (i/4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*2, Math.sin(a)*2);
      ctx.lineTo(Math.cos(a)*7, Math.sin(a)*7);
      ctx.stroke();
    }

    // Core
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI*2); ctx.fill();

    // Indicator LED with glow
    ctx.fillStyle = m.armed ? hexColor('#f42', armPulse) : '#622';
    ctx.shadowColor = m.armed ? '#f42' : '#622';
    ctx.shadowBlur = m.armed ? 8 + armPulse * 6 : 0;
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    if (m.armed) {
      if (Math.sin(state.gameTime * 0.2) > 0) {
        ctx.fillStyle = '#f00';
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(5, -5, 1.2, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else {
      // Arming progress ring
      ctx.strokeStyle = '#f42';
      ctx.lineWidth = 2;
      let progress = 1 - (m.armTimer / 60);
      ctx.beginPath();
      ctx.arc(0, 0, 10, -Math.PI/2, -Math.PI/2 + Math.PI*2*progress);
      ctx.stroke();
    }

    // Warning triangles
    ctx.fillStyle = '#aa0';
    for (let i = 0; i < 3; i++) {
      let a = (i/3)*Math.PI*2 - Math.PI/2;
      let tx = Math.cos(a)*8, ty = Math.sin(a)*8;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 1.5);
      ctx.lineTo(tx - 1.5, ty + 1);
      ctx.lineTo(tx + 1.5, ty + 1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });
}

export function drawBullets(ctx) {
  state.bullets.forEach(b => {
    // Trail with gradient fade
    b.trail.forEach((t, i) => {
      let alpha = (t.life / 8) * 0.4;
      let size = 1.5 * (t.life/8);
      let trailGrd = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, size * 2);
      trailGrd.addColorStop(0, hexColor(b.color, alpha));
      trailGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = trailGrd;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size * 2, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();

    if (b.towerId === 'plasma') {
      // Plasma orb with inner glow
      let orbGrd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 5);
      orbGrd.addColorStop(0, '#fff');
      orbGrd.addColorStop(0.3, b.color);
      orbGrd.addColorStop(1, hexColor(b.color, 0.3));
      ctx.fillStyle = orbGrd;
      ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI*2); ctx.fill();

    } else if (b.towerId === 'rail') {
      let angle = Math.atan2(b.ty - b.y, b.tx - b.x);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      // Elongated slug with glow
      let slugGrad = ctx.createLinearGradient(-8, 0, 8, 0);
      slugGrad.addColorStop(0, hexColor(b.color, 0.3));
      slugGrad.addColorStop(0.5, '#fff');
      slugGrad.addColorStop(1, hexColor(b.color, 0.3));
      ctx.fillStyle = slugGrad;
      ctx.fillRect(-8, -2, 16, 4);
      ctx.restore();

    } else if (b.towerId === 'emp') {
      // Electric orb
      let empGrd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 6);
      empGrd.addColorStop(0, '#fff');
      empGrd.addColorStop(0.4, '#ff0');
      empGrd.addColorStop(1, hexColor('#ff0', 0.2));
      ctx.fillStyle = empGrd;
      ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
      // Mini arcs
      ctx.strokeStyle = hexColor('#ff0', 0.5);
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        let a = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(a)*3, b.y + Math.sin(a)*3);
        ctx.lineTo(b.x + Math.cos(a)*7, b.y + Math.sin(a)*7);
        ctx.stroke();
      }

    } else if (b.towerId === 'cryo') {
      // Ice crystal
      let cryoGrd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 5);
      cryoGrd.addColorStop(0, '#fff');
      cryoGrd.addColorStop(0.4, '#aef');
      cryoGrd.addColorStop(1, hexColor('#6ef', 0.2));
      ctx.fillStyle = cryoGrd;
      ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
      // Crystal spikes
      ctx.strokeStyle = hexColor('#fff', 0.6);
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        let a = (i/6)*Math.PI*2 + state.gameTime*0.15;
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(a)*2, b.y + Math.sin(a)*2);
        ctx.lineTo(b.x + Math.cos(a)*6, b.y + Math.sin(a)*6);
        ctx.stroke();
      }

    } else if (b.towerId === 'missile') {
      let a = b.angle !== undefined ? b.angle : Math.atan2(b.ty - b.y, b.tx - b.x);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      // Body with gradient
      let missGrad = ctx.createLinearGradient(0, -2, 0, 2);
      missGrad.addColorStop(0, '#eee');
      missGrad.addColorStop(1, '#bbb');
      ctx.fillStyle = missGrad;
      ctx.fillRect(-5, -2, 8, 4);
      // Nose cone
      ctx.fillStyle = '#f92';
      ctx.beginPath();
      ctx.moveTo(3, -2); ctx.lineTo(7, 0); ctx.lineTo(3, 2);
      ctx.closePath();
      ctx.fill();
      // Fins
      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.moveTo(-5, -2); ctx.lineTo(-7, -4); ctx.lineTo(-3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, 2); ctx.lineTo(-7, 4); ctx.lineTo(-3, 2);
      ctx.closePath();
      ctx.fill();
      // Exhaust flame
      ctx.fillStyle = '#fa0';
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-5, -1.5); ctx.lineTo(-9 - Math.random()*4, 0); ctx.lineTo(-5, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff8';
      ctx.beginPath();
      ctx.moveTo(-5, -0.8); ctx.lineTo(-7 - Math.random()*2, 0); ctx.lineTo(-5, 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else {
      // Default laser bolt with glow
      let laserGrd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 4);
      laserGrd.addColorStop(0, '#fff');
      laserGrd.addColorStop(0.4, b.color);
      laserGrd.addColorStop(1, hexColor(b.color, 0.2));
      ctx.fillStyle = laserGrd;
      ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  });
}

export function drawParticles(ctx) {
  // Normal particles first
  state.particles.forEach(p => {
    if (p.additive) return; // Skip additive particles for now
    let alpha = Math.min(1, p.life / 15);
    ctx.globalAlpha = alpha;

    if (p.isRing) {
      let maxLife = p.ringLife || 12;
      let progress = 1 - (p.life / maxLife);
      let radius = Math.max(0, progress * (p.ringMax || 20));
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.globalAlpha = (1 - progress) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      // Inner glow ring
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 * (1 - progress);
      ctx.globalAlpha = (1 - progress) * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();

    } else if (p.isFlash) {
      let flashAlpha = p.life / 6;
      let flashGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * flashAlpha * 1.5);
      flashGrd.addColorStop(0, hexColor('#fff', flashAlpha * 0.8));
      flashGrd.addColorStop(0.5, hexColor('#fff', flashAlpha * 0.3));
      flashGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = flashGrd;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * flashAlpha * 1.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.shape === 'smoke') {
      // Soft smoke circle
      let smokeGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, (p.size || 3) * 1.5);
      smokeGrd.addColorStop(0, hexColor(p.color, alpha * 0.5));
      smokeGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = smokeGrd;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.size || 3) * 1.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.shape === 'spark') {
      // Elongated spark along velocity
      let speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      let angle = Math.atan2(p.vy, p.vx);
      let len = Math.max(2, speed * 3);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-len/2, -0.5, len, 1);
      ctx.restore();

    } else if (p.shape === 'circle') {
      let sz = p.size || 2;
      let circGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
      circGrd.addColorStop(0, p.color);
      circGrd.addColorStop(1, hexColor(p.color, 0.2));
      ctx.fillStyle = circGrd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.shape === 'debris') {
      // Tumbling debris
      let sz = p.size || 2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(-sz/2, -sz/3, sz, sz * 0.6);
      ctx.restore();

    } else {
      // Default square particle
      ctx.fillStyle = p.color;
      let sz = p.size || 2;
      ctx.fillRect(p.x - sz/2, p.y - sz/2, sz, sz);
    }
  });

  // Additive blend pass for glow particles
  ctx.globalCompositeOperation = 'lighter';
  state.particles.forEach(p => {
    if (!p.additive) return;
    let alpha = Math.min(1, p.life / 15);
    ctx.globalAlpha = alpha * 0.6;
    let sz = p.size || 2;
    let glowGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 2);
    glowGrd.addColorStop(0, p.color);
    glowGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, sz * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';

  ctx.globalAlpha = 1;
}
