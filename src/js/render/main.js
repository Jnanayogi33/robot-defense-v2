import state from '../state.js';
import { COLS, ROWS, TILE } from '../config.js';
import { PATH, pathSet } from '../path.js';
import { drawTower } from './towers.js';
import { drawRobot } from './robots.js';
import { drawMines, drawBullets, drawParticles } from './effects.js';

export function draw(ctx, canvas) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = '#151530';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*TILE,0); ctx.lineTo(x*TILE,canvas.height); ctx.stroke(); }
  for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*TILE); ctx.lineTo(canvas.width,y*TILE); ctx.stroke(); }

  // Path
  PATH.forEach(([c,r], idx) => {
    let grd = ctx.createLinearGradient(c*TILE, r*TILE, c*TILE+TILE, r*TILE+TILE);
    grd.addColorStop(0, '#1a1a2e');
    grd.addColorStop(0.5, '#222240');
    grd.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grd;
    ctx.fillRect(c*TILE+1, r*TILE+1, TILE-2, TILE-2);

    if (idx % 4 === 0 && idx < PATH.length - 1) {
      let [nc,nr] = PATH[Math.min(idx+1, PATH.length-1)];
      if (nc !== c) {
        ctx.fillStyle = '#2a2a50';
        ctx.fillRect(c*TILE + 4, r*TILE + TILE/2 - 1, TILE - 8, 2);
      } else {
        ctx.fillStyle = '#2a2a50';
        ctx.fillRect(c*TILE + TILE/2 - 1, r*TILE + 4, 2, TILE - 8);
      }
    }
  });

  // Path edges
  ctx.strokeStyle = '#2a2a55';
  ctx.lineWidth = 1;
  PATH.forEach(([c,r]) => {
    let top = !pathSet.has(c+','+(r-1));
    let bot = !pathSet.has(c+','+(r+1));
    let lft = !pathSet.has((c-1)+','+r);
    let rgt = !pathSet.has((c+1)+','+r);
    if (top) { ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE); ctx.lineTo((c+1)*TILE, r*TILE); ctx.stroke(); }
    if (bot) { ctx.beginPath(); ctx.moveTo(c*TILE, (r+1)*TILE); ctx.lineTo((c+1)*TILE, (r+1)*TILE); ctx.stroke(); }
    if (lft) { ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE); ctx.lineTo(c*TILE, (r+1)*TILE); ctx.stroke(); }
    if (rgt) { ctx.beginPath(); ctx.moveTo((c+1)*TILE, r*TILE); ctx.lineTo((c+1)*TILE, (r+1)*TILE); ctx.stroke(); }
  });

  // Direction arrows
  ctx.fillStyle = '#2a2a4a';
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

  // Mines
  drawMines(ctx);

  // Towers
  state.towers.forEach(t => drawTower(ctx, t));

  // Enemies (sorted by y for depth)
  let sortedEnemies = [...state.enemies].sort((a,b) => a.y - b.y);
  sortedEnemies.forEach(e => drawRobot(ctx, e));

  // Bullets and particles
  drawBullets(ctx);
  drawParticles(ctx);

  // Entry/exit markers
  ctx.fillStyle = '#0f04';
  ctx.fillRect(PATH[0][0]*TILE, PATH[0][1]*TILE, TILE, TILE);
  ctx.fillStyle = '#f004';
  let last = PATH[PATH.length-1];
  ctx.fillRect(last[0]*TILE, last[1]*TILE, TILE, TILE);

  ctx.font = 'bold 10px Courier New';
  ctx.fillStyle = '#0f0';
  ctx.fillText('IN', PATH[0][0]*TILE+10, PATH[0][1]*TILE+22);
  ctx.fillStyle = '#f00';
  ctx.fillText('OUT', last[0]*TILE+8, last[1]*TILE+22);

  // HUD
  document.getElementById('money').textContent = state.money;
  document.getElementById('wave').textContent = state.waveNum;
  document.getElementById('lives').textContent = state.lives;
  document.getElementById('score').textContent = state.score;
  document.getElementById('msg').textContent = state.msgTimer > 0 ? state.msg : '';
}
