import state from '../state.js';
import { hexColor } from '../utils.js';

export function drawTower(ctx, t) {
  let cx = t.x, cy = t.y;
  let id = t.def.id;
  let col = t.def.color;
  let flash = t.fireFlash > 0;

  ctx.save();
  ctx.translate(cx, cy);

  // --- Platform base (all towers) ---
  let grad = ctx.createRadialGradient(0, 2, 2, 0, 0, 16);
  grad.addColorStop(0, '#3a3a4a');
  grad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-14, -10); ctx.lineTo(14, -10); ctx.lineTo(16, -6);
  ctx.lineTo(16, 10); ctx.lineTo(-16, 10); ctx.lineTo(-16, -6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Bolt details
  ctx.fillStyle = '#666';
  [[-11,-7],[11,-7],[-11,7],[11,7]].forEach(([bx,by]) => {
    ctx.beginPath(); ctx.arc(bx,by,1.5,0,Math.PI*2); ctx.fill();
  });

  // Armored skirt
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(-12, -4, 24, 4);
  ctx.strokeStyle = '#444';
  ctx.strokeRect(-12, -4, 24, 4);

  if (id === 'laser') {
    ctx.fillStyle = '#333';
    ctx.fillRect(-6, -8, 12, 6);
    ctx.fillStyle = '#444';
    ctx.fillRect(-8, -3, 16, 3);
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.moveTo(-8, -6); ctx.lineTo(6, -4); ctx.lineTo(14, -2);
    ctx.lineTo(14, 2); ctx.lineTo(6, 4); ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a6a8a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#556';
    ctx.fillRect(8, -2, 10, 4);
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.fillRect(16, -1.5, 3, 3);
    ctx.beginPath();
    ctx.arc(18, 0, 2, 0, Math.PI*2);
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.fill();
    if (flash) {
      ctx.shadowColor = col;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = '#3a5a7a';
    ctx.beginPath(); ctx.moveTo(-2,-5); ctx.lineTo(-2,5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4,-3.5); ctx.lineTo(4,3.5); ctx.stroke();
    ctx.fillStyle = '#0f0';
    ctx.beginPath(); ctx.arc(-4, -3, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'plasma') {
    ctx.fillStyle = '#2a1a2a';
    ctx.fillRect(-8, -8, 16, 6);
    ctx.fillStyle = '#3a2a3a';
    ctx.beginPath(); ctx.arc(0, -5, 7, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#3a2040';
    ctx.beginPath();
    ctx.moveTo(-9, -7); ctx.lineTo(8, -6); ctx.lineTo(12, -3);
    ctx.lineTo(12, 3); ctx.lineTo(8, 6); ctx.lineTo(-9, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a3a6a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#4a3050';
    ctx.fillRect(8, -5, 10, 3);
    ctx.fillRect(8, 2, 10, 3);
    ctx.fillStyle = flash ? '#fff' : '#c0f';
    ctx.beginPath(); ctx.arc(18, -3.5, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, 3.5, 2, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(18, 0, 4, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#2a1a2a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-6 + i*5, -7.5, 2, 1.5);
      ctx.fillRect(-6 + i*5, 6, 2, 1.5);
    }
    ctx.fillStyle = hexColor('#f0f', 0.3 + Math.sin(state.gameTime*0.1)*0.2);
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'emp') {
    ctx.fillStyle = '#3a3a20';
    ctx.fillRect(-4, -12, 8, 10);
    ctx.fillStyle = '#4a4a30';
    ctx.fillRect(-6, -4, 12, 4);
    for (let i = 0; i < 3; i++) {
      let ry = -12 + i * 3;
      let pulse = Math.sin(state.gameTime * 0.08 + i) * 0.3 + 0.7;
      ctx.strokeStyle = hexColor('#ff0', pulse * 0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, ry, 10 - i, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    let empPulse = Math.sin(state.gameTime * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = hexColor('#ff0', empPulse);
    ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#aa0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -14, 2, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(0, -14, 6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexColor('#ff0', 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + (5 - t.fireFlash) * 8, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.fillStyle = '#aa0';
    ctx.fillRect(-8, 8, 4, 2);
    ctx.fillRect(4, 8, 4, 2);

  } else if (id === 'rail') {
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-8, -6, 16, 8);
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.arc(0, -3, 8, Math.PI, 0); ctx.fill();
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.moveTo(-10, -5); ctx.lineTo(4, -4);
    ctx.lineTo(22, -2.5); ctx.lineTo(22, 2.5);
    ctx.lineTo(4, 4); ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#654';
    ctx.fillRect(4, -4.5, 18, 2);
    ctx.fillRect(4, 2.5, 18, 2);
    ctx.strokeStyle = '#f84';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      let rx = 6 + i * 3.5;
      ctx.beginPath();
      ctx.moveTo(rx, -5); ctx.lineTo(rx, 5);
      ctx.stroke();
    }
    ctx.fillStyle = flash ? '#fff' : '#f60';
    ctx.beginPath(); ctx.arc(22, 0, 3, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#f84';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        let a = (i/4)*Math.PI*2 + state.gameTime*0.3;
        ctx.beginPath();
        ctx.moveTo(22 + Math.cos(a)*3, Math.sin(a)*3);
        ctx.lineTo(22 + Math.cos(a)*8, Math.sin(a)*8);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-8, -3, 6, 6);
    ctx.fillStyle = flash ? '#fa0' : '#853';
    ctx.fillRect(-7, -2, 4, 4);
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.beginPath(); ctx.arc(-5, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'tesla') {
    ctx.fillStyle = '#2a3a3a';
    ctx.fillRect(-10, -2, 20, 10);
    ctx.strokeStyle = '#4a6a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -2, 20, 10);
    ctx.fillStyle = '#3a4a4a';
    ctx.beginPath(); ctx.arc(-5, 4, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 4, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#5a7a7a';
    ctx.beginPath(); ctx.arc(-5, 4, 4, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(5, 4, 4, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#3a4a4a';
    ctx.fillRect(-3, -14, 6, 14);
    ctx.strokeStyle = '#6af';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      let yy = -12 + i * 1.5;
      let w = 4 + (i/8) * 3;
      ctx.beginPath();
      ctx.moveTo(-w, yy); ctx.lineTo(w, yy);
      ctx.stroke();
    }
    let tPulse = Math.sin(state.gameTime * 0.12) * 0.3 + 0.7;
    ctx.fillStyle = hexColor('#8ff', tPulse);
    ctx.beginPath(); ctx.arc(0, -16, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -16, 2, 0, Math.PI*2); ctx.fill();
    if (Math.random() < 0.3) {
      ctx.strokeStyle = hexColor('#8ff', 0.6);
      ctx.lineWidth = 1;
      ctx.beginPath();
      let sa = Math.random() * Math.PI * 2;
      ctx.moveTo(Math.cos(sa)*4, -16 + Math.sin(sa)*4);
      ctx.lineTo(Math.cos(sa)*10 + (Math.random()-0.5)*6, -16 + Math.sin(sa)*10 + (Math.random()-0.5)*6);
      ctx.stroke();
    }
    if (t.chainTimer > 0 && t.chainTargets) {
      ctx.strokeStyle = '#8ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = t.chainTimer / 8;
      t.chainTargets.forEach(tgt => {
        ctx.beginPath();
        let sx = 0, sy = -16;
        ctx.moveTo(sx, sy);
        let tdx = tgt.x - cx, tdy = tgt.y - cy;
        for (let i = 1; i <= 5; i++) {
          let frac = i / 5;
          let nx = sx + (tdx - sx) * frac + (Math.random()-0.5) * 18;
          let ny = sy + (tdy - sy) * frac + (Math.random()-0.5) * 18;
          if (i === 5) { nx = tdx; ny = tdy; }
          ctx.lineTo(nx, ny);
        }
        ctx.stroke();
        ctx.strokeStyle = hexColor('#8ff', 0.3 * (t.chainTimer / 8));
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8ff';
      });
      ctx.globalAlpha = 1;
    }

  } else if (id === 'cryo') {
    ctx.fillStyle = '#1a3a4a';
    ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#3a6a8a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#5a8aaa';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(-10, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -3); ctx.lineTo(10, 3); ctx.stroke();
    ctx.strokeStyle = '#3a7a9a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-2, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(2, -3); ctx.stroke();
    ctx.fillStyle = '#2a4a5a';
    ctx.fillRect(-6, -8, 12, 8);
    ctx.strokeStyle = '#4a7a9a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -8, 12, 8);
    let frostPulse = Math.sin(state.gameTime * 0.06) * 0.3 + 0.5;
    ctx.fillStyle = hexColor('#aef', frostPulse * 0.3);
    ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#3a5a6a';
    ctx.beginPath();
    ctx.moveTo(-5, -4); ctx.lineTo(10, -3);
    ctx.lineTo(14, -5); ctx.lineTo(14, 5);
    ctx.lineTo(10, 3); ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a8a9a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#4a6a7a';
    ctx.beginPath();
    ctx.moveTo(12, -5); ctx.lineTo(18, -7);
    ctx.lineTo(18, 7); ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a9aaa';
    ctx.stroke();
    if (flash) {
      ctx.fillStyle = '#cef';
      ctx.shadowColor = '#6ef';
      ctx.shadowBlur = 12;
      for (let i = 0; i < 3; i++) {
        let a = (i/3)*Math.PI*2 + state.gameTime*0.2;
        let r = 4 + Math.random()*3;
        ctx.beginPath();
        ctx.moveTo(18 + Math.cos(a)*r, Math.sin(a)*r);
        ctx.lineTo(18 + Math.cos(a+0.3)*(r-2), Math.sin(a+0.3)*(r-2));
        ctx.lineTo(18 + Math.cos(a-0.3)*(r-2), Math.sin(a-0.3)*(r-2));
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(-4, -4, 3, 3);
    ctx.fillStyle = '#6ef';
    ctx.fillRect(-3.5, -3.5 + (1 - frostPulse)*2, 2, frostPulse*2);
    ctx.restore();
    ctx.fillStyle = t.cooldown > 0 ? '#48f' : '#6ef';
    ctx.shadowColor = '#6ef';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(0, -9, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

  } else if (id === 'missile') {
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.moveTo(-14, -4); ctx.lineTo(14, -4);
    ctx.lineTo(15, 8); ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-12, 2, 10, 5);
    ctx.fillRect(2, 2, 10, 5);
    ctx.strokeStyle = '#4a3a2a';
    ctx.strokeRect(-12, 2, 10, 5);
    ctx.strokeRect(2, 2, 10, 5);
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(-8, -8); ctx.lineTo(10, -7);
    ctx.lineTo(10, 7); ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a5040';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#3a2518';
    let tubePositions = [[-4,-5],[-4,1],[3,-5],[3,1]];
    tubePositions.forEach(([tx,ty]) => {
      ctx.fillRect(tx, ty, 8, 4);
      ctx.strokeStyle = '#5a4030';
      ctx.strokeRect(tx, ty, 8, 4);
    });
    let missilesLoaded = t.cooldown < t.def.rate * 0.3;
    if (missilesLoaded) {
      ctx.fillStyle = '#f92';
      tubePositions.forEach(([tx,ty]) => {
        ctx.beginPath();
        ctx.moveTo(tx + 8, ty + 0.5);
        ctx.lineTo(tx + 11, ty + 2);
        ctx.lineTo(tx + 8, ty + 3.5);
        ctx.closePath();
        ctx.fill();
      });
    }
    if (flash) {
      ctx.fillStyle = '#fa0';
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = hexColor('#ff8', 0.5);
      ctx.beginPath(); ctx.arc(12, 0, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(0, -8);
    let radarAngle = state.gameTime * 0.04;
    ctx.rotate(radarAngle);
    ctx.strokeStyle = '#7a6a5a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 6, -0.8, 0.8);
    ctx.stroke();
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 0); ctx.stroke();
    ctx.fillStyle = '#6a5a4a';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = hexColor('#f92', 0.15);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    let rsa = state.gameTime * 0.04;
    ctx.arc(0, -8, 12, rsa - 0.4, rsa);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.beginPath(); ctx.arc(-6, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f92';
    ctx.beginPath(); ctx.arc(6, -5, 1, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
}
