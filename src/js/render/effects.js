import state from '../state.js';
import { MINE_DEF } from '../config.js';
import { hexColor } from '../utils.js';

export function drawMines(ctx) {
  state.mines.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);

    if (m.detonated) {
      let alpha = m.flashTimer / 12;
      ctx.fillStyle = hexColor('#f80', alpha * 0.6);
      ctx.beginPath(); ctx.arc(0, 0, MINE_DEF.splashRadius * alpha, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = hexColor('#f42', alpha);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, MINE_DEF.splashRadius * (1 - alpha * 0.5), 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      return;
    }

    let armPulse = m.armed ? Math.sin(state.gameTime * 0.15) * 0.3 + 0.7 : 0.3;
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      let a = (i/4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*2, Math.sin(a)*2);
      ctx.lineTo(Math.cos(a)*7, Math.sin(a)*7);
      ctx.stroke();
    }
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = m.armed ? hexColor('#f42', armPulse) : '#622';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    if (m.armed) {
      ctx.shadowColor = '#f42';
      ctx.shadowBlur = 6 + armPulse * 4;
      ctx.fillStyle = hexColor('#f42', armPulse);
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      if (Math.sin(state.gameTime * 0.2) > 0) {
        ctx.fillStyle = '#f00';
        ctx.beginPath(); ctx.arc(5, -5, 1.2, 0, Math.PI*2); ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#f42';
      ctx.lineWidth = 1.5;
      let progress = 1 - (m.armTimer / 60);
      ctx.beginPath();
      ctx.arc(0, 0, 10, -Math.PI/2, -Math.PI/2 + Math.PI*2*progress);
      ctx.stroke();
    }
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
    b.trail.forEach(t => {
      ctx.globalAlpha = t.life / 8 * 0.5;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.5 * (t.life/8), 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();

    if (b.towerId === 'plasma') {
      ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 1.5, 0, Math.PI*2);
      ctx.fill();
    } else if (b.towerId === 'rail') {
      let angle = Math.atan2(b.ty - b.y, b.tx - b.x);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      ctx.fillRect(-6, -2, 12, 4);
      ctx.restore();
    } else if (b.towerId === 'emp') {
      ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = hexColor('#ff0', 0.4);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI*2);
      ctx.stroke();
    } else if (b.towerId === 'cryo') {
      ctx.arc(b.x, b.y, 3.5, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        let a = (i/6)*Math.PI*2 + state.gameTime*0.15;
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(a)*2, b.y + Math.sin(a)*2);
        ctx.lineTo(b.x + Math.cos(a)*6, b.y + Math.sin(a)*6);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, 1.5, 0, Math.PI*2); ctx.fill();
    } else if (b.towerId === 'missile') {
      let a = b.angle !== undefined ? b.angle : Math.atan2(b.ty - b.y, b.tx - b.x);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      ctx.fillStyle = '#ddd';
      ctx.fillRect(-5, -2, 8, 4);
      ctx.fillStyle = '#f92';
      ctx.beginPath();
      ctx.moveTo(3, -2); ctx.lineTo(7, 0); ctx.lineTo(3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.moveTo(-5, -2); ctx.lineTo(-7, -4); ctx.lineTo(-3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, 2); ctx.lineTo(-7, 4); ctx.lineTo(-3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fa0';
      ctx.beginPath();
      ctx.moveTo(-5, -1.5); ctx.lineTo(-9 - Math.random()*3, 0); ctx.lineTo(-5, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  });
}

export function drawParticles(ctx) {
  state.particles.forEach(p => {
    ctx.globalAlpha = Math.min(1, p.life / 15);

    if (p.isRing) {
      // Shockwave ring
      let progress = 1 - (p.life / 12);
      let radius = progress * (p.ringMax || 20);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2 * (1 - progress);
      ctx.globalAlpha = (1 - progress) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.isFlash) {
      // Bright flash core
      let flashAlpha = p.life / 6;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 15 * flashAlpha;
      ctx.globalAlpha = flashAlpha * 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * flashAlpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = p.color;
      let sz = p.size || 2;
      ctx.fillRect(p.x - sz/2, p.y - sz/2, sz, sz);
    }
  });
  ctx.globalAlpha = 1;
}
