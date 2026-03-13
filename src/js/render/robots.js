import state from '../state.js';
import { hexColor } from '../utils.js';
import { sprites } from '../sprites.js';

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
}

function drawHPBar(ctx, e, barOffset) {
  let hpRatio = e.hp / e.maxHp;
  let s = e.type.size;
  let bw = Math.max(s * 2.5, 16);
  let bh = 3.5;
  let bx = -bw / 2;
  let by = -barOffset;

  ctx.fillStyle = '#100';
  ctx.beginPath();
  roundRect(ctx, bx - 0.5, by - 0.5, bw + 1, bh + 1, 2);
  ctx.fill();

  if (hpRatio > 0) {
    let hpGrad = ctx.createLinearGradient(bx, by, bx + bw * hpRatio, by);
    if (hpRatio > 0.5) {
      hpGrad.addColorStop(0, '#0a0'); hpGrad.addColorStop(1, '#0f0');
    } else if (hpRatio > 0.25) {
      hpGrad.addColorStop(0, '#a80'); hpGrad.addColorStop(1, '#ff0');
    } else {
      hpGrad.addColorStop(0, '#a00'); hpGrad.addColorStop(1, '#f44');
    }
    ctx.fillStyle = hpGrad;
    ctx.beginPath();
    roundRect(ctx, bx, by, bw * hpRatio, bh, 1.5);
    ctx.fill();
  }

  ctx.strokeStyle = '#666';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  roundRect(ctx, bx - 0.5, by - 0.5, bw + 1, bh + 1, 2);
  ctx.stroke();
}

function drawDamageEffects(ctx, e) {
  let hpRatio = e.hp / e.maxHp;
  let s = e.type.size;

  if (hpRatio < 0.5 && hpRatio > 0) {
    let sparkCount = hpRatio < 0.25 ? 4 : 2;
    for (let i = 0; i < sparkCount; i++) {
      if (Math.random() < 0.5) {
        let sx = (Math.random() - 0.5) * s * 2;
        let sy = (Math.random() - 0.5) * s * 2;
        ctx.fillStyle = '#ff0';
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  if (hpRatio < 0.25 && hpRatio > 0) {
    let smokeAlpha = (1 - hpRatio / 0.25) * 0.35;
    for (let i = 0; i < 2; i++) {
      let smokeX = Math.sin(state.gameTime * 0.1 + e.x + i) * 3;
      let smokeY = -s - Math.abs(Math.sin(state.gameTime * 0.05 + i)) * 5 - i * 3;
      let smokeR = 2 + Math.random() * 2;
      let smokeGrd = ctx.createRadialGradient(smokeX, smokeY, 0, smokeX, smokeY, smokeR);
      smokeGrd.addColorStop(0, hexColor('#666', smokeAlpha));
      smokeGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = smokeGrd;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
      ctx.fill();
    }

    let warningPulse = Math.sin(state.gameTime * 0.2) * 0.15 + 0.15;
    ctx.fillStyle = hexColor('#f00', warningPulse);
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (e.slowTimer > 0) {
    ctx.strokeStyle = hexColor('#aef', 0.6);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      let a = (i / 3) * Math.PI * 2 + state.gameTime * 0.05;
      let cr = s * 0.8;
      let cx2 = Math.cos(a) * cr, cy2 = Math.sin(a) * cr;
      ctx.beginPath();
      ctx.moveTo(cx2 - 2, cy2); ctx.lineTo(cx2 + 2, cy2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx2, cy2 - 2); ctx.lineTo(cx2, cy2 + 2);
      ctx.stroke();
    }
  }
}

// Sprite dimension maps (width, height for drawImage)
const ROBOT_DIMS = {
  'Scout':   { w: 16, h: 26, sprite: 'scout', barOff: 12 },
  'Soldier': { w: 22, h: 26, sprite: 'soldier', barOff: 14 },
  'Tank':    { w: 30, h: 18, sprite: 'tank-body', barOff: 12 },
  'Drone':   { w: 20, h: 16, sprite: 'drone', barOff: 12 },
  'Mech':    { w: 32, h: 38, sprite: 'mech', barOff: 22 },
  'Swarm':   { w: 12, h: 10, sprite: 'swarm', barOff: 8 },
  'Titan':   { w: 40, h: 44, sprite: 'titan', barOff: 26 },
};

export function drawRobot(ctx, e) {
  let s = e.type.size;
  let name = e.type.name;
  let walk = e.walkCycle;

  ctx.save();
  ctx.translate(e.x, e.y);

  let dim = ROBOT_DIMS[name];
  if (!dim) { ctx.restore(); return; }

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, dim.h * 0.4, dim.w * 0.35, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walk animation: vertical bob + slight sway
  let bodyBob = 0;
  let sway = 0;
  if (name === 'Drone') {
    bodyBob = Math.sin(state.gameTime * 0.15) * 3;
  } else if (name === 'Tank') {
    bodyBob = Math.sin(state.gameTime * 0.3) * 0.5;
  } else if (name !== 'Swarm') {
    bodyBob = -Math.abs(Math.sin(walk)) * 2;
    sway = Math.sin(walk) * 0.5;
  } else {
    bodyBob = Math.sin(walk * 2) * 0.5;
  }

  ctx.translate(sway, bodyBob);

  // Draw the main sprite
  let sprite = sprites[dim.sprite];
  if (sprite) {
    ctx.drawImage(sprite, -dim.w / 2, -dim.h / 2, dim.w, dim.h);
  }

  // Tank turret (separate rotating sprite)
  if (name === 'Tank') {
    let turret = sprites['tank-turret'];
    if (turret) {
      ctx.save();
      ctx.translate(0, -3);
      ctx.rotate(e.facing);
      ctx.drawImage(turret, -5, -5, 20, 10);
      ctx.restore();
    }
  }

  // Damage effects and status overlays
  drawDamageEffects(ctx, e);

  // Eye glow overlay for slowed state (changes eye color to yellow)
  if (e.slowTimer > 0) {
    // Draw a small yellow glow at approximate eye position
    let eyeY = -dim.h * 0.25;
    ctx.fillStyle = hexColor('#ff0', 0.5);
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    if (name === 'Titan') {
      ctx.fillRect(-7, eyeY, 14, 3);
    } else if (name === 'Mech') {
      ctx.fillRect(-4, eyeY, 8, 2);
    } else {
      ctx.arc(0, eyeY, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Reset bob/sway for HP bar (drawn at fixed position)
  ctx.translate(-sway, -bodyBob);

  drawHPBar(ctx, e, dim.barOff);

  ctx.restore();
}
