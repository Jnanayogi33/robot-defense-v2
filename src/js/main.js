import { COLS, ROWS, TILE } from './config.js';
import state from './state.js';
import { update } from './update.js';
import { draw } from './render/main.js';
import { initInput } from './input.js';
import { loadSprites } from './sprites.js';

const C = document.getElementById('c');
const ctx = C.getContext('2d');
C.width = COLS * TILE;
C.height = ROWS * TILE;

initInput(C);

async function start() {
  await loadSprites();
  function loop() {
    if (state.lives > 0) update();
    draw(ctx, C);
    requestAnimationFrame(loop);
  }
  loop();
}
start();
