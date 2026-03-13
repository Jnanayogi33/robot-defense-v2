import state from './state.js';
import { TILE, TOWER_DEFS, MINE_DEF } from './config.js';
import { pathSet } from './path.js';
import { showMsg } from './update.js';
import { startWave } from './wave.js';
import { resetState } from './state.js';

export function initInput(canvas) {
  const shopEl = document.getElementById('shop');

  TOWER_DEFS.forEach(t => {
    let btn = document.createElement('button');
    btn.className = 'tower-btn';
    btn.innerHTML = `<div class="name">${t.name}</div><div class="cost">$${t.cost}</div><div class="desc">${t.desc}</div>`;
    btn.onclick = () => { state.selling = false; state.placingMine = false; state.selectedTower = t; updateShopUI(); };
    btn.dataset.id = t.id;
    shopEl.appendChild(btn);
  });

  // Mine button
  let mineBtn = document.createElement('button');
  mineBtn.className = 'tower-btn';
  mineBtn.innerHTML = `<div class="name" style="color:#f42">${MINE_DEF.name}</div><div class="cost">$${MINE_DEF.cost}</div><div class="desc">${MINE_DEF.desc}</div>`;
  mineBtn.dataset.id = 'mine';
  mineBtn.onclick = () => { state.selling = false; state.selectedTower = null; state.placingMine = true; updateShopUI(); };
  shopEl.appendChild(mineBtn);

  canvas.addEventListener('click', e => {
    let rect = canvas.getBoundingClientRect();
    let col = Math.floor((e.clientX - rect.left) / TILE);
    let row = Math.floor((e.clientY - rect.top) / TILE);
    if (col < 0 || col >= 20 || row < 0 || row >= 14) return;
    if (state.selling) {
      let idx = state.towers.findIndex(t => t.col === col && t.row === row);
      if (idx >= 0) {
        let refund = Math.floor(state.towers[idx].def.cost * 0.6);
        state.money += refund;
        state.towers.splice(idx, 1);
        showMsg(`Sold for $${refund}`);
        state.selling = false;
      }
      return;
    }
    if (state.placingMine) {
      if (!pathSet.has(col+','+row)) { showMsg('Mines must be placed on the path!'); return; }
      if (state.mines.find(m => m.col === col && m.row === row)) { showMsg('Mine already here!'); return; }
      if (state.money < MINE_DEF.cost) { showMsg('Not enough credits!'); return; }
      state.money -= MINE_DEF.cost;
      state.mines.push({
        col, row,
        x: col * TILE + TILE/2,
        y: row * TILE + TILE/2,
        armed: false,
        armTimer: 60,
        detonated: false,
        flashTimer: 0
      });
      showMsg('Mine placed! Arms in 1 sec.');
      return;
    }
    if (!state.selectedTower) return;
    if (pathSet.has(col+','+row)) { showMsg("Can't build on the path!"); return; }
    if (state.towers.find(t => t.col === col && t.row === row)) { showMsg('Already occupied!'); return; }
    if (state.money < state.selectedTower.cost) { showMsg('Not enough credits!'); return; }
    state.money -= state.selectedTower.cost;
    state.towers.push({
      col, row,
      x: col * TILE + TILE/2,
      y: row * TILE + TILE/2,
      def: state.selectedTower,
      cooldown: 0,
      angle: 0,
      fireFlash: 0
    });
  });

  // Wire buttons
  document.querySelector('#controls button:nth-child(1)').onclick = () => startWave();
  document.querySelector('#controls button:nth-child(2)').onclick = () => sellMode();
  document.querySelector('#overlay-box button').onclick = () => restartGame();
}

function updateShopUI() {
  document.querySelectorAll('.tower-btn').forEach(b => {
    b.classList.toggle('selected', (state.selectedTower && b.dataset.id === state.selectedTower.id) || (state.placingMine && b.dataset.id === 'mine'));
  });
}

function sellMode() {
  state.selling = !state.selling;
  state.selectedTower = null;
  state.placingMine = false;
  updateShopUI();
  showMsg(state.selling ? 'Click a tower to sell it' : '');
}

function restartGame() {
  resetState();
  document.getElementById('overlay').classList.remove('show');
}
