import state from '../state.js';
import { hexColor } from '../utils.js';
import { sprites } from '../sprites.js';

export function drawTower(ctx, t) {
  let cx = t.x, cy = t.y;
  let id = t.def.id;
  let col = t.def.color;
  let flash = t.fireFlash > 0;

  ctx.save();
  ctx.translate(cx, cy);

  // --- Drop shadow ---
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Platform base sprite ---
  let plat = sprites['platform'];
  if (plat) ctx.drawImage(plat, -18, -14, 36, 28);

  if (id === 'laser') {
    // Static base
    let base = sprites['laser-base'];
    if (base) ctx.drawImage(base, -10, -14, 20, 20);
    // Rotating barrel
    ctx.save();
    ctx.rotate(t.angle);
    let barrel = sprites['laser-barrel'];
    if (barrel) ctx.drawImage(barrel, -6, -5, 28, 10);
    // Firing glow
    if (flash) {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = col;
      ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(20, 0, 3, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    // Persistent barrel tip glow
    let tipGlow = ctx.createRadialGradient(20, 0, 0, 20, 0, 5);
    tipGlow.addColorStop(0, hexColor(col, 0.25));
    tipGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = tipGlow;
    ctx.beginPath(); ctx.arc(20, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'plasma') {
    let base = sprites['plasma-base'];
    if (base) ctx.drawImage(base, -11, -14, 22, 22);
    // Pulsing core glow overlay
    let corePulse = Math.sin(state.gameTime * 0.1) * 0.3 + 0.7;
    let coreGrd = ctx.createRadialGradient(0, -3, 0, 0, -3, 8);
    coreGrd.addColorStop(0, hexColor('#ff44ff', corePulse * 0.35));
    coreGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrd;
    ctx.beginPath(); ctx.arc(0, -3, 8, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.rotate(t.angle);
    let barrel = sprites['plasma-barrel'];
    if (barrel) ctx.drawImage(barrel, -6, -7, 26, 14);
    if (flash) {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(18, 0, 5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    // Orbiting energy ring
    let ringAngle = state.gameTime * 0.06;
    ctx.strokeStyle = hexColor('#f0f', 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(4, 0, 10, 3, ringAngle, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (id === 'emp') {
    let empSprite = sprites['emp'];
    if (empSprite) ctx.drawImage(empSprite, -12, -22, 24, 32);
    // Animated electricity arcs overlay
    if (Math.random() < 0.4) {
      ctx.strokeStyle = hexColor('#ff0', 0.7);
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        let sa = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 3, -14 + Math.sin(sa) * 3);
        let mx = Math.cos(sa) * 7 + (Math.random() - 0.5) * 5;
        let my = -14 + Math.sin(sa) * 7 + (Math.random() - 0.5) * 5;
        ctx.lineTo(mx, my);
        ctx.lineTo(mx + (Math.random()-0.5)*5, my + (Math.random()-0.5)*5);
        ctx.stroke();
      }
    }
    // Rotating antenna spokes
    let spokeAngle = state.gameTime * 0.03;
    ctx.strokeStyle = hexColor('#ff0', 0.25);
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      let a = spokeAngle + (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(Math.cos(a) * 10, -14 + Math.sin(a) * 10);
      ctx.stroke();
    }
    // Firing pulse
    if (flash) {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.arc(0, -14, 6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexColor('#ff0', 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + (5 - t.fireFlash) * 8, 0, Math.PI*2);
      ctx.stroke();
    }

  } else if (id === 'rail') {
    let base = sprites['rail-base'];
    if (base) ctx.drawImage(base, -11, -12, 22, 18);
    ctx.save();
    ctx.rotate(t.angle);
    let recoil = flash ? -(5 - t.fireFlash) * 1.5 : 0;
    let barrel = sprites['rail-barrel'];
    if (barrel) ctx.drawImage(barrel, -8 + recoil, -5, 32, 10);
    if (flash) {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.arc(22 + recoil, 0, 4, 0, Math.PI*2); ctx.fill();
      // Muzzle flash rays
      ctx.fillStyle = hexColor('#fa0', 0.5);
      for (let i = 0; i < 6; i++) {
        let a = (i/6)*Math.PI*2 + state.gameTime*0.3;
        ctx.beginPath();
        ctx.moveTo(22 + recoil, 0);
        ctx.lineTo(22 + recoil + Math.cos(a)*10, Math.sin(a)*10);
        ctx.lineTo(22 + recoil + Math.cos(a+0.15)*3, Math.sin(a+0.15)*3);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    // Status LED
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.shadowColor = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.shadowBlur = 3;
    ctx.beginPath(); ctx.arc(-5 + recoil, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

  } else if (id === 'tesla') {
    let teslaSprite = sprites['tesla'];
    if (teslaSprite) ctx.drawImage(teslaSprite, -12, -24, 24, 34);
    // Corona glow overlay
    let tPulse = Math.sin(state.gameTime * 0.12) * 0.3 + 0.7;
    let coronaGrd = ctx.createRadialGradient(0, -16, 0, 0, -16, 10);
    coronaGrd.addColorStop(0, hexColor('#8ff', tPulse * 0.25));
    coronaGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = coronaGrd;
    ctx.beginPath(); ctx.arc(0, -16, 10, 0, Math.PI*2); ctx.fill();

    // Ambient arcs from orb
    if (Math.random() < 0.5) {
      ctx.strokeStyle = hexColor('#8ff', 0.6);
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        let sa = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa)*4, -16 + Math.sin(sa)*4);
        let midX = Math.cos(sa)*7 + (Math.random()-0.5)*4;
        let midY = -16 + Math.sin(sa)*7 + (Math.random()-0.5)*4;
        ctx.lineTo(midX, midY);
        ctx.lineTo(Math.cos(sa)*12 + (Math.random()-0.5)*6, -16 + Math.sin(sa)*12 + (Math.random()-0.5)*6);
        ctx.stroke();
      }
    }
    // Chain lightning to targets
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
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8ff';
      });
      ctx.globalAlpha = 1;
    }

  } else if (id === 'cryo') {
    let base = sprites['cryo-base'];
    if (base) ctx.drawImage(base, -13, -12, 26, 18);
    // Cold mist aura
    let frostPulse = Math.sin(state.gameTime * 0.06) * 0.3 + 0.5;
    let mistGrd = ctx.createRadialGradient(0, -3, 0, 0, -3, 12);
    mistGrd.addColorStop(0, hexColor('#aef', frostPulse * 0.15));
    mistGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = mistGrd;
    ctx.beginPath(); ctx.arc(0, -3, 12, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.rotate(t.angle);
    let barrel = sprites['cryo-barrel'];
    if (barrel) ctx.drawImage(barrel, -6, -7, 24, 14);
    if (flash) {
      ctx.fillStyle = '#cef';
      ctx.shadowColor = '#6ef';
      ctx.shadowBlur = 14;
      for (let i = 0; i < 5; i++) {
        let a = (i/5)*Math.PI*2 + state.gameTime*0.2;
        let r = 4 + Math.random()*4;
        ctx.beginPath();
        ctx.moveTo(16 + Math.cos(a)*r, Math.sin(a)*r);
        ctx.lineTo(16 + Math.cos(a+0.2)*(r-2), Math.sin(a+0.2)*(r-2));
        ctx.lineTo(16 + Math.cos(a-0.2)*(r-2), Math.sin(a-0.2)*(r-2));
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.restore();
    // Status LED
    ctx.fillStyle = t.cooldown > 0 ? '#48f' : '#6ef';
    ctx.shadowColor = '#6ef';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(0, -9, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

  } else if (id === 'missile') {
    let base = sprites['missile-base'];
    if (base) ctx.drawImage(base, -16, -14, 32, 22);
    ctx.save();
    ctx.rotate(t.angle);
    let launcher = sprites['missile-launcher'];
    if (launcher) ctx.drawImage(launcher, -8, -9, 22, 18);
    if (flash) {
      ctx.fillStyle = '#fa0';
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(10, 0, 6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Launch smoke
      ctx.fillStyle = hexColor('#aaa', 0.3);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(8 + Math.random()*4, (Math.random()-0.5)*8, 2+Math.random()*2, 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Rotating radar dish overlay
    ctx.save();
    ctx.translate(0, -8);
    let radarAngle = state.gameTime * 0.04;
    ctx.rotate(radarAngle);
    ctx.strokeStyle = '#7a6a5a';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 6, -0.8, 0.8); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 0); ctx.stroke();
    ctx.fillStyle = '#6a5a4a';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Radar sweep glow
    ctx.fillStyle = hexColor('#f92', 0.12);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.arc(0, -8, 12, radarAngle - 0.4, radarAngle);
    ctx.closePath();
    ctx.fill();

    // Status LEDs
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.shadowColor = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.shadowBlur = 3;
    ctx.beginPath(); ctx.arc(-6, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f92';
    ctx.shadowColor = '#f92';
    ctx.beginPath(); ctx.arc(6, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
