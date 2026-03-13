import state from '../state.js';
import { hexColor } from '../utils.js';

function drawDropShadow(ctx, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, h + 2, w * 0.7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHPBar(ctx, e, barOffset) {
  let hpRatio = e.hp / e.maxHp;
  let s = e.type.size;
  let bw = Math.max(s * 2.5, 16);
  let bh = 3.5;
  let bx = -bw / 2;
  let by = -barOffset;

  // Background
  ctx.fillStyle = '#100';
  ctx.beginPath();
  roundRect(ctx, bx - 0.5, by - 0.5, bw + 1, bh + 1, 2);
  ctx.fill();

  // HP fill with gradient
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

  // Border
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  roundRect(ctx, bx - 0.5, by - 0.5, bw + 1, bh + 1, 2);
  ctx.stroke();
}

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

function drawDamageEffects(ctx, e) {
  let hpRatio = e.hp / e.maxHp;
  let s = e.type.size;

  // Sparks at <50% HP
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
    // Exposed wiring at <50%
    if (Math.random() < 0.3) {
      ctx.strokeStyle = hexColor('#f84', 0.6);
      ctx.lineWidth = 0.8;
      let wx = (Math.random() - 0.5) * s;
      let wy = (Math.random() - 0.5) * s;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + (Math.random()-0.5)*4, wy + (Math.random()-0.5)*4);
      ctx.stroke();
    }
  }

  // Smoke at <25% HP
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

    // Red warning pulse
    let warningPulse = Math.sin(state.gameTime * 0.2) * 0.15 + 0.15;
    ctx.fillStyle = hexColor('#f00', warningPulse);
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Status effects
  let slowed = e.slowTimer > 0;
  if (slowed) {
    // Ice crystals
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

export function drawRobot(ctx, e) {
  let s = e.type.size;
  let col = e.type.color;
  let name = e.type.name;
  let walk = e.walkCycle;
  let facing = e.facing;
  let slowed = e.slowTimer > 0;
  let hpRatio = e.hp / e.maxHp;
  // Limping at <25% HP
  let limp = hpRatio < 0.25 ? 0.4 : 0;

  ctx.save();
  ctx.translate(e.x, e.y);

  if (name === 'Scout') {
    let bodyBob = Math.abs(Math.sin(walk)) * 1.5;
    drawDropShadow(ctx, 8, 10);

    // Legs
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 2 - bodyBob);
    ctx.lineTo(-5, 7 + Math.sin(walk + limp)*2);
    ctx.lineTo(-3, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 2 - bodyBob);
    ctx.lineTo(5, 7 + Math.sin(walk + Math.PI)*2);
    ctx.lineTo(3, 10);
    ctx.stroke();

    // Feet with metallic
    ctx.fillStyle = '#777';
    ctx.fillRect(-5, 9 + Math.sin(walk + limp)*2, 4, 2);
    ctx.fillRect(2, 9 + Math.sin(walk+Math.PI)*2, 4, 2);

    // Body with gradient
    let bodyGrad = ctx.createLinearGradient(0, -3 - bodyBob, 0, 3 - bodyBob);
    bodyGrad.addColorStop(0, '#c44');
    bodyGrad.addColorStop(0.3, '#a33');
    bodyGrad.addColorStop(1, '#822');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-5, -3 - bodyBob); ctx.lineTo(5, -3 - bodyBob);
    ctx.lineTo(6, 3 - bodyBob); ctx.lineTo(-6, 3 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d55';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Head with gradient
    let headGrad = ctx.createLinearGradient(0, -7 - bodyBob, 0, -3 - bodyBob);
    headGrad.addColorStop(0, '#c44');
    headGrad.addColorStop(1, '#933');
    ctx.fillStyle = headGrad;
    ctx.fillRect(-4, -7 - bodyBob, 8, 4);

    // Eyes with glow
    ctx.fillStyle = slowed ? '#ff0' : '#f00';
    ctx.shadowColor = slowed ? '#ff0' : '#f00';
    ctx.shadowBlur = 6;
    ctx.fillRect(-3, -6 - bodyBob, 6, 2);
    ctx.shadowBlur = 0;

    // Antenna
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -7 - bodyBob); ctx.lineTo(0, -11 - bodyBob); ctx.stroke();
    ctx.fillStyle = '#f00';
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(0, -11 - bodyBob, 1, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, s + 6);

  } else if (name === 'Soldier') {
    let legSwing = Math.sin(walk) * 0.5;
    let bodyBob = Math.abs(Math.sin(walk)) * 1;
    drawDropShadow(ctx, 10, 12);

    // Legs with gradient
    ctx.save();
    ctx.translate(-4, 3 - bodyBob);
    ctx.rotate(legSwing + limp);
    let legGrad = ctx.createLinearGradient(0, 0, 0, 8);
    legGrad.addColorStop(0, '#aa7700');
    legGrad.addColorStop(1, '#885500');
    ctx.fillStyle = legGrad;
    ctx.fillRect(-2, 0, 4, 8);
    ctx.fillStyle = '#775500';
    ctx.fillRect(-2.5, 7, 5, 3);
    ctx.restore();
    ctx.save();
    ctx.translate(4, 3 - bodyBob);
    ctx.rotate(-legSwing);
    ctx.fillStyle = legGrad;
    ctx.fillRect(-2, 0, 4, 8);
    ctx.fillStyle = '#775500';
    ctx.fillRect(-2.5, 7, 5, 3);
    ctx.restore();

    // Body with metallic gradient
    let bodyGrad = ctx.createLinearGradient(0, -4 - bodyBob, 0, 4 - bodyBob);
    bodyGrad.addColorStop(0, '#bb8800');
    bodyGrad.addColorStop(0.3, '#aa7700');
    bodyGrad.addColorStop(1, '#886600');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-7, -4 - bodyBob); ctx.lineTo(7, -4 - bodyBob);
    ctx.lineTo(6, 4 - bodyBob); ctx.lineTo(-6, 4 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#cc9900';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Belt
    ctx.fillStyle = '#774400';
    ctx.fillRect(-4, -2 - bodyBob, 8, 3);
    ctx.strokeStyle = '#aa7700';
    ctx.strokeRect(-4, -2 - bodyBob, 8, 3);

    // Arms
    ctx.fillStyle = '#996600';
    ctx.fillRect(-10, -3 - bodyBob, 4, 6);
    ctx.fillRect(6, -3 - bodyBob, 4, 6);
    // Gun
    ctx.fillStyle = '#555';
    ctx.fillRect(9, -2 - bodyBob, 5, 2);

    // Head with gradient
    let headGrad = ctx.createLinearGradient(0, -9 - bodyBob, 0, -4 - bodyBob);
    headGrad.addColorStop(0, '#aa7700');
    headGrad.addColorStop(1, '#885500');
    ctx.fillStyle = headGrad;
    ctx.fillRect(-5, -9 - bodyBob, 10, 5);
    ctx.fillStyle = '#663300';
    ctx.fillRect(-4, -8 - bodyBob, 8, 3);

    // Eyes with glow
    ctx.fillStyle = slowed ? '#ff0' : '#fa0';
    ctx.shadowColor = slowed ? '#ff0' : '#fa0';
    ctx.shadowBlur = 6;
    ctx.fillRect(-3, -7 - bodyBob, 2, 1.5);
    ctx.fillRect(1, -7 - bodyBob, 2, 1.5);
    ctx.shadowBlur = 0;

    // Shoulder pads with specular
    let shoulderGrad = ctx.createRadialGradient(-8, -5 - bodyBob, 0, -8, -4 - bodyBob, 3);
    shoulderGrad.addColorStop(0, '#cc9900');
    shoulderGrad.addColorStop(1, '#aa7700');
    ctx.fillStyle = shoulderGrad;
    ctx.beginPath(); ctx.arc(-8, -4 - bodyBob, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = shoulderGrad;
    ctx.beginPath(); ctx.arc(8, -4 - bodyBob, 3, 0, Math.PI*2); ctx.fill();

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, s + 6);

  } else if (name === 'Tank') {
    let rumble = Math.sin(state.gameTime * 0.3) * 0.5;
    drawDropShadow(ctx, 14, 10);

    // Treads with gradient
    let treadGrad = ctx.createLinearGradient(0, 4, 0, 10);
    treadGrad.addColorStop(0, '#555');
    treadGrad.addColorStop(1, '#333');
    ctx.fillStyle = treadGrad;
    ctx.fillRect(-13, 4, 26, 6);
    ctx.fillStyle = '#333';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(-12 + i*4, 4.5, 2, 5);
    }
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, 4, 26, 6);

    // Wheels
    [[-10, 7], [10, 7], [0, 7]].forEach(([wx, wy]) => {
      let wheelGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, 2.5);
      wheelGrad.addColorStop(0, '#777');
      wheelGrad.addColorStop(1, '#444');
      ctx.fillStyle = wheelGrad;
      ctx.beginPath(); ctx.arc(wx, wy, 2.5, 0, Math.PI*2); ctx.fill();
    });

    // Hull with gradient
    let hullGrad = ctx.createLinearGradient(0, -3 + rumble, 0, 4);
    hullGrad.addColorStop(0, '#a55');
    hullGrad.addColorStop(0.3, '#844');
    hullGrad.addColorStop(1, '#733');
    ctx.fillStyle = hullGrad;
    ctx.beginPath();
    ctx.moveTo(-12, 4); ctx.lineTo(-10, -3 + rumble);
    ctx.lineTo(10, -3 + rumble); ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a66';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hull detail
    ctx.fillStyle = '#622';
    ctx.fillRect(-8, -1 + rumble, 16, 3);

    // Turret with gradient
    ctx.save();
    ctx.translate(0, -4 + rumble);
    ctx.rotate(facing);
    let turretGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 6);
    turretGrad.addColorStop(0, '#a66');
    turretGrad.addColorStop(1, '#744');
    ctx.fillStyle = turretGrad;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#b77';
    ctx.stroke();

    // Barrel with gradient
    let barGrad = ctx.createLinearGradient(0, -2, 0, 2);
    barGrad.addColorStop(0, '#877');
    barGrad.addColorStop(1, '#655');
    ctx.fillStyle = barGrad;
    ctx.fillRect(4, -2, 10, 4);
    ctx.fillStyle = '#533';
    ctx.fillRect(12, -2.5, 3, 5);
    ctx.restore();

    // Armor plates
    ctx.fillStyle = '#955';
    ctx.fillRect(-11, 0 + rumble, 3, 3);
    ctx.fillRect(8, 0 + rumble, 3, 3);

    // Commander light
    ctx.fillStyle = slowed ? '#ff0' : '#f00';
    ctx.shadowColor = slowed ? '#ff0' : '#f00';
    ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(0, -5 + rumble, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, s + 6);

  } else if (name === 'Drone') {
    let hover = Math.sin(state.gameTime * 0.15) * 3;
    let propSpin = state.gameTime * 0.8;
    ctx.translate(0, hover);

    // Shadow (adjusts with hover)
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 8 - hover, 6, 2, 0, 0, Math.PI*2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#446';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(8, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-2, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(2, 2); ctx.stroke();

    // Body with gradient
    let droneGrad = ctx.createRadialGradient(0, -1, 0, 0, -1, 5);
    droneGrad.addColorStop(0, '#558');
    droneGrad.addColorStop(1, '#336');
    ctx.fillStyle = droneGrad;
    ctx.beginPath();
    ctx.moveTo(-3, -4); ctx.lineTo(3, -4);
    ctx.lineTo(4, 0); ctx.lineTo(3, 2);
    ctx.lineTo(-3, 2); ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#66b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Propellers with glow disc
    [[-8,-2],[8,-2],[-2,-6],[2,2]].forEach(([px,py], i) => {
      let a = propSpin + i * Math.PI/2;
      // Blur disc
      ctx.fillStyle = hexColor('#4af', 0.08);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2); ctx.fill();
      // Prop blades
      ctx.strokeStyle = hexColor('#4af', 0.7);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(a)*4, py + Math.sin(a)*1.5);
      ctx.lineTo(px - Math.cos(a)*4, py - Math.sin(a)*1.5);
      ctx.stroke();
    });

    // Eye with glow
    ctx.fillStyle = slowed ? '#ff0' : '#4af';
    ctx.shadowColor = slowed ? '#ff0' : '#4af';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(0, -1, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -1, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, 12);

  } else if (name === 'Mech') {
    let legSwing = Math.sin(walk) * 0.3;
    let bodyBob = Math.abs(Math.sin(walk)) * 2;
    drawDropShadow(ctx, 14, 20);

    // Legs
    ctx.lineWidth = 3;
    [[-6, legSwing + limp], [6, -legSwing]].forEach(([xOff, rot]) => {
      ctx.save();
      ctx.translate(xOff, 4 - bodyBob);
      ctx.rotate(rot);
      let upperGrad = ctx.createLinearGradient(0, 0, 0, 8);
      upperGrad.addColorStop(0, '#747');
      upperGrad.addColorStop(1, '#636');
      ctx.fillStyle = upperGrad;
      ctx.fillRect(-3, 0, 6, 8);
      let kneeGrad = ctx.createRadialGradient(0, 8, 0, 0, 8, 3);
      kneeGrad.addColorStop(0, '#969');
      kneeGrad.addColorStop(1, '#858');
      ctx.fillStyle = kneeGrad;
      ctx.beginPath(); ctx.arc(0, 8, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#525';
      ctx.fillRect(-3, 8, 6, 8);
      ctx.fillStyle = '#747';
      ctx.beginPath();
      ctx.moveTo(-5, 16); ctx.lineTo(5, 16); ctx.lineTo(6, 18); ctx.lineTo(-6, 18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Torso with gradient
    let torsoGrad = ctx.createLinearGradient(0, -6 - bodyBob, 0, 5 - bodyBob);
    torsoGrad.addColorStop(0, '#969');
    torsoGrad.addColorStop(0.3, '#858');
    torsoGrad.addColorStop(1, '#747');
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -6 - bodyBob); ctx.lineTo(10, -6 - bodyBob);
    ctx.lineTo(9, 5 - bodyBob); ctx.lineTo(-9, 5 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a7a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Core reactor glow
    let corePulse = Math.sin(state.gameTime*0.08)*0.3 + 0.7;
    let coreGrd = ctx.createRadialGradient(0, -1 - bodyBob, 0, 0, -1 - bodyBob, 6);
    coreGrd.addColorStop(0, hexColor('#f4f', corePulse * 0.5));
    coreGrd.addColorStop(0.5, hexColor('#c3c', corePulse * 0.3));
    coreGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrd;
    ctx.beginPath(); ctx.arc(0, -1 - bodyBob, 6, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = hexColor('#f4f', corePulse * 0.6);
    ctx.beginPath(); ctx.arc(0, -1 - bodyBob, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#c3c';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -1 - bodyBob, 1.5, 0, Math.PI*2); ctx.fill();

    // Left arm - missile rack
    ctx.fillStyle = '#636';
    ctx.fillRect(-14, -9 - bodyBob, 5, 6);
    ctx.fillStyle = '#444';
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        ctx.fillRect(-13.5 + j*2.5, -8.5 + i*2.5 - bodyBob, 2, 2);

    // Right arm - gun
    ctx.fillStyle = '#636';
    ctx.fillRect(9, -9 - bodyBob, 5, 6);
    ctx.fillStyle = '#555';
    ctx.fillRect(13, -8 - bodyBob, 6, 1.5);
    ctx.fillRect(13, -6 - bodyBob, 6, 1.5);

    // Head with gradient
    let headGrad = ctx.createLinearGradient(0, -10 - bodyBob, 0, -6 - bodyBob);
    headGrad.addColorStop(0, '#a7a');
    headGrad.addColorStop(1, '#858');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(-5, -10 - bodyBob); ctx.lineTo(5, -10 - bodyBob);
    ctx.lineTo(4, -6 - bodyBob); ctx.lineTo(-4, -6 - bodyBob);
    ctx.closePath();
    ctx.fill();

    // Visor with glow
    ctx.fillStyle = slowed ? '#ff0' : '#f4f';
    ctx.shadowColor = slowed ? '#ff0' : '#f4f';
    ctx.shadowBlur = 8;
    ctx.fillRect(-4, -9 - bodyBob, 8, 2);
    ctx.shadowBlur = 0;

    // Antennae
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, -10 - bodyBob); ctx.lineTo(-3, -14 - bodyBob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -10 - bodyBob); ctx.lineTo(3, -14 - bodyBob); ctx.stroke();

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, 18);

  } else if (name === 'Swarm') {
    let scurry = walk * 2;
    drawDropShadow(ctx, 5, 4);

    // Legs
    ctx.strokeStyle = '#5a5';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      let angle = (i / 6) * Math.PI * 2 + Math.sin(scurry + i * 1.2) * 0.3;
      let legLen = 5 + Math.sin(scurry + i * 1.5) * 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 2, Math.sin(angle) * 2);
      let midX = Math.cos(angle) * 4;
      let midY = Math.sin(angle) * 4 - 2;
      ctx.lineTo(midX, midY);
      ctx.lineTo(Math.cos(angle) * legLen, Math.sin(angle) * legLen + 1);
      ctx.stroke();
    }

    // Body with gradient
    let bodyGrad = ctx.createRadialGradient(-1, -0.5, 0, 0, 0, 4);
    bodyGrad.addColorStop(0, '#6c6');
    bodyGrad.addColorStop(1, '#4a4');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7d7';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Abdomen
    let abdGrad = ctx.createRadialGradient(-2.5, 1, 0, -2, 1, 2.5);
    abdGrad.addColorStop(0, '#4a4');
    abdGrad.addColorStop(1, '#383');
    ctx.fillStyle = abdGrad;
    ctx.beginPath();
    ctx.ellipse(-2, 1, 2.5, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes with glow
    ctx.fillStyle = slowed ? '#ff0' : '#f00';
    ctx.shadowColor = slowed ? '#ff0' : '#f00';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(2, -1.5, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, 0, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(2, 1, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, s + 6);

  } else if (name === 'Titan') {
    let legSwing = Math.sin(walk) * 0.25;
    let bodyBob = Math.abs(Math.sin(walk)) * 2;
    let breathe = Math.sin(state.gameTime * 0.05) * 0.5;
    drawDropShadow(ctx, 18, 22);

    // Back legs
    [[-10, legSwing + limp], [10, -legSwing]].forEach(([xOff, rot]) => {
      ctx.save();
      ctx.translate(xOff, 6 - bodyBob);
      ctx.rotate(rot);
      let legGrad = ctx.createLinearGradient(0, 0, 0, 18);
      legGrad.addColorStop(0, '#aaa');
      legGrad.addColorStop(1, '#777');
      ctx.fillStyle = legGrad;
      ctx.fillRect(-3, 0, 6, 10);
      let kneeGrad = ctx.createRadialGradient(0, 10, 0, 0, 10, 3);
      kneeGrad.addColorStop(0, '#bbb');
      kneeGrad.addColorStop(1, '#999');
      ctx.fillStyle = kneeGrad;
      ctx.beginPath(); ctx.arc(0, 10, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(-3, 10, 6, 8);
      ctx.fillStyle = '#bbb';
      ctx.fillRect(xOff > 0 ? -3 : -5, 17, 8, 3);
      ctx.restore();
    });

    // Front legs
    [[-8, -legSwing], [8, legSwing]].forEach(([xOff, rot]) => {
      ctx.save();
      ctx.translate(xOff, 2 - bodyBob);
      ctx.rotate(rot);
      let legGrad = ctx.createLinearGradient(0, 0, 0, 16);
      legGrad.addColorStop(0, '#bbb');
      legGrad.addColorStop(1, '#888');
      ctx.fillStyle = legGrad;
      ctx.fillRect(-2.5, 0, 5, 10);
      let kneeGrad = ctx.createRadialGradient(0, 10, 0, 0, 10, 2.5);
      kneeGrad.addColorStop(0, '#ccc');
      kneeGrad.addColorStop(1, '#aaa');
      ctx.fillStyle = kneeGrad;
      ctx.beginPath(); ctx.arc(0, 10, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(-2.5, 10, 5, 7);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(xOff > 0 ? -3 : -4, 16, 7, 3);
      ctx.restore();
    });

    // Main body with gradient
    let bodyGrad = ctx.createLinearGradient(0, -4 - bodyBob, 0, 8 - bodyBob);
    bodyGrad.addColorStop(0, '#ccc');
    bodyGrad.addColorStop(0.3, '#bbb');
    bodyGrad.addColorStop(1, '#999');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-14, -4 - bodyBob); ctx.lineTo(14, -4 - bodyBob);
    ctx.lineTo(13, 8 - bodyBob); ctx.lineTo(-13, 8 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Armor panels
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-12, -2 - bodyBob, 24, 3);
    ctx.fillRect(-12, 3 - bodyBob, 24, 3);

    // Rivets with specular
    ctx.fillStyle = '#ccc';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.arc(-10 + i*4, -2 - bodyBob, 1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-10 + i*4, 6 - bodyBob, 1, 0, Math.PI*2); ctx.fill();
    }

    // Core reactor with layered glow
    let coreGrd = ctx.createRadialGradient(0, 1 - bodyBob, 0, 0, 1 - bodyBob, 8);
    coreGrd.addColorStop(0, hexColor('#fff', 0.5 + breathe * 0.3));
    coreGrd.addColorStop(0.3, hexColor('#aaf', 0.3 + breathe * 0.2));
    coreGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrd;
    ctx.beginPath(); ctx.arc(0, 1 - bodyBob, 8, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = hexColor('#fff', 0.4 + breathe * 0.3);
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(0, 1 - bodyBob, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 1 - bodyBob, 2, 0, Math.PI*2); ctx.fill();

    // Head with gradient
    let headGrad = ctx.createLinearGradient(0, -10 - bodyBob, 0, -4 - bodyBob);
    headGrad.addColorStop(0, '#ddd');
    headGrad.addColorStop(1, '#bbb');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(-8, -10 - bodyBob); ctx.lineTo(8, -10 - bodyBob);
    ctx.lineTo(10, -4 - bodyBob); ctx.lineTo(-10, -4 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#eee';
    ctx.stroke();

    // Visor with intense glow
    ctx.fillStyle = slowed ? '#ff0' : '#f44';
    ctx.shadowColor = slowed ? '#ff0' : '#f44';
    ctx.shadowBlur = 12;
    ctx.fillRect(-7, -9 - bodyBob, 14, 3);
    ctx.shadowBlur = 0;
    // Visor slits
    ctx.fillStyle = '#200';
    ctx.fillRect(-3, -9 - bodyBob, 1, 3);
    ctx.fillRect(2, -9 - bodyBob, 1, 3);

    // Shoulder weapons
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-16, -8 - bodyBob, 5, 5);
    ctx.fillRect(11, -8 - bodyBob, 5, 5);
    ctx.fillStyle = '#888';
    ctx.fillRect(-17, -7 - bodyBob, 2, 3);
    ctx.fillRect(16, -7 - bodyBob, 2, 3);

    // Antennae
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -10 - bodyBob); ctx.lineTo(-8, -16 - bodyBob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -10 - bodyBob); ctx.lineTo(8, -16 - bodyBob); ctx.stroke();
    ctx.fillStyle = '#f00';
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(-8, -16 - bodyBob, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -16 - bodyBob, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    drawDamageEffects(ctx, e);
    drawHPBar(ctx, e, 22);
  }

  ctx.restore();
}
