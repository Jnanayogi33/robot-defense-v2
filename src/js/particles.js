import state from './state.js';

export function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 1 + Math.random() * 3;
    let shapes = ['circle', 'spark', null];
    state.particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 15 + Math.random()*15,
      color,
      size: 1+Math.random()*2,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }
}

export function spawnDeathExplosion(x, y, color, size) {
  // Screen shake
  state.screenShake = Math.max(state.screenShake, 4 + size * 0.3);

  // Bright flash core
  state.particles.push({
    x, y, vx: 0, vy: 0, life: 8,
    color: '#fff', size: size * 1.8, gravity: 0,
    isFlash: true
  });

  // Main explosion with shape variety
  for (let i = 0; i < 18 + size; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 1 + Math.random() * 4;
    let colors = [color, '#ff8', '#fa0', '#fff'];
    let shapes = ['circle', 'spark', 'spark', null];
    state.particles.push({
      x: x + (Math.random()-0.5)*size,
      y: y + (Math.random()-0.5)*size,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 1,
      life: 20 + Math.random()*20,
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 1 + Math.random()*3,
      gravity: 0.08,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }

  // Additive glow particles
  for (let i = 0; i < 5; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 0.5 + Math.random() * 2;
    state.particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 0.5,
      life: 15 + Math.random()*10,
      color: color,
      size: 3 + Math.random()*3,
      gravity: 0,
      additive: true,
    });
  }

  // Shockwave ring
  state.particles.push({
    x, y, vx: 0, vy: 0, life: 12,
    color: color, size: 0, gravity: 0,
    isRing: true, ringMax: size * 3, ringLife: 12
  });

  // Rising embers
  for (let i = 0; i < 5; i++) {
    state.particles.push({
      x: x + (Math.random()-0.5) * size,
      y,
      vx: (Math.random()-0.5) * 0.8,
      vy: -1.5 - Math.random() * 2,
      life: 35 + Math.random()*20,
      color: '#fa0',
      size: 1 + Math.random(),
      gravity: -0.02,
      shape: 'circle',
      additive: true,
    });
  }

  // Metal debris with tumble
  for (let i = 0; i < 6; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 2 + Math.random() * 3;
    state.particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 2,
      life: 30 + Math.random()*15,
      color: '#888',
      size: 2 + Math.random()*2,
      gravity: 0.12,
      shape: 'debris',
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }

  // Smoke puffs
  for (let i = 0; i < 3; i++) {
    state.particles.push({
      x: x + (Math.random()-0.5) * size,
      y: y + (Math.random()-0.5) * size,
      vx: (Math.random()-0.5) * 0.5,
      vy: -0.3 - Math.random() * 0.5,
      life: 30 + Math.random()*15,
      color: '#555',
      size: 3 + Math.random()*3,
      gravity: -0.01,
      shape: 'smoke',
    });
  }
}

export function spawnMineExplosion(x, y) {
  // Bigger screen shake for mine
  state.screenShake = Math.max(state.screenShake, 10);

  // Flash core
  state.particles.push({
    x, y, vx: 0, vy: 0, life: 10,
    color: '#fff', size: 25, gravity: 0,
    isFlash: true
  });

  // Shockwave ring
  state.particles.push({
    x, y, vx: 0, vy: 0, life: 15,
    color: '#f42', size: 0, gravity: 0,
    isRing: true, ringMax: 55, ringLife: 15
  });

  // Large fiery explosion
  for (let i = 0; i < 35; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 2 + Math.random() * 5;
    let colors = ['#f42', '#fa0', '#ff8', '#fff', '#f80', '#f60'];
    let shapes = ['circle', 'spark', 'spark', null];
    state.particles.push({
      x: x + (Math.random()-0.5)*10,
      y: y + (Math.random()-0.5)*10,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 2,
      life: 20 + Math.random()*25,
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 2 + Math.random()*4,
      gravity: 0.06,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }

  // Additive fire glow
  for (let i = 0; i < 8; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 1 + Math.random() * 3;
    state.particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 1,
      life: 15 + Math.random()*10,
      color: '#f80',
      size: 4 + Math.random()*4,
      gravity: 0,
      additive: true,
    });
  }

  // Shrapnel with tumble
  for (let i = 0; i < 10; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 3 + Math.random() * 4;
    state.particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 3,
      life: 25 + Math.random()*20,
      color: '#666',
      size: 1.5 + Math.random()*2,
      gravity: 0.15,
      shape: 'debris',
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }

  // Smoke clouds
  for (let i = 0; i < 10; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 0.5 + Math.random() * 2;
    state.particles.push({
      x: x + (Math.random()-0.5)*15,
      y: y + (Math.random()-0.5)*15,
      vx: Math.cos(angle)*speed,
      vy: -0.5 - Math.random(),
      life: 40 + Math.random()*20,
      color: '#555',
      size: 4 + Math.random()*4,
      gravity: -0.03,
      shape: 'smoke',
    });
  }
}
