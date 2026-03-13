const state = {
  gameTime: 0,
  money: 200,
  lives: 20,
  waveNum: 0,
  score: 0,
  selectedTower: null,
  selling: false,
  waveActive: false,
  placingMine: false,
  towers: [],
  enemies: [],
  bullets: [],
  particles: [],
  spawnQueue: [],
  mines: [],
  spawnTimer: 0,
  msg: '',
  msgTimer: 0,
  hoverCol: -1,
  hoverRow: -1,
  screenShake: 0,
};

export function resetState() {
  state.money = 200;
  state.lives = 20;
  state.waveNum = 0;
  state.score = 0;
  state.towers = [];
  state.enemies = [];
  state.bullets = [];
  state.particles = [];
  state.spawnQueue = [];
  state.mines = [];
  state.waveActive = false;
  state.selectedTower = null;
  state.selling = false;
  state.placingMine = false;
  state.screenShake = 0;
}

export default state;
