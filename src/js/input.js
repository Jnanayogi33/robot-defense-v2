import state from './state.js';
import { COLS, ROWS, TILE, TOWER_DEFS, MINE_DEF } from './config.js';
import { pathSet } from './path.js';
import { showMsg } from './update.js';
import { startWave } from './wave.js';
import { resetState } from './state.js';
import { initAudio, toggleMute, isMuted, startMusic, stopMusic } from './audio.js';

let audioInitialized = false;

function ensureAudioStarted() {
  if (!audioInitialized) {
    initAudio();
    startMusic();
    audioInitialized = true;
  }
}

function getGridPos(canvas, clientX, clientY) {
  let rect = canvas.getBoundingClientRect();
  let scaleX = canvas.width / rect.width;
  let scaleY = canvas.height / rect.height;
  let col = Math.floor((clientX - rect.left) * scaleX / TILE);
  let row = Math.floor((clientY - rect.top) * scaleY / TILE);
  return { col, row };
}

function handleCanvasClick(canvas, clientX, clientY) {
  ensureAudioStarted();
  let { col, row } = getGridPos(canvas, clientX, clientY);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
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
}

export function initInput(canvas) {
  const shopEl = document.getElementById('shop');

  TOWER_DEFS.forEach(t => {
    let btn = document.createElement('button');
    btn.className = 'tower-btn';
    btn.innerHTML = `<div class="name">${t.name}</div><div class="cost">$${t.cost}</div><div class="desc">${t.desc}</div>`;
    btn.onclick = () => { ensureAudioStarted(); state.selling = false; state.placingMine = false; state.selectedTower = t; updateShopUI(); };
    btn.dataset.id = t.id;
    shopEl.appendChild(btn);
  });

  // Mine button
  let mineBtn = document.createElement('button');
  mineBtn.className = 'tower-btn';
  mineBtn.innerHTML = `<div class="name" style="color:#f42">${MINE_DEF.name}</div><div class="cost">$${MINE_DEF.cost}</div><div class="desc">${MINE_DEF.desc}</div>`;
  mineBtn.dataset.id = 'mine';
  mineBtn.onclick = () => { ensureAudioStarted(); state.selling = false; state.selectedTower = null; state.placingMine = true; updateShopUI(); };
  shopEl.appendChild(mineBtn);

  // Mouse click
  canvas.addEventListener('click', e => {
    handleCanvasClick(canvas, e.clientX, e.clientY);
  });

  // Hover tracking
  canvas.addEventListener('mousemove', e => {
    let { col, row } = getGridPos(canvas, e.clientX, e.clientY);
    state.hoverCol = col;
    state.hoverRow = row;
  });
  canvas.addEventListener('mouseleave', () => {
    state.hoverCol = -1;
    state.hoverRow = -1;
  });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    let touch = e.touches[0];
    handleCanvasClick(canvas, touch.clientX, touch.clientY);
  }, { passive: false });

  // Wire buttons
  const muteBtn = document.getElementById('mute-btn');
  document.querySelector('#controls button:nth-child(1)').onclick = () => { ensureAudioStarted(); startWave(); };
  document.querySelector('#controls button:nth-child(2)').onclick = () => { ensureAudioStarted(); sellMode(); };
  muteBtn.onclick = () => {
    ensureAudioStarted();
    let m = toggleMute();
    muteBtn.textContent = m ? 'Sound: OFF' : 'Sound: ON';
  };
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
  stopMusic();
  audioInitialized = false;
  document.getElementById('overlay').classList.remove('show');
}
