import state from '../state.js';
import { hexColor } from '../utils.js';

export function drawTower(ctx, t) {
  let cx = t.x, cy = t.y;
  let id = t.def.id;
  let col = t.def.color;
  let flash = t.fireFlash > 0;

  ctx.save();
  ctx.translate(cx, cy);

  // --- Drop shadow ---
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Platform base (all towers) ---
  // Metallic gradient platform
  let platGrad = ctx.createRadialGradient(-3, -4, 2, 0, 2, 18);
  platGrad.addColorStop(0, '#5a5a6a');
  platGrad.addColorStop(0.3, '#3a3a4a');
  platGrad.addColorStop(0.7, '#2a2a3a');
  platGrad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = platGrad;
  ctx.beginPath();
  ctx.moveTo(-14, -10); ctx.lineTo(14, -10); ctx.lineTo(16, -6);
  ctx.lineTo(16, 10); ctx.lineTo(-16, 10); ctx.lineTo(-16, -6);
  ctx.closePath();
  ctx.fill();

  // Beveled edge highlight (top-left lit)
  ctx.strokeStyle = hexColor('#8888aa', 0.4);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(14, -10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-16, -6); ctx.lineTo(-14, -10); ctx.stroke();
  // Bottom shadow edge
  ctx.strokeStyle = hexColor('#111122', 0.6);
  ctx.beginPath(); ctx.moveTo(-16, 10); ctx.lineTo(16, 10); ctx.stroke();

  // Bolt details with highlight
  [[-11,-7],[11,-7],[-11,7],[11,7]].forEach(([bx,by]) => {
    ctx.fillStyle = '#777';
    ctx.beginPath(); ctx.arc(bx, by, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.arc(bx - 0.3, by - 0.3, 0.7, 0, Math.PI*2); ctx.fill();
  });

  // Armored skirt with gradient
  let skirtGrad = ctx.createLinearGradient(0, -4, 0, 0);
  skirtGrad.addColorStop(0, '#3a3a4a');
  skirtGrad.addColorStop(1, '#222233');
  ctx.fillStyle = skirtGrad;
  ctx.fillRect(-12, -4, 24, 4);
  ctx.strokeStyle = '#4a4a5a';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(-12, -4, 24, 4);

  if (id === 'laser') {
    // Housing
    ctx.fillStyle = '#333';
    ctx.fillRect(-6, -8, 12, 6);
    ctx.fillStyle = '#444';
    ctx.fillRect(-8, -3, 16, 3);
    ctx.save();
    ctx.rotate(t.angle);

    // Barrel body with metallic gradient
    let barrelGrad = ctx.createLinearGradient(0, -6, 0, 6);
    barrelGrad.addColorStop(0, '#3a5a6a');
    barrelGrad.addColorStop(0.5, '#2a4a5a');
    barrelGrad.addColorStop(1, '#1a3a4a');
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.moveTo(-8, -6); ctx.lineTo(6, -4); ctx.lineTo(14, -2);
    ctx.lineTo(14, 2); ctx.lineTo(6, 4); ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a7a9a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Barrel extension
    let extGrad = ctx.createLinearGradient(0, -2, 0, 2);
    extGrad.addColorStop(0, '#667');
    extGrad.addColorStop(1, '#445');
    ctx.fillStyle = extGrad;
    ctx.fillRect(8, -2, 10, 4);

    // Barrel tip with glow
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.fillRect(16, -1.5, 3, 3);
    ctx.beginPath();
    ctx.arc(18, 0, 2, 0, Math.PI*2);
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.fill();

    // Firing glow
    if (flash) {
      ctx.shadowColor = col;
      ctx.shadowBlur = 18;
      ctx.fill();
      // Lens flare
      ctx.fillStyle = hexColor('#fff', 0.5);
      ctx.beginPath(); ctx.arc(18, 0, 5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Persistent barrel tip glow
    let tipGlow = ctx.createRadialGradient(18, 0, 0, 18, 0, 5);
    tipGlow.addColorStop(0, hexColor(col, 0.3));
    tipGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = tipGlow;
    ctx.beginPath(); ctx.arc(18, 0, 5, 0, Math.PI*2); ctx.fill();

    // Panel lines
    ctx.strokeStyle = '#3a5a7a';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-2,-5); ctx.lineTo(-2,5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4,-3.5); ctx.lineTo(4,3.5); ctx.stroke();
    // Status LED
    ctx.fillStyle = '#0f0';
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(-4, -3, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

  } else if (id === 'plasma') {
    ctx.fillStyle = '#2a1a2a';
    ctx.fillRect(-8, -8, 16, 6);

    // Pulsing energy core
    let corePulse = Math.sin(state.gameTime * 0.1) * 0.3 + 0.7;
    let coreGrd = ctx.createRadialGradient(0, -5, 0, 0, -5, 8);
    coreGrd.addColorStop(0, hexColor('#ff44ff', corePulse * 0.5));
    coreGrd.addColorStop(0.5, hexColor('#aa22aa', corePulse * 0.3));
    coreGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrd;
    ctx.beginPath(); ctx.arc(0, -5, 8, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#3a2a3a';
    ctx.beginPath(); ctx.arc(0, -5, 7, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.rotate(t.angle);

    // Barrel with gradient
    let barrelGrad = ctx.createLinearGradient(0, -7, 0, 7);
    barrelGrad.addColorStop(0, '#4a2550');
    barrelGrad.addColorStop(0.5, '#3a2040');
    barrelGrad.addColorStop(1, '#2a1530');
    ctx.fillStyle = barrelGrad;
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

    // Nozzle tips with glow
    ctx.fillStyle = flash ? '#fff' : '#c0f';
    ctx.beginPath(); ctx.arc(18, -3.5, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, 3.5, 2, 0, Math.PI*2); ctx.fill();

    if (flash) {
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(18, 0, 5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Orbiting energy ring
    let ringAngle = state.gameTime * 0.06;
    ctx.strokeStyle = hexColor('#f0f', 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(2, 0, 10, 3, ringAngle, 0, Math.PI * 2);
    ctx.stroke();

    // Panel details
    ctx.fillStyle = '#2a1a2a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-6 + i*5, -7.5, 2, 1.5);
      ctx.fillRect(-6 + i*5, 6, 2, 1.5);
    }

    // Inner core glow
    ctx.fillStyle = hexColor('#f0f', 0.3 + Math.sin(state.gameTime*0.1)*0.2);
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

  } else if (id === 'emp') {
    ctx.fillStyle = '#3a3a20';
    ctx.fillRect(-4, -12, 8, 10);
    ctx.fillStyle = '#4a4a30';
    ctx.fillRect(-6, -4, 12, 4);

    // Rotating antenna spokes
    let spokeAngle = state.gameTime * 0.03;
    ctx.strokeStyle = hexColor('#ff0', 0.3);
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      let a = spokeAngle + (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(Math.cos(a) * 12, -14 + Math.sin(a) * 12);
      ctx.stroke();
    }

    // Pulsing rings
    for (let i = 0; i < 3; i++) {
      let ry = -12 + i * 3;
      let pulse = Math.sin(state.gameTime * 0.08 + i) * 0.3 + 0.7;
      ctx.strokeStyle = hexColor('#ff0', pulse * 0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, ry, 10 - i, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Top orb with glow
    let empPulse = Math.sin(state.gameTime * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = hexColor('#ff0', empPulse);
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -14, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Crackling electricity arcs
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

    if (flash) {
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 25;
      ctx.fillStyle = '#fff';
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

    // Turret dome with gradient
    let domeGrad = ctx.createRadialGradient(-2, -5, 1, 0, -3, 8);
    domeGrad.addColorStop(0, '#5a4a3a');
    domeGrad.addColorStop(1, '#3a2a1a');
    ctx.fillStyle = domeGrad;
    ctx.beginPath(); ctx.arc(0, -3, 8, Math.PI, 0); ctx.fill();

    ctx.save();
    ctx.rotate(t.angle);

    // Recoil offset on fire
    let recoil = flash ? -(5 - t.fireFlash) * 1.5 : 0;

    // Long barrel with metallic gradient
    let barrelGrad = ctx.createLinearGradient(0, -5, 0, 5);
    barrelGrad.addColorStop(0, '#5a4a3a');
    barrelGrad.addColorStop(0.5, '#3a2a1a');
    barrelGrad.addColorStop(1, '#2a1a0a');
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.moveTo(-10 + recoil, -5); ctx.lineTo(4 + recoil, -4);
    ctx.lineTo(22 + recoil, -2.5); ctx.lineTo(22 + recoil, 2.5);
    ctx.lineTo(4 + recoil, 4); ctx.lineTo(-10 + recoil, 5);
    ctx.closePath();
    ctx.fill();

    // Rail lines with glow
    ctx.fillStyle = '#654';
    ctx.fillRect(4 + recoil, -4.5, 18, 2);
    ctx.fillRect(4 + recoil, 2.5, 18, 2);
    ctx.strokeStyle = hexColor('#f84', 0.5);
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      let rx = 6 + i * 3.5 + recoil;
      ctx.beginPath();
      ctx.moveTo(rx, -5); ctx.lineTo(rx, 5);
      ctx.stroke();
    }

    // Muzzle
    ctx.fillStyle = flash ? '#fff' : '#f60';
    ctx.beginPath(); ctx.arc(22 + recoil, 0, 3, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 25;
      ctx.fill();
      // Muzzle flash rays
      ctx.fillStyle = hexColor('#fa0', 0.6);
      for (let i = 0; i < 6; i++) {
        let a = (i/6)*Math.PI*2 + state.gameTime*0.3;
        ctx.beginPath();
        ctx.moveTo(22 + recoil, 0);
        ctx.lineTo(22 + recoil + Math.cos(a)*12, Math.sin(a)*12);
        ctx.lineTo(22 + recoil + Math.cos(a+0.15)*4, Math.sin(a+0.15)*4);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // Chamber
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-8 + recoil, -3, 6, 6);
    ctx.fillStyle = flash ? '#fa0' : '#853';
    ctx.fillRect(-7 + recoil, -2, 4, 4);
    // Status LED
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.shadowColor = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.shadowBlur = 3;
    ctx.beginPath(); ctx.arc(-5 + recoil, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

  } else if (id === 'tesla') {
    // Base
    ctx.fillStyle = '#2a3a3a';
    ctx.fillRect(-10, -2, 20, 10);
    ctx.strokeStyle = '#4a6a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -2, 20, 10);

    // Coil bases with gradient
    [[-5, 4], [5, 4]].forEach(([cx2, cy2]) => {
      let coilGrad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 4);
      coilGrad.addColorStop(0, '#5a6a6a');
      coilGrad.addColorStop(1, '#3a4a4a');
      ctx.fillStyle = coilGrad;
      ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#5a7a7a';
      ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, Math.PI*2); ctx.stroke();
    });

    // Central pillar
    ctx.fillStyle = '#3a4a4a';
    ctx.fillRect(-3, -14, 6, 14);

    // Coil windings with glow
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      let yy = -12 + i * 1.5;
      let w = 4 + (i/8) * 3;
      let windPulse = Math.sin(state.gameTime * 0.15 + i * 0.5) * 0.3 + 0.7;
      ctx.strokeStyle = hexColor('#6af', windPulse);
      ctx.beginPath();
      ctx.moveTo(-w, yy); ctx.lineTo(w, yy);
      ctx.stroke();
    }

    // Top orb with corona
    let tPulse = Math.sin(state.gameTime * 0.12) * 0.3 + 0.7;
    let coronaGrd = ctx.createRadialGradient(0, -16, 0, 0, -16, 10);
    coronaGrd.addColorStop(0, hexColor('#8ff', tPulse * 0.3));
    coronaGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = coronaGrd;
    ctx.beginPath(); ctx.arc(0, -16, 10, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = hexColor('#8ff', tPulse);
    ctx.shadowColor = '#8ff';
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, -16, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -16, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Ambient electric arcs from orb
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
        // Glow pass
        ctx.strokeStyle = hexColor('#8ff', 0.3 * (t.chainTimer / 8));
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8ff';
      });
      ctx.globalAlpha = 1;
    }

  } else if (id === 'cryo') {
    // Coolant tanks with gradient
    [[-10, 0], [10, 0]].forEach(([tx, ty]) => {
      let tankGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 5);
      tankGrad.addColorStop(0, '#2a5a6a');
      tankGrad.addColorStop(1, '#1a3a4a');
      ctx.fillStyle = tankGrad;
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#3a6a8a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.stroke();
      // Pressure gauge line
      ctx.strokeStyle = '#5a8aaa';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(tx, ty-3); ctx.lineTo(tx, ty+3); ctx.stroke();
    });

    // Pipes
    ctx.strokeStyle = '#3a7a9a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-2, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(2, -3); ctx.stroke();

    // Main housing with gradient
    let houseGrad = ctx.createLinearGradient(0, -8, 0, 0);
    houseGrad.addColorStop(0, '#3a5a6a');
    houseGrad.addColorStop(1, '#2a4a5a');
    ctx.fillStyle = houseGrad;
    ctx.fillRect(-6, -8, 12, 8);
    ctx.strokeStyle = '#4a7a9a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -8, 12, 8);

    // Cold mist aura
    let frostPulse = Math.sin(state.gameTime * 0.06) * 0.3 + 0.5;
    let mistGrd = ctx.createRadialGradient(0, -4, 0, 0, -4, 12);
    mistGrd.addColorStop(0, hexColor('#aef', frostPulse * 0.2));
    mistGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = mistGrd;
    ctx.beginPath(); ctx.arc(0, -4, 12, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.rotate(t.angle);

    // Barrel with gradient
    let cryoBarrelGrad = ctx.createLinearGradient(0, -4, 0, 4);
    cryoBarrelGrad.addColorStop(0, '#4a6a7a');
    cryoBarrelGrad.addColorStop(0.5, '#3a5a6a');
    cryoBarrelGrad.addColorStop(1, '#2a4a5a');
    ctx.fillStyle = cryoBarrelGrad;
    ctx.beginPath();
    ctx.moveTo(-5, -4); ctx.lineTo(10, -3);
    ctx.lineTo(14, -5); ctx.lineTo(14, 5);
    ctx.lineTo(10, 3); ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a8a9a';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Nozzle
    ctx.fillStyle = '#4a6a7a';
    ctx.beginPath();
    ctx.moveTo(12, -5); ctx.lineTo(18, -7);
    ctx.lineTo(18, 7); ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a9aaa';
    ctx.stroke();

    // Frost crystals on fire
    if (flash) {
      ctx.fillStyle = '#cef';
      ctx.shadowColor = '#6ef';
      ctx.shadowBlur = 12;
      for (let i = 0; i < 5; i++) {
        let a = (i/5)*Math.PI*2 + state.gameTime*0.2;
        let r = 4 + Math.random()*4;
        ctx.beginPath();
        ctx.moveTo(18 + Math.cos(a)*r, Math.sin(a)*r);
        ctx.lineTo(18 + Math.cos(a+0.2)*(r-2), Math.sin(a+0.2)*(r-2));
        ctx.lineTo(18 + Math.cos(a-0.2)*(r-2), Math.sin(a-0.2)*(r-2));
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // Coolant gauge
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(-4, -4, 3, 3);
    ctx.fillStyle = '#6ef';
    ctx.fillRect(-3.5, -3.5 + (1 - frostPulse)*2, 2, frostPulse*2);
    ctx.restore();

    // Status LED
    ctx.fillStyle = t.cooldown > 0 ? '#48f' : '#6ef';
    ctx.shadowColor = '#6ef';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(0, -9, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

  } else if (id === 'missile') {
    // Main body with gradient
    let bodyGrad = ctx.createLinearGradient(0, -4, 0, 8);
    bodyGrad.addColorStop(0, '#4a3a2a');
    bodyGrad.addColorStop(1, '#2a1a0a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-14, -4); ctx.lineTo(14, -4);
    ctx.lineTo(15, 8); ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ammo bays
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-12, 2, 10, 5);
    ctx.fillRect(2, 2, 10, 5);
    ctx.strokeStyle = '#4a3a2a';
    ctx.strokeRect(-12, 2, 10, 5);
    ctx.strokeRect(2, 2, 10, 5);

    ctx.save();
    ctx.rotate(t.angle);

    // Launcher body with gradient
    let launcherGrad = ctx.createLinearGradient(0, -8, 0, 8);
    launcherGrad.addColorStop(0, '#5a4030');
    launcherGrad.addColorStop(0.5, '#4a3020');
    launcherGrad.addColorStop(1, '#3a2010');
    ctx.fillStyle = launcherGrad;
    ctx.beginPath();
    ctx.moveTo(-8, -8); ctx.lineTo(10, -7);
    ctx.lineTo(10, 7); ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a5040';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tubes
    let tubePositions = [[-4,-5],[-4,1],[3,-5],[3,1]];
    tubePositions.forEach(([tx,ty]) => {
      ctx.fillStyle = '#3a2518';
      ctx.fillRect(tx, ty, 8, 4);
      ctx.strokeStyle = '#5a4030';
      ctx.strokeRect(tx, ty, 8, 4);
    });

    // Loaded missiles
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
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(10, 0, 6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Launch smoke puff
      ctx.fillStyle = hexColor('#aaa', 0.3);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(8 + Math.random()*4, (Math.random()-0.5)*8, 2+Math.random()*2, 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Rotating radar dish
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

    // Radar sweep glow
    ctx.fillStyle = hexColor('#f92', 0.12);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    let rsa = state.gameTime * 0.04;
    ctx.arc(0, -8, 12, rsa - 0.4, rsa);
    ctx.closePath();
    ctx.fill();

    // Status LEDs with glow
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
