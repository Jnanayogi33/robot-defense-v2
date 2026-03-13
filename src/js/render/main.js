import state from '../state.js';
import { COLS, ROWS, TILE, TOWER_DEFS } from '../config.js';
import { PATH, pathSet } from '../path.js';
import { hexColor } from '../utils.js';
import { drawTower } from './towers.js';
import { drawRobot } from './robots.js';
import { drawMines, drawBullets, drawParticles } from './effects.js';

const W = COLS * TILE, H = ROWS * TILE;

// Pre-built background gradient
let bgGrad = null;

// Starfield
const stars = [];
for (let i = 0; i < 60; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * H,
    size: 0.3 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    speed: 0.02 + Math.random() * 0.04,
    brightness: 0.3 + Math.random() * 0.7,
  });
}

// Ambient floating particles
const ambientParticles = [];
for (let i = 0; i < 40; i++) {
  ambientParticles.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.1 - Math.random() * 0.2,
    size: 0.5 + Math.random() * 1.5,
    alpha: 0.1 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2,
  });
}

// Path energy flow particles
const pathFlowParticles = [];
for (let i = 0; i < 20; i++) {
  pathFlowParticles.push({
    pathIndex: Math.random() * (PATH.length - 1),
    speed: 0.02 + Math.random() * 0.03,
    size: 1 + Math.random() * 2,
    alpha: 0.2 + Math.random() * 0.3,
  });
}

export function draw(ctx, canvas) {
  ctx.save();

  // Screen shake
  if (state.screenShake > 0.5) {
    let shakeX = (Math.random() - 0.5) * state.screenShake;
    let shakeY = (Math.random() - 0.5) * state.screenShake;
    ctx.translate(shakeX, shakeY);
  }

  // --- Background gradient ---
  if (!bgGrad) {
    bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#050510');
    bgGrad.addColorStop(0.3, '#0a0a20');
    bgGrad.addColorStop(0.7, '#0d0818');
    bgGrad.addColorStop(1, '#08050f');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // --- Starfield ---
  stars.forEach(star => {
    let twinkle = Math.sin(state.gameTime * star.speed + star.phase);
    let alpha = star.brightness * (0.5 + twinkle * 0.5);
    ctx.fillStyle = hexColor('#88aaff', alpha);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    // Bright stars get a subtle glow
    if (star.size > 1 && twinkle > 0.5) {
      ctx.fillStyle = hexColor('#88aaff', alpha * 0.15);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // --- Grid ---
  ctx.strokeStyle = hexColor('#2233aa', 0.08);
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*TILE,0); ctx.lineTo(x*TILE,H); ctx.stroke(); }
  for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*TILE); ctx.lineTo(W,y*TILE); ctx.stroke(); }

  // Grid intersection glow
  let glowPulse = Math.sin(state.gameTime * 0.02) * 0.3 + 0.5;
  for (let x = 1; x < COLS; x++) {
    for (let y = 1; y < ROWS; y++) {
      if (!pathSet.has(x+','+y)) {
        let grd = ctx.createRadialGradient(x * TILE, y * TILE, 0, x * TILE, y * TILE, 4);
        grd.addColorStop(0, hexColor('#4466cc', 0.12 * glowPulse));
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(x * TILE - 4, y * TILE - 4, 8, 8);
      }
    }
  }

  // --- Path ---
  PATH.forEach(([c,r], idx) => {
    // Metallic floor plate
    let grd = ctx.createLinearGradient(c*TILE, r*TILE, c*TILE, r*TILE+TILE);
    grd.addColorStop(0, '#22223a');
    grd.addColorStop(0.3, '#2a2a48');
    grd.addColorStop(0.5, '#2e2e50');
    grd.addColorStop(0.7, '#2a2a48');
    grd.addColorStop(1, '#1e1e35');
    ctx.fillStyle = grd;
    ctx.fillRect(c*TILE+1, r*TILE+1, TILE-2, TILE-2);

    // Beveled edge highlights
    ctx.strokeStyle = hexColor('#5555aa', 0.2);
    ctx.lineWidth = 1;
    // Top edge highlight
    ctx.beginPath(); ctx.moveTo(c*TILE+2, r*TILE+1.5); ctx.lineTo((c+1)*TILE-2, r*TILE+1.5); ctx.stroke();
    // Left edge highlight
    ctx.beginPath(); ctx.moveTo(c*TILE+1.5, r*TILE+2); ctx.lineTo(c*TILE+1.5, (r+1)*TILE-2); ctx.stroke();

    // Rivet dots in corners
    ctx.fillStyle = '#3a3a55';
    [[c*TILE+5, r*TILE+5], [(c+1)*TILE-5, r*TILE+5], [c*TILE+5, (r+1)*TILE-5], [(c+1)*TILE-5, (r+1)*TILE-5]].forEach(([rx,ry]) => {
      ctx.beginPath(); ctx.arc(rx, ry, 1.2, 0, Math.PI*2); ctx.fill();
    });

    // Center line / direction markers
    if (idx % 3 === 0 && idx < PATH.length - 1) {
      let [nc,nr] = PATH[Math.min(idx+1, PATH.length-1)];
      ctx.strokeStyle = hexColor('#4444aa', 0.25);
      ctx.lineWidth = 1;
      if (nc !== c) {
        ctx.beginPath(); ctx.moveTo(c*TILE + 6, r*TILE + TILE/2); ctx.lineTo((c+1)*TILE - 6, r*TILE + TILE/2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(c*TILE + TILE/2, r*TILE + 6); ctx.lineTo(c*TILE + TILE/2, (r+1)*TILE - 6); ctx.stroke();
      }
    }
  });

  // Path edge glow
  ctx.lineWidth = 1.5;
  PATH.forEach(([c,r]) => {
    let top = !pathSet.has(c+','+(r-1));
    let bot = !pathSet.has(c+','+(r+1));
    let lft = !pathSet.has((c-1)+','+r);
    let rgt = !pathSet.has((c+1)+','+r);
    let edgeAlpha = 0.25 + Math.sin(state.gameTime * 0.03) * 0.1;
    ctx.strokeStyle = hexColor('#4466dd', edgeAlpha);
    ctx.shadowColor = '#4466dd';
    ctx.shadowBlur = 4;
    if (top) { ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE); ctx.lineTo((c+1)*TILE, r*TILE); ctx.stroke(); }
    if (bot) { ctx.beginPath(); ctx.moveTo(c*TILE, (r+1)*TILE); ctx.lineTo((c+1)*TILE, (r+1)*TILE); ctx.stroke(); }
    if (lft) { ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE); ctx.lineTo(c*TILE, (r+1)*TILE); ctx.stroke(); }
    if (rgt) { ctx.beginPath(); ctx.moveTo((c+1)*TILE, r*TILE); ctx.lineTo((c+1)*TILE, (r+1)*TILE); ctx.stroke(); }
  });
  ctx.shadowBlur = 0;

  // Path energy flow particles
  pathFlowParticles.forEach(p => {
    p.pathIndex += p.speed;
    if (p.pathIndex >= PATH.length - 1) p.pathIndex = 0;
    let idx = Math.floor(p.pathIndex);
    let frac = p.pathIndex - idx;
    let [c1, r1] = PATH[idx];
    let [c2, r2] = PATH[Math.min(idx + 1, PATH.length - 1)];
    let px = (c1 + (c2 - c1) * frac) * TILE + TILE/2;
    let py = (r1 + (r2 - r1) * frac) * TILE + TILE/2;
    let grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
    grd.addColorStop(0, hexColor('#6688ff', p.alpha));
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Direction arrows
  ctx.fillStyle = hexColor('#5566aa', 0.3);
  for (let i = 0; i < PATH.length - 1; i += 3) {
    let [c,r] = PATH[i];
    let [nc,nr] = PATH[Math.min(i+1, PATH.length-1)];
    let ccx = c*TILE+TILE/2, ccy = r*TILE+TILE/2;
    let angle = Math.atan2((nr-r), (nc-c));
    ctx.save();
    ctx.translate(ccx, ccy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(8,0); ctx.lineTo(-4,-5); ctx.lineTo(-4,5);
    ctx.fill();
    ctx.restore();
  }

  // Ambient floating particles
  ambientParticles.forEach(p => {
    p.x += p.vx + Math.sin(state.gameTime * 0.01 + p.phase) * 0.1;
    p.y += p.vy;
    if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
    if (p.x < -5) p.x = W + 5;
    if (p.x > W + 5) p.x = -5;
    let flicker = Math.sin(state.gameTime * 0.05 + p.phase) * 0.1 + 0.9;
    let grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
    grd.addColorStop(0, hexColor('#4488ff', p.alpha * flicker));
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Mines
  drawMines(ctx);

  // Range indicator for hovered tower
  if (state.hoverCol >= 0 && state.hoverRow >= 0) {
    let hoveredTower = state.towers.find(t => t.col === state.hoverCol && t.row === state.hoverRow);
    if (hoveredTower) {
      let range = hoveredTower.def.range;
      ctx.strokeStyle = hexColor(hoveredTower.def.color, 0.25);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(hoveredTower.x, hoveredTower.y, range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = hexColor(hoveredTower.def.color, 0.04);
      ctx.fill();
      ctx.setLineDash([]);
    }
    // Placement preview
    if (state.selectedTower && !state.selling) {
      let key = state.hoverCol + ',' + state.hoverRow;
      let onPath = pathSet.has(key);
      let occupied = state.towers.find(t => t.col === state.hoverCol && t.row === state.hoverRow);
      if (!onPath && !occupied) {
        let px = state.hoverCol * TILE + TILE/2;
        let py = state.hoverRow * TILE + TILE/2;
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = state.money >= state.selectedTower.cost ? '#0f0' : '#f00';
        ctx.lineWidth = 1;
        ctx.strokeRect(state.hoverCol * TILE + 2, state.hoverRow * TILE + 2, TILE - 4, TILE - 4);
        // Range preview
        ctx.strokeStyle = hexColor(state.selectedTower.color, 0.3);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(px, py, state.selectedTower.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Towers
  state.towers.forEach(t => drawTower(ctx, t));

  // Enemies (sorted by y for depth)
  let sortedEnemies = [...state.enemies].sort((a,b) => a.y - b.y);
  sortedEnemies.forEach(e => drawRobot(ctx, e));

  // Bullets and particles
  drawBullets(ctx);
  drawParticles(ctx);

  // Entry/exit markers with glow
  let entryPulse = Math.sin(state.gameTime * 0.05) * 0.15 + 0.35;
  let entryGrd = ctx.createRadialGradient(PATH[0][0]*TILE+TILE/2, PATH[0][1]*TILE+TILE/2, 0, PATH[0][0]*TILE+TILE/2, PATH[0][1]*TILE+TILE/2, TILE);
  entryGrd.addColorStop(0, hexColor('#00ff00', entryPulse));
  entryGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = entryGrd;
  ctx.fillRect(PATH[0][0]*TILE - TILE/2, PATH[0][1]*TILE - TILE/2, TILE*2, TILE*2);

  let last = PATH[PATH.length-1];
  let exitGrd = ctx.createRadialGradient(last[0]*TILE+TILE/2, last[1]*TILE+TILE/2, 0, last[0]*TILE+TILE/2, last[1]*TILE+TILE/2, TILE);
  exitGrd.addColorStop(0, hexColor('#ff0000', entryPulse));
  exitGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = exitGrd;
  ctx.fillRect(last[0]*TILE - TILE/2, last[1]*TILE - TILE/2, TILE*2, TILE*2);

  ctx.font = 'bold 10px Courier New';
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#0f0';
  ctx.fillStyle = '#0f0';
  ctx.fillText('IN', PATH[0][0]*TILE+10, PATH[0][1]*TILE+22);
  ctx.shadowColor = '#f00';
  ctx.fillStyle = '#f00';
  ctx.fillText('OUT', last[0]*TILE+8, last[1]*TILE+22);
  ctx.shadowBlur = 0;

  // --- Vignette overlay ---
  let vignette = ctx.createRadialGradient(W/2, H/2, W * 0.3, W/2, H/2, W * 0.75);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();

  // HUD (outside screen shake)
  document.getElementById('money').textContent = state.money;
  document.getElementById('wave').textContent = state.waveNum;
  document.getElementById('lives').textContent = state.lives;
  document.getElementById('score').textContent = state.score;
  document.getElementById('msg').textContent = state.msgTimer > 0 ? state.msg : '';
}
